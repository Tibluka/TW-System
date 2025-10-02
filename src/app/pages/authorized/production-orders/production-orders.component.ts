

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, effect, inject } from '@angular/core';
import { FormsModule, NgModel } from "@angular/forms";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';


import { PaginationInfo, ProductionOrder, ProductionOrderFilters } from '../../../models/production-orders/production-orders';
import { ActionMenuComponent, ActionMenuItem } from '../../../shared/components/atoms/action-menu/action-menu.component';
import { BadgeComponent } from "../../../shared/components/atoms/badge/badge.component";
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from "../../../shared/components/atoms/icon/icon.component";
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/atoms/select/select.component';
import { GeneralModalContentComponent } from "../../../shared/components/general/general-modal-content/general-modal-content.component";
import { StatusOption, StatusUpdaterComponent } from '../../../shared/components/molecules/status-updater/status-updater.component';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { ProductionOrderService } from '../../../shared/services/production-order/production-order.service';
import { FormValidator } from '../../../shared/utils/form';
import { copyToClipboard, translateProductionType } from '../../../shared/utils/tools';
import { DateFormatter } from '../../../shared/utils/date-formatter';
import { ProductionOrderModalComponent } from "./production-order-modal/production-order-modal.component";
import { DsListViewComponent, ViewMode } from "../../../shared/components/molecules/list-view/list-view.component";
import { ListViewConfig } from '../../../models/list-view/list-view';
import { ListViewService } from '../../../shared/services/list-view/list-view.service';
import { ProductionTypeEnum } from '../../../models/production-type/production-type';

@Component({
  selector: 'app-production-orders',
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    FormsModule,
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    ModalComponent,
    ProductionOrderModalComponent,
    SelectComponent,
    IconComponent,
    ActionMenuComponent,
    StatusUpdaterComponent,
    BadgeComponent,
    GeneralModalContentComponent,
    DsListViewComponent
  ],
  providers: [NgModel],
  templateUrl: './production-orders.component.html',
  styleUrl: './production-orders.component.scss'
})
export class ProductionOrdersComponent extends FormValidator implements OnInit, OnDestroy {

  isModalOpen: boolean = false;

  private productionOrderService = inject(ProductionOrderService);
  private modalService = inject(ModalService);
  private listViewService = inject(ListViewService);


  productionOrders: ProductionOrder[] = [];
  pagination: PaginationInfo | null = null;
  loading = false;


  errorMessage: string = '';
  showError = false;


  currentFilters: ProductionOrderFilters = {
    search: undefined,
    status: undefined,
    page: 1,
    limit: 10,
    active: true
  };


  listViewConfig: ListViewConfig = {
    showToggle: true,
    defaultView: 'table',
    cardConfig: {
      minWidth: '350px',
      gap: '24px'
    },
    storageKey: 'developments-view-mode',
    density: 'normal'
  };
  currentViewMode: ViewMode = 'table';


  statusOptions: SelectOption[] = [
    { value: undefined, label: 'Todos os Status' },
    { value: 'CREATED', label: 'Criado' },
    { value: 'PILOT_PRODUCTION', label: 'Produção Piloto' },
    { value: 'PILOT_SENT', label: 'Piloto Enviado' },
    { value: 'PILOT_APPROVED', label: 'Piloto Aprovado' },
    { value: 'PRODUCTION_STARTED', label: 'Produção Iniciada' },
    { value: 'FINALIZED', label: 'Finalizado' }
  ];


  selectedProductionOrderId?: string;


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


  productionOrderStatusOptions: StatusOption[] = [
    { value: 'CREATED', label: 'Criado', icon: 'fa-solid fa-plus', color: 'info' },
    { value: 'PILOT_PRODUCTION', label: 'Produção Piloto', icon: 'fa-solid fa-flask', color: 'warning' },
    { value: 'PILOT_SENT', label: 'Piloto Enviado', icon: 'fa-solid fa-paper-plane', color: 'info' },
    { value: 'PILOT_APPROVED', label: 'Piloto Aprovado', icon: 'fa-solid fa-check-circle', color: 'success' },
    { value: 'PRODUCTION_STARTED', label: 'Produção Iniciada', icon: 'fa-solid fa-play', color: 'primary' },
    { value: 'FINALIZED', label: 'Finalizado', icon: 'fa-solid fa-flag-checkered', color: 'success' }
  ];


