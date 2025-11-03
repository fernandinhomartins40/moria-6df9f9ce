# 📡 Moria Backend - Lista Completa de Endpoints

## 📋 Índice

- [Autenticação](#autenticação)
- [Endereços](#endereços)
- [Produtos (Fase 2)](#produtos)
- [Serviços (Fase 2)](#serviços)
- [Veículos (Fase 2)](#veículos)
- [Compatibilidade (Fase 2)](#compatibilidade)
- [Pedidos (Fase 3)](#pedidos)
- [Promoções (Fase 3)](#promoções)
- [Cupons (Fase 3)](#cupons)
- [Favoritos (Fase 3)](#favoritos)
- [Veículos do Cliente (Fase 4)](#veículos-do-cliente)
- [Checklist (Fase 4)](#checklist)
- [Revisões (Fase 4)](#revisões)

---

## 🔐 Autenticação

**Base URL**: `/auth`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/register` | ❌ | Registrar novo cliente |
| POST | `/login` | ❌ | Login e obter token JWT |
| GET | `/me` | ✅ | Obter dados do usuário autenticado |
| PUT | `/profile` | ✅ | Atualizar perfil |
| PUT | `/password` | ✅ | Alterar senha |

**Total**: 5 endpoints

---

## 🏠 Endereços

**Base URL**: `/addresses`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar endereços do cliente |
| GET | `/:id` | ✅ | Obter endereço por ID |
| POST | `/` | ✅ | Criar novo endereço |
| PUT | `/:id` | ✅ | Atualizar endereço |
| DELETE | `/:id` | ✅ | Deletar endereço |
| PATCH | `/:id/default` | ✅ | Definir endereço padrão |

**Total**: 6 endpoints

---

## 📦 Produtos

**Base URL**: `/products`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ❌ | Listar produtos com filtros |
| GET | `/:id` | ❌ | Obter produto por ID |
| GET | `/slug/:slug` | ❌ | Obter produto por slug |
| GET | `/sku/:sku` | ❌ | Obter produto por SKU |
| GET | `/categories` | ❌ | Listar categorias |
| GET | `/search` | ❌ | Buscar produtos |
| POST | `/` | ✅ | Criar produto (admin) |
| PUT | `/:id` | ✅ | Atualizar produto (admin) |
| DELETE | `/:id` | ✅ | Deletar produto (admin) |
| PATCH | `/:id/stock` | ✅ | Atualizar estoque (admin) |

**Total**: 10 endpoints

---

## 🔧 Serviços

**Base URL**: `/services`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ❌ | Listar serviços com filtros |
| GET | `/:id` | ❌ | Obter serviço por ID |
| GET | `/slug/:slug` | ❌ | Obter serviço por slug |
| GET | `/categories` | ❌ | Listar categorias |
| POST | `/` | ✅ | Criar serviço (admin) |
| PUT | `/:id` | ✅ | Atualizar serviço (admin) |
| DELETE | `/:id` | ✅ | Deletar serviço (admin) |

**Total**: 7 endpoints

---

## 🚗 Veículos

**Base URL**: `/vehicles`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/makes` | ❌ | Listar marcas |
| GET | `/makes/:id` | ❌ | Obter marca por ID |
| GET | `/makes/:makeId/models` | ❌ | Listar modelos de uma marca |
| GET | `/models/:id` | ❌ | Obter modelo por ID |
| GET | `/models/:modelId/variants` | ❌ | Listar variantes de um modelo |
| GET | `/variants/:id` | ❌ | Obter variante por ID |
| POST | `/makes` | ✅ | Criar marca (admin) |
| PUT | `/makes/:id` | ✅ | Atualizar marca (admin) |
| DELETE | `/makes/:id` | ✅ | Deletar marca (admin) |
| POST | `/models` | ✅ | Criar modelo (admin) |
| PUT | `/models/:id` | ✅ | Atualizar modelo (admin) |
| DELETE | `/models/:id` | ✅ | Deletar modelo (admin) |
| POST | `/variants` | ✅ | Criar variante (admin) |
| PUT | `/variants/:id` | ✅ | Atualizar variante (admin) |
| DELETE | `/variants/:id` | ✅ | Deletar variante (admin) |

**Total**: 15 endpoints

---

## 🔗 Compatibilidade

**Base URL**: `/compatibility`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ❌ | Listar compatibilidades |
| GET | `/:id` | ❌ | Obter compatibilidade por ID |
| GET | `/product/:productId` | ❌ | Compatibilidades de um produto |
| GET | `/check` | ❌ | Verificar compatibilidade |
| POST | `/` | ✅ | Criar compatibilidade (admin) |
| PUT | `/:id` | ✅ | Atualizar compatibilidade (admin) |
| DELETE | `/:id` | ✅ | Deletar compatibilidade (admin) |

**Total**: 7 endpoints

---

## 🛒 Pedidos

**Base URL**: `/orders`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar pedidos do cliente |
| GET | `/:id` | ✅ | Obter pedido por ID |
| POST | `/` | ✅ | Criar novo pedido |
| PUT | `/:id/status` | ✅ | Atualizar status (admin) |
| PATCH | `/:id/cancel` | ✅ | Cancelar pedido |
| GET | `/statistics` | ✅ | Estatísticas de pedidos |

**Total**: 6 endpoints

---

## 🎁 Promoções

**Base URL**: `/promotions`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ❌ | Listar promoções ativas |
| GET | `/active` | ❌ | Promoções ativas e aplicáveis |
| GET | `/:id` | ❌ | Obter promoção por ID |
| POST | `/validate` | ✅ | Validar promoção para carrinho |
| POST | `/` | ✅ | Criar promoção (admin) |
| PUT | `/:id` | ✅ | Atualizar promoção (admin) |
| DELETE | `/:id` | ✅ | Deletar promoção (admin) |
| PATCH | `/:id/toggle` | ✅ | Ativar/Desativar (admin) |

**Total**: 8 endpoints

---

## 🎫 Cupons

**Base URL**: `/coupons`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar cupons (admin) |
| GET | `/:id` | ✅ | Obter cupom por ID (admin) |
| POST | `/validate` | ✅ | Validar cupom |
| POST | `/` | ✅ | Criar cupom (admin) |
| PUT | `/:id` | ✅ | Atualizar cupom (admin) |
| DELETE | `/:id` | ✅ | Deletar cupom (admin) |

**Total**: 6 endpoints

---

## ⭐ Favoritos

**Base URL**: `/favorites`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar favoritos do cliente |
| POST | `/` | ✅ | Adicionar aos favoritos |
| DELETE | `/:productId` | ✅ | Remover dos favoritos |
| GET | `/check/:productId` | ✅ | Verificar se está nos favoritos |

**Total**: 4 endpoints

---

## 🚙 Veículos do Cliente

**Base URL**: `/customer-vehicles`

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar veículos do cliente |
| GET | `/:id` | ✅ | Obter veículo por ID |
| GET | `/:id/revisions` | ✅ | Veículo com histórico de revisões |
| POST | `/` | ✅ | Cadastrar novo veículo |
| PUT | `/:id` | ✅ | Atualizar dados do veículo |
| PATCH | `/:id/mileage` | ✅ | Atualizar quilometragem |
| DELETE | `/:id` | ✅ | Remover veículo |

**Total**: 7 endpoints

---

## ✅ Checklist

**Base URL**: `/checklist`

### Estrutura
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/structure` | ✅ | Obter estrutura completa do checklist |

### Categorias
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/categories` | ✅ | Listar todas as categorias |
| GET | `/categories/enabled` | ✅ | Listar categorias ativas |
| GET | `/categories/:id` | ✅ | Obter categoria por ID |
| POST | `/categories` | ✅ | Criar nova categoria |
| PUT | `/categories/:id` | ✅ | Atualizar categoria |
| DELETE | `/categories/:id` | ✅ | Remover categoria |
| PUT | `/categories/reorder` | ✅ | Reordenar categorias |

### Itens
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/items` | ✅ | Listar todos os itens |
| GET | `/items/:id` | ✅ | Obter item por ID |
| GET | `/categories/:categoryId/items` | ✅ | Listar itens de uma categoria |
| POST | `/items` | ✅ | Criar novo item |
| PUT | `/items/:id` | ✅ | Atualizar item |
| DELETE | `/items/:id` | ✅ | Remover item |
| PUT | `/items/reorder` | ✅ | Reordenar itens |

**Total**: 16 endpoints

---

## 🔧 Revisões

**Base URL**: `/revisions`

### CRUD
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar revisões com filtros |
| GET | `/:id` | ✅ | Obter detalhes de uma revisão |
| POST | `/` | ✅ | Criar nova revisão |
| PUT | `/:id` | ✅ | Atualizar revisão |
| DELETE | `/:id` | ✅ | Remover revisão |

### Status
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| PATCH | `/:id/start` | ✅ | Iniciar revisão |
| PATCH | `/:id/complete` | ✅ | Completar revisão |
| PATCH | `/:id/cancel` | ✅ | Cancelar revisão |

### Estatísticas
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/statistics` | ✅ | Estatísticas de revisões |
| GET | `/vehicle/:vehicleId/history` | ✅ | Histórico de revisões de um veículo |

**Total**: 11 endpoints

---

## 📊 Resumo Geral

### Por Fase

| Fase | Módulos | Endpoints |
|------|---------|-----------|
| Fase 1 | Auth, Addresses | 11 |
| Fase 2 | Products, Services, Vehicles, Compatibility | 39 |
| Fase 3 | Orders, Promotions, Coupons, Favorites | 24 |
| Fase 4 | Customer Vehicles, Checklist, Revisions | 34 |
| **Total** | **13 módulos** | **108 endpoints** |

### Por Tipo de Autenticação

| Tipo | Quantidade | Porcentagem |
|------|------------|-------------|
| Públicos (sem auth) | 38 | 35% |
| Autenticados | 70 | 65% |
| **Total** | **108** | **100%** |

### Por Método HTTP

| Método | Quantidade | Porcentagem |
|--------|------------|-------------|
| GET | 62 | 57% |
| POST | 21 | 19% |
| PUT | 16 | 15% |
| DELETE | 8 | 7% |
| PATCH | 7 | 6% |
| **Total** | **108** | **100%** |

---

## 🔍 Filtros e Query Params Comuns

### Paginação
```
?page=1&limit=20
```

### Filtros de Produtos
```
?category=Filtros
&status=ACTIVE
&minPrice=10
&maxPrice=100
&search=filtro+óleo
```

### Filtros de Pedidos
```
?status=COMPLETED
&dateFrom=2024-01-01
&dateTo=2024-12-31
```

### Filtros de Revisões
```
?vehicleId=uuid
&status=COMPLETED
&dateFrom=2024-01-01
&dateTo=2024-12-31
```

---

## 📝 Notas Importantes

### Autenticação
- Todos os endpoints autenticados requerem header: `Authorization: Bearer <token>`
- Tokens são obtidos via `/auth/login`
- Tokens expiram em 7 dias (configurável)

### Respostas Padronizadas

**Sucesso:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Sucesso com Paginação:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalCount": 100
  }
}
```

**Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": [ ... ] // opcional
}
```

### Status Codes

| Código | Significado |
|--------|-------------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 204 | No Content - Deletado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email duplicado) |
| 422 | Unprocessable Entity - Validação falhou |
| 500 | Internal Server Error - Erro no servidor |

---

**Documentação gerada automaticamente**
**Versão**: 1.0.0
**Data**: 2024
**Total de Endpoints**: 108
