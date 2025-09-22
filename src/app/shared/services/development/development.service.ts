// services/developments/developments.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DevelopmentFilters, DevelopmentListResponse, Development, DevelopmentResponse, CreateDevelopmentRequest, UpdateDevelopmentRequest } from '../../../models/developments/developments';

@Injectable({
  providedIn: 'root'
})
export class DevelopmentService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/developments`;

  // ============================================
  // MÉTODOS DE LISTAGEM
  // ============================================

  /**
   * 📋 LISTAR - Busca desenvolvimentos com filtros e paginação
   */
  listDevelopments(filters: DevelopmentFilters = {}): Observable<DevelopmentListResponse> {
    let params = new HttpParams();

    // Adicionar filtros aos parâmetros
    if (filters.search) {
      params = params.set('search', filters.search);
    }

    if (filters.clientId) {
      params = params.set('clientId', filters.clientId);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.startDateFrom) {
      params = params.set('startDateFrom', this.formatDate(filters.startDateFrom));
    }

    if (filters.startDateTo) {
      params = params.set('startDateTo', this.formatDate(filters.startDateTo));
    }

    if (filters.expectedEndDateFrom) {
      params = params.set('expectedEndDateFrom', this.formatDate(filters.expectedEndDateFrom));
    }

    if (filters.expectedEndDateTo) {
      params = params.set('expectedEndDateTo', this.formatDate(filters.expectedEndDateTo));
    }

    if (filters.active !== undefined) {
      params = params.set('active', filters.active.toString());
    }

    // Paginação
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

    console.log('🔍 Buscando desenvolvimentos com filtros:', filters);

    return this.http.get<DevelopmentListResponse>(this.baseUrl, { params })
      .pipe(
        map(response => {
          console.log('✅ Desenvolvimentos recebidos:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro ao buscar desenvolvimentos:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  // ============================================
  // MÉTODOS DE CRUD
  // ============================================

  /**
   * 👁️ BUSCAR POR ID - Retorna desenvolvimento específico
   */
  getDevelopmentById(id: string): Observable<Development> {
    console.log('🔍 Buscando desenvolvimento por ID:', id);

    return this.http.get<DevelopmentResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => {
          console.log('✅ Desenvolvimento encontrado:', response.data);
          return response.data;
        }),
        catchError(error => {
          console.error('❌ Erro ao buscar desenvolvimento:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * ➕ CRIAR - Cria novo desenvolvimento
   */
  createDevelopment(data: CreateDevelopmentRequest): Observable<Development> {
    console.log('➕ Criando desenvolvimento:', data);

    return this.http.post<DevelopmentResponse>(this.baseUrl, data)
      .pipe(
        map(response => {
          console.log('✅ Desenvolvimento criado:', response.data);
          return response.data;
        }),
        catchError(error => {
          console.error('❌ Erro ao criar desenvolvimento:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * ✏️ ATUALIZAR - Atualiza desenvolvimento existente
   */
  updateDevelopment(id: string, data: UpdateDevelopmentRequest): Observable<Development> {
    console.log('✏️ Atualizando desenvolvimento:', { id, data });

    return this.http.put<DevelopmentResponse>(`${this.baseUrl}/${id}`, data)
      .pipe(
        map(response => {
          console.log('✅ Desenvolvimento atualizado:', response.data);
          return response.data;
        }),
        catchError(error => {
          console.error('❌ Erro ao atualizar desenvolvimento:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 🗑️ DELETAR - Remove desenvolvimento (soft delete)
   */
  deleteDevelopment(id: string): Observable<void> {
    console.log('🗑️ Removendo desenvolvimento:', id);

    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        map(() => {
          console.log('✅ Desenvolvimento removido com sucesso');
        }),
        catchError(error => {
          console.error('❌ Erro ao remover desenvolvimento:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 🔄 ATIVAR/DESATIVAR - Alterna status ativo do desenvolvimento
   */
  toggleDevelopmentStatus(id: string, active: boolean): Observable<Development> {
    console.log(`🔄 ${active ? 'Ativando' : 'Desativando'} desenvolvimento:`, id);

    return this.http.patch<DevelopmentResponse>(`${this.baseUrl}/${id}/toggle-status`, { active })
      .pipe(
        map(response => {
          console.log('✅ Status do desenvolvimento alterado:', response.data);
          return response.data;
        }),
        catchError(error => {
          console.error('❌ Erro ao alterar status do desenvolvimento:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  // ============================================
  // MÉTODOS ESPECIAIS
  // ============================================

  /**
   * 📊 ESTATÍSTICAS - Busca estatísticas dos desenvolvimentos
   */
  getDevelopmentStats(filters?: Partial<DevelopmentFilters>): Observable<any> {
    let params = new HttpParams();

    if (filters?.clientId) {
      params = params.set('clientId', filters.clientId);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<any>(`${this.baseUrl}/stats`, { params })
      .pipe(
        catchError(error => {
          console.error('❌ Erro ao buscar estatísticas:', error);
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
   * 📅 ATRASADOS - Busca desenvolvimentos atrasados
   */
  getOverdueDevelopments(filters?: Partial<DevelopmentFilters>): Observable<DevelopmentListResponse> {
    let params = new HttpParams();

    // Filtros opcionais
    if (filters?.clientId) {
      params = params.set('clientId', filters.clientId);
    }

    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }

    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<DevelopmentListResponse>(`${this.baseUrl}/overdue`, { params })
      .pipe(
        catchError(error => {
          console.error('❌ Erro ao buscar desenvolvimentos atrasados:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  /**
   * 📅 FORMATAR DATA - Converte data para string ISO
   */
  private formatDate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    return date;
  }

  /**
   * ⚠️ TRATAR ERRO - Processa erros da API
   */
  private handleError(error: any): Error {
    let errorMessage = 'Erro interno do servidor';

    if (error.error) {
      // Erro da API
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.errors && Array.isArray(error.error.errors)) {
        // Erros de validação
        errorMessage = error.error.errors.map((err: any) => err.message || err).join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Log para debug
    console.error('🔍 Detalhes do erro:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });

    return new Error(errorMessage);
  }
}