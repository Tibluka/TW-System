import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Client } from '../../../../models/clients/clients';
import { CreateDevelopmentRequest, Development, PieceImage, UpdateDevelopmentRequest } from '../../../../models/developments/developments';
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

  // Formulário centralizado
  developmentForm: FormGroup = new FormGroup({});

  // Opções para selects
  clientOptions: SelectOption[] = [];
  productionTypeOptions: SelectOption[] = [
    { value: 'rotary', label: 'Rotativo' },
    { value: 'localized', label: 'Localizado' }
  ];

  // Controle de upload de imagem
  uploadedFiles: UploadedFile[] = [];
  existingFile: PieceImage | undefined = undefined;

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();

    // Acessar dados do modal ativo
    const activeModal = this.modalService.activeModal();
    if (activeModal?.config.data) {
      const development = activeModal.config.data;
      this.populateForm(development);
    }
  }

  // ============================================
  // GETTERS PARA O TEMPLATE
  // ============================================

  get isEditMode(): boolean {
    return !!this.developmentForm.value._id;
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  // ============================================
  // SETUP METHODS
  // ============================================

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

    console.log('📝 Formulário inicializado');
  }

  /**
   * 📊 CARREGAR DADOS INICIAIS - Carrega clientes e desenvolvimento (se edição)
   */
  private async loadInitialData(): Promise<void> {
    this.isLoading = true;

    try {
      // Carregar lista de clientes
      await this.loadClients();

      // Acessar dados do modal ativo (IGUAL AO CLIENT-MODAL)
      const activeModal = this.modalService.activeModal();
      if (activeModal?.config.data) {
        const development = activeModal.config.data;
        this.populateForm(development);
      } else if (this.developmentId) {
        // Fallback: Se não há dados no modal, mas há ID, buscar pelos dados
        await this.loadDevelopmentData();
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
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

        console.log('✅ Clientes carregados para select:', this.clientOptions.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar clientes para select:', error);
    }
  }

  /**
   * 📋 POPULAR FORMULÁRIO - Preenche dados do desenvolvimento para edição (IGUAL AO CLIENT-MODAL)
   */
  private populateForm(development: Development): void {
    // Determinar tipo de produção baseado no que está habilitado
    let productionType = '';
    if (development.productionType?.rotary?.enabled) {
      productionType = 'rotary';
    } else if (development.productionType?.localized?.enabled) {
      productionType = 'localized';
    }

    if (development.pieceImage?.url) {
      this.existingFile = development.pieceImage;
    }

    this.developmentForm.patchValue({
      clientId: development.client?._id || development.clientId,
      description: development.description || '',
      productionType: productionType,
      clientReference: development.clientReference || ''
    });

    // Se existir _id no development, adiciona o form control _id se não existir (IGUAL AO CLIENT-MODAL)
    if (development._id) {
      if (!this.developmentForm.contains('_id')) {
        this.developmentForm.addControl('_id', this.formBuilder.control(development._id));
      } else {
        this.developmentForm.get('_id')?.setValue(development._id);
      }
    }

    console.log('✅ Dados do desenvolvimento carregados para edição:', development);
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
      console.error('❌ Erro ao carregar desenvolvimento:', error);
    }
  }

  // ============================================
  // FILE UPLOAD HANDLERS
  // ============================================

  /**
   * 📁 ARQUIVOS ALTERADOS - Callback quando arquivos são alterados
   */
  onImageChanged(files: UploadedFile[]): void {
    this.uploadedFiles = files;
    console.log('📁 Arquivos alterados:', files);
  }

  /**
   * ➕ ARQUIVO ADICIONADO - Callback quando arquivo é adicionado
   */
  onImageAdded(file: UploadedFile): void {
    console.log('➕ Arquivo adicionado:', file);
  }

  /**
   * 🗑️ ARQUIVO REMOVIDO - Callback quando arquivo é removido
   */
  onImageRemoved(file: UploadedFile): void {
    console.log('🗑️ Arquivo removido:', file);
  }

  /**
   * ❌ ERRO UPLOAD - Callback para erros de upload
   */
  onUploadError(error: string): void {
    console.error('❌ Erro no upload:', error);
  }

  // ============================================
  // FORM ACTIONS
  // ============================================

  /**
   * ❌ CANCELAR - Fecha modal sem salvar
   */
  onCancel(): void {
    this.modalService.close('development-modal', { success: false });
  }

  /**
   * 💾 SUBMIT - Processa envio do formulário
   */
  async onSubmit(): Promise<void> {
    if (this.developmentForm.invalid || this.isSaving) return;

    this.isSaving = true;

    try {
      const formData = this.developmentForm.value;

      // Construir productionType baseado na seleção
      const productionType = {
        rotary: {
          enabled: formData.productionType === 'rotary',
          negotiatedPrice: formData.productionType === 'rotary' ? 0 : undefined
        },
        localized: {
          enabled: formData.productionType === 'localized',
          negotiatedPrice: formData.productionType === 'localized' ? 0 : undefined
        }
      };

      let result: any;

      if (this.isEditMode && this.developmentForm.value._id) {
        // Modo edição - atualizar desenvolvimento
        const updateData: UpdateDevelopmentRequest = {
          clientId: formData.clientId,
          description: formData.description,
          clientReference: formData.clientReference,
          productionType: productionType
        };

        result = await lastValueFrom(this.developmentService.updateDevelopment(this.developmentForm.value._id, updateData));
        console.log('✅ Desenvolvimento atualizado:', result);

        // Se há imagem para upload após criação, fazer upload
        if (this.uploadedFiles.length > 0 && result._id) {
          await this.uploadImageToDevelopment(result._id);
        }

        this.modalService.close('development-modal', {
          action: 'updated',
          data: result
        });

      } else {
        // Modo criação - criar novo desenvolvimento
        const createData: CreateDevelopmentRequest = {
          clientId: formData.clientId,
          description: formData.description,
          clientReference: formData.clientReference,
          productionType: productionType
        };

        result = await lastValueFrom(this.developmentService.createDevelopment(createData));
        console.log('✅ Desenvolvimento criado:', result);

        // Se há imagem para upload após criação, fazer upload
        if (this.uploadedFiles.length > 0 && result._id) {
          await this.uploadImageToDevelopment(result._id);
        }

        this.modalService.close('development-modal', {
          action: 'created',
          data: result
        });
      }

    } catch (error: any) {
      console.error('❌ Erro ao salvar desenvolvimento:', error);
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
      console.log('📷 Fazendo upload de imagem para desenvolvimento:', developmentId);

      const formData = new FormData();
      formData.append('image', this.uploadedFiles[0].file);

      const response = await this.developmentService.uploadImage(developmentId, this.uploadedFiles[0].file).toPromise();

      console.log('✅ Imagem enviada com sucesso:', response);

      // Limpar arquivos após upload bem-sucedido
      this.uploadedFiles = [];

    } catch (uploadError) {
      console.error('❌ Erro ao enviar imagem:', uploadError);
      throw new Error('Erro ao fazer upload da imagem. Desenvolvimento salvo mas imagem não foi enviada.');
    }
  }

  // ============================================
  // FORM VALIDATION
  // ============================================

  /**
   * 🔍 ERRO DO CAMPO - Retorna mensagem de erro para um campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.developmentForm.get(fieldName);

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