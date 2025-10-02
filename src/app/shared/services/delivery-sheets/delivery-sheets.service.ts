import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DateFormatter } from '../../utils/date-formatter';
import {
    DeliverySheet,
    DeliverySheetStatus,
    CreateDeliverySheetRequest,
    UpdateDeliverySheetRequest,
    DeliverySheetFilters,
    DeliverySheetListResponse,
    DeliverySheetResponse,
    DeliveryAddress,
    DELIVERY_SHEET_STATUS_LABELS,
    DELIVERY_SHEET_STATUS_COLORS
} from '../../../models/delivery-sheets/delivery-sheets';

@Injectable({
    providedIn: 'root'
})
export class DeliverySheetsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/delivery-sheets`;

    /**
     * 📋 LISTAR FICHAS DE ENTREGA - Busca fichas com filtros
     */
    getDeliverySheets(filters: DeliverySheetFilters = {}): Observable<DeliverySheetListResponse> {
        let params = new HttpParams();


        if (filters.search) {
            params = params.set('search', filters.search);
        }

        if (filters.productionSheetId) {
            params = params.set('productionSheetId', filters.productionSheetId);
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


        if (filters.deliveryDateFrom) {
            params = params.set('deliveryDateFrom', this.formatDateToISO(filters.deliveryDateFrom));
        }

        if (filters.deliveryDateTo) {
            params = params.set('deliveryDateTo', this.formatDateToISO(filters.deliveryDateTo));
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

        return this.http.get<DeliverySheetListResponse>(this.baseUrl, { params });
    }

    /**
     * 📄 BUSCAR FICHA POR ID - Busca ficha específica
     */
    getDeliverySheetById(id: string): Observable<DeliverySheetResponse> {
        return this.http.get<DeliverySheetResponse>(`${this.baseUrl}/${id}`);
    }

    /**
     * ➕ CRIAR FICHA DE ENTREGA - Cria nova ficha
     */
    createDeliverySheet(data: CreateDeliverySheetRequest): Observable<DeliverySheetResponse> {
        return this.http.post<DeliverySheetResponse>(this.baseUrl, data);
    }

    /**
     * ✏️ ATUALIZAR FICHA DE ENTREGA - Atualiza ficha existente
     */
    updateDeliverySheet(id: string, data: UpdateDeliverySheetRequest): Observable<DeliverySheetResponse> {
        return this.http.put<DeliverySheetResponse>(`${this.baseUrl}/${id}`, data);
    }

    /**
     * 🗑️ EXCLUIR FICHA DE ENTREGA - Remove ficha (soft delete)
     */
    deleteDeliverySheet(id: string): Observable<DeliverySheetResponse> {
        return this.http.delete<DeliverySheetResponse>(`${this.baseUrl}/${id}`);
    }

    /**
     * 🔄 ATUALIZAR STATUS - Atualiza apenas o status da ficha
     */
    updateDeliverySheetStatus(id: string, status: DeliverySheetStatus): Observable<DeliverySheetResponse> {
        return this.http.patch<DeliverySheetResponse>(`${this.baseUrl}/${id}/status`, { status });
    }

    /**
     * 🏷️ LABEL STATUS - Retorna label amigável para status
     */
    getStatusLabel(status: DeliverySheetStatus): string {
        return DELIVERY_SHEET_STATUS_LABELS[status] || status;
    }

    /**
     * 🎨 COR STATUS - Retorna cor do status
     */
    getStatusColor(status: DeliverySheetStatus): string {
        return DELIVERY_SHEET_STATUS_COLORS[status] || 'neutral';
    }

    /**
     * ✅ VERIFICAR SE É FINALIZADO - Verifica se o status é finalizado
     */
    isFinished(status: DeliverySheetStatus): boolean {
        return status === 'DELIVERED';
    }

    /**
     * 🔄 PRÓXIMO STATUS - Retorna o próximo status na sequência
     */
    getNextStatus(currentStatus: DeliverySheetStatus): DeliverySheetStatus | null {
        const statusSequence: DeliverySheetStatus[] = ['CREATED', 'ON_ROUTE', 'DELIVERED'];
        const currentIndex = statusSequence.indexOf(currentStatus);

        if (currentIndex === -1 || currentIndex === statusSequence.length - 1) {
            return null;
        }

        return statusSequence[currentIndex + 1];
    }

    /**
     * 📅 FORMATAR DATA - Formata data para exibição
     */
    formatDate(date: Date | string | undefined): string {
        return DateFormatter.formatDate(date);
    }

    /**
     * ⏰ FORMATAR DATA E HORA - Formata data e hora para exibição
     */
    formatDateTime(date: Date | string | undefined): string {
        return DateFormatter.formatDateTime(date);
    }

    /**
     * 📅 FORMATAR DATA PARA ISO - Converte data para string ISO
     */
    private formatDateToISO(date: Date | string): string {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        return date;
    }
}
