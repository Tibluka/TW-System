import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { FormValidator } from '../../../shared/utils/form';
import { TextareaComponent } from '../../../shared/components/atoms/textarea/textarea.component';
import { SelectComponent, SelectOption } from '../../../shared/components/atoms/select/select.component';
import { CardComponent } from '../../../shared/components/organisms/card/card.component';
import { TableComponent } from "../../../shared/components/organisms/table/table.component";
import { TableRowComponent } from "../../../shared/components/organisms/table/table-row/table-row.component";
import { TableCellComponent } from "../../../shared/components/organisms/table/table-cell/table-cell.component";

@Component({
  selector: 'app-clients',
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    CardComponent,
    TableComponent,
    TableRowComponent,
    TableCellComponent
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent extends FormValidator {

  clientForm = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    phone: new FormControl<string>(''),
    company: new FormControl<string>(''),
    notes: new FormControl<string>(''),
    category: new FormControl<string>('', Validators.required),
    status: new FormControl<string>('ativo'),
    tags: new FormControl<string[]>([], Validators.required),
    country: new FormControl<string>('')
  });

  // Mock de dados dos clientes
  clients = [
    {
      id: 1,
      name: 'João Silva Santos',
      email: 'joao.silva@empresa.com',
      phone: '(11) 99999-8888',
      company: 'Tech Solutions Ltda',
      category: 'premium',
      status: 'ativo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      lastContact: new Date('2024-03-15'),
      totalOrders: 15,
      totalValue: 45890.50
    },
    {
      id: 2,
      name: 'Maria Costa Oliveira',
      email: 'maria.costa@innovate.com.br',
      phone: '(11) 98888-7777',
      company: 'Innovate Digital',
      category: 'vip',
      status: 'ativo',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
      lastContact: new Date('2024-03-18'),
      totalOrders: 28,
      totalValue: 127500.80
    },
    {
      id: 3,
      name: 'Pedro Henrique Lima',
      email: 'pedro.lima@startup.io',
      phone: '(11) 97777-6666',
      company: 'StartupTech',
      category: 'standard',
      status: 'inativo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      lastContact: new Date('2024-02-20'),
      totalOrders: 8,
      totalValue: 12450.00
    },
    {
      id: 4,
      name: 'Ana Carolina Ferreira',
      email: 'ana.ferreira@consulting.com',
      phone: '(11) 96666-5555',
      company: 'AC Consulting',
      category: 'corporate',
      status: 'ativo',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      lastContact: new Date('2024-03-20'),
      totalOrders: 35,
      totalValue: 89200.30
    },
    {
      id: 5,
      name: 'Carlos Roberto Souza',
      email: 'carlos.souza@logistics.com.br',
      phone: '(11) 95555-4444',
      company: 'LogisTech Brasil',
      category: 'premium',
      status: 'pendente',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
      lastContact: new Date('2024-03-12'),
      totalOrders: 22,
      totalValue: 67890.45
    }
  ];

  // Opções para os selects
  categoryOptions: SelectOption[] = [
    { value: 'premium', label: 'Cliente Premium' },
    { value: 'standard', label: 'Cliente Padrão' },
    { value: 'basic', label: 'Cliente Básico' },
    { value: 'vip', label: 'Cliente VIP' },
    { value: 'corporate', label: 'Cliente Corporativo' }
  ];

  statusOptions: SelectOption[] = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'bloqueado', label: 'Bloqueado' }
  ];

  tagOptions: SelectOption[] = [
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'varejo', label: 'Varejo' },
    { value: 'logistica', label: 'Logística' }
  ];

  countryOptions: SelectOption[] = [
    { value: 'BR', label: 'Brasil' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'AR', label: 'Argentina' },
    { value: 'UY', label: 'Uruguai' }
  ];

  click() {
    console.log('Button clicked!');
  }

  submit() {
    if (this.clientForm.valid) {
      console.log('Form válido:', this.clientForm.value);
    } else {
      console.log('Form inválido');
      this.clientForm.markAllAsTouched();
    }
  }

  onCategoryChange(selectedCategory: any) {
    console.log('Categoria selecionada:', selectedCategory);
  }

  onTagsChange(selectedTags: any) {
    console.log('Tags selecionadas:', selectedTags);
  }

  onCountrySearch(searchTerm: string) {
    console.log('Buscando país:', searchTerm);
  }

  // Métodos para ações da tabela
  onClientClick(client: any) {
    console.log('Cliente clicado:', client);
  }

  editClient(client: any) {
    console.log('Editar cliente:', client);
    // Aqui você pode carregar os dados no formulário
    this.clientForm.patchValue({
      name: client.name,
      email: client.email,
      company: client.company,
      category: client.category,
      status: client.status
    });
  }

  viewClient(client: any) {
    console.log('Visualizar cliente:', client);
  }

  deleteClient(client: any) {
    console.log('Excluir cliente:', client);
    // Aqui você implementaria a lógica de exclusão
    if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      const index = this.clients.findIndex(c => c.id === client.id);
      if (index > -1) {
        this.clients.splice(index, 1);
      }
    }
  }

  // Método para formatar categoria
  getCategoryLabel(category: string): string {
    const option = this.categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  }

  // Método para formatar status
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  // Método para formatar valor monetário
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Método para formatar data
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
}