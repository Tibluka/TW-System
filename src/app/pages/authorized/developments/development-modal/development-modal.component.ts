import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../../shared/components/atoms/input/input.component';
import { SelectComponent } from '../../../../shared/components/atoms/select/select.component';
import { TextareaComponent } from '../../../../shared/components/atoms/textarea/textarea.component';
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { ClientService } from '../../../../shared/services/clients/clients.service';
import { Development, CreateDevelopmentRequest, UpdateDevelopmentRequest } from '../../../../models/developments/developments';
import { Client } from '../../../../models/clients/clients';
import { DevelopmentService } from '../../../../shared/services/development/development.service';

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
    SpinnerComponent
  ],
  templateUrl: './development-modal.component.html',
  styleUrl: './development-modal.component.scss'
})
export class DevelopmentModalComponent implements OnInit {

  @Input() developmentId?: string;

  private modalService = inject(ModalService);
  private formBuilder = inject(FormBuilder);
  private developmentService = inject(DevelopmentService);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  isSaving = false;
  isEditMode = false;

  // Formulário centralizado
  developmentForm: FormGroup = new FormGroup({});

  // Opções para selects
  clientOptions: SelectOption[] = [];
  statusOptions: SelectOption[] = [
    { value: 'draft', label: 'Rascunho' },
    { value: 'planning', label: 'Planejamento' },
    { value: 'in_progress', label: 'Em Progresso' },
    { value: 'testing', label: 'Teste' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'on_hold', label: 'Pausado' }
  ];

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  // ============================================
  // SETUP METHODS
  // ============================================

  /**
   * 📝 INICIALIZAR FORM - Cria formulário reativo
   */
  private initializeForm(): void {
    this.developmentForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      clientId: ['', [Validators.required]],
      status: ['draft', [Validators.required]],
      progress: [0, [Validators.min(0), Validators.max(100)]],
      description: [''],
      startDate: ['', [Validators.required]],
      expectedEndDate: [''],
      totalValue: [0, [Validators.min(0)]],
      paidValue: [0, [Validators.min(0)]],
      technologies: [''],
      observations: ['']
    });

    // Determinar se é modo edição
    this.isEditMode = !!this.developmentId;

    console.log('📝 Formulário inicializado:', {
      isEditMode: this.isEditMode,
      developmentId: this.developmentId
    });
  }

  /**
   * 📊 CARREGAR DADOS INICIAIS - Carrega clientes e desenvolvimento (se edição)
   */
  private async loadInitialData(): Promise<void> {
    this.isLoading = true;

    try {
      // Carregar lista de clientes
      await this.loadClients();

      // Se é modo edição, carregar dados do desenvolvimento
      if (this.isEditMode && this.developmentId) {
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
      const response = await this.clientService.getClients({
        page: 1,
        limit: 100,
        active: true
      }).toPromise();

      if (response?.data) {
        this.clientOptions = response.data.map((client: Client) => ({
          value: client._id!,
          label: client.companyName || 'Cliente sem nome'
        }));

        console.log('✅ Clientes carregados:', this.clientOptions.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
    }
  }

  /**
   * 📋 CARREGAR DESENVOLVIMENTO - Carrega dados do desenvolvimento para edição
   */
  private async loadDevelopmentData(): Promise<void> {
    if (!this.developmentId) return;

    try {
      const development = await this.developmentService.getDevelopmentById(this.developmentId).toPromise();

      if (development) {
        // Preencher formulário com dados existentes
        this.developmentForm.patchValue({
          name: development.name,
          clientId: development.client?._id || development.clientId,
          status: development.status,
          progress: development.progress || 0,
          description: development.description || '',
          startDate: this.formatDateForInput(development.startDate),
          expectedEndDate: this.formatDateForInput(development.expectedEndDate),
          totalValue: development.totalValue || 0,
          paidValue: development.paidValue || 0,
          technologies: development.technologies || '',
          observations: development.observations || ''
        });

        console.log('✅ Dados do desenvolvimento carregados:', development.name);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar desenvolvimento:', error);
    }
  }

  // ============================================
  // FORM ACTIONS
  // ============================================

  /**
   * 💾 SUBMIT - Processa envio do formulário
   */
  async onSubmit(): Promise<void> {
    if (this.developmentForm.invalid || this.isSaving) return;

    this.isSaving = true;

    try {
      const formData = this.developmentForm.value;
      let result;

      if (this.isEditMode && this.developmentId) {
        // Modo edição - atualizar desenvolvimento
        const updateData: UpdateDevelopmentRequest = {
          ...formData,
          startDate: new Date(formData.startDate),
          expectedEndDate: formData.expectedEndDate ? new Date(formData.expectedEndDate) : undefined
        };

        result = await this.developmentService.updateDevelopment(this.developmentId, updateData).toPromise();
        console.log('✅ Desenvolvimento atualizado:', result);

      } else {
        // Modo criação - criar novo desenvolvimento
        const createData: CreateDevelopmentRequest = {
          ...formData,
          startDate: new Date(formData.startDate),
          expectedEndDate: formData.expectedEndDate ? new Date(formData.expectedEndDate) : undefined
        };

        result = await this.developmentService.createDevelopment(createData).toPromise();
        console.log('✅ Desenvolvimento criado:', result);
      }

      // Fechar modal com sucesso
      this.modalService.close('development-modal', {
        success: true,
        data: result,
        message: this.isEditMode ? 'Desenvolvimento atualizado com sucesso!' : 'Desenvolvimento criado com sucesso!'
      });

    } catch (error: any) {
      console.error('❌ Erro ao salvar desenvolvimento:', error);

      // Não fechar modal em caso de erro, apenas mostrar mensagem
      // TODO: Implementar sistema de notificações
      alert(error.message || 'Erro ao salvar desenvolvimento. Tente novamente.');

    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * ❌ CANCELAR - Fecha modal sem salvar
   */
  onCancel(): void {
    this.modalService.close('development-modal', { success: false });
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

    // Mensagens de erro personalizadas
    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório.`;
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${requiredLength} caracteres.`;
    }

    if (errors['min']) {
      const min = errors['min'].min;
      return `${this.getFieldLabel(fieldName)} deve ser maior ou igual a ${min}.`;
    }

    if (errors['max']) {
      const max = errors['max'].max;
      return `${this.getFieldLabel(fieldName)} deve ser menor ou igual a ${max}.`;
    }

    return 'Campo inválido.';
  }

  /**
   * 🏷️ LABEL DO CAMPO - Retorna label amigável para o campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'name': 'Nome do desenvolvimento',
      'clientId': 'Cliente',
      'status': 'Status',
      'progress': 'Progresso',
      'description': 'Descrição',
      'startDate': 'Data de início',
      'expectedEndDate': 'Data prevista de conclusão',
      'totalValue': 'Valor total',
      'paidValue': 'Valor pago',
      'technologies': 'Tecnologias',
      'observations': 'Observações'
    };

    return labels[fieldName] || fieldName;
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * 📅 FORMATAR DATA - Converte data para formato do input[type="date"]
   */
  private formatDateForInput(date: string | Date | undefined): string {
    if (!date) return '';

    const dateObj = new Date(date);

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) return '';

    // Retornar no formato YYYY-MM-DD
    return dateObj.toISOString().split('T')[0];
  }
}