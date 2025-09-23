// services/development/development.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  DevelopmentFilters,
  DevelopmentListResponse,
  Development,
  DevelopmentResponse,
  CreateDevelopmentRequest,
  UpdateDevelopmentRequest,
  DevelopmentStatistics,
  ProductionTypeEnum
} from '../../../models/developments/developments';

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

    if (filters.active !== undefined) {
      params = params.set('active', filters.active.toString());
    }

    // ✅ FILTRO SIMPLIFICADO - productionType como string
    if (filters.productionType) {
      params = params.set('productionType', filters.productionType);
    }

    // Filtros por data de criação
    if (filters.createdFrom) {
      params = params.set('createdFrom', this.formatDate(filters.createdFrom));
    }

    if (filters.createdTo) {
      params = params.set('createdTo', this.formatDate(filters.createdTo));
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
   * 🔍 BUSCAR POR REFERÊNCIA INTERNA - Retorna desenvolvimento por internal reference
   */
  getDevelopmentByInternalReference(internalReference: string): Observable<DevelopmentResponse> {
    console.log('🔍 Buscando desenvolvimento por referência interna:', internalReference);

    return this.http.get<DevelopmentResponse>(`${this.baseUrl}/by-internal-reference/${internalReference}`)
      .pipe(
        map(response => {
          console.log('✅ Desenvolvimento encontrado por referência:', response.data);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro ao buscar desenvolvimento por referência:', error);
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
   * 🔄 ALTERAR STATUS - Atualiza apenas o status do desenvolvimento
   */
  updateDevelopmentStatus(id: string, status: string): Observable<Development> {
    console.log(`🔄 Alterando status do desenvolvimento ${id} para:`, status);

    return this.http.patch<DevelopmentResponse>(`${this.baseUrl}/${id}/status`, { status })
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

  /**
   * ♻️ ATIVAR - Reativa desenvolvimento
   */
  activateDevelopment(id: string): Observable<Development> {
    console.log('♻️ Ativando desenvolvimento:', id);

    return this.http.post<DevelopmentResponse>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(
        map(response => {
          console.log('✅ Desenvolvimento ativado:', response.data);
          return response.data;
        }),
        catchError(error => {
          console.error('❌ Erro ao ativar desenvolvimento:', error);
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
  getDevelopmentStats(filters?: Partial<DevelopmentFilters>): Observable<DevelopmentStatistics> {
    let params = new HttpParams();

    if (filters?.clientId) {
      params = params.set('clientId', filters.clientId);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    // ✅ FILTRO ATUALIZADO
    if (filters?.productionType) {
      params = params.set('productionType', filters.productionType);
    }

    console.log('📊 Buscando estatísticas de desenvolvimentos');

    return this.http.get<{ success: boolean; data: DevelopmentStatistics }>(`${this.baseUrl}/stats`, { params })
      .pipe(
        map(response => {
          console.log('✅ Estatísticas recebidas:', response.data);
          return response.data;
        }),
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
    console.log('📋 Buscando desenvolvimentos do cliente:', clientId);

    return this.http.get<DevelopmentListResponse>(`${this.baseUrl}/by-client/${clientId}`)
      .pipe(
        map(response => {
          console.log('✅ Desenvolvimentos do cliente recebidos:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro ao buscar desenvolvimentos do cliente:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 🔍 FILTRAR POR TIPO DE PRODUÇÃO - Busca desenvolvimentos por tipo específico
   */
  getDevelopmentsByProductionType(type: ProductionTypeEnum, filters?: Partial<DevelopmentFilters>): Observable<DevelopmentListResponse> {
    const productionTypeFilters: DevelopmentFilters = {
      ...filters,
      productionType: type
    };

    console.log(`🔍 Buscando desenvolvimentos do tipo ${type}:`, productionTypeFilters);
    return this.listDevelopments(productionTypeFilters);
  }

  /**
   * ✅ BUSCAR APROVADOS - Retorna apenas desenvolvimentos aprovados (para criar ordens de produção)
   */
  getApprovedDevelopments(filters?: Partial<DevelopmentFilters>): Observable<DevelopmentListResponse> {
    const approvedFilters: DevelopmentFilters = {
      ...filters,
      status: 'APPROVED',
      active: true
    };

    console.log('✅ Buscando desenvolvimentos aprovados para ordens de produção');
    return this.listDevelopments(approvedFilters);
  }

  // ============================================
  // MÉTODOS DE IMAGEM
  // ============================================

  /**
   * 📷 UPLOAD IMAGEM - Faz upload da imagem da peça
   */
  uploadImage(developmentId: string, file: File): Observable<any> {
    console.log('📷 Fazendo upload de imagem para desenvolvimento:', developmentId);

    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<any>(`${this.baseUrl}/${developmentId}/image`, formData)
      .pipe(
        map(response => {
          console.log('✅ Imagem enviada com sucesso:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro ao fazer upload da imagem:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 🗑️ REMOVER IMAGEM - Remove imagem da peça
   */
  removeImage(developmentId: string): Observable<any> {
    console.log('🗑️ Removendo imagem do desenvolvimento:', developmentId);

    return this.http.delete<any>(`${this.baseUrl}/${developmentId}/image`)
      .pipe(
        map(response => {
          console.log('✅ Imagem removida com sucesso:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro ao remover imagem:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * 👁️ OBTER IMAGEM - Busca informações da imagem
   */
  getImage(developmentId: string): Observable<any> {
    console.log('👁️ Buscando imagem do desenvolvimento:', developmentId);

    return this.http.get<any>(`${this.baseUrl}/${developmentId}/image`)
      .pipe(
        catchError(error => {
          console.error('❌ Erro ao buscar imagem:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  // ============================================
  // MÉTODOS DE EXPORT (NOVOS)
  // ============================================

  /**
   * 📄 EXPORTAR CSV - Exporta desenvolvimentos em CSV
   */
  exportToCsv(filters: DevelopmentFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('📄 Exportando desenvolvimentos para CSV');

    return this.http.get(`${this.baseUrl}/export/csv`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('❌ Erro ao exportar CSV:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * 📊 EXPORTAR EXCEL - Exporta desenvolvimentos em Excel
   */
  exportToExcel(filters: DevelopmentFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('📊 Exportando desenvolvimentos para Excel');

    return this.http.get(`${this.baseUrl}/export/excel`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('❌ Erro ao exportar Excel:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  // ============================================
  // MÉTODOS DE VALIDAÇÃO (NOVOS)
  // ============================================

  /**
   * ✨ VALIDAR REFERÊNCIA INTERNA - Verifica se referência interna existe
   */
  validateInternalReference(internalReference: string): Observable<{ exists: boolean; development?: Development }> {
    console.log('✨ Validando referência interna:', internalReference);

    return this.http.get<{ success: boolean; data: { exists: boolean; development?: Development } }>(
      `${this.baseUrl}/validate/internal-reference/${internalReference}`
    ).pipe(
      map(response => {
        console.log('✅ Validação da referência interna:', response.data);
        return response.data;
      }),
      catchError(error => {
        console.error('❌ Erro ao validar referência interna:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * ✨ VALIDAR REFERÊNCIA DO CLIENTE - Verifica se referência do cliente já existe
   */
  validateClientReference(clientId: string, clientReference: string): Observable<{ exists: boolean }> {
    console.log('✨ Validando referência do cliente:', { clientId, clientReference });

    return this.http.post<{ success: boolean; data: { exists: boolean } }>(
      `${this.baseUrl}/validate/client-reference`,
      { clientId, clientReference }
    ).pipe(
      map(response => {
        console.log('✅ Validação da referência do cliente:', response.data);
        return response.data;
      }),
      catchError(error => {
        console.error('❌ Erro ao validar referência do cliente:', error);
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