# 🎨 Dicas de Customização

## 📝 Como Personalizar Sua Pizzaria

### 1. Informações da Loja

**Arquivo:** `src/pages/Catalog.tsx`

```tsx
<Header 
  storeName="Sua Pizzaria"           // ← Nome da pizzaria
  address="Sua Cidade - UF"          // ← Endereço
  phone="(XX) XXXXX-XXXX"           // ← Telefone/WhatsApp
  isOpen={true}                     // ← true/false
  openingTime="Abrimos às 18h00"   // ← Horário de abertura
/>
```

### 2. Logo da Pizzaria

**Opção 1: Emoji (Atual)**
```tsx
// src/components/layout/Header.tsx - linha ~25
<span className="text-2xl">🍕</span>
```

**Opção 2: Imagem**
```tsx
<img 
  src="/logo.png" 
  alt="Logo" 
  className="w-full h-full object-cover rounded-full"
/>
```

**Opção 3: Texto**
```tsx
<span className="text-xl font-bold text-white">PP</span>
```

### 3. Horário de Funcionamento Automático

```tsx
// src/pages/Catalog.tsx
const isOpen = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
  
  // Exemplo: Segunda a Sábado 18h-23h, Domingo 18h-22h
  if (day === 0) return hour >= 18 && hour < 22;
  return hour >= 18 && hour < 23;
};

<Header 
  isOpen={isOpen()}
  openingTime={isOpen() ? "" : "Abrimos às 18h00"}
/>
```

### 4. Produtos Sugeridos (Order Bumps)

**Arquivo:** `src/components/checkout/CartWithOrderBumps.tsx`

```tsx
// Linha ~15 - Mudar categoria sugerida
const suggestedProducts = products.filter(p => 
  p.category === 'bebidas'  // Opções: bebidas, sobremesas, combos
).slice(0, 3);

// Ou sugestão inteligente baseada no carrinho:
const getSuggestions = () => {
  const hasPizza = items.some(i => i.product.type === 'pizza');
  const hasBebida = items.some(i => i.product.category === 'bebidas');
  
  if (hasPizza && !hasBebida) {
    return products.filter(p => p.category === 'bebidas').slice(0, 3);
  }
  return products.filter(p => p.category === 'sobremesas').slice(0, 3);
};
```

### 5. Tamanho do Grid de Sugestões

```tsx
// 2 produtos
<div className="grid grid-cols-2 gap-3">

// 3 produtos (atual)
<div className="grid grid-cols-3 gap-3">

// 4 produtos
<div className="grid grid-cols-4 gap-3">

// Responsivo: 2 no mobile, 3 no tablet, 4 no desktop
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
```

### 6. Preço da Taxa de Entrega

**Arquivo:** `src/hooks/useCart.ts` - linha ~31

```tsx
const deliveryFee = 5.00; // ← Altere aqui

// Ou dinâmico por região:
const getDeliveryFee = (address: string) => {
  if (address.includes('Centro')) return 3.00;
  if (address.includes('Zona Sul')) return 5.00;
  if (address.includes('Zona Norte')) return 7.00;
  return 10.00; // Padrão
};
```

### 7. Valores de Borda

**Arquivo:** `src/components/product/ProductModalWithSelects.tsx` - linha ~90

```tsx
if (selectedBorder === 'catupiry') price += 6.00;    // ← R$ 6,00
if (selectedBorder === 'cheddar') price += 6.00;     // ← R$ 6,00
if (selectedBorder === 'cheddar-chocolate-preto') price += 8.00; // ← R$ 8,00
```

### 8. Opções de Borda

**Mesmo arquivo** - linha ~170

```tsx
<select>
  <option value="sem-borda">SEM BORDA</option>
  <option value="catupiry">Borda de Catupiry + R$ 6,00</option>
  <option value="cheddar">Borda de Cheddar + R$ 6,00</option>
  {/* Adicione mais opções aqui */}
  <option value="doce-de-leite">Borda de Doce de Leite + R$ 7,00</option>
</select>

// E adicione no cálculo:
if (selectedBorder === 'doce-de-leite') price += 7.00;
```

### 9. Quantidade de Molho Extra

**Arquivo:** `src/components/product/ProductModalWithSelects.tsx` - linha ~215

```tsx
<label>
  Deseja molho extra? (vai com 4 unidades) {/* ← Mude quantidade */}
</label>

// E o preço linha ~95:
if (wantsExtraSauce) price += 3.00; // ← R$ 3,00
```

### 10. Cores do Tema

