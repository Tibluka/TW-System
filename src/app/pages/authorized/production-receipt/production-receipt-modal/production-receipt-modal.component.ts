// pages/authorized/production-receipts/production-receipt-modal/production-receipt-modal.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, lastValueFrom, takeUntil } from 'rxjs';

// Components
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/atoms/select/select.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';
import { IconComponent } from '../../../../shared/components/atoms/icon/icon.component';

// Services
import { ProductionReceiptService } from '../../../../shared/services/production-receipt/production-receipt.service';
import { ProductionOrderService } from '../../../../shared/services/production-order/production-order.service';
import { ModalService } from '../../../../shared/services/modal/modal.service';

// Models
import {
  ProductionReceipt,
  CreateProductionReceiptRequest,
  UpdateProductionReceiptRequest,
  PaymentMethod,
  PaymentStatus,
  ProductionReceiptFormUtils
} from '../../../../models/production-receipt/production-receipt';
import { ProductionOrder, ProductionOrderResponse, ProductionTypeEnum } from '../../../../models/production-orders/production-orders';

// Utils
import { FormValidator } from '../../../../shared/utils/form';
import { translateProductionType } from '../../../../shared/utils/tools';

@Component({
  selector: 'app-production-receipt-modal',
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
  templateUrl: './production-receipt-modal.component.html',
  styleUrl: './production-receipt-modal.component.scss'
})
export class ProductionReceiptModalComponent extends FormValidator implements OnInit, OnDestroy {

  @Input() productionReceiptId?: string;

