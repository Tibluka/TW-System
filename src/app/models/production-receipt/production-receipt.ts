

import { DeliverySheet } from '../delivery-sheets/delivery-sheets';


export type PaymentMethod =
    | 'CASH'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'BANK_TRANSFER'
    | 'PIX'
    | 'CHECK';

export type PaymentStatus = 'PENDING' | 'PAID';


export interface ProductionReceipt {
    _id: string;


    deliverySheetId: string;
    deliverySheet: DeliverySheet;


    internalReference: string;


    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;


    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;


    issueDate: Date | string;
    dueDate: Date | string;
    paymentDate?: Date | string;


    notes?: string;


    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}


export interface CreateProductionReceiptRequest {
    deliverySheetId: string;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    dueDate: Date | string;
    paymentStatus?: PaymentStatus;
    paidAmount?: number;
    notes?: string;
}

export interface UpdateProductionReceiptRequest extends Partial<CreateProductionReceiptRequest> {
    _id: string;
    paymentDate?: Date | string;
}


export interface ProductionReceiptFilters {
    search?: string; // Busca em internalReference e notes
    deliverySheetId?: string;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    active?: boolean;
    clientId?: string;

    createdFrom?: Date | string;
    createdTo?: Date | string;
    dueDateFrom?: Date | string;
    dueDateTo?: Date | string;


    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}


export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
}

export interface ProductionReceiptListResponse {
    data: ProductionReceipt[];
    pagination?: PaginationInfo;
    message?: string;
}

export interface ProductionReceiptResponse {
    data: ProductionReceipt;
    message?: string;
}


export interface PaymentMethodStats {
    count: number;
    totalAmount: number;
}

export interface PaymentStatusStats {
    count: number;
    totalAmount: number;
    paidAmount: number;
}

export interface ProductionReceiptStatistics {
    status: {
        total: number;
        totalAmount: number;
        paidAmount: number;
        PENDING: PaymentStatusStats;
        PAID: PaymentStatusStats;
    };
    paymentMethods: Record<PaymentMethod, PaymentMethodStats>;
    overdue: number;
}


export class ProductionReceiptUtils {

    static getPaymentStatusLabel(status: PaymentStatus): string {
        const statusMap: Record<PaymentStatus, string> = {
            'PENDING': 'Pendente',
            'PAID': 'Pago'
        };
        return statusMap[status] || status;
    }

    static getPaymentMethodLabel(method: PaymentMethod): string {
        const methodMap: Record<PaymentMethod, string> = {
            'CASH': 'Dinheiro',
            'CREDIT_CARD': 'Cartão de Crédito',
            'DEBIT_CARD': 'Cartão de Débito',
            'BANK_TRANSFER': 'Transferência Bancária',
            'PIX': 'PIX',
            'CHECK': 'Cheque'
        };
        return methodMap[method] || method;
    }

    static getPaymentStatusBadge(status: PaymentStatus): { label: string; class: string; color: string } {
        const badges: Record<PaymentStatus, { label: string; class: string; color: string }> = {
            'PENDING': { label: 'Pendente', class: 'status-pending', color: 'orange' },
            'PAID': { label: 'Pago', class: 'status-paid', color: 'green' }
        };
        return badges[status] || { label: status, class: 'status-unknown', color: 'gray' };
    }

    static isOverdue(receipt: ProductionReceipt): boolean {
        if (receipt.paymentStatus === 'PAID') return false;
        const dueDate = new Date(receipt.dueDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Fim do dia atual
        return dueDate < today;
    }

    static getDaysUntilDue(receipt: ProductionReceipt): number {
        if (receipt.paymentStatus === 'PAID') return 0;
        const dueDate = new Date(receipt.dueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    static formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    static getRemainingAmount(receipt: ProductionReceipt): number {
        return receipt.totalAmount - receipt.paidAmount;
    }

    static getPaymentPercentage(receipt: ProductionReceipt): number {
        if (receipt.totalAmount === 0) return 0;
        return Math.round((receipt.paidAmount / receipt.totalAmount) * 100);
    }
}


export class ProductionReceiptFormUtils {

    static getPaymentMethodOptions(): Array<{ value: PaymentMethod; label: string }> {
        return [
            { value: 'CASH', label: 'Dinheiro' },
            { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
            { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
            { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
            { value: 'PIX', label: 'PIX' },
            { value: 'CHECK', label: 'Cheque' }
        ];
    }

    static getPaymentStatusOptions(): Array<{ value: PaymentStatus; label: string }> {
        return [
            { value: 'PENDING', label: 'Pendente' },
            { value: 'PAID', label: 'Pago' }
        ];
    }

    static initializeFromDeliverySheet(deliverySheet: DeliverySheet): Partial<CreateProductionReceiptRequest> {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // Vencimento padrão de 30 dias

        return {
            deliverySheetId: deliverySheet._id!,
            totalAmount: 0, // Deve ser preenchido pelo usuário
            dueDate: dueDate.toISOString().split('T')[0], // Format YYYY-MM-DD
            paymentMethod: 'PIX', // Método padrão
            paymentStatus: 'PENDING',
            paidAmount: 0
        };
    }

    static validateReceiptData(data: CreateProductionReceiptRequest): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.deliverySheetId) {
            errors.push('Ficha de entrega é obrigatória');
        }

        if (!data.totalAmount || data.totalAmount <= 0) {
            errors.push('Valor total deve ser maior que zero');
        }

        if (data.paidAmount && data.paidAmount > data.totalAmount) {
            errors.push('Valor pago não pode ser maior que o valor total');
        }

        if (!data.dueDate) {
            errors.push('Data de vencimento é obrigatória');
        }

        if (!data.paymentMethod) {
            errors.push('Método de pagamento é obrigatório');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
