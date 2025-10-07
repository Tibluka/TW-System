

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Development } from '../../../../models/developments/developments';
import { ProductionTypeEnum, ProductionVariant } from '../../../../models/production-type';
import { CreateProductionOrderRequest, ProductionOrder, UpdateProductionOrderRequest } from '../../../../models/production-orders/production-orders';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { CheckboxComponent } from '../../../../shared/components/atoms/checkbox/checkbox.component';
import { IconComponent } from "../../../../shared/components/atoms/icon/icon.component";
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';
import { DevelopmentService } from '../../../../shared/services/development/development.service';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { ProductionOrderService } from '../../../../shared/services/production-order/production-order.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { FormValidator } from '../../../../shared/utils/form';
import { DateFormatter } from '../../../../shared/utils/date-formatter';
import { translateProductionType } from '../../../../shared/utils/tools';

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
    CheckboxComponent,
    InputComponent,
    TextareaComponent,
    SpinnerComponent,
    FormsModule,
    IconComponent
  ],
  templateUrl: './production-order-modal.component.html',
  styleUrl: './production-order-modal.component.scss'
})
export class ProductionOrderModalComponent extends FormValidator implements OnInit {

  @Input() productionOrderId?: string;


  private formBuilder = inject(FormBuilder);
  private productionOrderService = inject(ProductionOrderService);
  private developmentService = inject(DevelopmentService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);


  productionOrderForm!: FormGroup;
  isLoading = false;
  isSaving = false;


  searchingDevelopment = false;
  developmentFound: Development | null = null;
  developmentNotFound = false;


  sizeOptions = [
    { value: 'PP', label: 'PP' },
    { value: 'P', label: 'P' },
    { value: 'M', label: 'M' },
    { value: 'G', label: 'G' },
    { value: 'G1', label: 'G1' },
    { value: 'G2', label: 'G2' }
  ];


  statusOptions: SelectOption[] = [
    { value: 'CREATED', label: 'Criado' },
    { value: 'PILOT_PRODUCTION', label: 'Produção Piloto' },
    { value: 'PILOT_SENT', label: 'Piloto Enviado' },
    { value: 'PILOT_APPROVED', label: 'Piloto Aprovado' },
    { value: 'PRODUCTION_STARTED', label: 'Produção Iniciada' },
    { value: 'FINALIZED', label: 'Finalizado' }
  ];


  variantOptions: SelectOption[] = [
    { value: 'COR123', label: 'Cor 1' }
  ];


  private searchDevelopmentSubject = new Subject<string>();
  private destroy$ = new Subject<void>();


