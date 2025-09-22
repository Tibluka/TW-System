import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/atoms/input/input.component';

@Component({
  selector: 'app-company-data',
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './company-data.component.html',
  styleUrl: './company-data.component.scss'
})
export class CompanyDataComponent implements OnInit {

  private formBuilder = inject(FormBuilder);

  companyForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.companyForm = this.formBuilder.group({
      companyName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      cnpj: ['', [
        Validators.required,
        Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
      ]],
      acronym: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10)
      ]]
    });
  }

  // Getters para validação
  get companyName() { return this.companyForm.get('companyName'); }
  get cnpj() { return this.companyForm.get('cnpj'); }
  get acronym() { return this.companyForm.get('acronym'); }

  // Verifica se campo é inválido e foi tocado
  isFieldInvalid(fieldName: string): boolean {
    const field = this.companyForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Obtém mensagem de erro personalizada
  getErrorMessage(fieldName: string): string {
    const field = this.companyForm.get(fieldName);

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