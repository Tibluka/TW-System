// src/app/services/development/development.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces
export interface Development {
  _id?: string;
  clientId: string;
  description: string;
  clientReference?: string;
  internalReference?: string;
  pieceImage?: {
    url: string;
    publicId: string;
    uploadedAt: string;
    urls?: {
      original: string;
      thumbnail: string;
      medium: string;
      large: string;
    };
  };
  variants: {
    colors: string[];
    sizes: string[];
    compositions: string[];
  };
  productionType: {
    digital: {
      enabled: boolean;
      negotiatedPrice?: number;
    };
    rotary: {
      enabled: boolean;
      negotiatedPrice?: number;
    };
    localized: {
      enabled: boolean;
      sizes: {
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
      };
    };
  };
  status: 'CREATED' | 'IN_DEVELOPMENT' | 'APPROVED' | 'REJECTED' | 'FINALIZED';
  active: boolean;
  client?: any; // Dados do cliente quando populado
  createdAt?: string;
  updatedAt?: string;
}

export interface DevelopmentFilters {
  page?: number;
  limit?: number;
  clientId?: string;
  status?: string;
  search?: string;
  active?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DevelopmentService {
  private apiUrl = `${environment.apiUrl}/developments`;

  constructor(private http: HttpClient) { }

  // Criar novo development
  createDevelopment(development: Partial<Development>): Observable<ApiResponse<Development>> {
    return this.http.post<ApiResponse<Development>>(this.apiUrl, development)
      .pipe(catchError(this.handleError));
  }

  // Buscar developments com filtros e paginação
  getDevelopments(filters: DevelopmentFilters = {}): Observable<PaginatedResponse<Development>> {
    let params = new HttpParams();

    // Adicionar parâmetros de filtro
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.clientId) params = params.set('clientId', filters.clientId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.active !== undefined) params = params.set('active', filters.active.toString());

    return this.http.get<PaginatedResponse<Development>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Buscar development por ID
  getDevelopment(id: string): Observable<ApiResponse<Development>> {
    return this.http.get<ApiResponse<Development>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Buscar development por referência (interna ou do cliente)
  getDevelopmentByReference(reference: string): Observable<ApiResponse<Development>> {
    return this.http.get<ApiResponse<Development>>(`${this.apiUrl}/reference/${reference}`)
      .pipe(catchError(this.handleError));
  }

  // Atualizar development
  updateDevelopment(id: string, development: Partial<Development>): Observable<ApiResponse<Development>> {
    return this.http.put<ApiResponse<Development>>(`${this.apiUrl}/${id}`, development)
      .pipe(catchError(this.handleError));
  }

  // Deletar development (soft delete)
  deleteDevelopment(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Reativar development
  reactivateDevelopment(id: string): Observable<ApiResponse<Development>> {
    return this.http.patch<ApiResponse<Development>>(`${this.apiUrl}/${id}/reactivate`, {})
      .pipe(catchError(this.handleError));
  }

  // Atualizar status do development
  updateStatus(id: string, status: Development['status']): Observable<ApiResponse<Development>> {
    return this.http.patch<ApiResponse<Development>>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  // Upload de imagem para development
  uploadImage(developmentId: string, file: File): Observable<ApiResponse<Development>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<ApiResponse<Development>>(
      `${this.apiUrl}/${developmentId}/image`,
      formData
    ).pipe(catchError(this.handleError));
  }

  // Deletar imagem do development
  deleteImage(developmentId: string): Observable<ApiResponse<Development>> {
    return this.http.delete<ApiResponse<Development>>(`${this.apiUrl}/${developmentId}/image`)
      .pipe(catchError(this.handleError));
  }

  // Buscar developments por cliente
  getDevelopmentsByClient(clientId: string, filters: Omit<DevelopmentFilters, 'clientId') = { }): Observable < PaginatedResponse < Development >> {
    return this.getDevelopments({ ...filters, clientId });
  }

// Buscar developments por status
getDevelopmentsByStatus(status: Development['status'], filters: Omit < DevelopmentFilters, 'status') = {}): Observable < PaginatedResponse < Development >> {
  return this.getDevelopments({ ...filters, status });
}

// Buscar developments ativos
getActiveDevelopments(filters: Omit < DevelopmentFilters, 'active') = {}): Observable < PaginatedResponse < Development >> {
  return this.getDevelopments({ ...filters, active: true });
}

// Buscar developments inativos
getInactiveDevelopments(filters: Omit < DevelopmentFilters, 'active') = {}): Observable < PaginatedResponse < Development >> {
  return this.getDevelopments({ ...filters, active: false });
}

// Pesquisar developments
searchDevelopments(searchTerm: string, filters: Omit < DevelopmentFilters, 'search') = {}): Observable < PaginatedResponse < Development >> {
  return this.getDevelopments({ ...filters, search: searchTerm });
}

