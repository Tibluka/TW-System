import { DevelopmentStatus } from "../../models/developments/developments";
import { ProductionOrderStatus } from "../../models/production-orders/production-orders";
import { ProductionTypeEnum } from "../../models/production-type";

export function copyToClipboard(internalReference: string, event?: MouseEvent) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (navigator && navigator.clipboard) {
        navigator.clipboard.writeText(internalReference).then(() => {

            showToast('success', 'Copiado!', `"${internalReference}" copiado para a área de transferência.`);
        }).catch(err => {

            showToast('error', 'Erro ao copiar', 'Não foi possível copiar o texto para a área de transferência.');
        });
    } else {

        try {
            const textArea = document.createElement('textarea');
            textArea.value = internalReference;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('success', 'Copiado!', `"${internalReference}" copiado para a área de transferência.`);
        } catch (err) {
            showToast('error', 'Erro ao copiar', 'Não foi possível copiar o texto para a área de transferência.');
        }
    }
}

function showToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    const container = (window as any).toastContainer;
    if (container) {
        container.addToast({
            type,
            title,
            message,
            duration: type === 'error' ? 7000 : 5000,
            closable: true
        });
    } else {
        // Log no console se o toast não estiver disponível
        console.warn('Toast container not available:', `${title}: ${message}`);
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
