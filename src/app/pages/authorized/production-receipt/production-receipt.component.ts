// pages/authorized/production-receipts/production-receipts.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef, ViewChild, effect } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, lastValueFrom, takeUntil } from 'rxjs';

// Componentes
import { ActionMenuComponent, ActionMenuItem } from '../../../shared/components/atoms/action-menu/action-menu.component';
import { BadgeComponent } from '../../../shared/components/atoms/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/atoms/select/select.component';
import { GeneralModalContentComponent } from '../../../shared/components/general/general-modal-content/general-modal-content.component';
import { StatusOption, StatusUpdaterComponent } from '../../../shared/components/molecules/status-updater/status-updater.component';
import { ModalComponent } from '../../../shared/components/organisms/modal/modal.component';
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { ProductionReceiptModalComponent } from './production-receipt-modal/production-receipt-modal.component';

// Services
import { ModalService } from '../../../shared/services/modal/modal.service';
import { ProductionReceiptService } from '../../../shared/services/production-receipt/production-receipt.service';

// Models
import { ProductionOrderStatus } from '../../../models/production-orders/production-orders';
import {
  PaginationInfo,
  PaymentMethod,
  PaymentStatus,
  ProductionReceipt,
  ProductionReceiptFilters
} from '../../../models/production-receipt/production-receipt';

// Utils
import { FormValidator } from '../../../shared/utils/form';
import {
  copyToClipboard,
  translateProductionOrderStatus,
  translateProductionType
} from '../../../shared/utils/tools';
import { Client } from '../../../models/clients/clients';
import { ClientService } from '../../../shared/services/clients/clients.service';

@Component({
  selector: 'app-production-receipts',
  imports: [
    CommonModule,
    FormsModule,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    IconComponent,
    ActionMenuComponent,
    ModalComponent,
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    GeneralModalContentComponent,
    ProductionReceiptModalComponent,
    StatusUpdaterComponent
  ],
  providers: [NgModel],
  templateUrl: './production-receipt.component.html',
  styleUrl: './production-receipt.component.scss'
})
export class ProductionReceiptComponent extends FormValidator implements OnInit, OnDestroy {

  @ViewChild('statusUpdaterRef') statusUpdaterComponent!: StatusUpdaterComponent;

  // ============================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ============================================
  private productionReceiptService = inject(ProductionReceiptService);
  private modalService = inject(ModalService);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  // ============================================
  // PROPRIEDADES DO COMPONENTE
  // ============================================
  productionReceipts: ProductionReceipt[] = [];
  pagination?: PaginationInfo;
  loading = false;
  isModalOpen = false;
  selectedReceiptId?: string;

  // Status updater
  selectedProductionReceiptForStatusUpdate?: ProductionReceipt;
  productionReceiptStatusOptions: StatusOption[] = [];

