/**
 * 🏭 PRODUCTION TYPE MODELS
 * =========================
 * 
 * Modelos para gerenciar tipos de produção (rotary e localized)
 * com suporte a múltiplas variantes e diferentes tipos de tecido.
 */

// ============================================
// TIPOS BÁSICOS
// ============================================

export type ProductionTypeEnum = 'rotary' | 'localized';

// ============================================
// INTERFACES PRINCIPAIS
// ============================================

/**
 * Interface para quantidades de cada tamanho
 */
export interface QuantityItem {
    size: string;
    value: number;
}

/**
 * Interface para variantes de produção localizada
 */
export interface ProductionVariant {
    variantName: string;
    fabricType: string;
    quantities: QuantityItem[];
}

/**
 * Interface principal para tipo de produção
 */
export interface ProductionType {
    type: 'rotary' | 'localized';
    meters?: number; // Sempre presente: valor real para rotary, 0 para localized
    fabricType?: string; // Apenas para rotary
    variants?: ProductionVariant[]; // Apenas para localized
}

// ============================================
// OPÇÕES E CONSTANTES
// ============================================

// Removido - fabricType é um input de texto livre

/**
 * Opções de tamanhos disponíveis
 */
export const SIZE_OPTIONS = [
    { value: 'PP', label: 'PP' },
    { value: 'P', label: 'P' },
    { value: 'M', label: 'M' },
    { value: 'G', label: 'G' },
    { value: 'G1', label: 'G1' },
    { value: 'G2', label: 'G2' }
] as const;

/**
 * Tamanhos válidos para validação
 */
export const VALID_SIZES = ['PP', 'P', 'M', 'G', 'G1', 'G2'] as const;

// Removido - fabricType é um input de texto livre, sem validação de valores específicos

// ============================================
// UTILITÁRIOS
// ============================================

export class ProductionTypeUtils {

    /**
     * 🏷️ LABEL TIPO DE PRODUÇÃO - Retorna label amigável
     */
    static getProductionTypeLabel(type: ProductionTypeEnum): string {
        const labels: Record<ProductionTypeEnum, string> = {
            'rotary': 'Rotativa',
            'localized': 'Localizada'
        };
        return labels[type] || type;
    }

    /**
     * 🎨 CLASSE CSS TIPO DE PRODUÇÃO - Retorna classe CSS
     */
    static getProductionTypeClass(type: ProductionTypeEnum): string {
        return `production-type-${type}`;
    }

    /**
     * 🏷️ LABEL TIPO DE TECIDO - Retorna o próprio valor (texto livre)
     */
    static getFabricTypeLabel(fabricType: string): string {
        return fabricType;
    }

    /**
     * 🔢 CALCULAR TOTAL DE PEÇAS - Para produção localizada
     */
    static calculateTotalPieces(productionType: ProductionType): number {
        if (productionType.type === 'localized' && productionType.variants) {
            return productionType.variants.reduce((total, variant) => {
                return total + variant.quantities.reduce((variantTotal, item) => {
                    return variantTotal + (item.value || 0);
                }, 0);
            }, 0);
        }
        return 0;
    }

    /**
     * 📏 OBTER QUANTIDADE TOTAL - Retorna string formatada
     */
    static getTotalQuantity(productionType: ProductionType): string {
        if (productionType.type === 'rotary' && productionType.meters) {
            return `${productionType.meters}m`;
        }

        if (productionType.type === 'localized') {
            const totalPieces = this.calculateTotalPieces(productionType);
            return `${totalPieces} pç${totalPieces !== 1 ? 's' : ''}`;
        }

        return '0';
    }

    /**
     * ✅ VALIDAR ESTRUTURA - Valida se a estrutura está correta
     */
    static validateProductionType(productionType: ProductionType): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validar meters (sempre obrigatório)
        if (productionType.meters === undefined || productionType.meters === null) {
            errors.push('Metros são obrigatórios');
        }

