import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabConfig, TabsComponent } from '../../../../shared/components/molecules/tabs/tabs.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { ClientService } from '../../../../shared/services/clients/clients.service';
import { BrazilianState, Client, CreateClientRequest, UpdateClientRequest } from '../../../../models/clients/clients';
import { CompanyDataComponent } from "./company-data/company-data.component";
import { ContactDataComponent } from "./contact-data/contact-data.component";
import { AddressDataComponent } from "./address-data/address-data.component";
import { ValuesDataComponent } from "./values-data/values-data.component";
import { SpinnerComponent } from '../../../../shared/components/atoms/spinner/spinner.component';

@Component({
  selector: 'app-client-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabsComponent,
    ButtonComponent,
    CompanyDataComponent,
    ContactDataComponent,
    AddressDataComponent,
    ValuesDataComponent,
    SpinnerComponent
  ],
  templateUrl: './client-modal.component.html',
  styleUrl: './client-modal.component.scss'
})
export class ClientModalComponent implements OnInit {

  modalService = inject(ModalService);
  private formBuilder = inject(FormBuilder);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  currentTab = 'company';
  currentTabIndex = 0;
  isLoading = false;
  isSaving = false;
  clientForm: FormGroup = new FormGroup({});
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
    const activeModal = this.modalService.activeModal();
    if (activeModal?.config.data) {
      const client = activeModal.config.data;
      this.populateForm(client);
    }
  }

  get isEditMode(): boolean {
    return !!this.clientForm.value._id;
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  private populateForm(client: Client): void {
    this.clientForm.patchValue({

      companyName: client.companyName,
      cnpj: this.formatCNPJ(client.cnpj),
      acronym: client.acronym,
      responsibleName: client.contact.responsibleName,
      email: client.contact.email,
      phone: client.contact.phone,
      zipcode: client.address.zipcode,
      street: client.address.street,
      number: client.address.number,
      complement: client.address.complement || '',
      neighborhood: client.address.neighborhood,
      city: client.address.city,
      state: client.address.state,
      valuePerMeter: client.values.valuePerMeter,
      valuePerPiece: client.values.valuePerPiece
    });
    if (client._id) {
      if (!this.clientForm.contains('_id')) {
        this.clientForm.addControl('_id', this.formBuilder.control(client._id));
      } else {
        this.clientForm.get('_id')?.setValue(client._id);
      }
    }
  }

  private formatCNPJ(cnpj: string): string {

    if (cnpj && cnpj.length === 14) {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  }

  private initializeForm(): void {
    this.clientForm = this.formBuilder.group({

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
      complement: [''],
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

  handleTabChange(tabId: string): void {
    this.currentTab = tabId;
    this.updateCurrentTabIndex();
    this.updateBadgeCount(tabId);
  }

  handleTabClick(event: { tabId: string, tab: TabConfig }): void {
    this.trackTabClick(event.tabId);
  }

  private updateCurrentTabIndex(): void {
    this.currentTabIndex = this.advancedTabs.findIndex(tab => tab.id === this.currentTab);
  }

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

    const currentTabId = this.currentTab;
    this.markTabFieldsAsTouched(currentTabId);

    if (!this.isTabValid(currentTabId)) {

      this.updateTabBadges();
      return;
    }

    if (this.isLastStep) {

      this.onSaveClient();
    } else {

      const nextTab = this.advancedTabs[this.currentTabIndex + 1];
      this.handleTabChange(nextTab.id);
    }
  }

  private onSaveClient(): void {

    Object.keys(this.clientForm.controls).forEach(key => {
      this.clientForm.get(key)?.markAsTouched();
    });

    if (this.clientForm.valid) {

      const formData = this.prepareFormData();
      if (this.isEditMode) {
        this.updateClient(formData);
      } else {
        this.createClient(formData);
      }
    } else {

      const invalidTab = this.getFirstInvalidTab();
      if (invalidTab) {
        this.handleTabChange(invalidTab);
        this.updateTabBadges();
      }
    }
  }

  private prepareFormData(): CreateClientRequest | UpdateClientRequest {
    const formValues = this.clientForm.value;
    const payload = {
      _id: formValues?._id,
      acronym: formValues.acronym,
      companyName: formValues.companyName,
      cnpj: formValues.cnpj,
      contact: {
        responsibleName: formValues.responsibleName,
        phone: formValues.phone,
        email: formValues.email
      },
      address: {
        street: formValues.street,
        number: formValues.number,
        complement: formValues.complement || undefined,
        neighborhood: formValues.neighborhood,
        city: formValues.city,
        state: formValues.state.toUpperCase(),
        zipcode: formValues.zipcode
      },
      values: {
        valuePerMeter: parseFloat(formValues.valuePerMeter),
        valuePerPiece: parseFloat(formValues.valuePerPiece)
      }
    };

    if (!payload._id) {
      delete payload._id;
    }

    return payload;
  }

  private createClient(clientData: CreateClientRequest | any): void {
    this.isSaving = true;

    this.clientService.createClient(clientData).subscribe({
      next: (response) => {
        this.isSaving = false;

        this.modalService.close('client-modal', {
          action: 'created',
          data: response.data
        });
      },
      error: (error) => {
        this.isSaving = false;

      }
    });
  }

  private updateClient(clientData: UpdateClientRequest): void {
    if (!this.clientForm.value._id) return;

    this.isSaving = true;

    this.clientService.updateClient(this.clientForm.value._id, clientData).subscribe({
      next: (response) => {
        this.isSaving = false;

        this.modalService.close('client-modal', {
          action: 'updated',
          data: response.data
        });
      },
      error: (error) => {
        this.isSaving = false;

      }
    });
  }

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
    return this.isLastStep ? this.saveButtonLabel : 'Próximo';
  }

  get nextButtonIcon(): string {
    return this.isLastStep ? 'fa-solid fa-check' : 'fa-solid fa-arrow-right';
  }

  get isNextButtonDisabled(): boolean {
    return this.isSaving || this.isLoading;
  }

  private updateBadgeCount(tabId: string): void {

    const tab = this.advancedTabs.find(t => t.id === tabId);
    if (tab && this.isTabValid(tabId)) {
      tab.badge = undefined;
    }
  }

  private trackTabClick(tabId: string): void {
  }
}