  // ============================================
  // FILTROS E BUSCA - ATUALIZADO COM TODOS OS FILTROS DISPONÍVEIS
  // ============================================
  currentFilters: ProductionReceiptFilters = {
    page: 1,
    limit: 10,
    search: '',
    clientId: '',
    // Filtros de status e método de pagamento
    paymentStatus: undefined,
    paymentMethod: undefined,

    // Filtros por data
    createdFrom: undefined,
    createdTo: undefined,

    // Filtros por ordem de produção
    productionOrderId: undefined,

    // Filtros especiais
    active: true,        // Por padrão, apenas ativos

    // Ordenação
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  // Subject para debounce da busca
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ============================================
  // OPTIONS PARA SELECTS - EXPANDIDO
  // ============================================

  clientOptions: SelectOption[] = [];

  // Opções de status de pagamento
  paymentStatusOptions: SelectOption[] = [
    { value: '', label: 'Todos os Status' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'PAID', label: 'Pago' }
  ];

  // Opções de método de pagamento
  paymentMethodOptions: SelectOption[] = [
    { value: '', label: 'Todos os Métodos' },
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
    { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
    { value: 'PIX', label: 'PIX' },
    { value: 'CHECK', label: 'Cheque' }
  ];

  // Opções de filtro por status ativo
  activeStatusOptions: SelectOption[] = [
    { value: 'true', label: 'Apenas Ativos' },
    { value: 'false', label: 'Apenas Inativos' },
    { value: 'all', label: 'Todos' }
  ];

  // Opções de ordenação
  sortByOptions: SelectOption[] = [
    { value: 'createdAt', label: 'Data de Criação' },
    { value: 'issueDate', label: 'Data de Emissão' },
    { value: 'dueDate', label: 'Data de Vencimento' },
    { value: 'totalAmount', label: 'Valor Total' },
    { value: 'paymentStatus', label: 'Status de Pagamento' },
    { value: 'paymentMethod', label: 'Método de Pagamento' },
    { value: 'internalReference', label: 'Referência Interna' }
  ];

  sortOrderOptions: SelectOption[] = [
    { value: 'desc', label: 'Mais Recente Primeiro' },
    { value: 'asc', label: 'Mais Antigo Primeiro' }
  ];

  constructor() {
    super();
    effect(() => {
      const modalInstance = this.modalService.modals().find(m => m.id === 'production-receipt-modal');
      this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
    });
  }

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================
  ngOnInit(): void {
    this.setupSearchDebounce();
    this.setupStatusOptions();
    this.loadProductionReceipts();
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadClients(): Promise<void> {
    try {
      const response = await lastValueFrom(this.clientService.getClients({
        page: 1,
        limit: 100,
        active: true
      }));

      if (response?.data && Array.isArray(response.data)) {
        const clientOptionsFromAPI = response.data.map((client: Client) => ({
          value: client._id!,
          label: client.companyName || 'Cliente sem nome'
        }));

        // Adiciona os clientes à opção padrão
        this.clientOptions = [
          { value: '', label: 'Todos os Clientes' },
          ...clientOptionsFromAPI
        ];

        console.log('✅ Clientes carregados para select:', this.clientOptions.length);
      } else {
        console.warn('⚠️ Resposta da API não contém dados válidos:', response);
        // Mantém apenas a opção padrão
        this.clientOptions = [
          { value: '', label: 'Todos os Clientes' }
        ];
      }

      // 🔄 FORÇA DETECÇÃO DE MUDANÇAS
      this.cdr.detectChanges();
      console.log('🔄 Change detection forçada para clientOptions');

    } catch (error) {
      console.error('❌ Erro ao carregar clientes para select:', error);
      // Mantém apenas a opção padrão em caso de erro
      this.clientOptions = [
        { value: '', label: 'Todos os Clientes' }
      ];

      // 🔄 FORÇA DETECÇÃO DE MUDANÇAS MESMO EM CASO DE ERRO
      this.cdr.detectChanges();
      console.log('🔄 Change detection forçada após erro');
    }
  }

  // ============================================
  // SETUP INICIAL
  // ============================================
  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentFilters.search = searchTerm;
      this.currentFilters.page = 1;
      this.loadProductionReceipts();
    });
  }

  private setupStatusOptions(): void {
    this.productionReceiptStatusOptions = [
      { value: 'PENDING', label: 'Pendente' },
      { value: 'PAID', label: 'Pago' }
    ];
  }

