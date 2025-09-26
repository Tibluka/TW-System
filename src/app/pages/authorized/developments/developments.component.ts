import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, inject, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from "@angular/forms";
import { Subject, debounceTime, takeUntil } from 'rxjs';

// Componentes
import { Development, DevelopmentFilters, DevelopmentListResponse, DevelopmentStatus, PaginationInfo, ProductionTypeEnum } from '../../../models/developments/developments';
import { ActionMenuComponent, ActionMenuItem } from '../../../shared/components/atoms/action-menu/action-menu.component';
import { StatusUpdaterComponent, StatusOption } from '../../../shared/components/molecules/status-updater/status-updater.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from "../../../shared/components/atoms/icon/icon.component";
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from "../../../shared/components/atoms/select/select.component";
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { DevelopmentService } from '../../../shared/services/development/development.service';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { FormValidator } from '../../../shared/utils/form';
import { copyToClipboard, translateDevelopmentStatus, translateProductionType } from '../../../shared/utils/tools';
import { DevelopmentModalComponent } from "./development-modal/development-modal.component";
import { BadgeComponent } from "../../../shared/components/atoms/badge/badge.component";
import { GeneralModalContentComponent } from "../../../shared/components/general/general-modal-content/general-modal-content.component";

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
    DevelopmentModalComponent,
    SelectComponent,
    IconComponent,
    ActionMenuComponent,
    StatusUpdaterComponent,
    BadgeComponent,
    GeneralModalContentComponent
  ],
  providers: [NgModel],
  templateUrl: './developments.component.html',
  styleUrl: './developments.component.scss'
})
export class DevelopmentsComponent extends FormValidator implements OnInit, OnDestroy {

  isModalOpen: boolean = false;

  private developmentService = inject(DevelopmentService);
  private modalService = inject(ModalService);

  // Lista de desenvolvimentos e paginação
  developments: Development[] = [];
  pagination: PaginationInfo | null = null;
  loading = false;

  // Estados para UI
  errorMessage: string = '';
  showError = false;

  // Filtros atuais
  currentFilters: DevelopmentFilters = {
    search: undefined,
    status: undefined,
    page: 1,
    limit: 10,
    active: true
  };

  statusOption: SelectOption[] = [
    { value: undefined, label: 'Todos' },
    { value: 'CREATED', label: 'Criado' },
    { value: 'AWAITING_APPROVAL', label: 'Aguardando Aprovação' },
    { value: 'APPROVED', label: 'Aprovado' },
    { value: 'CANCELED', label: 'Cancelado' }
  ];

  // Propriedade para armazenar ID do desenvolvimento selecionado para edição
  selectedDevelopmentId?: string;

  // Configuração do menu de ações
  actionMenuItems: ActionMenuItem[] = [
    {
      label: 'Alterar Status',
      value: 'change-status',
      icon: 'fa-solid fa-arrow-right-arrow-left'
    },
    {
      label: 'Excluir',
      value: 'delete',
      icon: 'fa-solid fa-trash'
    }
  ];

  // Configuração das opções de status para o status-updater
  developmentStatusOptions: StatusOption[] = [
    { value: 'CREATED', label: 'Criado', icon: 'fa-solid fa-plus', color: 'info' },
    { value: 'AWAITING_APPROVAL', label: 'Aguardando Aprovação', icon: 'fa-solid fa-clock', color: 'warning' },
    { value: 'APPROVED', label: 'Aprovado', icon: 'fa-solid fa-check', color: 'success' },
    { value: 'CANCELED', label: 'Cancelado', icon: 'fa-solid fa-times', color: 'error' }
  ];

  // Propriedades para o status-updater
  selectedDevelopmentForStatusUpdate?: Development;

  // Referência ao componente status-updater
  @ViewChild('statusUpdaterRef') statusUpdaterComponent?: StatusUpdaterComponent;

  // Subject para debounce da busca
  private searchSubject = new Subject<DevelopmentFilters>();
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

