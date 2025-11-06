# 🚀 Guia de Início Rápido

## Instalação e Execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Executar em modo desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### 3. Build para produção

```bash
npm run build
npm run preview
```

## 📝 Primeiros Passos

### 1. Personalizar Produtos

Edite o arquivo `public/data/products.json` para adicionar suas pizzas:

```json
{
  "id": "pizza-sua-pizza",
  "type": "pizza",
  "name": "Sua Pizza Especial",
  "description": "Descrição deliciosa",
  "images": ["/images/pizzas/sua-pizza.jpg"],
  "basePrices": {
    "broto": 25.90,
    "media": 40.90,
    "grande": 60.90
  },
  "flavors": ["Seu Sabor"],
  "maxFlavors": 1,
  "category": "pizzas",
  "tags": ["nova"],
  "available": true
}
```

### 2. Configurar Promoções

Edite `public/data/promotions.json`:

```json
{
  "id": "sua-promo",
  "name": "Sua Promoção",
  "type": "time_based",
  "enabled": true,
  "applyOrder": 10,
  "conditions": {
    "dayOfWeek": [1, 3, 5]
  },
  "discount": {
    "kind": "percentage",
    "value": 20
  },
  "stackable": false
}
```

### 3. Adicionar Imagens

Coloque suas imagens em:
- `public/images/pizzas/` - Imagens de pizzas
- `public/images/bebidas/` - Imagens de bebidas
- `public/images/sobremesas/` - Imagens de sobremesas
- `public/images/combos/` - Imagens de combos

## 🎨 Customização de Cores

Edite `tailwind.config.js` para mudar as cores principais:

```js
colors: {
  primary: {
    500: '#sua-cor',
    600: '#sua-cor-escura',
    // ...
  }
}
```

## 🔧 Configurações Importantes

### Taxa de Entrega

Edite em `src/hooks/useCart.ts`:

```typescript
const deliveryFee = 5.00; // Altere aqui
```

### Informações PIX

Para integração real de PIX, edite `src/lib/utils.ts` na função `generatePixCode()` e integre com seu provedor de pagamento (Mercado Pago, PagSeguro, etc).

## 📱 Testar PWA

1. Build do projeto: `npm run build`
2. Servir em HTTPS (PWA requer HTTPS)
3. Abrir no mobile
4. Clicar em "Adicionar à tela inicial"

## 🚀 Deploy Rápido

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 📊 Próximos Passos

1. ✅ Adicionar suas imagens de produtos
2. ✅ Configurar suas promoções
3. ✅ Customizar cores e branding
4. ✅ Integrar com API de pagamento real
5. ✅ Adicionar backend para persistência
6. ✅ Configurar analytics
7. ✅ Adicionar autenticação de usuário

## 🆘 Problemas Comuns

### Erro ao carregar produtos
- Verifique se `public/data/products.json` existe
- Valide o JSON em um validador online

### Promoções não aparecem
- Verifique `enabled: true`
- Confirme que as datas são válidas
- Veja o console para erros

### Imagens não carregam
- Certifique-se que os caminhos em `images` são corretos
- Coloque as imagens na pasta `public/`

## 💡 Dicas

1. Use imagens otimizadas (WebP, <200KB)
2. Teste em diferentes dispositivos
3. Configure variáveis de ambiente para API keys
4. Use o modo desenvolvimento para debug

## 📚 Documentação Completa

Veja `README.md` para documentação completa.

---

**Boas vendas! 🍕**

