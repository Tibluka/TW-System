import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../../../shared/components/atoms/select/select.component';

@Component({
  selector: 'app-address-data',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './address-data.component.html',
  styleUrl: './address-data.component.scss'
})
export class AddressDataComponent implements OnInit {

  @Input() parentForm!: FormGroup;

  brazilianStates: SelectOption[] = [
    { value: 'AC', label: 'AC' },
    { value: 'AL', label: 'AL' },
    { value: 'AP', label: 'AP' },
    { value: 'AM', label: 'AM' },
    { value: 'BA', label: 'BA' },
    { value: 'CE', label: 'CE' },
    { value: 'DF', label: 'DF' },
    { value: 'ES', label: 'ES' },
    { value: 'GO', label: 'GO' },
    { value: 'MA', label: 'MA' },
    { value: 'MT', label: 'MT' },
    { value: 'MS', label: 'MS' },
    { value: 'MG', label: 'MG' },
    { value: 'PA', label: 'PA' },
    { value: 'PB', label: 'PB' },
    { value: 'PR', label: 'PR' },
    { value: 'PE', label: 'PE' },
    { value: 'PI', label: 'PI' },
    { value: 'RJ', label: 'RJ' },
    { value: 'RN', label: 'RN' },
    { value: 'RS', label: 'RS' },
    { value: 'RO', label: 'RO' },
    { value: 'RR', label: 'RR' },
    { value: 'SC', label: 'SC' },
    { value: 'SP', label: 'SP' },
    { value: 'SE', label: 'SE' },
    { value: 'TO', label: 'TO' }
  ];

  ngOnInit(): void {
    if (!this.parentForm) {
      console.error('parentForm is required for AddressDataComponent');
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
          case 'zipcode': return 'CEP é obrigatório';
          case 'street': return 'Logradouro é obrigatório';
          case 'number': return 'Número é obrigatório';
          case 'neighborhood': return 'Bairro é obrigatório';
          case 'city': return 'Cidade é obrigatória';
          case 'state': return 'Estado é obrigatório';
          default: return 'Campo obrigatório';
        }
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `Mínimo ${minLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `Máximo ${maxLength} caracteres`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'zipcode') {
          return 'CEP deve ter formato válido (12345-678)';
        }
      }
      if (field.errors['invalidState']) {
        return 'Estado deve ser uma sigla válida (ex: SP, RJ, MG)';
      }
    }

    return '';
  }


  onCepBlur(): void {
    const cep = this.parentForm.get('zipcode')?.value;
    if (cep && cep.length === 9) {

      console.log('Buscar endereço para CEP:', cep);
    }
  }
}
