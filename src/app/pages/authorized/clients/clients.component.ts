import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { FormsModule, NgModel, ReactiveFormsModule } from "@angular/forms";
import { MaskPipe } from 'mask-directive';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Componentes
import { Client, ClientFilters, ClientListResponse, PaginationInfo } from '../../../models/clients/clients';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { ClientService } from '../../../shared/services/clients/clients.service';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { FormValidator } from '../../../shared/utils/form';
import { ClientModalComponent } from "./client-modal/client-modal.component";

@Component({
  selector: 'app-clients',
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    InputComponent,
    FormsModule,
    TableComponent,
    TableRowComponent,
    TableCellComponent,
    MaskPipe,
    ModalComponent,
    ClientModalComponent
  ],
  providers: [NgModel], // NgModel é necessário para MaskDirective
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent extends FormValidator implements OnInit, OnDestroy {

  isModalOpen: boolean = false;

  private clientService = inject(ClientService);
  private modalService = inject(ModalService);

  searchInput: string = '';

  // Máscaras usando variáveis do sistema
  cnpjMask: string = '00.000.000/0000-00';
  phoneMask: string = '(00) 0000-0000||(00) 00000-0000';

  // Lista de clientes e paginação
  clients: Client[] = [];
  pagination: PaginationInfo | null = null;
  loading = false;
  shouldShowTable = false;

  // Estados para UI
  errorMessage: string = '';
  showError = false;

  // Filtros atuais
  currentFilters: ClientFilters = {
    page: 1,
    limit: 10,
    active: true
  };

  // Propriedade para armazenar ID do cliente selecionado para edição
  selectedClientId?: string;

  // RxJS para cleanup e debounce
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ============================================
  // CONSTRUCTOR E LIFECYCLE
  // ============================================

  // No constructor, adicione um effect para monitorar o modal
  constructor() {
    super();
    this.setupSearchDebounce();

    // Effect para monitorar quando o modal está aberto
    effect(() => {
      const modalInstance = this.modalService.modals().find(m => m.id === 'client-modal');
      this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
    });
  }

  ngOnInit(): void {
    console.log('🚀 Iniciando componente de clientes...');
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // SETUP DE DEBOUNCE PARA BUSCA
  // ============================================

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  // ============================================
  // MÉTODOS PRINCIPAIS - CRUD
  // ============================================

  /**
   * 📋 LISTAR - Carrega lista de clientes da API
   */
  private loadClients(filters: ClientFilters = this.currentFilters): void {
    console.log('📡 Carregando clientes com filtros:', filters);

    this.loading = true;
    this.shouldShowTable = true;

    this.clearError();
    this.currentFilters = { ...this.currentFilters, ...filters };

    this.clientService.getClients(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ClientListResponse) => {
          console.log('✅ Resposta da API recebida:', response);

          if (response.success && response.data) {
            this.clients = response.data;
            this.pagination = response.pagination;

            console.log(`📊 ${this.clients.length} clientes carregados:`, this.clients);
            this.shouldShowTable = this.clients.length > 0;
          } else {
            console.warn('⚠️ Resposta da API não contém dados válidos:', response);
            this.clients = [];
            this.shouldShowTable = false;
            this.showErrorMessage('Nenhum dado foi retornado da API.');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar clientes:', error);
          this.loading = false;
          this.shouldShowTable = false;
          this.showErrorMessage(error.message || 'Erro ao carregar clientes.');
        }
      });
  }

  /**
   * ➕ CRIAR - Abre modal para criar novo cliente
   */
  createClient(): void {
    // Limpar ID selecionado para modo criação
    this.selectedClientId = undefined;

    this.modalService.open({
      id: 'client-modal',
      title: 'Novo Cliente',
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
   * ✏️ EDITAR - Abre modal para editar cliente existente
   */
  editClient(client: Client): void {
    // Definir o client ID para edição
    this.selectedClientId = client._id;

    this.modalService.open({
      id: 'client-modal',
      title: `Editar Cliente - ${client.companyName}`,
      size: 'xl',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: false,
      closeOnEscapeKey: true,
      data: client
    }).subscribe(result => {
      this.handleModalResult(result);
    });
  }

  /**
   * 👆 CLIQUE NA TABELA - Callback quando cliente é clicado na tabela
   */
  onClienteClick(client: Client): void {
    this.editClient(client);
  }

  // ============================================
  // MÉTODOS DE BUSCA E FILTROS
  // ============================================

  /**
   * 🔍 BUSCA - Dispara busca quando usuário digita
   */
  onSearchChange(): void {
    this.searchSubject.next(this.searchInput.trim());
  }

  /**
   * 🎯 PERFORM SEARCH - Executa a busca de fato
   */
  private performSearch(searchTerm: string): void {
    console.log('🔍 Buscando por:', searchTerm);

    const searchFilters: ClientFilters = {
      ...this.currentFilters,
      search: searchTerm || undefined,
      page: 1 // Resetar para primeira página
    };

    this.loadClients(searchFilters);
  }

  // ============================================
  // MÉTODOS DE PAGINAÇÃO
  // ============================================

  /**
   * 📄 PAGINAÇÃO - Navegar entre páginas
   */
  onPageChange(page: number): void {
    if (page !== this.currentFilters.page) {
      console.log('📄 Mudando para página:', page);
      this.loadClients({ ...this.currentFilters, page });
    }
  }

  // ============================================
  // CALLBACKS DO MODAL
  // ============================================

  /**
   * 🏁 MODAL RESULT - Processa resultado do modal
   */
  private handleModalResult(result: any): void {
    if (result && result.action) {
      if (result.action === 'created') {
        console.log('Cliente criado com sucesso:', result.data?.companyName);
        this.loadClients(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      } else if (result.action === 'updated') {
        console.log('Cliente atualizado com sucesso:', result.data?.companyName);
        this.loadClients(); // Recarregar lista
        // TODO: Exibir toast de sucesso
      }
    }

    // Sempre limpar o ID selecionado após fechar modal
    this.selectedClientId = undefined;
  }

  /**
   * 🚪 MODAL CLOSED - Callback para quando modal é fechado
   */
  onModalClosed(result: any): void {
    console.log('Modal fechado:', result);
    this.handleModalResult(result);
  }

  // ============================================
  // MÉTODOS DE UI E ESTADOS
  // ============================================

  /**
   * 🧹 CLEAR ERROR - Limpa mensagens de erro
   */
  private clearError(): void {
    this.errorMessage = '';
    this.showError = false;
  }

  /**
   * ⚠️ SHOW ERROR - Exibe mensagem de erro
   */
  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;

    // Auto-limpar erro após 5 segundos
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  // ============================================
  // GETTERS PARA TEMPLATE
  // ============================================

  /**
   * 📊 GET SHOULD SHOW SPINNER - Mostra spinner quando necessário
   */
  get shouldShowSpinner(): boolean {
    return this.loading;
  }

  /**
   * 📋 GET SHOULD SHOW TABLE - Mostra tabela quando há dados
   */
  get shouldShowTableGetter(): boolean {
    return this.shouldShowTable && !this.loading && this.clients.length > 0;
  }

  /**
   * 📄 GET CURRENT PAGE - Página atual para template
   */
  get currentPage(): number {
    return this.pagination?.currentPage || 1;
  }

  /**
   * 📊 GET TOTAL PAGES - Total de páginas para template
   */
  get totalPages(): number {
    return this.pagination?.totalPages || 0;
  }
}