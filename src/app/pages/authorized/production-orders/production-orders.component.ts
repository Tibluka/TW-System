// pages/authorized/production-orders/production-orders.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { FormsModule, NgModel } from "@angular/forms";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Componentes
import { ProductionOrder, ProductionOrderFilters, ProductionOrderListResponse, PaginationInfo, ProductionOrderUtils } from '../../../models/production-orders/production-orders';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/atoms/select/select.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { SpinnerComponent } from '../../../shared/components/atoms/spinner/spinner.component';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { FormValidator } from '../../../shared/utils/form';
import { ProductionOrderModalComponent } from "./production-order-modal/production-order-modal.component";
import { ProductionOrderService } from '../../../shared/services/production-order/production-order.service';

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
    SpinnerComponent
  ],
  providers: [NgModel],
  templateUrl: './production-orders.component.html',
  styleUrl: './production-orders.component.scss'
})
export class ProductionOrdersComponent extends FormValidator implements OnInit, OnDestroy {

  isModalOpen: boolean = false;

  private productionOrderService = inject(ProductionOrderService);
  private modalService = inject(ModalService);

  // Lista de ordens de produção e paginação
  productionOrders: ProductionOrder[] = [];
  pagination: PaginationInfo | null = null;
  loading = false;
  shouldShowTable = false;

  // Estados para UI
  errorMessage: string = '';
  showError = false;

  // Filtros atuais
  currentFilters: ProductionOrderFilters = {
    search: undefined,
    status: undefined,
    page: 1,
    limit: 10,
    active: true
  };

  // Opções para select de status
  statusOptions: SelectOption[] = [
    { value: undefined, label: 'Todos os Status' },
    { value: 'CREATED', label: 'Criado' },
    { value: 'PILOT_PRODUCTION', label: 'Produção Piloto' },
    { value: 'PILOT_SENT', label: 'Piloto Enviado' },
    { value: 'PILOT_APPROVED', label: 'Piloto Aprovado' },
    { value: 'PRODUCTION_STARTED', label: 'Produção Iniciada' },
    { value: 'FINALIZED', label: 'Finalizado' }
  ];

  // Propriedade para armazenar ID da ordem selecionada para edição
  selectedProductionOrderId?: string;

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
      const modalInstance = this.modalService.modals().find(m => m.id === 'production-order-modal');
      this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
    });
  }

  ngOnInit(): void {
    this.initializeSearchDebounce();
    this.loadProductionOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // MÉTODOS DE INICIALIZAÇÃO
  // ============================================

  /**
   * 🔍 DEBOUNCE - Configura debounce para busca
   */
  private initializeSearchDebounce(): void {
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

  // ============================================
  // MÉTODOS DE CARREGAMENTO
  // ============================================

  /**
   * 📋 CARREGAR ORDENS DE PRODUÇÃO - Busca dados da API com filtros atuais
   */
  private loadProductionOrders(): void {
    this.loading = true;
    this.shouldShowTable = false;

    this.productionOrderService.getProductionOrders(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ProductionOrderListResponse) => {
          if (response.data) {
            this.productionOrders = response.data;
            this.pagination = response.pagination || null;
            this.shouldShowTable = true;
            console.log('✅ Ordens de produção carregadas:', this.productionOrders.length);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar ordens de produção:', error);
          this.loading = false;
          this.showErrorMessage(error.message || 'Erro ao carregar ordens de produção.');
        }
      });
  }

  // ============================================
  // MÉTODOS DE AÇÃO DOS BOTÕES
  // ============================================

  /**
   * ➕ CRIAR - Abre modal para criar nova ordem de produção
   */
  createProductionOrder(): void {
    // Limpar ID selecionado para modo criação
    this.selectedProductionOrderId = undefined;

    this.openModal({
      id: 'production-order-modal',
      title: 'Nova Ordem de Produção',
      size: 'xl',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: false,
      closeOnEscapeKey: true
    });
  }

  /**
   * ✏️ EDITAR - Abre modal para editar ordem de produção existente
   */
  editProductionOrder(productionOrder: ProductionOrder): void {
    // Definir o ID da ordem para edição
    this.selectedProductionOrderId = productionOrder._id;

    this.openModal({
      id: 'production-order-modal',
      title: `Editar Ordem - ${productionOrder.internalReference || 'Sem Referência'}`,
      size: 'xl',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: false,
      closeOnEscapeKey: true,
      data: productionOrder
    });
  }

  /**
   * 👆 CLIQUE NA TABELA - Callback quando ordem é clicada na tabela
   */
  onProductionOrderClick(productionOrder: ProductionOrder): void {
    this.editProductionOrder(productionOrder);
  }

  // ============================================
  // MÉTODOS DE BUSCA E FILTROS
  // ============================================

  /**
   * 🔍 BUSCA - Dispara busca quando usuário digita
   */
  onSearchChange(): void {
    if (!this.currentFilters.search) return;
    this.searchSubject.next(this.currentFilters.search);
  }

  /**
   * 📂 FILTRO STATUS - Aplica filtro de status
   */
  onStatusFilterChange(): void {
    this.currentFilters.page = 1; // Reset para primeira página
    this.loadProductionOrders();
  }

  /**
   * 🧹 LIMPAR FILTROS - Remove todos os filtros
   */
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

  // ============================================
  // MÉTODOS DE MODAL
  // ============================================

  /**
   * 📤 ABRIR MODAL - Configura modal e define isModalOpen = true
   */
  private openModal(config: any): void {
    this.isModalOpen = true;

    this.modalService.open(config).subscribe(result => {
      this.handleModalResult(result);
    });
  }

  /**
   * 🔧 RESULTADO DO MODAL - Manipula resultado do modal
   */
  private handleModalResult(result: any): void {
    console.log('📋 Resultado do modal:', result);

    if (result?.action === 'created' || result?.action === 'updated') {
      // Recarregar lista após criar/editar
      this.loadProductionOrders();
    }

    // Resetar estado do modal
    this.selectedProductionOrderId = undefined;
  }

  /**
   * ❌ MODAL FECHADO - Callback quando modal é fechado
   */
  onModalClosed(result: any): void {
    this.isModalOpen = false;
    this.handleModalResult(result);
  }

  // ============================================
  // MÉTODOS HELPER
  // ============================================

  /**
   * 🏷️ LABEL DO STATUS - Retorna texto amigável para status
   */
  getStatusLabel(status: string): string {
    return ProductionOrderUtils.getStatusLabel(status as any);
  }

  /**
   * 🚨 LABEL DA PRIORIDADE - Retorna texto amigável para prioridade
   */
  getPriorityLabel(priority: string): string {
    return ProductionOrderUtils.getPriorityLabel(priority as any);
  }

  /**
   * 🧪 TEXTO PILOTO - Retorna texto para tipo piloto
   */
  getPilotText(pilot: boolean): string {
    return ProductionOrderUtils.getPilotText(pilot);
  }

  /**
   * 📅 FORMATAR DATA - Formata data para exibição
   */
  formatDate(date: Date | string | undefined): string {
    return ProductionOrderUtils.formatDate(date);
  }

  /**
   * ⚠️ MOSTRAR ERRO - Exibe mensagem de erro
   */
  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;

    // Auto-hide após 5 segundos
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }
}