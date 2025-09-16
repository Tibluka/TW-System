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
    filename: string;
    optimizedUrls: {
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
      original: string;
    };
    uploadedAt: string;
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
  status: 'CREATED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'CLOSED';
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

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    current: number;
    totalPages: number;
    totalItems: number;
    limit: number;
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

  // Listar developments com filtros e paginação
  getDevelopments(filters?: DevelopmentFilters): Observable<PaginatedResponse<Development>> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Development>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Buscar development por ID
  getDevelopment(id: string): Observable<ApiResponse<Development>> {
    return this.http.get<ApiResponse<Development>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Criar novo development
  createDevelopment(development: Partial<Development>): Observable<ApiResponse<Development>> {
    return this.http.post<ApiResponse<Development>>(this.apiUrl, development)
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
    return this.http.post<ApiResponse<Development>>(`${this.apiUrl}/${id}/activate`, {})
      .pipe(catchError(this.handleError));
  }

  // Atualizar status do development
  updateStatus(id: string, status: Development['status']): Observable<ApiResponse<Development>> {
    return this.http.patch<ApiResponse<Development>>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  // ===============================
  // MÉTODOS DE IMAGEM
  // ===============================

  // Upload de imagem para development
  uploadImage(developmentId: string, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${developmentId}/image`,
      formData
    ).pipe(catchError(this.handleError));
  }

  // Remover imagem de development
  removeImage(developmentId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${developmentId}/image`
    ).pipe(catchError(this.handleError));
  }

  // Obter informações da imagem
  getImage(developmentId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${developmentId}/image`
    ).pipe(catchError(this.handleError));
  }

  // Buscar developments por cliente
  getDevelopmentsByClient(clientId: string): Observable<ApiResponse<Development[]>> {
    return this.http.get<ApiResponse<Development[]>>(`${this.apiUrl}/by-client/${clientId}`)
      .pipe(catchError(this.handleError));
  }

  // Obter estatísticas
  getStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  // Tratamento de erros
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Algo deu errado; tente novamente mais tarde.';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => error);
  }
}