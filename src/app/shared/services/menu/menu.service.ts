// menu.service.ts - Versão retrátil
import { computed, Injectable, signal } from '@angular/core';
import { MenuItem } from '../../../models/menu/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly _isCollapsed = signal(false);
  private readonly _isAnimating = signal(false);
  private readonly _menuItems = signal<MenuItem[]>([]);
  private readonly _activeItem = signal<string | null>(null);

  // Computed signals
  readonly isCollapsed = this._isCollapsed.asReadonly();
  readonly isAnimating = this._isAnimating.asReadonly();
  readonly menuItems = this._menuItems.asReadonly();
  readonly activeItem = this._activeItem.asReadonly();

  // Estados combinados
  readonly canInteract = computed(() => !this._isAnimating());
  readonly menuState = computed(() => ({
    isCollapsed: this._isCollapsed(),
    isAnimating: this._isAnimating(),
    canInteract: this.canInteract()
  }));

  constructor() {
    this.initializeDefaultItems();
    this.loadCollapsedState();
  }

  /**
   * Alterna o estado do menu (colapsado/expandido)
   */
  toggle(): void {
    if (this._isAnimating()) return;

    this._isAnimating.set(true);
    this._isCollapsed.update(current => !current);

    // Salva o estado
    this.saveCollapsedState();

    // Simula o tempo da animação CSS (500ms)
    setTimeout(() => {
      this._isAnimating.set(false);
    }, 500);
  }

  /**
   * Expande o menu
   */
  expand(): void {
    if (!this._isCollapsed() || this._isAnimating()) return;
    this.toggle();
  }

  /**
   * Colapsa o menu
   */
  collapse(): void {
    if (this._isCollapsed() || this._isAnimating()) return;
    this.toggle();
  }

  /**
   * Define se o menu está colapsado
   */
  setCollapsed(collapsed: boolean): void {
    if (this._isCollapsed() === collapsed || this._isAnimating()) return;
    this.toggle();
  }

  /**
   * Define os itens do menu
   */
  setMenuItems(items: MenuItem[]): void {
    this._menuItems.set(items);
  }

  /**
   * Adiciona um item ao menu
   */
  addMenuItem(item: MenuItem): void {
    this._menuItems.update(items => [...items, item]);
  }

  /**
   * Remove um item do menu
   */
  removeMenuItem(id: string): void {
    this._menuItems.update(items =>
      items.filter(item => item.id !== id)
    );
  }

  /**
   * Define o item ativo
   */
  setActiveItem(id: string | null): void {
    this._activeItem.set(id);
  }

  /**
   * Executa a ação de um item do menu
   */
  executeMenuItem(item: MenuItem): void {
    if (item.disabled) return;

    this.setActiveItem(item.id);

    if (item.action) {
      item.action();
    }
  }

  /**
   * Inicializa itens padrão do menu
   */
  private initializeDefaultItems(): void {
    const defaultItems: MenuItem[] = [
      {
        id: 'clients',
        label: 'Clientes',
        icon: 'fa-solid fa-users',
        route: '/authorized/clients'
      },
      {
        id: 'developments',
        label: 'Desenvolvimentos',
        icon: 'fa-solid fa-palette',
        route: '/authorized/developments'
      },
      {
        id: 'production-orders',
        label: 'Ordens de produção',
        icon: 'fa-solid fa-print',
        route: '/authorized/production-orders'
      },
      {
        id: 'production-sheets',
        label: 'Fichas de produção',
        icon: 'fa-solid fa-file',
        route: '/authorized/production-sheets'
      },
      {
        id: 'production-receipt',
        label: 'Recibos de produção',
        icon: 'fa-solid fa-sack-dollar',
        route: '/authorized/production-receipt'
      }
    ];

    this.setMenuItems(defaultItems);
  }

  /**
   * Salva o estado colapsado no localStorage
   */
  private saveCollapsedState(): void {
    try {
      localStorage.setItem('menuCollapsed', JSON.stringify(this._isCollapsed()));
    } catch (error) {
      console.warn('Erro ao salvar estado do menu:', error);
    }
  }

  /**
   * Carrega o estado colapsado do localStorage
   */
  private loadCollapsedState(): void {
    try {
      const saved = localStorage.getItem('menuCollapsed');
      if (saved !== null) {
        this._isCollapsed.set(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Erro ao carregar estado do menu:', error);
    }
  }

  /**
   * Reseta o menu para o estado inicial
   */
  reset(): void {
    this._isCollapsed.set(false);
    this._isAnimating.set(false);
    this._activeItem.set(null);
  }

  // Métodos mantidos para compatibilidade (deprecated)
  /**
   * @deprecated Use isCollapsed() ao invés de isOpen()
   */
  isOpen() {
    return !this._isCollapsed();
  }

  /**
   * @deprecated Use collapse() ao invés de close()
   */
  close(): void {
    this.collapse();
  }

  /**
   * @deprecated Use expand() ao invés de open()
   */
  open(): void {
    this.expand();
  }
}