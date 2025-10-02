

import { DevelopmentStatus } from '../../models/developments/developments';
import { ProductionOrderStatus } from '../../models/production-orders/production-orders';
import { ProductionSheetStage } from '../../models/production-sheet/production-sheet';
import { PaymentStatus } from '../../models/production-receipt/production-receipt';
import { DeliverySheetStatus } from '../../models/delivery-sheets/delivery-sheets';


export type BadgeColor = 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'gray';

export type StatusType = DevelopmentStatus | ProductionOrderStatus | ProductionSheetStage | PaymentStatus | DeliverySheetStatus;


/**
 * 🎨 MAPEAMENTO DE CORES POR STATUS
 * Define cores consistentes para cada status do sistema
 */
export class StatusColorMapper {


    /**
     * 🏗️ DESENVOLVIMENTOS - Cores para status de desenvolvimento
     */
    private static readonly DEVELOPMENT_COLORS: Record<DevelopmentStatus, BadgeColor> = {
        'CREATED': 'blue',           // Azul - Novo/Inicial
        'AWAITING_APPROVAL': 'yellow', // Amarelo - Aguardando
        'APPROVED': 'green',         // Verde - Aprovado
        'CANCELED': 'red'            // Vermelho - Cancelado
    };

    /**
     * 🏭 ORDENS DE PRODUÇÃO - Cores para status de ordem de produção
     */
    private static readonly PRODUCTION_ORDER_COLORS: Record<ProductionOrderStatus, BadgeColor> = {
        'CREATED': 'blue',              // Azul - Criado
        'PILOT_PRODUCTION': 'orange',   // Laranja - Em produção piloto
        'PILOT_SENT': 'yellow',         // Amarelo - Piloto enviado
        'PILOT_APPROVED': 'green',      // Verde - Piloto aprovado
        'PRODUCTION_STARTED': 'purple', // Roxo - Produção iniciada
        'FINALIZED': 'green'            // Verde - Finalizado
    };

    /**
     * 📋 FICHAS DE PRODUÇÃO - Cores para estágios de produção
     */
    private static readonly PRODUCTION_SHEET_COLORS: Record<ProductionSheetStage, BadgeColor> = {
        'PRINTING': 'blue',      // Azul - Impressão
        'CALENDERING': 'orange', // Laranja - Calandragem
        'FINISHED': 'green'      // Verde - Finalizado
    };

    /**
     * 💰 RECEBIMENTOS - Cores para status de pagamento
     */
    private static readonly PAYMENT_COLORS: Record<PaymentStatus, BadgeColor> = {
        'PENDING': 'yellow', // Amarelo - Pendente
        'PAID': 'green'      // Verde - Pago
    };

    /**
     * 📦 FICHAS DE ENTREGA - Cores para status de entrega
     */
    private static readonly DELIVERY_SHEET_COLORS: Record<DeliverySheetStatus, BadgeColor> = {
        'CREATED': 'blue',    // Azul - Criada
        'ON_ROUTE': 'orange', // Laranja - Em Rota
        'DELIVERED': 'green'  // Verde - Entregue
    };


    /**
     * 🎨 OBTER COR POR STATUS - Retorna a cor apropriada para um status
     */
    static getColorForStatus(status: string, entityType?: 'development' | 'production-order' | 'production-sheet' | 'production-receipt' | 'delivery-sheet'): BadgeColor {

        if (!entityType) {
            return this.detectColorByStatus(status);
        }


        switch (entityType) {
            case 'development':
                return this.DEVELOPMENT_COLORS[status as DevelopmentStatus] || 'gray';

            case 'production-order':
                return this.PRODUCTION_ORDER_COLORS[status as ProductionOrderStatus] || 'gray';

            case 'production-sheet':
                return this.PRODUCTION_SHEET_COLORS[status as ProductionSheetStage] || 'gray';

            case 'production-receipt':
                return this.PAYMENT_COLORS[status as PaymentStatus] || 'gray';

            case 'delivery-sheet':
                return this.DELIVERY_SHEET_COLORS[status as DeliverySheetStatus] || 'gray';

            default:
                return this.detectColorByStatus(status);
        }
    }

    /**
     * 🔍 DETECTAR COR POR STATUS - Detecta a cor baseada no valor do status
     */
    private static detectColorByStatus(status: string): BadgeColor {
        const statusUpper = status.toUpperCase();


        if (statusUpper.includes('CREATED') || statusUpper.includes('NEW')) {
            return 'blue';
        }

        if (statusUpper.includes('PENDING') || statusUpper.includes('WAITING') || statusUpper.includes('AWAITING')) {
            return 'yellow';
        }

        if (statusUpper.includes('APPROVED') || statusUpper.includes('COMPLETED') || statusUpper.includes('FINISHED') || statusUpper.includes('PAID')) {
            return 'green';
        }

        if (statusUpper.includes('CANCELED') || statusUpper.includes('CANCELLED') || statusUpper.includes('REJECTED')) {
            return 'red';
        }

        if (statusUpper.includes('PRODUCTION') || statusUpper.includes('PROCESSING') || statusUpper.includes('PRINTING')) {
            return 'orange';
        }

        if (statusUpper.includes('PILOT') || statusUpper.includes('SENT')) {
            return 'purple';
        }


        const knownStatuses: Record<string, BadgeColor> = {
            'CREATED': 'blue',
            'AWAITING_APPROVAL': 'yellow',
            'APPROVED': 'green',
            'CANCELED': 'red',
            'PILOT_PRODUCTION': 'orange',
            'PILOT_SENT': 'yellow',
            'PILOT_APPROVED': 'green',
            'PRODUCTION_STARTED': 'purple',
            'FINALIZED': 'green',
            'PRINTING': 'blue',
            'CALENDERING': 'orange',
            'FINISHED': 'green',
            'PENDING': 'yellow',
            'PAID': 'green'
        };

        return knownStatuses[statusUpper] || 'gray';
    }

    /**
     * 🎯 OBTER CORES DISPONÍVEIS - Retorna todas as cores disponíveis
     */
    static getAvailableColors(): BadgeColor[] {
        return ['green', 'yellow', 'orange', 'red', 'blue', 'purple', 'gray'];
    }

    /**
     * 📊 OBTER MAPEAMENTO COMPLETO - Retorna todos os mapeamentos para debug
     */
    static getAllMappings(): Record<string, Record<string, BadgeColor>> {
        return {
            development: this.DEVELOPMENT_COLORS,
            productionOrder: this.PRODUCTION_ORDER_COLORS,
            productionSheet: this.PRODUCTION_SHEET_COLORS,
            payment: this.PAYMENT_COLORS
        };
    }
}


/**
 * 🎨 FUNÇÃO HELPER - Obtém cor para um status
 */
export function getStatusColor(status: string, entityType?: 'development' | 'production-order' | 'production-sheet' | 'production-receipt' | 'delivery-sheet'): BadgeColor {
    return StatusColorMapper.getColorForStatus(status, entityType);
}

/**
 * 🏷️ FUNÇÃO HELPER - Obtém classe CSS para um status
 */
export function getStatusClass(status: string, entityType?: 'development' | 'production-order' | 'production-sheet' | 'production-receipt' | 'delivery-sheet'): string {
    const color = getStatusColor(status, entityType);
    return `status-${color}`;
}
