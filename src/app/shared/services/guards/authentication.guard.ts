import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service'; // Ajuste o caminho conforme sua estrutura

export const authenticationGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);


  if (authService.isLoggedIn()) {
    return true;
  }


  console.log('Usuário não autenticado, redirecionando para login...');
  router.navigate(['/login']);

  return false;
};
