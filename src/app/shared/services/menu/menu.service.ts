// menu.service.ts - CORREÇÃO COM ROUTER AWARENESS
import { computed, Injectable, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from '../../../models/menu/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly router = inject(Router);

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
    this.setupRouterListener();
    this.setActiveItemFromCurrentRoute(); // 🔧 CORREÇÃO: Definir item ativo na inicialização
  }

  /**
   * 🔧 CORREÇÃO: Configura listener para mudanças de rota
   */
  private setupRouterListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setActiveItemFromRoute(event.url);
      });
  }

  /**
   * 🔧 CORREÇÃO: Define item ativo baseado na rota atual (para F5)
   */
  private setActiveItemFromCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.setActiveItemFromRoute(currentUrl);
  }

  /**
   * 🔧 CORREÇÃO: Define item ativo baseado na URL
   */
  private setActiveItemFromRoute(url: string): void {
    console.log('🔍 Verificando rota atual:', url);

    const menuItems = this._menuItems();
    const activeItem = menuItems.find(item => {
      if (!item.route) return false;

      // Verificação exata da rota
      if (item.route === url) return true;

      // Verificação se a URL atual começa com a rota do item (para sub-rotas)
      if (url.startsWith(item.route) && url.charAt(item.route.length) === '/') {
        return true;
      }

      return false;
    });

    if (activeItem) {
      console.log('✅ Item ativo encontrado:', activeItem.label, `(${activeItem.id})`);
      this._activeItem.set(activeItem.id);
    } else {
      console.log('❌ Nenhum item ativo encontrado para:', url);
      this._activeItem.set(null);
    }
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
    // 🔧 CORREÇÃO: Quando itens mudam, re-verificar rota ativa
    this.setActiveItemFromCurrentRoute();
  }

  /**
   * Adiciona um item ao menu
   */
  addMenuItem(item: MenuItem): void {
    this._menuItems.update(items => [...items, item]);
    // 🔧 CORREÇÃO: Re-verificar rota ativa após adicionar item
    this.setActiveItemFromCurrentRoute();
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
   * Define o item ativo (para cliques manuais)
   */
  setActiveItem(id: string | null): void {
    console.log('🎯 Definindo item ativo manualmente:', id);
    this._activeItem.set(id);
  }

  /**
   * Executa a ação de um item do menu
   */
  executeMenuItem(item: MenuItem): void {
    if (item.disabled) return;

    // 🔧 CORREÇÃO: Não definir ativo aqui, deixar o router fazer isso
    // this.setActiveItem(item.id); // Removido para evitar conflito

    if (item.action) {
      item.action();
    }
  }

  /**
   * 🔧 CORREÇÃO: Método público para forçar atualização baseada na rota
   */
  updateActiveItemFromCurrentRoute(): void {
    this.setActiveItemFromCurrentRoute();
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