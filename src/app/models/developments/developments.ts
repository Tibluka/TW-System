// models/developments/developments.ts

import { Client } from '../clients/clients';

// ============================================
// TYPES E ENUMS
// ============================================

export type DevelopmentStatus =
    | 'draft'
    | 'planning'
    | 'in_progress'
    | 'testing'
    | 'completed'
    | 'cancelled'
    | 'on_hold';

// ============================================
// INTERFACE PRINCIPAL
// ============================================

export interface Development {
    _id?: string;
    name: string;
    description?: string;
    client?: Client; // Pode vir populado da API
    clientId: string; // ID de referência
    status: DevelopmentStatus;
    progress?: number; // 0-100%
    startDate: Date | string;
    expectedEndDate?: Date | string;
    actualEndDate?: Date | string;
    totalValue?: number;
    paidValue?: number;
    technologies?: string; // Lista de tecnologias como string
    observations?: string;

    // Metadados
    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy?: string;
    updatedBy?: string;
}

// ============================================
// REQUEST INTERFACES
// ============================================

export interface CreateDevelopmentRequest {
    name: string;
    description?: string;
    clientId: string;
    status: DevelopmentStatus;
    progress?: number;
    startDate: Date;
    expectedEndDate?: Date;
    totalValue?: number;
    paidValue?: number;
    technologies?: string;
    observations?: string;
}

export interface UpdateDevelopmentRequest extends Partial<CreateDevelopmentRequest> {
    actualEndDate?: Date;
}

// ============================================
// FILTER INTERFACE
// ============================================

export interface DevelopmentFilters {
    search?: string;
    clientId?: string;
    status?: DevelopmentStatus;
    startDateFrom?: Date | string;
    startDateTo?: Date | string;
    expectedEndDateFrom?: Date | string;
    expectedEndDateTo?: Date | string;
    active?: boolean;

    // Paginação
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface DevelopmentListResponse {
    data: Development[];
    pagination?: PaginationInfo;
    message?: string;
}

export interface DevelopmentResponse {
    data: Development;
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

export class DevelopmentUtils {

    /**
     * 🏷️ Retorna label amigável para status
     */
    static getStatusLabel(status: DevelopmentStatus): string {
        const labels: Record<DevelopmentStatus, string> = {
            'draft': 'Rascunho',
            'planning': 'Planejamento',
            'in_progress': 'Em Progresso',
            'testing': 'Teste',
            'completed': 'Concluído',
            'cancelled': 'Cancelado',
            'on_hold': 'Pausado'
        };

        return labels[status] || status;
    }

    /**
     * 🎨 Retorna classe CSS para status
     */
    static getStatusClass(status: DevelopmentStatus): string {
        return `status-${status}`;
    }

    /**
     * ⏰ Verifica se desenvolvimento está atrasado
     */
    static isOverdue(expectedEndDate: Date | string | undefined, status: DevelopmentStatus): boolean {
        if (!expectedEndDate || status === 'completed' || status === 'cancelled') {
            return false;
        }

        const targetDate = new Date(expectedEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return targetDate < today;
    }

    /**
     * 💰 Calcula valor restante a ser pago
     */
    static getRemainingValue(totalValue?: number, paidValue?: number): number {
        if (!totalValue) return 0;
        return totalValue - (paidValue || 0);
    }

    /**
     * 📊 Calcula percentual pago
     */
    static getPaymentPercentage(totalValue?: number, paidValue?: number): number {
        if (!totalValue || totalValue === 0) return 0;
        return Math.round((paidValue || 0) / totalValue * 100);
    }

    /**
     * 📅 Calcula dias restantes até deadline
     */
    static getDaysUntilDeadline(expectedEndDate: Date | string | undefined): number | null {
        if (!expectedEndDate) return null;

        const targetDate = new Date(expectedEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * 🔍 Valida se desenvolvimento pode mudar para determinado status
     */
    static canChangeToStatus(currentStatus: DevelopmentStatus, newStatus: DevelopmentStatus): boolean {
        // Regras de transição de status
        const allowedTransitions: Record<DevelopmentStatus, DevelopmentStatus[]> = {
            'draft': ['planning', 'cancelled'],
            'planning': ['in_progress', 'on_hold', 'cancelled'],
            'in_progress': ['testing', 'completed', 'on_hold', 'cancelled'],
            'testing': ['in_progress', 'completed', 'cancelled'],
            'completed': [], // Não pode sair de completed
            'cancelled': ['draft', 'planning'], // Pode reativar
            'on_hold': ['in_progress', 'cancelled']
        };

        return allowedTransitions[currentStatus]?.includes(newStatus) || false;
    }
}