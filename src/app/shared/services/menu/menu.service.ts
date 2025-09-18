// menu.service.ts
import { computed, Injectable, signal } from '@angular/core';
import { MenuItem } from '../../../models/menu/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly _isOpen = signal(false);
  private readonly _isAnimating = signal(false);
  private readonly _menuItems = signal<MenuItem[]>([]);
  private readonly _activeItem = signal<string | null>(null);

  // Computed signals
  readonly isOpen = this._isOpen.asReadonly();
  readonly isAnimating = this._isAnimating.asReadonly();
  readonly menuItems = this._menuItems.asReadonly();
  readonly activeItem = this._activeItem.asReadonly();

  // Estados combinados
  readonly canInteract = computed(() => !this._isAnimating());
  readonly menuState = computed(() => ({
    isOpen: this._isOpen(),
    isAnimating: this._isAnimating(),
    canInteract: this.canInteract()
  }));

  constructor() {
    this.initializeDefaultItems();
  }

  /**
   * Alterna o estado do menu
   */
  toggle(): void {
    if (this._isAnimating()) return;

    this._isAnimating.set(true);
    this._isOpen.update(current => !current);

    // Simula o tempo da animação CSS
    setTimeout(() => {
      this._isAnimating.set(false);
    }, 300);
  }

  /**
   * Abre o menu
   */
  open(): void {
    if (this._isOpen() || this._isAnimating()) return;
    this.toggle();
  }

  /**
   * Fecha o menu
   */
  close(): void {
    if (!this._isOpen() || this._isAnimating()) return;
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

    // Fecha o menu após executar a ação (comportamento típico em mobile)
    if (this._isOpen()) {
      setTimeout(() => this.close(), 150);
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
        route: '/clients'
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
   * Reseta o menu para o estado inicial
   */
  reset(): void {
    this._isOpen.set(false);
    this._isAnimating.set(false);
    this._activeItem.set(null);
  }
}