# 📚 Documentação da API - Sistema de Delivery de Pizza

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
   - [Autenticação](#autenticação-1)
   - [Produtos](#produtos)
   - [Promoções](#promoções)
   - [Carrinho](#carrinho)
   - [Pedidos](#pedidos)
   - [Usuários](#usuários)
   - [Pagamentos e Gateways](#pagamentos-e-gateways)
   - [Configurações](#configurações)
   - [Admin](#admin)
4. [Modelos de Dados](#modelos-de-dados)
5. [Exemplos de Integração](#exemplos-de-integração)

---

## 🎯 Visão Geral

Este documento descreve todas as rotas necessárias para integrar o frontend React com um backend. O sistema é um delivery de pizza completo com:

- ✅ Catálogo de produtos
- ✅ Sistema de promoções e cupons
- ✅ Carrinho com order bumps
- ✅ Checkout e pagamento PIX
- ✅ Rastreamento de pedidos
- ✅ Área administrativa
- ✅ Gerenciamento de configurações

**Base URL**: `https://api.wellsole.store/api/v1`

**Formato de Resposta Padrão**:
```json
{
  "success": true,
  "data": {},
  "message": "Operação realizada com sucesso"
}
```

**Formato de Erro**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro descritiva"
  }
}
```

---

## 🔐 Autenticação

### Sistema de Autenticação

O sistema possui **dois tipos de autenticação**:

1. **Cliente** - Usuário final (telefone)
2. **Admin** - Área administrativa (username/password)

### Autenticação por Token

Todas as rotas protegidas requerem um token JWT no header:

```
Authorization: Bearer {token}
```

### Refresh Token

Quando o token expirar, use o refresh token para obter um novo:

```
Authorization: Bearer {refresh_token}
```

---

## 📡 Endpoints

### 🔑 Autenticação

#### 1. Login Cliente

**POST** `/auth/login`

**Descrição**: Autentica cliente usando número de telefone

**Body**:
```json
{
  "phone": "21999999999"
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "phone": "21999999999",
      "name": "Carlito Macedo",
      "email": "Carlito@email.com",
      "points": 150
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erros**:
- `400` - Telefone inválido
- `401` - Credenciais inválidas

---

#### 2. Registrar Cliente

**POST** `/auth/register`

**Descrição**: Cria nova conta de cliente

**Body**:
```json
{
  "phone": "21999999999",
  "name": "Carlito Macedo",
  "email": "Carlito@email.com",
  "address": "Rua das Flores, 123"
}
```

**Resposta** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "phone": "21999999999",
      "name": "Carlito Macedo",
      "email": "Carlito@email.com",
      "points": 5,
      "createdAt": "2025-11-04T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erros**:
- `400` - Dados inválidos ou telefone já cadastrado
- `422` - Validação falhou

---

#### 3. Login Admin

**POST** `/admin/auth/login`

**Descrição**: Autentica administrador

**Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "admin-123",
      "username": "admin",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erros**:
- `401` - Credenciais inválidas

---

#### 4. Refresh Token

**POST** `/auth/refresh`

**Descrição**: Renova token de acesso

**Headers**:
```
Authorization: Bearer {refresh_token}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 5. Logout

**POST** `/auth/logout`

**Descrição**: Invalida tokens

**Headers**:
```
Authorization: Bearer {token}
```

**Resposta** (200):
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

### 📦 Produtos

#### 1. Listar Produtos

**GET** `/products`

**Descrição**: Retorna lista de produtos disponíveis

**Query Parameters**:
- `category` (optional) - Filtrar por categoria
- `search` (optional) - Buscar por nome/descrição
- `available` (optional) - Apenas disponíveis (default: true)

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-123",
        "name": "Pizza Calabresa",
        "description": "Calabresa, cebola e azeitonas",
        "category": "pizzas",
        "type": "pizza",
        "price": null,
        "basePrice": null,
        "basePrices": {
          "pequena": 28.00,
          "media": 35.00,
          "grande": 42.00
        },
        "images": ["/images/pizza-calabresa.jpg"],
        "tags": ["mais-vendida"],
        "available": true,
        "flavors": ["Calabresa", "Calabresa com Catupiry"],
        "maxFlavors": 1
      }
    ],
    "total": 50
  }
}
```

---

#### 2. Buscar Produto por ID

**GET** `/products/:id`

**Descrição**: Retorna detalhes de um produto específico

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-123",
      "name": "Pizza Calabresa",
      "description": "Calabresa, cebola e azeitonas",
      "category": "pizzas",
      "type": "pizza",
      "basePrices": {
        "pequena": 28.00,
        "media": 35.00,
        "grande": 42.00
      },
      "images": ["/images/pizza-calabresa.jpg"],
      "tags": ["mais-vendida"],
      "available": true,
      "flavors": ["Calabresa", "Calabresa com Catupiry"],
      "maxFlavors": 1
    }
  }
}
```

**Erros**:
- `404` - Produto não encontrado

---

#### 3. Criar Produto (Admin)

**POST** `/admin/products`

**Headers**: `Authorization: Bearer {admin_token}`

**Body**:
```json
{
  "name": "Pizza Nova",
  "description": "Descrição do produto",
  "category": "pizzas",
  "type": "pizza",
  "price": null,
  "basePrice": null,
  "basePrices": {
    "pequena": 28.00,
    "media": 35.00,
    "grande": 42.00
  },
  "images": ["/images/pizza-nova.jpg"],
  "tags": ["premium"],
  "available": true,
  "flavors": ["Sabor 1", "Sabor 2"],
  "maxFlavors": 1
}
```

**Resposta** (201):
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-456",
      "name": "Pizza Nova",
      ...
    }
  }
}
```

---

#### 4. Atualizar Produto (Admin)

**PUT** `/admin/products/:id`

**Headers**: `Authorization: Bearer {admin_token}`

**Body**: (mesmo formato do POST, campos opcionais)

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-456",
      "name": "Pizza Nova Atualizada",
      ...
    }
  }
}
```

---

#### 5. Deletar Produto (Admin)

**DELETE** `/admin/products/:id`

**Headers**: `Authorization: Bearer {admin_token}`

**Resposta** (200):
```json
{
  "success": true,
  "message": "Produto deletado com sucesso"
}
```

---

### 🎁 Promoções

#### 1. Listar Promoções Ativas

**GET** `/promotions`

**Descrição**: Retorna promoções ativas no momento

**Query Parameters**:
- `type` (optional) - Filtrar por tipo (time_based, coupon, bulk_discount, price_compare)

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "promotions": [
      {
        "id": "promo-123",
        "name": "Desconto de 20%",
        "type": "coupon",
        "code": "PIZZA20",
        "discount": {
          "type": "percentage",
          "value": 20
        },
        "minSubtotal": 50.00,
        "validFrom": "2025-01-01T00:00:00Z",
        "validUntil": "2025-12-31T23:59:59Z",
        "activeDays": [1, 2, 3, 4, 5, 6, 0],
        "activeHours": {
          "start": "18:00",
          "end": "23:00"
        },
        "applyOrder": "best",
        "stackable": false,
        "tieBreaker": "highest"
      }
    ]
  }
}
```

---

#### 2. Validar Cupom

**POST** `/promotions/validate`

**Descrição**: Valida um código de cupom

**Body**:
```json
{
  "code": "PIZZA20",
  "subtotal": 75.50
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "valid": true,
    "promotion": {
      "id": "promo-123",
      "name": "Desconto de 20%",
      "discount": {
        "type": "percentage",
        "value": 20
      },
      "discountAmount": 15.10
    }
  }
}
```

**Erros**:
- `400` - Cupom inválido ou não aplicável
- `404` - Cupom não encontrado

---

#### 3. Criar Promoção (Admin)

**POST** `/admin/promotions`

**Headers**: `Authorization: Bearer {admin_token}`

**Body**:
```json
{
  "name": "Promoção de Natal",
  "type": "time_based",
  "code": null,
  "discount": {
    "type": "percentage",
    "value": 15
  },
  "minSubtotal": 30.00,
  "validFrom": "2025-12-20T00:00:00Z",
  "validUntil": "2025-12-25T23:59:59Z",
  "activeDays": [1, 2, 3, 4, 5, 6, 0],
  "activeHours": {
    "start": "18:00",
    "end": "23:00"
  },
  "applyOrder": "best",
  "stackable": false,
  "tieBreaker": "highest"
}
```

**Resposta** (201):
```json
{
  "success": true,
  "data": {
    "promotion": {
      "id": "promo-456",
      ...
    }
  }
}
```

---

#### 4. Atualizar Promoção (Admin)

**PUT** `/admin/promotions/:id`

**Headers**: `Authorization: Bearer {admin_token}`

**Body**: (mesmo formato do POST)

---

#### 5. Deletar Promoção (Admin)

**DELETE** `/admin/promotions/:id`

**Headers**: `Authorization: Bearer {admin_token}`

---

### 🛒 Carrinho

#### 1. Calcular Total do Carrinho

**POST** `/cart/calculate`

**Descrição**: Calcula total do carrinho com promoções aplicadas

**Body**:
```json
{
  "items": [
    {
      "productId": "prod-123",
      "quantity": 2,
      "selectedSize": "media",
      "selectedFlavors": ["Calabresa"],
      "unitPrice": 35.00
    }
  ],
  "couponCode": "PIZZA20",
  "deliveryMethod": "delivery"
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "subtotal": 70.00,
    "discount": 14.00,
    "deliveryFee": 5.00,
    "total": 61.00,
    "appliedPromotions": [
      {
        "id": "promo-123",
        "name": "Desconto de 20%",
        "discountAmount": 14.00
      }
    ],
    "itemsWithPromotions": [
      {
        "item": {...},
        "appliedPromotions": []
      }
    ],
    "totalSavings": 14.00
  }
}
```

---

### 📋 Pedidos

#### 1. Criar Pedido

**POST** `/orders`

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "customer": {
    "name": "Carlito Macedo",
    "phone": "21999999999",
    "email": "Carlito@email.com"
  },
  "items": [
    {
      "productId": "prod-123",
      "quantity": 2,
      "selectedSize": "media",
      "selectedFlavors": ["Calabresa"],
      "unitPrice": 35.00,
      "notes": "Sem cebola"
    }
  ],
  "deliveryMethod": "delivery",
  "deliveryAddress": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 101",
    "neighborhood": "Centro",
    "city": "São João de Meriti",
    "state": "RJ",
    "zipCode": "25520000"
  },
  "payment": {
    "method": "pix"
  },
  "couponCode": "PIZZA20"
}
```

**Resposta** (201):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-123",
      "orderNumber": "PED-2025-001",
      "status": "pending",
      "createdAt": "2025-11-04T12:00:00Z",
      "customer": {...},
      "items": [...],
      "subtotal": 70.00,
      "discount": 14.00,
      "deliveryFee": 5.00,
      "total": 61.00,
      "payment": {
        "method": "pix",
        "pixCode": "00020126360014BR.GOV.BCB.PIX...",
        "pixQrCode": "data:image/png;base64,..."
      },
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2025-11-04T12:00:00Z"
        }
      ]
    }
  }
}
```

---

#### 2. Listar Pedidos do Cliente

**GET** `/orders`

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `status` (optional) - Filtrar por status
- `limit` (optional) - Limite de resultados (default: 20)
- `offset` (optional) - Paginação

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-123",
        "orderNumber": "PED-2025-001",
        "status": "delivered",
        "total": 61.00,
        "createdAt": "2025-11-04T12:00:00Z"
      }
    ],
    "total": 15
  }
}
```

---

#### 3. Buscar Pedido por ID

**GET** `/orders/:id`

**Headers**: `Authorization: Bearer {token}`

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-123",
      "orderNumber": "PED-2025-001",
      "status": "preparing",
      "createdAt": "2025-11-04T12:00:00Z",
      "updatedAt": "2025-11-04T12:30:00Z",
      "customer": {...},
      "items": [...],
      "deliveryAddress": {...},
      "subtotal": 70.00,
      "discount": 14.00,
      "deliveryFee": 5.00,
      "total": 61.00,
      "payment": {...},
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2025-11-04T12:00:00Z"
        },
        {
          "status": "confirmed",
          "timestamp": "2025-11-04T12:05:00Z"
        },
        {
          "status": "preparing",
          "timestamp": "2025-11-04T12:30:00Z"
        }
      ]
    }
  }
}
```

