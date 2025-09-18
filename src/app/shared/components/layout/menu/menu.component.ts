// menu.component.ts - Versão retrátil
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuItem } from '../../../../models/menu/menu';
import { AuthService } from '../../../services/auth/auth-service';
import { MenuService } from '../../../services/menu/menu.service';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  protected menuService = inject(MenuService);
  private authService = inject(AuthService);

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl + B para toggle do menu
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      this.toggleMenu();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Em telas pequenas, força o menu expandido
    if (window.innerWidth <= 768 && this.menuService.isCollapsed()) {
      this.menuService.expand();
    }
  }

  ngOnInit(): void {
    // Inicializações se necessário
  }

  ngOnDestroy(): void {
    // Cleanup para evitar memory leaks
    this.menuService.reset();
  }

  /**
   * Alterna o estado do menu (colapsar/expandir)
   */
  toggleMenu(): void {
    if (this.menuService.isAnimating()) return;
    this.menuService.toggle();
  }

  /**
   * Colapsa o menu
   */
  collapseMenu(): void {
    this.menuService.collapse();
  }

  /**
   * Expande o menu
   */
  expandMenu(): void {
    this.menuService.expand();
  }

  /**
   * Manipula o clique em um item do menu
   */
  onMenuItemClick(item: MenuItem, index: number): void {
    if (item.disabled || this.menuService.isAnimating()) return;

    // Define o item ativo
    this.menuService.setActiveItem(item.id);

    // Executa a ação do item através do service
    this.menuService.executeMenuItem(item);

    // Navega para a rota se especificada
    if (item.route) {
      this.router.navigate([item.route]).catch(err => {
        console.error('Erro na navegação:', err);
      });
    }
  }

  /**
   * TrackBy function para otimizar o *ngFor
   */
  trackByItemId(index: number, item: MenuItem): string {
    return item.id || index.toString();
  }

  /**
   * Verifica se o item está ativo
   */
  isItemActive(item: MenuItem): boolean {
    return this.menuService.activeItem() === item.id;
  }

  /**
   * Verifica se pode interagir com o menu
   */
  canInteract(): boolean {
    return this.menuService.canInteract();
  }

  /**
   * Obtém a largura atual do menu
   */
  getMenuWidth(): number {
    return this.menuService.isCollapsed() ? 104 : 300;
  }

  /**
   * Verifica se o menu está colapsado
   */
  isMenuCollapsed(): boolean {
    return this.menuService.isCollapsed();
  }

  /**
   * Verifica se está em modo mobile
   */
  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}