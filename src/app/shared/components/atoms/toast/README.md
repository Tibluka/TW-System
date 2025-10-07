# DS Toast Component

Componente de notificação toast para exibir mensagens temporárias na aplicação.

## Características

- ✅ 4 tipos de toast: success, error, warning, info
- ✅ Posicionamento fixo no topo direito da tela
- ✅ Auto-close configurável
- ✅ Ícone de fechar opcional
- ✅ Ícone personalizado opcional
- ✅ Animações suaves de entrada e saída
- ✅ Responsivo para mobile
- ✅ Suporte a dark mode

## Uso

### 1. Usando o ToastService (Recomendado)

```typescript
import { ToastService } from '../../../shared/services/toast/toast.service';

constructor(private toastService: ToastService) {}

// Toast de sucesso
this.toastService.success('Operação realizada com sucesso!');

// Toast de erro com título
this.toastService.error('Erro ao salvar', 'Falha na operação');

// Toast de aviso com opções
this.toastService.warning('Atenção', 'Verifique os dados', {
  duration: 10000,
  icon: 'fa-solid fa-exclamation-triangle'
});

// Toast de informação
this.toastService.info('Processando...', 'Aguarde um momento');
```

### 2. Usando o Container diretamente

```typescript
// Acessar o container global
const container = (window as any).toastContainer;

container.addToast({
  type: "success",
  title: "Sucesso",
  message: "Operação concluída!",
  duration: 5000,
  closable: true,
  icon: "fa-solid fa-check",
});
```

## Configuração

### ToastConfig Interface

```typescript
interface ToastConfig {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  icon?: string;
  duration?: number; // em milissegundos
  closable?: boolean;
}
```

### Durações Padrão

- **Success**: 5000ms (5 segundos)
- **Error**: 7000ms (7 segundos)
- **Warning**: 6000ms (6 segundos)
- **Info**: 5000ms (5 segundos)

## Estilos

Os estilos estão definidos em `src/styles/components/_toast.scss` e seguem o design system da aplicação.

### Cores por Tipo

- **Success**: Verde (#059669)
- **Error**: Vermelho (#dc2626)
- **Warning**: Amarelo (#d97706)
- **Info**: Azul (#2563eb)

## Responsividade

- **Desktop**: Posicionado no topo direito
- **Mobile**: Ocupa toda a largura com margens laterais
- **Tamanhos**: Adapta-se automaticamente ao conteúdo

## Acessibilidade

- Suporte a navegação por teclado
- ARIA labels apropriados
- Contraste adequado para leitura
- Foco visível nos elementos interativos
