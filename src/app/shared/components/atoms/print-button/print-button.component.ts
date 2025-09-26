

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { PrintOptions, PrintService } from '../../print/print.service';
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: 'ds-print-button',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './print-button.component.html',
  styleUrls: ['./print-button.component.scss']
})
export class PrintButtonComponent {

  private printService = inject(PrintService);


  @Input() label = 'Imprimir';
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'secondary';
  @Input() icon = 'fa-solid fa-print';
  @Input() disabled = false;


  @Input() target?: string | HTMLElement; // Elemento alvo para impressão
  @Input() printOptions: PrintOptions = {};


  @Input() mode: 'element' | 'html' | 'page' = 'element';
  @Input() htmlContent?: string; // Para modo 'html'


  @Output() beforePrint = new EventEmitter<void>();
  @Output() afterPrint = new EventEmitter<void>();
  @Output() printError = new EventEmitter<Error>();


  isPrinting = false;


  onPrint(event: Event): void {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.isPrinting) return;

    this.startPrint();
  }

  private async startPrint(): Promise<void> {
    this.isPrinting = true;

    try {

      this.beforePrint.emit();


      await new Promise(resolve => setTimeout(resolve, 100));


      switch (this.mode) {
        case 'element':
          this.printElement();
          break;
        case 'html':
          this.printHTML();
          break;
        case 'page':
          this.printPage();
          break;
        default:
          throw new Error(`Modo de impressão '${this.mode}' não suportado`);
      }


      this.afterPrint.emit();

    } catch (error) {
      this.printError.emit(error as Error);
    } finally {

      setTimeout(() => {
        this.isPrinting = false;
      }, 1000);
    }
  }

  private printElement(): void {
    let targetElement: HTMLElement | string;

    if (this.target) {
      targetElement = this.target;
    } else {

      const button = document.querySelector('ds-print-button')?.parentElement;
      targetElement = this.findPrintableParent(button) || document.body;
    }

    this.printService.printElement(targetElement, this.printOptions);
  }

  private printHTML(): void {
    if (!this.htmlContent) {
      throw new Error('htmlContent é obrigatório para modo HTML');
    }

    this.printService.printHTML(this.htmlContent, this.printOptions);
  }

  private printPage(): void {
    this.printService.printCurrentPage(this.printOptions);
  }

  /**
   * 🔍 ENCONTRAR ELEMENTO PAI ADEQUADO PARA IMPRESSÃO
   */
  private findPrintableParent(element?: Element | null): HTMLElement | null {
    if (!element) return null;


    const printableSelectors = [
      '.modal-container',
      '.page-content',
      '.print-content',
      '.card',
      '.form-container',
      '[data-printable]',
      '.production-sheet-modal-container' // Específico para seu modal
    ];

    let current = element;

    while (current && current !== document.body) {

      for (const selector of printableSelectors) {
        if (current.matches?.(selector)) {
          return current as HTMLElement;
        }
      }

      current = current.parentElement as Element;
    }

    return null;
  }
}
