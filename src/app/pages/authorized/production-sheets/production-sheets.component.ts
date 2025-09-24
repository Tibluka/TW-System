// pages/authorized/production-sheets/production-sheets.component.ts

import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PaginationInfo } from '../../../models/clients/clients';
import { MachineNumber, ProductionSheet, ProductionSheetFilters, ProductionSheetStage } from '../../../models/production-sheet/production-sheet';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/atoms/select/select.component';
import { ModalComponent } from '../../../shared/components/organisms/modal/modal.component';
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { ProductionSheetsService } from '../../../shared/services/production-sheets/production-sheets.service';
import { FormValidator } from '../../../shared/utils/form';
import { ProductionSheetModalComponent } from './production-sheet-modal/production-sheet-modal.component';

@Component({
  selector: 'app-production-sheets',
  imports: [
    CommonModule,
    TableComponent,
    InputComponent,
    SelectComponent,
    TableCellComponent,
    IconComponent,
    TableRowComponent,
    ButtonComponent,
    FormsModule,
    ModalComponent,
    ProductionSheetModalComponent
  ],
  providers: [
    NgModel
  ],
  templateUrl: './production-sheets.component.html',
  styleUrl: './production-sheets.component.scss'
})
export class ProductionSheetsComponent extends FormValidator {

  isModalOpen: boolean = false;

  private productionSheetsService = inject(ProductionSheetsService);
  private modalService = inject(ModalService);

  // Lista de fichas de produção e paginação
  productionSheets: ProductionSheet[] = [];
  pagination: PaginationInfo | null = null;
  loading = false;
  shouldShowTable = false;

  // Estados para UI
  errorMessage: string = '';
  showError = false;

  // Filtros atuais
  currentFilters: ProductionSheetFilters = {
    search: undefined,
    stage: undefined,
    machine: undefined,
    page: 1,
    limit: 10,
    active: true
  };

  // Opções para selects
  stageOptions: SelectOption[] = [
    { value: undefined, label: 'Todos os Estágios' },
    { value: 'PRINTING', label: 'Impressão' },
    { value: 'CALENDERING', label: 'Calandra' },
    { value: 'FINISHED', label: 'Finalizado' }
  ];

  machineOptions: SelectOption[] = [
    { value: undefined, label: 'Todas as Máquinas' },
    { value: 1, label: 'Máquina 1' },
    { value: 2, label: 'Máquina 2' },
    { value: 3, label: 'Máquina 3' },
    { value: 4, label: 'Máquina 4' }
  ];

  // Propriedade para armazenar ID da ficha selecionada para edição
  selectedProductionSheetId?: string;

  // Subject para controlar debounce da busca
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ============================================
  // CICLO DE VIDA
  // ============================================

