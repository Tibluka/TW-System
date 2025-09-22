import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, NgModel } from "@angular/forms";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Componentes
import { Development, DevelopmentFilters, DevelopmentListResponse, PaginationInfo } from '../../../models/developments/developments';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { DevelopmentService } from '../../../shared/services/development/development.service';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { FormValidator } from '../../../shared/utils/form';
import { DevelopmentModalComponent } from "./development-modal/development-modal.component";

@Component({
  selector: 'app-developments',
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    FormsModule,
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    ModalComponent,
    DevelopmentModalComponent
  ],
  providers: [NgModel],
  templateUrl: './developments.component.html',
  styleUrl: './developments.component.scss'
})
export class DevelopmentsComponent extends FormValidator implements OnInit, OnDestroy {

  private developmentService = inject(DevelopmentService);
  private modalService = inject(ModalService);

  // Lista de desenvolvimentos e paginação
  developments: Development[] = [];
  pagination: PaginationInfo | null = null;
  loading = false;
  shouldShowTable = false;

  // Estados para UI
  errorMessage: string = '';
  showError = false;

  // Filtros atuais
  currentFilters: DevelopmentFilters = {
    search: undefined,
    page: 1,
    limit: 10,
    active: true
  };

  // Propriedade para armazenar ID do desenvolvimento selecionado para edição
  selectedDevelopmentId?: string;

  // Subject para debounce da busca
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  /**
   * 🔄 SPINNER - Determina se deve mostrar spinner
   */
  get shouldShowSpinner(): boolean {
    return this.loading;
  }

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadDevelopments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // SETUP METHODS
  // ============================================

  /**
   * ⏱️ DEBOUNCE - Configura debounce para busca
   */
  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentFilters.search = searchTerm;
      this.currentFilters.page = 1; // Reset para primeira página
      this.loadDevelopments();
    });
  }

  // ============================================
  // MÉTODOS DE DADOS
  // ============================================

  /**
   * 📋 CARREGAR - Busca desenvolvimentos do servidor
   */
  private loadDevelopments(): void {
    this.loading = true;
    this.shouldShowTable = true;

    this.developmentService.listDevelopments(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: DevelopmentListResponse) => {
          this.developments = response.data || [];
          this.pagination = response.pagination || null;

          console.log('✅ Desenvolvimentos carregados:', {
            count: this.developments.length,
            pagination: this.pagination
          });

          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar desenvolvimentos:', error);
          this.loading = false;
          this.showErrorMessage(error.message || 'Erro ao carregar desenvolvimentos.');
        }
      });
  }

  /**
   * ➕ CRIAR - Abre modal para criar novo desenvolvimento
   */
  createDevelopment(): void {
    // Limpar ID selecionado para modo criação
    this.selectedDevelopmentId = undefined;

    this.modalService.open({
      id: 'development-modal',
      title: 'Novo Desenvolvimento',
      size: 'xl',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: false,
      closeOnEscapeKey: true
    }).subscribe(result => {
      this.handleModalResult(result);
    });
  }

  /**
   * ✏️ EDITAR - Abre modal para editar desenvolvimento existente
   */
  editDevelopment(development: Development): void {
    // Definir o development ID para edição
    this.selectedDevelopmentId = development._id;

    this.modalService.open({
      id: 'development-modal',
      title: `Editar Desenvolvimento - ${development.internalReference}`,
      size: 'xl',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: false,
      closeOnEscapeKey: true,
      data: development
    }).subscribe(result => {
      this.handleModalResult(result);
    });
  }

  /**
   * 👆 CLIQUE NA TABELA - Callback quando desenvolvimento é clicado na tabela
   */
  onDevelopmentClick(development: Development): void {
    this.editDevelopment(development);
  }

  // ============================================
  // MÉTODOS DE BUSCA E FILTROS
  // ============================================

  /**
   * 🔍 BUSCA - Dispara busca quando usuário digita
   */
  onSearchChange(): void {
    this.searchSubject.next(this.currentFilters.search || '');
  }

  /**
   * 📄 PAGINAÇÃO - Muda página
   */
  onPageChange(page: number): void {
    this.currentFilters.page = page;
    this.loadDevelopments();
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * 🏷️ STATUS LABEL - Retorna label do status
   */
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'CREATED': 'Criado',
      'AWAITING_APPROVAL': 'Aguardando Aprovação',
      'APPROVED': 'Aprovado',
      'CANCELED': 'Cancelado'
    };
    return statusLabels[status] || status;
  }

  /**
   * ⏰ VERIFICAR ATRASO - Verifica se data está atrasada
   */
  isOverdue(date: string | Date): boolean {
    if (!date) return false;
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove horas para comparar apenas data
    return targetDate < today;
  }

  /**
   * 🔄 RESULTADO MODAL - Processa resultado do modal
   */
  private handleModalResult(result: any): void {
    if (result?.success) {
      console.log('✅ Operação realizada com sucesso:', result);
      this.loadDevelopments(); // Recarrega lista

      // Mostrar mensagem de sucesso se necessário
      if (result.message) {
        this.showSuccessMessage(result.message);
      }
    } else if (result?.error) {
      console.error('❌ Erro na operação:', result.error);
      this.showErrorMessage(result.error);
    }

    // Limpar seleção
    this.selectedDevelopmentId = undefined;
  }

  /**
   * 🟢 SUCESSO - Mostra mensagem de sucesso
   */
  private showSuccessMessage(message: string): void {
    // Implementar toast/notificação de sucesso
    console.log('SUCCESS:', message);
  }

  /**
   * 🔴 ERRO - Mostra mensagem de erro
   */
  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;

    // Auto-hide após 5 segundos
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }

  /**
   * 📋 MODAL FECHADO - Callback quando modal é fechado
   */
  onModalClosed(result: any): void {
    this.handleModalResult(result);
  }
}