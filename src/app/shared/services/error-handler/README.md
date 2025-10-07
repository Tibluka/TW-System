# Sistema de Códigos de Erro Padronizados

Este sistema implementa códigos de erro padronizados para toda a aplicação, garantindo consistência entre frontend e backend.

## 📋 Estrutura dos Códigos

### Formato: `[Categoria][Subcategoria][Sequencial]`

- **Categoria**: 1=Validação, 2=Negócio, 3=Autenticação, 4=Autorização, 5=Recurso, 6=Sistema
- **Subcategoria**: Específica para cada tipo de erro
- **Sequencial**: Número sequencial para cada erro

### Exemplos:

- `1001` = Validação - Erro geral
- `2001` = Negócio - Desenvolvimento não aprovado
- `3002` = Autenticação - Credenciais inválidas
- `4005` = Autorização - Acesso negado por perfil
- `5001` = Recurso - Usuário não encontrado
- `6005` = Sistema - Erro interno do servidor

## 🎯 Categorias de Erro

### 1. **VALIDAÇÃO (1xxx)**

Erros relacionados a dados inválidos ou malformados.

```typescript
VALIDATION_ERROR: 1001,
INVALID_DATA: 1002,
MISSING_REQUIRED_FIELD: 1003,
INVALID_EMAIL_FORMAT: 1004,
INVALID_PASSWORD_FORMAT: 1005,
// ... mais códigos
```

### 2. **NEGÓCIO (2xxx)**

Erros relacionados a regras de negócio e lógica da aplicação.

```typescript
DEVELOPMENT_NOT_APPROVED: 2001,
PRODUCTION_ORDER_ALREADY_EXISTS: 2002,
INSUFFICIENT_PERMISSIONS: 2005,
BUSINESS_RULE_VIOLATION: 2007,
// ... mais códigos
```

### 3. **AUTENTICAÇÃO (3xxx)**

Erros relacionados ao processo de login e tokens.

```typescript
AUTHENTICATION_REQUIRED: 3001,
INVALID_CREDENTIALS: 3002,
TOKEN_EXPIRED: 3003,
ACCOUNT_DISABLED: 3005,
// ... mais códigos
```

### 4. **AUTORIZAÇÃO (4xxx)**

Erros relacionados a permissões e acesso a recursos.

```typescript
INSUFFICIENT_PERMISSIONS_AUTH: 4001,
ADMIN_REQUIRED: 4003,
PROFILE_ACCESS_DENIED: 4005,
PRINTING_RESTRICTION_VIOLATION: 4006,
// ... mais códigos
```

### 5. **RECURSOS (5xxx)**

Erros relacionados a recursos não encontrados.

```typescript
USER_NOT_FOUND: 5001,
CLIENT_NOT_FOUND: 5002,
DEVELOPMENT_NOT_FOUND: 5003,
// ... mais códigos
```

### 6. **SISTEMA (6xxx)**

Erros relacionados a problemas técnicos e infraestrutura.

```typescript
DATABASE_ERROR: 6001,
EXTERNAL_SERVICE_ERROR: 6002,
INTERNAL_SERVER_ERROR: 6005,
RATE_LIMIT_EXCEEDED: 6010,
// ... mais códigos
```

## 🔧 Como Usar

### 1. **No Backend (API)**

```javascript
// Lançar erro com código específico
throw new AppError("Development must be approved to create production order", 2001);

// Ou usar o mapeamento automático
const errorCode = getErrorCode("User not found");
throw new AppError("User not found", errorCode);
```

### 2. **No Frontend (Angular)**

```typescript
import { ErrorHandlerService } from "./shared/services/error-handler/error-handler.service";

// O interceptor processa automaticamente
// Mas você pode processar manualmente se necessário
const processedError = this.errorHandlerService.processError(error);
console.log(processedError.message); // Mensagem em português
console.log(processedError.type); // 'error', 'warning', 'info'
```

### 3. **Verificações de Tipo**

```typescript
// Verificar categoria do erro
if (this.errorHandlerService.isValidationError(errorCode)) {
  // Tratar erro de validação
}

if (this.errorHandlerService.isBusinessError(errorCode)) {
  // Tratar erro de negócio
}

// Obter categoria
const category = this.errorHandlerService.getErrorCategory(errorCode);
console.log(category); // "Validação", "Negócio", etc.
```

