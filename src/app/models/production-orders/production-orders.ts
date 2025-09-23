// models/production-orders/production-orders.ts

import { Development } from '../developments/developments';

// ============================================
// TYPES E ENUMS
// ============================================

export type ProductionOrderStatus =
    | 'CREATED'
    | 'PILOT_PRODUCTION'
    | 'PILOT_SENT'
    | 'PILOT_APPROVED'
    | 'PRODUCTION_STARTED'
    | 'FINALIZED';

export type ProductionOrderPriority = 'green' | 'yellow' | 'red';

// ============================================
// INTERFACE PRINCIPAL
// ============================================

export interface ProductionOrder {
    _id?: string;

    // DEVELOPMENT REFERENCE
    developmentId: string;
    development?: Development; // Populado via virtual

    // DADOS COPIADOS
    internalReference?: string;

    // STATUS DA ORDEM DE PRODUÇÃO
    status: ProductionOrderStatus;

    // DADOS ESPECÍFICOS DA PRODUÇÃO
    fabricType: string;
    pilot: boolean;
    observations?: string;
    priority: ProductionOrderPriority;

    // METADADOS
    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// ============================================
// REQUEST INTERFACES
// ============================================

export interface CreateProductionOrderRequest {
    developmentId: string;
    fabricType: string;
    pilot?: boolean;
    observations?: string;
    priority?: ProductionOrderPriority;
}

export interface UpdateProductionOrderRequest extends Partial<CreateProductionOrderRequest> {
    status?: ProductionOrderStatus;
}

// ============================================
// FILTER INTERFACE
// ============================================

export interface ProductionOrderFilters {
    search?: string; // Busca em internalReference, fabricType, observations
    developmentId?: string;
    status?: ProductionOrderStatus;
    priority?: ProductionOrderPriority;
    pilot?: boolean;
    active?: boolean;

    // Filtros por data
    createdFrom?: Date | string;
    createdTo?: Date | string;

    // Paginação
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface ProductionOrderListResponse {
    data: ProductionOrder[];
    pagination?: PaginationInfo;
    message?: string;
}

export interface ProductionOrderResponse {
    data: ProductionOrder;
    message?: string;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// ============================================
// HELPERS E UTILITÁRIOS
// ============================================

export class ProductionOrderUtils {

    /**
     * 🏷️ Retorna label amigável para status
     */
    static getStatusLabel(status: ProductionOrderStatus): string {
        const labels: Record<ProductionOrderStatus, string> = {
            'CREATED': 'Criado',
            'PILOT_PRODUCTION': 'Produção Piloto',
            'PILOT_SENT': 'Piloto Enviado',
            'PILOT_APPROVED': 'Piloto Aprovado',
            'PRODUCTION_STARTED': 'Produção Iniciada',
            'FINALIZED': 'Finalizado'
        };

        return labels[status] || status;
    }

    /**
     * 🎨 Retorna classe CSS para status
     */
    static getStatusClass(status: ProductionOrderStatus): string {
        return `status-${status.toLowerCase().replace('_', '-')}`;
    }

    /**
     * 🚨 Retorna label amigável para prioridade
     */
    static getPriorityLabel(priority: ProductionOrderPriority): string {
        const labels: Record<ProductionOrderPriority, string> = {
            'green': 'Normal',
            'yellow': 'Média',
            'red': 'Alta'
        };

        return labels[priority] || priority;
    }

    /**
     * 🎯 Retorna classe CSS para prioridade
     */
    static getPriorityClass(priority: ProductionOrderPriority): string {
        return `priority-${priority}`;
    }

    /**
     * 🧪 Retorna texto para tipo piloto
     */
    static getPilotText(pilot: boolean): string {
        return pilot ? 'Sim' : 'Não';
    }

    /**
     * 📅 Formata data para exibição
     */
    static formatDate(date: Date | string | undefined): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    }

    /**
     * ✅ Verifica se pode editar ordem de produção
     */
    static canEdit(status: ProductionOrderStatus): boolean {
        return ['CREATED', 'PILOT_PRODUCTION'].includes(status);
    }

    /**
     * 🏁 Verifica se ordem está finalizada
     */
    static isFinalized(status: ProductionOrderStatus): boolean {
        return status === 'FINALIZED';
    }
}