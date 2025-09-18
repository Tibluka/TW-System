// modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../../services/modal/modal.service';
import { IconComponent } from '../../atoms/icon/icon.component';
import { modalAnimations } from '../../../animations/fade-animation';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: modalAnimations
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalId!: string;
  @Input() config?: Partial<ModalConfig>;
  @Output() modalClosed = new EventEmitter<any>();

  private modalService = inject(ModalService);

  // Estados do modal
  isVisible = false;
  modalConfig: ModalConfig | null = null;
  animationState: 'in' | 'out' = 'out';
  shouldShowModal = false; // Controla quando o modal deve estar no DOM

  constructor() {
    // Usa effect para reagir às mudanças nos signals do service
    effect(() => {
      if (this.modalId) {
        const modal = this.modalService.modals().find(m => m.id === this.modalId);
        const newVisibility = modal ? modal.isOpen : false;

        if (newVisibility !== this.isVisible) {
          this.isVisible = newVisibility;

          if (newVisibility) {
            // Modal está abrindo
            this.shouldShowModal = true;
            // Aguarda próximo ciclo para permitir que o elemento seja renderizado
            setTimeout(() => {
              this.animationState = 'in';
            }, 0);
          } else {
            // Modal está fechando
            this.animationState = 'out';
            // shouldShowModal será definido como false após a animação terminar
          }
        }

        this.modalConfig = modal ? modal.config : null;
      }
    });
  }

  ngOnInit(): void {
    if (!this.modalId) {
      console.error('Modal ID é obrigatório');
      return;
    }
  }

  ngOnDestroy(): void {
    // Cleanup automático do effect quando o componente for destruído
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

  /**
   * Callback para quando a animação do modal termina
   */
  onAnimationDone(event: any): void {
    if (event.toState === 'out' && event.fromState === 'in') {
      // Animação de saída terminou, remove do DOM
      this.shouldShowModal = false;
      console.log('Modal removido do DOM após animação');
    }
  }
}