## 📝 Mensagens de Erro

### Estrutura das Mensagens

Cada código de erro tem uma mensagem padronizada com:

```typescript
{
  message: string,    // Mensagem detalhada para o usuário
  title: string,      // Título curto para toasts/notificações
  type: 'error' | 'warning' | 'info'  // Tipo para styling
}
```

### Interpolação de Variáveis

As mensagens suportam placeholders que são substituídos automaticamente:

```typescript
// Mensagem: "O texto deve ter entre {min} e {max} caracteres."
// Detalhes: { min: 5, max: 100 }
// Resultado: "O texto deve ter entre 5 e 100 caracteres."
```

## 🎨 Tipos de Erro

### **Error** (Vermelho)

- Erros críticos que impedem a operação
- Problemas de sistema, autenticação, autorização
- Recursos não encontrados

### **Warning** (Amarelo)

- Problemas que podem ser corrigidos pelo usuário
- Erros de validação
- Regras de negócio violadas

### **Info** (Azul)

- Informações importantes mas não críticas
- Confirmações de operações
- Dicas para o usuário

## 🔄 Mapeamento Automático

O sistema mapeia automaticamente:

1. **Por código numérico** (prioridade alta)
2. **Por mensagem exata** (prioridade média)
3. **Por palavras-chave** (prioridade baixa)
4. **Fallback** para erro genérico

### Exemplo de Mapeamento

```typescript
// Backend retorna:
{
  code: 2001,
  message: "Development must be approved to create production order"
}

// Frontend processa e retorna:
{
  code: 2001,
  message: "O desenvolvimento deve estar aprovado para criar uma ordem de produção.",
  title: "Desenvolvimento Não Aprovado",
  type: "warning"
}
```

## 🚀 Benefícios

### **Consistência**

- Códigos padronizados entre frontend e backend
- Mensagens uniformes em toda a aplicação

### **Manutenibilidade**

- Fácil adição de novos códigos de erro
- Centralização de todas as mensagens

### **Experiência do Usuário**

- Mensagens claras e em português
- Diferenciação visual por tipo de erro

### **Debugging**

- Códigos numéricos facilitam identificação
- Logs mais organizados e informativos

## 📋 Adicionando Novos Códigos

### 1. **Adicionar no Backend**

```javascript
// Adicionar no ERROR_CODES
NEW_BUSINESS_RULE: 2013,

// Adicionar no mapeamento de mensagens
'New business rule violation': ERROR_CODES.NEW_BUSINESS_RULE,
```

### 2. **Adicionar no Frontend**

```typescript
// Adicionar no ERROR_CODES
NEW_BUSINESS_RULE: 2013,

// Adicionar no ERROR_MESSAGES
[ERROR_CODES.NEW_BUSINESS_RULE]: {
  message: 'Nova regra de negócio violada.',
  title: 'Regra de Negócio',
  type: 'warning'
}
```

## 🔍 Debugging

### Logs Automáticos

O sistema gera logs automáticos para facilitar o debugging:

```
🔍 Processando erro: {code: 2001, message: "..."}
📝 Código do erro: 2001
📝 Mensagem original: Development must be approved...
✅ Mensagem tratada encontrada: {message: "...", type: "warning"}
```

### Verificação de Códigos

```typescript
// Verificar se código existe
const mapping = this.errorHandlerService.getMappingByCode(2001);
if (mapping) {
  console.log("Código válido:", mapping);
} else {
  console.log("Código não encontrado");
}
```

## 📚 Exemplos Práticos

### Erro de Validação

```typescript
// Backend: code: 1004, message: "Invalid email format"
// Frontend: "O formato do email é inválido. Verifique se o email está correto."
// Tipo: warning (amarelo)
```

### Erro de Negócio

```typescript
// Backend: code: 2001, message: "Development must be approved..."
// Frontend: "O desenvolvimento deve estar aprovado para criar uma ordem de produção."
// Tipo: warning (amarelo)
```

### Erro de Sistema

```typescript
// Backend: code: 6005, message: "Internal server error"
// Frontend: "Erro interno do servidor. Tente novamente mais tarde."
// Tipo: error (vermelho)
```

Este sistema garante que todos os erros sejam tratados de forma consistente e amigável para o usuário! 🎯
