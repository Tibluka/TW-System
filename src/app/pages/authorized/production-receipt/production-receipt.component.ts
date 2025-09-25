// pages/authorized/production-receipts/production-receipts.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Componentes
import { ActionMenuComponent, ActionMenuItem } from '../../../shared/components/atoms/action-menu/action-menu.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { SelectOption } from '../../../shared/components/atoms/select/select.component';
import { GeneralModalContentComponent } from '../../../shared/components/general/general-modal-content/general-modal-content.component';
import { StatusOption } from '../../../shared/components/molecules/status-updater/status-updater.component';
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

@Component({
  selector: 'app-production-receipts',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    IconComponent,
    ActionMenuComponent,
    ModalComponent,
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    GeneralModalContentComponent,
    ProductionReceiptModalComponent
  ],
  providers: [NgModel],
  templateUrl: './production-receipt.component.html',
  styleUrl: './production-receipt.component.scss'
})
export class ProductionReceiptComponent extends FormValidator implements OnInit, OnDestroy {

  // ============================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ============================================
  private productionReceiptService = inject(ProductionReceiptService);
  private modalService = inject(ModalService);

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
  // FILTROS E BUSCA
  // ============================================
  currentFilters: ProductionReceiptFilters = {
    page: 1,
    limit: 10,
    search: '',
    paymentStatus: undefined,
    createdFrom: undefined,
    createdTo: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  // Subject para debounce da busca
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ============================================
  // OPTIONS PARA SELECTS
  // ============================================
  statusOptions: SelectOption[] = [
    { value: '', label: 'Todos os Status' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'PAID', label: 'Pago' }
  ];

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================
  ngOnInit(): void {
    this.setupSearchDebounce();
    this.setupStatusOptions();
    this.loadProductionReceipts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    // Limpar campos vazios
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
        },
        error: (error: any) => {
          console.error('Erro ao carregar recebimentos:', error);
          this.loading = false;
          // TODO: Implementar toast de erro
        }
      });
  }

  // ============================================
  // EVENTOS DE FILTROS
  // ============================================
  onSearchChange(): void {
    this.searchSubject.next(this.currentFilters.search || '');
  }

  onStatusFilterChange(): void {
    this.currentFilters.page = 1;
    this.loadProductionReceipts();
  }

  onDateFilterChange(): void {
    this.currentFilters.page = 1;
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
      title: 'Novo Recebimento',
      size: 'lg'
    });
  }

  editProductionReceipt(receipt: ProductionReceipt): void {
    this.selectedReceiptId = receipt._id;
    this.isModalOpen = true;
    this.modalService.open({
      id: 'production-receipt-modal',
      title: 'Editar Recebimento',
      size: 'lg'
    });
  }

  onModalClosed(result: any): void {
    this.isModalOpen = false;
    this.selectedReceiptId = undefined;

    if (result && (result.action === 'created' || result.action === 'updated')) {
      this.loadProductionReceipts();
      // TODO: Implementar toast de sucesso
    }
  }

  onProductionReceiptClick(receipt: ProductionReceipt): void {
    // Implementar navegação ou modal de detalhes se necessário
    console.log('Receipt clicado:', receipt);
  }

  // ============================================
  // ACTION MENU
  // ============================================
  getActionMenuItems(receipt: ProductionReceipt): ActionMenuItem[] {
    const items: ActionMenuItem[] = [
      {
        label: 'Ver Detalhes',
        value: 'view',
        icon: 'fa-solid fa-eye',
        disabled: false
      },
      {
        label: 'Editar',
        value: 'edit',
        icon: 'fa-solid fa-edit',
        disabled: receipt.paymentStatus === 'PAID'
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
  // UTILITÁRIOS E HELPERS
  // ============================================
  copyReference(event: Event, reference: string): void {
    event.stopPropagation();
    copyToClipboard(reference);
    // TODO: Toast de sucesso
    console.log('Referência copiada:', reference);
  }

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

  // ============================================
  // GETTERS PARA TEMPLATE
  // ============================================
  get shouldShowTable(): boolean {
    return !this.loading || this.productionReceipts.length > 0;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.currentFilters.search ||
      this.currentFilters.paymentStatus ||
      this.currentFilters.createdFrom ||
      this.currentFilters.createdTo
    );
  }

  // ============================================
  // TRACK BY FUNCTIONS
  // ============================================
  trackByReceiptId(index: number, receipt: ProductionReceipt): string {
    return receipt._id || index.toString();
  }
}