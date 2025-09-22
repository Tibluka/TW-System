import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
  providers: [NgModel],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent extends FormValidator implements OnInit, OnDestroy {

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
    limit: 1,
    active: true
  };

  // RxJS para cleanup e debounce
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ============================================
  // CONSTRUCTOR E LIFECYCLE
  // ============================================

  constructor() {
    super();
    this.setupSearchDebounce();
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
  // MÉTODOS PRINCIPAIS - CRUD
  // ============================================

  /**
   * 📋 LISTAR - Carrega lista de clientes da API
   */
  loadClients(filters: ClientFilters = this.currentFilters): void {
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
          } else {
            console.warn('⚠️ Resposta da API não contém dados válidos:', response);
            this.clients = [];
            this.showErrorMessage('Nenhum dado foi retornado da API.');
          }
        },
        error: (error) => {
          console.error('❌ Erro ao carregar clientes:', error);
          this.showErrorMessage(error.message || 'Erro ao carregar clientes.');
          this.clients = [];
        },
        complete: () => {
          console.log('🏁 Carregamento de clientes finalizado');
          this.loading = false;
        }
      });
  }

  /**
   * 🔍 BUSCAR - Busca clientes por texto
   */
  searchClients(searchTerm: string): void {
    console.log('🔍 Buscando clientes com termo:', searchTerm);

    const filters: ClientFilters = {
      ...this.currentFilters,
      search: searchTerm.trim(),
      page: 1
    };

    this.loadClients(filters);
  }

  /**
   * ✏️ EDITAR - Método para clique na linha (navegar para edição)
   */
  onClienteClick(cliente: Client): void {
    console.log('👆 Cliente selecionado para edição:', cliente);
    this.modalService.open({
      id: 'client-modal',
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      size: 'lg',
      title: "Editar modal"
    })
    // TODO: Implementar navegação para página de edição
    // this.router.navigate(['/clients/edit', cliente._id]);
  }

  onModalClosed(result: any) {
    console.log("Modal fechado:", result);
  }

  /**
   * 🗑️ DELETAR - Deleta cliente (soft delete)
   */
  deleteClient(clientId: string, clientName: string): void {
    if (confirm(`Tem certeza que deseja desativar o cliente "${clientName}"?`)) {

      this.clientService.deleteClient(clientId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadClients(); // Recarrega a lista
            }
          },
          error: (error) => {
            this.showErrorMessage(error.message || 'Erro ao deletar cliente.');
          }
        });
    }
  }

  // ============================================
  // ✨ MÉTODO DE PAGINAÇÃO (APENAS ESTE)
  // ============================================

  /**
   * 📄 Mudança de página - chamado pelo evento (pageChanged) do ds-table
   */
  onPageChange(page: number): void {
    console.log(`📄 Mudando para página ${page}`);

    if (this.pagination && page !== this.pagination.currentPage) {
      this.loadClients({ ...this.currentFilters, page });
    }
  }

  // ============================================
  // MÉTODOS DE INTERAÇÃO E FILTROS
  // ============================================

  /**
   * Configura debounce para busca em tempo real
   */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchClients(searchTerm);
      });
  }

  /**
   * Método chamado quando o input de busca muda
   */
  onSearchChange(): void {
    this.searchSubject.next(this.searchInput);
  }

  /**
   * Mudança de página na paginação
   */
  onPageChange_old(page: number): void {
    if (this.pagination && page !== this.pagination.currentPage) {
      this.loadClients({ ...this.currentFilters, page });
    }
  }

  /**
   * Alterna entre clientes ativos e inativos
   */
  toggleActiveFilter(): void {
    const newActive = this.currentFilters.active ? false : true;
    this.loadClients({ ...this.currentFilters, active: newActive, page: 1 });
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters(): void {
    this.searchInput = '';
    this.currentFilters = { page: 1, limit: 10, active: true };
    this.loadClients();
  }

  // ============================================
  // MÉTODOS PARA TRATAMENTO DE MENSAGENS
  // ============================================

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;

    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  private showSuccessMessage(message: string): void {
    console.log('✅ Sucesso:', message);
  }

  clearError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  get hasClients(): boolean {
    return this.clients && this.clients.length > 0;
  }

  get shouldShowSpinner(): boolean {
    return this.loading;
  }

  get shouldShowEmptyState(): boolean {
    return !this.loading && (!this.clients || this.clients.length === 0);
  }

  get filterStatusText(): string {
    return this.currentFilters.active ? 'Mostrando Ativos' : 'Mostrando Inativos';
  }

  get isSearching(): boolean {
    return this.searchInput.length > 0;
  }

  createClient() {

  }

}