---

#### 4. Atualizar Status do Pedido (Admin)

**PUT** `/admin/orders/:id/status`

**Headers**: `Authorization: Bearer {admin_token}`

**Body**:
```json
{
  "status": "preparing",
  "notes": "Pedido em preparação"
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-123",
      "status": "preparing",
      "statusHistory": [...]
    }
  }
}
```

**Status Possíveis**:
- `pending` - Pendente
- `confirmed` - Confirmado
- `preparing` - Em preparação
- `ready` - Pronto
- `out_delivery` - Em entrega
- `delivered` - Entregue
- `cancelled` - Cancelado

---

#### 5. Listar Todos os Pedidos (Admin)

**GET** `/admin/orders`

**Headers**: `Authorization: Bearer {admin_token}`

**Query Parameters**:
- `status` (optional)
- `dateFrom` (optional)
- `dateTo` (optional)
- `limit` (optional)
- `offset` (optional)

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "total": 150,
    "stats": {
      "pending": 5,
      "preparing": 3,
      "ready": 2,
      "out_delivery": 1
    }
  }
}
```

---

### 👤 Usuários

#### 1. Buscar Perfil

**GET** `/users/profile`

**Headers**: `Authorization: Bearer {token}`

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "phone": "21999999999",
      "name": "Carlito Macedo",
      "email": "Carlito@email.com",
      "points": 150,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

---

#### 2. Atualizar Perfil

**PUT** `/users/profile`

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "name": "Carlito Macedo",
  "email": "novo@email.com"
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "Carlito Macedo",
      "email": "novo@email.com",
      ...
    }
  }
}
```

