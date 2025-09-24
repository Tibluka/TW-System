// pages/authorized/production-sheets/production-sheet-modal/production-sheet-modal.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';

// Services
import { ProductionSheetsService, ProductionSheet, CreateProductionSheetRequest, UpdateProductionSheetRequest } from '../../../../shared/services/production-sheets/production-sheets.service';
import { ProductionOrderService } from '../../../../shared/services/production-order/production-order.service';
import { ModalService } from '../../../../shared/services/modal/modal.service';

// Components
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/atoms/select/select.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';
import { IconComponent } from '../../../../shared/components/atoms/icon/icon.component';

// Utils
import { FormValidator } from '../../../../shared/utils/form';

// Models
import { ProductionOrder, ProductionTypeEnum } from '../../../../models/production-orders/production-orders';
import { translateProductionType } from '../../../../shared/utils/tools';

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
    FormsModule
  ],
  providers: [
    NgModel
  ],
  templateUrl: './production-sheet-modal.component.html',
  styleUrl: './production-sheet-modal.component.scss'
})
export class ProductionSheetModalComponent extends FormValidator implements OnInit, OnDestroy {

  @Input() productionSheetId?: string;

  // ============================================
  // INJEÇÕES DE DEPENDÊNCIA
  // ============================================
  private formBuilder = inject(FormBuilder);
  private productionSheetsService = inject(ProductionSheetsService);
  private productionOrderService = inject(ProductionOrderService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  // ============================================
  // PROPRIEDADES DO COMPONENTE
  // ============================================
  productionSheetForm!: FormGroup;

  // Estados
  isLoading = false;
  isSaving = false;
  isEditMode = false;

  // Dados
  currentProductionSheet: ProductionSheet | null = null;

  // Estados da busca de ordem de produção
  productionOrderFound: ProductionOrder | null = null;
  productionOrderNotFound = false;
  searchingProductionOrder = false;

  // Opções para selects
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

  // Alertas e avisos
  machineConflictWarning: string = '';

  // Subject para controlar subscriptions
  private searchProductionOrderSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ============================================
  // CICLO DE VIDA
  // ============================================

  constructor() {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.initializeForm();
    this.initializeProductionOrderSearch();
    this.setupFormSubscriptions();
    await this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // GETTERS PARA O TEMPLATE
  // ============================================

  get saveButtonLabel(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  /**
   * 📝 INICIALIZAR FORM - Cria formulário reativo
   */
  private initializeForm(): void {
    // Campos básicos sempre presentes
    const formConfig: any = {
      internalReference: ['', [Validators.required, Validators.minLength(3)]],
      machine: ['', [Validators.required]],
      entryDate: [this.getTodayDateString()],
      expectedExitDate: ['', [Validators.required]],
      productionNotes: ['', [Validators.maxLength(1000)]]
    };

    // Adicionar campo stage apenas se for modo edição
    if (this.isEditMode) {
      formConfig.stage = ['PRINTING'];
    }

    this.productionSheetForm = this.formBuilder.group(formConfig);

    console.log('📝 Formulário da ficha de produção inicializado');
  }

  /**
   * 📊 CARREGAR DADOS INICIAIS - Carrega ficha de produção (se edição)
   */
  private async loadInitialData(): Promise<void> {
    this.isLoading = true;

    try {
      // Acessar dados do modal ativo
      const activeModal = this.modalService.activeModal();
      if (activeModal?.config.data) {
        const productionSheet = activeModal.config.data;

        // ✅ Definir modo de edição e dados atuais
        this.isEditMode = true;
        this.productionSheetId = productionSheet._id;
        this.currentProductionSheet = productionSheet;

        // ✅ Popular formulário
        this.populateForm(productionSheet);

        // ✅ Desabilitar campo de referência interna no modo edição
        this.productionSheetForm.get('internalReference')?.disable();

        // ✅ Definir ordem de produção encontrada
        if (productionSheet.productionOrder) {
          this.productionOrderFound = productionSheet.productionOrder;
        }

      } else if (this.productionSheetId) {
        // Fallback: Se não há dados no modal, mas há ID, buscar pelos dados
        await this.loadProductionSheetData();
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * 📋 POPULAR FORMULÁRIO - Preenche dados da ficha de produção para edição
   */
  private populateForm(productionSheet: ProductionSheet): void {
    // Buscar a referência interna da ordem de produção
    const internalReference = productionSheet.productionOrder?.internalReference ||
      productionSheet.internalReference || '';

    this.productionSheetForm.patchValue({
      internalReference: internalReference,
      machine: productionSheet.machine,
      entryDate: this.formatDateForInput(productionSheet.entryDate),
      expectedExitDate: this.formatDateForInput(productionSheet.expectedExitDate),
      productionNotes: productionSheet.productionNotes || ''
    });

    // ✅ Definir ordem de produção encontrada ANTES de configurar stage
    if (productionSheet.productionOrder) {
      this.productionOrderFound = productionSheet.productionOrder;
    }
    // ✅ Se existir _id na productionSheet, adicionar o form control _id se não existir
    if (productionSheet._id) {
      this.productionSheetForm.addControl('stage', this.formBuilder.control(productionSheet.stage));

      if (!this.productionSheetForm.contains('_id')) {
        this.productionSheetForm.addControl('_id', this.formBuilder.control(productionSheet._id));
      } else {
        this.productionSheetForm.get('_id')?.setValue(productionSheet._id);
      }
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
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ficha de produção:', error);
    }
  }

  private setupFormSubscriptions(): void {
    // Monitorar mudanças na referência interna para buscar ordem de produção
    this.productionSheetForm.get('internalReference')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(internalReference => {
        if (internalReference) {
          this.searchProductionOrderSubject.next(internalReference);
        } else {
          this.resetProductionOrderSearch();
        }
      });
  }

  // ============================================
  // MÉTODOS DE BUSCA DE ORDEM DE PRODUÇÃO
  // ============================================

  private initializeProductionOrderSearch(): void {
    this.searchProductionOrderSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(internalReference => {
        if (internalReference && internalReference.length >= 3) {
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
      // Buscar ordem de produção pela referência interna
      const response = await lastValueFrom(
        this.productionOrderService.getProductionOrderById(internalReference)
      );

      if (response && response.data) {
        // Verificar se encontrou exatamente a referência pesquisada
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
      console.error('Erro ao buscar ordem de produção:', error);
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

  // ============================================
  // EVENTOS DO FORMULÁRIO
  // ============================================

  async onSubmit(): Promise<void> {
    this.productionSheetForm.markAllAsTouched();

    if (this.productionSheetForm.invalid) {
      console.log('Formulário inválido:', this.productionSheetForm.errors);
      return;
    }

    // Verificar se foi encontrada uma ordem de produção válida
    if (!this.productionOrderFound) {
      console.log('Ordem de produção não encontrada');
      // TODO: Exibir toast de erro
      return;
    }

    this.isSaving = true;

    try {
      const formData = this.productionSheetForm.value;

      if (this.isEditMode && this.productionSheetId) {
        // Atualizar ficha existente
        const updateData: UpdateProductionSheetRequest = {
          machine: formData.machine,
          entryDate: formData.entryDate,
          expectedExitDate: formData.expectedExitDate,
          stage: formData.stage,
          productionNotes: formData.productionNotes || undefined
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
        // Criar nova ficha - usar o ID da ordem encontrada
        const createData: CreateProductionSheetRequest = {
          productionOrderId: this.productionOrderFound._id!,
          machine: formData.machine,
          expectedExitDate: formData.expectedExitDate,
          entryDate: formData.entryDate || undefined,
          productionNotes: formData.productionNotes || undefined
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
      console.error('Erro ao salvar ficha:', error);

      // TODO: Exibir toast de erro
      let errorMessage = 'Erro inesperado ao salvar ficha de produção.';

      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.error('Mensagem de erro:', errorMessage);
    } finally {
      this.isSaving = false;
    }
  }

  onCancel(): void {
    this.closeModal('cancelled');
  }

  async onAdvanceStage(event: Event): Promise<void> {
    // PREVENIR O SUBMIT DO FORM
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
      console.error('Erro ao avançar estágio:', error);
      // TODO: Exibir toast de erro
    } finally {
      this.isSaving = false;
    }
  }

  // ============================================
  // MÉTODOS UTILITÁRIOS
  // ============================================

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

  // ============================================
  // VALIDAÇÃO DE CAMPOS
  // ============================================

  getFieldError(fieldName: string): string {
    const field = this.productionSheetForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    // Mensagens de erro específicas por campo
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

    // Buscar mensagem específica ou usar mensagem genérica
    const fieldErrors = errorMessages[fieldName] || {};
    const firstErrorKey = Object.keys(errors)[0];

    return fieldErrors[firstErrorKey] || `Campo ${fieldName} inválido`;
  }

  productionType(productionType: ProductionTypeEnum) {
    return translateProductionType(productionType);
  }
}