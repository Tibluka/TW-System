

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';


import { ProductionSheetsService, ProductionSheet, CreateProductionSheetRequest, UpdateProductionSheetRequest } from '../../../../shared/services/production-sheets/production-sheets.service';
import { ProductionOrderService } from '../../../../shared/services/production-order/production-order.service';
import { ModalService } from '../../../../shared/services/modal/modal.service';


import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/atoms/select/select.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';
import { IconComponent } from '../../../../shared/components/atoms/icon/icon.component';


import { FormValidator } from '../../../../shared/utils/form';


import { ProductionOrder, ProductionOrderStatus, ProductionTypeEnum } from '../../../../models/production-orders/production-orders';
import { translateProductionOrderStatus, translateProductionType } from '../../../../shared/utils/tools';
import { PrintButtonComponent } from "../../../../shared/components/atoms/print-button/print-button.component";
import { PrintOptions } from '../../../../shared/components/print/print.service';

@Component({
  selector: 'app-production-sheet-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    SpinnerComponent,
    IconComponent,
    FormsModule,
    PrintButtonComponent
  ],
  providers: [
    NgModel
  ],
  templateUrl: './production-sheet-modal.component.html',
  styleUrl: './production-sheet-modal.component.scss'
})
export class ProductionSheetModalComponent extends FormValidator implements OnInit, OnDestroy {

  @Input() productionSheetId?: string;