  constructor() {
    super();
    // Effect para monitorar quando o modal está aberto
    effect(() => {
      const modalInstance = this.modalService.modals().find(m => m.id === 'development-modal');
      this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
    });
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
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentFilters = searchTerm;
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
    this.searchSubject.next(this.currentFilters);
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
  getStatusLabel(status: DevelopmentStatus) {
    return translateDevelopmentStatus(status);
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

  // Apenas o método editDevelopment corrigido para seguir a mesma lógica do clients.component.ts

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
      data: development // ← IMPORTANTE: Passando o objeto development completo
    }).subscribe(result => {
      this.handleModalResult(result);
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
      // NÃO passar data para criação
    }).subscribe(result => {
      this.handleModalResult(result);
    });
  }

  /**
   * 🏁 MODAL RESULT - Processa resultado do modal (IGUAL AO CLIENT)
   */
  private handleModalResult(result: any): void {
    if (result && result.action) {
      if (result.action === 'created') {
        console.log('Desenvolvimento criado com sucesso:', result.data?.internalReference);
        this.loadDevelopments(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      } else if (result.action === 'updated') {
        console.log('Desenvolvimento atualizado com sucesso:', result.data?.internalReference);
        this.loadDevelopments(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      }
    }

    // Sempre limpar o ID selecionado após fechar modal
    this.selectedDevelopmentId = undefined;
  }

  copy(event: MouseEvent, internalReference: string): void {
    copyToClipboard(internalReference, event);
  }


  productionType(productionType: ProductionTypeEnum) {
    return translateProductionType(productionType);
  }

  /**
   * 🎯 MENU DE AÇÕES - Processa ação selecionada no menu
   */
  onActionMenuSelect(development: Development, action: ActionMenuItem): void {
    switch (action.value) {
      case 'change-status':
        this.changeDevelopmentStatus(development);
        break;
      case 'delete':
        this.deleteDevelopment(development);
        break;
      default:
        console.warn('Ação não implementada:', action.value);
    }
  }

  /**
   * 🔄 ALTERAR STATUS - Altera status do desenvolvimento
   */
  private changeDevelopmentStatus(development: Development): void {
    this.selectedDevelopmentForStatusUpdate = development;

    setTimeout(() => {
      if (this.statusUpdaterComponent) {
        this.statusUpdaterComponent.openStatusModal();
      }
    }, 0);
  }

  /**
   * 🎯 STATUS ATUALIZADO - Callback quando status é atualizado
   */
  onStatusUpdated(result: any): void {
    if (result.success) {
      this.showSuccessMessage(result.message);
      this.loadDevelopments(); // Recarregar lista
    }
  }

  /**
   * ❌ STATUS UPDATE FALHOU - Callback quando atualização falha
   */
  onStatusUpdateFailed(result: any): void {
    this.showErrorMessage(result.error || 'Erro ao atualizar status');
  }

  /**
   * 🔄 LIMPAR SELEÇÃO - Limpa a seleção do desenvolvimento para atualização de status
   */
  clearStatusUpdateSelection(): void {
    this.selectedDevelopmentForStatusUpdate = undefined;
  }

  /**
   * 🗑️ EXCLUIR - Exclui desenvolvimento
   */
  private deleteDevelopment(development: Development): void {
    if (!development._id) {
      console.error('ID do desenvolvimento não encontrado');
      return;
    }


    this.modalService.open({
      id: 'general-modal',
      title: 'Excluir Desenvolvimento',
      size: 'md',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      data: {
        text: `Tem certeza que deseja excluir a ordem de produção "${development.internalReference}"?`,
        icon: 'fa-solid fa-exclamation-triangle',
        iconColor: 'tertiary',
        textAlign: 'center',
        buttons: [
          {
            label: 'Cancelar',
            action: false,
            variant: 'outline'
          },
          {
            label: 'Excluir',
            action: true,
            variant: 'fill',
            icon: 'fa-solid fa-trash'
          }
        ]
      }
    }).subscribe(result => {
      if (result && result.action === true) {
        this.developmentService.deleteDevelopment(development._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccessMessage(`Desenvolvimento ${development.internalReference} excluído com sucesso.`);
              this.loadDevelopments(); // Recarregar lista
            },
            error: (error) => {
              console.error('❌ Erro ao excluir desenvolvimento:', error);
              this.showErrorMessage(error.message || 'Erro ao excluir desenvolvimento.');
            }
          });
      }
    });
  }
}