  selectedProductionOrderForStatusUpdate?: ProductionOrder;


  @ViewChild('statusUpdaterRef') statusUpdaterComponent?: StatusUpdaterComponent;


  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  get shouldShowSpinner(): boolean {
    return this.loading;
  }


  constructor() {
    super();

    effect(() => {
      const modalInstance = this.modalService.modals().find(m => m.id === 'production-order-modal');
      this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
    });
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadProductionOrders();
    this.listViewService
      .getViewMode('developments', 'table')
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        this.currentViewMode = mode;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  onViewModeChange(mode: ViewMode) {
    this.listViewService.setViewMode('developments', mode);


  }


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
        this.loadProductionOrders();
      });
  }


  /**
   * 📋 CARREGAR ORDENS DE PRODUÇÃO - Carrega lista com filtros
   */
  async loadProductionOrders(): Promise<void> {
    this.loading = true;
    this.showError = false;

    try {
      const response = await this.productionOrderService.getProductionOrders(this.currentFilters).toPromise();

      if (response) {
        this.productionOrders = response.data || [];
        this.pagination = response.pagination || null;


      }
    } catch (error) {
      this.errorMessage = 'Erro ao carregar ordens de produção. Tente novamente.';
      this.showError = true;

    } finally {
      this.loading = false;
    }
  }


  /**
   * 🔍 BUSCA - Evento de mudança no campo de busca
   */
  onSearchChange(): void {
    const searchTerm = this.currentFilters.search?.trim() || '';
    this.searchSubject.next(searchTerm);
  }

  /**
   * 📂 FILTRO STATUS - Evento de mudança no filtro de status
   */
  onStatusFilterChange(): void {
    this.currentFilters.page = 1; // Reset para primeira página
    this.loadProductionOrders();
  }


  /**
   * 👆 CLICK NA ORDEM - Abre modal para editar ordem
   */
  onProductionOrderClick(productionOrder: ProductionOrder): void {
    if (!productionOrder._id) return;

    this.selectedProductionOrderId = productionOrder._id;

    this.modalService.open({
      id: 'production-order-modal',
      title: `Editar Ordem de Produção - ${productionOrder.internalReference || 'S/N'}`,
      size: 'xl',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: false,
      closeOnEscapeKey: true,
      data: productionOrder // Passar dados para o modal
    }).subscribe(result => {
      this.handleModalResult(result);
    });
  }

  /**
   * ➕ CRIAR - Abre modal para criar nova ordem de produção
   */
  createProductionOrder(): void {

    this.selectedProductionOrderId = undefined;

    this.modalService.open({
      id: 'production-order-modal',
      title: 'Nova Ordem de Produção',
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
        this.loadProductionOrders(); // Recarregar lista

      } else if (result.action === 'updated') {
        this.loadProductionOrders(); // Recarregar lista

      }
    }


    this.selectedProductionOrderId = undefined;
  }

  /**
   * 🎭 MODAL CLOSED - Evento quando modal é fechado
   */
  onModalClosed(result: any): void {
    this.handleModalResult(result);
  }


  /**
   * 📅 FORMATAR DATA - Formata data para exibição
   */
  formatDate(date: Date | string | undefined): string {
    return DateFormatter.formatDate(date);
  }

  /**
   * 🎯 LABEL STATUS - Retorna label amigável para status
   */
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'Criado',
      'PILOT_PRODUCTION': 'Produção Piloto',
      'PILOT_SENT': 'Piloto Enviado',
      'PILOT_APPROVED': 'Piloto Aprovado',
      'PRODUCTION_STARTED': 'Produção Iniciada',
      'FINALIZED': 'Finalizado'
    };
    return statusMap[status] || status;
  }

  /**
   * 🚨 LABEL PRIORIDADE - Retorna label amigável para prioridade
   */
  getPriorityLabel(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'green': 'Normal',
      'yellow': 'Média',
      'red': 'Alta'
    };
    return priorityMap[priority] || priority;
  }

  /**
   * 🧪 TEXTO PILOTO - Retorna texto para piloto
   */
  getPilotText(pilot: boolean): string {
    return pilot ? 'Sim' : 'Não';
  }


  /**
   * 📄 PÁGINA ANTERIOR - Navega para página anterior
   */
  previousPage(): void {
    if (this.pagination && this.pagination.currentPage > 1) {
      this.currentFilters.page = this.pagination.currentPage - 1;
      this.loadProductionOrders();
    }
  }

  /**
   * 📄 PRÓXIMA PÁGINA - Navega para próxima página
   */
  nextPage(): void {
    if (this.pagination && this.pagination.currentPage < this.pagination.totalPages) {
      this.currentFilters.page = this.pagination.currentPage + 1;
      this.loadProductionOrders();
    }
  }

  /**
   * 📄 IR PARA PÁGINA - Navega para página específica
   */
  goToPage(page: number): void {
    if (this.pagination && page >= 1 && page <= this.pagination.totalPages) {
      this.currentFilters.page = page;
      this.loadProductionOrders();
    }
  }


  onPageChange(page: number): void {
    this.currentFilters.page = page;
    this.loadProductionOrders();
  }

  clearFilters(): void {
    this.currentFilters = {
      search: undefined,
      status: undefined,
      page: 1,
      limit: 10,
      active: true
    };
    this.loadProductionOrders();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.currentFilters.search ||
      this.currentFilters.status ||
      this.currentFilters.active === false
    );
  }

  copy(event: MouseEvent, internalReference: string): void {
    copyToClipboard(internalReference, event);
  }

  /**
   * 🎯 MENU DE AÇÕES - Processa ação selecionada no menu
   */
  onActionMenuSelect(productionOrder: ProductionOrder, action: ActionMenuItem): void {
    switch (action.value) {
      case 'change-status':
        this.changeProductionOrderStatus(productionOrder);
        break;
      case 'delete':
        this.deleteProductionOrder(productionOrder);
        break;
      default:
    }
  }

  /**
   * 🔄 ALTERAR STATUS - Altera status da ordem de produção
   */
  changeProductionOrderStatus(productionOrder: ProductionOrder): void {
    this.selectedProductionOrderForStatusUpdate = productionOrder;


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
      this.loadProductionOrders(); // Recarregar lista
    }
  }

  /**
   * ❌ STATUS UPDATE FALHOU - Callback quando atualização falha
   */
  onStatusUpdateFailed(result: any): void {
    this.showErrorMessage(result.error || 'Erro ao atualizar status');
  }

  /**
   * 🔄 LIMPAR SELEÇÃO - Limpa a seleção da ordem para atualização de status
   */
  clearStatusUpdateSelection(): void {
    this.selectedProductionOrderForStatusUpdate = undefined;
  }

  /**
   * 🗑️ EXCLUIR - Exclui ordem de produção
   */
  deleteProductionOrder(productionOrder: ProductionOrder): void {
    if (!productionOrder._id) {
      return;
    }

    this.modalService.open({
      id: 'general-modal',
      title: 'Excluir Ordem de Produção',
      size: 'md',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      data: {
        text: `Tem certeza que deseja excluir a ordem de produção "${productionOrder.internalReference}"?`,
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
        this.productionOrderService.deleteProductionOrder(productionOrder._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccessMessage(`Ordem de produção ${productionOrder.internalReference} excluída com sucesso.`);
              this.loadProductionOrders(); // Recarregar lista
            },
            error: (error) => {
              this.showErrorMessage(error.message || 'Erro ao excluir ordem de produção.');
            }
          });
      }
    });

  }

  /**
   * 🟢 SUCESSO - Mostra mensagem de sucesso
   */
  private showSuccessMessage(message: string): void {

  }

  /**
   * 🔴 ERRO - Mostra mensagem de erro
   */
  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;


    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }

  productionType(productionType: ProductionTypeEnum) {
    return translateProductionType(productionType);
  }

}
