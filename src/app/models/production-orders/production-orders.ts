

import { Development, ProductionType, ProductionTypeEnum } from '../developments/developments';


export type ProductionOrderStatus =
    | 'CREATED'
    | 'PILOT_PRODUCTION'
    | 'PILOT_SENT'
    | 'PILOT_APPROVED'
    | 'PRODUCTION_STARTED'
    | 'FINALIZED';


export type { ProductionTypeEnum } from '../developments/developments';


export interface SizeItem {
    size: string;
    value: number;
}


export interface ProductionTypeWithQuantities extends ProductionType {


}


export interface ProductionOrder {
    _id: string;


    developmentId: string;
    development: Development;


    internalReference: string;


    status: ProductionOrderStatus;


    fabricType: string;
    productionType: ProductionType; // ✅ MUDANÇA: Usa ProductionType diretamente
    observations?: string;


    hasCraft?: boolean;
    fabricWidth?: number;


    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}


export interface CreateProductionOrderRequest {
    developmentId: string;
    fabricType: string;
    productionType: ProductionType; // ✅ MUDANÇA: Usa ProductionType
    observations?: string;
    hasCraft?: boolean;
    fabricWidth?: number;
}

export interface UpdateProductionOrderRequest extends Partial<CreateProductionOrderRequest> {
    status?: ProductionOrderStatus;
}


export interface ProductionOrderFilters {
    search?: string;
    developmentId?: string;
    status?: ProductionOrderStatus;
    productionType?: ProductionTypeEnum;
    active?: boolean;


    createdFrom?: Date | string;
    createdTo?: Date | string;


    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}


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


export class ProductionOrderFormUtils {


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


    static getVariant(productionType: ProductionType): string {
        return productionType.additionalInfo?.variant || '';
    }


    static getSizes(productionType: ProductionType): SizeItem[] {
        return productionType.additionalInfo?.sizes || [];
    }


    static hasAdditionalInfo(productionType: ProductionType): boolean {
        return !!productionType.additionalInfo;
    }
}
