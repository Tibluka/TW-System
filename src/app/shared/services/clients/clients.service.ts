// src/app/shared/services/client/client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ClientFilters, ClientListResponse, ClientResponse, CreateClientRequest, UpdateClientRequest } from '../../../models/clients/clients';
import { ApiResponse } from '../development/development.service';


@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private apiUrl = `${environment.apiUrl}/clients`;

    constructor(private http: HttpClient) { }

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * Lista todos os clientes com paginação e filtros
     * GET /api/v1/clients
     */
    getClients(filters: ClientFilters = {}): Observable<ClientListResponse> {
        debugger
        let params = new HttpParams();

        // Adiciona parâmetros apenas se existirem
        Object.keys(filters).forEach(key => {
            const value = (filters as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params = params.append(key, value.toString());
            }
        });

        return this.http.get<ClientListResponse>(this.apiUrl, { params })
            .pipe(catchError(this.handleError));
    }

    /**
     * Busca cliente por ID
     * GET /api/v1/clients/:id
     */
    getClientById(id: string): Observable<ClientResponse> {
        return this.http.get<ClientResponse>(`${this.apiUrl}/${id}`)
            .pipe(catchError(this.handleError));
    }

    /**
     * Cria novo cliente
     * POST /api/v1/clients
     */
    createClient(clientData: CreateClientRequest): Observable<ClientResponse> {
        return this.http.post<ClientResponse>(this.apiUrl, clientData)
            .pipe(catchError(this.handleError));
    }

    /**
     * Atualiza cliente existente
     * PUT /api/v1/clients/:id
     */
    updateClient(id: string, clientData: UpdateClientRequest): Observable<ClientResponse> {
        return this.http.put<ClientResponse>(`${this.apiUrl}/${id}`, clientData)
            .pipe(catchError(this.handleError));
    }

    /**
     * Deleta cliente (soft delete)
     * DELETE /api/v1/clients/:id
     */
    deleteClient(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`)
            .pipe(catchError(this.handleError));
    }

    // ============================================
    // TRATAMENTO DE ERROS
    // ============================================

    private handleError(error: HttpErrorResponse): Observable<never> {
        let userMessage = 'Algo deu errado; tente novamente mais tarde.';

        if (error.error instanceof ErrorEvent) {
            // Erro do lado do cliente
            userMessage = 'Problema de conexão. Verifique sua internet.';
        } else {
            // Erro do lado do servidor
            switch (error.status) {
                case 400:
                    userMessage = error.error?.message || 'Dados inválidos fornecidos.';
                    break;
                case 401:
                    userMessage = 'Você não está autorizado. Faça login novamente.';
                    break;
                case 403:
                    userMessage = 'Você não tem permissão para esta operação.';
                    break;
                case 404:
                    userMessage = 'Cliente não encontrado.';
                    break;
                case 422:
                    userMessage = error.error?.message || 'Dados fornecidos são inválidos.';
                    break;
                case 500:
                    userMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
                    break;
                default:
                    userMessage = error.error?.message || userMessage;
            }
        }

        console.error('Erro no ClientService:', error);

        return throwError(() => ({
            message: userMessage,
            originalError: error,
            status: error.status
        }));
    }
}