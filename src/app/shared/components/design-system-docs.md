# Design System - Documentação dos Componentes

## Sumário
- [Modal (ds-modal)](#modal-ds-modal)
- [Input (ds-input)](#input-ds-input)
- [Select (ds-select)](#select-ds-select)
- [Table (ds-table)](#table-ds-table)
- [Icon (ds-icon)](#icon-ds-icon)
- [Spinner (ds-spinner)](#spinner-ds-spinner)
- [Textarea (ds-textarea)](#textarea-ds-textarea)
- [Card (ds-card)](#card-ds-card)
- [File Upload (ds-file-upload)](#file-upload-ds-file-upload)
- [Button (ds-button)](#button-ds-button)
- [Variáveis de Estilo](#variáveis-de-estilo)

---

## Modal (ds-modal)

### Descrição
Componente modal reutilizável com animações e configurações flexíveis através de um service.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `modalId` | `string` | **obrigatório** | ID único do modal |
| `config` | `Partial<ModalConfig>` | `undefined` | Configurações opcionais do modal |

### Eventos

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `modalClosed` | `EventEmitter<any>` | Emitido quando o modal é fechado |

### ModalConfig

```typescript
interface ModalConfig {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscapeKey?: boolean;
}
```

### Exemplo de Uso

```html
<!-- Template -->
<ds-button label="Abrir Modal" (onClickEmitter)="openModal()" />

<app-modal modalId="example-modal" (modalClosed)="onModalClosed($event)">
  <h2>Conteúdo do Modal</h2>
  <p>Aqui vai o conteúdo do seu modal...</p>
</app-modal>
```

```typescript
// Component
import { ModalService } from './services/modal.service';

export class ExampleComponent {
  constructor(private modalService: ModalService) {}

  openModal() {
    this.modalService.open({
      id: 'example-modal',
      title: 'Meu Modal',
      size: 'md',
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: true,
      closeOnEscapeKey: true
    });
  }

  onModalClosed(result: any) {
    console.log('Modal fechado:', result);
  }
}
```

### Tamanhos Disponíveis
- `sm`: 300px
- `md`: 500px
- `lg`: 800px
- `xl`: 1140px
- `fullscreen`: 95vw x 95vh

---

## Input (ds-input)

### Descrição
Campo de entrada de texto com suporte a ícones, máscaras, validação e integração com formulários reativos.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `label` | `string` | `''` | Texto do label |
| `placeholder` | `string` | `''` | Texto placeholder |
| `type` | `string` | `'text'` | Tipo do input (text, email, password, etc.) |
| `required` | `boolean` | `false` | Campo obrigatório |
| `disabled` | `boolean` | `false` | Campo desabilitado |
| `invalid` | `boolean` | `false` | Estado de erro |
| `icon` | `string` | `''` | Classe do ícone FontAwesome |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posição do ícone |
| `maxlength` | `number \| null` | `null` | Comprimento máximo |
| `minlength` | `number \| null` | `null` | Comprimento mínimo |
| `readonly` | `boolean` | `false` | Campo somente leitura |
| `autocomplete` | `string` | `'off'` | Atributo autocomplete |
| `errorMessage` | `string` | `''` | Mensagem de erro |
| `helperText` | `string` | `''` | Texto de ajuda |
| `fullWidth` | `boolean` | `false` | Ocupar largura total |
| `width` | `string` | `'fit-content'` | Largura personalizada |
| `mask` | `string` | `''` | Máscara para formatação |
| `dropSpecialCharacters` | `boolean` | `false` | Remove caracteres especiais da máscara |

### Eventos

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `valueChanged` | `EventEmitter<string>` | Emitido quando o valor muda |
| `ngModelChange` | `EventEmitter<any>` | Para uso com ngModel |

### Exemplos de Uso

```html
<!-- Input básico -->
<ds-input 
  label="Nome" 
  placeholder="Digite seu nome"
  [fullWidth]="true">
</ds-input>

<!-- Input com ícone -->
<ds-input 
  label="Email" 
  placeholder="seu@email.com"
  type="email"
  icon="fa-solid fa-envelope"
  iconPosition="left"
  [required]="true">
</ds-input>

<!-- Input com máscara -->
<ds-input 
  label="Telefone" 
  placeholder="(11) 99999-9999"
  mask="(00) 00000-0000"
  icon="fa-solid fa-phone">
</ds-input>

<!-- Com formulário reativo -->
<ds-input 
  label="CPF" 
  formControlName="cpf"
  mask="000.000.000-00"
  [invalid]="form.get('cpf')?.invalid && form.get('cpf')?.touched"
  errorMessage="CPF é obrigatório">
</ds-input>
```

### Variáveis CSS Utilizadas
- `$spacing-sm` (8px) - padding interno
- `$spacing-md` (16px) - margin entre elementos
- `$border-radius-sm` (8px) - bordas arredondadas
- Cores do tema via CSS custom properties

---

## Select (ds-select)

### Descrição
Componente de seleção com suporte a múltipla seleção, busca, agrupamento e integração com formulários.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `label` | `string` | `''` | Texto do label |
| `placeholder` | `string` | `'Selecione uma opção'` | Texto placeholder |
| `required` | `boolean` | `false` | Campo obrigatório |
| `disabled` | `boolean` | `false` | Campo desabilitado |
| `invalid` | `boolean` | `false` | Estado de erro |
| `icon` | `string` | `''` | Classe do ícone FontAwesome |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posição do ícone |
| `readonly` | `boolean` | `false` | Campo somente leitura |
| `errorMessage` | `string` | `''` | Mensagem de erro |
| `helperText` | `string` | `''` | Texto de ajuda |
| `fullWidth` | `boolean` | `false` | Ocupar largura total |
| `width` | `string` | `'fit-content'` | Largura personalizada |
| `multiple` | `boolean` | `false` | Seleção múltipla |
| `searchable` | `boolean` | `false` | Permite busca |
| `clearable` | `boolean` | `false` | Permite limpar seleção |
| `options` | `SelectOption[]` | `[]` | Array de opções |
| `optionValue` | `string` | `'value'` | Propriedade para valor |
| `optionLabel` | `string` | `'label'` | Propriedade para label |
| `loadingText` | `string` | `'Carregando...'` | Texto durante carregamento |
| `noOptionsText` | `string` | `'Nenhuma opção encontrada'` | Texto quando não há opções |
| `loading` | `boolean` | `false` | Estado de carregamento |

### Interface SelectOption

```typescript
interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
  [key: string]: any;
}
```

### Eventos

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `selectionChanged` | `EventEmitter<any>` | Emitido quando a seleção muda |

### Exemplos de Uso

```html
<!-- Select simples -->
<ds-select 
  label="Status" 
  placeholder="Selecione o status"
  [options]="statusOptions"
  formControlName="status">
</ds-select>

<!-- Select múltiplo com busca -->
<ds-select 
  label="Tags" 
  placeholder="Selecione as tags"
  [options]="tagOptions"
  [multiple]="true"
  [searchable]="true"
  [clearable]="true"
  icon="fa-solid fa-hashtag"
  helperText="Você pode selecionar múltiplas tags">
</ds-select>

<!-- Select com grupos -->
<ds-select 
  label="País" 
  placeholder="Selecione o país"
  [options]="countryOptions"
  [searchable]="true"
  [clearable]="true"
  icon="fa-solid fa-globe">
</ds-select>
```

```typescript
// Definindo opções
statusOptions: SelectOption[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'pending', label: 'Pendente' }
];

categoryOptions: SelectOption[] = [
  { value: 'premium', label: 'Premium', group: 'Pagos' },
  { value: 'basic', label: 'Básico', group: 'Pagos' },
  { value: 'free', label: 'Gratuito', group: 'Gratuitos' }
];
```

---

## Table (ds-table)

### Descrição
Sistema de tabela flexível com componentes para estrutura, linhas e células.

### Componentes

#### ds-table
Container principal da tabela.

#### ds-table-row
| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `isHeader` | `boolean` | `false` | Define se é linha de cabeçalho |
| `clickable` | `boolean` | `false` | Permite clique na linha |
| `data` | `any` | `undefined` | Dados associados à linha |

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `rowClick` | `EventEmitter<any>` | Emitido ao clicar na linha |

#### ds-table-cell
| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alinhamento do conteúdo |
| `width` | `string` | `''` | Largura da célula |
| `isHeader` | `boolean` | `false` | Define se é célula de cabeçalho |

### Exemplo de Uso

```html
<ds-table>
  <!-- Cabeçalho -->
  <ds-table-row [isHeader]="true">
    <ds-table-cell [isHeader]="true" align="left">Nome</ds-table-cell>
    <ds-table-cell [isHeader]="true" align="left">Email</ds-table-cell>
    <ds-table-cell [isHeader]="true" align="center">Status</ds-table-cell>
    <ds-table-cell [isHeader]="true" align="center">Ações</ds-table-cell>
  </ds-table-row>

  <!-- Dados -->
  <ds-table-row 
    *ngFor="let client of clients" 
    [clickable]="true" 
    [data]="client"
    (rowClick)="onClientClick($event)">
    
    <ds-table-cell align="left">
      <div class="user-info">
        <img [src]="client.avatar" [alt]="client.name" class="avatar" />
        <div>
          <strong>{{ client.name }}</strong>
          <small>{{ client.company }}</small>
        </div>
      </div>
    </ds-table-cell>

    <ds-table-cell align="left">
      <a [href]="'mailto:' + client.email">{{ client.email }}</a>
    </ds-table-cell>

    <ds-table-cell align="center">
      <span [class]="'status-badge status-' + client.status">
        {{ client.status }}
      </span>
    </ds-table-cell>

    <ds-table-cell align="center">
      <div class="actions">
        <ds-button variant="ghost" icon="fa-solid fa-edit" 
          (onClickEmitter)="editClient(client)">
        </ds-button>
        <ds-button variant="ghost" icon="fa-solid fa-trash" 
          (onClickEmitter)="deleteClient(client)">
        </ds-button>
      </div>
    </ds-table-cell>
  </ds-table-row>
</ds-table>
```

---

## Icon (ds-icon)

### Descrição
Componente para exibir ícones FontAwesome com configurações de estilo.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `icon` | `string` | `''` | Classe do ícone FontAwesome |
| `fontSize` | `string` | `''` | Tamanho da fonte (ex: '24px') |
| `cursorType` | `string` | `''` | Tipo do cursor (ex: 'pointer') |
| `color` | `string` | `''` | Cor do ícone |

### Exemplo de Uso

```html
<!-- Ícone básico -->
<app-icon icon="fa-solid fa-home"></app-icon>

<!-- Ícone com configurações -->
<app-icon 
  icon="fa-solid fa-edit" 
  fontSize="20px" 
  color="primary" 
  cursorType="pointer"
  (click)="editItem()">
</app-icon>

<!-- Ícone de fechamento de modal -->
<app-icon 
  icon="fa-solid fa-xmark" 
  fontSize="24px" 
  color="white"
  cursorType="pointer"
  (click)="closeModal()">
</app-icon>
```

### Cores Disponíveis
Use as variáveis CSS do sistema:
- `primary`
- `secondary`
- `tertiary`
- `white`
- `label`
- `placeholder`

---

## Spinner (ds-spinner)

### Descrição
Componente de carregamento com diferentes variantes e tamanhos.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `variant` | `'fill' \| 'outline' \| 'ghost'` | `'fill'` | Variante visual |
| `size` | `string` | `'24px'` | Tamanho do spinner |

### Exemplo de Uso

```html
<!-- Spinner padrão -->
<ds-spinner></ds-spinner>

<!-- Spinner pequeno para botões -->
<ds-spinner size="12px" variant="fill"></ds-spinner>

<!-- Spinner grande para páginas -->
<ds-spinner size="48px" variant="outline"></ds-spinner>
```

### Cores por Variante
- `fill`: branco
- `outline`: tertiary
- `ghost`: tertiary

---

## Textarea (ds-textarea)

### Descrição
Campo de texto multi-linha com configurações avançadas de redimensionamento e validação.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `label` | `string` | `''` | Texto do label |
| `placeholder` | `string` | `''` | Texto placeholder |
| `required` | `boolean` | `false` | Campo obrigatório |
| `disabled` | `boolean` | `false` | Campo desabilitado |
| `invalid` | `boolean` | `false` | Estado de erro |
| `icon` | `string` | `''` | Classe do ícone FontAwesome |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posição do ícone |
| `maxlength` | `number \| null` | `null` | Comprimento máximo |
| `minlength` | `number \| null` | `null` | Comprimento mínimo |
| `readonly` | `boolean` | `false` | Campo somente leitura |
| `rows` | `number` | `4` | Número de linhas visíveis |
| `cols` | `number \| null` | `null` | Número de colunas |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Controle de redimensionamento |
| `autocomplete` | `string` | `'off'` | Atributo autocomplete |
| `errorMessage` | `string` | `''` | Mensagem de erro |
| `helperText` | `string` | `''` | Texto de ajuda |
| `fullWidth` | `boolean` | `false` | Ocupar largura total |
| `width` | `string` | `'fit-content'` | Largura personalizada |

### Exemplo de Uso

```html
<!-- Textarea básico -->
<ds-textarea 
  label="Observações" 
  placeholder="Digite suas observações..."
  [rows]="4"
  [fullWidth]="true">
</ds-textarea>

<!-- Textarea com validação -->
<ds-textarea 
  label="Descrição" 
  placeholder="Descreva o produto..."
  formControlName="description"
  [required]="true"
  [invalid]="form.get('description')?.invalid"
  errorMessage="Descrição é obrigatória"
  helperText="Máximo de 500 caracteres"
  [maxlength]="500"
  resize="vertical">
</ds-textarea>

<!-- Textarea com ícone -->
<ds-textarea 
  label="Mensagem" 
  placeholder="Digite sua mensagem..."
  icon="fa-solid fa-message"
  iconPosition="left"
  [rows]="6">
</ds-textarea>
```

---

## Card (ds-card)

### Descrição
Componente de cartão flexível com diferentes variantes e tamanhos.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `title` | `string` | `undefined` | Título do card |
| `subtitle` | `string` | `undefined` | Subtítulo do card |
| `elevated` | `boolean` | `false` | Adiciona sombra elevada |
| `clickable` | `boolean` | `false` | Torna o card clicável |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do card |
| `variant` | `'default' \| 'outlined' \| 'filled'` | `'default'` | Variante visual |
| `borderRadius` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Raio da borda |

### Exemplo de Uso

```html
<!-- Card básico -->
<ds-card>
  <h2>Título do Card</h2>
  <p>Conteúdo do card...</p>
</ds-card>

<!-- Card com propriedades -->
<ds-card 
  title="Estatísticas" 
  subtitle="Dados do mês atual"
  [elevated]="true"
  size="lg"
  variant="outlined">
  
  <div class="stats-content">
    <div class="stat-item">
      <span class="stat-value">1,234</span>
      <span class="stat-label">Vendas</span>
    </div>
  </div>
</ds-card>

<!-- Card clicável -->
<ds-card 
  [clickable]="true"
  [elevated]="true"
  (click)="openDetails()">
  
  <h3>Card Clicável</h3>
  <p>Clique para ver detalhes</p>
</ds-card>

<!-- Card com footer -->
<ds-card title="Produto">
  <p>Descrição do produto...</p>
  
  <div slot="footer">
    <ds-button label="Ver Mais" variant="outline" />
    <ds-button label="Comprar" variant="fill" />
  </div>
</ds-card>
```

### Tamanhos Disponíveis
- `sm`: padding reduzido
- `md`: padding padrão ($spacing-md = 16px)
- `lg`: padding aumentado

### Variantes
- `default`: fundo branco, sem borda
- `outlined`: fundo branco, com borda
- `filled`: fundo com cor do tema

---

## File Upload (ds-file-upload)

### Descrição
Componente avançado para upload de arquivos com suporte a drag & drop, preview, validação e múltiplos arquivos.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `label` | `string` | `''` | Texto do label |
| `placeholder` | `string` | `'Clique para selecionar...'` | Texto placeholder |
| `helperText` | `string` | `'Apenas imagens são aceitas'` | Texto de ajuda |
| `multiple` | `boolean` | `false` | Permite múltiplos arquivos |
| `maxFileSize` | `number` | `5242880` | Tamanho máximo (5MB) |
| `acceptedTypes` | `string[]` | `['image/jpeg', 'image/jpg', 'image/png']` | Tipos aceitos |
| `disabled` | `boolean` | `false` | Campo desabilitado |
| `required` | `boolean` | `false` | Campo obrigatório |
| `fullWidth` | `boolean` | `false` | Ocupar largura total |
| `width` | `string` | `'fit-content'` | Largura personalizada |

### Interface UploadedFile

```typescript
interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}
```

### Eventos

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `filesChanged` | `EventEmitter<UploadedFile[]>` | Lista completa de arquivos mudou |
| `fileAdded` | `EventEmitter<UploadedFile>` | Arquivo adicionado |
| `fileRemoved` | `EventEmitter<UploadedFile>` | Arquivo removido |
| `uploadError` | `EventEmitter<string>` | Erro no upload |

### Exemplo de Uso

```html
<!-- Upload simples -->
<ds-file-upload 
  label="Foto de Perfil" 
  placeholder="Clique para selecionar uma imagem"
  helperText="Apenas JPG, JPEG, PNG até 5MB"
  (fileAdded)="onFileAdded($event)"
  (uploadError)="onUploadError($event)">
</ds-file-upload>

<!-- Upload múltiplo -->
<ds-file-upload 
  label="Galeria de Imagens" 
  placeholder="Clique ou arraste múltiplas imagens aqui"
  helperText="Múltiplas imagens (JPG, JPEG, PNG) de até 5MB cada"
  [multiple]="true"
  [fullWidth]="true"
  (filesChanged)="onMultipleFilesChanged($event)"
  (fileAdded)="onMultipleFileAdded($event)"
  (fileRemoved)="onMultipleFileRemoved($event)"
  (uploadError)="onUploadError($event)">
</ds-file-upload>

<!-- Upload com configurações customizadas -->
<ds-file-upload 
  label="Documentos" 
  placeholder="Selecione documentos PDF"
  helperText="Apenas arquivos PDF até 10MB"
  [acceptedTypes]="['application/pdf']"
  [maxFileSize]="10485760"
  [multiple]="true">
</ds-file-upload>
```

```typescript
// Component
export class ExampleComponent {
  uploadedFiles: UploadedFile[] = [];

  onFileAdded(file: UploadedFile) {
    console.log('Arquivo adicionado:', file);
  }

  onMultipleFilesChanged(files: UploadedFile[]) {
    this.uploadedFiles = files;
    console.log('Arquivos alterados:', files);
  }

  onMultipleFileRemoved(file: UploadedFile) {
    console.log('Arquivo removido:', file);
  }

  onUploadError(error: string) {
    console.error('Erro no upload:', error);
    // Mostrar mensagem de erro para o usuário
  }
}
```

### Recursos
- **Drag & Drop**: Arrastar arquivos para a área de upload
- **Preview**: Visualização prévia de imagens
- **Validação**: Tipo, tamanho e quantidade de arquivos
- **Progress**: Indicador visual durante processamento
- **Removal**: Remoção individual de arquivos
- **Responsive**: Adapta-se a diferentes tamanhos de tela

---

## Button (ds-button)

### Descrição
Componente de botão com diferentes variantes, ícones e estados de carregamento.

### Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `label` | `string` | `''` | Texto do botão |
| `variant` | `'fill' \| 'outline' \| 'ghost'` | `'fill'` | Variante visual |
| `icon` | `string` | `''` | Classe do ícone FontAwesome |
| `iconSize` | `string` | `''` | Tamanho do ícone |
| `fullWidth` | `boolean` | `false` | Ocupar largura total |
| `rounded` | `boolean` | `false` | Bordas totalmente arredondadas |
| `isLoading` | `boolean` | `false` | Estado de carregamento |
| `disabled` | `boolean` | `false` | Botão desabilitado |

### Eventos

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `onClickEmitter` | `EventEmitter<void>` | Emitido ao clicar no botão |

### Exemplo de Uso

```html
<!-- Botão básico -->
<ds-button label="Salvar"></ds-button>

<!-- Botão com ícone -->
<ds-button 
  label="Novo Cliente" 
  icon="fa-solid fa-circle-plus"
  variant="fill">
</ds-button>

<!-- Botão outline -->
<ds-button 
  label="Cancelar" 
  variant="outline"
  (onClickEmitter)="cancel()">
</ds-button>

<!-- Botão ghost (apenas ícone) -->
<ds-button 
  variant="ghost" 
  icon="fa-solid fa-edit"
  (onClickEmitter)="edit()">
</ds-button>

<!-- Botão com loading -->
<ds-button 
  label="Salvando..." 
  [isLoading]="isSaving"
  [disabled]="isSaving"
  (onClickEmitter)="save()">
</ds-button>

<!-- Botão full width -->
<ds-button 
  label="Continuar" 
  [fullWidth]="true"
  variant="fill">
</ds-button>

<!-- Botão arredondado -->
<ds-button 
  label="Premium" 
  [rounded]="true"
  variant="fill">
</ds-button>
```

### Variantes
- `fill`: fundo colorido (primário)
- `outline`: apenas borda colorida
- `ghost`: sem fundo, para ações secundárias

---

## Variáveis de Estilo

### Cores

#### SCSS Variables
```scss
// === CORES DO SISTEMA ===
$primary-dark: #013047;
$primary-medium: #015078;
$secondary: #0B495C;
$secondary-medium: #1593BB;
$background: #F8F8F8;
$stroke: #D8D8D8;
$label: #618495;
$placeholder: #61646B;
$tertiary: #F9792A;
```

#### CSS Custom Properties
```css
--primary-dark: #013047
--primary-medium: #015078
--secondary: #0B495C
--secondary-medium: #1593BB
--background: #F8F8F8
--stroke: #D8D8D8
--label: #618495
--placeholder: #61646B
--tertiary: #F9792A
--white: #FFFFFF
--background-hover: (derivada)
--background-medium: (derivada)
--tertiary-medium: (derivada)
--tertiary-fade: (derivada)
```

### Gradientes

```scss
// === GRADIENTES ===
$primary-gradient: linear-gradient(180deg, #013048 0%, #01517A 100%);
$secondary-gradient: linear-gradient(270deg, #1593BB 0%, #0B495C 100%);
```

### Espaçamentos

#### Variáveis SCSS
```scss
// === ESPAÇAMENTOS ===
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-xxl: 48px;

// === PADDING ESPECÍFICOS ===
$padding-xsm: 4px;
$padding-xs: 8px;
$padding-s: 12px;
$padding-ssm: 16px;
$padding-sm: 20px;
$padding-md: 24px;
$padding-bg: 32px;
$padding-xbg: 48px;
```

#### Classes Utilitárias
O sistema gera automaticamente classes para números pares de 2 a 48:

```css
/* Margin */
.m-2, .m-4, .m-6, ..., .m-48     /* todas as direções */
.mt-2, .mt-4, ..., .mt-48        /* margin-top */
.mb-2, .mb-4, ..., .mb-48        /* margin-bottom */
.ml-2, .ml-4, ..., .ml-48        /* margin-left */
.mr-2, .mr-4, ..., .mr-48        /* margin-right */
.mx-2, .mx-4, ..., .mx-48        /* horizontal */
.my-2, .my-4, ..., .my-48        /* vertical */

/* Padding */
.p-2, .p-4, .p-6, ..., .p-48     /* todas as direções */
.pt-2, .pt-4, ..., .pt-48        /* padding-top */
.pb-2, .pb-4, ..., .pb-48        /* padding-bottom */
.pl-2, .pl-4, ..., .pl-48        /* padding-left */
.pr-2, .pr-4, ..., .pr-48        /* padding-right */
.px-2, .px-4, ..., .px-48        /* horizontal */
.py-2, .py-4, ..., .py-48        /* vertical */
```

### Bordas e Raios

```scss
// === BORDAS E RAIOS ===
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-bg: 16px;
$border-radius-xb: 24px;
$border-radius-max: 99px;
```

### Tipografia

#### Variáveis de Fonte
```scss
// Font Family
$font-primary: 'Work Sans', sans-serif;

// Font Weights
$font-weight-light: 300;
$font-weight-md: 400;
$font-weight-bold: 500;
$font-weight-xbold: 600;

// Font Sizes
$font-xs: 12px;
$font-sm: 14px;
$font-md: 16px;
$font-lg: 18px;
$font-xl: 24px;
$font-xxl: 32px;
```

#### Mixins de Tipografia
```scss
@mixin menu-header() {
    font-family: $font-primary;
    font-weight: $font-weight-md; // 400
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: 0.1px;
}

@mixin title-page() {
    font-family: $font-primary;
    font-weight: $font-weight-xbold; // 600
    font-size: 26px;
    line-height: 24px;
    letter-spacing: 0.16px;
}

@mixin title-modal() {
    font-family: $font-primary;
    font-weight: $font-weight-bold; // 500
    font-size: $font-xl; // 24px
    line-height: 32px;
    letter-spacing: 0%;
}

@mixin header() {
    font-family: $font-primary;
    font-weight: $font-weight-bold; // 500
    font-size: $font-sm; // 14px
    line-height: 20px;
    letter-spacing: 0.4px;
}

@mixin body() {
    font-family: $font-primary;
    font-weight: $font-weight-bold; // 500
    font-size: $font-sm; // 14px
    line-height: 20px;
    letter-spacing: 0.4px;
}

@mixin input-label() {
    font-family: $font-primary;
    font-weight: $font-weight-bold; // 500
    font-size: $font-sm; // 14px
    line-height: 20px;
    letter-spacing: 0.4px;
}

@mixin placeholder() {
    font-family: $font-primary;
    font-weight: $font-weight-md; // 400
    font-size: $font-md; // 16px
    line-height: 24px;
    letter-spacing: 0px;
}

@mixin subheadline() {
    font-family: $font-primary;
    font-weight: $font-weight-md; // 400
    font-size: $font-md; // 16px
    line-height: 24px;
    letter-spacing: 0px;
}
```

#### Classes de Tipografia com Modificadores de Cor
```scss
.menu-header { @include menu-header(); }
.title-page { @include title-page(); }
.title-modal { @include title-modal(); }
.header { @include header(); }
.body { @include body(); }
.input-label { @include input-label(); }
.placeholder { @include placeholder(); }
.subheadline { @include subheadline(); }

// Modificadores de cor disponíveis para todas as classes:
.primary-dark { color: var(--primary-dark); }
.primary-medium { color: var(--primary-medium); }
.secondary { color: var(--secondary); }
.secondary-medium { color: var(--secondary-medium); }
.background { color: var(--background); }
.background-medium { color: var(--background-medium); }
.white { color: var(--white); }
.stroke { color: var(--stroke); }
.label { color: var(--label); }
.placeholder { color: var(--placeholder); }
.tertiary { color: var(--tertiary); }
.tertiary-medium { color: var(--tertiary-medium); }
.tertiary-fade { color: var(--tertiary-fade); }
```

---

## Padrões de Uso

### Importação de Variáveis
Em seus componentes SCSS, sempre importe as variáveis:

```scss
@use 'abstracts/variables' as *;
@use 'abstracts/spacing' as *;
@use 'abstracts/typography' as *;
```

### Exemplo de Uso em Componente

```scss
// Componente exemplo usando as variáveis do sistema
.my-component {
    background-color: $background;
    border: 1px solid $stroke;
    border-radius: $border-radius-md; // 12px
    padding: $spacing-md; // 16px
    margin-bottom: $spacing-lg; // 24px
    
    .title {
        @include title-page();
        color: var(--primary-dark);
        margin-bottom: $spacing-sm; // 8px
    }
    
    .content {
        @include body();
        color: var(--label);
        line-height: 1.5;
    }
    
    &:hover {
        background-color: var(--background-hover);
        box-shadow: 0 2px 8px rgba(1, 48, 71, 0.1);
    }
}
```

### Responsividade
Use as classes utilitárias para diferentes tamanhos:

```html
<div class="p-16 p-md-24 p-lg-32">
  <!-- padding responsivo -->
</div>

<ds-input [fullWidth]="true" class="mb-16">
  <!-- margin bottom usando classe utilitária -->
</ds-input>
```

### Combinações Recomendadas

#### Para Formulários
```html
<form class="p-24">
  <div class="mb-16">
    <ds-input 
      label="Nome" 
      [fullWidth]="true"
      [required]="true">
    </ds-input>
  </div>
  
  <div class="mb-24">
    <ds-select 
      label="Categoria"
      [fullWidth]="true"
      [options]="options">
    </ds-select>
  </div>
  
  <div class="mt-32">
    <ds-button 
      label="Salvar" 
      variant="fill"
      [fullWidth]="true">
    </ds-button>
  </div>
</form>
```

#### Para Cards
```html
<ds-card class="mb-24" [elevated]="true">
  <h2 class="title-modal primary-dark mb-16">Título</h2>
  <p class="body label mb-24">Conteúdo do card...</p>
  
  <div class="mt-auto">
    <ds-button label="Ação" variant="outline" />
  </div>
</ds-card>
```

#### Para Tabelas
```html
<div class="p-24">
  <h1 class="title-page primary-dark mb-32">Lista de Items</h1>
  
  <ds-table>
    <!-- conteúdo da tabela -->
  </ds-table>
</div>
```

---

## Boas Práticas

### 1. Sempre use variáveis do sistema
❌ **Não faça:**
```scss
.component {
    padding: 16px;
    color: #013047;
    border-radius: 8px;
}
```

✅ **Faça:**
```scss
.component {
    padding: $spacing-md;
    color: var(--primary-dark);
    border-radius: $border-radius-sm;
}
```

### 2. Use classes utilitárias para espaçamentos simples
❌ **Não faça:**
```scss
.my-element {
    margin-bottom: 24px;
}
```

✅ **Faça:**
```html
<div class="mb-24">Conteúdo</div>
```

### 3. Combine mixins de tipografia com modificadores
✅ **Faça:**
```html
<h1 class="title-page primary-dark">Título Principal</h1>
<p class="body label">Texto do corpo</p>
```

### 4. Use fullWidth consistentemente
✅ **Para formulários:**
```html
<ds-input [fullWidth]="true" label="Campo" />
<ds-select [fullWidth]="true" label="Seleção" />
<ds-textarea [fullWidth]="true" label="Texto" />
```

### 5. Mantenha hierarquia visual
✅ **Estrutura recomendada:**
```html
<div class="page-container p-24">
  <h1 class="title-page primary-dark mb-32">Página</h1>
  
  <section class="mb-48">
    <h2 class="title-modal secondary mb-24">Seção</h2>
    <p class="body label mb-16">Descrição...</p>
  </section>
</div>
```

---

## Troubleshooting

### Problema: Variáveis não encontradas
**Solução:** Certifique-se de importar os abstracts:
```scss
@use 'abstracts/variables' as *;
@use 'abstracts/spacing' as *;
```

### Problema: Classes utilitárias não funcionam
**Solução:** Verifique se o arquivo spacing está sendo importado no main.scss:
```scss
@use 'abstracts/spacing';
```

### Problema: Cores não aplicadas
**Solução:** Use as CSS custom properties em vez das variáveis SCSS:
```scss
// ✅ Correto
color: var(--primary-dark);

// ❌ Pode não funcionar em runtime
color: $primary-dark;
```

### Problema: Modal não aparece
**Solução:** Certifique-se de usar o ModalService:
```typescript
this.modalService.open({ id: 'meu-modal', /* config */ });
```

### Problema: Formulários não validam
**Solução:** Use as propriedades de validação:
```html
<ds-input 
  [invalid]="form.get('campo')?.invalid && form.get('campo')?.touched"
  errorMessage="Campo obrigatório" />
```