---

#### 3. Listar Endereços

**GET** `/users/addresses`

**Headers**: `Authorization: Bearer {token}`

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": "addr-123",
        "type": "home",
        "label": "Casa",
        "street": "Rua das Flores",
        "number": "123",
        "complement": "Apto 101",
        "neighborhood": "Centro",
        "city": "São João de Meriti",
        "state": "RJ",
        "zipCode": "25520000"
      }
    ]
  }
}
```

---

#### 4. Criar Endereço

**POST** `/users/addresses`

**Headers**: `Authorization: Bearer {token}`

**Body**:
```json
{
  "type": "home",
  "label": "Casa",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 101",
  "neighborhood": "Centro",
  "city": "São João de Meriti",
  "state": "RJ",
  "zipCode": "25520000"
}
```

**Resposta** (201):
```json
{
  "success": true,
  "data": {
    "address": {
      "id": "addr-456",
      ...
    }
  }
}
```

---

#### 5. Atualizar Endereço

**PUT** `/users/addresses/:id`

**Headers**: `Authorization: Bearer {token}`

**Body**: (mesmo formato do POST)

---

#### 6. Deletar Endereço

**DELETE** `/users/addresses/:id`

**Headers**: `Authorization: Bearer {token}`

---

### 💳 Pagamentos e Gateways

#### 1. Criar Transação PIX

**POST** `/payments/pix/create`

**Descrição**: Cria uma transação PIX usando o gateway configurado (Medusa Pay ou Asset Pagamentos)

**Body**:
```json
{
  "amount": 61.00,
  "orderId": "order-123",
  "customer": {
    "name": "Carlito Macedo",
    "phone": "21999999999",
    "email": "Carlito@email.com",
    "document": "12345678900"
  },
  "description": "Pedido #PED-2025-001"
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "transactionId": "trans-123",
    "gateway": "medusapay",
    "pixCode": "00020126360014BR.GOV.BCB.PIX...",
    "pixQrCode": "data:image/png;base64,iVBORw0KGgo...",
    "expiresAt": "2025-11-04T12:30:00Z",
    "status": "pending"
  }
}
```

**Nota**: O backend deve:
- Rotacionar entre gateways configurados (Medusa Pay e Asset Pagamentos)
- Usar o gateway ativo configurado no admin
- Gerar QR Code e código copia-e-cola do PIX

---

#### 2. Verificar Status do Pagamento

**GET** `/payments/:transactionId/status`

**Descrição**: Verifica status de uma transação PIX

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "transactionId": "trans-123",
    "status": "paid",
    "paidAt": "2025-11-04T12:15:00Z",
    "amount": 61.00,
    "gateway": "medusapay"
  }
}
```

