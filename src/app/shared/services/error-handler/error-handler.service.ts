import { Injectable } from '@angular/core';

export interface BackendError {
    message: string;
    code: string;
    details?: any;
}

export interface ErrorMapping {
    code: string;
    message: string;
    title?: string;
    type?: 'error' | 'warning' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    private errorMappings: ErrorMapping[] = [

        {
            code: '1001',
            message: 'Erro de validação nos dados fornecidos',
            title: 'Dados inválidos',
            type: 'warning'
        },
        {
            code: '1002',
            message: 'Dados fornecidos são inválidos',
            title: 'Dados inválidos',
            type: 'warning'
        },
        {
            code: '1003',
            message: 'Campo obrigatório não foi preenchido',
            title: 'Campo obrigatório',
            type: 'warning'
        },
        {
            code: '1004',
            message: 'Formato de email inválido',
            title: 'Email inválido',
            type: 'warning'
        },
        {
            code: '1005',
            message: 'Formato de senha inválido',
            title: 'Senha inválida',
            type: 'warning'
        },
        {
            code: '1006',
            message: 'Formato de data inválido',
            title: 'Data inválida',
            type: 'warning'
        },
        {
            code: '1007',
            message: 'ID do objeto inválido',
            title: 'ID inválido',
            type: 'warning'
        },
        {
            code: '1008',
            message: 'Valor de enum inválido',
            title: 'Valor inválido',
            type: 'warning'
        },
        {
            code: '1009',
            message: 'Tamanho da string inválido',
            title: 'Tamanho inválido',
            type: 'warning'
        },
        {
            code: '1010',
            message: 'Número fora do intervalo permitido',
            title: 'Número inválido',
            type: 'warning'
        },
        {
            code: '1011',
            message: 'Tamanho do array inválido',
            title: 'Array inválido',
            type: 'warning'
        },
        {
            code: '1012',
            message: 'Tipo de arquivo inválido',
            title: 'Arquivo inválido',
            type: 'warning'
        },
        {
            code: '1013',
            message: 'Arquivo muito grande',
            title: 'Arquivo muito grande',
            type: 'warning'
        },


        {
            code: '2001',
            message: 'O desenvolvimento deve ser aprovado para criar ordem de produção',
            title: 'Desenvolvimento não aprovado',
            type: 'warning'
        },
        {
            code: '2002',
            message: 'Já existe uma ordem de produção para este desenvolvimento',
            title: 'Ordem duplicada',
            type: 'warning'
        },
        {
            code: '2003',
            message: 'Já existe uma ficha de entrega para esta ficha de produção',
            title: 'Ficha duplicada',
            type: 'warning'
        },
        {
            code: '2004',
            message: 'Já existe um recibo de produção para esta ficha de entrega',
            title: 'Recibo duplicado',
            type: 'warning'
        },
        {
            code: '2005',
            message: 'Permissões insuficientes para realizar esta operação',
            title: 'Permissão negada',
            type: 'error'
        },
        {
            code: '2006',
            message: 'Esta operação não é permitida no momento',
            title: 'Operação não permitida',
            type: 'warning'
        },
        {
            code: '2007',
            message: 'Violação de regra de negócio',
            title: 'Regra de negócio',
            type: 'warning'
        },
        {
            code: '2008',
            message: 'Entrada duplicada encontrada',
            title: 'Duplicação',
            type: 'warning'
        },
        {
            code: '2009',
            message: 'Transição de status inválida',
            title: 'Status inválido',
            type: 'warning'
        },
        {
            code: '2010',
            message: 'Recurso está em uso e não pode ser modificado',
            title: 'Recurso em uso',
            type: 'warning'
        },
        {
            code: '2011',
            message: 'Tipo de produção inválido',
            title: 'Tipo inválido',
            type: 'warning'
        },
        {
            code: '2012',
            message: 'Dados de produção obrigatórios não fornecidos',
            title: 'Dados obrigatórios',
            type: 'warning'
        },


        {
            code: '3001',
            message: 'Autenticação necessária para acessar este recurso',
            title: 'Login necessário',
            type: 'warning'
        },
        {
            code: '3002',
            message: 'Email ou senha incorretos',
            title: 'Credenciais inválidas',
            type: 'error'
        },
        {
            code: '3003',
            message: 'Token de acesso expirado. Faça login novamente',
            title: 'Token expirado',
            type: 'warning'
        },
        {
            code: '3004',
            message: 'Token de acesso inválido',
            title: 'Token inválido',
            type: 'error'
        },
        {
            code: '3005',
            message: 'Conta desabilitada. Entre em contato com o administrador',
            title: 'Conta desabilitada',
            type: 'error'
        },
        {
            code: '3006',
            message: 'Conta bloqueada por tentativas excessivas',
            title: 'Conta bloqueada',
            type: 'error'
        },
        {
            code: '3007',
            message: 'Sessão expirada. Faça login novamente',
            title: 'Sessão expirada',
            type: 'warning'
        },


        {
            code: '4001',
            message: 'Permissões insuficientes para realizar esta ação',
            title: 'Acesso negado',
            type: 'error'
        },
        {
            code: '4002',
            message: 'Função específica necessária para esta operação',
            title: 'Função necessária',
            type: 'error'
        },
        {
            code: '4003',
            message: 'Acesso de administrador necessário',
            title: 'Admin necessário',
            type: 'error'
        },
        {
            code: '4004',
            message: 'Acesso ao recurso negado',
            title: 'Recurso negado',
            type: 'error'
        },


        {
            code: '5001',
            message: 'Usuário não encontrado',
            title: 'Usuário não encontrado',
            type: 'error'
        },
        {
            code: '5002',
            message: 'Cliente não encontrado',
            title: 'Cliente não encontrado',
            type: 'error'
        },
        {
            code: '5003',
            message: 'Desenvolvimento não encontrado',
            title: 'Desenvolvimento não encontrado',
            type: 'error'
        },
        {
            code: '5004',
            message: 'Ordem de produção não encontrada',
            title: 'Ordem não encontrada',
            type: 'error'
        },
        {
            code: '5005',
            message: 'Ficha de produção não encontrada',
            title: 'Ficha não encontrada',
            type: 'error'
        },
        {
            code: '5006',
            message: 'Ficha de entrega não encontrada',
            title: 'Ficha não encontrada',
            type: 'error'
        },
        {
            code: '5007',
            message: 'Recibo de produção não encontrado',
            title: 'Recibo não encontrado',
            type: 'error'
        },
        {
            code: '5008',
            message: 'Arquivo não encontrado',
            title: 'Arquivo não encontrado',
            type: 'error'
        },
        {
            code: '5009',
            message: 'Recurso não encontrado',
            title: 'Recurso não encontrado',
            type: 'error'
        },


        {
            code: '6001',
            message: 'Erro interno do banco de dados. Tente novamente mais tarde',
            title: 'Erro de banco',
            type: 'error'
        },
        {
            code: '6002',
            message: 'Erro em serviço externo. Tente novamente mais tarde',
            title: 'Serviço externo',
            type: 'error'
        },
        {
            code: '6003',
            message: 'Erro ao fazer upload do arquivo',
            title: 'Upload falhou',
            type: 'error'
        },
        {
            code: '6004',
            message: 'Erro ao enviar email',
            title: 'Email falhou',
            type: 'error'
        },
        {
            code: '6005',
            message: 'Erro interno do servidor. Tente novamente mais tarde',
            title: 'Erro interno',
            type: 'error'
        },
        {
            code: '6006',
            message: 'Serviço temporariamente indisponível',
            title: 'Serviço indisponível',
            type: 'error'
        },
        {
            code: '6007',
            message: 'Tempo limite da operação excedido',
            title: 'Timeout',
            type: 'error'
        },
        {
            code: '6008',
            message: 'Erro de conexão. Verifique sua internet',
            title: 'Erro de rede',
            type: 'error'
        },
        {
            code: '6009',
            message: 'Erro de configuração do sistema',
            title: 'Configuração',
            type: 'error'
        },
        {
            code: '6010',
            message: 'Muitas tentativas. Aguarde alguns minutos',
            title: 'Limite excedido',
            type: 'warning'
        },


        {
            code: 'UNKNOWN_SERVER_ERROR',
            message: 'Erro desconhecido do servidor. Tente novamente mais tarde.',
            title: 'Erro do Servidor',
            type: 'error'
        }
    ];

