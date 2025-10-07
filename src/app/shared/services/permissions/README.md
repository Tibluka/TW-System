# Sistema de Permissões por Perfil de Usuário

Este sistema implementa controle de acesso baseado em perfis de usuário, permitindo que diferentes tipos de usuários vejam e acessem apenas as funcionalidades permitidas para seu perfil.

## Perfis de Usuário

### 1. **DEFAULT**

- **Acesso**: Todos os endpoints exceto relacionados a recibos
- **Funcionalidades**:
  - ✅ Clientes (visualizar, criar, editar, excluir)
  - ✅ Desenvolvimentos (visualizar, criar, editar, excluir)
  - ✅ Ordens de produção (visualizar, criar, editar, excluir)
  - ✅ Fichas de produção (visualizar, criar, editar, excluir)
  - ✅ Fichas de entrega (visualizar, criar, editar, excluir)
  - ❌ Recibos de produção

### 2. **PRINTING**

- **Acesso**: Apenas endpoints relacionados a fichas de produção
- **Funcionalidades**:
  - ✅ Fichas de produção (visualizar)
  - ✅ Alterar etapa (apenas quando ordem de produção estiver com status `PILOT_PRODUCTION`)
  - ✅ Alterar valor de máquina
  - ❌ Todas as outras funcionalidades

### 3. **ADMIN**

- **Acesso**: Sem restrições
- **Funcionalidades**:
  - ✅ Todas as funcionalidades do sistema
  - ✅ Acesso completo a todos os módulos

### 4. **FINANCIAL**

- **Acesso**: Endpoints relacionados a recibos e clientes
- **Funcionalidades**:
  - ✅ Clientes (visualizar, criar, editar, excluir)
  - ✅ Recibos de produção (visualizar, criar, editar, excluir)
  - ❌ Todas as outras funcionalidades

## Como Usar

### 1. **Proteção de Rotas**

As rotas já estão protegidas automaticamente. Cada rota verifica se o usuário tem a permissão necessária:

```typescript
// Exemplo de rota protegida
{
  path: 'clients',
  component: ClientsComponent,
  canActivate: [permissionsGuard(Permission.VIEW_CLIENTS)]
}
```

### 2. **Filtragem Automática do Menu**

O menu é filtrado automaticamente baseado nas permissões do usuário. Usuários só veem as opções de menu para as quais têm permissão.

### 3. **Ocultação de Elementos no Template**

Use as diretivas para ocultar elementos baseado em permissões:

```html
<!-- Mostra apenas para usuários que podem criar clientes -->
<button *appPermission="Permission.CREATE_CLIENTS" (click)="createClient()">Criar Cliente</button>

<!-- Mostra apenas para administradores -->
<div *appProfile="UserProfile.ADMIN">
  <app-admin-panel></app-admin-panel>
</div>

<!-- Mostra apenas para usuários que podem editar etapas -->
<div *appPermissionCheck="'canEditProductionSheetStep'">
  <button (click)="editStep()">Alterar Etapa</button>
</div>
```

### 4. **Verificações Programáticas**

No código TypeScript, você pode verificar permissões:

```typescript
import { PermissionsService } from './shared/services/permissions/permissions.service';

constructor(private permissionsService: PermissionsService) {}

canEditClient(): boolean {
  return this.permissionsService.hasPermission(Permission.EDIT_CLIENTS);
}

isAdmin(): boolean {
  return this.permissionsService.isAdmin();
}
```

## Estrutura de Arquivos

```
src/app/
├── models/permissions/
│   └── permissions.ts                    # Enums e mapeamentos de permissões
├── shared/
│   ├── services/
│   │   ├── permissions/
│   │   │   ├── permissions.service.ts    # Serviço principal de permissões
│   │   │   └── README.md                 # Este arquivo
│   │   └── guards/
│   │       └── permissions.guard.ts      # Guards para proteção de rotas
│   └── components/atoms/permission/
│       ├── permission.directive.ts       # Diretivas para templates
│       ├── permission-examples.md        # Exemplos de uso
│       └── index.ts                      # Exportações
```

## Fluxo de Funcionamento

1. **Login**: Usuário faz login e o `AuthService` armazena os dados do usuário
2. **Inicialização**: `PermissionsService` lê o perfil do usuário e carrega as permissões
3. **Menu**: `MenuService` filtra os itens baseado nas permissões
4. **Rotas**: Guards verificam permissões antes de permitir acesso
5. **Templates**: Diretivas ocultam elementos baseado em permissões

## Adicionando Novas Permissões

Para adicionar uma nova permissão:

1. **Adicione no enum `Permission`**:

```typescript
export enum Permission {
  // ... permissões existentes
  NEW_FEATURE_ACCESS = "NEW_FEATURE_ACCESS",
}
```

2. **Atualize o mapeamento `PROFILE_PERMISSIONS`**:

```typescript
export const PROFILE_PERMISSIONS: Record<UserProfile, Permission[]> = {
  [UserProfile.ADMIN]: [
    // ... permissões existentes
    Permission.NEW_FEATURE_ACCESS,
  ],
  // ... outros perfis
};
```

3. **Use a nova permissão**:

```html
<div *appPermission="Permission.NEW_FEATURE_ACCESS">
  <!-- Conteúdo da nova funcionalidade -->
</div>
```

## Regras Especiais

### Perfil PRINTING - Alteração de Etapa

Para o perfil PRINTING, a alteração de etapa só é permitida quando a ordem de produção relacionada estiver com status `PILOT_PRODUCTION`. Esta verificação deve ser feita no componente:

```typescript
canEditStep(productionOrder: any): boolean {
  return this.permissionsService.canEditProductionSheetStep() &&
         productionOrder.status === 'PILOT_PRODUCTION';
}
```

```html
<div *ngIf="canEditStep(sheet.productionOrder)">
  <button (click)="editStep()">Alterar Etapa</button>
</div>
```

## Troubleshooting

### Menu não está sendo filtrado

- Verifique se o `PermissionsService` está sendo injetado no `MenuService`
- Confirme se o usuário tem um perfil válido definido

### Rotas não estão sendo protegidas

- Verifique se os guards estão importados no `app.routes.ts`
- Confirme se as permissões estão corretamente mapeadas em `ROUTE_PERMISSIONS`

### Diretivas não funcionam

- Verifique se as diretivas estão importadas no componente
- Confirme se o `PermissionsService` está sendo injetado corretamente

### Permissões não são carregadas

- Verifique se o `AuthService` está retornando o usuário com o campo `role` correto
- Confirme se o mapeamento de role para perfil está funcionando em `mapRoleToProfile()`