**Status Possíveis**:
- `pending` - Aguardando pagamento
- `paid` - Pago
- `expired` - Expirado
- `cancelled` - Cancelado

---

#### 3. Configurar Gateways (Admin)

**PUT** `/admin/payment-gateways`

**Headers**: `Authorization: Bearer {admin_token}`

**Body**:
```json
{
  "activeGateway": "medusapay",
  "rotationEnabled": true,
  "rotationStrategy": "round_robin",
  "gateways": {
    "medusapay": {
      "enabled": true,
      "secretKey": "sk_live_xxx",
      "apiUrl": "https://api.v2.medusapay.com.br/v1",
      "priority": 1
    },
    "assetpagamentos": {
      "enabled": true,
      "secretKey": "xxx",
      "companyId": "xxx",
      "apiUrl": "https://api.assetpagamentos.com/functions/v1",
      "priority": 2
    }
  }
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "gateways": {...}
  }
}
```

**Rotação de Gateways**:
- `round_robin` - Alterna entre gateways a cada pedido
- `priority` - Usa gateway com maior prioridade disponível
- `manual` - Usa apenas o gateway ativo

---

#### 4. Webhook - Notificação de Pagamento

**POST** `/payments/webhook/:gateway`

**Descrição**: Endpoint para receber notificações de pagamento dos gateways

