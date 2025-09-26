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
                    console.error('Erro de rede:', error.error.message);

                } else {

                    switch (error.status) {
                        case 400:
                            userMessage = error.error?.message || 'Dados inválidos fornecidos.';
                            console.warn('Requisição inválida (400):', error.error);
                            break;

                        case 401:

                            if (!shouldExclude) {
                                userMessage = 'Sua sessão expirou. Faça login novamente.';
                                console.warn('Token inválido ou expirado (401). Redirecionando para login...');


                                this.authService.logout();
                                this.router.navigate(['/login']);
                            } else {
                                userMessage = error.error?.message || 'Credenciais inválidas.';
                            }
                            break;

                        case 403:

                            userMessage = 'Você não tem permissão para esta operação.';
                            console.warn('Acesso negado (403):', error.error);


                            break;

                        case 404:
                            userMessage = error.error?.message || 'Recurso não encontrado.';
                            console.warn('Recurso não encontrado (404):', error.url);
                            break;

                        case 409:

                            userMessage = error.error?.message || 'Conflito nos dados fornecidos.';
                            console.warn('Conflito (409):', error.error);
                            break;

                        case 422:

                            userMessage = error.error?.message || 'Dados fornecidos são inválidos.';
                            console.warn('Dados inválidos (422):', error.error);
                            break;

                        case 429:

                            userMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
                            console.warn('Rate limit atingido (429):', error.error);
                            break;

                        case 500:

                            userMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
                            console.error('Erro interno do servidor (500):', error.error);
                            break;

                        case 502:
                        case 503:
                        case 504:

                            userMessage = 'Serviço temporariamente indisponível. Tente novamente.';
                            console.error(`Erro de infraestrutura (${error.status}):`, error.error);
                            break;

                        default:
                            userMessage = error.error?.message || `Erro HTTP ${error.status}`;
                            console.error(`Erro não tratado (${error.status}):`, error.error);
                    }
                }


                if (this.isDevelopment()) {
                    console.group(`🚨 HTTP Error ${error.status}`);
                    console.log('URL:', error.url);
                    console.log('Método:', req.method);
                    console.log('Resposta:', error.error);
                    console.log('Headers:', error.headers);
                    console.groupEnd();
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
