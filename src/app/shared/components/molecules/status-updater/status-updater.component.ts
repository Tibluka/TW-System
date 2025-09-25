import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Componentes
import { ModalComponent } from '../../organisms/modal/modal.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

// Interfaces
export interface StatusOption {
    value: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    description?: string;
    color?: string;
}

export interface StatusUpdateResult {
    success: boolean;
    newStatus: string;
    message?: string;
    error?: string;
}

export type EntityType = 'development' | 'production-order' | 'production-sheet';

// Serviços
import { DevelopmentService } from '../../../services/development/development.service';
import { ProductionOrderService } from '../../../services/production-order/production-order.service';
import { ProductionSheetsService } from '../../../services/production-sheets/production-sheets.service';
import { ModalService } from '../../../services/modal/modal.service';
import { SelectComponent } from "../../atoms/select/select.component";
import { FormsModule, NgModel } from '@angular/forms';

@Component({
    selector: 'ds-status-updater',
    imports: [
        CommonModule,
        ModalComponent,
        ButtonComponent,
        IconComponent,
        SelectComponent,
        FormsModule
    ],
    providers: [
        NgModel
    ],

    templateUrl: './status-updater.component.html',
    styleUrl: './status-updater.component.scss'
})
export class StatusUpdaterComponent {

    // ============================================
    // INPUTS
    // ============================================

    @Input() entityType: EntityType = 'development';
    @Input() entityId: string = '';
    @Input() currentStatus: string = '';
    @Input() availableStatuses: StatusOption[] = [];
    @Input() entityReference?: string; // Para exibir no modal (ex: internalReference)
    @Input() disabled: boolean = false;

    // ============================================
    // OUTPUTS
    // ============================================

    @Output() statusUpdated = new EventEmitter<StatusUpdateResult>();
    @Output() statusUpdateFailed = new EventEmitter<StatusUpdateResult>();

    // ============================================
    // PROPRIEDADES
    // ============================================

    isModalOpen: boolean = false;
    selectedStatus: string = '';
    isLoading: boolean = false;
    errorMessage: string = '';

    // Serviços
    private developmentService = inject(DevelopmentService);
    private productionOrderService = inject(ProductionOrderService);
    private productionSheetsService = inject(ProductionSheetsService);
    private modalService = inject(ModalService);

    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================

    /**
     * 🚀 ABRIR MODAL - Abre o modal de atualização de status
     */
    openStatusModal(): void {
        if (this.disabled) return;

        this.selectedStatus = this.currentStatus;
        this.errorMessage = '';

        this.modalService.open({
            id: 'status-updater-modal',
            title: this.getModalTitle(),
            size: 'lg',
            showHeader: true,
            showCloseButton: true,
            closeOnBackdropClick: true,
            closeOnEscapeKey: true
        }).subscribe(result => {
            this.closeModal();
        });

        this.isModalOpen = true;
    }

    /**
     * ❌ FECHAR MODAL - Fecha o modal
     */
    closeModal(): void {
        this.modalService.close('status-updater-modal');
        this.isModalOpen = false;
        this.selectedStatus = '';
        this.errorMessage = '';
        this.isLoading = false;
    }

    /**
     * ✅ CONFIRMAR ATUALIZAÇÃO - Confirma e executa a atualização
     */
    async confirmUpdate(): Promise<void> {
        if (!this.selectedStatus || this.selectedStatus === this.currentStatus) {
            this.closeModal();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            const result = await this.updateEntityStatus(this.entityId, this.selectedStatus);

            this.statusUpdated.emit({
                success: true,
                newStatus: this.selectedStatus,
                message: `Status atualizado com sucesso para: ${this.getStatusLabel(this.selectedStatus)}`
            });

            this.closeModal();
        } catch (error: any) {
            const errorResult: StatusUpdateResult = {
                success: false,
                newStatus: this.currentStatus,
                error: error.message || 'Erro ao atualizar status'
            };

            this.errorMessage = errorResult.error || '';
            this.statusUpdateFailed.emit(errorResult);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 🏷️ LABEL DO STATUS - Retorna label amigável para o status
     */
    getStatusLabel(status: string): string {
        const option = this.availableStatuses.find(s => s.value === status);
        return option?.label || status;
    }

    /**
     * 🎨 COR DO STATUS - Retorna cor do status se definida
     */
    getStatusColor(status: string): string {
        const option = this.availableStatuses.find(s => s.value === status);
        return option?.color || 'primary';
    }

    /**
     * 🔍 STATUS SELECIONADO - Verifica se status está selecionado
     */
    isStatusSelected(status: string): boolean {
        return this.selectedStatus === status;
    }

    /**
     * 🚫 STATUS DESABILITADO - Verifica se status está desabilitado
     */
    isStatusDisabled(status: string): boolean {
        const option = this.availableStatuses.find(s => s.value === status);
        return option?.disabled || false;
    }

    /**
     * 🎯 SELECIONAR STATUS - Seleciona um status
     */
    selectStatus(status: string): void {
        if (!this.isStatusDisabled(status) && status !== this.currentStatus && !this.isLoading) {
            this.selectedStatus = status;
            this.errorMessage = '';
        }
    }

    /**
     * 🎨 ÍCONE DO STATUS - Retorna ícone do status se definido
     */
    getStatusIcon(status: string): string {
        const option = this.availableStatuses.find(s => s.value === status);
        return option?.icon || '';
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    /**
     * 🔄 ATUALIZAR STATUS DA ENTIDADE - Chama o serviço apropriado
     */
    private async updateEntityStatus(entityId: string, newStatus: string): Promise<any> {
        switch (this.entityType) {
            case 'development':
                return this.developmentService.updateDevelopmentStatus(entityId, newStatus).toPromise();

            case 'production-order':
                return this.productionOrderService.updateStatus(entityId, newStatus).toPromise();

            case 'production-sheet':
                // Para production-sheet, vamos usar um método genérico de atualização
                return this.productionSheetsService.updateProductionSheet(entityId, { stage: newStatus as any }).toPromise();

            default:
                throw new Error(`Tipo de entidade não suportado: ${this.entityType}`);
        }
    }

    /**
     * 🎯 TÍTULO DO MODAL - Retorna título baseado no tipo de entidade
     */
    getModalTitle(): string {
        const entityNames = {
            'development': 'Desenvolvimento',
            'production-order': 'Ordem de Produção',
            'production-sheet': 'Ficha de Produção'
        };

        const entityName = entityNames[this.entityType];
        const reference = this.entityReference ? ` - ${this.entityReference}` : '';

        return `Alterar Status do ${entityName}${reference}`;
    }
}