**Headers**:
- Medusa Pay: `Authorization: Basic {token}`
- Asset Pagamentos: `Authorization: Basic {token}`

**Body** (Medusa Pay):
```json
{
  "id": "trans-123",
  "status": "paid",
  "amount": 6100,
  "paid_at": "2025-11-04T12:15:00Z"
}
```

**Body** (Asset Pagamentos):
```json
{
  "transactionId": "trans-123",
  "status": "paid",
  "amount": 61.00,
  "paidAt": "2025-11-04T12:15:00Z"
}
```

**Resposta** (200):
```json
{
  "success": true,
  "message": "Webhook processado com sucesso"
}
```

**Ações do Backend**:
1. Validar assinatura do webhook
2. Atualizar status da transação
3. Atualizar status do pedido para `confirmed`
4. Enviar notificação ao cliente

---

### ⚙️ Configurações

#### 1. Buscar Configurações

**GET** `/config`

**Descrição**: Retorna configurações públicas da loja

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "config": {
      "store": {
        "name": "Pizzaria Delivery",
        "logo": "/logo.jpeg",
        "banner": "/banner.jpeg",
        "address": "São João de Meriti - RJ",
        "phone": "(21) 99999-9999",
        "whatsapp": "5521999999999",
        "email": "contato@pizzariadeliv.com",
        "description": "A melhor pizza da região!",
        "taxaEntrega": 5.00,
        "tempoMedioEntrega": 45,
        "pedidoMinimo": 20.00
      },
      "freeDeliveryAbove": 50.00,
      "horarioFuncionamento": {
        "segunda": {
          "aberto": true,
          "abertura": "18:00",
          "fechamento": "23:00"
        },
        ...
      },
      "orderBumps": {
        "enabled": true,
        "titulo": "Peça também",
        "itens": [...],
        "quantidade": 3,
        "sortBy": "price"
      },
      "redesSociais": {
        "instagram": "@pizzariadeliv",
        "facebook": "pizzariadeliv"
      }
    }
  }
}
```

---

#### 2. Atualizar Configurações (Admin)

**PUT** `/admin/config`

**Headers**: `Authorization: Bearer {admin_token}`

**Body**:
```json
{
  "store": {
    "name": "Novo Nome",
    "taxaEntrega": 6.00,
    ...
  },
  "freeDeliveryAbove": 60.00,
  "horarioFuncionamento": {
    "segunda": {
      "aberto": true,
      "abertura": "18:00",
      "fechamento": "23:00"
    },
    ...
  },
  "orderBumps": {
    "enabled": true,
    "titulo": "Peça também",
    "itens": [
      {
        "productId": "prod-123",
        "desconto": 10,
        "descontoTipo": "percent",
        "ativo": true
      }
    ],
    "quantidade": 3,
    "sortBy": "price"
  }
}
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "config": {...}
  }
}
```

---

### 📊 Admin - Estatísticas

#### 1. Dashboard Stats

**GET** `/admin/stats`

**Headers**: `Authorization: Bearer {admin_token}`

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "totalProducts": 50,
    "totalOrders": 150,
    "pendingOrders": 5,
    "totalRevenue": 12500.00,
    "todayRevenue": 350.00,
    "todayOrders": 12,
    "averageTicket": 83.33,
    "topProducts": [
      {
        "productId": "prod-123",
        "name": "Pizza Calabresa",
        "quantity": 45,
        "revenue": 1575.00
      }
    ]
  }
}
```

---

## 📦 Modelos de Dados

