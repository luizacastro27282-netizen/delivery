# 🚀 COMECE AQUI!

## Instalação e Teste em 3 Passos

### 1️⃣ Instalar

```bash
npm install
```

### 2️⃣ Executar

```bash
npm run dev
```

### 3️⃣ Testar

Acesse: **http://localhost:5173**

---

## ✨ O Que Você Verá

### Tela Inicial (Catálogo)
```
┌──────────────────────────────────────┐
│  🍕  Pizzaria Delivery      🛒 (0)  │
│      📍 São João de Meriti - RJ      │
│      📞 (21) 99999-9999              │
│                                       │
│  🔴 Fechado • Abrimos segunda 18h   │
├──────────────────────────────────────┤
│  [Busca produtos...]                │
├──────────────────────────────────────┤
│  [Filtros: Todos | Pizzas | etc]    │
├──────────────────────────────────────┤
│  [Cards de Produtos com Imagens]    │
└──────────────────────────────────────┘
```

### Ao Clicar em um Produto
```
┌──────────────────────────────────────┐
│  [Imagem do Produto]            ✕   │
├──────────────────────────────────────┤
│  Pizza Calabresa                     │
│  R$ 39,90                            │
├──────────────────────────────────────┤
│  Escolha o sabor                     │
│  [ Calabresa            ▼ ]         │
│      ↓ auto-scroll                   │
│  Deseja borda?                       │
│  [ SEM BORDA            ▼ ]         │
│      ↓ auto-scroll                   │
│  Condimentos                         │
│  ☑️ Mostarda  ☐ Ketchup             │
│      ↓ auto-scroll                   │
│  Molho extra?                        │
│  [ Não, obrigado        ▼ ]         │
├──────────────────────────────────────┤
│  [-] 1 [+]   [Adicionar R$ 39,90]  │
└──────────────────────────────────────┘
```

### Carrinho
```
┌──────────────────────────────────────┐
│  Pizzaria Delivery              ✕   │
├──────────────────────────────────────┤
│  📍 Calcular taxa e tempo        ›  │
├──────────────────────────────────────┤
│  Sua sacola              LIMPAR      │
│  ┌────────────────────────────────┐ │
│  │ 1x PIZZA CALABRESA             │ │
│  │                    R$ 39,90    │ │
│  └────────────────────────────────┘ │
├──────────────────────────────────────┤
│  ⭐ Peça também                     │
│  [🥤] [🥤] [🥤]                     │
│  Coca  Guar  Coca                   │
│  R$5   R$4,5 R$12                  │
├──────────────────────────────────────┤
│  Total: R$ 39,90                    │
├──────────────────────────────────────┤
│  💰 Tem um cupom?                › │
├──────────────────────────────────────┤
│  [Estabelecimento fechado]          │
│  Abrimos segunda às 18h00           │
└──────────────────────────────────────┘
```

---

## 🎯 Testando Funcionalidades

### 1. Logo e Informações
✅ Logo aparece no header  
✅ Nome, endereço e telefone visíveis  
✅ Status aberto/fechado dinâmico

### 2. Produtos com Imagens
✅ Todas as 15 imagens SVG carregam  
✅ Cards com hover animado  
✅ Badges de promoção

### 3. Modal com Selects
✅ Clicar em produto abre modal  
✅ Selects ao invés de botões  
✅ Auto-scroll ao selecionar

### 4. Carrinho com Order Bumps
✅ Produtos sugeridos (bebidas)  
✅ Grid de 3 produtos  
✅ Adicionar com 1 clique

### 5. Horário Automático
✅ Status muda baseado no horário  
✅ Botão desabilitado se fechado  
✅ Mensagem de quando abre

---

## ⚙️ Personalizar RÁPIDO

### Mudar Logo
Substitua o arquivo:
```
/public/logo.jpeg
```

### Mudar Horários
Edite `/public/data/config.json`:
```json
"horarioFuncionamento": {
  "segunda": { 
    "aberto": true, 
    "abertura": "18:00" 
  }
}
```

### Mudar Produtos Sugeridos
Edite `/public/data/config.json`:
```json
"orderBumps": {
  "categorias": ["sobremesas"]  // ← Sugira sobremesas
}
```

---

## 📚 Documentação Completa

1. **FINAL_IMPLEMENTATION.md** - Implementação completa
2. **CUSTOMIZATION_TIPS.md** - 15+ dicas de personalização
3. **VISUAL_GUIDE.md** - Guia visual com exemplos
4. **README.md** - Documentação técnica completa

---

## 🆘 Problemas Comuns

### Porta 5173 em uso
```bash
# Use outra porta
npm run dev -- --port 3000
```

### Imagens não aparecem
```bash
# Verifique se existem
ls public/images/pizzas/
ls public/logo.svg
```

### Sempre fechado
```json
// config.json - coloque horários atuais
"abertura": "00:00",
"fechamento": "23:59"
```

---

## ✅ Checklist Rápido

- [ ] `npm install` executado
- [ ] `npm run dev` funcionando
- [ ] Acesso http://localhost:5173 OK
- [ ] Logo aparecendo
- [ ] 15 produtos com imagens
- [ ] Modal com selects funciona
- [ ] Carrinho com order bumps
- [ ] Status aberto/fechado correto

---

**Tudo funcionando?** 🎉  
**Próximo passo:** Personalizar com seus dados!

Veja: `CUSTOMIZATION_TIPS.md`

🍕 **Boa sorte!** 🚀

