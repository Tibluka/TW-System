// modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../../services/modal/modal.service';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalId!: string;
  @Input() config?: Partial<ModalConfig>;
  @Output() modalClosed = new EventEmitter<any>();

  private modalService = inject(ModalService);

  // Estados do modal
  isVisible = false;
  modalConfig: ModalConfig | null = null;

  ngOnInit(): void {
    if (!this.modalId) {
      console.error('Modal ID é obrigatório');
      return;
    }

    // Observa mudanças nos modais para atualizar a visibilidade
    this.updateModalState();
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  /**
   * Atualiza o estado do modal baseado no service
   */
  private updateModalState(): void {
    // Usar effect ou subscription baseado nos signals do service
    const checkModalState = () => {
      const modal = this.modalService.modals().find(m => m.id === this.modalId);
      this.isVisible = modal ? modal.isOpen : false;
      this.modalConfig = modal ? modal.config : null;

      // Agenda próxima verificação
      requestAnimationFrame(checkModalState);
    };

    checkModalState();
  }

  /**
   * Fecha o modal
   */
  closeModal(result?: any): void {
    this.modalService.close(this.modalId, result);
    this.modalClosed.emit(result);
  }

  /**
   * Manipula clique no backdrop
   */
  onBackdropClick(event: MouseEvent): void {
    if (this.modalConfig?.closeOnBackdropClick && event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /**
   * Previne o fechamento quando clica no conteúdo do modal
   */
  onModalContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  /**
   * Obtém as classes CSS baseadas na configuração
   */
  getModalClasses(): string {
    const classes = ['modal-dialog'];

    if (this.modalConfig?.size) {
      classes.push(`modal-${this.modalConfig.size}`);
    }

    return classes.join(' ');
  }
}