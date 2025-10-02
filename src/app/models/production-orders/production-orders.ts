

import { Development } from '../developments/developments';
import { ProductionType, ProductionTypeEnum, QuantityItem, ProductionVariant, ProductionTypeUtils } from '../production-type';


export type ProductionOrderStatus =
    | 'CREATED'
    | 'PILOT_PRODUCTION'
    | 'PILOT_SENT'
    | 'PILOT_APPROVED'
    | 'PRODUCTION_STARTED'
    | 'FINALIZED';



// Re-export para compatibilidade
export type SizeItem = QuantityItem;


export interface ProductionTypeWithQuantities extends ProductionType {


}


export interface ProductionOrder {
    _id: string;


    developmentId: string;
    development: Development;


    internalReference: string;


    status: ProductionOrderStatus;


    fabricType?: string; // Opcional para localized (está dentro das variantes)
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
    fabricType?: string; // Opcional para localized
    productionType: ProductionType | null; // ✅ MUDANÇA: Usa ProductionType
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
        return ProductionTypeUtils.getTotalQuantity(productionType);
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


    static buildProductionTypeFromForm(
        type: ProductionTypeEnum,
        meters?: number,
        fabricType?: string,
        variants?: ProductionVariant[]
    ): ProductionType {
        const productionType: ProductionType = { type };

        if (type === 'rotary' && meters) {
            productionType.meters = meters;
            productionType.fabricType = fabricType;
        }

        if (type === 'localized') {
            productionType.variants = variants || [];
        }

        return productionType;
    }


    static calculateTotalPieces(productionType: ProductionType): number {
        return ProductionTypeUtils.calculateTotalPieces(productionType);
    }

    static createEmptyQuantity(): QuantityItem {
        return ProductionTypeUtils.createEmptyQuantity();
    }

    static createEmptyVariant(): ProductionVariant {
        return ProductionTypeUtils.createEmptyVariant();
    }

    static removeEmptyQuantities(quantities: QuantityItem[]): QuantityItem[] {
        return ProductionTypeUtils.removeEmptyQuantities(quantities);
    }

    static validateUniqueQuantity(quantities: QuantityItem[], newSize: string, currentIndex: number): boolean {
        return ProductionTypeUtils.validateUniqueQuantity(quantities, newSize, currentIndex);
    }

    static getVariants(productionType: ProductionType): ProductionVariant[] {
        return productionType.variants || [];
    }

    static hasVariants(productionType: ProductionType): boolean {
        return productionType.type === 'localized' &&
            !!productionType.variants &&
            productionType.variants.length > 0;
    }

    static getFabricType(productionType: ProductionType): string {
        if (productionType.type === 'rotary') {
            return productionType.fabricType || '';
        }
        return '';
    }
}
