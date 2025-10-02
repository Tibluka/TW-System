/**
 * 📦 MODELO DE DADOS - FICHAS DE ENTREGA
 * 
 * Interfaces e tipos para gerenciamento de fichas de entrega
 */

export interface DeliverySheet {
    _id: string;
    internalReference: string;
    productionSheetId: string;
    productionSheet?: any; // Populated automaticamente pelo backend
    clientId: string;
    client?: any; // Populated automaticamente pelo backend
    deliveryDate: Date | string;
    address: DeliveryAddress;
    notes?: string;
    status: DeliverySheetStatus;
    totalValue: number;
    invoiceNumber?: string; // Nota fiscal (em inglês)
    active?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface DeliveryAddress {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
    neighborhood?: string;
}

export type DeliverySheetStatus = 'CREATED' | 'ON_ROUTE' | 'DELIVERED';

export interface CreateDeliverySheetRequest {
    internalReference: string;
    totalValue: number;
    notes?: string;
    invoiceNumber?: string;
    address: DeliveryAddress;
    deliveryDate?: Date | string;
}

export interface UpdateDeliverySheetRequest extends Partial<CreateDeliverySheetRequest> {
    status?: DeliverySheetStatus;
}

export interface DeliverySheetFilters {
    search?: string;
    productionSheetId?: string;
    clientId?: string;
    status?: DeliverySheetStatus;
    active?: boolean;
    deliveryDateFrom?: Date | string;
    deliveryDateTo?: Date | string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DeliverySheetListResponse {
    success: boolean;
    data: DeliverySheet[];
    pagination?: PaginationInfo;
    message?: string;
}

export interface DeliverySheetResponse {
    success: boolean;
    data?: DeliverySheet;
    message?: string;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * 🏷️ LABELS E TRADUÇÕES
 */
export const DELIVERY_SHEET_STATUS_LABELS: Record<DeliverySheetStatus, string> = {
    'CREATED': 'Criada',
    'ON_ROUTE': 'Em Rota',
    'DELIVERED': 'Entregue'
};

/**
 * 🎨 CORES DOS STATUS
 */
export const DELIVERY_SHEET_STATUS_COLORS: Record<DeliverySheetStatus, string> = {
    'CREATED': 'info',
    'ON_ROUTE': 'warning',
    'DELIVERED': 'success'
};

/**
 * 📋 OPÇÕES DE STATUS PARA SELECT
 */
export interface DeliverySheetStatusOption {
    value: DeliverySheetStatus;
    label: string;
    color: string;
}

export const DELIVERY_SHEET_STATUS_OPTIONS: DeliverySheetStatusOption[] = [
    { value: 'CREATED', label: 'Criada', color: 'info' },
    { value: 'ON_ROUTE', label: 'Em Rota', color: 'warning' },
    { value: 'DELIVERED', label: 'Entregue', color: 'success' }
];

/**
 * 🔧 UTILITÁRIOS
 */
export class DeliverySheetUtils {

    /**
     * 🏷️ LABEL STATUS - Retorna label amigável para status
     */
    static getStatusLabel(status: DeliverySheetStatus): string {
        return DELIVERY_SHEET_STATUS_LABELS[status] || status;
    }

    /**
     * 🎨 COR STATUS - Retorna cor do status
     */
    static getStatusColor(status: DeliverySheetStatus): string {
        return DELIVERY_SHEET_STATUS_COLORS[status] || 'neutral';
    }

    /**
     * 📅 FORMATAR DATA - Formata data para exibição
     */
    static formatDate(date: Date | string | undefined): string {
        if (!date) return '-';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleDateString('pt-BR', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return '-';
        }
    }

    /**
     * ⏰ FORMATAR DATA E HORA - Formata data e hora para exibição
     */
    static formatDateTime(date: Date | string | undefined): string {
        if (!date) return '-';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleString('pt-BR', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    }

    /**
     * ✅ VERIFICAR SE É FINALIZADO - Verifica se o status é finalizado
     */
    static isFinished(status: DeliverySheetStatus): boolean {
        return status === 'DELIVERED';
    }

    /**
     * 🔄 PRÓXIMO STATUS - Retorna o próximo status na sequência
     */
    static getNextStatus(currentStatus: DeliverySheetStatus): DeliverySheetStatus | null {
        const statusSequence: DeliverySheetStatus[] = ['CREATED', 'ON_ROUTE', 'DELIVERED'];
        const currentIndex = statusSequence.indexOf(currentStatus);

        if (currentIndex === -1 || currentIndex === statusSequence.length - 1) {
            return null;
        }

        return statusSequence[currentIndex + 1];
    }
}
