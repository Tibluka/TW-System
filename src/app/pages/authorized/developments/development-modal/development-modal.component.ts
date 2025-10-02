import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Client } from '../../../../models/clients/clients';
import { CreateDevelopmentRequest, Development, PieceImage, UpdateDevelopmentRequest } from '../../../../models/developments/developments';
import { ProductionType, ProductionVariant, QuantityItem, SIZE_OPTIONS } from '../../../../models/production-type';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SelectComponent } from '../../../../shared/components/atoms/select/select.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';
import { FileUploadComponent, UploadedFile } from '../../../../shared/components/organisms/file-upload/file-upload.component';
import { ClientService } from '../../../../shared/services/clients/clients.service';
import { DevelopmentService } from '../../../../shared/services/development/development.service';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { FormValidator } from '../../../../shared/utils/form';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-development-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    SpinnerComponent,
    FileUploadComponent
  ],
  templateUrl: './development-modal.component.html',
  styleUrl: './development-modal.component.scss'
})
export class DevelopmentModalComponent extends FormValidator implements OnInit {

  @Input() developmentId?: string;

  private modalService = inject(ModalService);
  private formBuilder = inject(FormBuilder);
  private developmentService = inject(DevelopmentService);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  isSaving = false;

  // Propriedades para gerenciar variantes
  variants: ProductionVariant[] = [];
  sizeOptions: SelectOption[] = [...SIZE_OPTIONS];


  developmentForm: FormGroup = new FormGroup({});


  clientOptions: SelectOption[] = [];
  productionTypeOptions: SelectOption[] = [
    { value: 'rotary', label: 'Rotativo' },
    { value: 'localized', label: 'Localizado' }
  ];

  statusOptions: SelectOption[] = [
    { value: 'CREATED', label: 'Criado' },
    { value: 'AWAITING_APPROVAL', label: 'Aguardando Aprovação' },
    { value: 'APPROVED', label: 'Aprovado' },
    { value: 'CANCELED', label: 'Cancelado' }
  ];


