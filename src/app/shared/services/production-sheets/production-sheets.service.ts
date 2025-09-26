import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ProductionSheet {
  _id: string;
  productionOrderId: string;
  productionOrder?: any;
  internalReference?: string;
  entryDate: Date | string;
  expectedExitDate: Date | string;
  machine: 1 | 2 | 3 | 4;
  stage: ProductionSheetStage;
  productionNotes?: string;
  active?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ProductionSheetStage =
  | 'PRINTING'
  | 'CALENDERING'
  | 'FINISHED';

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

export interface ProductionSheetFilters {
  search?: string;
  productionOrderId?: string;
  machine?: 1 | 2 | 3 | 4;
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

export interface CreateProductionSheetRequest {
  productionOrderId: string;
  expectedExitDate: Date | string;
  machine: 1 | 2 | 3 | 4;
  entryDate?: Date | string;
  productionNotes?: string;
}

export interface UpdateProductionSheetRequest extends Partial<CreateProductionSheetRequest> {
  stage?: ProductionSheetStage;
}

export interface UpdateStageRequest {
  stage: ProductionSheetStage;
}

export interface ProductionSheetListResponse {
  success: boolean;
  data: ProductionSheet[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
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

@Injectable({
  providedIn: 'root'
})
export class ProductionSheetsService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/production-sheets`;

  /**
   * 📋 LISTAR - Busca fichas de produção com filtros e paginação
   */
  getProductionSheets(filters: ProductionSheetFilters = {}): Observable<ProductionSheetListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductionSheetListResponse>(this.API_URL, { params });
  }

  /**
   * 🔍 BUSCAR POR ID - Busca ficha de produção específica por ID ou internalReference
   */
  getProductionSheetById(id: string): Observable<ProductionSheetResponse> {
    return this.http.get<ProductionSheetResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * ➕ CRIAR - Cria nova ficha de produção
   */
  createProductionSheet(data: CreateProductionSheetRequest): Observable<ProductionSheetResponse> {
    return this.http.post<ProductionSheetResponse>(this.API_URL, data);
  }

  /**
   * ✏️ ATUALIZAR - Atualiza ficha de produção existente
   */
  updateProductionSheet(id: string, data: UpdateProductionSheetRequest): Observable<ProductionSheetResponse> {
    return this.http.patch<ProductionSheetResponse>(`${this.API_URL}/${id}/stage`, { stage: data.stage });
  }

  /**
   * 🔄 ATUALIZAR ESTÁGIO - Atualiza apenas o estágio da ficha
   */
  updateStage(id: string, data: UpdateStageRequest): Observable<ProductionSheetResponse> {
    return this.http.patch<ProductionSheetResponse>(`${this.API_URL}/${id}/stage`, data);
  }

  /**
   * ⏭️ AVANÇAR ESTÁGIO - Avança para o próximo estágio automaticamente
   */
  advanceStage(id: string, stage: string): Observable<ProductionSheetResponse> {
    return this.http.patch<ProductionSheetResponse>(`${this.API_URL}/${id}/stage`, { stage: stage });
  }

  /**
   * 🗑️ DESATIVAR - Desativa ficha de produção (soft delete)
   */
  deleteProductionSheet(id: string): Observable<ProductionSheetResponse> {
    return this.http.delete<ProductionSheetResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * ♻️ REATIVAR - Reativa ficha de produção
   */
  activateProductionSheet(id: string): Observable<ProductionSheetResponse> {
    return this.http.post<ProductionSheetResponse>(`${this.API_URL}/${id}/activate`, {});
  }

  /**
   * 📊 ESTATÍSTICAS - Busca estatísticas das fichas de produção
   */
  getStatistics(): Observable<ProductionSheetStatsResponse> {
    return this.http.get<ProductionSheetStatsResponse>(`${this.API_URL}/stats`);
  }

  /**
   * 🔍 POR ORDEM DE PRODUÇÃO - Busca ficha por ordem de produção
   */
  getByProductionOrder(productionOrderId: string): Observable<ProductionSheetResponse> {
    return this.http.get<ProductionSheetResponse>(`${this.API_URL}/by-production-order/${productionOrderId}`);
  }

  /**
   * 🖥️ POR MÁQUINA - Busca fichas por número da máquina
   */
  getByMachine(machineNumber: 1 | 2 | 3 | 4): Observable<ProductionSheetListResponse> {
    return this.http.get<ProductionSheetListResponse>(`${this.API_URL}/by-machine/${machineNumber}`);
  }

  /**
   * 🎯 LABEL ESTÁGIO - Retorna label em português para estágio
   */
  getStageLabel(stage: ProductionSheetStage): string {
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
  getMachineName(machineNumber: 1 | 2 | 3 | 4): string {
    return `Máquina ${machineNumber}`;
  }

  /**
   * ✅ VERIFICAR SE FINALIZADO - Verifica se a ficha está finalizada
   */
  isFinished(stage: ProductionSheetStage): boolean {
    return stage === 'FINISHED';
  }

  /**
   * 📅 FORMATAR DATA - Formata data para exibição
   */
  formatDate(date: Date | string | undefined): string {
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
  formatDateTime(date: Date | string | undefined): string {
    if (!date) return '-';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString('pt-BR');
    } catch {
      return '-';
    }
  }
}