  async ngOnInit(): Promise<void> {
    this.initializeForm();
    this.initializeDevelopmentSearch();
    await this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get isEditMode(): boolean {
    return !!this.productionOrderForm.value._id;
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }


  /**
   * 📝 INICIALIZAR FORM - Cria formulário reativo
   */
  private initializeForm(): void {
    this.productionOrderForm = this.formBuilder.group({
      internalReference: ['', [Validators.required]],
      productionType: this.formBuilder.group({
        type: ['', [Validators.required]],
        meters: [0, [Validators.required, Validators.min(0)]],
        fabricType: [''],
        variants: this.formBuilder.array([])
      }),
      observations: [''],
      status: [''],
      hasCraft: [false],
      fabricWidth: [null, [Validators.min(0.1), Validators.max(500)]]
    });
  }

  /**
   * 🏗️ CRIAR PRODUCTION TYPE COMPLETO - Cria objeto productionType baseado no tipo
   */
  private createProductionType(type: 'rotary' | 'localized'): any {
    if (type === 'rotary') {
      return {
        type: 'rotary',
        meters: 1000,
        fabricType: 'algodao'
      };
    } else {
      return {
        type: 'localized',
        variants: [
          {
            variantName: 'COR_AZUL',
            fabricType: 'algodao',
            quantities: [
              { size: 'PP', value: 10 },
              { size: 'P', value: 20 }
            ]
          }
        ]
      };
    }
  }

  /**
   * 🎯 INICIALIZAR PRODUCTION TYPE DO DESENVOLVIMENTO - Detecta tipo e preenche estrutura
   */
  private initializeProductionTypeFromDevelopment(development: Development): void {
    const productionType = development.productionType;

    if (productionType === 'rotary') {
      const rotaryData = {
        type: 'rotary',
        meters: 0, // Valor padrão
        fabricType: '' // Valor padrão
      };
      this.productionOrderForm.patchValue({
        productionType: rotaryData
      });

      this.productionOrderForm.get('fabricType')?.setValidators([Validators.required]);
      this.productionOrderForm.get('fabricType')?.updateValueAndValidity();


      this.variantsArray.clear();
    } else if (productionType === 'localized') {
      this.productionOrderForm.patchValue({
        productionType: {
          type: 'localized'
        }
      });
      this.productionOrderForm.get('fabricType')?.clearValidators();
      this.productionOrderForm.get('fabricType')?.updateValueAndValidity();

      this.variantsArray.clear();


      const variantGroup = this.formBuilder.group({
        variantName: ['COR_AZUL'],
        fabricType: ['algodao'],
        quantities: this.formBuilder.array([
          this.formBuilder.group({ size: 'PP', value: 10 }),
          this.formBuilder.group({ size: 'P', value: 20 }),
          this.formBuilder.group({ size: 'M', value: 0 }),
          this.formBuilder.group({ size: 'G', value: 0 }),
          this.formBuilder.group({ size: 'G1', value: 0 }),
          this.formBuilder.group({ size: 'G2', value: 0 })
        ])
      });

      this.variantsArray.push(variantGroup);
    }
  }

  /**
   * 🔄 ATUALIZAR PRODUCTION TYPE - Atualiza o productionType quando o tipo muda
   */
  onProductionTypeChange(event: any): void {
    const type = event.value;
    const productionTypeData = this.createProductionType(type);
    this.productionOrderForm.patchValue({
      productionType: productionTypeData
    });
  }

  /**
   * 📋 GETTERS - Acesso aos FormArrays
   */
  get variantsArray(): FormArray {
    return this.productionOrderForm.get('productionType.variants') as FormArray;
  }

  get productionTypeValue(): any {
    return this.productionOrderForm.get('productionType')?.value;
  }

  /**
   * ➕ ADICIONAR VARIANTE - Adiciona nova variante ao FormArray
   */
  addVariant(): void {
    const variantGroup = this.formBuilder.group({
      variantName: [''],
      fabricType: [''],
      quantities: this.formBuilder.array([
        this.formBuilder.group({ size: 'PP', value: 0 }),
        this.formBuilder.group({ size: 'P', value: 0 }),
        this.formBuilder.group({ size: 'M', value: 0 }),
        this.formBuilder.group({ size: 'G', value: 0 }),
        this.formBuilder.group({ size: 'G1', value: 0 }),
        this.formBuilder.group({ size: 'G2', value: 0 })
      ])
    });
    this.variantsArray.push(variantGroup);
  }

  /**
   * ➖ REMOVER VARIANTE - Remove variante do FormArray
   */
  removeVariant(index: number): void {
    this.variantsArray.removeAt(index);
  }

  /**
   * 📏 OBTER VALOR DE QUANTIDADE - Retorna o valor da quantidade para um tamanho específico
   */
  getQuantityValue(variant: any, size: string): number {
    const quantities = variant.value.quantities || [];
    const quantity = quantities.find((q: any) => q.size === size);
    return quantity ? quantity.value : 0;
  }

  /**
   * 📏 ATUALIZAR VALOR DE QUANTIDADE - Atualiza o valor da quantidade para um tamanho específico
   */
  updateQuantityValue(variant: any, size: string, value: number): void {
    const quantities = variant.value.quantities || [];
    const quantityIndex = quantities.findIndex((q: any) => q.size === size);

    if (quantityIndex >= 0) {
      quantities[quantityIndex].value = value;
    } else {
      quantities.push({ size, value });
    }


    const quantitiesArray = variant.get('quantities') as FormArray;
    quantitiesArray.patchValue(quantities);
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

      const activeModal = this.modalService.activeModal();
      if (activeModal?.config.data) {
        const productionOrder = activeModal.config.data;
        await this.populateForm(productionOrder);
      }

    } catch (error) {
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * 🔍 BUSCAR DESENVOLVIMENTO - Busca desenvolvimento por referência interna
   */
  private async searchDevelopment(internalReference: string): Promise<void> {
    this.searchingDevelopment = true;
    this.developmentNotFound = false;

    try {

      const response: Development = await lastValueFrom(
        this.developmentService.getDevelopmentById(internalReference)
      );

      if (response) {

        this.developmentFound = response;


        this.initializeProductionTypeFromDevelopment(response);
        this.populateFormFromDevelopment(response);
      } else {
        this.developmentNotFound = true;
        this.developmentFound = null;
      }

    } catch (error) {
      this.developmentNotFound = true;
      this.developmentFound = null;
    } finally {
      this.searchingDevelopment = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * 📝 PREENCHER FORMULÁRIO DO DESENVOLVIMENTO - Popula campos do formulário
   */
  private populateFormFromDevelopment(development: Development): void {
    this.productionOrderForm.patchValue({
      internalReference: development.internalReference,
      fabricType: '', // Será preenchido pelo usuário
      observations: '',
      status: 'CREATED',
      hasCraft: false,
      fabricWidth: null
    });
  }

  /**
   * 🔄 RESETAR BUSCA - Limpa estado da busca de desenvolvimento
   */
  private resetDevelopmentSearch(): void {
    this.developmentFound = null;
    this.developmentNotFound = false;
    this.searchingDevelopment = false;
  }

  /**
   * 📋 POPULAR FORMULÁRIO - Preenche dados da ordem de produção para edição
   */
  private async populateForm(productionOrder: ProductionOrder): Promise<void> {

    if (productionOrder.development) {
      this.developmentFound = productionOrder.development;
      if (productionOrder.productionType.variants && productionOrder.productionType.variants.length > 0) {
        this.developmentFound.productionType = productionOrder.productionType.type;
      }
    }


    this.variantsArray.clear();


    this.productionOrderForm.patchValue({
      internalReference: productionOrder?.internalReference || '',
      productionType: {
        type: productionOrder.productionType?.type || 'rotary',
        meters: productionOrder.productionType?.meters || 0,
        fabricType: productionOrder.productionType?.fabricType || ''
      },
      fabricType: productionOrder.fabricType || '',
      observations: productionOrder.observations || '',
      status: productionOrder.status,
      hasCraft: productionOrder.hasCraft || false,
      fabricWidth: productionOrder.fabricWidth || null
    });


    if (productionOrder.productionType?.type === 'localized' && productionOrder.productionType.variants) {

      const variantsFormArray = this.productionOrderForm.get('productionType.variants') as FormArray;
      variantsFormArray.clear();

      productionOrder.productionType.variants.forEach(variant => {
        const variantGroup = this.formBuilder.group({
          variantName: [variant.variantName || ''],
          fabricType: [variant.fabricType || ''],
          quantities: this.formBuilder.array(
            variant.quantities?.map(q =>
              this.formBuilder.group({
                size: [q.size],
                value: [q.value || 0]
              })
            ) || []
          )
        });
        variantsFormArray.push(variantGroup);
      });
    }

    if (productionOrder._id) {
      if (!this.productionOrderForm.contains('_id')) {
        this.productionOrderForm.addControl('_id', this.formBuilder.control(productionOrder._id));
      } else {
        this.productionOrderForm.get('_id')?.setValue(productionOrder._id);
      }
      this.productionOrderForm.get('internalReference')?.disable()
      this.productionOrderForm.get('status')?.setValue(productionOrder.status);
    }

    if (this.productionOrderForm.get('status')?.value === 'FINALIZED') {
      this.productionOrderForm.disable();
    }
  }


  /**
   * 🔍 BUSCA DE DESENVOLVIMENTO - Evento quando usuário digita referência
   */
  onInternalReferenceChange(): void {
    const internalReference = this.productionOrderForm.get('internalReference')?.value;
    if (internalReference) {
      this.searchDevelopmentSubject.next(internalReference);
    } else {
      this.resetDevelopmentSearch();
    }
  }


  validate() {
    const productionTypeControl = this.productionOrderForm.get('productionType');
    const productionTypeValue = productionTypeControl?.value;

    if (productionTypeValue?.type === 'rotary') {

      const metersControl = productionTypeControl?.get('meters');
      if (!metersControl || metersControl.value === null || metersControl.value === undefined || metersControl.value === '') {
        metersControl?.setErrors({ required: true });
        return false;
      } else {
        metersControl.setErrors(null);
      }
    }

    if (productionTypeValue?.type === 'localized') {
      const variantsControl = productionTypeControl?.get('variants');
      if (!variantsControl || !variantsControl.value || variantsControl.value.length === 0) {
        variantsControl?.setErrors({ required: true });
        return false;
      } else {
        variantsControl.setErrors(null);
      }
    }

    return true;
  }

  /**
   * 💾 SALVAR - Cria ou atualiza ordem de produção
   */
  async onSave(): Promise<void> {
    this.validate();
    this.productionOrderForm.markAllAsTouched();

    if (this.productionOrderForm.invalid) {
      return;
    }


    if (!this.developmentFound && !this.isEditMode) {
      this.toastService.warning('Atenção', 'É necessário selecionar um desenvolvimento válido.');
      return;
    }

    this.isSaving = true;

    try {
      const formData = this.productionOrderForm.value;

      if (this.isEditMode) {

        const updateData: UpdateProductionOrderRequest = {
          observations: formData.observations,
          productionType: formData.productionType,
          status: formData.status,
          hasCraft: formData.hasCraft,
          fabricWidth: formData.fabricWidth ? parseFloat(formData.fabricWidth) : undefined
        };

        if (this.developmentFound?.productionType === 'localized') {
          delete updateData.productionType?.fabricType;
        }

        const response = await lastValueFrom(
          this.productionOrderService.updateProductionOrder(formData._id, updateData)
        );

        this.toastService.success('Ordem de produção atualizada com sucesso!', 'Sucesso');
        this.modalService.close('production-order-modal', { action: 'updated', data: response.data });

      } else {

        const createData: CreateProductionOrderRequest = {
          developmentId: this.developmentFound!._id!,
          observations: formData.observations,
          productionType: formData.productionType,
          hasCraft: formData.hasCraft,
          fabricWidth: formData.fabricWidth ? parseFloat(formData.fabricWidth) : undefined
        };

        if (this.developmentFound?.productionType === 'localized') {
          delete createData.productionType?.fabricType;
        }

        const response = await lastValueFrom(
          this.productionOrderService.createProductionOrder(createData)
        );

        this.toastService.success('Ordem de produção criada com sucesso!', 'Sucesso');
        this.modalService.close('production-order-modal', { action: 'created', data: response.data });
      }

    } catch (error: any) {


    } finally {
      this.isSaving = false;
    }
  }

  /**
   * ❌ CANCELAR - Fecha modal sem salvar
   */
  onCancel(): void {
    this.modalService.close('production-order-modal', { action: 'cancelled' });
  }


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
      return 'Valor deve ser maior que 0';
    }

    return '';
  }

  /**
   * 💰 FORMATAR MOEDA - Formata valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * 📅 FORMATAR DATA - Formata data para exibição
   */
  formatDate(date: Date | string | undefined): string {
    return DateFormatter.formatDate(date);
  }


  /**
   * 📊 CALCULAR TOTAL DE PEÇAS - Soma todos os valores dos tamanhos
   */
  getTotalPieces(): number {
    if (!this.productionOrderForm.get('productionType')?.get('variants')?.value) {
      return 0;
    }

    return this.productionOrderForm.get('productionType')?.get('variants')?.value.reduce((total: number, variant: ProductionVariant) => {
      return total + variant.quantities.reduce((variantTotal, quantity) => {
        return variantTotal + (quantity.value || 0);
      }, 0);
    }, 0);
  }

  productionType(productionType: string): string {
    return translateProductionType(productionType as ProductionTypeEnum);
  }
}
