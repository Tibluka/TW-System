

import { ProductionOrder } from '../production-orders/production-orders';


export type ProductionSheetStage =
    | 'PRINTING'
    | 'CALENDERING'
    | 'FINISHED';

export type MachineNumber = 1 | 2 | 3 | 4;


export interface ProductionSheet {
    _id: string;


    productionOrderId: string;
    productionOrder?: ProductionOrder; // Populated automaticamente pelo backend


    internalReference?: string;


    entryDate: Date | string;
    expectedExitDate: Date | string;
    machine: MachineNumber;


    stage: ProductionSheetStage;


    productionNotes?: string;


    active?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}


export interface ProductionSheetStatistics {
    stages: {
        total: number;
        printing: number;
        calendering: number;
        finished: number;
    };
    machines: {
        machine1: number;
        machine2: number;
        machine3: number;
        machine4: number;
    };
}


export interface CreateProductionSheetRequest {
    productionOrderId: string;
    expectedExitDate: Date | string;
    machine: MachineNumber;
    entryDate?: Date | string; // Default: Date.now no backend
    productionNotes?: string;
}

export interface UpdateProductionSheetRequest extends Partial<CreateProductionSheetRequest> {
    stage?: ProductionSheetStage;
}

export interface UpdateStageRequest {
    stage: ProductionSheetStage;
}


export interface ProductionSheetFilters {
    search?: string;
    productionOrderId?: string;
    machine?: MachineNumber;
    stage?: ProductionSheetStage;
    active?: boolean;


    entryDateFrom?: Date | string;
    entryDateTo?: Date | string;
    expectedExitDateFrom?: Date | string;
    expectedExitDateTo?: Date | string;


    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}


export interface ProductionSheetListResponse {
    success: boolean;
    data: ProductionSheet[];
    pagination?: PaginationInfo;
    message?: string;
}

export interface ProductionSheetResponse {
    success: boolean;
    data: ProductionSheet;
    message?: string;
}

export interface ProductionSheetStatsResponse {
    success: boolean;
    data: ProductionSheetStatistics;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
}


export class ProductionSheetUtils {

    /**
     * 🎯 LABEL ESTÁGIO - Retorna label em português para estágio
     */
    static getStageLabel(stage: ProductionSheetStage): string {
        const stageMap: { [key in ProductionSheetStage]: string } = {
            'PRINTING': 'Impressão',
            'CALENDERING': 'Calandra',
            'FINISHED': 'Finalizado'
        };
        return stageMap[stage] || stage;
    }

    /**
     * 🖥️ NOME DA MÁQUINA - Retorna nome formatado da máquina
     */
    static getMachineName(machineNumber: MachineNumber): string {
        return `Máquina ${machineNumber}`;
    }

    /**
     * ✅ VERIFICAR SE FINALIZADO - Verifica se a ficha está finalizada
     */
    static isFinished(stage: ProductionSheetStage): boolean {
        return stage === 'FINISHED';
    }

    /**
     * ⏭️ PRÓXIMO ESTÁGIO - Retorna o próximo estágio
     */
    static getNextStage(currentStage: ProductionSheetStage): ProductionSheetStage | null {
        const stageOrder: ProductionSheetStage[] = ['PRINTING', 'CALENDERING', 'FINISHED'];
        const currentIndex = stageOrder.indexOf(currentStage);

        if (currentIndex < stageOrder.length - 1) {
            return stageOrder[currentIndex + 1];
        }

        return null; // Já está no estágio final
    }

    /**
     * 📊 COR DO ESTÁGIO - Retorna cor CSS para o estágio
     */
    static getStageColor(stage: ProductionSheetStage): string {
        const colorMap: { [key in ProductionSheetStage]: string } = {
            'PRINTING': 'warning',
            'CALENDERING': 'info',
            'FINISHED': 'success'
        };
        return colorMap[stage] || 'neutral';
    }

    /**
     * 📅 FORMATAR DATA - Formata data para exibição
     */
    static formatDate(date: Date | string | undefined): string {
        if (!date) return '-';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleDateString('pt-BR');
        } catch {
            return '-';
        }
    }

    /**
     * ⏰ FORMATAR DATA E HORA - Formata data e hora para exibição
     */
    static formatDateTime(date: Date | string | undefined): string {
        if (!date) return '-';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleString('pt-BR');
        } catch {
            return '-';
        }
    }

    /**
     * 🎨 STATUS BADGE CLASS - Retorna classe CSS para badge de status
     */
    static getStatusBadgeClass(stage: ProductionSheetStage): string {
        return `status-${stage.toLowerCase().replace('_', '-')}`;
    }

    /**
     * 🔢 VALIDAR NÚMERO DA MÁQUINA - Valida se o número da máquina é válido
     */
    static isValidMachineNumber(machineNumber: number): machineNumber is MachineNumber {
        return [1, 2, 3, 4].includes(machineNumber);
    }

    /**
     * 📈 PROGRESSO DO ESTÁGIO - Retorna porcentagem de progresso baseada no estágio
     */
    static getStageProgress(stage: ProductionSheetStage): number {
        const progressMap: { [key in ProductionSheetStage]: number } = {
            'PRINTING': 33,
            'CALENDERING': 66,
            'FINISHED': 100
        };
        return progressMap[stage] || 0;
    }
}
