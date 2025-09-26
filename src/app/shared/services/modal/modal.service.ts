
import { Injectable, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalConfig {
  id: string;
  title?: string;
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscapeKey?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  data?: any;
}

export interface ModalInstance {
  id: string;
  config: ModalConfig;
  isOpen: boolean;
  closeSubject: Subject<any>;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private _modals = signal<Map<string, ModalInstance>>(new Map());
  private _activeModalId = signal<string | null>(null);


  readonly modals = computed(() => Array.from(this._modals().values()));
  readonly activeModal = computed(() => {
    const activeId = this._activeModalId();
    return activeId ? this._modals().get(activeId) || null : null;
  });
  readonly hasOpenModals = computed(() => this.modals().some(modal => modal.isOpen));

  constructor() {

    this.setupGlobalKeyListener();
  }

  /**
   * Abre um modal
   */
  open(config: ModalConfig): Subject<any> {
    const modalInstance: ModalInstance = {
      id: config.id,
      config: {
        showHeader: true,
        showCloseButton: true,
        closeOnBackdropClick: true,
        closeOnEscapeKey: true,
        size: 'md',
        ...config
      },
      isOpen: true,
      closeSubject: new Subject<any>()
    };

    this._modals.update(modals => {
      const newModals = new Map(modals);
      newModals.set(config.id, modalInstance);
      return newModals;
    });

    this._activeModalId.set(config.id);

    return modalInstance.closeSubject;
  }

  /**
   * Fecha um modal específico
   */
  close(modalId: string, result?: any): void {
    const modal = this._modals().get(modalId);
    if (!modal) return;


    this._modals.update(modals => {
      const newModals = new Map(modals);
      const modalToUpdate = newModals.get(modalId);
      if (modalToUpdate) {
        modalToUpdate.isOpen = false;
        newModals.set(modalId, modalToUpdate);
      }
      return newModals;
    });


    if (this._activeModalId() === modalId) {
      this._activeModalId.set(null);
    }


    modal.closeSubject.next(result);
    modal.closeSubject.complete();


    setTimeout(() => {
      this._modals.update(modals => {
        const newModals = new Map(modals);
        newModals.delete(modalId);
        return newModals;
      });
    }, 300);
  }

  /**
   * Fecha o modal ativo
   */
  closeActive(result?: any): void {
    const activeId = this._activeModalId();
    if (activeId) {
      this.close(activeId, result);
    }
  }

  /**
   * Fecha todos os modais abertos
   */
  closeAll(): void {
    const openModals = this.modals().filter(modal => modal.isOpen);
    openModals.forEach(modal => this.close(modal.id));
  }

  /**
   * Verifica se um modal específico está aberto
   */
  isOpen(modalId: string): boolean {
    const modal = this._modals().get(modalId);
    return modal ? modal.isOpen : false;
  }

  /**
   * Obtém a configuração de um modal
   */
  getModalConfig(modalId: string): ModalConfig | null {
    const modal = this._modals().get(modalId);
    return modal ? modal.config : null;
  }

  /**
   * Configura o listener global para a tecla ESC
   */
  private setupGlobalKeyListener(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const activeModal = this.activeModal();
        if (activeModal && activeModal.config.closeOnEscapeKey) {
          this.close(activeModal.id);
        }
      }
    });
  }
}
