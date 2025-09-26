
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../../services/modal/modal.service';
import { IconComponent } from '../../atoms/icon/icon.component';
import { modalAnimations } from '../../../animations/fade-animation';

@Component({
  selector: 'ds-modal',
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


  isVisible = false;
  modalConfig: ModalConfig | null = null;
  animationState: 'in' | 'out' = 'out';
  shouldShowModal = false; // Controla quando o modal deve estar no DOM

  constructor() {

    effect(() => {
      if (this.modalId) {
        const modal = this.modalService.modals().find(m => m.id === this.modalId);
        const newVisibility = modal ? modal.isOpen : false;

        if (newVisibility !== this.isVisible) {
          this.isVisible = newVisibility;

          if (newVisibility) {

            this.shouldShowModal = true;

            setTimeout(() => {
              this.animationState = 'in';
            }, 0);
          } else {

            this.animationState = 'out';

          }
        }

        this.modalConfig = modal ? modal.config : null;
      }
    });
  }

  ngOnInit(): void {
    if (!this.modalId) {
      return;
    }
  }

  ngOnDestroy(): void {

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

      this.shouldShowModal = false;
    }
  }
}