  private formBuilder = inject(FormBuilder);
  private productionSheetsService = inject(ProductionSheetsService);
  private productionOrderService = inject(ProductionOrderService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  printOptions: PrintOptions = {
    title: 'Ficha de Produção',
    hideElements: ['.modal-actions', 'ds-button', '.no-print']
  };

  productionSheetForm!: FormGroup;


  isLoading = false;
  isSaving = false;
  isEditMode = false;


  currentProductionSheet: ProductionSheet | null = null;


  productionOrderFound: ProductionOrder | null = null;
  productionOrderNotFound = false;
  searchingProductionOrder = false;


  machineOptions: SelectOption[] = [
    { value: 1, label: 'Máquina 1' },
    { value: 2, label: 'Máquina 2' },
    { value: 3, label: 'Máquina 3' },
    { value: 4, label: 'Máquina 4' }
  ];

  stageOptions: SelectOption[] = [
    { value: 'PRINTING', label: 'Impressão' },
    { value: 'CALENDERING', label: 'Calandra' },
    { value: 'FINISHED', label: 'Finalizado' }
  ];


  machineConflictWarning: string = '';


  private destroy$ = new Subject<void>();


  constructor() {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.initializeForm();
    await this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get saveButtonLabel(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }


  /**
   * 📝 INICIALIZAR FORM - Cria formulário reativo
   */
  private initializeForm(): void {

    const formConfig: any = {
      internalReference: ['', [Validators.required, Validators.minLength(3)]],
      machine: ['', [Validators.required]],
      entryDate: [this.getTodayDateString()],
      expectedExitDate: ['', [Validators.required]],
      productionNotes: ['', [Validators.maxLength(1000)]],
      temperature: ['', [Validators.min(0), Validators.max(500)]],
      velocity: ['', [Validators.min(0), Validators.max(1000)]]
    };

    this.productionSheetForm = this.formBuilder.group(formConfig);

  }

  /**
   * 📊 CARREGAR DADOS INICIAIS - Carrega ficha de produção (se edição)
   */
  private async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {

      const activeModal = this.modalService.activeModal();
      if (activeModal?.config.data) {
        const productionSheet = activeModal.config.data;


        this.isEditMode = true;
        this.productionSheetId = productionSheet._id;
        this.currentProductionSheet = productionSheet;


        this.populateForm(productionSheet);


        this.addStageControlForEditMode();


        this.productionSheetForm.get('internalReference')?.disable();


        if (productionSheet.productionOrder) {
          this.productionOrderFound = productionSheet.productionOrder;
        }

      } else {
        this.initializeProductionOrderSearch();
      }

    } catch (error) {
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * 🔧 ADICIONAR CONTROLE STAGE - Adiciona campo stage após popular form
   */
  private addStageControlForEditMode(): void {
    if (this.isEditMode && !this.productionSheetForm.contains('stage')) {
      this.productionSheetForm.addControl('stage', this.formBuilder.control('PRINTING'));
    }
  }

  /**
   * 📋 POPULAR FORMULÁRIO - Preenche dados da ficha de produção para edição
   */
  private populateForm(productionSheet: ProductionSheet): void {

    const internalReference = productionSheet.productionOrder?.internalReference ||
      productionSheet.internalReference || '';

    this.productionSheetForm.patchValue({
      internalReference: internalReference,
      machine: productionSheet.machine,
      entryDate: this.formatDateForInput(productionSheet.entryDate),
      expectedExitDate: this.formatDateForInput(productionSheet.expectedExitDate),
      productionNotes: productionSheet.productionNotes || '',
      stage: productionSheet.stage,
      temperature: productionSheet.temperature || '',
      velocity: productionSheet.velocity || ''
    });


    if (productionSheet.productionOrder) {
      this.productionOrderFound = productionSheet.productionOrder;
    }


    if (this.isEditMode && productionSheet.stage) {

      setTimeout(() => {
        this.productionSheetForm.get('stage')?.setValue(productionSheet.stage);
      });
    }


    if (productionSheet._id) {
      if (!this.productionSheetForm.contains('_id')) {
        this.productionSheetForm.addControl('_id', this.formBuilder.control(productionSheet._id));
      } else {
        this.productionSheetForm.get('_id')?.setValue(productionSheet._id);
      }
      this.productionSheetForm.get('internalReference')?.disable()
    }

  }

  /**
   * 📋 CARREGAR FICHA PRODUÇÃO - Carrega dados da ficha para edição (FALLBACK)
   */
  private async loadProductionSheetData(): Promise<void> {
    if (!this.productionSheetId) return;

    try {
      const productionSheet = await lastValueFrom(
        this.productionSheetsService.getProductionSheetById(this.productionSheetId)
      );

      if (productionSheet) {
        this.isEditMode = true;
        this.populateForm(productionSheet.data);
        this.addStageControlForEditMode();
      }
    } catch (error) {
    }
  }


  private initializeProductionOrderSearch(): void {
    this.productionSheetForm.get('internalReference')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(internalReference => {
        if (internalReference) {
          this.searchProductionOrder(internalReference);
        } else {
          this.resetProductionOrderSearch();
        }
      });
  }

  private async searchProductionOrder(internalReference: string): Promise<void> {
    this.searchingProductionOrder = true;
    this.productionOrderNotFound = false;

    try {

      const response = await lastValueFrom(
        this.productionOrderService.getProductionOrderById(internalReference)
      );

      if (response && response.data) {

        const foundOrder = response.data;
        if (foundOrder.internalReference?.toLowerCase() === internalReference.toLowerCase()) {
          this.productionOrderFound = foundOrder;
          this.productionOrderNotFound = false;
        } else {
          this.productionOrderNotFound = true;
          this.productionOrderFound = null;
        }
      } else {
        this.productionOrderNotFound = true;
        this.productionOrderFound = null;
      }

    } catch (error) {
      this.productionOrderNotFound = true;
      this.productionOrderFound = null;
    } finally {
      this.searchingProductionOrder = false;
    }
  }

  private resetProductionOrderSearch(): void {
    this.productionOrderFound = null;
    this.productionOrderNotFound = false;
    this.searchingProductionOrder = false;
  }


  async onSubmit(): Promise<void> {
    this.productionSheetForm.markAllAsTouched();

    if (this.productionSheetForm.invalid) {
      return;
    }


    if (!this.productionOrderFound) {

      return;
    }

    this.isSaving = true;

    try {
      const formData = this.productionSheetForm.value;

      if (this.isEditMode && this.productionSheetId) {
        debugger
        const updateData: UpdateProductionSheetRequest = {
          machine: formData.machine,
          entryDate: formData.entryDate,
          expectedExitDate: formData.expectedExitDate,
          stage: formData.stage,
          productionNotes: formData.productionNotes || undefined,
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          velocity: formData.velocity ? parseFloat(formData.velocity) : undefined
        };

        const response = await lastValueFrom(
          this.productionSheetsService.updateProductionSheet(this.productionSheetId, updateData)
        );

        if (response?.success) {
          this.closeModal('updated', response.data);
        } else {
          throw new Error(response?.message || 'Erro ao atualizar ficha');
        }
      } else {

        const createData: CreateProductionSheetRequest = {
          productionOrderId: this.productionOrderFound._id!,
          machine: formData.machine,
          expectedExitDate: formData.expectedExitDate,
          entryDate: formData.entryDate || undefined,
          productionNotes: formData.productionNotes || undefined,
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          velocity: formData.velocity ? parseFloat(formData.velocity) : undefined
        };

        const response = await lastValueFrom(
          this.productionSheetsService.createProductionSheet(createData)
        );

        if (response?.success) {
          this.closeModal('created', response.data);
        } else {
          throw new Error(response?.message || 'Erro ao criar ficha');
        }
      }
    } catch (error: any) {


      let errorMessage = 'Erro inesperado ao salvar ficha de produção.';

      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(error.message)

    } finally {
      this.isSaving = false;
    }
  }

  onCancel(): void {
    this.closeModal('cancelled');
  }

  async onAdvanceStage(event: Event): Promise<void> {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.productionSheetId || !this.canAdvanceStage()) {
      return;
    }

    this.isSaving = true;

    try {
      const currentStage = this.productionSheetForm.value.stage;

      const stageList = Object.keys({
        'PRINTING': currentStage === 'PRINTING',
        'CALENDERING': currentStage === 'CALENDERING',
        'FINISHED': currentStage === 'FINISHED'
      });
      const nextStageIndex = stageList.findIndex(s => s === currentStage) + 1;
      if (nextStageIndex >= stageList.length) {
        alert('Já está no ultimo status');
        return;
      }
      await lastValueFrom(
        this.productionSheetsService.advanceStage(this.productionSheetId, stageList[nextStageIndex]!)
      );
      this.modalService.close('production-sheet-modal', { action: 'stage-updated' });

    } catch (error: any) {

    } finally {
      this.isSaving = false;
    }
  }


  canAdvanceStage(): boolean {
    if (!this.isEditMode || !this.currentProductionSheet) {
      return false;
    }

    const currentStage = this.productionSheetForm.get('stage')?.value;
    return currentStage !== 'FINISHED';
  }

  getProductionOrderStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'Criado',
      'PILOT_PRODUCTION': 'Produção Piloto',
      'PILOT_SENT': 'Piloto Enviado',
      'PILOT_APPROVED': 'Piloto Aprovado',
      'PRODUCTION_STARTED': 'Produção Iniciada',
      'FINALIZED': 'Finalizado'
    };
    return statusMap[status] || status;
  }

  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private formatDateForInput(date: Date | string): string {
    if (!date) return '';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  private closeModal(action: string, data?: any): void {
    this.modalService.close('production-sheet-modal', {
      action,
      data
    });
  }


  getFieldError(fieldName: string): string {
    const field = this.productionSheetForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;


    const errorMessages: { [key: string]: { [key: string]: string } } = {
      internalReference: {
        required: 'Digite a referência interna da ordem de produção',
        minlength: 'Digite pelo menos 3 caracteres'
      },
      machine: {
        required: 'Selecione a máquina'
      },
      expectedExitDate: {
        required: 'Data de saída prevista é obrigatória'
      },
      productionNotes: {
        maxlength: 'Observações devem ter no máximo 1000 caracteres'
      }
    };


    const fieldErrors = errorMessages[fieldName] || {};
    const firstErrorKey = Object.keys(errors)[0];

    return fieldErrors[firstErrorKey] || `Campo ${fieldName} inválido`;
  }

  productionType(productionType: ProductionTypeEnum) {
    return translateProductionType(productionType);
  }

  productionOrderStatus(status: ProductionOrderStatus): string {
    return translateProductionOrderStatus(status);
  }
}