  // ============================================
  // CARREGAMENTO DE DADOS
  // ============================================
  private loadProductionReceipts(): void {
    this.loading = true;

    const filters = { ...this.currentFilters };

    // Limpar campos vazios, mas preservar valores false e 0
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value === '' || value === null || value === undefined) {
        delete (filters as any)[key];
      }
    });

    console.log('Filters being sent:', filters); // Debug

    this.productionReceiptService.getProductionReceipts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.productionReceipts = response.data || [];
          this.pagination = response.pagination;
          this.loading = false;

          // 🔄 FORÇA DETECÇÃO DE MUDANÇAS
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Erro ao carregar recibos:', error);
          this.loading = false;

          // 🔄 FORÇA DETECÇÃO DE MUDANÇAS MESMO EM CASO DE ERRO
          this.cdr.detectChanges();
          // TODO: Implementar toast de erro
        }
      });
  }

  // ============================================
  // EVENTOS DE FILTROS - EXPANDIDO
  // ============================================
  onSearchChange(): void {
    this.searchSubject.next(this.currentFilters.search || '');
  }

  onPaymentStatusFilterChange(): void {
    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }

  onPaymentMethodFilterChange(): void {
    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }

  onActiveStatusFilterChange(): void {
    // Converter string para o tipo correto
    const value = (this.currentFilters.active as any);
    if (value === 'true') {
      this.currentFilters.active = true;
    } else if (value === 'false') {
      this.currentFilters.active = false;
    } else {
      this.currentFilters.active = undefined; // Para 'all'
    }

    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }

  onDateFilterChange(): void {
    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }

  onClientChange(): void {
    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }

  onSortChange(): void {
    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }

  // ============================================
  // MÉTODOS DE FILTRO ESPECIAIS
  // ============================================

  // Filtrar apenas recibos vencidos
  toggleOverdueFilter(): void {
    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }

  // Limpar todos os filtros
  clearAllFilters(): void {
    this.currentFilters = {
      page: 1,
      limit: 10,
      search: '',
      paymentStatus: undefined,
      paymentMethod: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      productionOrderId: undefined,
      active: true, // Manter apenas ativos como padrão
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.loadProductionReceipts();
  }

  // ============================================
  // PAGINAÇÃO
  // ============================================
  onPageChange(page: number): void {
    if (page !== this.currentFilters.page) {
      this.currentFilters.page = page;
      this.loadProductionReceipts();
    }
  }

  // ============================================
  // MODAL E AÇÕES
  // ============================================
  createProductionReceipt(): void {
    this.selectedReceiptId = undefined;
    this.isModalOpen = true;
    this.modalService.open({
      id: 'production-receipt-modal',
      title: 'Novo Recibo',
      size: 'xl'
    }).subscribe(result => {
      this.handleModalResult(result);
    });
  }

  editProductionReceipt(receipt: ProductionReceipt): void {
    this.selectedReceiptId = receipt._id;
    this.isModalOpen = true;
    this.modalService.open({
      id: 'production-receipt-modal',
      title: 'Editar Recibo',
      size: 'xl',
      data: receipt
    }).subscribe(result => {
      this.handleModalResult(result);
    });
  }


  /**
   * 🏁 MODAL RESULT - Processa resultado do modal
   */
  private handleModalResult(result: any): void {
    if (result && result.action) {
      if (result.action === 'saved') {
        console.log('Ordem de produção criada com sucesso:', result.data?.internalReference);
        this.loadProductionReceipts(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      }
    }

  }


  onModalClosed(result: any): void {
    this.isModalOpen = false;
    this.selectedReceiptId = undefined;

    if (result && (result.action === 'created' || result.action === 'updated')) {
      this.loadProductionReceipts();
      // TODO: Implementar toast de sucesso
    }
  }

  // ============================================
  // ACTION MENU
  // ============================================
  getActionMenuItems(receipt: ProductionReceipt): ActionMenuItem[] {
    const items: ActionMenuItem[] = [
      {
        label: 'Editar',
        value: 'edit',
        icon: 'fa-solid fa-edit'
      },
      {
        label: 'Atualizar Status',
        value: 'update-status',
        icon: 'fa-solid fa-refresh',
        disabled: false
      }
    ];

    // Adicionar ação de deletar se não estiver pago
    if (receipt.paymentStatus !== 'PAID') {
      items.push({
        label: 'Excluir',
        value: 'delete',
        icon: 'fa-solid fa-trash',
        disabled: false
      });
    }

    return items;
  }

  onActionMenuSelect(receipt: ProductionReceipt, action: ActionMenuItem): void {
    switch (action.value) {
      case 'view':
        this.viewReceiptDetails(receipt);
        break;
      case 'edit':
        this.editProductionReceipt(receipt);
        break;
      case 'update-status':
        this.openStatusUpdater(receipt);
        break;
      case 'delete':
        this.deleteProductionReceipt(receipt);
        break;
    }
  }

  private viewReceiptDetails(receipt: ProductionReceipt): void {
    // TODO: Implementar modal de detalhes ou navegação
    console.log('Ver detalhes do recebimento:', receipt);
  }

  private deleteProductionReceipt(receipt: ProductionReceipt): void {
    // TODO: Implementar modal de confirmação e exclusão
    console.log('Excluir recebimento:', receipt);
  }

  // ============================================
  // STATUS UPDATER
  // ============================================
  private openStatusUpdater(receipt: ProductionReceipt): void {
    this.selectedProductionReceiptForStatusUpdate = receipt;
    // Aguarda o próximo ciclo para garantir que o componente seja renderizado
    setTimeout(() => {
      if (this.selectedProductionReceiptForStatusUpdate) {
        this.statusUpdaterComponent.openStatusModal();
      }
    }, 0);
  }

  onStatusUpdated(result: any): void {
    if (result.success) {
      this.loadProductionReceipts();
      // TODO: Toast de sucesso
      console.log('Status atualizado com sucesso:', result);
    }
  }

  onStatusUpdateFailed(error: any): void {
    // TODO: Toast de erro
    console.error('Erro ao atualizar status:', error);
  }

  clearStatusUpdateSelection(): void {
    this.selectedProductionReceiptForStatusUpdate = undefined;
  }

  // ============================================
  // HELPERS DE FORMATAÇÃO
  // ============================================
  formatDate(date: string | Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatTime(date: string | Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number | PaymentMethod): string {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value as number);
  }

  translateProductionType(type: any): string {
    return translateProductionType(type);
  }

  translateProductionOrderStatus(status: ProductionOrderStatus): string {
    return translateProductionOrderStatus(status);
  }

  getReceiptStatusLabel(status: PaymentStatus): string {
    const statusMap: Record<PaymentStatus, string> = {
      'PENDING': 'Pendente',
      'PAID': 'Pago'
    };
    return statusMap[status] || status;
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    const methodMap: Record<PaymentMethod, string> = {
      'CASH': 'Dinheiro',
      'CREDIT_CARD': 'Cartão de Crédito',
      'DEBIT_CARD': 'Cartão de Débito',
      'BANK_TRANSFER': 'Transferência Bancária',
      'PIX': 'PIX',
      'CHECK': 'Cheque'
    };
    return methodMap[method] || method;
  }

  // ============================================
  // GETTERS PARA TEMPLATE - EXPANDIDO
  // ============================================
  get shouldShowTable(): boolean {
    return !this.loading || this.productionReceipts.length > 0;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.currentFilters.search ||
      this.currentFilters.paymentStatus ||
      this.currentFilters.paymentMethod ||
      this.currentFilters.createdFrom ||
      this.currentFilters.createdTo ||
      this.currentFilters.productionOrderId ||
      this.currentFilters.active === false // Consideramos false como filtro ativo
    );
  }

  get totalFiltersCount(): number {
    let count = 0;
    if (this.currentFilters.search) count++;
    if (this.currentFilters.paymentStatus) count++;
    if (this.currentFilters.paymentMethod) count++;
    if (this.currentFilters.createdFrom || this.currentFilters.createdTo) count++;
    if (this.currentFilters.productionOrderId) count++;
    if (this.currentFilters.active === false) count++;
    return count;
  }

  // ============================================
  // TRACK BY FUNCTIONS
  // ============================================
  trackByReceiptId(index: number, receipt: ProductionReceipt): string {
    return receipt._id || index.toString();
  }

  copy(event: MouseEvent, internalReference: string): void {
    copyToClipboard(internalReference, event);
  }
}