import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, NgModel, ReactiveFormsModule } from "@angular/forms";
import { MaskPipe } from 'mask-directive';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';



// Componentes
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { FormValidator } from '../../../shared/utils/form';
import { Client, PaginationInfo, ClientFilters, ClientListResponse } from '../../../models/clients/clients';
import { ClientService } from '../../../shared/services/clients/clients.service';

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
    IconComponent,
    MaskPipe
  ],
  providers: [
    NgModel
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent extends FormValidator implements OnInit, OnDestroy {

  // ============================================
  // PROPRIEDADES
  // ============================================

  searchInput: string = '';

  // Máscaras mantidas como você tinha
  cnpjMask: string = '00.000.000/0000-00';
  phoneMask: string = '(00) 0000-0000||(00) 00000-0000';

  // Lista de clientes e paginação
  clients: Client[] = [];
  pagination: PaginationInfo | null = null;
  loading = false;

  // Filtros atuais
  currentFilters: ClientFilters = {
    page: 1,
    limit: 10,
    active: true
  };

  // RxJS para cleanup e debounce
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ============================================
  // CONSTRUCTOR E LIFECYCLE
  // ============================================

  constructor(private clientService: ClientService) {
    super();
    this.setupSearchDebounce();
  }

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // MÉTODOS PRINCIPAIS - CRUD (sem CREATE)
  // ============================================

  /**
   * 📋 LISTAR - Carrega lista de clientes da API
   */
  loadClients(filters: ClientFilters = this.currentFilters): void {
    this.loading = true;
    this.currentFilters = { ...this.currentFilters, ...filters };

    this.clientService.getClients(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ClientListResponse) => {
          if (response.success) {
            this.clients = response.data;
            this.pagination = response.pagination;
          }
        },
        error: (error) => {
          console.error('Erro ao carregar clientes:', error);

        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  /**
   * 🔍 BUSCAR - Busca clientes por texto
   */
  searchClients(searchTerm: string): void {
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
    console.log('Cliente selecionado para edição:', cliente);
    // TODO: Implementar navegação para página de edição
    // this.router.navigate(['/clients/edit', cliente._id]);

    // Ou abrir modal de edição:
    // this.openEditModal(cliente);
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
            console.error('Erro ao deletar cliente:', error);

          }
        });
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
  onPageChange(page: number): void {
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
  // GETTERS AUXILIARES
  // ============================================

  get hasClients(): boolean {
    return this.clients && this.clients.length > 0;
  }

  get filterStatusText(): string {
    return this.currentFilters.active ? 'Mostrando Ativos' : 'Mostrando Inativos';
  }

  get isSearching(): boolean {
    return this.searchInput.length > 0;
  }

  // ============================================
  // MÉTODOS MANTIDOS DO SEU CÓDIGO ORIGINAL
  // ============================================

  click() {
    console.log('Button clicked!');
    // Manter conforme sua implementação
  }

  submit() {
    console.log('Form submitted!');
    // Manter conforme sua implementação
  }
}