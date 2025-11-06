# 🍕 Pizza Delivery - Frontend Moderno

Frontend moderno e interativo para sistema de delivery de pizza com **sistema de promoções inteligente** e comparação automática de preços.

## ✨ Características Principais

### 🎯 Sistema de Promoções Avançado

- **Comparação automática de preços**: Compara preço direto vs. reconstruído (soma dos componentes)
- **Múltiplos tipos de promoção**:
  - Promoções por dia da semana (ex: Segunda da Calabresa)
  - Promoções por horário (Happy Hour)
  - Cupons de desconto
  - Promoções de quantidade (Leve 3 pague 2)
  - Promoções por categoria
- **Engine de promoções**: Calcula e aplica automaticamente a melhor oferta
- **Transparência total**: Mostra ao cliente quanto ele está economizando

### 🎨 Interface Moderna

- **Design responsivo**: Funciona perfeitamente em mobile, tablet e desktop
- **Animações fluidas**: Transições suaves com Framer Motion
- **UX otimizada**: Interface intuitiva e de alta conversão
- **Feedback visual**: Badges, toasts e indicadores de progresso

### 🛒 Funcionalidades

1. **Catálogo de Produtos**
   - Filtros por categoria
   - Busca em tempo real
   - Cards animados
   - Badges de promoção

2. **Customização de Produtos**
   - Seleção de tamanhos (broto, média, grande, gigante)
   - Escolha de múltiplos sabores
   - Adicionais (bordas, extras)
   - Observações personalizadas

3. **Carrinho Inteligente**
   - Visualização clara dos itens
   - Ajuste de quantidades
   - Aplicação de cupons
   - Cálculo automático de promoções

4. **Checkout Completo**
   - Formulário de dados pessoais
   - Endereço de entrega
   - Múltiplas formas de pagamento
   - Resumo detalhado do pedido

5. **Pagamento PIX**
   - Geração automática de QR Code
   - Código PIX copia e cola
   - Instruções claras de pagamento

6. **Acompanhamento de Pedido**
   - Timeline visual do status
   - Atualizações em tempo real
   - Histórico completo
   - Informações detalhadas

## 🚀 Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Estilização utility-first
- **Framer Motion** - Animações
- **Zustand** - Gerenciamento de estado
- **React Router** - Navegação
- **QRCode** - Geração de QR Codes
- **React Hot Toast** - Notificações

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📁 Estrutura de Arquivos

```
delivery/
├── public/
│   └── data/
│       ├── products.json      # Catálogo de produtos
│       └── promotions.json    # Configuração de promoções
├── src/
│   ├── components/
│   │   ├── catalog/           # Componentes do catálogo
│   │   ├── checkout/          # Componentes do checkout
│   │   ├── payment/           # Componentes de pagamento
│   │   ├── product/           # Componentes de produto
│   │   └── ui/                # Componentes base (Button, Modal, etc)
│   ├── hooks/                 # Hooks customizados
│   ├── lib/                   # Utilitários e helpers
│   │   ├── promotionEngine.ts # Engine de promoções
│   │   └── utils.ts           # Funções utilitárias
│   ├── pages/                 # Páginas principais
│   │   ├── Catalog.tsx
│   │   ├── Checkout.tsx
│   │   ├── MyOrders.tsx
│   │   └── OrderTracking.tsx
│   ├── store/                 # Stores Zustand
│   │   ├── useCartStore.ts
│   │   ├── useOrderStore.ts
│   │   ├── useProductStore.ts
│   │   └── usePromotionStore.ts
│   ├── types/                 # Tipos TypeScript
│   │   ├── order.ts
│   │   ├── product.ts
│   │   └── promotion.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 Como Funciona o Sistema de Promoções

### 1. Configuração de Promoções (`promotions.json`)

```json
{
  "promotions": [
    {
      "id": "promo-combo-cheaper",
      "name": "Melhor Preço Garantido",
      "type": "price_compare",
      "comparison": {
        "modes": ["directPrice", "reconstructedPrice"],
        "rule": "chooseLowest"
      }
    }
  ]
}
```

### 2. Engine de Promoções

A `PromotionEngine` é responsável por:

- **Avaliar aplicabilidade**: Verifica se a promoção se aplica ao contexto atual
- **Calcular descontos**: Processa diferentes tipos de desconto (%, fixo, item grátis)
- **Comparar preços**: Compara preço direto vs. reconstruído para combos
- **Escolher melhor oferta**: Seleciona a combinação que gera maior economia

### 3. Fluxo de Aplicação

1. Cliente adiciona produtos ao carrinho
2. Engine carrega promoções ativas
3. Para cada item:
   - Avalia todas as promoções aplicáveis
   - Calcula o desconto de cada uma
   - Escolhe a melhor (maior economia)
4. Mostra economia total ao cliente
5. Aplica descontos no checkout

## 🎨 Customização

### Adicionar Novos Produtos

Edite `public/data/products.json`:

```json
{
  "id": "pizza-margherita",
  "type": "pizza",
  "name": "Pizza Margherita",
  "basePrices": {
    "broto": 22.90,
    "media": 35.90,
    "grande": 52.90
  },
  "flavors": ["Margherita"],
  "category": "pizzas",
  "available": true
}
```

### Criar Nova Promoção

Edite `public/data/promotions.json`:

```json
{
  "id": "black-friday",
  "name": "Black Friday - 50% OFF",
  "type": "time_based",
  "enabled": true,
  "applyOrder": 1,
  "discount": {
    "kind": "percentage",
    "value": 50
  },
  "validFrom": "2025-11-24T00:00:00",
  "validUntil": "2025-11-25T23:59:59"
}
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: Este é um projeto frontend de demonstração. Em produção:

1. **Validação no Backend**: Nunca confie apenas no cálculo do cliente
2. **API de Pagamento Real**: Integre com Mercado Pago, PagSeguro, etc.
3. **Autenticação**: Implemente login seguro
4. **Validação de Cupons**: Verifique no servidor
5. **Rate Limiting**: Proteja contra abuso

## 📱 PWA (Progressive Web App)

O projeto está configurado como PWA e pode ser instalado em dispositivos móveis:

- ✅ Service Worker registrado
- ✅ Manifest configurado
- ✅ Ícones em múltiplas resoluções
- ✅ Cache de assets estáticos
- ✅ Funciona offline (parcialmente)

## ♿ Acessibilidade

- ✅ Foco visível em elementos interativos
- ✅ Labels ARIA apropriadas
- ✅ Contraste de cores adequado
- ✅ Navegação por teclado
- ✅ Textos alternativos em imagens

## 🎯 Performance

- ⚡ Lazy loading de imagens
- ⚡ Code splitting automático (Vite)
- ⚡ Otimização de bundle
- ⚡ Debounce em buscas
- ⚡ Memoization de cálculos complexos

## 📊 Analytics (Sugestão de Implementação)

Para rastrear conversões e comportamento do usuário:

```typescript
// Eventos sugeridos
- product_view: Visualização de produto
- add_to_cart: Adicionar ao carrinho
- remove_from_cart: Remover do carrinho
- apply_coupon: Aplicar cupom
- checkout_start: Iniciar checkout
- order_complete: Pedido finalizado
- promotion_applied: Promoção aplicada
```

## 🧪 Testes (A Implementar)

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e
```

## 🚀 Deploy

### Vercel / Netlify

```bash
npm run build
# Fazer upload da pasta 'dist'
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📝 Licença

MIT License - Sinta-se livre para usar este projeto!

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📧 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ e 🍕**

