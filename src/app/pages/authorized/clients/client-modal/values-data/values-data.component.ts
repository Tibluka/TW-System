import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/atoms/input/input.component';

@Component({
  selector: 'app-values-data',
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './values-data.component.html',
  styleUrl: './values-data.component.scss'
})
export class ValuesDataComponent implements OnInit {

  @Input() parentForm!: FormGroup;

  ngOnInit(): void {
    if (!this.parentForm) {
      console.error('parentForm is required for ValuesDataComponent');
    }
  }

  // Verifica se campo é inválido e foi tocado
  isFieldInvalid(fieldName: string): boolean {
    const field = this.parentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Obtém mensagem de erro personalizada
  getErrorMessage(fieldName: string): string {
    const field = this.parentForm.get(fieldName);

    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        switch (fieldName) {
          case 'valuePerMeter': return 'Valor por metro é obrigatório';
          case 'valuePerPiece': return 'Valor por peça é obrigatório';
          default: return 'Campo obrigatório';
        }
      }
      if (field.errors['min']) {
        return 'Valor deve ser positivo (maior que 0)';
      }
      if (field.errors['invalidCurrency']) {
        return 'Valor deve ser um número válido';
      }
      if (field.errors['tooManyDecimals']) {
        return 'Máximo 2 casas decimais';
      }
    }

    return '';
  }

  // Formatação de moeda no blur
  onCurrencyBlur(fieldName: string): void {
    const field = this.parentForm.get(fieldName);
    if (field && field.value) {
      const value = parseFloat(field.value);
      if (!isNaN(value)) {
        field.setValue(value.toFixed(2));
      }
    }
  }

  // Método para calcular diferença percentual (se útil)
  getPercentageDifference(): string {
    const meterValue = parseFloat(this.parentForm.get('valuePerMeter')?.value || '0');
    const pieceValue = parseFloat(this.parentForm.get('valuePerPiece')?.value || '0');

    if (meterValue > 0 && pieceValue > 0) {
      const difference = ((pieceValue - meterValue) / meterValue) * 100;
      return `${difference >= 0 ? '+' : ''}${difference.toFixed(1)}%`;
    }

    return '';
  }
}