### Product

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  category: string; // 'pizzas', 'bebidas', 'sobremesas', 'combos'
  type: 'pizza' | 'combo' | 'drink' | 'dessert';
  price?: number; // Preço único (para não-pizza)
  basePrice?: number; // Preço base (para combos)
  basePrices?: { // Preços por tamanho (pizza)
    pequena: number;
    media: number;
    grande: number;
  };
  images: string[];
  tags: string[]; // 'mais-vendida', 'promocao', 'premium'
  available: boolean;
  flavors?: string[]; // Sabores disponíveis (pizza)
  maxFlavors?: number; // Máximo de sabores (pizza)
  createdAt: string;
  updatedAt: string;
}
```

### Promotion

```typescript
interface Promotion {
  id: string;
  name: string;
  type: 'time_based' | 'coupon' | 'bulk_discount' | 'price_compare';
  code?: string; // Código do cupom
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  minSubtotal: number;
  validFrom: string; // ISO 8601
  validUntil: string; // ISO 8601
  activeDays: number[]; // 0-6 (Domingo-Sábado)
  activeHours?: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  applyOrder: 'first' | 'last' | 'best';
  stackable: boolean;
  tieBreaker: 'highest' | 'lowest' | 'first';
  createdAt: string;
  updatedAt: string;
}
```

### Order

```typescript
interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  deliveryFee: number;
  subtotal: number;
  discount: number;
  total: number;
  appliedPromotions: string[]; // IDs das promoções
  payment: {
    method: 'pix' | 'cash' | 'card';
    pixCode?: string;
    pixQrCode?: string;
    paid?: boolean;
    paidAt?: string;
  };
  statusHistory: {
    status: Order['status'];
    timestamp: string;
  }[];
}

interface OrderItem {
  productId: string;
  product: Product; // Populado pelo backend
  quantity: number;
  selectedSize?: 'pequena' | 'media' | 'grande';
  selectedFlavors?: string[];
  unitPrice: number;
  notes?: string;
}
```

### User

```typescript
interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}
```

### Address

```typescript
interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Config

```typescript
interface Config {
  store: {
    name: string;
    logo: string;
    banner: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    description: string;
    taxaEntrega: number;
    tempoMedioEntrega: number;
    pedidoMinimo: number;
  };
  freeDeliveryAbove: number;
  horarioFuncionamento: {
    [day: string]: {
      aberto: boolean;
      abertura: string; // HH:mm
      fechamento: string; // HH:mm
    };
  };
  orderBumps: {
    enabled: boolean;
    titulo: string;
    itens: OrderBumpItem[];
    quantidade: number;
    sortBy: 'price' | 'name' | 'category';
  };
  pagamento: {
    pix: {
      enabled: boolean;
      chave: string;
      nomeBeneficiario: string;
    };
    dinheiro: {
      enabled: boolean;
      aceitaTroco: boolean;
    };
    cartao: {
      enabled: boolean;
    };
  };
  redesSociais: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  mensagens: {
    bemVindo: string;
    estabelecimentoFechado: string;
    pedidoMinimo: string;
    sucessoPedido: string;
  };
}

interface OrderBumpItem {
  productId: string;
  desconto: number;
  descontoTipo: 'percent' | 'fixed';
  ativo: boolean;
}
```

---

## 🔄 Exemplos de Integração

### Exemplo 1: Criar Pedido Completo

```typescript
// 1. Cliente adiciona produtos ao carrinho (frontend)
const cartItems = [
  {
    productId: "prod-123",
    quantity: 2,
    selectedSize: "media",
    selectedFlavors: ["Calabresa"],
    unitPrice: 35.00
  }
];

// 2. Calcular total com promoções
const calculateResponse = await fetch('/api/v1/cart/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    items: cartItems,
    couponCode: 'PIZZA20',
    deliveryMethod: 'delivery'
  })
});

const { data: cartSummary } = await calculateResponse.json();
// cartSummary.total = 61.00

// 3. Criar pedido
const orderResponse = await fetch('/api/v1/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    customer: {
      name: "Carlito Macedo",
      phone: "21999999999",
      email: "Carlito@email.com"
    },
    items: cartItems,
    deliveryMethod: 'delivery',
    deliveryAddress: {
      street: "Rua das Flores",
      number: "123",
      neighborhood: "Centro",
      city: "São João de Meriti",
      state: "RJ"
    },
    payment: {
      method: 'pix'
    },
    couponCode: 'PIZZA20'
  })
});

const { data: order } = await orderResponse.json();
// order.payment.pixQrCode → Mostrar QR Code
```

---

### Exemplo 2: Atualizar Status do Pedido (Admin)

```typescript
// Admin atualiza status
const updateResponse = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    status: 'preparing',
    notes: 'Pedido em preparação'
  })
});

// Backend pode enviar notificação push/email ao cliente
```

---

### Exemplo 3: Gerenciar Produtos (Admin)

```typescript
// Criar produto
const createProduct = async (productData) => {
  const response = await fetch('/api/v1/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(productData)
  });
  
  return response.json();
};

// Atualizar produto
const updateProduct = async (productId, updates) => {
  const response = await fetch(`/api/v1/admin/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(updates)
  });
  
  return response.json();
};

