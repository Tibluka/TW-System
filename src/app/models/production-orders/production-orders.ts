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

export type ProductionTypeEnum = 'rotary' | 'localized';

// ============================================
// INTERFACES DE PRODUCTION TYPE
// ============================================

export interface SizeItem {
    size: string;
    value: number;
}

export interface ProductionTypeWithQuantities {
    type: ProductionTypeEnum;
    meters?: number;
    sizes?: SizeItem[];
}

// ============================================
// INTERFACE PRINCIPAL
// ============================================

export interface ProductionOrder {
    _id?: string;

    // DEVELOPMENT REFERENCE
    developmentId: string;
    development?: Development;

    // DADOS COPIADOS
    internalReference?: string;

    // STATUS DA ORDEM DE PRODUÇÃO
    status: ProductionOrderStatus;

    // DADOS ESPECÍFICOS DA PRODUÇÃO
    fabricType: string;
    productionType: ProductionTypeWithQuantities;
    observations?: string;

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
    productionType: ProductionTypeWithQuantities;
    observations?: string;
}

export interface UpdateProductionOrderRequest extends Partial<CreateProductionOrderRequest> {
    status?: ProductionOrderStatus;
}

// ============================================
// FILTER INTERFACE
// ============================================

export interface ProductionOrderFilters {
    search?: string;
    developmentId?: string;
    status?: ProductionOrderStatus;
    productionType?: ProductionTypeEnum;
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

    static getStatusClass(status: ProductionOrderStatus): string {
        return `status-${status.toLowerCase().replace('_', '-')}`;
    }

    static getProductionTypeLabel(type: ProductionTypeEnum): string {
        const labels: Record<ProductionTypeEnum, string> = {
            'rotary': 'Rotativa',
            'localized': 'Localizada'
        };

        return labels[type] || type;
    }

    static getTotalQuantity(productionType: ProductionTypeWithQuantities): string {
        if (productionType.type === 'rotary' && productionType.meters) {
            return `${productionType.meters}m`;
        }

        if (productionType.type === 'localized' && productionType.sizes) {
            const total = productionType.sizes.reduce((sum, item) => sum + item.value, 0);
            return `${total} peças`;
        }

        return '0';
    }

    static getQuantityBreakdown(productionType: ProductionTypeWithQuantities): string {
        if (productionType.type === 'rotary' && productionType.meters) {
            return `${productionType.meters} metros`;
        }

        if (productionType.type === 'localized' && productionType.sizes) {
            const totalPieces = productionType.sizes.reduce((sum, item) => sum + item.value, 0);
            const breakdown = productionType.sizes.map(item => `${item.size}: ${item.value}`).join(', ');
            return `${totalPieces} peças (${breakdown})`;
        }

        return 'Não definido';
    }

    static getSizesBreakdown(sizes: SizeItem[]): string {
        if (!sizes || sizes.length === 0) return 'Nenhum tamanho definido';
        return sizes.map(item => `${item.size}: ${item.value}`).join(', ');
    }

    static validateProductionType(productionType: ProductionTypeWithQuantities): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!productionType.type) {
            errors.push('Tipo de produção é obrigatório');
            return { valid: false, errors };
        }

        if (productionType.type === 'rotary') {
            if (!productionType.meters || productionType.meters < 0.1) {
                errors.push('Quantidade de metros deve ser pelo menos 0.1 para produção rotativa');
            }
        }

        if (productionType.type === 'localized') {
            if (!productionType.sizes || productionType.sizes.length === 0) {
                errors.push('Pelo menos um tamanho é obrigatório para produção localizada');
            } else {
                for (let i = 0; i < productionType.sizes.length; i++) {
                    const sizeItem = productionType.sizes[i];
                    if (!sizeItem.size?.trim()) {
                        errors.push(`Nome do tamanho é obrigatório na posição ${i + 1}`);
                    }
                    if (!sizeItem.value || sizeItem.value < 1) {
                        errors.push(`Quantidade deve ser pelo menos 1 para "${sizeItem.size}"`);
                    }
                }

                const sizeNames = productionType.sizes.map(s => s.size.trim().toUpperCase());
                const uniqueNames = [...new Set(sizeNames)];
                if (sizeNames.length !== uniqueNames.length) {
                    errors.push('Nomes dos tamanhos devem ser únicos');
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    static canEdit(status: ProductionOrderStatus): boolean {
        return ['CREATED', 'PILOT_PRODUCTION'].includes(status);
    }

    static isFinalized(status: ProductionOrderStatus): boolean {
        return status === 'FINALIZED';
    }

    static formatDate(date: Date | string | undefined): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    }

    static getStatusBadge(status: ProductionOrderStatus): { label: string; class: string; color: string } {
        const badges: Record<ProductionOrderStatus, { label: string; class: string; color: string }> = {
            'CREATED': { label: 'Criado', class: 'status-created', color: 'blue' },
            'PILOT_PRODUCTION': { label: 'Piloto', class: 'status-pilot', color: 'yellow' },
            'PILOT_SENT': { label: 'Enviado', class: 'status-sent', color: 'orange' },
            'PILOT_APPROVED': { label: 'Aprovado', class: 'status-approved', color: 'green' },
            'PRODUCTION_STARTED': { label: 'Em Produção', class: 'status-production', color: 'purple' },
            'FINALIZED': { label: 'Finalizado', class: 'status-finalized', color: 'green' }
        };

        return badges[status] || { label: status, class: 'status-unknown', color: 'gray' };
    }

    static getProductionTypeBadge(type: ProductionTypeEnum): { label: string; class: string; color: string } {
        const badges: Record<ProductionTypeEnum, { label: string; class: string; color: string }> = {
            'rotary': { label: 'Rotativa', class: 'production-rotary', color: 'blue' },
            'localized': { label: 'Localizada', class: 'production-localized', color: 'purple' }
        };

        return badges[type] || { label: type, class: 'production-unknown', color: 'gray' };
    }
}

// ============================================
// FORM HELPERS
// ============================================

export class ProductionOrderFormUtils {

    static initializeFromDevelopment(development: Development): Partial<CreateProductionOrderRequest> {
        return {
            developmentId: development._id!,
            productionType: {
                type: development.productionType,
                meters: development.productionType === 'rotary' ? 0 : undefined,
                sizes: development.productionType === 'localized' ? [] : undefined
            }
        };
    }

    static buildProductionTypeFromForm(
        type: ProductionTypeEnum,
        meters?: number,
        sizes?: SizeItem[]
    ): ProductionTypeWithQuantities {
        return {
            type,
            meters: type === 'rotary' ? meters : undefined,
            sizes: type === 'localized' ? sizes || [] : undefined
        };
    }

    static calculateTotalPieces(sizes: SizeItem[]): number {
        return sizes.reduce((sum, item) => sum + (item.value || 0), 0);
    }

    static createEmptySize(): SizeItem {
        return { size: '', value: 0 };
    }

    static removeEmptySizes(sizes: SizeItem[]): SizeItem[] {
        return sizes.filter(item => item.size.trim() && item.value > 0);
    }

    static validateUniqueSize(sizes: SizeItem[], newSize: string, currentIndex: number): boolean {
        return !sizes.some((item, index) =>
            index !== currentIndex &&
            item.size.trim().toUpperCase() === newSize.trim().toUpperCase()
        );
    }
}