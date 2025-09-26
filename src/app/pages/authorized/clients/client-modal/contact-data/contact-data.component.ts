import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/atoms/input/input.component';

@Component({
  selector: 'app-contact-data',
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './contact-data.component.html',
  styleUrl: './contact-data.component.scss'
})
export class ContactDataComponent implements OnInit {

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
          case 'responsibleName': return 'Nome do responsável é obrigatório';
          case 'email': return 'Email é obrigatório';
          case 'phone': return 'Telefone é obrigatório';
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
      if (field.errors['email']) {
        return 'Email deve ter formato válido (exemplo@dominio.com)';
      }
      if (field.errors['pattern']) {
        return 'Formato de telefone inválido';
      }
    }

    return '';
  }
}
