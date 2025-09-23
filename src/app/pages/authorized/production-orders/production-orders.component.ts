// pages/authorized/production-orders/production-orders.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { FormsModule, NgModel } from "@angular/forms";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Componentes
import { PaginationInfo, ProductionOrder, ProductionOrderFilters } from '../../../models/production-orders/production-orders';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/atoms/select/select.component';
import { SpinnerComponent } from '../../../shared/components/atoms/spinner/spinner.component';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { ProductionOrderService } from '../../../shared/services/production-order/production-order.service';
import { FormValidator } from '../../../shared/utils/form';
import { ProductionOrderModalComponent } from "./production-order-modal/production-order-modal.component";
import { IconComponent } from "../../../shared/components/atoms/icon/icon.component";

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
    SpinnerComponent,
    IconComponent
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
    this.setupSearchDebounce();
    this.loadProductionOrders();
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
        this.loadProductionOrders();
      });
  }

  // ============================================
  // MÉTODOS DE CARREGAMENTO DE DADOS
  // ============================================

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
        this.shouldShowTable = true;

        console.log('✅ Ordens de produção carregadas:', this.productionOrders.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ordens de produção:', error);
      this.errorMessage = 'Erro ao carregar ordens de produção. Tente novamente.';
      this.showError = true;
      this.shouldShowTable = false;
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
   * 📂 FILTRO STATUS - Evento de mudança no filtro de status
   */
  onStatusFilterChange(): void {
    this.currentFilters.page = 1; // Reset para primeira página
    this.loadProductionOrders();
  }

  // ============================================
  // MÉTODOS DE INTERAÇÃO COM TABELA
  // ============================================

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
    // Limpar ID selecionado para modo criação
    this.selectedProductionOrderId = undefined;

    this.modalService.open({
      id: 'production-order-modal',
      title: 'Nova Ordem de Produção',
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
   * 🏁 MODAL RESULT - Processa resultado do modal
   */
  private handleModalResult(result: any): void {
    if (result && result.action) {
      if (result.action === 'created') {
        console.log('Ordem de produção criada com sucesso:', result.data?.internalReference);
        this.loadProductionOrders(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      } else if (result.action === 'updated') {
        console.log('Ordem de produção atualizada com sucesso:', result.data?.internalReference);
        this.loadProductionOrders(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      }
    }

    // Sempre limpar o ID selecionado após fechar modal
    this.selectedProductionOrderId = undefined;
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
    if (!date) return '-';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
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

  // ============================================
  // MÉTODOS DE PAGINAÇÃO
  // ============================================

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

  clearFilters() {

  }
}