  constructor() {
    super();
    // Effect para monitorar quando o modal está aberto
    effect(() => {
      const modalInstance = this.modalService.modals().find(m => m.id === 'production-sheet-modal');
      this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
    });
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadProductionSheets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // CONFIGURAÇÃO DE BUSCA COM DEBOUNCE
  // ============================================

  /**
   * 🔍 SETUP SEARCH DEBOUNCE - Configura debounce para busca
   */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.currentFilters.search = searchTerm || undefined;
        this.currentFilters.page = 1; // Reset para primeira página
        this.loadProductionSheets();
      });
  }

  // ============================================
  // MÉTODOS DE CARREGAMENTO DE DADOS
  // ============================================

  /**
   * 📋 CARREGAR FICHAS DE PRODUÇÃO - Carrega lista com filtros
   */
  async loadProductionSheets(): Promise<void> {
    this.loading = true;
    this.showError = false;

    try {
      const response = await this.productionSheetsService.getProductionSheets(this.currentFilters).toPromise();

      if (response && response.success) {
        this.productionSheets = response.data || [];
        this.pagination = response.pagination || null;
        this.shouldShowTable = true;

        console.log('✅ Fichas de produção carregadas:', this.productionSheets.length);
      } else {
        throw new Error(response?.message || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar fichas de produção:', error);
      this.errorMessage = 'Erro ao carregar fichas de produção. Tente novamente.';
      this.showError = true;
      this.shouldShowTable = false;
      this.productionSheets = [];
    } finally {
      this.loading = false;
    }
  }

  // ============================================
  // MÉTODOS DE EVENTOS DE FILTROS
  // ============================================

  /**
   * 🔍 BUSCA - Evento de mudança no campo de busca
   */
  onSearchChange(): void {
    const searchTerm = this.currentFilters.search?.trim() || '';
    this.searchSubject.next(searchTerm);
  }

  /**
   * 📂 FILTRO ESTÁGIO - Evento de mudança no filtro de estágio
   */
  onStageFilterChange(): void {
    this.currentFilters.page = 1; // Reset para primeira página
    this.loadProductionSheets();
  }

  /**
   * 🖥️ FILTRO MÁQUINA - Evento de mudança no filtro de máquina
   */
  onMachineFilterChange(): void {
    this.currentFilters.page = 1; // Reset para primeira página
    this.loadProductionSheets();
  }

  // ============================================
  // MÉTODOS DE INTERAÇÃO COM TABELA
  // ============================================

  /**
   * 👆 CLICK NA FICHA - Abre modal para editar ficha
   */
  onProductionSheetClick(productionSheet: ProductionSheet): void {
    if (!productionSheet._id) return;

    this.selectedProductionSheetId = productionSheet._id;

    this.modalService.open({
      id: 'production-sheet-modal',
      title: `Editar Ficha de Produção - ${productionSheet.internalReference || 'S/N'}`,
      size: 'xl',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: false,
      closeOnEscapeKey: true,
      data: productionSheet // Passar dados para o modal
    }).subscribe(result => {
      this.handleModalResult(result);
    });
  }

  /**
   * ➕ CRIAR - Abre modal para criar nova ficha de produção
   */
  createProductionSheet(): void {
    // Limpar ID selecionado para modo criação
    this.selectedProductionSheetId = undefined;

    this.modalService.open({
      id: 'production-sheet-modal',
      title: 'Nova Ficha de Produção',
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
   * 🏁 MODAL RESULT - Processa resultado do modal
   */
  private handleModalResult(result: any): void {
    if (result && result.action) {
      if (result.action === 'created') {
        this.loadProductionSheets(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      } else if (result.action === 'updated') {
        this.loadProductionSheets(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      } else if (result.action === 'stage-updated') {
        this.loadProductionSheets(); // Recarrega
      }
    }

    // Sempre limpar o ID selecionado após fechar modal
    this.selectedProductionSheetId = undefined;
  }

  /**
   * 🎭 MODAL CLOSED - Evento quando modal é fechado
   */
  onModalClosed(result: any): void {
    this.handleModalResult(result);
  }

  // ============================================
  // MÉTODOS UTILITÁRIOS PARA TEMPLATE
  // ============================================

  /**
   * 📅 FORMATAR DATA - Formata data para exibição
   */
  formatDate(date: Date | string | undefined): string {
    return this.productionSheetsService.formatDate(date);
  }

  /**
   * ⏰ FORMATAR DATA E HORA - Formata data e hora para exibição
   */
  formatDateTime(date: Date | string | undefined): string {
    return this.productionSheetsService.formatDateTime(date);
  }

  /**
   * 🎯 LABEL ESTÁGIO - Retorna label amigável para estágio
   */
  getStageLabel(stage: ProductionSheetStage): string {
    return this.productionSheetsService.getStageLabel(stage);
  }

  /**
   * 🖥️ NOME DA MÁQUINA - Retorna nome formatado da máquina
   */
  getMachineName(machineNumber: MachineNumber): string {
    return this.productionSheetsService.getMachineName(machineNumber);
  }

  /**
   * ✅ VERIFICAR SE FINALIZADO - Verifica se a ficha está finalizada
   */
  isFinished(stage: ProductionSheetStage): boolean {
    return this.productionSheetsService.isFinished(stage);
  }

  // ============================================
  // MÉTODOS DE PAGINAÇÃO
  // ============================================

  /**
   * 📄 PÁGINA ANTERIOR - Navega para página anterior
   */
  previousPage(): void {
    if (this.pagination && this.pagination.currentPage > 1) {
      this.currentFilters.page = this.pagination.currentPage - 1;
      this.loadProductionSheets();
    }
  }

  /**
   * 📄 PRÓXIMA PÁGINA - Navega para próxima página
   */
  nextPage(): void {
    if (this.pagination && this.pagination.currentPage < this.pagination.totalPages) {
      this.currentFilters.page = this.pagination.currentPage + 1;
      this.loadProductionSheets();
    }
  }

  /**
   * 📄 IR PARA PÁGINA - Navega para página específica
   */
  goToPage(page: number): void {
    if (this.pagination && page >= 1 && page <= this.pagination.totalPages) {
      this.currentFilters.page = page;
      this.loadProductionSheets();
    }
  }

  /**
   * 📄 MUDANÇA DE PÁGINA - Evento do componente de tabela
   */
  onPageChange(page: number): void {
    this.currentFilters.page = page;
    this.loadProductionSheets();
  }

  /**
   * 🧹 LIMPAR FILTROS - Limpa todos os filtros aplicados
   */
  clearFilters(): void {
    this.currentFilters = {
      search: undefined,
      stage: undefined,
      machine: undefined,
      page: 1,
      limit: 10,
      active: true
    };
    this.loadProductionSheets();
  }
}