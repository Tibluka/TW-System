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
import { TableColumn, TableData } from '../../../models/table/table';

@Component({
  selector: 'app-clients',
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    InputComponent,
    TextareaComponent,
    SelectComponent, // ← Adicionar o SelectComponent
    CardComponent,
    TableComponent
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent extends FormValidator {

  clientForm = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    notes: new FormControl<string>('', Validators.required),
    category: new FormControl<string>('', Validators.required),
    status: new FormControl<string>('ativo'),
    tags: new FormControl<string[]>([], Validators.required), // ← Tipagem explícita como array de strings
    country: new FormControl<string>('')
  });

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
    { value: 'suspenso', label: 'Suspenso' },
    { value: 'pendente', label: 'Pendente' }
  ];

  tagOptions: SelectOption[] = [
    { value: 'importante', label: 'Importante' },
    { value: 'frequente', label: 'Comprador Frequente' },
    { value: 'novo', label: 'Cliente Novo' },
    { value: 'fidelizado', label: 'Fidelizado' },
    { value: 'promocional', label: 'Promoções' },
    { value: 'desconto', label: 'Elegível para Desconto' }
  ];

  countryOptions: SelectOption[] = [
    { value: 'BR', label: 'Brasil' },
    { value: 'AR', label: 'Argentina' },
    { value: 'UY', label: 'Uruguai' },
    { value: 'PY', label: 'Paraguai' },
    { value: 'CL', label: 'Chile' },
    { value: 'PE', label: 'Peru' },
    { value: 'CO', label: 'Colômbia' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'CA', label: 'Canadá' }
  ];

  click() {
    alert('Sucesso!')
  }

  submit() {
    this.clientForm.markAllAsTouched();

    if (this.clientForm.valid) {
      console.log('Dados do formulário:', this.clientForm.value);
      alert('Formulário válido! Dados: ' + JSON.stringify(this.clientForm.value, null, 2));
    } else {
      alert('Formulário inválido! Verifique os campos obrigatórios.');
    }
  }

  // Método para lidar com mudanças no select de categoria
  onCategoryChange(categoryValue: string) {
    console.log('Categoria selecionada:', categoryValue);

    // Exemplo: ajustar tags baseado na categoria
    if (categoryValue === 'vip') {
      this.clientForm.patchValue({
        tags: ['importante', 'fidelizado'] as string[]
      });
    }
  }

  // Método para lidar com mudanças nas tags
  onTagsChange(tags: string[]) {
    console.log('Tags selecionadas:', tags);
  }

  // Método para lidar com busca de países (simulação de API)
  onCountrySearch(searchTerm: string) {
    console.log('Buscando países:', searchTerm);
    // Aqui você poderia fazer uma chamada para API
    // this.countryService.searchCountries(searchTerm).subscribe(...)
  }

  // Definição das colunas
  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
      align: 'center',
      type: 'number'
    },
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
      type: 'text'
    },
    {
      key: 'email',
      label: 'E-mail',
      sortable: true,
      type: 'text'
    },
    {
      key: 'dataCriacao',
      label: 'Data de Criação',
      sortable: true,
      type: 'date',
      align: 'center'
    },
    {
      key: 'ativo',
      label: 'Ativo',
      type: 'boolean',
      align: 'center'
    }
  ];

  // Colunas com conteúdo customizado
  customColumns: TableColumn[] = [
    ...this.columns,
    {
      key: 'status',
      label: 'Status',
      type: 'custom',
      align: 'center'
    },
    {
      key: 'actions',
      label: 'Ações',
      type: 'custom',
      align: 'center',
      width: '150px'
    }
  ];

  // Dados da tabela
  tableData: TableData[] = [
    {
      id: 1,
      nome: 'João Sil lfaksdflkdslkfdslkdsflksdlk va',
      email: 'joao@email.com',
      dataCriacao: '2024-01-15',
      ativo: true,
      status: 'Ativo'
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@emaasasdasdasdadasdlaksil.com',
      dataCriacao: '2024-02-20',
      ativo: false,
      status: 'Inativo'
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro@email.com',
      dataCriacao: '2024-03-10',
      ativo: true,
      status: 'Pendente'
    }
  ];

}