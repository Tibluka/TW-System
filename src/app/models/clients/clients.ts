// ============================================
// INTERFACES BASEADAS NO SCHEMA DO BACKEND
// ============================================

/**
 * Interface principal do Client baseada no schema MongoDB
 */
export interface Client {
    _id?: string;
    acronym: string;
    companyName: string;
    cnpj: string;
    contact: {
        responsibleName: string;
        phone: string;
        email: string;
    };
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipcode: string;
    };
    values: {
        valuePerMeter: number;
        valuePerPiece: number;
    };
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// ============================================
// INTERFACES PARA RESPOSTAS DA API
// ============================================

/**
 * Interface base para todas as respostas da API
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

/**
 * Interface para informações de paginação
 * Baseada no clientController.js
 */
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

/**
 * Interface para respostas paginadas
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationInfo;
}

/**
 * Resposta específica para listagem de clientes com paginação
 */
export interface ClientListResponse extends PaginatedResponse<Client> {
    data: Client[];
}

/**
 * Resposta para cliente individual
 */
export interface ClientResponse extends ApiResponse<Client> {
    data: Client;
}

// ============================================
// INTERFACES PARA FILTROS E PARÂMETROS
// ============================================

/**
 * Filtros para listagem de clientes
 * Baseado no clientController.js
 */
export interface ClientFilters {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
    sortBy?: 'companyName' | 'cnpj' | 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
}

/**
 * Filtros avançados para busca de clientes
 * Baseado no método search do clientController.js
 */
export interface ClientSearchFilters extends ClientFilters {
    companyName?: string;
    cnpj?: string;
    email?: string;
    city?: string;
    state?: string;
    valorMin?: number;
    valorMax?: number;
}

/**
 * Interface para criação de cliente
 */
export interface CreateClientRequest {
    acronym: string;
    companyName: string;
    cnpj: string;
    contact: {
        responsibleName: string;
        phone: string;
        email: string;
    };
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipcode: string;
    };
    values: {
        valuePerMeter: number;
        valuePerPiece: number;
    };
    active?: boolean;
}

/**
 * Interface para atualização de cliente
 */
export interface UpdateClientRequest extends Partial<CreateClientRequest> {
    // Todos os campos são opcionais para update
}

// ============================================
// INTERFACES PARA ESTATÍSTICAS
// ============================================

/**
 * Interface para estatísticas de clientes
 * Baseada no método stats do clientController.js
 */
export interface ClientStats {
    total: number;
    ativos: number;
    inativos: number;
    valorMedioMetro: number;
    valorMedioPeca: number;
    clientesUltimos30Dias: number;
    percentualAtivos: number;
}

/**
 * Resposta para estatísticas de clientes
 */
export interface ClientStatsResponse extends ApiResponse<ClientStats> {
    data: ClientStats;
}

// ============================================
// TYPES AUXILIARES
// ============================================

/**
 * Estados brasileiros válidos
 */
export type BrazilianState =
    | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
    | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
    | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

/**
 * Campos válidos para ordenação
 */
export type ClientSortField = 'companyName' | 'cnpj' | 'createdAt' | 'updatedAt';

/**
 * Ordem de classificação
 */
export type SortOrder = 'asc' | 'desc';
