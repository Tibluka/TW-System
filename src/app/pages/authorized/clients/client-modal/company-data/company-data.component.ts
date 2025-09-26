import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/atoms/input/input.component';

@Component({
  selector: 'app-company-data',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent
  ],
  templateUrl: './company-data.component.html',
  styleUrl: './company-data.component.scss'
})
export class CompanyDataComponent implements OnInit {

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
          case 'companyName': return 'Razão social é obrigatória';
          case 'cnpj': return 'CNPJ é obrigatório';
          case 'acronym': return 'Sigla é obrigatória';
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
        return 'CNPJ deve ter formato válido (00.000.000/0000-00)';
      }
    }

    return '';
  }
}
