import { CommonModule } from '@angular/common';
import { Component, effect, inject, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, lastValueFrom, takeUntil } from 'rxjs';
import { PaginationInfo } from '../../../models/delivery-sheets/delivery-sheets';
import { DeliverySheet, DeliverySheetFilters, DeliverySheetStatus } from '../../../models/delivery-sheets/delivery-sheets';
import { ActionMenuComponent, ActionMenuItem } from '../../../shared/components/atoms/action-menu/action-menu.component';
import { BadgeComponent } from '../../../shared/components/atoms/badge/badge.component';
import { DsListViewComponent, ViewMode } from '../../../shared/components/molecules/list-view/list-view.component';
import { StatusUpdaterComponent, StatusOption } from '../../../shared/components/molecules/status-updater/status-updater.component';
import { TableComponent } from '../../../shared/components/organisms/table/table.component';
import { ListViewConfig } from '../../../models/list-view/list-view';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../shared/components/atoms/icon/icon.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/atoms/select/select.component';
import { ModalComponent } from '../../../shared/components/organisms/modal/modal.component';
import { TableCellComponent } from '../../../shared/components/organisms/table/table-cell/table-cell.component';
import { TableRowComponent } from '../../../shared/components/organisms/table/table-row/table-row.component';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { DeliverySheetsService } from '../../../shared/services/delivery-sheets/delivery-sheets.service';
import { ClientService } from '../../../shared/services/clients/clients.service';
import { FormValidator } from '../../../shared/utils/form';
import { DeliverySheetModalComponent } from './delivery-sheet-modal/delivery-sheet-modal.component';
import { copyToClipboard } from '../../../shared/utils/tools';
import { DateFormatter } from '../../../shared/utils/date-formatter';

@Component({
    selector: 'app-delivery-sheets',
    imports: [
        CommonModule,
        InputComponent,
        SelectComponent,
        TableComponent,
        TableCellComponent,
        IconComponent,
        TableRowComponent,
        ButtonComponent,
        BadgeComponent,
        DsListViewComponent,
        FormsModule,
        ModalComponent,
        DeliverySheetModalComponent,
        ActionMenuComponent,
        StatusUpdaterComponent
    ],
    providers: [
        NgModel
    ],
    templateUrl: './delivery-sheets.component.html',
    styleUrl: './delivery-sheets.component.scss'
})
export class DeliverySheetsComponent extends FormValidator {
    private modalService = inject(ModalService);
    private deliverySheetsService = inject(DeliverySheetsService);
    private clientsService = inject(ClientService);


    deliverySheets: DeliverySheet[] = [];
    pagination: PaginationInfo | null = null;
    loading = false;
    isModalOpen = false;

    get shouldShowSpinner(): boolean {
        return this.loading;
    }
    selectedDeliverySheetId?: string;
    selectedDeliverySheetForStatusUpdate?: DeliverySheet;


    clients: any[] = [];


    successMessage: string = '';
    errorMessage: string = '';
    showError = false;

    currentFilters: DeliverySheetFilters = {
        search: undefined,
        status: undefined,
        clientId: undefined,
        page: 1,
        limit: 10,
        active: true,
        deliveryDateFrom: undefined,
        deliveryDateTo: undefined
    };

    statusOptions: SelectOption[] = [
        { value: undefined, label: 'Todos os Status' },
        { value: 'PENDING', label: 'Pendente' },
        { value: 'IN_TRANSIT', label: 'Em Trânsito' },
        { value: 'DELIVERED', label: 'Entregue' },
        { value: 'CANCELLED', label: 'Cancelado' }
    ];

    clientOptions: SelectOption[] = [
        { value: undefined, label: 'Todos os Clientes' }
    ];

    deliverySheetStatusOptions: StatusOption[] = [
        { value: 'CREATED', label: 'Criada', icon: 'fa-solid fa-plus', color: 'primary' },
        { value: 'ON_ROUTE', label: 'Em Rota', icon: 'fa-solid fa-truck', color: 'warning' },
        { value: 'DELIVERED', label: 'Entregue', icon: 'fa-solid fa-check-circle', color: 'success' }
    ];


