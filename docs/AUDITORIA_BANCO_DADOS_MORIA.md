# AUDITORIA COMPLETA DO BANCO DE DADOS - APLICAÇÃO MORIA

## 📋 RESUMO EXECUTIVO

Esta auditoria identificou **TODAS** as tabelas necessárias para o funcionamento completo da aplicação Moria, analisando:
- ✅ Páginas públicas (catálogo, carrinho, checkout)
- ✅ Painel do cliente (CustomerPanel)
- ✅ Painel do lojista (StorePanel)
- ✅ APIs e integrações (supabaseApi.ts)

### Status Atual
- ✅ **6 tabelas principais** já existem no Supabase
- ⚠️ **7 tabelas adicionais** precisam ser criadas
- ⚠️ **Algumas colunas** precisam ser adicionadas às existentes

## 🔍 ANÁLISE DETALHADA DAS PÁGINAS

### 1. PÁGINAS PÚBLICAS

#### 1.1 Página Principal (Index.tsx)
**Componentes analisados:**
- `Header.tsx` - Navegação e busca
- `Marquee.tsx` - Promoções em destaque
- `Hero.tsx` - Banner principal
- `Services.tsx` - Lista de serviços
- `Products.tsx` - Catálogo de produtos
- `Promotions.tsx` - Promoções ativas
- `CartDrawer.tsx` - Carrinho de compras
- `CheckoutDrawer.tsx` - Finalização de pedidos

**Funcionalidades identificadas:**
- 🛍️ Catálogo de produtos com filtros por categoria
- 🔧 Lista de serviços ofertados
- 🛒 Sistema de carrinho misto (produtos + serviços)
- 🎯 Sistema de promoções e cupons
- 📱 Checkout via WhatsApp
- 👤 Criação de usuários provisórios

#### 1.2 CartDrawer.tsx
**Tabelas necessárias identificadas:**
- `products` - Dados dos produtos
- `services` - Dados dos serviços
- `coupons` - Validação de cupons
- `promotions` - Aplicação de promoções
- `provisional_users` - Usuários criados no checkout

#### 1.3 CheckoutDrawer.tsx
**Funcionalidades críticas:**
- Criação de pedidos de produtos (`orders`)
- Criação de orçamentos de serviços (`quotes`)
- Registro de usuários provisórios (`provisional_users`)
- Itens do pedido/orçamento (`order_items`, `quote_items`)

### 2. PAINEL DO CLIENTE

#### 2.1 CustomerPanel.tsx
**Análise dos componentes:**
- `CustomerDashboard.tsx` - Dashboard do cliente
- `CustomerOrders.tsx` - Histórico de pedidos
- `CustomerProfile.tsx` - Perfil e endereços
- `CustomerFavorites.tsx` - Produtos favoritos
- `CustomerSupport.tsx` - Suporte ao cliente

**Tabelas necessárias identificadas:**
- `customers` - Perfil completo dos clientes
- `customer_addresses` - Endereços de entrega
- `customer_favorites` - Sistema de favoritos
- `orders` - Histórico de pedidos
- `quotes` - Orçamentos solicitados

### 3. STORE-PANEL (PAINEL LOJISTA)

#### 3.1 StorePanel.tsx e AdminContent.tsx
**Funcionalidades administrativas completas:**

**Dashboard e Métricas:**
- Vendas do dia, semana, mês
- Produtos mais vendidos
- Status de pedidos em tempo real
- Alertas de estoque baixo

**Gestão de Produtos:**
- CRUD completo de produtos
- Controle de estoque
- Preços e promoções
- Categorização e filtros
- Upload de imagens
- Especificações técnicas

**Gestão de Serviços:**
- CRUD de serviços
- Preços e tempo estimado
- Categorização
- Status ativo/inativo

**Gestão de Pedidos:**
- Lista de todos os pedidos
- Filtros por status e data
- Atualização de status
- Detalhes completos do pedido
- Comunicação com cliente

**Sistema de Cupons:**
- Criação e edição de cupons
- Tipos de desconto (% ou valor fixo)
- Validade e limites de uso
- Aplicabilidade (produtos/serviços/todos)

**Sistema de Promoções:**
- Promoções sazonais
- Combos de produtos
- Pacotes de serviços
- Condições de aplicação

**Configurações da Loja:**
- Dados da empresa
- Configurações de vendas
- Preferências de notificações
- Integrações

**Relatórios:**
- Vendas por período
- Produtos mais vendidos
- Clientes mais ativos
- Análise de cupons
- Métricas de conversão

### 4. ANÁLISE DA API (supabaseApi.ts)

#### 4.1 Métodos identificados:
**Produtos:**
- `getProducts()` - Lista produtos com filtros
- `createProduct()`, `updateProduct()`, `deleteProduct()`
- Usa tabela: `products` e view: `products_view`

