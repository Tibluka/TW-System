// pages/authorized/production-sheets/production-sheets.component.ts

import { CommonModule } from '@angular/common';
import { Component, effect, inject, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PaginationInfo } from '../../../models/clients/clients';
import { MachineNumber, ProductionSheet, ProductionSheetFilters, ProductionSheetStage } from '../../../models/production-sheet/production-sheet';
import { ActionMenuComponent, ActionMenuItem } from '../../../shared/components/atoms/action-menu/action-menu.component';
import { BadgeComponent } from '../../../shared/components/atoms/badge/badge.component';
import { StatusUpdaterComponent, StatusOption } from '../../../shared/components/molecules/status-updater/status-updater.component';
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
import { GeneralModalContentComponent } from '../../../shared/components/general/general-modal-content/general-modal-content.component';
import { copyToClipboard } from '../../../shared/utils/tools';

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
    BadgeComponent,
    FormsModule,
    ModalComponent,
    ProductionSheetModalComponent,
    ActionMenuComponent,
    StatusUpdaterComponent,
    GeneralModalContentComponent
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

  // Configuração do menu de ações
  actionMenuItems: ActionMenuItem[] = [];

  // Configuração das opções de estágio para o status-updater
  productionSheetStageOptions: StatusOption[] = [
    { value: 'PRINTING', label: 'Impressão', icon: 'fa-solid fa-print', color: 'primary' },
    { value: 'CALENDERING', label: 'Calandra', icon: 'fa-solid fa-cogs', color: 'warning' },
    { value: 'FINISHED', label: 'Finalizado', icon: 'fa-solid fa-check-circle', color: 'success' }
  ];

  // Propriedades para o status-updater
  selectedProductionSheetForStatusUpdate?: ProductionSheet;

  // Referência ao componente status-updater
  @ViewChild('statusUpdaterRef') statusUpdaterComponent?: StatusUpdaterComponent;

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

  /**
   * 🎯 MENU DE AÇÕES - Processa ação selecionada no menu
   */
  onActionMenuSelect(productionSheet: ProductionSheet, action: ActionMenuItem): void {
    switch (action.value) {
      case 'change-stage':
        this.changeProductionSheetStage(productionSheet);
        break;
      case 'delete':
        this.deleteProductionSheet(productionSheet);
        break;
      case 'advance-stage':
        this.advanceProductionSheetStage(productionSheet);
        break;
      case 'retrocede-stage':
        this.retrocedeProductionSheetStage(productionSheet);
        break;
      default:
        console.warn('Ação não implementada:', action.value);
    }
  }

  /**
   * 📋 ITENS DO MENU - Retorna itens do menu baseado no status da ficha
   */
  getActionMenuItems(productionSheet: ProductionSheet): ActionMenuItem[] {
    const items: ActionMenuItem[] = [
      {
        label: 'Alterar Estágio',
        value: 'change-stage',
        icon: 'fa-solid fa-arrow-right-arrow-left'
      }
    ];

    // Botão "Avançar" - só aparece se não estiver no último estágio
    if (productionSheet.stage !== 'FINISHED') {
      items.push({
        label: 'Avançar Estágio',
        value: 'advance-stage',
        icon: 'fa-solid fa-arrow-right'
      });
    }

    // Botão "Retroceder" - só aparece se não estiver no primeiro estágio
    if (productionSheet.stage !== 'PRINTING') {
      items.push({
        label: 'Retroceder Estágio',
        value: 'retrocede-stage',
        icon: 'fa-solid fa-arrow-left'
      });
    }

    // Botão "Excluir" sempre aparece
    items.push({
      label: 'Excluir',
      value: 'delete',
      icon: 'fa-solid fa-trash'
    });

    return items;
  }
  /**
   * ⬆️ AVANÇAR ESTÁGIO - Avança para o próximo estágio da produção
   */
  private advanceProductionSheetStage(productionSheet: ProductionSheet): void {
    const nextStage = this.getNextStage(productionSheet.stage);

    if (!nextStage) {
      this.showErrorMessage('Esta ficha já está no estágio final.');
      return;
    }

    const nextStageLabel = this.getStageLabel(nextStage);

    this.modalService.open({
      id: 'general-modal',
      title: 'Avançar Estágio',
      size: 'md',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      data: {
        text: `Deseja avançar a ficha "${productionSheet.internalReference}" para o estágio "${nextStageLabel}"?`,
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
            label: 'Avançar',
            action: true,
            variant: 'fill',
            icon: 'fa-solid fa-arrow-right'
          }
        ]
      }
    }).subscribe(result => {
      if (result && result.action === true) {
        this.updateProductionSheetStage(productionSheet, nextStage);
      }
    });
  }

  /**
   * 🔄 ATUALIZAR ESTÁGIO - Atualiza estágio da ficha via API
   */
  private updateProductionSheetStage(productionSheet: ProductionSheet, newStage: ProductionSheetStage): void {
    if (!productionSheet._id) return;

    this.productionSheetsService.updateProductionSheet(productionSheet._id, { stage: newStage })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccessMessage(`Estágio avançado para "${this.getStageLabel(newStage)}" com sucesso.`);
          this.loadProductionSheets();
        },
        error: (error) => {
          console.error('❌ Erro ao avançar estágio:', error);
          this.showErrorMessage(error.message || 'Erro ao avançar estágio.');
        }
      });
  }

  /**
   * ➡️ PRÓXIMO ESTÁGIO - Retorna o próximo estágio na sequência
   */
  private getNextStage(currentStage: ProductionSheetStage): ProductionSheetStage | null {
    const stageFlow: ProductionSheetStage[] = ['PRINTING', 'CALENDERING', 'FINISHED'];
    const currentIndex = stageFlow.indexOf(currentStage);

    if (currentIndex >= 0 && currentIndex < stageFlow.length - 1) {
      return stageFlow[currentIndex + 1];
    }

    return null; // Já está no estágio final
  }

  /**
   * ⬅️ ESTÁGIO ANTERIOR - Retorna o estágio anterior na sequência
   */
  private getPreviousStage(currentStage: ProductionSheetStage): ProductionSheetStage | null {
    const stageFlow: ProductionSheetStage[] = ['PRINTING', 'CALENDERING', 'FINISHED'];
    const currentIndex = stageFlow.indexOf(currentStage);

    if (currentIndex > 0) {
      return stageFlow[currentIndex - 1];
    }

    return null; // Já está no primeiro estágio
  }

  /**
   * ⬇️ RETROCEDER ESTÁGIO - Retrocede para o estágio anterior da produção
   */
  private retrocedeProductionSheetStage(productionSheet: ProductionSheet): void {
    const previousStage = this.getPreviousStage(productionSheet.stage);

    if (!previousStage) {
      this.showErrorMessage('Esta ficha já está no primeiro estágio.');
      return;
    }

    const previousStageLabel = this.getStageLabel(previousStage);

    this.modalService.open({
      id: 'general-modal',
      title: 'Retroceder Estágio',
      size: 'md',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      data: {
        text: `Deseja retroceder a ficha "${productionSheet.internalReference}" para o estágio "${previousStageLabel}"?`,
        icon: 'fa-solid fa-arrow-left',
        iconColor: 'warning',
        textAlign: 'center',
        buttons: [
          {
            label: 'Cancelar',
            action: false,
            variant: 'outline'
          },
          {
            label: 'Retroceder',
            action: true,
            variant: 'fill',
            icon: 'fa-solid fa-arrow-left'
          }
        ]
      }
    }).subscribe(result => {
      if (result && result.action === true) {
        this.updateProductionSheetStage(productionSheet, previousStage);
      }
    });
  }

  /**
   * 🔄 ALTERAR ESTÁGIO - Altera estágio da ficha de produção
   */
  private changeProductionSheetStage(productionSheet: ProductionSheet): void {
    this.selectedProductionSheetForStatusUpdate = productionSheet;

    // Aguarda o próximo ciclo para garantir que o componente seja renderizado
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
      this.loadProductionSheets(); // Recarregar lista
    }
  }

  /**
   * ❌ STATUS UPDATE FALHOU - Callback quando atualização falha
   */
  onStatusUpdateFailed(result: any): void {
    this.showErrorMessage(result.error || 'Erro ao atualizar estágio');
  }

  /**
   * 🔄 LIMPAR SELEÇÃO - Limpa a seleção da ficha para atualização de estágio
   */
  clearStatusUpdateSelection(): void {
    this.selectedProductionSheetForStatusUpdate = undefined;
  }

  /**
   * 🗑️ EXCLUIR - Exclui ficha de produção
   */
  private deleteProductionSheet(productionSheet: ProductionSheet): void {
    if (!productionSheet._id) {
      console.error('ID da ficha de produção não encontrado');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a ficha de produção "${productionSheet.internalReference}"?`)) {
      this.productionSheetsService.deleteProductionSheet(productionSheet._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccessMessage(`Ficha de produção ${productionSheet.internalReference} excluída com sucesso.`);
            this.loadProductionSheets(); // Recarregar lista
          },
          error: (error) => {
            console.error('❌ Erro ao excluir ficha de produção:', error);
            this.showErrorMessage(error.message || 'Erro ao excluir ficha de produção.');
          }
        });
    }
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


  copy(event: MouseEvent, internalReference: string): void {
    copyToClipboard(internalReference, event);
  }

}