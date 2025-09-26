// shared/services/production-receipt/production-receipt.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ProductionReceiptFilters,
  ProductionReceiptListResponse,
  ProductionReceiptResponse,
  CreateProductionReceiptRequest,
  UpdateProductionReceiptRequest,
  ProductionReceiptStatistics,
  PaymentMethod,
  PaymentStatus
} from '../../../models/production-receipt/production-receipt';

@Injectable({
  providedIn: 'root'
})
export class ProductionReceiptService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/production-receipts`;

  // ============================================
  // MÉTODOS CRUD PRINCIPAIS
  // ============================================

  /**
   * 📋 LISTAR - Busca recebimentos com filtros e paginação
   */
  getProductionReceipts(filters: ProductionReceiptFilters = {}): Observable<ProductionReceiptListResponse> {
    let params = new HttpParams();

    // Adicionar filtros como parâmetros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductionReceiptListResponse>(this.API_URL, { params });
  }

  /**
   * 🔍 BUSCAR POR ID - Busca recebimento específico por ID ou internalReference
   */
  getProductionReceiptById(id: string): Observable<ProductionReceiptResponse> {
    return this.http.get<ProductionReceiptResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * ➕ CRIAR - Cria novo recebimento
   */
  createProductionReceipt(data: CreateProductionReceiptRequest): Observable<ProductionReceiptResponse> {
    return this.http.post<ProductionReceiptResponse>(this.API_URL, data);
  }

  /**
   * ✏️ ATUALIZAR - Atualiza recebimento existente
   */
  updateProductionReceipt(id: string, data: UpdateProductionReceiptRequest): Observable<ProductionReceiptResponse> {
    return this.http.put<ProductionReceiptResponse>(`${this.API_URL}/${id}`, data);
  }

  /**
   * 🗑️ DELETAR - Remove recebimento (soft delete)
   */
  deleteProductionReceipt(id: string): Observable<ProductionReceiptResponse> {
    return this.http.delete<ProductionReceiptResponse>(`${this.API_URL}/${id}`);
  }

  // ============================================
  // MÉTODOS ESPECÍFICOS DE PAGAMENTO
  // ============================================

  /**
   * 💳 PROCESSAR PAGAMENTO - Processa pagamento do recebimento
   */
  processPayment(id: string, amount: number, paymentDate?: string): Observable<ProductionReceiptResponse> {
    const body = {
      amount,
      paymentDate: paymentDate || new Date().toISOString()
    };
    return this.http.post<ProductionReceiptResponse>(`${this.API_URL}/${id}/process-payment`, body);
  }

  /**
   * 🔄 ATUALIZAR STATUS PAGAMENTO - Atualiza apenas o status de pagamento
   */
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paymentDate?: string): Observable<ProductionReceiptResponse> {
    const body = {
      paymentStatus,
      paymentDate: paymentStatus === 'PAID' ? (paymentDate || new Date().toISOString()) : undefined
    };
    return this.http.patch<ProductionReceiptResponse>(`${this.API_URL}/${id}/payment-status`, body);
  }

  /**
   * 🔄 ATUALIZAR STATUS - Atualiza status do recebimento (método genérico para status-updater)
   */
  updateStatus(id: string, status: string): Observable<ProductionReceiptResponse> {
    const body = { paymentStatus: status as PaymentStatus };
    return this.http.patch<ProductionReceiptResponse>(`${this.API_URL}/${id}/payment-status`, body);
  }

  /**
   * ⚡ ATIVAR RECEBIMENTO - Reativa recebimento desativado
   */
  activateProductionReceipt(id: string): Observable<ProductionReceiptResponse> {
    return this.http.post<ProductionReceiptResponse>(`${this.API_URL}/${id}/activate`, {});
  }

  // ============================================
  // MÉTODOS DE BUSCA ESPECÍFICA
  // ============================================

  /**
   * 🔍 BUSCAR POR ORDEM DE PRODUÇÃO - Busca recebimento de uma ordem específica
   */
  getProductionReceiptByProductionOrder(productionOrderId: string): Observable<ProductionReceiptResponse> {
    return this.http.get<ProductionReceiptResponse>(`${this.API_URL}/by-production-order/${productionOrderId}`);
  }

  /**
   * ⏰ BUSCAR VENCIDOS - Lista recebimentos em atraso
   */
  getOverdueReceipts(): Observable<ProductionReceiptListResponse> {
    return this.http.get<ProductionReceiptListResponse>(`${this.API_URL}/overdue`);
  }

  /**
   * 🔍 BUSCAR POR STATUS - Lista recebimentos por status de pagamento
   */
  getProductionReceiptsByPaymentStatus(paymentStatus: PaymentStatus, filters: Partial<ProductionReceiptFilters> = {}): Observable<ProductionReceiptListResponse> {
    const searchFilters = { ...filters, paymentStatus };
    return this.getProductionReceipts(searchFilters);
  }

  /**
   * 💳 BUSCAR POR MÉTODO - Lista recebimentos por método de pagamento
   */
  getProductionReceiptsByPaymentMethod(paymentMethod: PaymentMethod, filters: Partial<ProductionReceiptFilters> = {}): Observable<ProductionReceiptListResponse> {
    const searchFilters = { ...filters, paymentMethod };
    return this.getProductionReceipts(searchFilters);
  }

  /**
   * 🔍 BUSCAR TEXTO - Busca recebimentos por texto livre
   */
  searchProductionReceipts(searchTerm: string, filters: Partial<ProductionReceiptFilters> = {}): Observable<ProductionReceiptListResponse> {
    const searchFilters = { ...filters, search: searchTerm };
    return this.getProductionReceipts(searchFilters);
  }

  /**
   * 📅 BUSCAR POR PERÍODO - Lista recebimentos por período de criação
   */
  getProductionReceiptsByPeriod(startDate: string, endDate: string, filters: Partial<ProductionReceiptFilters> = {}): Observable<ProductionReceiptListResponse> {
    const searchFilters = {
      ...filters,
      createdFrom: startDate,
      createdTo: endDate
    };
    return this.getProductionReceipts(searchFilters);
  }

  /**
   * 📅 BUSCAR POR VENCIMENTO - Lista recebimentos por período de vencimento
   */
  getProductionReceiptsByDuePeriod(startDate: string, endDate: string, filters: Partial<ProductionReceiptFilters> = {}): Observable<ProductionReceiptListResponse> {
    const searchFilters = {
      ...filters,
      dueDateFrom: startDate,
      dueDateTo: endDate
    };
    return this.getProductionReceipts(searchFilters);
  }

  // ============================================
  // MÉTODOS DE ESTATÍSTICAS E RELATÓRIOS
  // ============================================

  /**
   * 📊 ESTATÍSTICAS - Busca estatísticas dos recebimentos
   */
  getProductionReceiptStats(): Observable<{ success: boolean; data: ProductionReceiptStatistics }> {
    return this.http.get<{ success: boolean; data: ProductionReceiptStatistics }>(`${this.API_URL}/stats`);
  }

  /**
   * 📈 ESTATÍSTICAS POR PERÍODO - Busca estatísticas por data
   */
  getProductionReceiptStatsByPeriod(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.API_URL}/stats/period`, { params });
  }

  /**
   * 🎯 ESTATÍSTICAS POR STATUS - Conta recebimentos por status
   */
  getProductionReceiptStatusCount(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats/payment-status`);
  }

  /**
   * 💳 ESTATÍSTICAS POR MÉTODO - Conta recebimentos por método de pagamento
   */
  getProductionReceiptPaymentMethodCount(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats/payment-methods`);
  }

  /**
   * ⚠️ ESTATÍSTICAS DE INADIMPLÊNCIA - Conta recebimentos vencidos
   */
  getOverdueStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats/overdue`);
  }

  // ============================================
  // MÉTODOS DE EXPORTAÇÃO
  // ============================================

  /**
   * 📄 EXPORTAR CSV - Exporta recebimentos em CSV
   */
  exportToCsv(filters: ProductionReceiptFilters = {}): Observable<Blob> {
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
   * 📊 EXPORTAR EXCEL - Exporta recebimentos em Excel
   */
  exportToExcel(filters: ProductionReceiptFilters = {}): Observable<Blob> {
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
   * 🧾 GERAR RELATÓRIO - Gera relatório detalhado de recebimentos
   */
  generateReport(filters: ProductionReceiptFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.API_URL}/reports/detailed`, {
      params,
      responseType: 'blob'
    });
  }

  // ============================================
  // MÉTODOS DE VALIDAÇÃO E UTILITÁRIOS
  // ============================================

  /**
   * ✅ VALIDAR RECEBIMENTO - Verifica se recebimento pode ser criado
   */
  validateProductionReceipt(data: CreateProductionReceiptRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/validate`, data);
  }

  /**
   * 🔍 VERIFICAR DUPLICATAS - Verifica se já existe recebimento para a ordem
   */
  checkDuplicateReceipt(productionOrderId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/check-duplicate/${productionOrderId}`);
  }

  /**
   * 📋 BUSCAR PRÓXIMA REFERÊNCIA - Gera próxima referência interna
   */
  getNextInternalReference(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/next-reference`);
  }

  /**
   * 💰 CALCULAR VALORES - Calcula valores baseado nos parâmetros
   */
  calculateReceiptValues(productionOrderId: string, paymentMethod: PaymentMethod): Observable<any> {
    const params = new HttpParams()
      .set('productionOrderId', productionOrderId)
      .set('paymentMethod', paymentMethod);

    return this.http.get<any>(`${this.API_URL}/calculate-values`, { params });
  }

  // ============================================
  // MÉTODOS DE WORKFLOW/FLUXO
  // ============================================

  /**
   * 📋 CRIAR A PARTIR DE ORDEM - Cria recebimento automaticamente de uma ordem
   */
  createFromProductionOrder(productionOrderId: string, paymentMethod: PaymentMethod, dueDate?: string): Observable<ProductionReceiptResponse> {
    const body = {
      productionOrderId,
      paymentMethod,
      dueDate: dueDate || (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30); // 30 dias padrão
        return date.toISOString().split('T')[0];
      })()
    };
    return this.http.post<ProductionReceiptResponse>(`${this.API_URL}/create-from-order`, body);
  }

  /**
   * 💳 PROCESSAR PAGAMENTO PARCIAL - Processa pagamento parcial
   */
  processPartialPayment(id: string, amount: number, paymentDate?: string, notes?: string): Observable<ProductionReceiptResponse> {
    const body = {
      amount,
      paymentDate: paymentDate || new Date().toISOString(),
      notes
    };
    return this.http.post<ProductionReceiptResponse>(`${this.API_URL}/${id}/partial-payment`, body);
  }

  /**
   * 🔄 REVERTER PAGAMENTO - Reverte pagamento realizado
   */
  reversePayment(id: string, reason: string): Observable<ProductionReceiptResponse> {
    const body = { reason };
    return this.http.post<ProductionReceiptResponse>(`${this.API_URL}/${id}/reverse-payment`, body);
  }

  /**
   * 📧 ENVIAR COBRANÇA - Envia e-mail de cobrança
   */
  sendPaymentReminder(id: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${id}/send-reminder`, {});
  }
}