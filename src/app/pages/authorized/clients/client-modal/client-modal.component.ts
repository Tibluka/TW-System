import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TabConfig, TabsComponent } from '../../../../shared/components/molecules/tabs/tabs.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { ModalService } from '../../../../shared/services/modal/modal.service';
import { CompanyDataComponent } from "./company-data/company-data.component";
import { ContactDataComponent } from "./contact-data/contact-data.component";
import { AddressDataComponent } from "./address-data/address-data.component";
import { ValuesDataComponent } from "./values-data/values-data.component";

@Component({
  selector: 'app-client-modal',
  imports: [
    CommonModule,
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
export class ClientModalComponent {

  private modalService = inject(ModalService);

  currentTab = 'company';
  currentTabIndex = 0;

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

  constructor() {
    this.updateCurrentTabIndex();
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
    // Fechar o modal sem salvar
    this.modalService.close('client-modal');
  }

  onBackClick(): void {
    // Navegar para a tab anterior
    if (this.currentTabIndex > 0) {
      const previousTab = this.advancedTabs[this.currentTabIndex - 1];
      this.handleTabChange(previousTab.id);
    }
  }

  onNextClick(): void {
    if (this.isLastStep) {
      // Se for o último passo, salvar os dados
      this.onSaveClient();
    } else {
      // Navegar para a próxima tab
      const nextTab = this.advancedTabs[this.currentTabIndex + 1];
      this.handleTabChange(nextTab.id);
    }
  }

  private onSaveClient(): void {
    // TODO: Implementar lógica de salvamento
    console.log('Salvando cliente...');

    // Fechar modal após salvar
    this.modalService.close('client-modal', { saved: true });
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
    // Resetar badge da tab ativa
    const tab = this.advancedTabs.find(t => t.id === tabId);
    if (tab && tab.badge) {
      tab.badge = 0;
    }
  }

  private trackTabClick(tabId: string): void {
    // Analytics
    console.log('Analytics: tab clicked', tabId);
  }
}