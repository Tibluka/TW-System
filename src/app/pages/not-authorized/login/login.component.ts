import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth-service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { PermissionsService } from '../../../shared/services/permissions/permissions.service';


import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { CardComponent } from '../../../shared/components/organisms/card/card.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  providers: [
    NgModel
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private permissionsService: PermissionsService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('✅ Login component - sucesso:', response);
        this.isLoading = false;

        // Aguarda um pouco para garantir que as permissões foram carregadas
        setTimeout(() => {
          const firstAvailableRoute = this.permissionsService.getFirstAvailableRoute();
          console.log('🎯 Redirecionando para primeira rota disponível:', firstAvailableRoute);
          this.router.navigate([firstAvailableRoute]);
        }, 100);
      },
      error: (error) => {
        console.error('❌ Login component - erro:', error);
        this.isLoading = false;
        this.errorMessage = 'Credenciais inválidas. Tente novamente.';

        // Mostra toast específico para erro de login
        this.toastService.error('Erro no login', 'Credenciais inválidas', {
          message: 'Verifique seu email e senha e tente novamente.'
        });
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }


  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }

    if (errors['email']) {
      return 'Email inválido';
    }

    if (errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${errors['minlength'].requiredLength} caracteres`;
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'email': 'Email',
      'password': 'Senha'
    };
    return labels[fieldName] || fieldName;
  }
}
