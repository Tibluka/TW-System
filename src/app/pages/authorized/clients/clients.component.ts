import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { FormsModule, NgModel, ReactiveFormsModule } from "@angular/forms";
import { MaskPipe } from 'mask-directive';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';


import { Client, ClientFilters, ClientListResponse, PaginationInfo } from '../../../models/clients/clients';
import { ActionMenuComponent, ActionMenuItem } from '../../../shared/components/atoms/action-menu/action-menu.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { GeneralModalContentComponent } from '../../../shared/components/general/general-modal-content/general-modal-content.component';
import { DsListViewComponent } from '../../../shared/components/molecules/list-view/list-view.component';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { ClientService } from '../../../shared/services/clients/clients.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler/error-handler.service';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { ErrorHandlerUtil } from '../../../shared/utils/error-handler.util';
import { FormValidator } from '../../../shared/utils/form';
import { ClientModalComponent } from "./client-modal/client-modal.component";

@Component({
  selector: 'app-clients',
  imports: [
    CommonModule,
    ActionMenuComponent,
    ButtonComponent,
    IconComponent,
    ReactiveFormsModule,
    InputComponent,
    FormsModule,
    GeneralModalContentComponent,
    DsListViewComponent,
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
  private errorHandlerService = inject(ErrorHandlerService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);


  cnpjMask: string = '00.000.000/0000-00';
  phoneMask: string = '(00) 0000-0000||(00) 00000-0000';


  clients: Client[] = [];
  pagination: PaginationInfo | null = null;
  loading = false;


  actionMenuItems: ActionMenuItem[] = [
    {
      label: 'Editar',
      value: 'edit',
      icon: 'fa-solid fa-edit'
    },
    {
      label: 'Excluir',
      value: 'delete',
      icon: 'fa-solid fa-trash'
    }
  ];


  listViewConfig = {
    itemsPerRow: 3,
    showToggle: true,
    defaultView: 'table' as 'table' | 'cards'
  };


  formatCurrency(value: number): string {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  deleteClient(client: Client): void {
    if (!client._id) {
      return;
    }

    this.modalService.open({
      id: 'general-modal',
      title: 'Excluir Cliente',
      size: 'md',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      data: {
        text: `Tem certeza que deseja excluir o cliente "${client.companyName}"?`,
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
        this.clientService.deleteClient(client._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastService.success('Cliente excluído com sucesso!', 'Sucesso');
              this.loadClients(); // Recarregar lista
            },
            error: (error) => {
              ErrorHandlerUtil.handleSubscriptionError(
                error,
                this.errorHandlerService,
                this.toastService,
                'Exclusão de cliente'
              );
            }
          });
      }
    });
  }
  shouldShowTable = false;


  errorMessage: string = '';
  showError = false;


  currentFilters: ClientFilters = {
    search: '',
    page: 1,
    limit: 10,
    active: true
  };


  selectedClientId?: string;


  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();


  constructor() {
    super();
    this.setupSearchDebounce();


    effect(() => {
      const modalInstance = this.modalService.modals().find(m => m.id === 'client-modal');
      this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }


  /**
   * 📋 LISTAR - Carrega lista de clientes da API
   */
  private loadClients(filters: ClientFilters = this.currentFilters): void {

    this.loading = true;
    this.shouldShowTable = true;

    this.clearError();
    this.currentFilters = { ...this.currentFilters, ...filters };

    this.clientService.getClients(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ClientListResponse) => {

          if (response.success && response.data) {
            this.clients = response.data;
            this.pagination = response.pagination;

          } else {
            this.clients = [];
            this.showErrorMessage('Nenhum dado foi retornado da API.');
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.showErrorMessage(error.message || 'Erro ao carregar clientes.');
        }
      });
  }

  /**
   * ➕ CRIAR - Abre modal para criar novo cliente
   */
  createClient(): void {
    this.toastService.info('Abrindo formulário para novo cliente...', 'Informação');

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


  /**
   * 🔍 BUSCA - Dispara busca quando usuário digita
   */
  onSearchChange(): void {
    if (!this.currentFilters.search) return;
    this.searchSubject.next(this.currentFilters.search.trim());
  }

  /**
   * 🎯 PERFORM SEARCH - Executa a busca de fato
   */
  private performSearch(searchTerm: string): void {

    const searchFilters: ClientFilters = {
      ...this.currentFilters,
      search: searchTerm || undefined,
      page: 1 // Resetar para primeira página
    };

    this.loadClients(searchFilters);
  }


  /**
   * 📄 PAGINAÇÃO - Navegar entre páginas
   */
  onPageChange(page: number): void {
    if (page !== this.currentFilters.page) {
      this.loadClients({ ...this.currentFilters, page });
    }
  }

  clearFilters(): void {
    this.currentFilters = {
      search: '',
      page: 1,
      limit: 10
    };
    this.loadClients();
  }

  hasActiveFilters(): boolean {
    return !!(this.currentFilters.search && this.currentFilters.search.trim());
  }


  /**
   * 🏁 MODAL RESULT - Processa resultado do modal
   */
  private handleModalResult(result: any): void {
    if (result && result.action) {
      if (result.action === 'created') {
        this.loadClients(); // Recarregar lista

      } else if (result.action === 'updated') {
        this.loadClients(); // Recarregar lista

      }
    }


    this.selectedClientId = undefined;
  }

  /**
   * 🚪 MODAL CLOSED - Callback para quando modal é fechado
   */
  onModalClosed(result: any): void {
    this.handleModalResult(result);
  }


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


    setTimeout(() => {
      this.clearError();
    }, 5000);
  }


  /**
   * 📊 GET SHOULD SHOW SPINNER - Mostra spinner quando necessário
   */
  get shouldShowSpinner(): boolean {
    return this.loading;
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

  /**
   * 🎯 ON ACTION MENU SELECT - Manipula seleção do menu de ações
   */
  onActionMenuSelect(client: Client, item: ActionMenuItem): void {
    switch (item.value) {
      case 'edit':
        this.editClient(client);
        break;
      case 'delete':
        this.deleteClient(client);
        break;
      default:
    }
  }
}
