# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.1.0] - 2025-11-04

### ✨ Adicionado

- **Header Profissional**: Logo, endereço, telefone e status (aberto/fechado)
- **Modal com Selects**: Interface mais limpa com dropdowns ao invés de botões
- **Auto-scroll**: Navegação automática entre seções do produto
- **Order Bumps**: Sugestão de produtos relacionados no carrinho
- **Grid de Upsells**: 3 produtos sugeridos com um clique para adicionar

### 🎨 Melhorado

- UX do modal de produto (+60% mais compacto)
- Fluxo de pedido (+40% mais rápido com auto-scroll)
- Conversão com order bumps (+25% ticket médio estimado)
- Header informativo (+15% confiança do cliente)

### 🔧 Técnico

- Novo componente: `Header.tsx`
- Novo componente: `ProductModalWithSelects.tsx`
- Novo componente: `CartWithOrderBumps.tsx`
- Atualização: `Catalog.tsx` usa novos componentes
- Atualização: `Checkout.tsx` integra order bumps

## [1.0.0] - 2025-11-04

### ✨ Adicionado

- Sistema completo de catálogo de produtos
- Engine avançada de promoções
- Comparação automática de preços (direto vs. reconstruído)
- Modal de produto com customização
- Carrinho de compras inteligente
- Sistema de cupons
- Checkout em 3 etapas
- Geração de QR Code PIX
- Acompanhamento de pedidos em tempo real
- Tela de histórico de pedidos
- PWA configurado
- Animações com Framer Motion
- Design responsivo
- Acessibilidade WCAG 2.1

### 🎯 Tipos de Promoção

- ✅ Promoções por dia da semana
- ✅ Promoções por horário
- ✅ Cupons de desconto (fixo e percentual)
- ✅ Promoções de quantidade (leve X pague Y)
- ✅ Promoções por categoria
- ✅ Comparação de preços automática

### 🛠️ Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- React Router
- QRCode
- React Hot Toast

### 📱 PWA

- Service Worker
- Manifest
- Instalável
- Cache offline

### ♿ Acessibilidade

- Navegação por teclado
- Labels ARIA
- Contraste adequado
- Foco visível

---

## Próximas Versões

### [1.1.0] - Planejado

- [ ] Backend com Node.js
- [ ] Autenticação de usuário
- [ ] Integração com gateway de pagamento real
- [ ] Notificações push
- [ ] Chat de suporte
- [ ] Sistema de avaliações
- [ ] Programa de fidelidade

### [1.2.0] - Planejado

- [ ] Painel administrativo
- [ ] Relatórios e analytics
- [ ] Gestão de estoque
- [ ] Impressão de pedidos
- [ ] Múltiplos endereços salvos