  // ============================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ============================================
  private formBuilder = inject(FormBuilder);
  private productionReceiptService = inject(ProductionReceiptService);
  private productionOrderService = inject(ProductionOrderService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  // ============================================
  // PROPRIEDADES DO COMPONENTE
  // ============================================
  productionReceiptForm!: FormGroup;
  isLoading = false;
  submitting = false;
  productionReceipt?: ProductionReceipt;
  isEditMode = false;
  // Search e busca de ordens de produção
  searchingProductionOrder = false;
  productionOrderFound: ProductionOrder | null = null;
  productionOrderNotFound = false;

  // Search e busca de ordens de produção
  searchingOrders = false;
  productionOrders: ProductionOrder[] = [];
  selectedProductionOrder?: ProductionOrder;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ============================================
  // OPTIONS PARA SELECTS
  // ============================================
  paymentMethodOptions: SelectOption[] = [];
  paymentStatusOptions: SelectOption[] = [];
  productionOrderOptions: SelectOption[] = [];

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================
  ngOnInit(): void {
    this.setupForm();
    this.setupSelectOptions();
    this.loadInitialData();
    this.initializeProductionOrderSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        const productionReceipt = activeModal.config.data;
        this.isEditMode = true;
        this.productionOrderFound = productionReceipt.productionOrder;
        this.populateForm(productionReceipt);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private initializeProductionOrderSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(internalReference => {
        this.searchProductionOrder(internalReference);
      });
  }

  async searchProductionOrder(internalReference: string) {
    this.searchingProductionOrder = true;
    this.productionOrderFound = null;

    try {
      // Buscar desenvolvimento pela referência interna
      const response: ProductionOrderResponse = await lastValueFrom(
        this.productionOrderService.getProductionOrderById(internalReference)
      );

      if (response.data) {
        // Verificar se encontrou exatamente a referência pesquisada
        this.productionOrderFound = response.data;
        this.productionReceiptForm.patchValue({
          productionOrderId: response.data._id,
        });
      } else {
        this.productionOrderNotFound = true;
        this.productionOrderFound = null;
      }

    } catch (error) {
      this.productionOrderNotFound = true;
      this.productionOrderFound = null;
    } finally {
      this.searchingProductionOrder = false;
      this.cdr.detectChanges();
    }
  }

  // ============================================
  // SETUP INICIAL
  // ============================================
  private setupForm(): void {
    this.productionReceiptForm = this.formBuilder.group({
      // CAMPOS OBRIGATÓRIOS
      internalReference: ['', [Validators.required]],
      productionOrderId: ['', [Validators.required]],
      paymentMethod: ['PIX', [Validators.required]],
      totalAmount: [0, [Validators.required, Validators.min(0.01)]],
      dueDate: ['', [Validators.required]],
      paymentDate: [''],
      // CAMPOS OPCIONAIS
      paymentStatus: ['PENDING'],
      paidAmount: [0, [Validators.min(0)]],
      notes: ['', [Validators.maxLength(1000)]]
    });

    // Validação customizada para paidAmount
    this.productionReceiptForm.get('paidAmount')?.valueChanges.subscribe(() => {
      this.validatePaidAmount();
    });

    this.productionReceiptForm.get('totalAmount')?.valueChanges.subscribe(() => {
      this.validatePaidAmount();
    });

    // Definir data padrão de vencimento (30 dias)
    this.setDefaultDueDate();
  }

  private setupSelectOptions(): void {
    // Payment Method Options
    this.paymentMethodOptions = ProductionReceiptFormUtils.getPaymentMethodOptions().map(option => ({
      value: option.value,
      label: option.label
    }));

    // Payment Status Options
    this.paymentStatusOptions = ProductionReceiptFormUtils.getPaymentStatusOptions().map(option => ({
      value: option.value,
      label: option.label
    }));
  }

  private setDefaultDueDate(): void {
    const today = new Date();
    const dueDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dias
    const formattedDate = dueDate.toISOString().split('T')[0];
    this.productionReceiptForm.patchValue({ dueDate: formattedDate });
  }

  // ============================================
  // CARREGAMENTO DE DADOS
  // ============================================
  private async loadProductionReceipt(): Promise<void> {
    if (!this.productionReceiptId) return;

    this.isLoading = true;
    try {
      const response = await lastValueFrom(
        this.productionReceiptService.getProductionReceiptById(this.productionReceiptId)
      );

      this.productionReceipt = response.data;
      this.populateForm(this.productionReceipt);
    } catch (error) {
      console.error('Erro ao carregar recebimento:', error);
      // TODO: Toast de erro
    } finally {
      this.isLoading = false;
    }
  }


  private formatProductionOrderLabel(order: ProductionOrder): string {
    const clientName = order.development?.client?.companyName || 'Cliente não informado';
    const reference = order.internalReference || order._id;
    const productionType = order.productionType ?
      translateProductionType(order.productionType.type) : '';

    return `${reference} - ${clientName} (${productionType})`;
  }

  // ============================================
  // MANIPULAÇÃO DO FORMULÁRIO
  // ============================================
  private populateForm(productionReceipt: ProductionReceipt): void {
    // Encontrar e selecionar a ordem de produção
    if (productionReceipt.productionOrder) {
      this.selectedProductionOrder = productionReceipt.productionOrder;
    }

    // Preencher formulário
    this.productionReceiptForm.patchValue({
      internalReference: productionReceipt.internalReference,
      productionOrderId: productionReceipt.productionOrder?._id,
      paymentMethod: productionReceipt.paymentMethod,
      paymentStatus: productionReceipt.paymentStatus,
      paymentDate: productionReceipt.paymentDate,
      totalAmount: productionReceipt.totalAmount,
      paidAmount: productionReceipt.paidAmount,
      dueDate: this.formatDateForInput(productionReceipt.dueDate),
      notes: productionReceipt.notes || ''
    });

    if (productionReceipt._id) {
      if (!this.productionReceiptForm.contains('_id')) {
        this.productionReceiptForm.addControl('_id', this.formBuilder.control(productionReceipt._id));
      } else {
        this.productionReceiptForm.get('_id')?.setValue(productionReceipt._id);
      }

      this.productionReceiptForm.get('internalReference')?.disable();
    }

    if (this.productionReceiptForm.get('status')?.value === 'FINALIZED') {
      this.productionReceiptForm.disable();
    }
  }

  private formatDateForInput(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private validatePaidAmount(): void {
    const totalAmount = this.productionReceiptForm.get('totalAmount')?.value || 0;
    const paidAmount = this.productionReceiptForm.get('paidAmount')?.value || 0;

    if (paidAmount > totalAmount) {
      this.productionReceiptForm.get('paidAmount')?.setErrors({
        exceedsTotal: true
      });
    }
  }

  // ============================================
  // EVENTOS DA UI
  // ============================================
  onProductionOrderSearch(): void {
    this.searchSubject.next(this.productionReceiptForm.value.internalReference);
  }

  onProductionOrderSelected(orderId: string): void {
    const selectedOrder = this.productionOrders.find(order => order._id === orderId);
    if (selectedOrder) {
      this.selectedProductionOrder = selectedOrder;
      this.calculateDefaultAmount();
    }
  }

  private calculateDefaultAmount(): void {
    if (!this.selectedProductionOrder?.development?.client) return;

    const client = this.selectedProductionOrder.development.client;
    const productionType = this.selectedProductionOrder.productionType;

    let calculatedAmount = 0;

    if (productionType.type === 'rotary' && productionType.meters) {
      calculatedAmount = productionType.meters * (client.values?.valuePerMeter || 0);
    } else if (productionType.type === 'localized' && productionType.additionalInfo?.sizes) {
      const totalPieces = productionType.additionalInfo.sizes.reduce(
        (sum, size) => sum + size.value, 0
      );
      calculatedAmount = totalPieces * (client.values?.valuePerPiece || 0);
    }

    if (calculatedAmount > 0) {
      this.productionReceiptForm.patchValue({
        totalAmount: calculatedAmount
      });
    }
  }

  // ============================================
  // SUBMIT E AÇÕES
  // ============================================
  async onSubmit(): Promise<void> {
    this.productionReceiptForm.markAllAsTouched();

    if (this.productionReceiptForm.invalid || this.submitting) {
      //this.markFormGroupTouched(this.productionReceiptForm);
      return;
    }

    this.submitting = true;

    try {
      const formData = this.prepareFormData();

      if (this.isEditMode) {
        console.log(this.productionReceiptForm);

        await this.updateProductionReceipt({ ...formData, _id: this.productionReceiptForm.value?._id || '' });
      } else {
        await this.createProductionReceipt(formData as CreateProductionReceiptRequest);
      }

      this.modalService.close('production-receipt-modal', {
        action: 'saved',
        data: formData
      });

    } catch (error) {
      console.error('Erro ao salvar recebimento:', error);
      // TODO: Toast de erro
    } finally {
      this.submitting = false;
    }
  }

  private prepareFormData(): CreateProductionReceiptRequest | UpdateProductionReceiptRequest {
    const formValue = this.productionReceiptForm.value;

    return {
      _id: this.productionReceipt?._id || '',
      productionOrderId: formValue.productionOrderId,
      paymentMethod: formValue.paymentMethod as PaymentMethod,
      totalAmount: parseFloat(formValue.totalAmount),
      dueDate: formValue.dueDate,
      paymentStatus: formValue.paymentStatus as PaymentStatus,
      paidAmount: parseFloat(formValue.paidAmount) || 0,
      notes: formValue.notes?.trim() || undefined
    };
  }

  private async createProductionReceipt(data: CreateProductionReceiptRequest): Promise<void> {
    const response = await lastValueFrom(
      this.productionReceiptService.createProductionReceipt(data)
    );

    this.modalService.close('production-receipt-modal', {
      action: 'created',
      data: response.data
    });
  }

  private async updateProductionReceipt(data: UpdateProductionReceiptRequest): Promise<void> {
    const response = await lastValueFrom(
      this.productionReceiptService.updateProductionReceipt(data._id!, data)
    );

    this.modalService.close('updated', {
      action: 'updated',
      data: response.data
    });
  }

  onCancel(): void {
    this.modalService.close('production-receipt-modal');
  }


  get modalTitle(): string {
    return this.isEditMode ? 'Editar Recebimento' : 'Novo Recebimento';
  }

  get submitButtonText(): string {
    return this.submitting ?
      (this.isEditMode ? 'Salvando...' : 'Criando...') :
      (this.isEditMode ? 'Salvar Alterações' : 'Criar Recibo');
  }

  get selectedProductionOrderInfo(): string {
    if (!this.selectedProductionOrder) return '';

    const client = this.selectedProductionOrder.development?.client?.companyName || 'Cliente não informado';
    const type = this.selectedProductionOrder.productionType ?
      translateProductionType(this.selectedProductionOrder.productionType.type) : '';

    return `${client} - ${type}`;
  }

  // ============================================
  // VALIDAÇÃO E ERROS
  // ============================================
  getFieldError(fieldName: string): string {
    return this.getErrorMessage(this.productionReceiptForm, fieldName);
  }


  // Métodos herdados de FormValidator
  protected getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return 'Este campo é obrigatório';
    }

    if (errors['min']) {
      return `Valor mínimo: ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `Valor máximo: ${errors['max'].max}`;
    }

    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['email']) {
      return 'E-mail inválido';
    }

    if (errors['pattern']) {
      return 'Formato inválido';
    }

    if (errors['exceedsTotal']) {
      return 'Valor pago não pode ser maior que o valor total';
    }

    // Erro genérico
    return 'Campo inválido';
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.isFormControlInvalid(this.productionReceiptForm.get(fieldName));
  }

  // ============================================
  // MÉTODOS UTILITÁRIOS PARA TEMPLATE
  // ============================================

  formatCurrency(value: number): string {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getRemainingAmount(): number {
    const totalAmount = this.productionReceiptForm.get('totalAmount')?.value || 0;
    const paidAmount = this.productionReceiptForm.get('paidAmount')?.value || 0;
    return Math.max(0, totalAmount - paidAmount);
  }

  getDaysUntilDue(): number {
    const dueDate = this.productionReceiptForm.get('dueDate')?.value;
    if (!dueDate) return 0;

    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  translateProductionType(type: string | undefined): string {
    return translateProductionType(type as ProductionTypeEnum);
  }
}