// Validar dados do development antes de enviar
validateDevelopment(development: Partial<Development>): string[] {
  const errors: string[] = [];

  if (!development.clientId) {
    errors.push('Cliente é obrigatório');
  }

  if (!development.description || development.description.trim().length < 10) {
    errors.push('Descrição deve ter pelo menos 10 caracteres');
  }

  if (development.description && development.description.length > 500) {
    errors.push('Descrição deve ter no máximo 500 caracteres');
  }

  // Validar preços negociados se produção digital estiver habilitada
  if (development.productionType?.digital?.enabled &&
    (!development.productionType.digital.negotiatedPrice ||
      development.productionType.digital.negotiatedPrice <= 0)) {
    errors.push('Preço negociado é obrigatório quando produção digital está habilitada');
  }

  // Validar preços negociados se produção rotary estiver habilitada
  if (development.productionType?.rotary?.enabled &&
    (!development.productionType.rotary.negotiatedPrice ||
      development.productionType.rotary.negotiatedPrice <= 0)) {
    errors.push('Preço negociado é obrigatório quando produção rotary está habilitada');
  }

  return errors;
}

// Preparar dados para envio (limpar e formatar)
prepareDevelopmentData(formData: any): Partial < Development > {
  const development: Partial<Development> = {
  clientId: formData.clientId,
    description: formData.description?.trim(),
      clientReference: formData.clientReference?.trim() || undefined,
    };

// Processar variants
if (formData.colors || formData.sizes || formData.compositions) {
  development.variants = {
    colors: this.parseArrayString(formData.colors),
    sizes: this.parseArrayString(formData.sizes),
    compositions: this.parseArrayString(formData.compositions)
  };
}

// Processar production types
development.productionType = {
  digital: {
    enabled: !!formData.digitalEnabled,
    negotiatedPrice: formData.digitalEnabled ? parseFloat(formData.digitalPrice) || undefined : undefined
  },
  rotary: {
    enabled: !!formData.rotaryEnabled,
    negotiatedPrice: formData.rotaryEnabled ? parseFloat(formData.rotaryPrice) || undefined : undefined
  },
  localized: {
    enabled: !!formData.localizedEnabled,
    sizes: {
      xs: parseInt(formData.sizeXS) || 0,
      s: parseInt(formData.sizeS) || 0,
      m: parseInt(formData.sizeM) || 0,
      l: parseInt(formData.sizeL) || 0,
      xl: parseInt(formData.sizeXL) || 0
    }
  }
};

return development;
  }

  // Helper para converter string separada por vírgula em array
  private parseArrayString(value: string): string[] {
  if (!value || typeof value !== 'string') return [];
  return value.split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// Obter URL da imagem com fallback
getImageUrl(development: Development, size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'): string | null {
  if (!development.pieceImage) return null;

  if (development.pieceImage.urls && development.pieceImage.urls[size]) {
    return development.pieceImage.urls[size];
  }

  return development.pieceImage.url || null;
}

// Verificar se development pode ser editado
canEditDevelopment(development: Development): boolean {
  return development.active &&
    !['FINALIZED', 'REJECTED'].includes(development.status);
}

// Verificar se development pode ser aprovado
canApproveDevelopment(development: Development): boolean {
  return development.active &&
    development.status === 'IN_DEVELOPMENT';
}

// Formatar status para exibição
getFormattedStatus(status: Development['status']): string {
  const statusMap = {
    'CREATED': 'Criado',
    'IN_DEVELOPMENT': 'Em Desenvolvimento',
    'APPROVED': 'Aprovado',
    'REJECTED': 'Rejeitado',
    'FINALIZED': 'Finalizado'
  };
  return statusMap[status] || status;
}

  // Tratamento de erros
  private handleError(error: HttpErrorResponse) {
  let errorMessage = 'Erro interno do servidor';

  if (error.error instanceof ErrorEvent) {
    // Erro do lado do cliente
    errorMessage = `Erro: ${error.error.message}`;
  } else {
    // Erro do lado do servidor
    switch (error.status) {
      case 400:
        errorMessage = error.error?.message || 'Dados inválidos';
        break;
      case 401:
        errorMessage = 'Não autorizado. Faça login novamente.';
        break;
      case 403:
        errorMessage = 'Acesso negado';
        break;
      case 404:
        errorMessage = 'Development não encontrado';
        break;
      case 409:
        errorMessage = 'Referência interna já existe';
        break;
      case 422:
        errorMessage = error.error?.message || 'Dados não processáveis';
        break;
      case 500:
        errorMessage = 'Erro interno do servidor';
        break;
      default:
        errorMessage = `Erro HTTP: ${error.status}`;
    }
  }

  console.error('DevelopmentService Error:', error);
  return throwError(() => new Error(errorMessage));
}
}