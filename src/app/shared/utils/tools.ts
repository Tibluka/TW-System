import { DevelopmentStatus, ProductionTypeEnum } from "../../models/developments/developments";
import { ProductionOrderStatus } from "../../models/production-orders/production-orders";

export function copyToClipboard(internalReference: string, event?: MouseEvent) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (navigator && navigator.clipboard) {
        navigator.clipboard.writeText(internalReference).then(() => {
            //alert('copiado com sucesso')
        }).catch(err => {
            alert('Erro ao copiar')
        });
    }
}

export function translateProductionType(productionType: ProductionTypeEnum) {
    if (productionType === 'rotary') {
        return 'Rotativo';
    } else if (productionType === 'localized') {
        return 'Localizado';
    } return 'Desconhecido';
}

export function translateProductionOrderStatus(productionOrderStatus: ProductionOrderStatus) {
    const statusMap: Record<ProductionOrderStatus, string> = {
        CREATED: 'Criado',
        PILOT_PRODUCTION: 'Produção Piloto',
        PILOT_SENT: 'Piloto Enviado',
        PILOT_APPROVED: 'Piloto Aprovado',
        PRODUCTION_STARTED: 'Produção Iniciada',
        FINALIZED: 'Finalizado'
    };
    return statusMap[productionOrderStatus] || 'Desconhecido';
}


export function translateDevelopmentStatus(developmentStatus: DevelopmentStatus) {
    const statusMap: Record<DevelopmentStatus, string> = {
        CREATED: 'Criado',
        AWAITING_APPROVAL: 'Aguardando Aprovação',
        APPROVED: 'Aprovado',
        CANCELED: 'Cancelado'
    };
    return statusMap[developmentStatus] || 'Desconhecido';
}