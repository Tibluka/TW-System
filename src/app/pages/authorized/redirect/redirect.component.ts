import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionsService } from '../../../shared/services/permissions/permissions.service';

@Component({
    selector: 'app-redirect',
    template: `
    <div class="redirect-container">
      <div class="spinner"></div>
      <p>Redirecionando...</p>
    </div>
  `,
    styles: [`
    .redirect-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 1rem;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
    standalone: true
})
export class RedirectComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly permissionsService = inject(PermissionsService);

    ngOnInit(): void {
        // Aguarda um pouco para garantir que as permissões foram carregadas
        setTimeout(() => {
            const firstAvailableRoute = this.permissionsService.getFirstAvailableRoute();
            console.log('🎯 Redirecionando para primeira rota disponível:', firstAvailableRoute);
            this.router.navigate([firstAvailableRoute]);
        }, 100);
    }
}
