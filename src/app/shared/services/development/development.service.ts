import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DevelopmentFilters, DevelopmentListResponse, Development, DevelopmentResponse, CreateDevelopmentRequest, UpdateDevelopmentRequest, DevelopmentStatistics } from '../../../models/developments/developments';

@Injectable({
  providedIn: 'root'
})
export class DevelopmentService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/developments`;

  /**
   * 📋 LISTAR - Busca desenvolvimentos com filtros e paginação
   */
  listDevelopments(filters: DevelopmentFilters = {}): Observable<DevelopmentListResponse> {
    let params = new HttpParams();
    if (filters.search) {
      params = params.set('search', filters.search);
    }

    if (filters.clientId) {
      params = params.set('clientId', filters.clientId);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.active !== undefined) {
      params = params.set('active', filters.active.toString());
    }
    if (filters.productionType) {
      params = params.set('productionType', filters.productionType);
    }
    if (filters.createdFrom) {
      params = params.set('createdFrom', this.formatDate(filters.createdFrom));
    }

    if (filters.createdTo) {
      params = params.set('createdTo', this.formatDate(filters.createdTo));
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }

    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }
    return this.http.get<DevelopmentListResponse>(this.baseUrl, { params })
      .pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 👁️ BUSCAR POR ID - Retorna desenvolvimento específico
   */
  getDevelopmentById(id: string): Observable<Development> {

    return this.http.get<DevelopmentResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => {
          return response.data;
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * ➕ CRIAR - Cria novo desenvolvimento
   */
  createDevelopment(data: CreateDevelopmentRequest): Observable<Development> {

    return this.http.post<DevelopmentResponse>(this.baseUrl, data)
      .pipe(
        map(response => {
          return response.data;
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * ✏️ ATUALIZAR - Atualiza desenvolvimento existente
   */
  updateDevelopment(id: string, data: UpdateDevelopmentRequest): Observable<Development> {

    return this.http.put<DevelopmentResponse>(`${this.baseUrl}/${id}`, data)
      .pipe(
        map(response => {
          return response.data;
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 🗑️ DELETAR - Remove desenvolvimento (soft delete)
   */
  deleteDevelopment(id: string): Observable<void> {

    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        map(() => {
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 🔄 ALTERAR STATUS - Atualiza apenas o status do desenvolvimento
   */
  updateDevelopmentStatus(id: string, status: string): Observable<Development> {

    return this.http.patch<DevelopmentResponse>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(
        map(response => {
          return response.data;
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 🔄 ATIVAR/DESATIVAR - Alterna status ativo do desenvolvimento
   */
  toggleDevelopmentStatus(id: string, active: boolean): Observable<Development> {

    return this.http.post<DevelopmentResponse>(`${this.baseUrl}/${id}/${active ? 'activate' : 'deactivate'}`, {})
      .pipe(
        map(response => {
          return response.data;
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 📊 ESTATÍSTICAS - Busca estatísticas dos desenvolvimentos
   */
  getDevelopmentStats(filters?: Partial<DevelopmentFilters>): Observable<DevelopmentStatistics> {
    let params = new HttpParams();

    if (filters?.clientId) {
      params = params.set('clientId', filters.clientId);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<DevelopmentStatistics>(`${this.baseUrl}/stats`, { params })
      .pipe(
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 📋 POR CLIENTE - Busca desenvolvimentos de um cliente específico
   */
  getDevelopmentsByClient(clientId: string, filters?: Partial<DevelopmentFilters>): Observable<DevelopmentListResponse> {
    const clientFilters: DevelopmentFilters = {
      ...filters,
      clientId
    };

    return this.listDevelopments(clientFilters);
  }

  /**
   * 📷 UPLOAD IMAGEM - Faz upload da imagem da peça
   */
  uploadImage(developmentId: string, file: File): Observable<any> {

    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<any>(`${this.baseUrl}/${developmentId}/image`, formData)
      .pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 🗑️ REMOVER IMAGEM - Remove imagem da peça
   */
  removeImage(developmentId: string): Observable<any> {

    return this.http.delete<any>(`${this.baseUrl}/${developmentId}/image`)
      .pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 👁️ OBTER IMAGEM - Busca informações da imagem
   */
  getImage(developmentId: string): Observable<any> {

    return this.http.get<any>(`${this.baseUrl}/${developmentId}/image`)
      .pipe(
        catchError(error => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 📅 FORMATAR DATA - Converte data para string ISO
   */
  private formatDate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  /**
   * ⚠️ TRATAR ERRO - Processa erros da API
   */
  private handleError(error: any): Error {
    let errorMessage = 'Erro interno do servidor';

    if (error.error) {

      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.errors && Array.isArray(error.error.errors)) {

        errorMessage = error.error.errors.map((err: any) => err.message || err).join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });

    return new Error(errorMessage);
  }
}