        if (productionType.type === 'rotary') {
            if (!productionType.meters || productionType.meters <= 0) {
                errors.push('Metros devem ser maiores que zero para produção rotativa');
            }
            if (!productionType.fabricType) {
                errors.push('Tipo de tecido é obrigatório para produção rotativa');
            }
            // fabricType é texto livre, sem validação de valores específicos
        } else if (productionType.type === 'localized') {
            if (productionType.meters !== 0) {
                errors.push('Metros devem ser 0 para produção localizada');
            }
            if (!productionType.variants || productionType.variants.length === 0) {
                errors.push('Pelo menos uma variante é obrigatória para produção localizada');
            } else {
                productionType.variants.forEach((variant, index) => {
                    if (!variant.variantName) {
                        errors.push(`Variante ${index + 1}: Nome da variante é obrigatório`);
                    }
                    if (!variant.fabricType) {
                        errors.push(`Variante ${index + 1}: Tipo de tecido é obrigatório`);
                    }
                    // fabricType é texto livre, sem validação de valores específicos
                    if (!variant.quantities || variant.quantities.length === 0) {
                        errors.push(`Variante ${index + 1}: Pelo menos uma quantidade é obrigatória`);
                    } else {
                        variant.quantities.forEach((quantity, qIndex) => {
                            if (!quantity.size) {
                                errors.push(`Variante ${index + 1}, Quantidade ${qIndex + 1}: Tamanho é obrigatório`);
                            }
                            if (!VALID_SIZES.includes(quantity.size as any)) {
                                errors.push(`Variante ${index + 1}, Quantidade ${qIndex + 1}: Tamanho inválido`);
                            }
                            if (!quantity.value || quantity.value <= 0) {
                                errors.push(`Variante ${index + 1}, Quantidade ${qIndex + 1}: Valor deve ser maior que zero`);
                            }
                        });
                    }
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 🔄 CRIAR VARIANTE VAZIA - Cria uma nova variante vazia
     */
    static createEmptyVariant(): ProductionVariant {
        return {
            variantName: '',
            fabricType: '',
            quantities: [this.createEmptyQuantity()]
        };
    }

    /**
     * 🔄 CRIAR QUANTIDADE VAZIA - Cria uma nova quantidade vazia
     */
    static createEmptyQuantity(): QuantityItem {
        return { size: '', value: 0 };
    }

    /**
     * 🧹 REMOVER QUANTIDADES VAZIAS - Remove quantidades com valores vazios
     */
    static removeEmptyQuantities(quantities: QuantityItem[]): QuantityItem[] {
        return quantities.filter(item => item.size.trim() && item.value > 0);
    }

    /**
     * ✅ VALIDAR TAMANHO ÚNICO - Verifica se o tamanho já existe
     */
    static validateUniqueQuantity(quantities: QuantityItem[], newSize: string, currentIndex: number): boolean {
        return !quantities.some((item, index) =>
            index !== currentIndex &&
            item.size.trim().toUpperCase() === newSize.trim().toUpperCase()
        );
    }

    /**
     * 🔄 MIGRAR DADOS ANTIGOS - Migra dados da estrutura antiga para nova
     */
    static migrateFromOldStructure(oldProductionType: any): ProductionType {
        if (oldProductionType.type === 'rotary') {
            return {
                type: 'rotary',
                meters: oldProductionType.meters || 0,
                fabricType: oldProductionType.fabricType
            };
        } else if (oldProductionType.type === 'localized') {
            // Migrar da estrutura antiga (additionalInfo) para nova (variants)
            if (oldProductionType.additionalInfo) {
                return {
                    type: 'localized',
                    meters: 0, // Sempre 0 para localized
                    variants: [{
                        variantName: oldProductionType.additionalInfo.variant || '',
                        fabricType: oldProductionType.fabricType || '',
                        quantities: oldProductionType.additionalInfo.sizes || []
                    }]
                };
            }
        }

        // Fallback para estrutura vazia
        return {
            type: oldProductionType.type || 'rotary',
            meters: oldProductionType.meters || 0,
            fabricType: oldProductionType.fabricType,
            variants: oldProductionType.variants || []
        };
    }
}
