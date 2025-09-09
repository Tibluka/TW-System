import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth-service/auth-service.service'; // Ajuste o caminho conforme sua estrutura

export const authenticationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário está autenticado
  if (authService.isLoggedIn()) {
    return true;
  }

  // Se não estiver autenticado, redireciona para login
  console.log('Usuário não autenticado, redirecionando para login...');
  router.navigate(['/login']);

  return false;
};