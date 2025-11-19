# 📊 Análise Completa do Fluxo de Orçamentos

**Data:** 19/01/2025
**Sistema:** Moria Peças e Serviços

---

## 📋 Índice

1. [Situação Atual](#situação-atual)
2. [Análise Detalhada dos Fluxos](#análise-detalhada-dos-fluxos)
3. [Problemas Identificados](#problemas-identificados)
4. [Proposta de Solução](#proposta-de-solução)
5. [Diagrama de Fluxos](#diagrama-de-fluxos)

---

## 🔍 Situação Atual

### Estrutura Atual do Sistema

#### 1. **Página de Orçamentos (Admin)**
**Localização:** [AdminContent.tsx:697-875](apps/frontend/src/components/admin/AdminContent.tsx#L697-L875)

**O que existe:**
- ✅ Lista de orçamentos solicitados
- ✅ Busca e filtros (status, cliente)
- ✅ Modal para precificar serviços ([QuoteModal.tsx](apps/frontend/src/components/admin/QuoteModal.tsx))
- ✅ Badges visuais por status (PENDING, ANALYZING, QUOTED, APPROVED, REJECTED)
- ✅ Exportação para CSV/Excel
- ✅ Botão de contato via WhatsApp

**O que NÃO existe:**
- ❌ **Botão "Criar Orçamento"** (como existe para pedidos)
- ❌ **Modal de criação de orçamento** (similar ao [CreateOrderModal.tsx](apps/frontend/src/components/admin/CreateOrderModal.tsx))
- ❌ **Seleção de cliente existente**
- ❌ **Seleção de serviços do catálogo**

#### 2. **Página de Pedidos (Admin)**
**Localização:** [CreateOrderModal.tsx](apps/frontend/src/components/admin/CreateOrderModal.tsx)

**Recursos completos:**
- ✅ Modal wizard em 4 etapas
  1. **Cliente:** Busca cliente existente ou cria novo
  2. **Itens:** Seleciona produtos e serviços do catálogo
  3. **Endereço:** Usa endereço cadastrado ou cria novo (com busca CEP)
  4. **Pagamento:** Seleciona forma de pagamento e cupom
- ✅ Validação em cada etapa
- ✅ Feedback visual completo
- ✅ Integração com estoque (produtos)
- ✅ Auto-salvamento de endereço no cadastro do cliente

---

## 🔄 Análise Detalhada dos Fluxos

### Fluxo 1: Orçamento via Checkout Público

**Origem:** Cliente na página pública adiciona serviços ao carrinho

```
1. Cliente navega pelo site
2. Adiciona SERVIÇOS ao carrinho
3. Clica em "Finalizar Pedido"
4. Preenche dados no CheckoutDrawer
   - Nome, email, WhatsApp
   - Endereço completo (com busca CEP)
   - Forma de pagamento
5. ✅ API: POST /orders/guest
   - Cria Customer (se não existe)
   - Cria Address
   - Cria Order com:
     * status: 'PENDING'
     * quoteStatus: 'PENDING' (se hasServices = true)
     * items com priceQuoted = false
6. Cliente recebe feedback: "Pedido criado! Entraremos em contato"
```

**Observações:**
- ✅ Fluxo funcional e bem estruturado
- ✅ Separa hasProducts e hasServices
- ✅ Se tem serviços, quoteStatus é definido automaticamente
- ❌ **Cliente NÃO tem visibilidade do orçamento depois**

### Fluxo 2: Precificação e Aprovação (Admin)

**Origem:** Admin recebe orçamento pendente

```
1. Admin vê orçamento na lista (status: PENDING)
2. Clica em "💰 Precificar"
3. QuoteModal abre mostrando:
   - Dados do cliente
   - Lista de serviços solicitados
   - Campos para preencher preço unitário
   - Total calculado automaticamente
4. Admin preenche preços
5. Opção A: Clica em "Salvar"
   - ✅ API: PATCH /admin/quotes/:id/prices
   - Status muda: PENDING → QUOTED
   - quotedAt é preenchido
6. Opção B: Clica em "Salvar e Aprovar"
   - ✅ API: PATCH /admin/quotes/:id/prices (PENDING → QUOTED)
   - ✅ API: PATCH /admin/quotes/:id/approve (QUOTED → APPROVED)
   - quoteApprovedAt é preenchido
7. Admin pode enviar via WhatsApp
   - Mensagem formatada com preços
   - Validade do orçamento
   - Link para WhatsApp abre
```

**Código Backend - Aprovação:**
[admin.service.ts:479-499](apps/backend/src/modules/admin/admin.service.ts#L479-L499)
```typescript
async approveQuote(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });

  if (order.quoteStatus !== 'QUOTED') {
    throw new Error('Orçamento precisa estar no status QUOTED para ser aprovado');
  }

  return prisma.order.update({
    where: { id },
    data: {
      quoteStatus: 'APPROVED',
      quoteApprovedAt: new Date(),
    },
  });
}
```

**Observações:**
- ✅ Fluxo de precificação bem estruturado
- ✅ Validação de estados
- ⚠️ **Aprovação muda apenas quoteStatus, não o status do pedido**
- ❌ **Após aprovar, NADA acontece automaticamente**

### Fluxo 3: "O Que Acontece Após Aprovação?"

**Estado atual do banco:**
```sql
Order {
  status: 'PENDING'           -- Continua PENDING!
  quoteStatus: 'APPROVED'     -- Apenas isso muda
  quoteApprovedAt: timestamp
  items: [
    { quotedPrice: X, priceQuoted: true }
  ]
}
```

**O que o sistema NÃO faz:**
- ❌ Não muda o status do pedido para "IN_PRODUCTION"
- ❌ Não notifica o cliente automaticamente
- ❌ Não cria um pedido de produção
- ❌ **Não há painel do cliente para visualizar orçamentos**
- ❌ Não há integração com fluxo de pedidos

**Problemas:**
1. Cliente não sabe que orçamento foi aprovado
2. Admin deve enviar WhatsApp manualmente
3. Orçamento aprovado não vira pedido automaticamente
4. Não há controle de prazo de produção/entrega

---

## ❌ Problemas Identificados

### 1. **Falta Modal de Criação de Orçamentos**

**Problema:**
- Admin não pode criar orçamento pro-ativamente
- Só pode precificar orçamentos que chegam via site
- Não há como criar orçamento para cliente que liga/envia WhatsApp

**Impacto:**
- ⚠️ Admin precisa usar sistema paralelo (WhatsApp, planilha)
- ⚠️ Dados de orçamentos offline não ficam no sistema
- ⚠️ Perde rastreabilidade e histórico

### 2. **Orçamento Aprovado não Vira Pedido**

**Problema:**
- Após aprovação, Order continua com status 'PENDING'
- Não entra no fluxo de produção
- Admin tem que "lembrar" de mudar status manualmente

**Impacto:**
- ⚠️ Orçamento aprovado fica "perdido"
- ⚠️ Não aparece na lista de pedidos em produção
- ⚠️ Risco de atraso e esquecimento

### 3. **Cliente Não Vê Orçamentos**

**Problema:**
- Cliente solicita orçamento via site
- Recebe resposta via WhatsApp (manual do admin)
- **Não há painel do cliente** mostrando:
  - Orçamentos pendentes
  - Orçamentos respondidos
  - Orçamentos aprovados/rejeitados
  - Histórico de valores

**Impacto:**
- ⚠️ Experiência do cliente ruim (depende de WhatsApp)
- ⚠️ Cliente não tem visibilidade do status
- ⚠️ Admin precisa responder tudo manualmente

### 4. **Duplicação de Dados (Order x Quote)**

**Problema atual:**
- Sistema usa tabela `Order` para tudo
- Campo `quoteStatus` diferencia orçamentos
- Mas interface Quote no frontend trata como entidade separada

**Confusão:**
```typescript
// Backend: Tudo é Order
Order {
  quoteStatus: 'QUOTED' | 'APPROVED' | ...
}

// Frontend: Chama de Quote
Quote {
  status: 'QUOTED' | 'APPROVED' | ...
}
```

### 5. **Falta de Notificação Automatizada**

**Problema:**
- Cliente solicita orçamento → Sem notificação pro admin
- Admin responde orçamento → Tem que enviar WhatsApp manualmente
- Cliente aprova → Sem confirmação automática

**Impacto:**
- ⚠️ Dependência total de comunicação manual
- ⚠️ Risco de perder solicitações
- ⚠️ Workflow ineficiente

---

## ✨ Proposta de Solução

### Solução 1: Modal de Criação de Orçamentos

**Implementar:** `CreateQuoteModal.tsx` (similar ao CreateOrderModal)

**Estrutura (4 etapas):**

#### Etapa 1: Cliente
```typescript
- Busca cliente existente (autocomplete)
- Ou cria novo cliente:
  * Nome, email, WhatsApp
  * CPF (opcional)
```

#### Etapa 2: Serviços
```typescript
- Lista de serviços ativos do catálogo
- Busca por nome/categoria
- Adicionar serviços ao orçamento:
  * Nome do serviço
  * Quantidade
  * Campo "Observações" por item (ex: "peça X precisa ser importada")
```

#### Etapa 3: Precificação
```typescript
- Lista de serviços selecionados
- Campo de preço unitário para cada
- Cálculo de subtotal automático
- Total geral
- Campo "Observações gerais do orçamento"
- Campo "Validade (dias)" (padrão: 7)
```

#### Etapa 4: Endereço (Opcional)
```typescript
- "Este orçamento precisa de endereço de entrega?"
  [ ] Sim (mostrar formulário de endereço)
  [ ] Não (cliente buscará na loja)
```

**Ações finais:**
```typescript
[Salvar como Rascunho]  // quoteStatus: 'ANALYZING'
[Enviar para Cliente]   // quoteStatus: 'QUOTED' + Enviar via WhatsApp/Email
```

**API necessária:**
```typescript
POST /admin/quotes
Body: {
  customerId?: string,        // Se cliente existente
  customerData?: {...},       // Se cliente novo
  items: [
    {
      serviceId: string,
      quantity: number,
      quotedPrice: number,
      observations?: string
    }
  ],
  observations?: string,
  validityDays: number,
  address?: {...}
}
```

### Solução 2: Transformar Orçamento Aprovado em Pedido

**Implementar:** Endpoint e lógica de transição

**Opção A: Aprovação Automática Vira Pedido**
```typescript
// Ao aprovar orçamento
PATCH /admin/quotes/:id/approve
→ quoteStatus: APPROVED
→ status: IN_PRODUCTION  // ✅ Muda status do pedido!
→ Cria notificação pro cliente
→ Envia email/WhatsApp automático
```

**Opção B: Botão "Converter em Pedido"**
```typescript
// Após aprovar, admin pode:
[Converter em Pedido de Produção]
→ Abre modal confirmando dados
→ Define prazo estimado
→ Cria pedido efetivo
→ Status: IN_PRODUCTION
```

**Fluxo proposto (Opção A - Recomendada):**
```
1. Admin precifica serviços
2. Clica "Salvar e Aprovar"
3. Sistema:
   ✅ quoteStatus: PENDING → QUOTED → APPROVED
   ✅ status: PENDING → IN_PRODUCTION
   ✅ Envia notificação pro cliente (WhatsApp + Email)
   ✅ Pedido aparece na aba "Pedidos" com status "Em Produção"
4. Admin gerencia produção normalmente
5. Ao concluir: status → COMPLETED
```

### Solução 3: Painel do Cliente (Dashboard)

**Implementar:** Página `/my-account` ou `/dashboard`

**Seções:**

#### 3.1. Meus Orçamentos
```typescript
Tabs:
- Pendentes (quoteStatus: PENDING | ANALYZING)
- Respondidos (quoteStatus: QUOTED)
- Aprovados (quoteStatus: APPROVED)
- Rejeitados (quoteStatus: REJECTED)

Card de Orçamento:
┌─────────────────────────────────────┐
│ 🔧 Orçamento #O-ABC123              │
│ [Badge: Respondido]                 │
│                                     │
│ Solicitado em: 15/01/2025          │
│ Respondido em: 16/01/2025          │
│                                     │
│ Serviços:                           │
│ • Troca de óleo (2x)                │
│ • Alinhamento                       │
│                                     │
│ Total: R$ 250,00                    │
│ Validade: até 23/01/2025           │
│                                     │
│ [Ver Detalhes] [Aprovar] [Recusar] │
└─────────────────────────────────────┘
```

#### 3.2. Meus Pedidos
```typescript
- Lista de pedidos com produtos/serviços
- Status: PENDING, IN_PRODUCTION, SHIPPED, COMPLETED
- Tracking de entrega
```

#### 3.3. Meus Veículos
```typescript
- Lista de veículos cadastrados
- Histórico de revisões por veículo
```

**API necessária:**
```typescript
GET /customers/me/quotes
GET /customers/me/orders
PATCH /customers/quotes/:id/approve  // Cliente aprova
PATCH /customers/quotes/:id/reject   // Cliente recusa
```

### Solução 4: Sistema de Notificações

**Implementar:** Serviço de notificações automáticas

**Eventos:**

1. **Nova Solicitação de Orçamento**
   - Cliente solicita via site
   - ✅ Notifica admin via:
     - Dashboard (badge de notificação)
     - Email (opcional)
     - WhatsApp (opcional via Twilio/WPPConnect)

2. **Orçamento Respondido**
   - Admin precifica e envia
   - ✅ Notifica cliente via:
     - Email com detalhes
     - WhatsApp com link para ver no painel
     - SMS (opcional)

3. **Orçamento Aprovado pelo Cliente**
   - Cliente aprova no painel
   - ✅ Notifica admin via:
     - Dashboard (badge)
     - Email
   - ✅ Converte automaticamente em pedido

4. **Status do Pedido Atualizado**
   - Admin muda status (IN_PRODUCTION → COMPLETED)
   - ✅ Notifica cliente:
     - Email
     - WhatsApp

**Estrutura de Notificações:**
```typescript
model Notification {
  id        String   @id @default(uuid())
  userId    String   // Admin ou Customer
  type      NotificationType
  title     String
  message   String
  data      Json?    // Dados contextuais (orderId, etc)
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

enum NotificationType {
  NEW_QUOTE_REQUEST
  QUOTE_RESPONDED
  QUOTE_APPROVED
  QUOTE_REJECTED
  ORDER_STATUS_UPDATED
}
```

### Solução 5: Unificar Nomenclatura

**Problema:** Confusão entre Order e Quote

**Proposta:** Manter estrutura atual, mas padronizar nomenclatura

**Backend (Prisma):**
```prisma
model Order {
  // ... campos existentes

  // Para pedidos com produtos
  status: OrderStatus           // PENDING, IN_PRODUCTION, SHIPPED, COMPLETED, CANCELLED

  // Para pedidos com serviços (orçamentos)
  quoteStatus: QuoteStatus?     // PENDING, ANALYZING, QUOTED, APPROVED, REJECTED
  quotedAt: DateTime?
  quoteApprovedAt: DateTime?
  quoteNotes: String?

  // Flags
  hasProducts: Boolean
  hasServices: Boolean
}
```

**Frontend:**
- Aba "Pedidos": Mostra orders com **hasProducts = true**
- Aba "Orçamentos": Mostra orders com **hasServices = true** e **quoteStatus != null**

**Vantagem:**
- ✅ Não precisa migrar dados
- ✅ Mantém histórico
- ✅ Apenas melhora semântica do código

---

## 📊 Diagrama de Fluxos

### Fluxo Atual (Problemático)

```
┌─────────────┐
│   CLIENTE   │
│  (Website)  │
└──────┬──────┘
       │ Adiciona serviços
       │ Faz checkout
       ▼
┌─────────────────────┐
│  POST /orders/guest │
│                     │
│ Order criado:       │
│ status: PENDING     │
│ quoteStatus: PENDING│
└──────┬──────────────┘
       │
       │ ❌ Cliente não vê mais
       ▼
┌─────────────┐
│    ADMIN    │
│  (Painel)   │
└──────┬──────┘
       │ Precifica
       │ PATCH /admin/quotes/:id/prices
       ▼
┌─────────────────────┐
│ quoteStatus: QUOTED │
└──────┬──────────────┘
       │
       │ Envia WhatsApp (manual)
       ▼
┌─────────────┐
│   CLIENTE   │
│ (WhatsApp)  │
└──────┬──────┘
       │ ❌ Cliente não pode aprovar online
       │ ❌ Tem que responder WhatsApp
       ▼
┌─────────────┐
│    ADMIN    │
│  (Manual)   │
└──────┬──────┘
       │ PATCH /admin/quotes/:id/approve
       ▼
┌──────────────────────┐
│ quoteStatus: APPROVED│
│ status: PENDING      │ ❌ Continua PENDING!
└──────────────────────┘
       │
       │ ❌ E agora? Nada acontece!
       ▼
     [FIM]
```

### Fluxo Proposto (Otimizado)

```
┌─────────────┐
│   CLIENTE   │
│  (Website)  │
└──────┬──────┘
       │ Adiciona serviços
       │ Faz checkout
       ▼
┌─────────────────────┐
│  POST /orders/guest │
│                     │
│ Order criado:       │
│ status: PENDING     │
│ quoteStatus: PENDING│
└──────┬──────────────┘
       │
       │ ✅ Notifica admin (dashboard + email)
       ▼
┌─────────────┐
│    ADMIN    │
│  (Painel)   │
└──────┬──────┘
       │ Precifica
       │ PATCH /admin/quotes/:id/prices
       ▼
┌─────────────────────┐
│ quoteStatus: QUOTED │
└──────┬──────────────┘
       │
       │ ✅ Notifica cliente automaticamente
       │    - Email com detalhes
       │    - WhatsApp com link
       ▼
┌─────────────┐
│   CLIENTE   │
│  (Painel)   │ ✅ Novo!
└──────┬──────┘
       │ Vê orçamento
       │ Clica "Aprovar"
       │ PATCH /customers/quotes/:id/approve
       ▼
┌──────────────────────────┐
│ quoteStatus: APPROVED    │
│ status: IN_PRODUCTION ✅ │ Muda automaticamente!
└──────┬───────────────────┘
       │
       │ ✅ Notifica admin
       │ ✅ Aparece em "Pedidos em Produção"
       ▼
┌─────────────┐
│    ADMIN    │
│ (Produção)  │
└──────┬──────┘
       │ Trabalha no pedido
       │ PATCH /admin/orders/:id/status
       ▼
┌──────────────────────┐
│ status: COMPLETED ✅ │
└──────┬───────────────┘
       │
       │ ✅ Notifica cliente (concluído)
       ▼
┌─────────────┐
│   CLIENTE   │
│ (Satisfeito)│
└─────────────┘
```

### Fluxo Alternativo: Admin Cria Orçamento

```
┌─────────────┐
│    ADMIN    │
│  (Painel)   │
└──────┬──────┘
       │ Clica "Criar Orçamento" ✅ Novo!
       │ Abre CreateQuoteModal
       ▼
┌──────────────────────┐
│ 1. Seleciona Cliente │
│ 2. Seleciona Serviços│
│ 3. Define Preços     │
│ 4. Endereço (Opt.)   │
└──────┬───────────────┘
       │
       │ POST /admin/quotes
       ▼
┌─────────────────────────┐
│ Order criado:           │
│ status: PENDING         │
│ quoteStatus: ANALYZING  │ ✅ Rascunho
└──────┬──────────────────┘
       │
       │ Admin revisa
       │ Clica "Enviar para Cliente"
       ▼
┌─────────────────────┐
│ quoteStatus: QUOTED │
└──────┬──────────────┘
       │
       │ ✅ Envia notificação
       │
       ▼
   [Fluxo normal continua...]
```

---

## 🎯 Priorização das Soluções

### Fase 1 - Crítico (2-3 dias)
1. ✅ **Modal de Criação de Orçamentos**
   - Permite admin criar orçamentos pro-ativamente
   - Essencial para operação dia-a-dia

2. ✅ **Converter Orçamento Aprovado → Pedido**
   - Fecha o fluxo atual quebrado
   - Simples de implementar (apenas muda status)

### Fase 2 - Importante (1 semana)
3. ✅ **Painel do Cliente**
   - Melhora experiência do cliente
   - Reduz trabalho manual do admin
   - Permite aprovação online

### Fase 3 - Melhorias (1-2 semanas)
4. ✅ **Sistema de Notificações**
   - Automatiza comunicação
   - Reduz esquecimentos
   - Profissionaliza atendimento

5. ✅ **Unificação de Nomenclatura**
   - Melhora manutenção do código
   - Facilita onboarding de novos devs

---

## 📝 Checklist de Implementação

### Backend

- [ ] **Criar endpoint de criação de orçamento**
  ```typescript
  POST /admin/quotes
  ```

- [ ] **Modificar endpoint de aprovação**
  ```typescript
  PATCH /admin/quotes/:id/approve
  // Adicionar: mudar status para IN_PRODUCTION
  ```

- [ ] **Criar endpoints do painel do cliente**
  ```typescript
  GET /customers/me/quotes
  PATCH /customers/quotes/:id/approve
  PATCH /customers/quotes/:id/reject
  ```

- [ ] **Criar modelo de notificações**
  ```prisma
  model Notification { ... }
  ```

- [ ] **Implementar serviço de notificações**
  - Email (Nodemailer)
  - WhatsApp (WPPConnect/Twilio - opcional)

### Frontend

- [ ] **Criar CreateQuoteModal.tsx**
  - Baseado em CreateOrderModal
  - 4 etapas (Cliente, Serviços, Preços, Endereço)

- [ ] **Adicionar botão "Criar Orçamento" no AdminContent**

- [ ] **Modificar QuoteModal**
  - Adicionar indicador quando orçamento foi criado pelo admin

- [ ] **Criar página /my-account**
  - Seção "Meus Orçamentos"
  - Seção "Meus Pedidos"
  - Seção "Meus Veículos"

- [ ] **Criar NotificationCenter**
  - Badge de notificações não lidas
  - Dropdown com lista
  - Marcar como lida

- [ ] **Atualizar AdminContent**
  - Quando aprovar orçamento, mostrar feedback:
    "Orçamento aprovado e convertido em pedido de produção"

---

## 🚀 Resumo Executivo

### Situação
O sistema atual de orçamentos está **funcional mas incompleto**:
- ✅ Cliente pode solicitar via site
- ✅ Admin pode precificar
- ❌ Admin não pode criar orçamentos
- ❌ Cliente não tem visibilidade após solicitar
- ❌ Orçamento aprovado não vira pedido automaticamente

### Impacto
- ⚠️ Workflow ineficiente (muita comunicação manual)
- ⚠️ Experiência do cliente ruim (depende de WhatsApp)
- ⚠️ Risco de perder orçamentos/pedidos
- ⚠️ Dados ficam fora do sistema

### Solução
Implementar **5 melhorias prioritárias**:
1. Modal de criação de orçamentos (CRÍTICO)
2. Converter orçamento aprovado em pedido (CRÍTICO)
3. Painel do cliente (IMPORTANTE)
4. Sistema de notificações (MELHORIA)
5. Unificação de nomenclatura (MELHORIA)

### Resultado Esperado
- ✅ Admin pode criar orçamentos offline (telefone, WhatsApp)
- ✅ Orçamento aprovado vira pedido automaticamente
- ✅ Cliente vê orçamentos e pode aprovar online
- ✅ Comunicação automatizada (menos trabalho manual)
- ✅ Sistema completo e profissional

---

## 📞 Próximos Passos

**Aguardando suas instruções para:**

1. Qual fase implementar primeiro?
2. Alguma alteração na proposta?
3. Começar pela implementação do CreateQuoteModal?

---

**Documento criado por Claude Code**
*Última atualização: 19/01/2025*