    /**
     * 🎯 PROCESS ERROR - Processa erro do backend e retorna mensagem tratada
     */
    processError(error: any): ErrorMapping {


        if (error.code && error.message && error.title && error.type) {
            return error as ErrorMapping;
        }


        if (error.originalError && error.originalError.code) {
            const originalError = error.originalError;
            const errorCode = originalError.code.toString(); // Converte para string
            const originalMessage = originalError.message || 'Erro desconhecido';


            const mapping = this.errorMappings.find(m => m.code === errorCode);

            if (mapping) {
                return {
                    ...mapping,
                    message: mapping.message,
                    title: mapping.title || 'Erro',
                    type: mapping.type || 'error'
                };
            }


            const messageMapping = this.mapByEnglishMessage(originalMessage);
            if (messageMapping) {
                return messageMapping;
            }


            return {
                code: errorCode || 'UNKNOWN_SERVER_ERROR',
                message: originalMessage || 'Erro desconhecido do servidor. Tente novamente mais tarde.',
                title: originalError.title || 'Erro do Servidor',
                type: originalError.type || 'error'
            };
        }


        const errorCode = error.code || error.error?.code;
        const originalMessage = error.message || error.error?.message || 'Erro desconhecido';


        if (errorCode) {
            const mapping = this.errorMappings.find(m => m.code === errorCode.toString());

            if (mapping) {
                return {
                    ...mapping,
                    message: mapping.message,
                    title: mapping.title || 'Erro',
                    type: mapping.type || 'error'
                };
            }
        }


        const messageMapping = this.mapByEnglishMessage(originalMessage);
        if (messageMapping) {
            return messageMapping;
        }


        return {
            code: 'UNKNOWN_SERVER_ERROR',
            message: 'Erro desconhecido do servidor. Tente novamente mais tarde.',
            title: 'Erro do Servidor',
            type: 'error'
        };
    }

