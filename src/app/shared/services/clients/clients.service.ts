
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClientFilters, ClientListResponse, ClientResponse, CreateClientRequest, UpdateClientRequest } from '../../../models/clients/clients';

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private apiUrl = `${environment.apiUrl}/clients`;

    constructor(private http: HttpClient) { }


    /**
     * Lista todos os clientes com paginação e filtros
     * GET /api/v1/clients
     */
    getClients(filters: ClientFilters = {}): Observable<ClientListResponse> {
        let params = new HttpParams();


        Object.keys(filters).forEach(key => {
            const value = (filters as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params = params.append(key, value.toString());
            }
        });


        return this.http.get<ClientListResponse>(this.apiUrl, { params });
    }

    /**
     * Busca cliente por ID
     * GET /api/v1/clients/:id
     */
    getClientById(id: string): Observable<ClientResponse> {
        return this.http.get<ClientResponse>(`${this.apiUrl}/${id}`);
    }

    /**
     * Cria novo cliente
     * POST /api/v1/clients
     */
    createClient(clientData: CreateClientRequest): Observable<ClientResponse> {
        return this.http.post<ClientResponse>(this.apiUrl, clientData);
    }

    /**
     * Atualiza cliente existente
     * PUT /api/v1/clients/:id
     */
    updateClient(id: string, clientData: UpdateClientRequest): Observable<ClientResponse> {
        return this.http.put<ClientResponse>(`${this.apiUrl}/${id}`, clientData);
    }

    /**
     * Deleta cliente (soft delete)
     * DELETE /api/v1/clients/:id
     */
    deleteClient(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }


    /**
     * Busca clientes por texto (helper method)
     */
    searchClients(searchTerm: string, page: number = 1): Observable<ClientListResponse> {
        const filters: ClientFilters = {
            search: searchTerm.trim(),
            page,
            limit: 10,
            active: true
        };

        return this.getClients(filters);
    }

    /**
     * Lista apenas clientes ativos
     */
    getActiveClients(page: number = 1): Observable<ClientListResponse> {
        const filters: ClientFilters = {
            page,
            limit: 10,
            active: true
        };

        return this.getClients(filters);
    }

    /**
     * Lista apenas clientes inativos
     */
    getInactiveClients(page: number = 1): Observable<ClientListResponse> {
        const filters: ClientFilters = {
            page,
            limit: 10,
            active: false
        };

        return this.getClients(filters);
    }

}
