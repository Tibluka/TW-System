import { ErrorHandlerService, ErrorMapping } from '../services/error-handler/error-handler.service';
import { ToastService } from '../services/toast/toast.service';

/**
 * 🛠️ ERROR HANDLER UTIL - Utilitário para facilitar o uso do ErrorHandlerService
 */
export class ErrorHandlerUtil {

    /**
     * 🎯 HANDLE ERROR - Processa erro e mostra toast automaticamente
     */
    static handleError(
        error: any,
        errorHandlerService: ErrorHandlerService,
        toastService: ToastService,
        customTitle?: string
    ): ErrorMapping {
        const processedError = errorHandlerService.processError(error);

        // Usa título customizado se fornecido
        const finalError = customTitle ? { ...processedError, title: customTitle } : processedError;

        // Mostra toast baseado no tipo
        switch (finalError.type) {
            case 'warning':
                toastService.warning(finalError.message, finalError.title);
                break;
            case 'info':
                toastService.info(finalError.message, finalError.title);
                break;
            case 'error':
            default:
                toastService.error(finalError.message, finalError.title);
                break;
        }

        return finalError;
    }

    /**
     * 🔍 GET ERROR MESSAGE - Apenas retorna a mensagem processada sem mostrar toast
     */
    static getErrorMessage(
        error: any,
        errorHandlerService: ErrorHandlerService
    ): string {
        const processedError = errorHandlerService.processError(error);
        return processedError.message;
    }

    /**
     * 📋 GET ERROR DETAILS - Retorna detalhes completos do erro processado
     */
    static getErrorDetails(
        error: any,
        errorHandlerService: ErrorHandlerService
    ): ErrorMapping {
        return errorHandlerService.processError(error);
    }

    /**
     * 🎯 HANDLE HTTP ERROR - Específico para erros HTTP
     */
    static handleHttpError(
        error: any,
        errorHandlerService: ErrorHandlerService,
        toastService: ToastService,
        context?: string
    ): ErrorMapping {
        let processedError = errorHandlerService.processError(error);

        // Adiciona contexto se fornecido
        if (context) {
            processedError = {
                ...processedError,
                title: `${context} - ${processedError.title}`
            };
        }

        // Mostra toast
        switch (processedError.type) {
            case 'warning':
                toastService.warning(processedError.message, processedError.title);
                break;
            case 'info':
                toastService.info(processedError.message, processedError.title);
                break;
            case 'error':
            default:
                toastService.error(processedError.message, processedError.title);
                break;
        }

        return processedError;
    }

    /**
     * 🔄 HANDLE SUBSCRIPTION ERROR - Para uso em subscriptions RxJS
     */
    static handleSubscriptionError(
        error: any,
        errorHandlerService: ErrorHandlerService,
        toastService: ToastService,
        context?: string
    ): void {
        this.handleHttpError(error, errorHandlerService, toastService, context);
    }
}
