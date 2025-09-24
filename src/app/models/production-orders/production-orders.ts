// models/production-orders/production-orders.ts

import { Development, ProductionType, ProductionTypeEnum } from '../developments/developments';

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

// Reexportar para compatibilidade
export type { ProductionTypeEnum } from '../developments/developments';

// ============================================
// INTERFACES DE PRODUCTION TYPE
// ============================================

export interface SizeItem {
    size: string;
    value: number;
}

// ✅ ATUALIZADA - Agora usa a nova estrutura ProductionType
export interface ProductionTypeWithQuantities extends ProductionType {
    // Herda toda a estrutura de ProductionType
    // Não precisa redefinir nada, apenas usar a estrutura existente
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
    productionType: ProductionType; // ✅ MUDANÇA: Usa ProductionType diretamente
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
    productionType: ProductionType; // ✅ MUDANÇA: Usa ProductionType
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

    // ✅ ATUALIZADA - Trabalha com nova estrutura
    static getTotalQuantity(productionType: ProductionType): string {
        if (productionType.type === 'rotary' && productionType.meters) {
            return `${productionType.meters}m`;
        }

        if (productionType.type === 'localized' && productionType.additionalInfo?.sizes) {
            const total = productionType.additionalInfo.sizes.reduce((sum, item) => sum + item.value, 0);
            return `${total} pç${total !== 1 ? 's' : ''}`;
        }

        return '0';
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

    // ✅ ATUALIZADA - Trabalha com nova estrutura
    static initializeFromDevelopment(development: Development): Partial<CreateProductionOrderRequest> {
        return {
            developmentId: development._id!,
            productionType: {
                type: development.productionType.type,
                meters: development.productionType.type === 'rotary' ? development.productionType.meters || 0 : undefined,
                additionalInfo: development.productionType.type === 'localized' ? {
                    variant: development.productionType.additionalInfo?.variant || '',
                    sizes: development.productionType.additionalInfo?.sizes || []
                } : undefined
            }
        };
    }

    // ✅ NOVA FUNÇÃO - Constrói ProductionType a partir de dados do form
    static buildProductionTypeFromForm(
        type: ProductionTypeEnum,
        meters?: number,
        variant?: string,
        sizes?: SizeItem[]
    ): ProductionType {
        const productionType: ProductionType = { type };

        if (type === 'rotary') {
            productionType.meters = meters;
        }

        if (type === 'localized') {
            productionType.additionalInfo = {
                variant: variant || '',
                sizes: sizes || []
            };
        }

        return productionType;
    }

    // ✅ ATUALIZADA - Trabalha com nova estrutura
    static calculateTotalPieces(productionType: ProductionType): number {
        if (productionType.type === 'localized' && productionType.additionalInfo?.sizes) {
            return productionType.additionalInfo.sizes.reduce((sum, item) => sum + (item.value || 0), 0);
        }
        return 0;
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

    // ✅ NOVA FUNÇÃO - Extrai variant do productionType
    static getVariant(productionType: ProductionType): string {
        return productionType.additionalInfo?.variant || '';
    }

    // ✅ NOVA FUNÇÃO - Extrai sizes do productionType
    static getSizes(productionType: ProductionType): SizeItem[] {
        return productionType.additionalInfo?.sizes || [];
    }

    // ✅ NOVA FUNÇÃO - Verifica se tem informações adicionais
    static hasAdditionalInfo(productionType: ProductionType): boolean {
        return !!productionType.additionalInfo;
    }
}