import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/atoms/input/input.component';
import { BrazilianState } from '../../../../../models/clients/clients';

@Component({
  selector: 'app-address-data',
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './address-data.component.html',
  styleUrl: './address-data.component.scss'
})
export class AddressDataComponent implements OnInit {

  @Input() parentForm!: FormGroup;

  // Estados brasileiros para validação
  brazilianStates: BrazilianState[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  ngOnInit(): void {
    if (!this.parentForm) {
      console.error('parentForm is required for AddressDataComponent');
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

  // Método para buscar endereço por CEP (futura implementação)
  onCepBlur(): void {
    const cep = this.parentForm.get('zipcode')?.value;
    if (cep && cep.length === 9) {
      // TODO: Implementar busca de endereço via CEP
      console.log('Buscar endereço para CEP:', cep);
    }
  }
}