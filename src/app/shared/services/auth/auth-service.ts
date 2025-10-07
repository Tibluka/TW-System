import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  error?: {
    statusCode: number;
    isOperational: boolean;
    status: string;
    code: number;
    message: string;
  };
  message?: string;
  code?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Faz login na API
   */
  login(email: string, password: string): Observable<LoginResponse> {
    console.log('🔐 Iniciando login para:', email);
    console.log('🌐 URL da API:', `${environment.apiUrl}/auth/login`);

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap({
        next: (response) => {
          console.log('✅ Resposta do servidor recebida:', response);

          if (response.success && response.data) {
            console.log('✅ Login bem-sucedido, salvando dados...');
            console.log('👤 Usuário recebido:', response.data.user);
            console.log('🔑 Role do usuário:', response.data.user.role);

            this.setAuthData(response.data.accessToken, response.data.user);
            console.log('💾 Dados salvos no localStorage');
          } else {
            console.log('❌ Login falhou - success: false ou data ausente');
            console.log('📝 Detalhes do erro:', response.error || response.message);
          }
        },
        error: (error) => {
          console.error('❌ Erro HTTP no login:', error);
          console.error('📝 Status:', error.status);
          console.error('📝 Mensagem:', error.message);
          console.error('📝 Resposta completa:', error);
        }
      })
    );
  }

  /**
   * Faz logout
   */
  logout() {
    this.clearAuthData();
  }

  /**
   * Verifica se está logado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtém dados do usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Salva dados de autenticação
   */
  private setAuthData(token: string, user: User): void {

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
  }

  /**
   * Limpa dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica se existe token
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtém usuário do localStorage
   */
  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}
