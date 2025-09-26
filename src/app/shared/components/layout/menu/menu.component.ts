
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
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


  private destroy$ = new Subject<void>();

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {

    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      this.toggleMenu();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {

    if (window.innerWidth <= 768 && this.menuService.isCollapsed()) {
      this.menuService.expand();
    }
  }

  ngOnInit(): void {

    console.log('🚀 MenuComponent inicializado');
    console.log('📍 Rota atual:', this.router.url);
    console.log('📋 Itens do menu:', this.menuService.menuItems());
    console.log('🎯 Item ativo atual:', this.menuService.activeItem());


    setTimeout(() => {
      this.menuService.updateActiveItemFromCurrentRoute();
    }, 100); // Pequeno delay para garantir que tudo está carregado
  }

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();
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
   * 🔧 CORREÇÃO: Manipula o clique em um item do menu
   */
  onMenuItemClick(item: MenuItem, index: number): void {
    if (item.disabled || this.menuService.isAnimating()) return;

    console.log('🖱️ Clique no menu:', item.label, `(${item.id})`);


    if (item.route) {
      this.router.navigate([item.route]).then(success => {
        if (success) {
          console.log('✅ Navegação bem-sucedida para:', item.route);

          this.menuService.executeMenuItem(item);
        } else {
          console.error('❌ Falha na navegação para:', item.route);
        }
      }).catch(err => {
        console.error('❌ Erro na navegação:', err);
      });
    } else {

      this.menuService.setActiveItem(item.id);
      this.menuService.executeMenuItem(item);
    }
  }

  /**
   * TrackBy function para otimizar o *ngFor
   */
  trackByItemId(index: number, item: MenuItem): string {
    return item.id || index.toString();
  }

  /**
   * 🔧 CORREÇÃO: Verifica se o item está ativo
   */
  isItemActive(item: MenuItem): boolean {
    const isActive = this.menuService.activeItem() === item.id;


    if (item.id === 'clients') {
      console.log(`🔍 Verificando se '${item.label}' está ativo:`, isActive);
      console.log('📍 Rota atual:', this.router.url);
      console.log('🎯 Item ativo no service:', this.menuService.activeItem());
    }

    return isActive;
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

  /**
   * 🔧 CORREÇÃO: Método para forçar atualização (para debug)
   */
  forceUpdateActiveItem(): void {
    console.log('🔄 Forçando atualização do item ativo...');
    this.menuService.updateActiveItemFromCurrentRoute();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
