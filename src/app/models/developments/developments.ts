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
// INTERFACE PRINCIPAL
// ============================================

export interface Development {
    _id?: string;

    // IDENTIFIERS
    clientReference?: string; // Referência fornecida pelo cliente
    internalReference?: string; // Auto-gerado: formato 25ABC0001

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

    // ✅ NOVA ESTRUTURA SIMPLES - APENAS O TIPO
    productionType: ProductionTypeEnum;

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
    // ✅ NOVA ESTRUTURA SIMPLES
    productionType: ProductionTypeEnum;
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

    // ✅ FILTRO SIMPLIFICADO
    productionType?: ProductionTypeEnum;

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

    /**
     * 📅 Formata data para exibição
     */
    static formatDate(date: Date | string | undefined): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    }

    /**
     * 📅 Formata data e hora para exibição
     */
    static formatDateTime(date: Date | string | undefined): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR') + ' ' +
            new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * ✅ Valida se dados do development são válidos
     */
    static validateDevelopment(development: Partial<CreateDevelopmentRequest>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!development.clientId) {
            errors.push('Cliente é obrigatório');
        }

        if (!development.productionType) {
            errors.push('Tipo de produção é obrigatório');
        } else if (!['rotary', 'localized'].includes(development.productionType)) {
            errors.push('Tipo de produção deve ser rotativo ou localizado');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 🔄 Converte status para progresso (0-100)
     */
    static getStatusProgress(status: DevelopmentStatus): number {
        const progressMap: Record<DevelopmentStatus, number> = {
            'CREATED': 25,
            'AWAITING_APPROVAL': 50,
            'APPROVED': 100,
            'CANCELED': 0
        };

        return progressMap[status] || 0;
    }

    /**
     * 🏷️ Retorna badge colorido para status
     */
    static getStatusBadge(status: DevelopmentStatus): { label: string; class: string; color: string } {
        const badges: Record<DevelopmentStatus, { label: string; class: string; color: string }> = {
            'CREATED': { label: 'Criado', class: 'status-created', color: 'blue' },
            'AWAITING_APPROVAL': { label: 'Aguardando', class: 'status-awaiting', color: 'yellow' },
            'APPROVED': { label: 'Aprovado', class: 'status-approved', color: 'green' },
            'CANCELED': { label: 'Cancelado', class: 'status-canceled', color: 'red' }
        };

        return badges[status] || { label: status, class: 'status-unknown', color: 'gray' };
    }

    /**
     * 🏷️ Retorna badge colorido para tipo de produção
     */
    static getProductionTypeBadge(type: ProductionTypeEnum): { label: string; class: string; color: string } {
        const badges: Record<ProductionTypeEnum, { label: string; class: string; color: string }> = {
            'rotary': { label: 'Rotativa', class: 'production-rotary', color: 'blue' },
            'localized': { label: 'Localizada', class: 'production-localized', color: 'purple' }
        };

        return badges[type] || { label: type, class: 'production-unknown', color: 'gray' };
    }

    /**
     * 📊 Calcula estatísticas resumidas
     */
    static calculateSummary(developments: Development[]): {
        total: number;
        byStatus: Record<DevelopmentStatus, number>;
        byProductionType: Record<ProductionTypeEnum, number>;
        recentCount: number;
    } {
        const summary = {
            total: developments.length,
            byStatus: {
                'CREATED': 0,
                'AWAITING_APPROVAL': 0,
                'APPROVED': 0,
                'CANCELED': 0
            } as Record<DevelopmentStatus, number>,
            byProductionType: {
                'rotary': 0,
                'localized': 0
            } as Record<ProductionTypeEnum, number>,
            recentCount: 0
        };

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        developments.forEach(dev => {
            // Contar por status
            summary.byStatus[dev.status]++;

            // Contar por tipo de produção
            summary.byProductionType[dev.productionType]++;

            // Contar recentes (última semana)
            if (dev.createdAt && new Date(dev.createdAt) > oneWeekAgo) {
                summary.recentCount++;
            }
        });

        return summary;
    }
}