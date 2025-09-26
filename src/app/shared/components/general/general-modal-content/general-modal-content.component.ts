import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ModalService } from '../../../services/modal/modal.service';


export interface GeneralModalButton {
  label: string;
  action: any; // Valor retornado quando clicado
  variant?: 'fill' | 'outline' | 'ghost';
  icon?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export interface GeneralModalData {
  text: string;
  buttons: GeneralModalButton[];
  icon?: string;
  iconColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-general-modal-content',
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './general-modal-content.component.html',
  styleUrl: './general-modal-content.component.scss'
})
export class GeneralModalContentComponent {

  private modalService = inject(ModalService);


  modalData: GeneralModalData | null = null;
  modalId: string = 'general-modal';

  constructor() {

    effect(() => {
      const activeModal = this.modalService.activeModal();
      if (activeModal && activeModal.id === this.modalId) {
        this.modalData = activeModal.config.data as GeneralModalData;
      }
    });
  }

  /**
   * 🎯 AÇÃO DO BOTÃO - Executa ação do botão clicado
   */
  onButtonClick(button: GeneralModalButton): void {
    if (button.disabled || button.isLoading) return;


    this.modalService.close(this.modalId, {
      action: button.action,
      button: button
    });
  }

  /**
   * ❌ FECHAR MODAL - Fecha modal sem ação
   */
  closeModal(): void {
    this.modalService.close(this.modalId, null);
  }

  /**
   * 🎨 CLASSES DO TEXTO - Retorna classes CSS para o texto
   */
  getTextClasses(): string {
    const classes = ['modal-text'];

    if (this.modalData?.textAlign) {
      classes.push(`text-${this.modalData.textAlign}`);
    }

    return classes.join(' ');
  }

  /**
   * 🔘 VARIANTE DO BOTÃO - Retorna variante padrão se não especificada
   */
  getButtonVariant(button: GeneralModalButton): 'fill' | 'outline' | 'ghost' {
    return button.variant || 'outline';
  }
}