    listViewConfig: ListViewConfig = {
        showToggle: true,
        defaultView: 'table',
        cardConfig: {
            minWidth: '350px',
            gap: '24px'
        }
    };


    actionMenuItems: ActionMenuItem[] = [
        { value: 'change-status', label: 'Alterar Status', icon: 'fa-solid fa-arrow-right' },
        { value: 'edit', label: 'Editar', icon: 'fa-solid fa-edit' },
        { value: 'copy-reference', label: 'Copiar Referência', icon: 'fa-solid fa-copy' },
        { value: 'delete', label: 'Excluir', icon: 'fa-solid fa-trash' }
    ];


    private searchSubject = new Subject<string>();
    private dateFilterSubject = new Subject<void>();
    private destroy$ = new Subject<void>();

    @ViewChild('statusUpdaterRef') statusUpdaterComponent?: StatusUpdaterComponent;

    constructor() {
        super();

        effect(() => {
            const modalInstance = this.modalService.modals().find(m => m.id === 'delivery-sheet-modal');
            this.isModalOpen = modalInstance ? modalInstance.isOpen : false;
        });
    }

    ngOnInit(): void {
        this.setupSearchDebounce();
        this.setupDateFilterDebounce();
        this.loadClients();
        this.loadDeliverySheets();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
                this.loadDeliverySheets();
            });
    }

    /**
     * 📅 SETUP DATE FILTER DEBOUNCE - Configura debounce para filtros de data
     */
    private setupDateFilterDebounce(): void {
        this.dateFilterSubject
            .pipe(
                debounceTime(500), // Debounce maior para filtros de data
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.currentFilters.page = 1; // Reset para primeira página
                this.loadDeliverySheets();
            });
    }

    /**
     * 📋 CARREGAR FICHAS DE ENTREGA - Carrega lista com filtros
     */
    async loadDeliverySheets(): Promise<void> {
        this.loading = true;
        this.showError = false;

        try {
            const response = await this.deliverySheetsService.getDeliverySheets(this.currentFilters).toPromise();

            if (response && response.success) {
                this.deliverySheets = response.data || [];
                this.pagination = response.pagination || null;
            } else {
                this.showErrorMessage('Erro ao carregar fichas de entrega.');
            }
        } catch (error: any) {
            this.showErrorMessage(error.message || 'Erro ao carregar fichas de entrega.');
        } finally {
            this.loading = false;
        }
    }

    /**
     * 👥 CARREGAR CLIENTES - Carrega clientes para o filtro
     */
    private async loadClients(): Promise<void> {
        try {
            const response = await lastValueFrom(this.clientsService.getClients({
                active: true,
                limit: 100
            }));

            if (response?.success) {
                this.clients = response.data || [];
                this.clientOptions = [
                    { value: undefined, label: 'Todos os Clientes' },
                    ...this.clients.map(client => ({
                        value: client._id,
                        label: client.companyName
                    }))
                ];
            }
        } catch (error) {
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
        this.loadDeliverySheets();
    }

    /**
     * 👤 FILTRO CLIENTE - Evento de mudança no filtro de cliente
     */
    onClientFilterChange(): void {
        this.currentFilters.page = 1; // Reset para primeira página
        this.loadDeliverySheets();
    }

    /**
     * 📅 FILTRO DATA - Evento de mudança nos filtros de data
     */
    onDateFilterChange(): void {
        this.dateFilterSubject.next();
    }

    /**
     * 👆 CLICK NA FICHA - Abre modal para editar ficha
     */
    onDeliverySheetClick(deliverySheet: DeliverySheet): void {
        if (!deliverySheet._id) return;

        this.selectedDeliverySheetId = deliverySheet._id;
        this.modalService.open({
            id: 'delivery-sheet-modal',
            title: `Editar Ficha de Entrega - ${deliverySheet.internalReference}`,
            size: 'xl',
            data: deliverySheet
        }).subscribe(result => {
            this.handleModalResult(result);
        });
    }

    /**
     * ➕ CRIAR FICHA - Abre modal para criar nova ficha
     */
    createDeliverySheet(): void {
        this.selectedDeliverySheetId = undefined;
        this.modalService.open({
            id: 'delivery-sheet-modal',
            title: 'Nova Ficha de Entrega',
            size: 'xl',
            data: {
                mode: 'create'
            }
        }).subscribe(result => {
            this.handleModalResult(result);
        });
    }

    /**
     * 🎭 MODAL CLOSED - Evento quando modal é fechado
     */
    onModalClosed(result: any): void {
        this.handleModalResult(result);
    }

    /**
     * 🔄 HANDLE MODAL RESULT - Processa resultado do modal
     */
    private handleModalResult(result: any): void {
        if (result && result.action) {
            if (result.action === 'created') {
                this.loadDeliverySheets(); // Recarregar lista

            } else if (result.action === 'updated') {
                this.loadDeliverySheets(); // Recarregar lista

            } else if (result.action === 'status-updated') {
                this.loadDeliverySheets(); // Recarrega
            }
        }

        this.selectedDeliverySheetId = undefined;
    }

    /**
     * 📅 FORMATAR DATA - Formata data para exibição
     */
    formatDate(date: Date | string | undefined): string {
        return DateFormatter.formatDate(date);
    }

    /**
     * ⏰ FORMATAR DATA E HORA - Formata data e hora para exibição
     */
    formatDateTime(date: Date | string | undefined): string {
        return DateFormatter.formatDateTime(date);
    }

    /**
     * 🎯 LABEL STATUS - Retorna label amigável para status
     */
    getStatusLabel(status: DeliverySheetStatus): string {
        return this.deliverySheetsService.getStatusLabel(status);
    }

    /**
     * 🎨 COR STATUS - Retorna cor do status
     */
    getStatusColor(status: DeliverySheetStatus): string {
        return this.deliverySheetsService.getStatusColor(status);
    }

    /**
     * 📄 PÁGINA ANTERIOR - Navega para página anterior
     */
    previousPage(): void {
        if (this.pagination && this.pagination.currentPage > 1) {
            this.currentFilters.page = this.pagination.currentPage - 1;
            this.loadDeliverySheets();
        }
    }

    /**
     * 📄 PRÓXIMA PÁGINA - Navega para próxima página
     */
    nextPage(): void {
        if (this.pagination && this.pagination.currentPage < this.pagination.totalPages) {
            this.currentFilters.page = this.pagination.currentPage + 1;
            this.loadDeliverySheets();
        }
    }

    /**
     * 📄 IR PARA PÁGINA - Navega para página específica
     */
    goToPage(page: number): void {
        if (this.pagination && page >= 1 && page <= this.pagination.totalPages) {
            this.currentFilters.page = page;
            this.loadDeliverySheets();
        }
    }

    /**
     * 📄 MUDANÇA DE PÁGINA - Evento do componente de tabela
     */
    onPageChange(page: number): void {
        this.currentFilters.page = page;
        this.loadDeliverySheets();
    }

    /**
     * 🧹 LIMPAR FILTROS - Limpa todos os filtros aplicados
     */
    clearFilters(): void {
        this.currentFilters = {
            search: undefined,
            status: undefined,
            clientId: undefined,
            page: 1,
            limit: 10,
            active: true,
            deliveryDateFrom: undefined,
            deliveryDateTo: undefined
        };
        this.loadDeliverySheets();
    }

    hasActiveFilters(): boolean {
        return !!(
            this.currentFilters.search ||
            this.currentFilters.status ||
            this.currentFilters.clientId ||
            this.currentFilters.deliveryDateFrom ||
            this.currentFilters.deliveryDateTo ||
            this.currentFilters.active === false
        );
    }

    /**
     * 🎯 MENU DE AÇÕES - Processa ação selecionada no menu
     */
    onActionMenuSelect(deliverySheet: DeliverySheet, action: ActionMenuItem): void {
        switch (action.value) {
            case 'change-status':
                this.changeDeliverySheetStatus(deliverySheet);
                break;
            case 'edit':
                this.onDeliverySheetClick(deliverySheet);
                break;
            case 'delete':
                this.deleteDeliverySheet(deliverySheet);
                break;
            case 'copy-reference':
                this.copyReference(deliverySheet);
                break;
        }
    }

    /**
     * 🔄 MUDAR STATUS - Abre seletor de status
     */
    changeDeliverySheetStatus(deliverySheet: DeliverySheet): void {
        this.selectedDeliverySheetForStatusUpdate = deliverySheet;

        setTimeout(() => {
            if (this.statusUpdaterComponent) {
                this.statusUpdaterComponent.openStatusModal();
            }
        }, 0);
    }

    /**
     * ✅ STATUS ATUALIZADO - Callback quando status é atualizado
     */
    onStatusUpdated(result: any): void {
        if (result.success) {
            this.showSuccessMessage(result.message);
            this.loadDeliverySheets(); // Recarregar lista
        }
    }

    /**
     * ❌ STATUS UPDATE FALHOU - Callback quando atualização falha
     */
    onStatusUpdateFailed(result: any): void {
        this.showErrorMessage(result.error || 'Erro ao atualizar status');
    }

    /**
     * 🧹 LIMPAR SELEÇÃO STATUS - Limpa seleção de status
     */
    clearStatusUpdateSelection(): void {
        this.selectedDeliverySheetForStatusUpdate = undefined;
    }

    /**
     * 📋 COPIAR REFERÊNCIA - Copia referência interna para clipboard
     */
    copyReference(deliverySheet: DeliverySheet): void {
        if (deliverySheet.internalReference) {
            copyToClipboard(deliverySheet.internalReference);
            this.showSuccessMessage('Referência copiada para a área de transferência!');
        }
    }

    /**
     * 🗑️ EXCLUIR FICHA - Exclui ficha de entrega
     */
    deleteDeliverySheet(deliverySheet: DeliverySheet): void {
        if (!deliverySheet._id) return;

        this.modalService.open({
            id: 'general-modal',
            title: 'Confirmar Exclusão',
            size: 'md',
            data: {
                message: `Tem certeza que deseja excluir a ficha de entrega ${deliverySheet.internalReference}?`,
                confirmText: 'Excluir',
                cancelText: 'Cancelar',
                type: 'warning',
                onConfirm: () => {
                    this.deliverySheetsService.deleteDeliverySheet(deliverySheet._id!).subscribe({
                        next: () => {
                            this.showSuccessMessage(`Ficha de entrega ${deliverySheet.internalReference} excluída com sucesso.`);
                            this.loadDeliverySheets(); // Recarregar lista
                        },
                        error: (error) => {
                            this.showErrorMessage(error.message || 'Erro ao excluir ficha de entrega.');
                        }
                    });
                }
            }
        });
    }

    /**
     * ✅ MOSTRAR MENSAGEM DE SUCESSO
     */
    private showSuccessMessage(message: string): void {
        this.successMessage = message;
        this.showError = false;
        setTimeout(() => {
            this.successMessage = '';
        }, 5000);
    }

    /**
     * ❌ MOSTRAR MENSAGEM DE ERRO
     */
    private showErrorMessage(message: string): void {
        this.errorMessage = message;
        this.showError = true;
        setTimeout(() => {
            this.showError = false;
            this.errorMessage = '';
        }, 5000);
    }

    /**
     * 💰 FORMATAR MOEDA - Formata valor para exibição em reais
     */
    formatCurrency(value: number | undefined): string {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }


    copy(event: MouseEvent, internalReference: string): void {
        copyToClipboard(internalReference, event);
    }

}
