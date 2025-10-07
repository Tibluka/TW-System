import { Injectable } from '@angular/core';
import { ERROR_CODES, ERROR_MESSAGES, getErrorCode } from './error-codes';

export interface BackendError {
    message: string;
    code: number;
    details?: any;
}

export interface ErrorMapping {
    code: number;
    message: string;
    title: string;
    type: 'error' | 'warning' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    /**
     * 🎯 PROCESS ERROR - Processa erro do backend e retorna mensagem tratada
     */
    processError(error: any): ErrorMapping {
        console.log('🔍 Processando erro:', error);

        // Se já é um ErrorMapping formatado, retorna diretamente
        if (error.code && error.message && error.title && error.type) {
            return error as ErrorMapping;
        }

        // Extrai informações do erro
        let errorCode: number;
        let originalMessage: string;

        // Tenta extrair do erro original
        if (error.originalError) {
            const originalError = error.originalError;
            errorCode = originalError.code || getErrorCode(originalError.message || '');
            originalMessage = originalError.message || 'Erro desconhecido';
        } else {
            // Tenta extrair diretamente do erro
            errorCode = error.code || error.error?.code || getErrorCode(error.message || '');
            originalMessage = error.message || error.error?.message || 'Erro desconhecido';
        }

        console.log('📝 Código do erro:', errorCode);
        console.log('📝 Mensagem original:', originalMessage);

        // Busca a mensagem tratada baseada no código
        const errorMapping = ERROR_MESSAGES[errorCode];

        if (errorMapping) {
            console.log('✅ Mensagem tratada encontrada:', errorMapping);
            return {
                code: errorCode,
                message: this.interpolateMessage(errorMapping.message, error.details),
                title: errorMapping.title,
                type: errorMapping.type
            };
        }

        // Se não encontrou por código, tenta por mensagem
        const messageBasedCode = getErrorCode(originalMessage);
        const messageBasedMapping = ERROR_MESSAGES[messageBasedCode];

        if (messageBasedMapping) {
            console.log('✅ Mensagem tratada encontrada por texto:', messageBasedMapping);
            return {
                code: messageBasedCode,
                message: this.interpolateMessage(messageBasedMapping.message, error.details),
                title: messageBasedMapping.title,
                type: messageBasedMapping.type
            };
        }

        // Fallback para erro desconhecido
        console.log('❌ Erro não mapeado, usando fallback');
        return {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Erro interno do servidor. Tente novamente mais tarde.',
            title: 'Erro Interno',
            type: 'error'
        };
    }

    /**
     * 🔧 INTERPOLATE MESSAGE - Substitui placeholders na mensagem
     */
    private interpolateMessage(message: string, details?: any): string {
        if (!details) return message;

        // Substitui placeholders como {min}, {max}, {types}, etc.
        return message.replace(/\{(\w+)\}/g, (match, key) => {
            return details[key] || match;
        });
    }

    /**
     * 📝 ADD ERROR MAPPING - Adiciona novo mapeamento de erro
     */
    addErrorMapping(code: number, mapping: Omit<ErrorMapping, 'code'>): void {
        // Não permite sobrescrever mapeamentos existentes
        if (ERROR_MESSAGES[code]) {
            console.warn(`Mapeamento para código ${code} já existe`);
            return;
        }

        ERROR_MESSAGES[code] = mapping;
    }

    /**
     * 📋 GET ALL MAPPINGS - Retorna todos os mapeamentos
     */
    getAllMappings(): Record<number, { message: string; title: string; type: 'error' | 'warning' | 'info' }> {
        return { ...ERROR_MESSAGES };
    }

    /**
     * 🔍 GET MAPPING BY CODE - Busca mapeamento por código
     */
    getMappingByCode(code: number): { message: string; title: string; type: 'error' | 'warning' | 'info' } | undefined {
        return ERROR_MESSAGES[code];
    }

    /**
     * 🎨 GET ERROR TYPE - Retorna o tipo do erro baseado no código
     */
    getErrorType(code: number): 'error' | 'warning' | 'info' {
        const mapping = ERROR_MESSAGES[code];
        return mapping?.type || 'error';
    }

    /**
     * 📊 GET ERROR CATEGORY - Retorna a categoria do erro baseada no código
     */
    getErrorCategory(code: number): string {
        const firstDigit = Math.floor(code / 1000);

        switch (firstDigit) {
            case 1: return 'Validação';
            case 2: return 'Negócio';
            case 3: return 'Autenticação';
            case 4: return 'Autorização';
            case 5: return 'Recursos';
            case 6: return 'Sistema';
            default: return 'Desconhecido';
        }
    }

    /**
     * 🔍 IS VALIDATION ERROR - Verifica se é erro de validação
     */
    isValidationError(code: number): boolean {
        return code >= 1000 && code < 2000;
    }

    /**
     * 🔍 IS BUSINESS ERROR - Verifica se é erro de negócio
     */
    isBusinessError(code: number): boolean {
        return code >= 2000 && code < 3000;
    }

    /**
     * 🔍 IS AUTHENTICATION ERROR - Verifica se é erro de autenticação
     */
    isAuthenticationError(code: number): boolean {
        return code >= 3000 && code < 4000;
    }

    /**
     * 🔍 IS AUTHORIZATION ERROR - Verifica se é erro de autorização
     */
    isAuthorizationError(code: number): boolean {
        return code >= 4000 && code < 5000;
    }

    /**
     * 🔍 IS RESOURCE ERROR - Verifica se é erro de recurso
     */
    isResourceError(code: number): boolean {
        return code >= 5000 && code < 6000;
    }

    /**
     * 🔍 IS SYSTEM ERROR - Verifica se é erro de sistema
     */
    isSystemError(code: number): boolean {
        return code >= 6000 && code < 7000;
    }
}