

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductionOrderFilters, ProductionOrderListResponse, ProductionOrderResponse, CreateProductionOrderRequest, UpdateProductionOrderRequest } from '../../../models/production-orders/production-orders';

@Injectable({
  providedIn: 'root'
})
export class ProductionOrderService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/production-orders`;


  /**
   * 📋 LISTAR - Busca ordens de produção com filtros e paginação
   */
  getProductionOrders(filters: ProductionOrderFilters = {}): Observable<ProductionOrderListResponse> {
    let params = new HttpParams();


    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductionOrderListResponse>(this.API_URL, { params });
  }

  /**
   * 🔍 BUSCAR POR ID - Busca ordem de produção específica
   */
  getProductionOrderById(id: string): Observable<ProductionOrderResponse> {
    return this.http.get<ProductionOrderResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * ➕ CRIAR - Cria nova ordem de produção
   */
  createProductionOrder(data: CreateProductionOrderRequest): Observable<ProductionOrderResponse> {
    return this.http.post<ProductionOrderResponse>(this.API_URL, data);
  }

  /**
   * ✏️ ATUALIZAR - Atualiza ordem de produção existente
   */
  updateProductionOrder(id: string, data: UpdateProductionOrderRequest): Observable<ProductionOrderResponse> {
    return this.http.put<ProductionOrderResponse>(`${this.API_URL}/${id}`, data);
  }

  /**
   * 🗑️ DELETAR - Remove ordem de produção (soft delete)
   */
  deleteProductionOrder(id: string): Observable<ProductionOrderResponse> {
    return this.http.delete<ProductionOrderResponse>(`${this.API_URL}/${id}`);
  }


  /**
   * 🔄 ATUALIZAR STATUS - Atualiza apenas o status da ordem
   */
  updateStatus(id: string, status: string): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/status`, { status });
  }

  /**
   * 🚨 ATUALIZAR PRIORIDADE - Atualiza apenas a prioridade da ordem
   */
  updatePriority(id: string, priority: string): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/priority`, { priority });
  }

  /**
   * 🧪 TOGGLE PILOTO - Alterna status de piloto da ordem
   */
  togglePilot(id: string, pilot: boolean): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/pilot`, { pilot });
  }

  /**
   * 📝 ATUALIZAR OBSERVAÇÕES - Atualiza apenas as observações
   */
  updateObservations(id: string, observations: string): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/observations`, { observations });
  }


  /**
   * 🔍 BUSCAR POR DESENVOLVIMENTO - Lista ordens de um desenvolvimento específico
   */
  getProductionOrdersByDevelopment(developmentId: string, filters: Partial<ProductionOrderFilters> = {}): Observable<ProductionOrderListResponse> {
    const searchFilters = { ...filters, developmentId };
    return this.getProductionOrders(searchFilters);
  }

  /**
   * 🧪 BUSCAR PILOTOS - Lista apenas ordens piloto
   */
  getPilotOrders(filters: Partial<ProductionOrderFilters> = {}): Observable<ProductionOrderListResponse> {
    const searchFilters = { ...filters, pilot: true };
    return this.getProductionOrders(searchFilters);
  }

  /**
   * ⚡ BUSCAR POR PRIORIDADE - Lista ordens por prioridade
   */
  getProductionOrdersByPriority(priority: string, filters: Partial<ProductionOrderFilters> = {}): Observable<ProductionOrderListResponse> {
    const searchFilters = { ...filters, priority: priority as any };
    return this.getProductionOrders(searchFilters);
  }

  /**
   * 📊 BUSCAR POR STATUS - Lista ordens por status
   */
  getProductionOrdersByStatus(status: string, filters: Partial<ProductionOrderFilters> = {}): Observable<ProductionOrderListResponse> {
    const searchFilters = { ...filters, status: status as any };
    return this.getProductionOrders(searchFilters);
  }

  /**
   * 🔍 BUSCAR TEXTO - Busca ordens por texto livre
   */
  searchProductionOrders(searchTerm: string, filters: Partial<ProductionOrderFilters> = {}): Observable<ProductionOrderListResponse> {
    const searchFilters = { ...filters, search: searchTerm };
    return this.getProductionOrders(searchFilters);
  }


  /**
   * 📊 ESTATÍSTICAS - Busca estatísticas das ordens de produção
   */
  getProductionOrderStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats`);
  }

  /**
   * 📈 ESTATÍSTICAS POR PERÍODO - Busca estatísticas por data
   */
  getProductionOrderStatsByPeriod(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.API_URL}/stats/period`, { params });
  }

  /**
   * 🎯 ESTATÍSTICAS POR STATUS - Conta ordens por status
   */
  getProductionOrderStatusCount(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats/status`);
  }

  /**
   * 🚨 ESTATÍSTICAS POR PRIORIDADE - Conta ordens por prioridade
   */
  getProductionOrderPriorityCount(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats/priority`);
  }


  /**
   * 📄 EXPORTAR CSV - Exporta ordens de produção em CSV
   */
  exportToCsv(filters: ProductionOrderFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.API_URL}/export/csv`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * 📊 EXPORTAR EXCEL - Exporta ordens de produção em Excel
   */
  exportToExcel(filters: ProductionOrderFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.API_URL}/export/excel`, {
      params,
      responseType: 'blob'
    });
  }


  /**
   * ▶️ INICIAR PRODUÇÃO - Move ordem para produção iniciada
   */
  startProduction(id: string): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/start-production`, {});
  }

  /**
   * 🧪 ENVIAR PILOTO - Move ordem para piloto enviado
   */
  sendPilot(id: string): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/send-pilot`, {});
  }

  /**
   * ✅ APROVAR PILOTO - Move ordem para piloto aprovado
   */
  approvePilot(id: string): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/approve-pilot`, {});
  }

  /**
   * ❌ REJEITAR PILOTO - Volta ordem para produção piloto
   */
  rejectPilot(id: string, reason?: string): Observable<ProductionOrderResponse> {
    const body = reason ? { reason } : {};
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/reject-pilot`, body);
  }

  /**
   * 🏁 FINALIZAR ORDEM - Move ordem para finalizada
   */
  finalizeOrder(id: string): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.API_URL}/${id}/finalize`, {});
  }


  /**
   * ✅ VALIDAR ORDEM - Verifica se ordem pode ser criada
   */
  validateProductionOrder(data: CreateProductionOrderRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/validate`, data);
  }

  /**
   * 🔍 VERIFICAR DUPLICATAS - Verifica se já existe ordem para o desenvolvimento
   */
  checkDuplicateOrder(developmentId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/check-duplicate/${developmentId}`);
  }

  /**
   * 📋 BUSCAR PRÓXIMA REFERÊNCIA - Gera próxima referência interna
   */
  getNextInternalReference(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/next-reference`);
  }
}