**Arquivo:** `tailwind.config.js`

```js
colors: {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // ← Cor principal
    600: '#dc2626',  // ← Cor escura
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
}

// Exemplo para mudar para azul:
primary: {
  500: '#3b82f6',
  600: '#2563eb',
  // ...
}
```

### 11. Número Máximo de Sabores

**Arquivo:** `public/data/products.json`

```json
{
  "id": "pizza-especial-2sabores",
  "maxFlavors": 2  // ← Mude para 3, 4, etc
}
```

### 12. WhatsApp Button Fixo

**Adicione no:** `src/components/layout/Header.tsx`

```tsx
{/* Botão WhatsApp Fixo */}
<a 
  href="https://wa.me/5521999999999?text=Olá, gostaria de fazer um pedido"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50"
>
  <Phone size={24} />
</a>
```

### 13. Mensagem Personalizada de Fechado

**Arquivo:** `src/components/checkout/CartWithOrderBumps.tsx` - linha ~120

```tsx
<p className="text-center text-xs text-gray-500 mt-2">
  Abrimos às 18h00 {/* ← Personalize */}
</p>

// Ou dinâmico:
<p className="text-center text-xs text-gray-500 mt-2">
  {isWeekend() 
    ? "Abrimos sábado às 17h00" 
    : "Abrimos segunda às 18h00"}
</p>
```

### 14. Produtos em Destaque no Header

```tsx
// src/components/layout/Header.tsx
{/* Banner de Promo */}
<div className="bg-yellow-400 text-center py-2 text-sm font-semibold">
  🔥 PROMOÇÃO: Pizza Grande por R$ 39,90 (apenas hoje!)
</div>
```

### 15. Limite de Caracteres nas Observações

**Arquivo:** `src/components/product/ProductModalWithSelects.tsx` - linha ~230

```tsx
<textarea
  maxLength={140}  // ← Mude para 200, 300, etc
  rows={4}         // ← Altura em linhas
/>
```

---

## 🎯 Customizações Avançadas

### A. Sistema de Fidelidade

```tsx
// Adicione no carrinho
const points = Math.floor(summary.total / 10); // 1 ponto a cada R$ 10

<div className="bg-purple-50 p-3 rounded-lg">
  <p className="text-sm">
    🎁 Você ganhará <strong>{points} pontos</strong> neste pedido!
  </p>
</div>
```

### B. Desconto para Primeira Compra

```tsx
const isFirstOrder = !localStorage.getItem('hasOrdered');

if (isFirstOrder) {
  <div className="bg-green-50 p-4 rounded-lg mb-4">
    <p className="font-bold">🎉 Primeira compra? Ganhe 15% OFF!</p>
    <p className="text-sm">Use o cupom: BEMVINDO15</p>
  </div>
}
```

### C. Notificação de Nova Promo

```tsx
useEffect(() => {
  const hasSeenPromo = localStorage.getItem('promo-black-friday');
  
  if (!hasSeenPromo) {
    toast('🔥 BLACK FRIDAY: 50% OFF em todas as pizzas!', {
      duration: 5000,
      icon: '🍕'
    });
    localStorage.setItem('promo-black-friday', 'true');
  }
}, []);
```

### D. Tempo Estimado de Entrega

```tsx
const estimateDelivery = (distance: number) => {
  const baseTime = 30; // minutos
  const extraTime = distance * 5; // 5min por km
  return baseTime + extraTime;
};

<p>⏱️ Tempo estimado: {estimateDelivery(3)} minutos</p>
```

---

## 📱 Responsividade Custom

### Mobile Específico
```tsx
<div className="block md:hidden">
  {/* Só aparece no mobile */}
</div>
```

### Desktop Específico
```tsx
<div className="hidden md:block">
  {/* Só aparece no desktop */}
</div>
```

### Tamanhos Diferentes
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Texto responsivo
</div>
```

---

## 🔧 Troubleshooting

### Imagens não carregam
```bash
# Certifique-se que as imagens estão em:
/public/images/pizzas/sua-imagem.jpg

# E no JSON:
"images": ["/images/pizzas/sua-imagem.jpg"]
```

### Promoções não aparecem
```bash
# Verifique:
1. "enabled": true
2. Datas válidas (ou remova validFrom/validUntil)
3. Console do navegador para erros
```

### Auto-scroll não funciona
```bash
# Use refs corretas:
const borderRef = useRef<HTMLDivElement>(null);

# E chame:
scrollToSection(borderRef);
```

---

**Dúvidas? Abra uma issue no repositório!** 🚀

