import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AddressData {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean; // Propriedade opcional para indicar erro na API
}

export interface AddressFormatted {
    cep: string;
    street: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
}

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    private readonly VIA_CEP_BASE_URL = 'https://viacep.com.br/ws';

    constructor(private http: HttpClient) { }

    /**
     * 🔍 GET ADDRESS BY CEP - Busca endereço por CEP usando ViaCEP
     */
    getAddressByCep(cep: string): Observable<AddressFormatted> {

        const cleanCep = cep.replace(/\D/g, '');


        if (cleanCep.length !== 8) {
            return throwError(() => new Error('CEP deve ter 8 dígitos'));
        }

        const url = `${this.VIA_CEP_BASE_URL}/${cleanCep}/json`;

        return this.http.get<AddressData>(url).pipe(
            map(response => {

                if (response.erro) {
                    throw new Error('CEP não encontrado');
                }


                return this.formatAddressData(response);
            }),
            catchError(error => {
                return throwError(() => new Error('Erro ao buscar endereço. Verifique o CEP e tente novamente.'));
            })
        );
    }

    /**
     * 📝 FORMAT ADDRESS DATA - Formata dados do ViaCEP para o padrão do sistema
     */
    private formatAddressData(data: AddressData): AddressFormatted {
        return {
            cep: this.formatCep(data.cep),
            street: data.logradouro || '',
            complement: data.complemento || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
            ibge: data.ibge || '',
            gia: data.gia || '',
            ddd: data.ddd || '',
            siafi: data.siafi || ''
        };
    }

    /**
     * 🎯 FORMAT CEP - Formata CEP para exibição (00000-000)
     */
    private formatCep(cep: string): string {
        const cleanCep = cep.replace(/\D/g, '');
        return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    /**
     * ✅ VALIDATE CEP - Valida formato do CEP
     */
    validateCep(cep: string): boolean {
        const cleanCep = cep.replace(/\D/g, '');
        return cleanCep.length === 8 && /^\d{8}$/.test(cleanCep);
    }

    /**
     * 🔍 SEARCH ADDRESSES - Busca endereços por UF, cidade e logradouro
     */
    searchAddresses(uf: string, city: string, street: string): Observable<AddressFormatted[]> {
        const cleanUf = uf.replace(/\D/g, '');
        const cleanCity = city.replace(/\D/g, '');
        const cleanStreet = street.replace(/\D/g, '');

        if (cleanUf.length !== 2) {
            return throwError(() => new Error('UF deve ter 2 caracteres'));
        }

        if (cleanCity.length < 3) {
            return throwError(() => new Error('Cidade deve ter pelo menos 3 caracteres'));
        }

        if (cleanStreet.length < 3) {
            return throwError(() => new Error('Logradouro deve ter pelo menos 3 caracteres'));
        }

        const url = `${this.VIA_CEP_BASE_URL}/${cleanUf}/${cleanCity}/${cleanStreet}/json`;

        return this.http.get<AddressData[]>(url).pipe(
            map(response => {

                const addresses = Array.isArray(response) ? response : [response];

                return addresses
                    .filter(addr => !addr.erro) // Remove CEPs com erro
                    .map(addr => this.formatAddressData(addr));
            }),
            catchError(error => {
                return throwError(() => new Error('Erro ao buscar endereços. Tente novamente.'));
            })
        );
    }

    /**
     * 📍 GET ADDRESS BY COORDINATES - Busca endereço por coordenadas (lat, lng)
     * Nota: ViaCEP não suporta busca por coordenadas diretamente
     * Este método é um placeholder para futuras implementações
     */
    getAddressByCoordinates(lat: number, lng: number): Observable<AddressFormatted> {
        return throwError(() => new Error('Busca por coordenadas não implementada. Use getAddressByCep() ou searchAddresses().'));
    }

    /**
     * 🏠 GET ADDRESS SUGGESTIONS - Sugere endereços baseado em texto parcial
     */
    getAddressSuggestions(query: string): Observable<AddressFormatted[]> {
        if (!query || query.length < 3) {
            return throwError(() => new Error('Digite pelo menos 3 caracteres para buscar'));
        }


        const cleanQuery = query.trim().replace(/[^\w\s]/g, '');

        if (cleanQuery.length < 3) {
            return throwError(() => new Error('Digite pelo menos 3 caracteres válidos para buscar'));
        }


        return throwError(() => new Error('Sugestões de endereço não implementadas. Use searchAddresses() com parâmetros específicos.'));
    }
}
