

import { Injectable } from '@angular/core';

export interface PrintOptions {
  title?: string;
  styles?: string;
  hideElements?: string[]; // Seletores CSS para ocultar na impressão
  showElements?: string[]; // Seletores CSS para mostrar apenas na impressão
  paperSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  /**
   * 🖨️ IMPRIMIR ELEMENTO HTML
   * @param element Elemento HTML ou seletor CSS
   * @param options Opções de impressão
   */
  printElement(element: HTMLElement | string, options: PrintOptions = {}): void {
    try {

      const targetElement = typeof element === 'string'
        ? document.querySelector(element) as HTMLElement
        : element;

      if (!targetElement) {
        throw new Error('Elemento não encontrado para impressão');
      }


      const htmlWithValues = this.captureFormValues(targetElement);

      this.printHTML(htmlWithValues, {
        ...options,
        title: options.title || 'Documento'
      });

    } catch (error) {
      alert('Erro ao imprimir. Tente novamente.');
    }
  }

  /**
   * 🖨️ IMPRIMIR HTML CUSTOMIZADO
   * @param htmlContent Conteúdo HTML
   * @param options Opções de impressão
   */
  printHTML(htmlContent: string, options: PrintOptions = {}): void {
    try {

      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');

      if (!printWindow) {
        alert('Bloqueador de pop-up ativo. Permita pop-ups para imprimir.');
        return;
      }


      const fullHTML = this.generatePrintHTML(htmlContent, options);


      printWindow.document.write(fullHTML);
      printWindow.document.close();


      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();


          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 500);
      };

    } catch (error) {
      alert('Erro ao imprimir. Tente novamente.');
    }
  }

  /**
   * 🖨️ IMPRIMIR PÁGINA ATUAL
   * @param options Opções de impressão
   */
  printCurrentPage(options: PrintOptions = {}): void {
    try {

      const tempStyles = this.applyTempStyles(options);


      window.print();


      if (tempStyles) {
        setTimeout(() => tempStyles.remove(), 100);
      }

    } catch (error) {
      alert('Erro ao imprimir. Tente novamente.');
    }
  }

  /**
   * 📄 GERAR HTML COMPLETO PARA IMPRESSÃO
   */
  private generatePrintHTML(content: string, options: PrintOptions): string {
    const {
      title = 'Documento',
      paperSize = 'A4',
      orientation = 'portrait',
      margins = '20mm',
      hideElements = [],
      showElements = []
    } = options;


    const currentStyles = this.extractCurrentStyles();


    const customStyles = options.styles || '';


    const printStyles = this.generatePrintStyles({
      paperSize,
      orientation,
      margins,
      hideElements,
      showElements
    });

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>

            ${currentStyles}


            ${customStyles}


            ${printStyles}
          </style>
        </head>
        <body class="print-body">
          <div class="print-container">
            ${content}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * 🎨 EXTRAIR ESTILOS CSS DA PÁGINA ATUAL
   */
  private extractCurrentStyles(): string {
    try {
      return Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {

            return '';
          }
        })
        .join('\n');
    } catch (error) {
      return '';
    }
  }

  /**
   * 🎨 GERAR ESTILOS ESPECÍFICOS PARA IMPRESSÃO
   */
  private generatePrintStyles(config: {
    paperSize: string;
    orientation: string;
    margins: string;
    hideElements: string[];
    showElements: string[];
  }): string {
    const { paperSize, orientation, margins, hideElements, showElements } = config;


    const hideStyles = hideElements
      .map(selector => `${selector} { display: none !important; }`)
      .join('\n');


    const showStyles = showElements.length > 0
      ? `
        body * { display: none !important; }
        ${showElements.map(selector =>
        `${selector}, ${selector} * { display: block !important; }`
      ).join('\n')}
      `
      : '';

    return `

      @page {
        size: ${paperSize} ${orientation};
        margin: ${margins};
      }


      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        margin: 0 !important;
        padding: 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12pt;
        line-height: 1.4;
        color: #000;
        background: white !important;
      }

      .print-container {
        width: 100%;
        max-width: none !important;
        padding: 20px !important;
      }


      .page-break {
        page-break-before: always;
      }

      .no-break {
        page-break-inside: avoid;
      }


      .no-print,
      .modal-actions,
      button:not(.print-button),
      .btn:not(.print-button) {
        display: none !important;
      }


      .print-field-value {
        font-weight: 500 !important;
        color: #333 !important;
        padding: 8px 12px !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        display: inline-block !important;
        min-height: 20px !important;
        min-width: 150px !important;
        background: #f9f9f9 !important;
      }

      .print-field-group {
        margin-bottom: 16px !important;
      }

      .print-field-group label {
        font-weight: 600 !important;
        margin-bottom: 4px !important;
        display: block !important;
        color: #555 !important;
        font-size: 11pt !important;
      }


      .development-card .body.secondary:has-text("Tipo de produção"),
      .development-card p:contains("Tipo de produção"),
      .development-card .form-field {
        display: none !important;
      }


      .development-found > .body.secondary {
        display: block !important;
        margin-top: 15px !important;
        font-size: 14pt !important;
        font-weight: bold !important;
        border-top: 1px solid #ddd !important;
        padding-top: 15px !important;
      }


      ${hideStyles}


      ${showStyles}


      table {
        border-collapse: collapse !important;
        width: 100% !important;
      }

      th, td {
        border: 1px solid #ddd !important;
        padding: 8px !important;
        text-align: left !important;
      }


      img {
        max-width: 200px !important;
        max-height: 150px !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
      }


      .development-card .image img,
      .piece-image img {
        max-width: 120px !important;
        max-height: 80px !important;
      }


      .modal-container,
      .card,
      .development-card {
        box-shadow: none !important;
        border-radius: 0 !important;
      }


      .development-card {
        display: flex !important;
        align-items: flex-start !important;
        gap: 20px !important;
        border: 1px solid #ddd !important;
        padding: 15px !important;
        margin-bottom: 20px !important;
      }

      .development-card .image {
        flex: 0 0 47% !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        border-right: 1px solid #eee !important;
        padding-right: 15px !important;
      }

      .development-card .image img {
        max-width: 100% !important;
        max-height: 200px !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
      }

      .development-card .development-details {
        flex: 0 0 50% !important;
        padding-left: 15px !important;
      }

      .development-card .development-details h1 {
        margin: 0 0 8px 0 !important;
        font-size: 16pt !important;
        font-weight: bold !important;
      }

      .development-card .development-details p {
        margin: 4px 0 !important;
        font-size: 12pt !important;
        line-height: 1.4 !important;
      }

      .development-card .development-details .subtitle-section {
        font-size: 14px !important;
      }

      .development-card .development-details hr {
        margin: 10px 0 !important;
        border: none !important;
        border-top: 1px solid #ddd !important;
      }


      .development-card .table-container {
        margin-top: 10px !important;
      }

      .development-card table {
        font-size: 10pt !important;
      }

      .development-card th,
      .development-card td {
        padding: 4px 6px !important;
        font-size: 10pt !important;
      }
    `;
  }

  /**
   * 🎨 APLICAR ESTILOS TEMPORÁRIOS
   */
  private applyTempStyles(options: PrintOptions): HTMLStyleElement | null {
    if (!options.hideElements?.length && !options.showElements?.length) {
      return null;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'temp-print-styles';

    const styles = this.generatePrintStyles({
      paperSize: options.paperSize || 'A4',
      orientation: options.orientation || 'portrait',
      margins: options.margins || '20mm',
      hideElements: options.hideElements || [],
      showElements: options.showElements || []
    });

    styleElement.textContent = `@media print { ${styles} }`;
    document.head.appendChild(styleElement);

    return styleElement;
  }

  /**
   * 📝 CAPTURAR VALORES DOS CAMPOS DE FORMULÁRIO - VERSÃO ANGULAR REACTIVE FORMS
   * Usa o FormGroup do Angular para pegar os valores reais dos controles
   */
  private captureFormValues(element: HTMLElement): string {

    const formElement = element.querySelector('form') as any;
    let angularForm: any = null;


    if (formElement) {
      try {

        if (formElement.__ngContext__) {
          const context = formElement.__ngContext__;


          for (let i = 0; i < context.length; i++) {
            if (context[i] && typeof context[i] === 'object') {

              const possibleForm = context[i].productionSheetForm ||
                context[i].form ||
                context[i].formGroup ||
                context[i]._formGroup;

              if (possibleForm && possibleForm.get && typeof possibleForm.get === 'function') {
                angularForm = possibleForm;
                break;
              }
            }
          }
        }


        if (!angularForm) {
          let parentElement = formElement.parentElement;
          while (parentElement && !angularForm) {
            if ((parentElement as any).__ngContext__) {
              const parentContext = (parentElement as any).__ngContext__;
              for (let i = 0; i < parentContext.length; i++) {
                if (parentContext[i] && parentContext[i].productionSheetForm) {
                  angularForm = parentContext[i].productionSheetForm;
                  break;
                }
              }
            }
            parentElement = parentElement.parentElement;
          }
        }
      } catch (e) {
      }
    }


    const componentValues = new Map<string, any>();


    const originalDsComponents = element.querySelectorAll('ds-input, ds-select, ds-textarea');

    originalDsComponents.forEach((originalComponent, index) => {
      const dsElement = originalComponent as HTMLElement;
      const tagName = dsElement.tagName.toLowerCase();


      const formControlName = dsElement.getAttribute('formControlName') || '';
      const label = dsElement.getAttribute('label') || '';
      const uniqueKey = `${tagName}_${index}_${formControlName}_${label}`;

      let labelText = label;
      let currentValue = '';
      let displayValue = '';


      if (angularForm && formControlName && angularForm.get && angularForm.get(formControlName)) {
        const control = angularForm.get(formControlName);
        currentValue = control.value || '';
        displayValue = currentValue;
      } else {


        if (tagName === 'ds-input') {
          const nativeInput = originalComponent.querySelector('input') as HTMLInputElement;
          if (nativeInput) {
            currentValue = nativeInput.value || '';
            displayValue = currentValue;


            if (nativeInput.type === 'date' && currentValue) {
              const date = new Date(currentValue);
              displayValue = date.toLocaleDateString('pt-BR');
            }
          }
        }
        else if (tagName === 'ds-select') {
          const nativeSelect = originalComponent.querySelector('select') as HTMLSelectElement;

          if (nativeSelect && nativeSelect.value) {
            currentValue = nativeSelect.value;
            const selectedOption = nativeSelect.querySelector(`option[value="${currentValue}"]`) as HTMLOptionElement;
            displayValue = selectedOption?.textContent || currentValue;
          } else {

            const displayElement = originalComponent.querySelector('.ds-select-value, .select-value, .selected-value, [class*="value"]');
            if (displayElement) {
              displayValue = displayElement.textContent?.trim() || '';
              currentValue = displayValue;
            }
          }
        }
        else if (tagName === 'ds-textarea') {

          const innerHTML = originalComponent.innerHTML;


          const textareaMatch = innerHTML.match(/<textarea[^>]*>(.*?)<\/textarea>/s);

          if (textareaMatch) {

            currentValue = textareaMatch[0] || '';


            currentValue = currentValue.replace(/<[^>]*>/g, '').trim();


            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentValue;
            currentValue = tempDiv.textContent || tempDiv.innerText || currentValue;

            displayValue = currentValue;

          } else {
          }


          if (!currentValue) {
            const componentValue = originalComponent.getAttribute('value') || '';
            if (componentValue) {
              currentValue = componentValue;
              displayValue = currentValue;
            }
          }

        }
      }


      if (!labelText) {
        const labelElement = originalComponent.querySelector('.input-label, .label, label');
        if (labelElement) {
          labelText = labelElement.textContent?.trim() || '';
        }
      }


      componentValues.set(uniqueKey, {
        tagName,
        labelText,
        currentValue,
        displayValue,
        formControlName
      });

    });


    const clone = element.cloneNode(true) as HTMLElement;


    const icons = clone.querySelectorAll('ds-icon, .fa-solid, .fa-regular, .fa-brands, i[class*="fa-"], .icon');
    icons.forEach(icon => icon.remove());


    const clonedDsComponents = clone.querySelectorAll('ds-input, ds-select, ds-textarea');

    clonedDsComponents.forEach((clonedComponent, index) => {
      const dsElement = clonedComponent as HTMLElement;
      const tagName = dsElement.tagName.toLowerCase();


      const formControlName = dsElement.getAttribute('formControlName') || '';
      const label = dsElement.getAttribute('label') || '';
      const uniqueKey = `${tagName}_${index}_${formControlName}_${label}`;


      const componentData = componentValues.get(uniqueKey);

      if (!componentData) {
        return;
      }


      const fieldWrapper = document.createElement('div');
      fieldWrapper.className = 'print-field-group';


      if (componentData.labelText) {
        const labelElement = document.createElement('label');
        labelElement.textContent = componentData.labelText;
        labelElement.style.cssText = 'font-weight: 600; margin-bottom: 4px; display: block; color: #555; font-size: 11pt;';
        fieldWrapper.appendChild(labelElement);
      }


      const valueElement = document.createElement('span');
      valueElement.className = 'print-field-value';
      valueElement.textContent = componentData.displayValue || '-';


      if (componentData.tagName === 'ds-textarea') {
        valueElement.style.whiteSpace = 'pre-wrap';
      }

      fieldWrapper.appendChild(valueElement);


      if (dsElement.parentNode) {
        dsElement.parentNode.replaceChild(fieldWrapper, dsElement);
      }
    });


    this.processStandaloneInputs(clone, element);


    this.cleanupPrintElements(clone);

    return clone.innerHTML;
  }

  /**
   * 🔧 PROCESSAR INPUTS NATIVOS INDEPENDENTES
   */
  private processStandaloneInputs(clone: HTMLElement, originalElement: HTMLElement): void {
    const standaloneInputs = clone.querySelectorAll('input:not(ds-input input), select:not(ds-select select), textarea:not(ds-textarea textarea)');

    standaloneInputs.forEach((clonedInput, index) => {
      const input = clonedInput as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;


      const inputId = input.id || input.name || `input_${index}`;
      const inputType = input.type || input.tagName.toLowerCase();


      const originalInputs = originalElement.querySelectorAll('input:not(ds-input input), select:not(ds-select select), textarea:not(ds-textarea textarea)');
      const originalInput = originalInputs[index] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

      if (!originalInput) {
        return;
      }

      const currentValue = originalInput.value || '';
      let displayValue = currentValue;


      const fieldWrapper = document.createElement('div');
      fieldWrapper.className = 'print-field-group';


      let labelText = '';
      const labelFor = originalInput.id || originalInput.name;
      if (labelFor) {
        const label = originalElement.querySelector(`label[for="${labelFor}"]`);
        if (label) {
          labelText = label.textContent?.trim() || '';
        }
      }

      if (labelText) {
        const labelElement = document.createElement('label');
        labelElement.textContent = labelText;
        labelElement.style.cssText = 'font-weight: 600; margin-bottom: 4px; display: block; color: #555; font-size: 11pt;';
        fieldWrapper.appendChild(labelElement);
      }


      if (originalInput.type === 'date' && currentValue) {
        const date = new Date(currentValue);
        displayValue = date.toLocaleDateString('pt-BR');
      } else if (originalInput.tagName === 'SELECT') {
        const selectedOption = originalInput.querySelector(`option[value="${currentValue}"]`) as HTMLOptionElement;
        displayValue = selectedOption?.textContent || currentValue || '-';
      } else if (originalInput.tagName === 'TEXTAREA') {
        displayValue = currentValue || '-';
      }


      const valueElement = document.createElement('span');
      valueElement.className = 'print-field-value';
      valueElement.textContent = displayValue || '-';

      if (originalInput.tagName === 'TEXTAREA') {
        valueElement.style.whiteSpace = 'pre-wrap';
      }

      fieldWrapper.appendChild(valueElement);


      if (input.parentNode) {
        input.parentNode.replaceChild(fieldWrapper, input);
      }
    });
  }

  /**
   * 🧹 LIMPAR ELEMENTOS DESNECESSÁRIOS PARA IMPRESSÃO
   */
  private cleanupPrintElements(clone: HTMLElement): void {

    const allLabels = clone.querySelectorAll('.input-label, .label, label');
    allLabels.forEach(label => {
      const parent = label.parentElement;
      if (parent && !parent.querySelector('.print-field-value')) {
        label.remove();
      }
    });


    const dsButtons = clone.querySelectorAll('ds-button:not(.print-button), ds-print-button');
    dsButtons.forEach(button => button.remove());


    const spinners = clone.querySelectorAll('ds-spinner');
    spinners.forEach(spinner => spinner.remove());


    const emptyContainers = clone.querySelectorAll('.icon-container, .input-icon, .field-icon');
    emptyContainers.forEach(container => {
      if (!container.textContent?.trim()) {
        container.remove();
      }
    });
  }
}