  uploadedFiles: UploadedFile[] = [];
  existingFile: PieceImage | undefined = undefined;


  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }


  get isEditMode(): boolean {
    return !!this.developmentForm.value._id;
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }


  /**
   * 📝 INICIALIZAR FORM - Cria formulário reativo
   */
  private initializeForm(): void {
    this.developmentForm = this.formBuilder.group({
      clientId: ['', [Validators.required]],
      description: [''],
      productionType: ['', [Validators.required]],
      clientReference: ['']
    });

  }
  /**
   * 📊 CARREGAR DADOS INICIAIS - Carrega clientes e desenvolvimento (se edição)
   */
  private async loadInitialData(): Promise<void> {
    this.isLoading = true;

    try {

      await this.loadClients();


      const activeModal = this.modalService.activeModal();
      if (activeModal?.config.data) {
        const development = activeModal.config.data;
        this.populateForm(development);
      } else if (this.developmentId) {

        await this.loadDevelopmentData();
      }

    } catch (error) {
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * 👥 CARREGAR CLIENTES - Busca lista de clientes para o select
   */
  private async loadClients(): Promise<void> {
    try {
      const response = await lastValueFrom(this.clientService.getClients({
        page: 1,
        limit: 100,
        active: true
      }));

      if (response?.data) {
        this.clientOptions = response.data.map((client: Client) => ({
          value: client._id!,
          label: client.companyName || 'Cliente sem nome'
        }));

      }
    } catch (error) {
    }
  }

  /**
 * 📋 POPULAR FORMULÁRIO - Preenche dados do desenvolvimento para edição
 */
  private populateForm(development: Development): void {
    let variants: ProductionVariant[] = [];

    this.variants = variants;

    if (development.pieceImage?.url) {
      this.existingFile = development.pieceImage;
    }

    this.developmentForm.patchValue({
      clientId: development.client?._id || development.clientId,
      description: development.description || '',
      productionType: development.productionType,
      clientReference: development.clientReference || ''
    });


    if (development._id) {
      if (!this.developmentForm.contains('_id')) {
        this.developmentForm.addControl('_id', this.formBuilder.control(development._id));
        this.developmentForm.addControl('status', this.formBuilder.control(development.status));
      } else {
        this.developmentForm.get('status')?.setValue(development.status);
        this.developmentForm.get('_id')?.setValue(development._id);
      }
    }

  }

  /**
   * 📋 CARREGAR DESENVOLVIMENTO - Carrega dados do desenvolvimento para edição (FALLBACK)
   */
  private async loadDevelopmentData(): Promise<void> {
    if (!this.developmentId) return;

    try {
      const development = await lastValueFrom(this.developmentService.getDevelopmentById(this.developmentId));

      if (development) {
        this.populateForm(development);
      }
    } catch (error) {
    }
  }


  /**
   * 📁 ARQUIVOS ALTERADOS - Callback quando arquivos são alterados
   */
  onImageChanged(files: UploadedFile[]): void {
    this.uploadedFiles = files;
  }

  /**
   * ➕ ARQUIVO ADICIONADO - Callback quando arquivo é adicionado
   */
  onImageAdded(file: UploadedFile): void {
  }

  /**
   * 🗑️ ARQUIVO REMOVIDO - Callback quando arquivo é removido
   */
  onImageRemoved(file: UploadedFile): void {
  }

  /**
   * ❌ ERRO UPLOAD - Callback para erros de upload
   */
  onUploadError(error: string): void {
  }


  /**
   * ❌ CANCELAR - Fecha modal sem salvar
   */
  onCancel(): void {
    this.modalService.close('development-modal', { success: false });
  }

  /**
   * 🎯 MÉTODOS PARA GERENCIAR VARIANTES
   */

  /**
   * ➕ ADICIONAR VARIANTE - Adiciona nova variante para produção localizada
   */
  addVariant(): void {
    const newVariant: ProductionVariant = {
      variantName: '',
      fabricType: '',
      quantities: [{ size: '', value: 0 }]
    };
    this.variants.push(newVariant);
    this.updateVariantsInForm();

    // Garantir que meters seja 0 para localized
    if (this.getProductionType() === 'localized') {
      this.developmentForm.get('productionType.meters')?.setValue(0);
    }
  }

  /**
   * ➖ REMOVER VARIANTE - Remove variante específica
   */
  removeVariant(index: number): void {
    if (this.variants.length > 1) {
      this.variants.splice(index, 1);
      this.updateVariantsInForm();
    }
  }

  /**
   * ➕ ADICIONAR QUANTIDADE - Adiciona nova quantidade para uma variante
   */
  addQuantity(variantIndex: number): void {
    this.variants[variantIndex].quantities.push({ size: '', value: 0 });
    this.updateVariantsInForm();
  }

  /**
   * ➖ REMOVER QUANTIDADE - Remove quantidade específica
   */
  removeQuantity(variantIndex: number, quantityIndex: number): void {
    if (this.variants[variantIndex].quantities.length > 1) {
      this.variants[variantIndex].quantities.splice(quantityIndex, 1);
      this.updateVariantsInForm();
    }
  }

  /**
   * 🔄 ATUALIZAR VARIANTES NO FORM - Sincroniza variantes com o formulário
   */
  private updateVariantsInForm(): void {
    this.developmentForm.get('productionType.variants')?.setValue(this.variants);
  }

  /**
   * 🎯 OBTER TIPO DE PRODUÇÃO - Retorna o tipo de produção selecionado
   */
  getProductionType(): string {
    return this.developmentForm.get('productionType.type')?.value || '';
  }

  /**
   * 🎯 OBTER METROS - Retorna os metros para produção rotativa
   */
  getMeters(): number {
    return this.developmentForm.get('productionType.meters')?.value || 0;
  }

  /**
   * 🎯 OBTER TIPO DE TECIDO - Retorna o tipo de tecido para produção rotativa
   */
  getFabricType(): string {
    return this.developmentForm.get('productionType.fabricType')?.value || '';
  }


  /**
   * 💾 SUBMIT - Processa envio do formulário (ATUALIZADO)
   */
  async onSubmit(): Promise<void> {
    if (this.developmentForm.invalid || this.isSaving) return;

    this.isSaving = true;

    try {
      const formData = this.developmentForm.value;

      let result: any;

      if (this.isEditMode && this.developmentForm.value._id) {
        const updateData: UpdateDevelopmentRequest = {
          clientId: formData.clientId,
          description: formData.description,
          clientReference: formData.clientReference,
          productionType: formData.productionType,
          status: formData.status
        };

        result = await lastValueFrom(this.developmentService.updateDevelopment(this.developmentForm.value._id, updateData));

        if (this.uploadedFiles.length > 0 && result._id) {
          await this.uploadImageToDevelopment(result._id);
        }

        this.modalService.close('development-modal', {
          action: 'updated',
          data: result
        });

      } else {
        const createData: CreateDevelopmentRequest = {
          clientId: formData.clientId,
          description: formData.description,
          clientReference: formData.clientReference,
          productionType: formData.productionType
        };

        result = await lastValueFrom(this.developmentService.createDevelopment(createData));

        if (this.uploadedFiles.length > 0 && result._id) {
          await this.uploadImageToDevelopment(result._id);
        }

        this.modalService.close('development-modal', {
          action: 'created',
          data: result
        });
      }

    } catch (error: any) {
      alert(error.message || 'Erro ao salvar desenvolvimento. Tente novamente.');
    } finally {
      this.isSaving = false;
    }
  }


  /**
   * 📷 UPLOAD IMAGEM PARA DESENVOLVIMENTO - Faz upload da imagem para o desenvolvimento
   */
  private async uploadImageToDevelopment(developmentId: string): Promise<void> {
    if (this.uploadedFiles.length === 0) return;

    try {

      const formData = new FormData();
      formData.append('image', this.uploadedFiles[0].file);

      const response = await this.developmentService.uploadImage(developmentId, this.uploadedFiles[0].file).toPromise();


      this.uploadedFiles = [];

    } catch (uploadError) {
      throw new Error('Erro ao fazer upload da imagem. Desenvolvimento salvo mas imagem não foi enviada.');
    }
  }


  /**
   * 🔍 ERRO DO CAMPO - Retorna mensagem de erro para um campo específico (ATUALIZADO)
   */
  getFieldError(fieldName: string): string {
    let field;


    if (fieldName === 'productionType') {
      field = this.developmentForm.get('productionType.type');
    } else {
      field = this.developmentForm.get(fieldName);
    }

    if (!field || !field.touched || !field.errors) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório.`;
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${requiredLength} caracteres.`;
    }

    return 'Campo inválido.';
  }

  /**
   * 🏷️ LABEL DO CAMPO - Retorna label amigável para o campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'clientId': 'Cliente',
      'description': 'Descrição',
      'productionType': 'Tipo de produção',
      'clientReference': 'Referência do cliente'
    };

    return labels[fieldName] || fieldName;
  }
}