    /**
     * 🔍 MAP BY ENGLISH MESSAGE - Mapeia mensagens em inglês para português
     */
    private mapByEnglishMessage(englishMessage: string): ErrorMapping | null {
        const messageMappings: { [key: string]: ErrorMapping } = {

            'Invalid data': {
                code: '1002',
                message: 'Dados fornecidos são inválidos',
                title: 'Dados inválidos',
                type: 'warning'
            },
            'Validation error': {
                code: '1001',
                message: 'Erro de validação nos dados fornecidos',
                title: 'Dados inválidos',
                type: 'warning'
            },
            'Required field is missing': {
                code: '1003',
                message: 'Campo obrigatório não foi preenchido',
                title: 'Campo obrigatório',
                type: 'warning'
            },
            'Invalid email format': {
                code: '1004',
                message: 'Formato de email inválido',
                title: 'Email inválido',
                type: 'warning'
            },
            'Invalid password format': {
                code: '1005',
                message: 'Formato de senha inválido',
                title: 'Senha inválida',
                type: 'warning'
            },
            'Invalid date format': {
                code: '1006',
                message: 'Formato de data inválido',
                title: 'Data inválida',
                type: 'warning'
            },
            'Invalid ObjectId': {
                code: '1007',
                message: 'ID do objeto inválido',
                title: 'ID inválido',
                type: 'warning'
            },
            'Invalid enum value': {
                code: '1008',
                message: 'Valor de enum inválido',
                title: 'Valor inválido',
                type: 'warning'
            },
            'String length invalid': {
                code: '1009',
                message: 'Tamanho da string inválido',
                title: 'Tamanho inválido',
                type: 'warning'
            },
            'Number out of range': {
                code: '1010',
                message: 'Número fora do intervalo permitido',
                title: 'Número inválido',
                type: 'warning'
            },
            'Array length invalid': {
                code: '1011',
                message: 'Tamanho do array inválido',
                title: 'Array inválido',
                type: 'warning'
            },
            'Invalid file type': {
                code: '1012',
                message: 'Tipo de arquivo inválido',
                title: 'Arquivo inválido',
                type: 'warning'
            },
            'File too large': {
                code: '1013',
                message: 'Arquivo muito grande',
                title: 'Arquivo muito grande',
                type: 'warning'
            },


            'Development must be approved to create production order': {
                code: '2001',
                message: 'O desenvolvimento deve ser aprovado para criar ordem de produção',
                title: 'Desenvolvimento não aprovado',
                type: 'warning'
            },
            'Production order already exists for this development': {
                code: '2002',
                message: 'Já existe uma ordem de produção para este desenvolvimento',
                title: 'Ordem duplicada',
                type: 'warning'
            },
            'Delivery sheet already exists for this production sheet': {
                code: '2003',
                message: 'Já existe uma ficha de entrega para esta ficha de produção',
                title: 'Ficha duplicada',
                type: 'warning'
            },
            'Production receipt already exists for this delivery sheet': {
                code: '2004',
                message: 'Já existe um recibo de produção para esta ficha de entrega',
                title: 'Recibo duplicado',
                type: 'warning'
            },
            'Insufficient permissions': {
                code: '2005',
                message: 'Permissões insuficientes para realizar esta operação',
                title: 'Permissão negada',
                type: 'error'
            },
            'Operation not allowed': {
                code: '2006',
                message: 'Esta operação não é permitida no momento',
                title: 'Operação não permitida',
                type: 'warning'
            },
            'Business rule violation': {
                code: '2007',
                message: 'Violação de regra de negócio',
                title: 'Regra de negócio',
                type: 'warning'
            },
            'Duplicate entry': {
                code: '2008',
                message: 'Entrada duplicada encontrada',
                title: 'Duplicação',
                type: 'warning'
            },
            'Invalid status transition': {
                code: '2009',
                message: 'Transição de status inválida',
                title: 'Status inválido',
                type: 'warning'
            },
            'Resource in use': {
                code: '2010',
                message: 'Recurso está em uso e não pode ser modificado',
                title: 'Recurso em uso',
                type: 'warning'
            },
            'Invalid production type': {
                code: '2011',
                message: 'Tipo de produção inválido',
                title: 'Tipo inválido',
                type: 'warning'
            },
            'Missing production data': {
                code: '2012',
                message: 'Dados de produção obrigatórios não fornecidos',
                title: 'Dados obrigatórios',
                type: 'warning'
            },


            'Authentication required': {
                code: '3001',
                message: 'Autenticação necessária para acessar este recurso',
                title: 'Login necessário',
                type: 'warning'
            },
            'Invalid credentials': {
                code: '3002',
                message: 'Email ou senha incorretos',
                title: 'Credenciais inválidas',
                type: 'error'
            },
            'Token expired': {
                code: '3003',
                message: 'Token de acesso expirado. Faça login novamente',
                title: 'Token expirado',
                type: 'warning'
            },
            'Invalid token': {
                code: '3004',
                message: 'Token de acesso inválido',
                title: 'Token inválido',
                type: 'error'
            },
            'Account disabled': {
                code: '3005',
                message: 'Conta desabilitada. Entre em contato com o administrador',
                title: 'Conta desabilitada',
                type: 'error'
            },
            'Account locked': {
                code: '3006',
                message: 'Conta bloqueada por tentativas excessivas',
                title: 'Conta bloqueada',
                type: 'error'
            },
            'Session expired': {
                code: '3007',
                message: 'Sessão expirada. Faça login novamente',
                title: 'Sessão expirada',
                type: 'warning'
            },


            'Role required': {
                code: '4002',
                message: 'Função específica necessária para esta operação',
                title: 'Função necessária',
                type: 'error'
            },
            'Admin required': {
                code: '4003',
                message: 'Acesso de administrador necessário',
                title: 'Admin necessário',
                type: 'error'
            },
            'Resource access denied': {
                code: '4004',
                message: 'Acesso ao recurso negado',
                title: 'Recurso negado',
                type: 'error'
            },


            'User not found': {
                code: '5001',
                message: 'Usuário não encontrado',
                title: 'Usuário não encontrado',
                type: 'error'
            },
            'Client not found': {
                code: '5002',
                message: 'Cliente não encontrado',
                title: 'Cliente não encontrado',
                type: 'error'
            },
            'Development not found': {
                code: '5003',
                message: 'Desenvolvimento não encontrado',
                title: 'Desenvolvimento não encontrado',
                type: 'error'
            },
            'Production order not found': {
                code: '5004',
                message: 'Ordem de produção não encontrada',
                title: 'Ordem não encontrada',
                type: 'error'
            },
            'Production sheet not found': {
                code: '5005',
                message: 'Ficha de produção não encontrada',
                title: 'Ficha não encontrada',
                type: 'error'
            },
            'Delivery sheet not found': {
                code: '5006',
                message: 'Ficha de entrega não encontrada',
                title: 'Ficha não encontrada',
                type: 'error'
            },
            'Production receipt not found': {
                code: '5007',
                message: 'Recibo de produção não encontrado',
                title: 'Recibo não encontrado',
                type: 'error'
            },
            'File not found': {
                code: '5008',
                message: 'Arquivo não encontrado',
                title: 'Arquivo não encontrado',
                type: 'error'
            },
            'Resource not found': {
                code: '5009',
                message: 'Recurso não encontrado',
                title: 'Recurso não encontrado',
                type: 'error'
            },


            'Database error': {
                code: '6001',
                message: 'Erro interno do banco de dados. Tente novamente mais tarde',
                title: 'Erro de banco',
                type: 'error'
            },
            'External service error': {
                code: '6002',
                message: 'Erro em serviço externo. Tente novamente mais tarde',
                title: 'Serviço externo',
                type: 'error'
            },
            'File upload error': {
                code: '6003',
                message: 'Erro ao fazer upload do arquivo',
                title: 'Upload falhou',
                type: 'error'
            },
            'Email send error': {
                code: '6004',
                message: 'Erro ao enviar email',
                title: 'Email falhou',
                type: 'error'
            },
            'Internal server error': {
                code: '6005',
                message: 'Erro interno do servidor. Tente novamente mais tarde',
                title: 'Erro interno',
                type: 'error'
            },
            'Service unavailable': {
                code: '6006',
                message: 'Serviço temporariamente indisponível',
                title: 'Serviço indisponível',
                type: 'error'
            },
            'Timeout error': {
                code: '6007',
                message: 'Tempo limite da operação excedido',
                title: 'Timeout',
                type: 'error'
            },
            'Network error': {
                code: '6008',
                message: 'Erro de conexão. Verifique sua internet',
                title: 'Erro de rede',
                type: 'error'
            },
            'Configuration error': {
                code: '6009',
                message: 'Erro de configuração do sistema',
                title: 'Configuração',
                type: 'error'
            },
            'Too many requests': {
                code: '6010',
                message: 'Muitas tentativas. Aguarde alguns minutos',
                title: 'Limite excedido',
                type: 'warning'
            }
        };

        return messageMappings[englishMessage] || null;
    }

    /**
     * 📝 ADD ERROR MAPPING - Adiciona novo mapeamento de erro
     */
    addErrorMapping(mapping: ErrorMapping): void {
        const existingIndex = this.errorMappings.findIndex(m => m.code === mapping.code);
        if (existingIndex >= 0) {
            this.errorMappings[existingIndex] = mapping;
        } else {
            this.errorMappings.push(mapping);
        }
    }

    /**
     * 📋 GET ALL MAPPINGS - Retorna todos os mapeamentos
     */
    getAllMappings(): ErrorMapping[] {
        return [...this.errorMappings];
    }

    /**
     * 🔍 GET MAPPING BY CODE - Busca mapeamento por código
     */
    getMappingByCode(code: string): ErrorMapping | undefined {
        return this.errorMappings.find(m => m.code === code);
    }
}
