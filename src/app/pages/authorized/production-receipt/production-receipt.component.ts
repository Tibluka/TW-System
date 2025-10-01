

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef, ViewChild, effect } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, lastValueFrom, takeUntil } from 'rxjs';


import { ActionMenuComponent, ActionMenuItem } from '../../../shared/components/atoms/action-menu/action-menu.component';
import { BadgeComponent } from '../../../shared/components/atoms/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { DsListViewComponent } from '../../../shared/components/molecules/list-view/list-view.component';
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


import { ModalService } from '../../../shared/services/modal/modal.service';
import { ProductionReceiptService } from '../../../shared/services/production-receipt/production-receipt.service';
import { DateFormatter } from '../../../shared/utils/date-formatter';


import { ProductionOrderStatus } from '../../../models/production-orders/production-orders';
import {
  PaginationInfo,
  PaymentMethod,
  PaymentStatus,
  ProductionReceipt,
  ProductionReceiptFilters
} from '../../../models/production-receipt/production-receipt';


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
    DsListViewComponent,
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


  private productionReceiptService = inject(ProductionReceiptService);
  private modalService = inject(ModalService);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);


  productionReceipts: ProductionReceipt[] = [];
  pagination?: PaginationInfo;
  loading = false;
  isModalOpen = false;
  selectedReceiptId?: string;


  listViewConfig = {
    itemsPerRow: 3,
    showToggle: true,
    defaultView: 'table' as 'table' | 'cards'
  };


  selectedProductionReceiptForStatusUpdate?: ProductionReceipt;
  productionReceiptStatusOptions: StatusOption[] = [];


  currentFilters: ProductionReceiptFilters = {
    page: 1,
    limit: 10,
    search: '',
    clientId: '',

    paymentStatus: undefined,
    paymentMethod: undefined,


    createdFrom: undefined,
    createdTo: undefined,


    productionOrderId: undefined,


    active: true,        // Por padrão, apenas ativos


    sortBy: 'createdAt',
    sortOrder: 'desc'
  };


  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();


  clientOptions: SelectOption[] = [];


  paymentStatusOptions: SelectOption[] = [
    { value: '', label: 'Todos os Status' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'PAID', label: 'Pago' }
  ];


  paymentMethodOptions: SelectOption[] = [
    { value: '', label: 'Todos os Métodos' },
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
    { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
    { value: 'PIX', label: 'PIX' },
    { value: 'CHECK', label: 'Cheque' }
  ];


  activeStatusOptions: SelectOption[] = [
    { value: 'true', label: 'Apenas Ativos' },
    { value: 'false', label: 'Apenas Inativos' },
    { value: 'all', label: 'Todos' }
  ];


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

  statusOptions: SelectOption[] = [
    { value: '', label: 'Todos os Status' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'PAID', label: 'Pago' }
  ];

  constructor() {
    super();
    effect(() => {
      const modalInstance = this.modalService.modals().find(m => m.id === 'production-receipt-modal');
      this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
    });
  }


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


        this.clientOptions = [
          { value: '', label: 'Todos os Clientes' },
          ...clientOptionsFromAPI
        ];

      } else {

        this.clientOptions = [
          { value: '', label: 'Todos os Clientes' }
        ];
      }


      this.cdr.detectChanges();

    } catch (error) {

      this.clientOptions = [
        { value: '', label: 'Todos os Clientes' }
      ];


      this.cdr.detectChanges();
    }
  }


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


  private loadProductionReceipts(): void {
    this.loading = true;

    const filters = { ...this.currentFilters };


    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value === '' || value === null || value === undefined) {
        delete (filters as any)[key];
      }
    });


    this.productionReceiptService.getProductionReceipts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.productionReceipts = response.data || [];
          this.pagination = response.pagination;
          this.loading = false;


          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.loading = false;


          this.cdr.detectChanges();

        }
      });
  }


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

  onStatusFilterChange(): void {
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


  toggleOverdueFilter(): void {
    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }


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


  onPageChange(page: number): void {
    if (page !== this.currentFilters.page) {
      this.currentFilters.page = page;
      this.loadProductionReceipts();
    }
  }


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
      this.loadProductionReceipts();
    }

  }


  onModalClosed(result: any): void {
    this.isModalOpen = false;
    this.selectedReceiptId = undefined;

    if (result && (result.action === 'created' || result.action === 'updated')) {
      this.loadProductionReceipts();

    }
  }


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
      },
      {
        label: 'Excluir',
        value: 'delete',
        icon: 'fa-solid fa-trash',
        disabled: false
      }
    ];


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

  }

  deleteProductionReceipt(receipt: ProductionReceipt): void {
    if (!receipt._id) {
      return;
    }

    this.modalService.open({
      id: 'general-modal',
      title: 'Excluir Recibo',
      size: 'md',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      data: {
        text: `Tem certeza que deseja excluir o recibo "${receipt.internalReference}"?`,
        icon: 'fa-solid fa-triangle-exclamation',
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
        this.productionReceiptService.deleteProductionReceipt(receipt._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadProductionReceipts(); // Recarregar lista
            },
            error: (error) => {
            }
          });
      }
    });
  }


  openStatusUpdater(receipt: ProductionReceipt): void {
    this.selectedProductionReceiptForStatusUpdate = receipt;

    setTimeout(() => {
      if (this.selectedProductionReceiptForStatusUpdate) {
        this.statusUpdaterComponent.openStatusModal();
      }
    }, 0);
  }

  onStatusUpdated(result: any): void {
    if (result.success) {
      this.loadProductionReceipts();

    }
  }

  onStatusUpdateFailed(error: any): void {

  }

  clearStatusUpdateSelection(): void {
    this.selectedProductionReceiptForStatusUpdate = undefined;
  }


  formatDate(date: string | Date | undefined): string {
    return DateFormatter.formatDate(date);
  }

  formatTime(date: string | Date | undefined): string {
    return DateFormatter.formatTime(date);
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


  trackByReceiptId(index: number, receipt: ProductionReceipt): string {
    return receipt._id || index.toString();
  }

  copy(event: MouseEvent, internalReference: string): void {
    copyToClipboard(internalReference, event);
  }
}