// Deletar produto
const deleteProduct = async (productId) => {
  const response = await fetch(`/api/v1/admin/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  return response.json();
};
```

---

### Exemplo 4: Sistema de Promoções

```typescript
// Validar cupom antes de aplicar
const validateCoupon = async (code, subtotal) => {
  const response = await fetch('/api/v1/promotions/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      subtotal
    })
  });
  
  const { data } = await response.json();
  
  if (data.valid) {
    // Aplicar desconto
    const discountAmount = data.promotion.discountAmount;
    return discountAmount;
  }
  
  throw new Error('Cupom inválido');
};
```

---

## 🔐 Segurança

### Validações Necessárias

1. **Autenticação**:
   - Verificar token em todas as rotas protegidas
   - Validar expiração do token
   - Refresh token automático

2. **Autorização**:
   - Rotas `/admin/*` requerem role `admin`
   - Clientes só podem ver seus próprios pedidos
   - Validar ownership de recursos

3. **Input Validation**:
   - Validar todos os campos de entrada
   - Sanitizar dados
   - Prevenir SQL Injection
   - Prevenir XSS

4. **Rate Limiting**:
   - Limitar tentativas de login
   - Limitar criação de pedidos
   - Proteção contra DDoS

---

## 💳 Integração com Gateways de Pagamento

### Visão Geral

O sistema suporta **dois gateways de pagamento PIX** para processamento de transações:

1. **Medusa Pay** - [Documentação Completa](https://medusapay.readme.io/reference/introducao)
   - Gateway brasileiro especializado em PIX
   - Suporte para QR Code estático e dinâmico
   - Webhooks para notificações de pagamento

2. **Asset Pagamentos** - [Documentação Completa](https://assetpagamentos.readme.io/reference/introdução)
   - Gateway de pagamentos brasileiro
   - Integração PIX completa
   - Sistema de notificações via webhook

**Importante**: O administrador pode configurar ambos os gateways simultaneamente através do painel admin (`/admin/dashboard` → aba "Pagamentos"), permitindo:
- Troca de gateway ativo
- Rotação automática entre gateways
- Configuração de credenciais (API keys, URLs)
- Teste de conexão com cada gateway

### Configuração via Admin

O administrador pode:
- ✅ Configurar credenciais de ambos os gateways
- ✅ Escolher qual gateway usar (ativo)
- ✅ Habilitar rotação automática entre gateways
- ✅ Definir estratégia de rotação (round_robin, priority, manual)
- ✅ Testar conexão com cada gateway

### Medusa Pay

**URL Base**: `https://api.v2.medusapay.com.br/v1`

**Autenticação**: Basic Auth
```javascript
authorization: 'Basic ' + Buffer.from(SECRET_KEY + ':x').toString('base64')
```

**Criar Transação PIX**:
```
POST /transactions
```

**Body**:
```json
{
  "amount": 6100,
  "payment_method": "pix",
  "customer": {
    "name": "Carlito Macedo",
    "email": "Carlito@email.com",
    "document": "12345678900",
    "phone": "21999999999"
  },
  "items": [
    {
      "description": "Pedido #PED-2025-001",
      "quantity": 1,
      "amount": 6100
    }
  ]
}
```

**Resposta**:
```json
{
  "id": "trans-123",
  "status": "pending",
  "payment_method": "pix",
  "pix": {
    "qr_code": "00020126360014BR.GOV.BCB.PIX...",
    "qr_code_base64": "data:image/png;base64,...",
    "expires_at": "2025-11-04T12:30:00Z"
  }
}
```

**Webhook**: Configurar URL de callback no painel Medusa Pay

---

### Asset Pagamentos

**URL Base**: `https://api.assetpagamentos.com/functions/v1`

**Autenticação**: Basic Auth
```javascript
authorization: 'Basic ' + Buffer.from(SECRET_KEY + ':' + COMPANY_ID).toString('base64')
```

**Criar Transação PIX**:
```
POST /transactions
```

**Body**:
```json
{
  "amount": 61.00,
  "paymentMethod": "pix",
  "customer": {
    "name": "Carlito Macedo",
    "email": "Carlito@email.com",
    "document": "12345678900",
    "phone": "21999999999"
  },
  "description": "Pedido #PED-2025-001"
}
```

**Resposta**:
```json
{
  "transactionId": "trans-123",
  "status": "pending",
  "paymentMethod": "pix",
  "pixCode": "00020126360014BR.GOV.BCB.PIX...",
  "pixQrCode": "data:image/png;base64,...",
  "expiresAt": "2025-11-04T12:30:00Z"
}
```

**Webhook**: Configurar URL de callback no painel Asset Pagamentos

---

### Estratégias de Rotação

#### 1. Round Robin (Alternância)
- Alterna entre gateways a cada pedido
- Distribui carga uniformemente
- Útil para alta demanda

#### 2. Priority (Prioridade)
- Usa gateway com maior prioridade disponível
- Se gateway 1 falhar, usa gateway 2
- Útil para garantir disponibilidade

#### 3. Manual
- Usa apenas o gateway ativo
- Admin escolhe qual usar
- Útil para testes ou preferência específica

---

### Implementação Backend

```typescript
// Exemplo de rotação de gateways
async function createPixTransaction(order: Order) {
  const gateways = getConfiguredGateways();
  const strategy = getRotationStrategy();
  
  let selectedGateway;
  
  if (strategy === 'round_robin') {
    selectedGateway = getNextGateway(gateways);
  } else if (strategy === 'priority') {
    selectedGateway = getHighestPriorityGateway(gateways);
  } else {
    selectedGateway = getActiveGateway(gateways);
  }
  
  try {
    if (selectedGateway.name === 'medusapay') {
      return await createMedusaPayTransaction(order, selectedGateway);
    } else {
      return await createAssetPagamentosTransaction(order, selectedGateway);
    }
  } catch (error) {
    // Fallback para outro gateway se disponível
    if (strategy === 'priority') {
      const fallback = getNextAvailableGateway(gateways, selectedGateway);
      return await createPixTransactionWithGateway(order, fallback);
    }
    throw error;
  }
}
```

---

### Webhooks

**Importante**: Configurar URLs de webhook em ambos os gateways:

- Medusa Pay: `https://api.wellsole.store/api/v1/payments/webhook/medusapay`
- Asset Pagamentos: `https://api.wellsole.store/api/v1/payments/webhook/assetpagamentos`

O backend deve:
1. Validar assinatura do webhook
2. Identificar o gateway pelo path
3. Processar notificação de pagamento
4. Atualizar pedido e enviar notificação

---

## 📊 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `422` - Erro de validação
- `500` - Erro interno do servidor

---

## 🚀 Próximos Passos

### Para Integrar o Backend:

1. **Substituir TODOs no código**:
   - Buscar por `// TODO:` em todos os arquivos
   - Substituir por chamadas `fetch()` para a API

2. **Configurar Base URL**:
   ```typescript
   // src/config/api.ts
   export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api/v1';
   ```

3. **Criar Service Layer**:
   ```typescript
   // src/services/api.ts
   // Funções para todas as chamadas de API
   ```

4. **Atualizar Stores**:
   - Substituir mocks por chamadas reais
   - Manter estrutura de estados

---

## 📝 Notas Importantes

1. **PIX Payment**: O QR Code deve ser gerado pelo backend usando biblioteca específica (ex: `qrcode` em Node.js)

2. **Order Numbers**: Sugestão de formato: `PED-{ANO}-{SEQUENCIAL}` (ex: `PED-2025-001`)

3. **Pontos de Fidelidade**: 
   - 1 ponto = R$ 1,00 em compras
   - Bônus de boas-vindas: 5 pontos
   - Atualizar pontos após pedido entregue

4. **Status de Pedidos**: 
   - Backend deve atualizar automaticamente conforme tempo
   - Notificações push quando status muda

5. **Cálculo de Taxa de Entrega**:
   - Se `subtotal >= freeDeliveryAbove` → `deliveryFee = 0`
   - Caso contrário → `deliveryFee = config.store.taxaEntrega`

6. **Order Bumps com Desconto**:
   - Desconto aplicado apenas quando produto é adicionado via order bump
   - Preço original mantido no catálogo

---

## ✅ Checklist de Implementação

### Backend Deve Ter:

- [ ] Sistema de autenticação JWT
- [ ] CRUD completo de produtos
- [ ] Sistema de promoções e cupons
- [ ] Engine de cálculo de promoções
- [ ] CRUD de pedidos
- [ ] Sistema de status de pedidos
- [ ] Geração de QR Code PIX
- [ ] Gerenciamento de configurações
- [ ] Sistema de endereços
- [ ] Dashboard de estatísticas
- [ ] Upload de imagens
- [ ] Notificações push/email
- [ ] Rate limiting
- [ ] Logs de auditoria

---

**Versão do Documento**: 1.0.0  
**Última Atualização**: 04/11/2025  
**Autor**: Sistema de Delivery de Pizza

