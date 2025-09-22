import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TabConfig, TabsComponent } from '../../../../shared/components/molecules/tabs/tabs.component';
import { CompanyDataComponent } from "./company-data/company-data.component";
import { ContactDataComponent } from "./contact-data/contact-data.component";
import { AddressDataComponent } from "./address-data/address-data.component";
import { ValuesDataComponent } from "./values-data/values-data.component";

@Component({
  selector: 'app-client-modal',
  imports: [
    CommonModule,
    TabsComponent,
    CompanyDataComponent,
    ContactDataComponent,
    AddressDataComponent,
    ValuesDataComponent
  ],
  templateUrl: './client-modal.component.html',
  styleUrl: './client-modal.component.scss'
})
export class ClientModalComponent {

  currentTab = 'company';

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
      disabled: false // pode ser habilitado dinamicamente
    }
  ];

  handleTabChange(tabId: string): void {
    this.currentTab = tabId;

    // Aqui você pode fazer chamadas de API, 
    // resetar badges, etc.
    this.updateBadgeCount(tabId);
  }

  handleTabClick(event: { tabId: string, tab: TabConfig }): void {
    console.log('Clicou na tab:', event.tab.label);

    // Analytics ou outras ações
    this.trackTabClick(event.tabId);
  }

  private updateBadgeCount(tabId: string): void {
    // Exemplo: resetar badge da tab ativa
    const tab = this.advancedTabs.find(t => t.id === tabId);
    if (tab && tab.badge) {
      tab.badge = 0;
    }
  }

  private trackTabClick(tabId: string): void {
    // Implementar analytics
    console.log('Analytics: tab clicked', tabId);
  }

}
