// pages/authorized/production-orders/production-order-modal/production-order-modal.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { debounceTime, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Development, ProductionTypeEnum } from '../../../../models/developments/developments';
import {
  CreateProductionOrderRequest,
  ProductionOrder,
  UpdateProductionOrderRequest,
  SizeItem,
  ProductionTypeWithQuantities,
  ProductionOrderUtils
} from '../../../../models/production-orders/production-orders';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SelectComponent } from '../../../../shared/components/atoms/select/select.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';
import { DevelopmentService } from '../../../../shared/services/development/development.service';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { ProductionOrderService } from '../../../../shared/services/production-order/production-order.service';
import { FormValidator } from '../../../../shared/utils/form';
import { IconComponent } from "../../../../shared/components/atoms/icon/icon.component";

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-production-order-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    SpinnerComponent,
    IconComponent
  ],
  templateUrl: './production-order-modal.component.html',
  styleUrl: './production-order-modal.component.scss'
})
export class ProductionOrderModalComponent extends FormValidator implements OnInit, OnDestroy {

  @Input() productionOrderId?: string;

  // ============================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ============================================
  private formBuilder = inject(FormBuilder);
  private productionOrderService = inject(ProductionOrderService);
  private developmentService = inject(DevelopmentService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  // ============================================
  // PROPRIEDADES DO COMPONENTE
  // ============================================
  productionOrderForm!: FormGroup;
  isLoading = false;
  isSaving = false;

  // Estados para busca de desenvolvimento
  searchingDevelopment = false;
  developmentFound: Development | null = null;
  developmentNotFound = false;

  // Controle de exibição de campos baseado no tipo de produção
  showRotaryFields = false;
  showLocalizedFields = false;

  // Opções para selects
  statusOptions: SelectOption[] = [
    { value: 'CREATED', label: 'Criado' },
    { value: 'PILOT_PRODUCTION', label: 'Produção Piloto' },
    { value: 'PILOT_SENT', label: 'Piloto Enviado' },
    { value: 'PILOT_APPROVED', label: 'Piloto Aprovado' },
    { value: 'PRODUCTION_STARTED', label: 'Produção Iniciada' },
    { value: 'FINALIZED', label: 'Finalizado' }
  ];

  // Subject para controlar debounce da busca de desenvolvimento
  private searchDevelopmentSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ============================================
  // CICLO DE VIDA
  // ============================================

  async ngOnInit(): Promise<void> {
    this.initializeForm();
    this.initializeDevelopmentSearch();
    await this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // GETTERS
  // ============================================

  get isEditMode(): boolean {
    return !!this.productionOrderForm.value._id;
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  get sizeInputs(): FormArray {
    return this.productionOrderForm.get('sizeInputs') as FormArray;
  }

  // ============================================
  // SETUP METHODS
  // ============================================

  /**
   * 📝 INICIALIZAR FORM - Cria formulário reativo
   */
  private initializeForm(): void {
    this.productionOrderForm = this.formBuilder.group({
      internalReference: ['', [Validators.required]],
      fabricType: ['', [Validators.required]],
      observations: [''],
      status: ['CREATED'],

      // Campos condicionais para rotary
      rotaryMeters: [0],

      // FormArray para tamanhos (localized)
      sizeInputs: this.formBuilder.array([])
    });

    console.log('📝 Formulário da ordem de produção inicializado');
  }

  /**
   * 🔍 INICIALIZAR BUSCA - Configura debounce para busca de desenvolvimento
   */
  private initializeDevelopmentSearch(): void {
    this.searchDevelopmentSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(internalReference => {
        if (internalReference && internalReference.length >= 3) {
          this.searchDevelopment(internalReference);
        } else {
          this.resetDevelopmentSearch();
        }
      });
  }

  /**
   * 📊 CARREGAR DADOS INICIAIS - Carrega ordem de produção (se edição)
   */
  private async loadInitialData(): Promise<void> {
    this.isLoading = true;

    try {
      // Acessar dados do modal ativo
      const activeModal = this.modalService.activeModal();
      if (activeModal?.config.data) {
        const productionOrder = activeModal.config.data.productionOrder;
        if (productionOrder) {
          await this.populateForm(productionOrder);
          console.log('✅ Dados carregados do modal ativo');
          return;
        }
      }

      // Se tem ID, buscar dados da ordem de produção
      if (this.productionOrderId) {
        const response = await lastValueFrom(
          this.productionOrderService.getProductionOrderById(this.productionOrderId)
        );

        if (response?.data) {
          await this.populateForm(response.data);
          console.log('✅ Dados da ordem de produção carregados via API');
        }
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // ============================================
  // DEVELOPMENT SEARCH METHODS
  // ============================================

  /**
   * 🔍 BUSCAR DESENVOLVIMENTO - Busca desenvolvimento por referência interna
   */
  onInternalReferenceChange(value: string): void {
    this.searchDevelopmentSubject.next(value);
  }

  /**
   * 🔍 EXECUTAR BUSCA - Executa busca do desenvolvimento
   */
  private async searchDevelopment(internalReference: string): Promise<void> {
    this.searchingDevelopment = true;
    this.developmentNotFound = false;

    try {
      const response = await lastValueFrom(
        this.developmentService.getDevelopmentByInternalReference(internalReference)
      );

      if (response?.data) {
        this.developmentFound = response.data;
        this.developmentNotFound = false;

        // ✅ DETECTAR TIPO DE PRODUÇÃO (nova estrutura)
        this.detectProductionTypes();
        this.setupConditionalValidations();

        console.log('✅ Desenvolvimento encontrado:', response.data);
      } else {
        this.resetDevelopmentSearch();
        this.developmentNotFound = true;
      }

    } catch (error) {
      console.error('❌ Erro na busca de desenvolvimento:', error);
      this.resetDevelopmentSearch();
      this.developmentNotFound = true;
    } finally {
      this.searchingDevelopment = false;
    }
  }

  /**
   * 🔄 RESETAR BUSCA - Reseta estado da busca de desenvolvimento
   */
  private resetDevelopmentSearch(): void {
    this.developmentFound = null;
    this.developmentNotFound = false;
    this.showRotaryFields = false;
    this.showLocalizedFields = false;
    this.clearConditionalValidations();
  }

  /**
   * 🔍 DETECTAR TIPOS DE PRODUÇÃO - Detecta tipos habilitados no development
   */
  private detectProductionTypes(): void {
    if (!this.developmentFound?.productionType) return;

    // ✅ NOVA ESTRUTURA: productionType é string simples
    this.showRotaryFields = this.developmentFound.productionType === 'rotary';
    this.showLocalizedFields = this.developmentFound.productionType === 'localized';

    console.log('🔍 Tipos detectados:', {
      productionType: this.developmentFound.productionType,
      showRotary: this.showRotaryFields,
      showLocalized: this.showLocalizedFields
    });
  }

  /**
   * ⚙️ CONFIGURAR VALIDAÇÕES CONDICIONAIS
   */
  private setupConditionalValidations(): void {
    if (this.showRotaryFields) {
      this.productionOrderForm.get('rotaryMeters')?.setValidators([Validators.required, Validators.min(0.1)]);
    } else {
      this.productionOrderForm.get('rotaryMeters')?.clearValidators();
    }

    if (this.showLocalizedFields) {
      // Validação customizada: pelo menos um tamanho deve ser > 0
      this.productionOrderForm.setValidators([this.atLeastOneSizeValidator]);
      // Adicionar pelo menos um campo de tamanho se não existe
      if (this.sizeInputs.length === 0) {
        this.addSizeInput();
      }
    } else {
      this.productionOrderForm.clearValidators();
      // Limpar array de tamanhos
      while (this.sizeInputs.length !== 0) {
        this.sizeInputs.removeAt(0);
      }
    }

    this.productionOrderForm.updateValueAndValidity();
  }

  /**
   * 🧹 LIMPAR VALIDAÇÕES CONDICIONAIS
   */
  private clearConditionalValidations(): void {
    this.productionOrderForm.get('rotaryMeters')?.clearValidators();
    this.productionOrderForm.clearValidators();
    // Limpar array de tamanhos
    while (this.sizeInputs.length !== 0) {
      this.sizeInputs.removeAt(0);
    }
    this.productionOrderForm.updateValueAndValidity();
  }

  /**
   * ✅ VALIDADOR CUSTOMIZADO - Pelo menos um tamanho deve ter quantidade
   */
  private atLeastOneSizeValidator = (form: AbstractControl): ValidationErrors | null => {
    if (!this.showLocalizedFields) return null;

    const sizeInputs = form.get('sizeInputs') as FormArray;
    if (!sizeInputs || sizeInputs.length === 0) {
      return { atLeastOneSize: true };
    }

    const hasValidSize = sizeInputs.controls.some(control => {
      const size = control.get('size')?.value?.trim();
      const value = control.get('value')?.value;
      return size && value && value > 0;
    });

    return hasValidSize ? null : { atLeastOneSize: true };
  };

  // ============================================
  // SIZE MANAGEMENT METHODS (LOCALIZED)
  // ============================================

  /**
   * ➕ ADICIONAR CAMPO DE TAMANHO
   */
  addSizeInput(): void {
    const sizeGroup = this.formBuilder.group({
      size: ['', [Validators.required, Validators.maxLength(10)]],
      value: [0, [Validators.required, Validators.min(1)]]
    });

    this.sizeInputs.push(sizeGroup);
    console.log('➕ Campo de tamanho adicionado. Total:', this.sizeInputs.length);
  }

  /**
   * ➖ REMOVER CAMPO DE TAMANHO
   */
  removeSizeInput(index: number): void {
    if (this.sizeInputs.length > 1) {
      this.sizeInputs.removeAt(index);
      console.log('➖ Campo de tamanho removido. Total:', this.sizeInputs.length);
    }
  }

  /**
   * 📊 OBTER TAMANHOS DO FORMULÁRIO
   */
  private getSizesFromForm(): SizeItem[] {
    return this.sizeInputs.controls
      .map(control => ({
        size: control.get('size')?.value?.trim() || '',
        value: Number(control.get('value')?.value) || 0
      }))
      .filter(item => item.size && item.value > 0);
  }

  // ============================================
  // FORM POPULATION METHODS
  // ============================================

  /**
   * 📋 POPULAR FORMULÁRIO - Preenche dados da ordem de produção para edição
   */
  private async populateForm(productionOrder: ProductionOrder): Promise<void> {
    // Se tem desenvolvimento vinculado, carregar e exibir
    if (productionOrder.development) {
      this.developmentFound = productionOrder.development;
      this.detectProductionTypes();
      this.setupConditionalValidations();
    }

    // Preencher campos básicos
    this.productionOrderForm.patchValue({
      internalReference: productionOrder.development?.internalReference || '',
      fabricType: productionOrder.fabricType || '',
      observations: productionOrder.observations || '',
      status: productionOrder.status || 'CREATED'
    });

    // ✅ PREENCHER DADOS DE PRODUÇÃO (nova estrutura)
    if (productionOrder.productionType) {
      if (productionOrder.productionType.type === 'rotary' && productionOrder.productionType.meters) {
        this.productionOrderForm.patchValue({
          rotaryMeters: productionOrder.productionType.meters
        });
      }

      if (productionOrder.productionType.type === 'localized' && productionOrder.productionType.sizes) {
        // Limpar array existente
        while (this.sizeInputs.length !== 0) {
          this.sizeInputs.removeAt(0);
        }

        // Adicionar tamanhos existentes
        productionOrder.productionType.sizes.forEach(sizeItem => {
          const sizeGroup = this.formBuilder.group({
            size: [sizeItem.size, [Validators.required, Validators.maxLength(10)]],
            value: [sizeItem.value, [Validators.required, Validators.min(1)]]
          });
          this.sizeInputs.push(sizeGroup);
        });
      }
    }

    // Se existir _id na ordem de produção, adiciona o form control _id
    if (productionOrder._id) {
      if (!this.productionOrderForm.contains('_id')) {
        this.productionOrderForm.addControl('_id', this.formBuilder.control(productionOrder._id));
      } else {
        this.productionOrderForm.get('_id')?.setValue(productionOrder._id);
      }
    }

    console.log('✅ Dados da ordem de produção carregados para edição:', productionOrder);
  }

  // ============================================
  // FORM ACTIONS
  // ============================================

  /**
   * 💾 SALVAR - Processa envio do formulário
   */
  async onSave(): Promise<void> {
    if (this.productionOrderForm.invalid || this.isSaving) {
      this.markAllFieldsAsTouched();
      console.warn('⚠️ Formulário inválido - validação falhou');
      return;
    }

    // Verificar se desenvolvimento foi encontrado (para criação)
    if (!this.developmentFound && !this.isEditMode) {
      alert('É necessário selecionar um desenvolvimento válido.');
      return;
    }

    this.isSaving = true;

    try {
      const formData = this.productionOrderForm.value;

      if (this.isEditMode) {
        // ATUALIZAR ordem existente
        const updateData: UpdateProductionOrderRequest = {
          fabricType: formData.fabricType,
          observations: formData.observations,
          status: formData.status,
          productionType: this.buildProductionTypeData(formData)
        };

        const response = await lastValueFrom(
          this.productionOrderService.updateProductionOrder(formData._id, updateData)
        );

        console.log('✅ Ordem de produção atualizada:', response);
        this.modalService.close('production-order-modal', { action: 'updated', data: response.data });

      } else {
        // CRIAR nova ordem
        const createData: CreateProductionOrderRequest = {
          developmentId: this.developmentFound!._id!,
          fabricType: formData.fabricType,
          observations: formData.observations,
          productionType: this.buildProductionTypeData(formData)
        };

        const response = await lastValueFrom(
          this.productionOrderService.createProductionOrder(createData)
        );

        console.log('✅ Nova ordem de produção criada:', response);
        this.modalService.close('production-order-modal', { action: 'created', data: response.data });
      }

    } catch (error: any) {
      console.error('❌ Erro ao salvar ordem de produção:', error);

      const errorMessage = error.error?.message || error.message || 'Erro ao salvar ordem de produção.';
      alert(errorMessage);

    } finally {
      this.isSaving = false;
    }
  }

  /**
   * 🏗️ CONSTRUIR DADOS DE PRODUCTION TYPE
   */
  private buildProductionTypeData(formData: any): ProductionTypeWithQuantities {
    return {
      type: this.developmentFound!.productionType,
      meters: this.showRotaryFields ? formData.rotaryMeters : undefined,
      sizes: this.showLocalizedFields ? this.getSizesFromForm() : undefined
    };
  }

  /**
   * ❌ CANCELAR - Fecha modal sem salvar
   */
  onCancel(): void {
    this.modalService.close('production-order-modal', { action: 'cancelled' });
  }

  // ============================================
  // MÉTODOS DE VALIDAÇÃO E HELPERS
  // ============================================

  /**
   * ✅ VALIDAR CAMPO - Verifica se campo específico é válido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productionOrderForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * 📝 MENSAGEM DE ERRO - Retorna mensagem de erro para campo
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.productionOrderForm.get(fieldName);

    if (field?.errors?.['required']) {
      return 'Este campo é obrigatório';
    }

    if (field?.errors?.['min']) {
      const minValue = field.errors['min'].min;
      return `Valor mínimo: ${minValue}`;
    }

    if (field?.errors?.['max']) {
      const maxValue = field.errors['max'].max;
      return `Valor máximo: ${maxValue}`;
    }

    if (field?.errors?.['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    return 'Campo inválido';
  }

  /**
   * 📝 MENSAGEM DE ERRO GERAL - Para validações de formulário
   */
  getFormErrorMessage(): string {
    if (this.productionOrderForm.errors?.['atLeastOneSize']) {
      return 'Pelo menos um tamanho deve ter quantidade maior que 0';
    }
    return '';
  }

  /**
   * 🔍 TEM ERRO GERAL - Verifica se há erros de formulário
   */
  hasFormError(): boolean {
    return !!(this.productionOrderForm.errors && this.productionOrderForm.touched);
  }

  /**
   * 📊 CALCULAR TOTAL DE PEÇAS - Para produção localizada
   */
  getTotalPieces(): number {
    if (!this.showLocalizedFields) return 0;

    return this.sizeInputs.controls.reduce((total, control) => {
      const value = Number(control.get('value')?.value) || 0;
      return total + value;
    }, 0);
  }

  /**
   * 📋 MARCAR TODOS COMO TOUCHED - Para exibir erros de validação
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.productionOrderForm.controls).forEach(key => {
      this.productionOrderForm.get(key)?.markAsTouched();
    });

    // Marcar campos do FormArray também
    this.sizeInputs.controls.forEach(control => {
      Object.keys(control.value).forEach(key => {
        control.get(key)?.markAsTouched();
      });
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * 📅 FORMATAR DATA - Formata data para exibição
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  /**
   * 🏷️ OBTER LABEL DO TIPO DE PRODUÇÃO
   */
  getProductionTypeLabel(type: ProductionTypeEnum): string {
    return type === 'rotary' ? 'Rotativa' : 'Localizada';
  }
}