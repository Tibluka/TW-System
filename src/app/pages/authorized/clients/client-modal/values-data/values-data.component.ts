import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/atoms/input/input.component';
import { FormValidator } from '../../../../../shared/utils/form';

@Component({
  selector: 'app-values-data',
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './values-data.component.html',
  styleUrl: './values-data.component.scss'
})
export class ValuesDataComponent extends FormValidator implements OnInit {

  @Input() parentForm!: FormGroup;

  ngOnInit(): void {
    if (!this.parentForm) {
    }
  }


  isFieldInvalid(fieldName: string): boolean {
    const field = this.parentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }


  getErrorMessage(fieldName: string): string {
    const field = this.parentForm.get(fieldName);

    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        switch (fieldName) {
          case 'valuePerMeter': return 'Valor por metro é obrigatório';
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


  onCurrencyBlur(fieldName: string): void {
    const field = this.parentForm.get(fieldName);
    if (field && field.value) {
      const value = parseFloat(field.value);
      if (!isNaN(value)) {
        field.setValue(value.toFixed(2));
      }
    }
  }


}
