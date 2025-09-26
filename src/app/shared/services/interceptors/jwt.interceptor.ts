import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError, Observable } from 'rxjs';
import { AuthService } from '../auth/auth-service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
        const excludedUrls = [
            '/auth/login',
            '/auth/register',
            '/auth/refresh',
            '/auth/forgot-password',
            '/auth/reset-password'
        ];
        const shouldExclude = excludedUrls.some(url => req.url.includes(url));
        if (!shouldExclude) {
            const token = this.authService.getToken();

            if (token) {
                req = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        }

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let userMessage = 'Algo deu errado; tente novamente mais tarde.';

                if (error.error instanceof ErrorEvent) {

                    userMessage = 'Problema de conexão. Verifique sua internet.';

                } else {

                    switch (error.status) {
                        case 400:
                            userMessage = error.error?.message || 'Dados inválidos fornecidos.';
                            break;

                        case 401:

                            if (!shouldExclude) {
                                userMessage = 'Sua sessão expirou. Faça login novamente.';
                                this.authService.logout();
                                this.router.navigate(['/login']);
                            } else {
                                userMessage = error.error?.message || 'Credenciais inválidas.';
                            }
                            break;

                        case 403:

                            userMessage = 'Você não tem permissão para esta operação.';

                            break;

                        case 404:
                            userMessage = error.error?.message || 'Recurso não encontrado.';
                            break;

                        case 409:

                            userMessage = error.error?.message || 'Conflito nos dados fornecidos.';
                            break;

                        case 422:

                            userMessage = error.error?.message || 'Dados fornecidos são inválidos.';
                            break;

                        case 429:

                            userMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
                            break;

                        case 500:

                            userMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
                            break;

                        case 502:
                        case 503:
                        case 504:

                            userMessage = 'Serviço temporariamente indisponível. Tente novamente.';
                            break;

                        default:
                            userMessage = error.error?.message || `Erro HTTP ${error.status}`;
                    }
                }
                if (this.isDevelopment()) {
                }
                return throwError(() => ({
                    message: userMessage,
                    originalError: error,
                    status: error.status,
                    isNetworkError: error.error instanceof ErrorEvent
                }));
            })
        );
    }

    /**
     * Verifica se está em modo desenvolvimento
     */
    private isDevelopment(): boolean {
        return !!(window as any)['ng'] || location.hostname === 'localhost';
    }
}