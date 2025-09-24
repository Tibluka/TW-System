// models/developments/developments.ts

import { Client } from '../clients/clients';

// ============================================
// TYPES E ENUMS
// ============================================

export type DevelopmentStatus =
    | 'CREATED'
    | 'AWAITING_APPROVAL'
    | 'APPROVED'
    | 'CLOSED';

// ============================================
// INTERFACE PRINCIPAL
// ============================================

// E certifique-se que Development usa ProductionType como objeto:
export interface Development {
    _id?: string;
    clientId: string;
    client?: Client;
    internalReference?: string;
    description?: string;
    clientReference?: string;
    pieceImage?: PieceImage;
    variants?: {
        color?: string;
    };
    productionType: ProductionType; // ✅ Como objeto, não string
    status: DevelopmentStatus;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
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
// INTERFACE PARA TIPO DE PRODUÇÃO
// ============================================

export interface ProductionType {
    type: string,
    meters?: number,
    sizes?: {
        size: string,
        value: number
    }[]
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

// Para as requisições:
export interface CreateDevelopmentRequest {
    clientId: string;
    description?: string;
    clientReference?: string;
    productionType: ProductionType; // ✅ Como objeto
}

export interface UpdateDevelopmentRequest {
    clientId?: string;
    description?: string;
    clientReference?: string;
    productionType?: ProductionType; // ✅ Como objeto
}
// ============================================
// FILTER INTERFACE
// ============================================

export interface DevelopmentFilters {
    search?: string; // Busca em clientReference e description
    clientId?: string;
    status?: DevelopmentStatus;
    active?: boolean;

    // Filtros por tipo de produção
    rotaryEnabled?: boolean;
    localizedEnabled?: boolean;

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
    started: number;
    awaiting_approval: number;
    approved: number;
    refused: number;
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
            'CLOSED': 'Fechado'
        };

        return labels[status] || status;
    }

    /**
     * 🎨 Retorna classe CSS para status
     */
    static getStatusClass(status: DevelopmentStatus): string {
        return `status-${status.toLowerCase()}`;
    }

    /**
     * 💰 Valida se pelo menos um tipo de produção está habilitado
     */
    static validateProductionType(productionType: ProductionType): boolean {
        return productionType.type !== null;
    }



    /**
     * 🖼️ Verifica se development tem imagem
     */
    static hasImage(development: Development): boolean {
        return !!(development.pieceImage && development.pieceImage.url);
    }

    /**
     * 🔗 Retorna URL da imagem otimizada
     */
    static getImageUrl(development: Development, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'medium'): string | null {
        if (!development.pieceImage || !development.pieceImage.optimizedUrls) {
            return development.pieceImage?.url || null;
        }

        return development.pieceImage.optimizedUrls[size] || development.pieceImage.url || null;
    }

    /**
     * 🏭 Retorna tipos de produção habilitados
     */
    static getEnabledProductionType(productionType: ProductionType): string {
        return productionType.type;
    }

    /**
     * 📝 Valida se pode ser aprovado
     */
    static canBeApproved(development: Development): boolean {
        return development.status === 'AWAITING_APPROVAL';
    }

    /**
     * 🏭 Valida se pode criar ordem de produção
     */
    static canCreateProductionOrder(development: Development): boolean {
        return development.status === 'APPROVED';
    }

    /**
     * 🔍 Formata referência interna para exibição
     */
    static formatInternalReference(internalReference?: string): string {
        if (!internalReference) return '-';

        // Formato: 25ABC0001 -> 25-ABC-0001
        const match = internalReference.match(/^(\d{2})([A-Z]{2,4})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }

        return internalReference;
    }
}