**Serviços:**
- `getServices()` - Lista serviços
- `createService()`, `updateService()`, `deleteService()`
- Usa tabela: `services`

**Pedidos:**
- `getOrders()` - Lista pedidos com filtros
- `createOrder()`, `updateOrder()`
- `getOrderItems()` - Itens do pedido
- Usa tabelas: `orders`, `order_items`

**Cupons:**
- `getCoupons()` - Lista cupons ativos
- `validateCoupon()` - Validação de cupons
- `createCoupon()`, `updateCoupon()`, `deleteCoupon()`
- Usa tabela: `coupons`

**Configurações:**
- `getSettings()` - Configurações do sistema
- `updateSetting()` - Atualiza configuração
- Usa tabela: `settings` ⚠️ **(NÃO EXISTE)**

**Outros métodos identificados:**
- `getCompanyInfo()` - Usa: `company_info` ⚠️ **(NÃO EXISTE)**
- `getPromotions()` - Usa: `promotions`

## 🗃️ TABELAS NECESSÁRIAS

### TABELAS EXISTENTES ✅

#### 1. PRODUCTS
**Status:** ✅ Existe no Supabase
```sql
-- Estrutura atual confirmada
id, name, description, category, price, sale_price, promo_price,
images, stock, is_active, rating, specifications, vehicle_compatibility,
created_at, updated_at
```

**Campos adicionais necessários:**
- `brand TEXT` - Marca do produto
- `supplier TEXT` - Fornecedor
- `sku TEXT UNIQUE` - Código de barras/SKU
- `min_stock INTEGER DEFAULT 5` - Estoque mínimo

#### 2. SERVICES
**Status:** ✅ Existe no Supabase
```sql
-- Estrutura confirmada
id, name, description, category, base_price, estimated_time,
specifications, is_active, created_at, updated_at
```

#### 3. ORDERS
**Status:** ✅ Existe no Supabase
```sql
-- Estrutura confirmada
id, order_number, customer_name, customer_email, customer_phone,
customer_address, status, total_amount, notes, user_id,
created_at, updated_at
```

**Campos adicionais necessários:**
- `customer_whatsapp TEXT` - WhatsApp do cliente
- `has_products BOOLEAN DEFAULT true` - Se tem produtos
- `delivery_address TEXT` - Endereço de entrega específico

#### 4. ORDER_ITEMS
**Status:** ✅ Existe no Supabase
```sql
-- Estrutura confirmada
id, order_id, type, item_id, item_name, quantity, unit_price, total_price
```

**Campos adicionais necessários:**
- `product_id UUID REFERENCES products(id)` - FK para produtos
- `service_id UUID REFERENCES services(id)` - FK para serviços

#### 5. COUPONS
**Status:** ✅ Existe no Supabase
```sql
-- Estrutura confirmada
id, code, description, discount_type, discount_value, min_amount,
max_uses, used_count, expires_at, is_active, created_at, updated_at
```

#### 6. PROMOTIONS
**Status:** ✅ Existe no Supabase
```sql
-- Estrutura confirmada
id, title, description, discount_type, discount_value, category,
min_amount, start_date, end_date, is_active, created_at, updated_at
```

### TABELAS FALTANTES ⚠️

#### 7. SETTINGS
**Status:** ⚠️ **NÃO EXISTE - CRÍTICA**
**Impacto:** Página de configurações não funciona
**Usado em:** StorePanel → Configurações

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Configurações identificadas no código:**
- `store_name`, `store_cnpj`, `store_phone`, `store_email`
- `store_address`, `store_hours`
- `default_margin`, `free_shipping_min`, `delivery_fee`
- `notifications_new_orders`, `notifications_low_stock`
- `notifications_weekly_reports`

#### 8. COMPANY_INFO
**Status:** ⚠️ **NÃO EXISTE**
**Usado em:** Páginas públicas, footer, sobre

```sql
CREATE TABLE company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  business_hours JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  services_list TEXT[] DEFAULT ARRAY[]::TEXT[],
  guarantees JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. QUOTES (Orçamentos)
**Status:** ⚠️ **NÃO EXISTE - CRÍTICA**
**Impacto:** Orçamentos de serviços não funcionam
**Usado em:** Checkout de serviços, painel admin

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT,
  customer_email TEXT,
  vehicle_info TEXT,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  notes TEXT,
  valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 10. QUOTE_ITEMS
**Status:** ⚠️ **NÃO EXISTE - CRÍTICA**
**Relacionado:** QUOTES

```sql
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  service_id UUID REFERENCES services(id),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 11. PROVISIONAL_USERS
**Status:** ⚠️ **NÃO EXISTE - CRÍTICA**
**Impacto:** Usuários criados no checkout não são persistidos
**Usado em:** CheckoutDrawer, sistema de autenticação simples

