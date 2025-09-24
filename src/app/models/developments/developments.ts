// models/developments/developments.ts

import { Client } from '../clients/clients';

// ============================================
// TYPES E ENUMS
// ============================================

export type DevelopmentStatus =
    | 'CREATED'
    | 'AWAITING_APPROVAL'
    | 'APPROVED'
    | 'CANCELED';

export type ProductionTypeEnum = 'rotary' | 'localized';

// ============================================
// NOVA INTERFACE PRODUCTIONTYPE
// ============================================

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

// ============================================
// INTERFACE PRINCIPAL
// ============================================

export interface Development {
    _id?: string;

    // IDENTIFIERS
    clientReference?: string; // Referência fornecida pelo cliente
    internalReference: string; // Auto-gerado: formato 25ABC0001

    // CLIENT REFERENCE
    clientId: string; // ID de referência obrigatório
    client?: Client; // Pode vir populado da API via populate

    // BASIC DATA
    description?: string;

    // PIECE IMAGE
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

    // STATUS
    status: DevelopmentStatus;

    // VARIANTS
    variants?: {
        color?: string;
    };

    // ✅ NOVA ESTRUTURA COM OBJETO COMPLETO
    productionType: ProductionType;

    // METADADOS
    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// ============================================
// INTERFACE PARA IMAGEM
// ============================================

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

// ============================================
// INTERFACE PARA VARIANTES
// ============================================

export interface DevelopmentVariants {
    color?: string;
}

// ============================================
// REQUEST INTERFACES
// ============================================

export interface CreateDevelopmentRequest {
    clientId: string;
    description?: string;
    clientReference?: string;
    status?: DevelopmentStatus;
    variants?: {
        color?: string;
    };
    // ✅ NOVA ESTRUTURA COM OBJETO COMPLETO
    productionType: ProductionType;
}

export interface UpdateDevelopmentRequest extends Partial<CreateDevelopmentRequest> {
    internalReference?: string; // Não pode ser alterado após criação
}

// ============================================
// FILTER INTERFACE
// ============================================

export interface DevelopmentFilters {
    search?: string; // Busca em clientReference e description
    clientId?: string;
    status?: DevelopmentStatus;
    active?: boolean;

    // ✅ FILTRO PODE SER POR TIPO OU OBJETO COMPLETO
    productionType?: ProductionTypeEnum; // Para filtros simples por tipo
    productionTypeFilter?: ProductionType; // Para filtros complexos

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
// STATISTICS INTERFACE
// ============================================

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

// ============================================
// HELPERS E UTILITÁRIOS
// ============================================

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