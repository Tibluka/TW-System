# Badge Component

O componente `ds-badge` é usado para exibir status com cores automáticas baseadas no tipo de entidade e valor do status.

## Uso Básico

### Com Mapeamento Automático de Cores (Recomendado)

```html
<!-- Para Ordens de Produção -->
<ds-badge [text]="getStatusLabel(productionOrder.status)" [status]="productionOrder.status" entityType="production-order" />

<!-- Para Recebimentos -->
<ds-badge [text]="getReceiptStatusLabel(receipt.paymentStatus)" [status]="receipt.paymentStatus" entityType="production-receipt" />

<!-- Para Fichas de Produção -->
<ds-badge [text]="getStageLabel(sheet.stage)" [status]="sheet.stage" entityType="production-sheet" />

<!-- Para Desenvolvimentos -->
<ds-badge [text]="getDevelopmentStatusLabel(development.status)" [status]="development.status" entityType="development" />
```

### Com Cor Manual

```html
<ds-badge text="Status Personalizado" color="green" /> <ds-badge text="Outro Status" color="red" />
```

## Propriedades

| Propriedade  | Tipo         | Padrão      | Descrição                                            |
| ------------ | ------------ | ----------- | ---------------------------------------------------- |
| `text`       | `string`     | `''`        | Texto exibido no badge                               |
| `color`      | `BadgeColor` | `'gray'`    | Cor do badge (usado quando `status` não é fornecido) |
| `status`     | `string`     | `''`        | Status para mapeamento automático de cor             |
| `entityType` | `EntityType` | `undefined` | Tipo de entidade para mapeamento específico          |

## Cores Disponíveis

- `green` - Verde (Aprovado, Finalizado, Pago)
- `yellow` - Amarelo (Pendente, Aguardando, Enviado)
- `orange` - Laranja (Em Produção, Calandragem)
- `red` - Vermelho (Cancelado, Rejeitado)
- `blue` - Azul (Criado, Impressão)
- `purple` - Roxo (Produção Iniciada, Piloto)
- `gray` - Cinza (Padrão, Desconhecido)

## Mapeamento de Status

### Desenvolvimentos

- `CREATED` → Azul
- `AWAITING_APPROVAL` → Amarelo
- `APPROVED` → Verde
- `CANCELED` → Vermelho

### Ordens de Produção

- `CREATED` → Azul
- `PILOT_PRODUCTION` → Laranja
- `PILOT_SENT` → Amarelo
- `PILOT_APPROVED` → Verde
- `PRODUCTION_STARTED` → Roxo
- `FINALIZED` → Verde

### Fichas de Produção

- `PRINTING` → Azul
- `CALENDERING` → Laranja
- `FINISHED` → Verde

### Recebimentos

- `PENDING` → Amarelo
- `PAID` → Verde

## Detecção Automática

Se `entityType` não for fornecido, o sistema tentará detectar a cor automaticamente baseada no valor do status:

- Status contendo "CREATED" ou "NEW" → Azul
- Status contendo "PENDING", "WAITING" ou "AWAITING" → Amarelo
- Status contendo "APPROVED", "COMPLETED", "FINISHED" ou "PAID" → Verde
- Status contendo "CANCELED", "CANCELLED" ou "REJECTED" → Vermelho
- Status contendo "PRODUCTION", "PROCESSING" ou "PRINTING" → Laranja
- Status contendo "PILOT" ou "SENT" → Roxo
- Outros → Cinza

## Exemplos de Uso

```html
<!-- Detecção automática -->
<ds-badge [text]="status" [status]="status" />

<!-- Mapeamento específico -->
<ds-badge [text]="status" [status]="status" entityType="production-order" />

<!-- Cor manual -->
<ds-badge text="Custom Status" color="purple" />
```
