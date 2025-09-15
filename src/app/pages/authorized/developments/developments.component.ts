// src/app/pages/development/development-form/development-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageData } from '../../../services/image-upload/image-upload.service';
import { DevelopmentService } from '../../../services/development/development.service';

@Component({
  selector: 'app-development-form',
  templateUrl: './development-form.component.html',
  styleUrls: ['./development-form.component.scss']
})
export class DevelopmentsComponent implements OnInit {
  developmentForm!: FormGroup;
  developmentId: string | null = null;
  currentDevelopment: any = null;
  isEditMode = false;
  isReadonly = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private developmentService: DevelopmentService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.developmentId = params['id'];
        this.isEditMode = true;
        this.loadDevelopment();
      }
    });

    // Verificar se é modo de visualização
    this.route.url.subscribe(url => {
      this.isReadonly = url.some(segment => segment.path === 'view');
    });
  }

  private initForm() {
    this.developmentForm = this.fb.group({
      clientId: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      clientReference: [''],
      variants: this.fb.array([]),
      productionType: this.fb.group({
        rotary: this.fb.group({
          enabled: [false],
          negotiatedPrice: [null]
        }),
        localized: this.fb.group({
          enabled: [false],
          sizes: this.fb.group({
            xs: [0],
            s: [0],
            m: [0],
            l: [0],
            xl: [0]
          })
        })
      })
    });
  }

  private loadDevelopment() {
    if (!this.developmentId) return;

    this.loading = true;
    this.developmentService.getDevelopment(this.developmentId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.currentDevelopment = response.data;
            this.populateForm(this.currentDevelopment);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar development:', error);
          this.error = 'Erro ao carregar dados do development';
          this.loading = false;
        }
      });
  }

  private populateForm(development: any) {
    this.developmentForm.patchValue({
      clientId: development.clientId,
      description: development.description,
      clientReference: development.clientReference,
      productionType: development.productionType
    });

    // Popular variants se existirem
    // ... código para popular variants array
  }

  // Callback quando imagem é enviada com sucesso
  onImageUploaded(imageData: ImageData) {
    console.log('Imagem enviada:', imageData);

    // Atualizar dados locais
    if (this.currentDevelopment) {
      this.currentDevelopment.pieceImage = imageData;
    }

    // Exibir mensagem de sucesso
    // Aqui você pode usar seu sistema de notificações
    alert('Imagem enviada com sucesso!');
  }

  // Callback quando imagem é removida
  onImageRemoved() {
    console.log('Imagem removida');

    // Limpar dados locais
    if (this.currentDevelopment) {
      this.currentDevelopment.pieceImage = null;
    }

    // Exibir mensagem
    alert('Imagem removida com sucesso!');
  }

  onSubmit() {
    if (this.developmentForm.invalid) {
      this.markFormGroupTouched(this.developmentForm);
      return;
    }

    const formData = this.developmentForm.value;
    this.loading = true;

    const request = this.isEditMode
      ? this.developmentService.updateDevelopment(this.developmentId!, formData)
      : this.developmentService.createDevelopment(formData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Development salvo:', response.data);
          this.router.navigate(['/developments']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao salvar development:', error);
        this.error = error.error?.message || 'Erro ao salvar development';
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  goBack() {
    this.router.navigate(['/developments']);
  }

  // Getter para facilitar acesso aos controles do form
  get f() {
    return this.developmentForm.controls;
  }
}