```sql
CREATE TABLE provisional_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT UNIQUE NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 12. CUSTOMERS
**Status:** ⚠️ **NÃO EXISTE**
**Impacto:** Painel do cliente limitado
**Usado em:** CustomerPanel completo

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 13. CUSTOMER_ADDRESSES
**Status:** ⚠️ **NÃO EXISTE**
**Relacionado:** CUSTOMERS

```sql
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('home', 'work', 'other')),
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 14. CUSTOMER_FAVORITES
**Status:** ⚠️ **NÃO EXISTE**
**Relacionado:** CUSTOMERS, PRODUCTS

```sql
CREATE TABLE customer_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);
```

## 🔗 RELACIONAMENTOS ENTRE TABELAS

### Relacionamentos Principais
```
CUSTOMERS (1) → (N) ORDERS
CUSTOMERS (1) → (N) QUOTES
CUSTOMERS (1) → (N) CUSTOMER_ADDRESSES
CUSTOMERS (1) → (N) CUSTOMER_FAVORITES

ORDERS (1) → (N) ORDER_ITEMS
QUOTES (1) → (N) QUOTE_ITEMS

PRODUCTS (1) → (N) ORDER_ITEMS
SERVICES (1) → (N) ORDER_ITEMS
PRODUCTS (1) → (N) QUOTE_ITEMS
SERVICES (1) → (N) QUOTE_ITEMS

PRODUCTS (1) → (N) CUSTOMER_FAVORITES

auth.users (1) → (1) CUSTOMERS
auth.users (1) → (N) ORDERS
auth.users (1) → (N) QUOTES
```

## 📊 ÍNDICES RECOMENDADOS

### Performance Critical
```sql
-- Produtos
CREATE INDEX idx_products_category_active ON products(category, is_active);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_products_sku ON products(sku);

-- Pedidos
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_orders_customer_whatsapp ON orders(customer_whatsapp);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Orçamentos
CREATE INDEX idx_quotes_status_created ON quotes(status, created_at);
CREATE INDEX idx_quotes_customer_whatsapp ON quotes(customer_whatsapp);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);

-- Cupons
CREATE INDEX idx_coupons_code_active ON coupons(code, is_active);
CREATE INDEX idx_coupons_expires ON coupons(expires_at);

-- Configurações
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);

-- Clientes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX idx_customer_favorites_customer ON customer_favorites(customer_id);
```

## 🔒 POLÍTICAS RLS NECESSÁRIAS

### Segurança por Tabela
```sql
-- PRODUTOS: Público para leitura, admin para escrita
-- SERVIÇOS: Público para leitura, admin para escrita
-- PEDIDOS: Proprietário + admin
-- ORÇAMENTOS: Proprietário + admin
-- CLIENTES: Próprio cliente + admin
-- ENDEREÇOS: Proprietário + admin
-- FAVORITOS: Proprietário + admin
-- CUPONS: Público para validação
-- PROMOÇÕES: Público quando ativas
-- CONFIGURAÇÕES: Apenas admin
-- COMPANY_INFO: Público para leitura, admin para escrita
-- PROVISIONAL_USERS: Sistema interno
```

## ❗ FUNCIONALIDADES IMPACTADAS

### Críticas (Sistema quebra sem essas tabelas)
- ❌ **Configurações da loja** (`settings`)
- ❌ **Orçamentos de serviços** (`quotes`, `quote_items`)
- ❌ **Usuários provisórios** (`provisional_users`)

### Importantes (Funcionalidades limitadas)
- ⚠️ **Painel do cliente completo** (`customers`, `customer_addresses`, `customer_favorites`)
- ⚠️ **Informações da empresa** (`company_info`)

### Opcionais (Melhorias futuras)
- 🔄 **Campos adicionais nas tabelas existentes** (brand, supplier, sku, etc.)

## 🎯 RECOMENDAÇÕES IMEDIATAS

### Prioridade ALTA (Executar primeiro)
1. Criar tabela `settings` - Para configurações funcionarem
2. Criar tabelas `quotes` e `quote_items` - Para orçamentos funcionarem
3. Criar tabela `provisional_users` - Para checkout funcionar completamente

### Prioridade MÉDIA
4. Criar tabelas de clientes (`customers`, `customer_addresses`, `customer_favorites`)
5. Adicionar campos faltantes nas tabelas existentes
6. Criar tabela `company_info`

### Prioridade BAIXA
7. Implementar todas as políticas RLS
8. Criar índices de performance
9. Criar views otimizadas

## 📋 CONCLUSÃO

A aplicação Moria possui uma arquitetura bem estruturada e funcional, mas **7 tabelas críticas** estão faltantes no banco de dados, impactando funcionalidades importantes como:

- Sistema de configurações da loja
- Orçamentos de serviços
- Painel completo do cliente
- Persistência de usuários provisórios

**Recomendação:** Execute o script SQL completo que será fornecido para criar todas as tabelas faltantes e adicionar os campos necessários às existentes. Isso garantirá o funcionamento completo de todas as funcionalidades da aplicação.