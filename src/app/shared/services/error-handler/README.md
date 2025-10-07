# 🛠️ Error Handler Service

Sistema completo para tratamento de erros do backend com mapeamento automático para português.

## 🎯 Funcionalidades

- **Mapeamento automático** de códigos de erro para mensagens em português
- **Interceptação HTTP** automática de erros
- **Toasts automáticos** baseados no tipo de erro
- **Fallback inteligente** para mensagens em inglês
- **Extensível** - fácil adicionar novos mapeamentos

## 📁 Estrutura

```
src/app/shared/
├── services/error-handler/
│   ├── error-handler.service.ts    # Serviço principal
│   └── README.md                   # Esta documentação
├── interceptors/
│   └── error-handler.interceptor.ts # Interceptor HTTP
└── utils/
    └── error-handler.util.ts       # Utilitários
```

## 🚀 Como Usar

### 1. **Uso Automático (Interceptor)**

O interceptor já está configurado e funciona automaticamente para todas as requisições HTTP:

```typescript
// Não precisa fazer nada - funciona automaticamente!
this.httpClient.get("/api/clients").subscribe({
  next: (data) => console.log(data),
  error: (error) => {
    // O interceptor já processou e mostrou o toast
    // Aqui você pode fazer tratamento adicional se necessário
  },
});
```

### 2. **Uso Manual em Componentes**

```typescript
import { ErrorHandlerService } from '../../../shared/services/error-handler/error-handler.service';
import { ErrorHandlerUtil } from '../../../shared/utils/error-handler.util';

@Component({...})
export class MyComponent {
  private errorHandlerService = inject(ErrorHandlerService);
  private toastService = inject(ToastService);

  // Método 1: Processar erro e mostrar toast automaticamente
  handleError(error: any) {
    ErrorHandlerUtil.handleError(
      error,
      this.errorHandlerService,
      this.toastService,
      'Contexto opcional'
    );
  }

  // Método 2: Apenas obter mensagem processada
  getErrorMessage(error: any): string {
    return ErrorHandlerUtil.getErrorMessage(error, this.errorHandlerService);
  }

  // Método 3: Obter detalhes completos do erro
  getErrorDetails(error: any) {
    return ErrorHandlerUtil.getErrorDetails(error, this.errorHandlerService);
  }
}
```

### 3. **Uso em Subscriptions RxJS**

```typescript
this.clientService
  .deleteClient(id)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: () => {
      this.toastService.success("Cliente excluído com sucesso!");
    },
    error: (error) => {
      ErrorHandlerUtil.handleSubscriptionError(error, this.errorHandlerService, this.toastService, "Exclusão de cliente");
    },
  });
```

## 🗺️ Mapeamentos Disponíveis

### **Desenvolvimentos**

- `DEVELOPMENT_NOT_APPROVED` → "O desenvolvimento deve ser aprovado para criar ordem de produção"
- `DEVELOPMENT_NOT_FOUND` → "Desenvolvimento não encontrado"
- `DEVELOPMENT_ALREADY_EXISTS` → "Já existe um desenvolvimento com esta referência"

### **Ordens de Produção**

- `PRODUCTION_ORDER_NOT_FOUND` → "Ordem de produção não encontrada"
- `PRODUCTION_ORDER_ALREADY_EXISTS` → "Já existe uma ordem de produção com esta referência"

### **Clientes**

- `CLIENT_NOT_FOUND` → "Cliente não encontrado"
- `CLIENT_ALREADY_EXISTS` → "Já existe um cliente com este CNPJ"
- `CLIENT_INVALID_CNPJ` → "CNPJ inválido"

### **Autenticação**

- `AUTH_INVALID_CREDENTIALS` → "Email ou senha incorretos"
- `AUTH_TOKEN_EXPIRED` → "Sessão expirada. Faça login novamente"
- `AUTH_UNAUTHORIZED` → "Você não tem permissão para realizar esta ação"

### **Sistema**

- `SYSTEM_MAINTENANCE` → "Sistema em manutenção. Tente novamente em alguns minutos"
- `SYSTEM_DATABASE_ERROR` → "Erro interno do servidor. Tente novamente mais tarde"

## 🔧 Adicionando Novos Mapeamentos

### **Via Código**

```typescript
// No seu componente ou serviço
this.errorHandlerService.addErrorMapping({
  code: "MEU_ERRO_CUSTOMIZADO",
  message: "Mensagem personalizada em português",
  title: "Título do erro",
  type: "warning", // 'error', 'warning', 'info'
});
```

### **Via Arquivo de Configuração**

Edite o arquivo `error-handler.service.ts` e adicione na array `errorMappings`:

```typescript
{
  code: 'NOVO_ERRO_CODE',
  message: 'Nova mensagem em português',
  title: 'Novo título',
  type: 'error'
}
```

## 🎨 Tipos de Toast

- **`error`** → Toast vermelho (erro)
- **`warning`** → Toast amarelo (aviso)
- **`info`** → Toast azul (informação)

## 🔄 Fallback Inteligente

Se o erro não tiver mapeamento por código, o sistema tenta mapear por mensagem em inglês:

```typescript
// Backend retorna: "Development must be approved to create production order"
// Sistema automaticamente mapeia para: "O desenvolvimento deve ser aprovado para criar ordem de produção"
```

## 📝 Exemplos de Uso

### **Exemplo 1: Tratamento Simples**

```typescript
// Antes (manual)
error: (error) => {
  this.toastService.error("Erro ao excluir cliente", "Erro", {
    message: error.message || "Não foi possível excluir o cliente.",
  });
};

// Depois (automático)
error: (error) => {
  ErrorHandlerUtil.handleSubscriptionError(error, this.errorHandlerService, this.toastService, "Exclusão de cliente");
};
```

### **Exemplo 2: Apenas Obter Mensagem**

```typescript
const errorMessage = ErrorHandlerUtil.getErrorMessage(error, this.errorHandlerService);
console.log("Mensagem processada:", errorMessage);
```

### **Exemplo 3: Detalhes Completos**

```typescript
const errorDetails = ErrorHandlerUtil.getErrorDetails(error, this.errorHandlerService);
console.log("Código:", errorDetails.code);
console.log("Mensagem:", errorDetails.message);
console.log("Título:", errorDetails.title);
console.log("Tipo:", errorDetails.type);
```

## ⚡ Benefícios

- **Consistência**: Todas as mensagens de erro em português
- **Manutenibilidade**: Centralizado em um local
- **Extensibilidade**: Fácil adicionar novos mapeamentos
- **Automação**: Funciona automaticamente via interceptor
- **Flexibilidade**: Pode ser usado manualmente quando necessário
- **Fallback**: Mapeia mensagens em inglês automaticamente

## 🚨 Importante

- O interceptor já está configurado globalmente
- Funciona automaticamente para todas as requisições HTTP
- Para desabilitar o interceptor, remova do `app.config.ts`
- Sempre teste novos mapeamentos antes de usar em produção
