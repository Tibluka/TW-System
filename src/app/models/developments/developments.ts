

import { Client } from '../clients/clients';
import { ProductionType, ProductionTypeEnum, ProductionVariant, QuantityItem, ProductionTypeUtils } from '../production-type';


export type DevelopmentStatus =
    | 'CREATED'
    | 'AWAITING_APPROVAL'
    | 'APPROVED'
    | 'CANCELED';


export interface Development {
    _id: string;


    clientReference?: string; // Referência fornecida pelo cliente
    internalReference: string; // Auto-gerado: formato 25ABC0001


    clientId: string; // ID de referência obrigatório
    client: Client; // Pode vir populado da API via populate


    description?: string;


    pieceImage?: {
        url?: string;
        publicId?: string;
        filename?: string;
        optimizedUrls?: {
            thumbnail?: string;
            small?: string;
            medium?: string;
            large?: string;
            original?: string;
        };
        uploadedAt?: Date | string;
    };


    status: DevelopmentStatus;


    variants?: {
        color?: string;
    };


    productionType: ProductionTypeEnum;


    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}


export interface PieceImage {
    url?: string;
    publicId?: string;
    filename?: string;
    optimizedUrls?: {
        thumbnail?: string;
        small?: string;
        medium?: string;
        large?: string;
        original?: string;
    };
    uploadedAt?: Date | string;
}


export interface DevelopmentVariants {
    color?: string;
}


export interface CreateDevelopmentRequest {
    clientId: string;
    description?: string;
    clientReference?: string;
    status?: DevelopmentStatus;
    variants?: {
        color?: string;
    };

    productionType: ProductionType;
}

export interface UpdateDevelopmentRequest extends Partial<CreateDevelopmentRequest> {
    internalReference?: string; // Não pode ser alterado após criação
}


export interface DevelopmentFilters {
    search?: string; // Busca em clientReference e description
    clientId?: string;
    status?: DevelopmentStatus;
    active?: boolean;


    productionType?: ProductionTypeEnum; // Para filtros simples por tipo
    productionTypeFilter?: ProductionType; // Para filtros complexos


    createdFrom?: Date | string;
    createdTo?: Date | string;


    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}


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


export interface DevelopmentStatistics {
    total: number;
    CREATED: number;
    AWAITING_APPROVAL: number;
    APPROVED: number;
    CANCELED: number;
    productionType: {
        rotary: number;
        localized: number;
    };
}


export class DevelopmentUtils {

    /**
     * 🏷️ Retorna label amigável para status
     */
    static getStatusLabel(status: DevelopmentStatus): string {
        const labels: Record<DevelopmentStatus, string> = {
            'CREATED': 'Criado',
            'AWAITING_APPROVAL': 'Aguardando Aprovação',
            'APPROVED': 'Aprovado',
            'CANCELED': 'Cancelado'
        };

        return labels[status] || status;
    }

    /**
     * 🎨 Retorna classe CSS para status
     */
    static getStatusClass(status: DevelopmentStatus): string {
        return `status-${status.toLowerCase().replace('_', '-')}`;
    }

    /**
     * 🏭 Retorna label do tipo de produção
     */
    static getProductionTypeLabel(type: ProductionTypeEnum): string {
        return ProductionTypeUtils.getProductionTypeLabel(type);
    }

    /**
     * 🎯 Retorna classe CSS para tipo de produção
     */
    static getProductionTypeClass(type: ProductionTypeEnum): string {
        return ProductionTypeUtils.getProductionTypeClass(type);
    }

    /**
     * 🖼️ Verifica se development tem imagem
     */
    static hasImage(development: Development): boolean {
        return !!development.pieceImage?.url;
    }


}
