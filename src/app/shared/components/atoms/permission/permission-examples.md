# Exemplos de Uso das Diretivas de Permissão

## 1. Diretiva `*appPermission`

### Uso básico - uma permissão

```html
<!-- Mostra o botão apenas para usuários que podem criar clientes -->
<button *appPermission="Permission.CREATE_CLIENTS" (click)="createClient()">Criar Cliente</button>
```

### Uso com múltiplas permissões (OR)

```html
<!-- Mostra o botão para usuários que podem ver OU editar clientes -->
<button *appPermission="[Permission.VIEW_CLIENTS, Permission.EDIT_CLIENTS]" (click)="editClient()">Editar Cliente</button>
```

### Uso em seções inteiras

```html
<!-- Mostra toda a seção apenas para usuários que podem ver recibos -->
<div *appPermission="Permission.VIEW_PRODUCTION_RECEIPTS">
  <h2>Recibos de Produção</h2>
  <app-production-receipt-list></app-production-receipt-list>
</div>
```

## 2. Diretiva `*appProfile`

### Uso básico - um perfil

```html
<!-- Mostra apenas para administradores -->
<div *appProfile="UserProfile.ADMIN">
  <h3>Configurações Administrativas</h3>
  <app-admin-panel></app-admin-panel>
</div>
```

### Uso com múltiplos perfis (OR)

```html
<!-- Mostra para admin ou financeiro -->
<div *appProfile="[UserProfile.ADMIN, UserProfile.FINANCIAL]">
  <h3>Relatórios Financeiros</h3>
  <app-financial-reports></app-financial-reports>
</div>
```

## 3. Diretiva `*appPermissionCheck`

### Verificações customizadas

```html
<!-- Mostra apenas para usuários que podem editar etapas de produção -->
<div *appPermissionCheck="'canEditProductionSheetStep'">
  <button (click)="editProductionStep()">Alterar Etapa</button>
</div>

<!-- Mostra apenas para usuários que podem editar valor de máquina -->
<div *appPermissionCheck="'canEditMachineValue'">
  <input type="number" [(ngModel)]="machineValue" placeholder="Valor da Máquina" />
</div>

<!-- Mostra apenas para administradores -->
<div *appPermissionCheck="'isAdmin'">
  <app-admin-controls></app-admin-controls>
</div>
```

## 4. Exemplos Práticos nos Componentes

### No componente de Clientes

```html
<div class="clients-container">
  <div class="header">
    <h1>Clientes</h1>

    <!-- Botão criar - apenas para quem pode criar -->
    <button *appPermission="Permission.CREATE_CLIENTS" class="btn btn-primary" (click)="openCreateModal()">
      <i class="fa-solid fa-plus"></i>
      Novo Cliente
    </button>
  </div>

  <div class="clients-list">
    <div *ngFor="let client of clients" class="client-card">
      <h3>{{ client.name }}</h3>
      <p>{{ client.email }}</p>

      <!-- Botões de ação baseados em permissões -->
      <div class="actions">
        <button *appPermission="Permission.VIEW_CLIENTS" (click)="viewClient(client)">Ver Detalhes</button>

        <button *appPermission="Permission.EDIT_CLIENTS" (click)="editClient(client)">Editar</button>

        <button *appPermission="Permission.DELETE_CLIENTS" class="btn-danger" (click)="deleteClient(client)">Excluir</button>
      </div>
    </div>
  </div>
</div>
```

### No componente de Fichas de Produção

```html
<div class="production-sheets-container">
  <div class="header">
    <h1>Fichas de Produção</h1>
  </div>

  <div class="sheet-details" *ngFor="let sheet of productionSheets">
    <h3>{{ sheet.title }}</h3>
    <p>Status: {{ sheet.status }}</p>

    <!-- Controles específicos para perfil PRINTING -->
    <div *appProfile="UserProfile.PRINTING" class="printing-controls">
      <!-- Só pode alterar etapa se ordem estiver em PILOT_PRODUCTION -->
      <div *appPermissionCheck="'canEditProductionSheetStep'" *ngIf="sheet.productionOrder.status === 'PILOT_PRODUCTION'">
        <label>Etapa:</label>
        <select [(ngModel)]="sheet.step" (change)="updateStep(sheet)">
          <option value="design">Design</option>
          <option value="printing">Impressão</option>
          <option value="finishing">Acabamento</option>
        </select>
      </div>

      <!-- Pode alterar valor de máquina -->
      <div *appPermissionCheck="'canEditMachineValue'">
        <label>Valor da Máquina:</label>
        <input type="number" [(ngModel)]="sheet.machineValue" (change)="updateMachineValue(sheet)" />
      </div>
    </div>

    <!-- Controles completos para outros perfis -->
    <div *appPermission="[Permission.EDIT_PRODUCTION_SHEETS, Permission.DELETE_PRODUCTION_SHEETS]">
      <button *appPermission="Permission.EDIT_PRODUCTION_SHEETS" (click)="editSheet(sheet)">Editar Ficha</button>

      <button *appPermission="Permission.DELETE_PRODUCTION_SHEETS" class="btn-danger" (click)="deleteSheet(sheet)">Excluir Ficha</button>
    </div>
  </div>
</div>
```

### No componente de Recibos (apenas FINANCIAL e ADMIN)

```html
<div class="production-receipts-container">
  <div class="header">
    <h1>Recibos de Produção</h1>

    <!-- Botão criar - apenas para perfis que podem criar recibos -->
    <button *appPermission="Permission.CREATE_PRODUCTION_RECEIPTS" class="btn btn-primary" (click)="createReceipt()">
      <i class="fa-solid fa-plus"></i>
      Novo Recibo
    </button>
  </div>

  <div class="receipts-list">
    <div *ngFor="let receipt of receipts" class="receipt-card">
      <h3>Recibo #{{ receipt.id }}</h3>
      <p>Valor: {{ receipt.value | currency:'BRL' }}</p>
      <p>Data: {{ receipt.date | date:'dd/MM/yyyy' }}</p>

      <div class="actions">
        <button *appPermission="Permission.VIEW_PRODUCTION_RECEIPTS" (click)="viewReceipt(receipt)">Ver Detalhes</button>

        <button *appPermission="Permission.EDIT_PRODUCTION_RECEIPTS" (click)="editReceipt(receipt)">Editar</button>

        <button *appPermission="Permission.DELETE_PRODUCTION_RECEIPTS" class="btn-danger" (click)="deleteReceipt(receipt)">Excluir</button>
      </div>
    </div>
  </div>
</div>
```

## 5. Importações Necessárias

Nos seus componentes TypeScript, você precisará importar:

```typescript
import { Permission, UserProfile } from "../../../models/permissions/permissions";
import { PermissionDirective, ProfileDirective, PermissionCheckDirective } from "../../../shared/components/atoms/permission/permission.directive";
```

E no template, certifique-se de que as diretivas estão disponíveis (se não estiverem sendo importadas globalmente).
