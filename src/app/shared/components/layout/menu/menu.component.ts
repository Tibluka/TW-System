// menu.component.ts
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

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.menuService.isOpen()) {
      this.closeMenu();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Fecha o menu automaticamente em telas grandes
    if (window.innerWidth > 768 && this.menuService.isOpen()) {
      this.closeMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as Element;
    const menuElement = document.querySelector('.menu-container');

    // Fecha o menu se clicar fora dele
    if (this.menuService.isOpen() &&
      !menuElement?.contains(target)) {
      this.closeMenu();
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
   * Alterna o estado do menu
   */
  toggleMenu(): void {
    this.menuService.toggle();
  }

  /**
   * Fecha o menu
   */
  closeMenu(): void {
    this.menuService.close();
  }

  /**
   * Abre o menu
   */
  openMenu(): void {
    this.menuService.open();
  }

  /**
   * Manipula o clique em um item do menu
   */
  onMenuItemClick(item: MenuItem, index: number): void {
    if (item.disabled || this.menuService.isAnimating()) return;

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}