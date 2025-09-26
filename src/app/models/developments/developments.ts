import { Client } from '../clients/clients';

export type DevelopmentStatus =
    | 'CREATED'
    | 'AWAITING_APPROVAL'
    | 'APPROVED'
    | 'CANCELED';

export type ProductionTypeEnum = 'rotary' | 'localized';

export interface ProductionType {
    type: 'rotary' | 'localized';
    meters?: number;
    additionalInfo?: {
        variant: string;
        sizes: {
            size: string;
            value: number;
        }[];
    };
}

export interface Development {
    _id: string;
    clientReference?: string;
    internalReference: string;
    clientId: string;
    client?: Client;
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
    productionType: ProductionType;
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
    internalReference?: string;
}

export interface DevelopmentFilters {
    search?: string;
    clientId?: string;
    status?: DevelopmentStatus;
    active?: boolean;
    productionType?: ProductionTypeEnum;
    productionTypeFilter?: ProductionType;
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
        const labels: Record<ProductionTypeEnum, string> = {
            'rotary': 'Rotativa',
            'localized': 'Localizada'
        };

        return labels[type] || type;
    }

    /**
     * 🎯 Retorna classe CSS para tipo de produção
     */
    static getProductionTypeClass(type: ProductionTypeEnum): string {
        return `production-type-${type}`;
    }

    /**
     * 🖼️ Verifica se development tem imagem
     */
    static hasImage(development: Development): boolean {
        return !!development.pieceImage?.url;
    }

    /**
     * ✅ NOVA FUNÇÃO - Extrai apenas o tipo do productionType
     */
    static getProductionTypeEnum(development: Development): ProductionTypeEnum {
        return development.productionType.type;
    }

    /**
     * ✅ NOVA FUNÇÃO - Verifica se tem informações adicionais
     */
    static hasAdditionalInfo(development: Development): boolean {
        return !!development.productionType.additionalInfo;
    }

    /**
     * ✅ NOVA FUNÇÃO - Calcula total de peças para localized
     */
    static getTotalPieces(development: Development): number {
        if (development.productionType.type !== 'localized' || !development.productionType.additionalInfo?.sizes) {
            return 0;
        }

        return development.productionType.additionalInfo.sizes.reduce((total, item) => {
            return total + (item.value || 0);
        }, 0);
    }

    /**
     * ✅ NOVA FUNÇÃO - Retorna string formatada da quantidade
     */
    static getQuantityDisplay(development: Development): string {
        if (development.productionType.type === 'rotary') {
            return development.productionType.meters ? `${development.productionType.meters}m` : '0m';
        }

        const totalPieces = this.getTotalPieces(development);
        return `${totalPieces} pç${totalPieces !== 1 ? 's' : ''}`;
    }
}