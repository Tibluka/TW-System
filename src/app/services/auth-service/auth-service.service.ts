import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  // Adicione outros campos conforme necessário
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Verifica se o token ainda é válido na inicialização
    this.validateToken();
  }

  /**
   * Verifica se existe um token válido no localStorage
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return false;
    }

    // Verifica se o token não expirou (caso você use JWT)
    return this.isTokenValid(token);
  }

  /**
   * Valida se o token JWT ainda é válido (opcional)
   * Substitua esta lógica pela validação específica do seu backend
   */
  private isTokenValid(token: string): boolean {
    return true;
  }

  /**
   * Obtém os dados do usuário atual do localStorage
   */
  private getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Valida o token atual e atualiza o estado
   */
  private validateToken(): void {
    const isValid = this.hasValidToken();
    this.isAuthenticatedSubject.next(isValid);

    if (!isValid) {
      this.clearAuthData();
    }
  }

  /**
   * Realiza o login do usuário
   */
  login(email: string, password: string): Observable<any> {
    // Aqui você faria a chamada para sua API
    // Este é apenas um exemplo - substitua pela sua implementação
    return new Observable(observer => {
      // Simula uma chamada de API
      setTimeout(() => {
        // Exemplo de resposta de sucesso
        const mockResponse = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '1',
            email: email,
            name: 'Usuário Teste'
          }
        };

        this.setAuthData(mockResponse.token, mockResponse.user);
        observer.next(mockResponse);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Define os dados de autenticação
   */
  setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Limpa todos os dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica se o usuário está autenticado (método síncrono)
   */
  isLoggedIn(): boolean {
    debugger
    console.log(this.isAuthenticatedSubject.value);

    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtém os dados do usuário atual (método síncrono)
   */
  getCurrentUserData(): User | null {
    return this.currentUserSubject.value;
  }
}