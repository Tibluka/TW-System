import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabConfig, TabsComponent } from '../../../../shared/components/molecules/tabs/tabs.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { BrazilianState } from '../../../../models/clients/clients';
import { CompanyDataComponent } from "./company-data/company-data.component";
import { ContactDataComponent } from "./contact-data/contact-data.component";
import { AddressDataComponent } from "./address-data/address-data.component";
import { ValuesDataComponent } from "./values-data/values-data.component";

@Component({
  selector: 'app-client-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule, // Adicionar ReactiveFormsModule aqui também
    TabsComponent,
    ButtonComponent,
    CompanyDataComponent,
    ContactDataComponent,
    AddressDataComponent,
    ValuesDataComponent
  ],
  templateUrl: './client-modal.component.html',
  styleUrl: './client-modal.component.scss'
})
export class ClientModalComponent implements OnInit {

  private modalService = inject(ModalService);
  private formBuilder = inject(FormBuilder);

  currentTab = 'company';
  currentTabIndex = 0;

  // Formulário centralizado
  clientForm: FormGroup = new FormGroup({});

  // Estados brasileiros para validação
  private brazilianStates: BrazilianState[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  advancedTabs: TabConfig[] = [
    {
      id: 'company',
      label: 'Empresa',
      icon: 'fas fa-building',
      badge: undefined
    },
    {
      id: 'contact',
      label: 'Contato',
      icon: 'fas fa-phone',
      badge: undefined
    },
    {
      id: 'address',
      label: 'Endereço',
      icon: 'fas fa-map-marker-alt',
      badge: undefined
    },
    {
      id: 'values',
      label: 'Valores',
      icon: 'fas fa-dollar-sign',
      badge: undefined,
      disabled: false
    }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.updateCurrentTabIndex();
  }

  // ============================================
  // INICIALIZAÇÃO DO FORMULÁRIO
  // ============================================

  private initializeForm(): void {
    this.clientForm = this.formBuilder.group({
      // Company fields
      companyName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      cnpj: ['', [
        Validators.required,
        Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
      ]],
      acronym: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10)
      ]],

      // Contact fields
      responsibleName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[\d\s\(\)\-\+]+$/)
      ]],

      // Address fields
      zipcode: ['', [
        Validators.required,
        Validators.pattern(/^\d{5}-?\d{3}$/)
      ]],
      street: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      number: ['', [
        Validators.required
      ]],
      complement: [''], // Campo opcional
      neighborhood: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      state: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        this.brazilianStateValidator.bind(this)
      ]],

      // Values fields
      valuePerMeter: ['', [
        Validators.required,
        Validators.min(0),
        this.currencyValidator.bind(this)
      ]],
      valuePerPiece: ['', [
        Validators.required,
        Validators.min(0),
        this.currencyValidator.bind(this)
      ]]
    });
  }

  // ============================================
  // VALIDADORES CUSTOMIZADOS
  // ============================================

  private brazilianStateValidator(control: any): { [key: string]: any } | null {
    if (!control.value) return null;

    const value = control.value.toUpperCase();
    const isValid = this.brazilianStates.includes(value as BrazilianState);

    return isValid ? null : { 'invalidState': { value: control.value } };
  }

  private currencyValidator(control: any): { [key: string]: any } | null {
    if (!control.value) return null;

    const value = parseFloat(control.value);
    if (isNaN(value) || value < 0) {
      return { 'invalidCurrency': { value: control.value } };
    }

    const decimalPlaces = (control.value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return { 'tooManyDecimals': { value: control.value } };
    }

    return null;
  }

  // ============================================
  // MÉTODOS DE VALIDAÇÃO POR ABA
  // ============================================

  private getTabFields(tabId: string): string[] {
    switch (tabId) {
      case 'company':
        return ['companyName', 'cnpj', 'acronym'];
      case 'contact':
        return ['responsibleName', 'email', 'phone'];
      case 'address':
        return ['zipcode', 'street', 'number', 'neighborhood', 'city', 'state'];
      case 'values':
        return ['valuePerMeter', 'valuePerPiece'];
      default:
        return [];
    }
  }

  private isTabValid(tabId: string): boolean {
    const fields = this.getTabFields(tabId);
    return fields.every(field => {
      const control = this.clientForm.get(field);
      return control ? control.valid : true;
    });
  }

  private markTabFieldsAsTouched(tabId: string): void {
    const fields = this.getTabFields(tabId);
    fields.forEach(field => {
      const control = this.clientForm.get(field);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private getFirstInvalidTab(): string | null {
    for (const tab of this.advancedTabs) {
      if (!this.isTabValid(tab.id)) {
        return tab.id;
      }
    }
    return null;
  }

  private updateTabBadges(): void {
    this.advancedTabs.forEach(tab => {
      if (!this.isTabValid(tab.id)) {
        tab.badge = '!';
      } else {
        tab.badge = undefined;
      }
    });
  }

  // ============================================
  // MÉTODOS DE NAVEGAÇÃO DAS TABS
  // ============================================

  handleTabChange(tabId: string): void {
    this.currentTab = tabId;
    this.updateCurrentTabIndex();
    this.updateBadgeCount(tabId);
  }

  handleTabClick(event: { tabId: string, tab: TabConfig }): void {
    console.log('Clicou na tab:', event.tab.label);
    this.trackTabClick(event.tabId);
  }

  private updateCurrentTabIndex(): void {
    this.currentTabIndex = this.advancedTabs.findIndex(tab => tab.id === this.currentTab);
  }

  // ============================================
  // MÉTODOS DOS BOTÕES DE NAVEGAÇÃO
  // ============================================

  onCancelClick(): void {
    this.modalService.close('client-modal');
  }

  onBackClick(): void {
    if (this.currentTabIndex > 0) {
      const previousTab = this.advancedTabs[this.currentTabIndex - 1];
      this.handleTabChange(previousTab.id);
    }
  }

  onNextClick(): void {
    // Verificar se a aba atual é válida antes de avançar
    const currentTabId = this.currentTab;

    // Marcar campos da aba atual como touched
    this.markTabFieldsAsTouched(currentTabId);

    if (!this.isTabValid(currentTabId)) {
      // Aba atual inválida - não permite avançar
      console.log('Aba atual inválida:', currentTabId);
      this.updateTabBadges();
      return;
    }

    if (this.isLastStep) {
      // Se for o último passo, verificar todo o formulário
      this.onSaveClient();
    } else {
      // Navegar para a próxima tab
      const nextTab = this.advancedTabs[this.currentTabIndex + 1];
      this.handleTabChange(nextTab.id);
    }
  }

  private onSaveClient(): void {
    // Marcar todos os campos como touched
    Object.keys(this.clientForm.controls).forEach(key => {
      this.clientForm.get(key)?.markAsTouched();
    });

    if (this.clientForm.valid) {
      // Formulário válido - salvar
      console.log('Salvando cliente...', this.clientForm.value);
      this.modalService.close('client-modal', {
        saved: true,
        data: this.clientForm.value
      });
    } else {
      // Formulário inválido - ir para a primeira aba com erro
      const invalidTab = this.getFirstInvalidTab();
      if (invalidTab) {
        console.log('Formulário inválido. Indo para aba:', invalidTab);
        this.handleTabChange(invalidTab);
        this.updateTabBadges();
      }
    }
  }

  // ============================================
  // GETTERS PARA O TEMPLATE
  // ============================================

  get isFirstStep(): boolean {
    return this.currentTabIndex === 0;
  }

  get isLastStep(): boolean {
    return this.currentTabIndex === this.advancedTabs.length - 1;
  }

  get showBackButton(): boolean {
    return this.currentTabIndex > 0;
  }

  get nextButtonLabel(): string {
    return this.isLastStep ? 'Salvar' : 'Próximo';
  }

  get nextButtonIcon(): string {
    return this.isLastStep ? 'fa-solid fa-check' : 'fa-solid fa-arrow-right';
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private updateBadgeCount(tabId: string): void {
    // Resetar badge da tab ativa se ela for válida
    const tab = this.advancedTabs.find(t => t.id === tabId);
    if (tab && this.isTabValid(tabId)) {
      tab.badge = undefined;
    }
  }

  private trackTabClick(tabId: string): void {
    console.log('Analytics: tab clicked', tabId);
  }
}