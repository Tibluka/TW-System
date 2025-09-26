

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Development, ProductionTypeEnum } from '../../../../models/developments/developments';
import { CreateProductionOrderRequest, ProductionOrder, UpdateProductionOrderRequest } from '../../../../models/production-orders/production-orders';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { IconComponent } from "../../../../shared/components/atoms/icon/icon.component";
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';
import { DevelopmentService } from '../../../../shared/services/development/development.service';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { ProductionOrderService } from '../../../../shared/services/production-order/production-order.service';
import { FormValidator } from '../../../../shared/utils/form';

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
  private cdr = inject(ChangeDetectorRef);


  productionOrderForm!: FormGroup;
  isLoading = false;
  isSaving = false;


  searchingDevelopment = false;
  developmentFound: Development | null = null;
  developmentNotFound = false;


  statusOptions: SelectOption[] = [
    { value: 'CREATED', label: 'Criado' },
    { value: 'PILOT_PRODUCTION', label: 'Produção Piloto' },
    { value: 'PILOT_SENT', label: 'Piloto Enviado' },
    { value: 'PILOT_APPROVED', label: 'Piloto Aprovado' },
    { value: 'PRODUCTION_STARTED', label: 'Produção Iniciada' },
    { value: 'FINALIZED', label: 'Finalizado' }
  ];

  productionTypeOptions: SelectOption[] = [
    { value: 'rotary', label: 'Rotativa' },
    { value: 'localized', label: 'Localizada' }
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
        meters: [null],
        additionalInfo: this.formBuilder.group({
          variant: ['']

        })
      }),
      fabricType: ['', [Validators.required]],
      observations: [''],
      status: ['']
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

      const activeModal = this.modalService.activeModal();
      if (activeModal?.config.data) {
        const productionOrder = activeModal.config.data;
        await this.populateForm(productionOrder);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
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
        this.productionOrderForm.get('productionType')!.patchValue(response.productionType || {});
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
      if (productionOrder.productionType.additionalInfo && productionOrder.productionType.additionalInfo.sizes) {
        this.developmentFound.productionType = productionOrder.productionType;
      }
    }

    this.productionOrderForm.patchValue({
      internalReference: productionOrder?.internalReference || '',
      productionType: productionOrder.productionType || {},
      fabricType: productionOrder.fabricType || '',
      observations: productionOrder.observations || '',
      status: productionOrder.status
    });


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

      const additionalInfoControl = productionTypeControl?.get('additionalInfo');
      if (!additionalInfoControl || !additionalInfoControl.value) {
        additionalInfoControl?.setErrors({ required: true });
        return false;
      } else {
        additionalInfoControl.setErrors(null);
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
    console.log(this.productionOrderForm);

    if (this.productionOrderForm.invalid) {

      return;
    }


    if (!this.developmentFound && !this.isEditMode) {
      alert('É necessário selecionar um desenvolvimento válido.');
      return;
    }

    this.isSaving = true;

    try {
      const formData = this.productionOrderForm.value;

      if (this.isEditMode) {

        const updateData: UpdateProductionOrderRequest = {
          fabricType: formData.fabricType,
          observations: formData.observations,
          productionType: formData.productionType,
          status: formData.status
        };

        const response = await lastValueFrom(
          this.productionOrderService.updateProductionOrder(formData._id, updateData)
        );

        console.log('✅ Ordem de produção atualizada:', response);
        this.modalService.close('production-order-modal', { action: 'updated', data: response.data });

      } else {

        const createData: CreateProductionOrderRequest = {
          developmentId: this.developmentFound!._id!,
          fabricType: formData.fabricType,
          observations: formData.observations,
          productionType: this.developmentFound!.productionType
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
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }


  /**
   * 📊 CALCULAR TOTAL DE PEÇAS - Soma todos os valores dos tamanhos
   */
  getTotalPieces(): number {
    if (!this.developmentFound?.productionType?.additionalInfo?.sizes) {
      return 0;
    }

    return this.developmentFound.productionType.additionalInfo?.sizes.reduce((total, sizeItem) => {
      return total + (sizeItem.value || 0);
    }, 0);
  }

  productionType(productionType: ProductionTypeEnum): string {
    return translateProductionType(productionType);
  }
}
