import { AddressService, AddressFormatted } from '../services/address/address.service';
import { ToastService } from '../services/toast/toast.service';

/**
 * 🏠 ADDRESS UTIL - Utilitário para facilitar o uso do AddressService
 */
export class AddressUtil {

    /**
     * 🔍 FILL ADDRESS BY CEP - Preenche endereço por CEP com tratamento de erro
     */
    static fillAddressByCep(
        cep: string,
        addressService: AddressService,
        toastService: ToastService,
        onSuccess: (address: AddressFormatted) => void,
        onError?: (error: string) => void
    ): void {

        if (!addressService.validateCep(cep)) {
            const errorMsg = 'CEP inválido. Digite um CEP com 8 dígitos.';
            toastService.warning('CEP inválido', errorMsg);
            onError?.(errorMsg);
            return;
        }

        addressService.getAddressByCep(cep).subscribe({
            next: (address) => {
                onSuccess(address);
                toastService.success('Endereço encontrado!', 'CEP válido');
            },
            error: (error) => {
                const errorMsg = error.message || 'Erro ao buscar endereço';
                toastService.error('Erro ao buscar CEP', errorMsg);
                onError?.(errorMsg);
            }
        });
    }

    /**
     * 🔍 SEARCH ADDRESSES - Busca endereços com tratamento de erro
     */
    static searchAddresses(
        uf: string,
        city: string,
        street: string,
        addressService: AddressService,
        toastService: ToastService,
        onSuccess: (addresses: AddressFormatted[]) => void,
        onError?: (error: string) => void
    ): void {
        addressService.searchAddresses(uf, city, street).subscribe({
            next: (addresses) => {
                if (addresses.length === 0) {
                    toastService.warning('Nenhum endereço encontrado', 'Tente outros termos de busca');
                    onSuccess([]);
                } else {
                    onSuccess(addresses);
                    toastService.success(`${addresses.length} endereço(s) encontrado(s)`, 'Busca concluída');
                }
            },
            error: (error) => {
                const errorMsg = error.message || 'Erro ao buscar endereços';
                toastService.error('Erro na busca', errorMsg);
                onError?.(errorMsg);
            }
        });
    }

    /**
     * 📝 FORMAT CEP FOR DISPLAY - Formata CEP para exibição
     */
    static formatCepForDisplay(cep: string): string {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        return cep;
    }

    /**
     * 📝 FORMAT CEP FOR INPUT - Formata CEP para input (remove formatação)
     */
    static formatCepForInput(cep: string): string {
        return cep.replace(/\D/g, '');
    }

    /**
     * ✅ VALIDATE CEP - Valida CEP com feedback visual
     */
    static validateCepWithFeedback(
        cep: string,
        addressService: AddressService,
        toastService: ToastService
    ): boolean {
        if (!addressService.validateCep(cep)) {
            toastService.warning('CEP inválido', 'Digite um CEP com 8 dígitos');
            return false;
        }
        return true;
    }

    /**
     * 🏠 GET FULL ADDRESS STRING - Retorna endereço completo formatado
     */
    static getFullAddressString(address: AddressFormatted): string {
        const parts = [
            address.street,
            address.neighborhood,
            address.city,
            address.state
        ].filter(part => part && part.trim() !== '');

        return parts.join(', ');
    }

    /**
     * 📍 GET ADDRESS FOR FORM - Retorna endereço formatado para formulário
     */
    static getAddressForForm(address: AddressFormatted): {
        cep: string;
        street: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
    } {
        return {
            cep: address.cep,
            street: address.street,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state
        };
    }

    /**
     * 🔍 DEBOUNCE CEP SEARCH - Busca CEP com debounce para evitar muitas requisições
     */
    static createDebouncedCepSearch(
        addressService: AddressService,
        toastService: ToastService,
        delay: number = 500
    ): (cep: string, onSuccess: (address: AddressFormatted) => void, onError?: (error: string) => void) => void {
        let timeoutId: any;

        return (cep: string, onSuccess: (address: AddressFormatted) => void, onError?: (error: string) => void) => {

            if (timeoutId) {
                clearTimeout(timeoutId);
            }


            if (!addressService.validateCep(cep)) {
                return;
            }


            timeoutId = setTimeout(() => {
                this.fillAddressByCep(cep, addressService, toastService, onSuccess, onError);
            }, delay);
        };
    }
}
