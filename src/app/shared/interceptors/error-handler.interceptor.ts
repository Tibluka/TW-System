import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService, ErrorMapping } from '../services/error-handler/error-handler.service';
import { ToastService } from '../services/toast/toast.service';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {

    constructor(
        private errorHandlerService: ErrorHandlerService,
        private toastService: ToastService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log('🔍 ErrorHandlerInterceptor - processando erro:', error.status, error.url);

                const processedError = this.errorHandlerService.processError(error);

                // Só mostra toast para erros que não são de login (para evitar duplicação)
                if (!request.url.includes('/auth/login')) {
                    this.showErrorToast(processedError);
                }

                return throwError(() => processedError);
            })
        );
    }

    /**
     * 🍞 SHOW ERROR TOAST - Mostra toast baseado no tipo de erro
     */
    private showErrorToast(errorMapping: ErrorMapping): void {
        const { message, title, type } = errorMapping;

        switch (type) {
            case 'warning':
                this.toastService.warning(message, title);
                break;
            case 'info':
                this.toastService.info(message, title);
                break;
            case 'error':
            default:
                this.toastService.error(message, title);
                break;
        }
    }
}
