# 📋 Sistema de Ofertas - Documentação Completa

## 🎯 Visão Geral

O Sistema de Ofertas permite criar promoções destacadas na landing page pública, com três tipos diferentes:
- **🔥 Ofertas do Dia** - Destacadas com timer de contagem regressiva
- **⭐ Ofertas da Semana** - Seção especial de promoções semanais
- **💎 Ofertas do Mês** - Seção premium de ofertas mensais

---

## ✅ Correções Implementadas (26/11/2025)

### Problema Identificado
Ofertas da SEMANA e MÊS não apareciam na landing page porque:
- Campos de data eram opcionais no frontend mas obrigatórios na query do backend
- Faltava validação que garantisse consistência dos dados
- Não havia feedback visual claro para o lojista sobre campos obrigatórios

### Solução Implementada

#### 1. **Frontend - ProductModal.tsx** ✅

**Smart Defaults Automáticos:**
```typescript
// Quando o lojista seleciona um tipo de oferta, as datas são preenchidas automaticamente:
- DIA: hoje até amanhã (23:59:59)
- SEMANA: hoje até +7 dias (23:59:59)
- MÊS: hoje até +30 dias (23:59:59)
```

**Validações Completas:**
- ✅ Datas obrigatórias quando tipo de oferta selecionado
- ✅ Data de fim deve ser posterior à data de início
- ✅ Preço promocional obrigatório e deve ser menor que preço normal
- ✅ Campos desabilitados quando sem tipo de oferta
- ✅ Indicador visual (*) para campos obrigatórios
- ✅ Mensagens de erro claras e específicas

#### 2. **Backend - DTOs** ✅

**create-product.dto.ts:**
```typescript
// Validações refinadas com Zod:
.refine() - Se offerType presente, exige offerStartDate
.refine() - Se offerType presente, exige offerEndDate
.refine() - Se offerType presente, exige promoPrice > 0
.refine() - Data de fim deve ser posterior à data de início
.refine() - Preço promocional deve ser menor que preço de venda
.transform() - Se sem offerType, limpa campos de oferta automaticamente
```

**update-product.dto.ts:**
```typescript
// Mesmas validações do create, adaptadas para update
// Permite remover oferta setando offerType como null
```

#### 3. **Backend - products.service.ts** ✅

**Método de Validação:**
```typescript
validateOfferData(offerType, offerStartDate, offerEndDate, promoPrice, salePrice):
  - Valida datas obrigatórias
  - Valida período (fim > início)
  - Valida preço promocional obrigatório e menor que preço normal
  - Valida data de início não muito no passado (máx 1 dia)
```

**Integração:**
- ✅ Validação em `createProduct()`
- ✅ Validação em `updateProduct()` (merge com dados existentes)

---

## 📖 Como Usar (Guia para Lojistas)

### Criando uma Oferta do Dia

1. Acesse **Store Panel > Produtos**
2. Clique em **"+ Novo Produto"** ou edite um produto existente
3. Preencha as informações básicas (Nome, Categoria, etc.)
4. Na aba **"Preços"**:
   - Defina o **Preço de Venda** (ex: R$ 100,00)
   - Defina o **Preço Promocional** (ex: R$ 79,90)
5. Na aba **"Ofertas"**:
   - Selecione **"🔥 Oferta do Dia"**
   - As datas serão preenchidas automaticamente (hoje até amanhã)
   - Ajuste as datas se necessário
   - Adicione um **Badge** opcional (ex: "LIMITADO", "ÚLTIMA UNIDADE")
6. Clique em **"Salvar"**

✅ **Resultado:** Produto aparece na seção "Ofertas do Dia" com timer de contagem regressiva

### Criando uma Oferta da Semana

1. Mesmos passos acima
2. Na aba **"Ofertas"**:
   - Selecione **"⭐ Oferta da Semana"**
   - As datas serão preenchidas automaticamente (hoje até +7 dias)
   - Ajuste conforme necessário
3. Clique em **"Salvar"**

✅ **Resultado:** Produto aparece na seção "Ofertas da Semana"

### Criando uma Oferta do Mês

1. Mesmos passos acima
2. Na aba **"Ofertas"**:
   - Selecione **"💎 Oferta do Mês"**
   - As datas serão preenchidas automaticamente (hoje até +30 dias)
   - Ajuste conforme necessário
3. Clique em **"Salvar"**

✅ **Resultado:** Produto aparece na seção "Ofertas do Mês" com destaque especial

---

## 🔧 Fluxo Técnico Completo

### Frontend → Backend

```
1. Lojista seleciona tipo de oferta (DIA/SEMANA/MES)
   ↓
2. ProductModal aplica smart defaults nas datas
   ↓
3. Lojista preenche preço promocional
   ↓
4. Validação frontend (validateForm):
   - Datas obrigatórias ✓
   - Data fim > Data início ✓
   - Preço promo < Preço venda ✓
   ↓
5. FormData → JSON → FormData (upload)
   ↓
6. POST/PUT /products/:id (com credentials: 'include')
   ↓
7. Backend recebe e valida:
   - DTO Zod Schema ✓
   - .refine() validations ✓
   - products.service.validateOfferData() ✓
   ↓
8. Prisma salva no banco de dados
   ↓
9. Response success → Modal fecha → Lista atualiza
```

### Landing Page (Exibição Pública)

```
1. Página carrega (Index.tsx)
   ↓
2. Componente <Promotions /> monta
   ↓
3. useEffect dispara 3 requests paralelos:
   - offerService.getOffersByType('DIA')
   - offerService.getOffersByType('SEMANA')
   - offerService.getOffersByType('MES')
   ↓
4. API: GET /products/offers/active?type=DIA|SEMANA|MES
   ↓
5. products.service.getActiveOffers(type):
   - Filtra por: status=ACTIVE, offerType=tipo, promoPrice != null
   - Filtra por período: offerStartDate <= NOW <= offerEndDate
   ↓
6. Retorna produtos filtrados
   ↓
7. Frontend converte para PromotionalProduct
   ↓
8. Renderiza nas seções correspondentes:
   - DIA: Com timer countdown
   - SEMANA: Sem timer
   - MÊS: Destaque especial gold
```

---

## 🎨 Interface Visual

### ProductModal - Aba Ofertas

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Ofertas Especiais (Dia/Semana/Mês)                   │
│ Configure este produto como oferta destacada...         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Tipo de Oferta                 Badge da Oferta          │
│ [🔥 Oferta do Dia ▼]          [LIMITADO        ]       │
│ Exibido com timer...           Texto opcional            │
│                                                          │
│ Data/Hora Início *             Data/Hora Fim *           │
│ [2025-11-26 00:00]            [2025-11-27 23:59]        │
│ Quando a oferta começa         Quando expira             │
│ (preenchido automaticamente)   (preenchido automaticamente)│
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📝 Lembre-se:                                       │  │
│ │ • Configure o Preço Promocional na aba "Preços"    │  │
│ │ • A oferta só aparece se dentro do período         │  │
│ │ • Produtos INATIVOS não aparecem nas ofertas       │  │
│ │ • Desconto calculado automaticamente               │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Landing Page - Seção Ofertas do Dia

```
┌─────────────────────────────────────────────────────────┐
│ ⏰ Ofertas do Dia            ⏱️ [12:45:33]              │
│ Válido até meia-noite                                    │
├─────────────────────────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                │
│ │-25%  │  │-30%  │  │-40%  │  │-15%  │                │
│ │LIMIT.│  │      │  │      │  │      │                │
│ │[IMG] │  │[IMG] │  │[IMG] │  │[IMG] │                │
│ │Filtro│  │Óleo  │  │Pastil│  │Vela  │                │
│ │R$75  │  │R$35  │  │R$90  │  │R$42  │                │
│ │[Add] │  │[Add] │  │[Add] │  │[Add] │                │
│ └──────┘  └──────┘  └──────┘  └──────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Regras de Negócio

### Ofertas Ativas

Uma oferta SÓ aparece na landing page se:
1. ✅ Produto com `status = ACTIVE`
2. ✅ `offerType` definido (DIA | SEMANA | MES)
3. ✅ `promoPrice` definido e > 0
4. ✅ `offerStartDate` <= Data Atual
5. ✅ `offerEndDate` >= Data Atual
6. ✅ `promoPrice` < `salePrice`

### Validações Backend

**Criação/Atualização de Produto:**
```
SE offerType definido:
  ENTÃO:
    - offerStartDate é OBRIGATÓRIO
    - offerEndDate é OBRIGATÓRIO
    - promoPrice é OBRIGATÓRIO e > 0
    - offerEndDate > offerStartDate
    - promoPrice < salePrice
    - offerStartDate não pode ser > 1 dia no passado
  SENÃO:
    - Campos de oferta são limpos (null)
```

### Smart Defaults

**Quando lojista seleciona tipo de oferta:**
```javascript
DIA: {
  startDate: HOJE às 00:00:00,
  endDate: AMANHÃ às 23:59:59
}

SEMANA: {
  startDate: HOJE às 00:00:00,
  endDate: HOJE + 7 DIAS às 23:59:59
}

MÊS: {
  startDate: HOJE às 00:00:00,
  endDate: HOJE + 30 DIAS às 23:59:59
}
```

---

## 🧪 Testes

### Teste Manual - Criação de Ofertas

**Oferta do Dia:**
1. Criar produto com tipo "DIA"
2. Verificar datas preenchidas automaticamente
3. Salvar produto
4. Acessar landing page
5. ✅ Produto deve aparecer em "Ofertas do Dia" com timer

**Oferta da Semana:**
1. Criar produto com tipo "SEMANA"
2. Verificar datas preenchidas automaticamente
3. Salvar produto
4. Acessar landing page
5. ✅ Produto deve aparecer em "Ofertas da Semana"

**Oferta do Mês:**
1. Criar produto com tipo "MES"
2. Verificar datas preenchidas automaticamente
3. Salvar produto
4. Acessar landing page
5. ✅ Produto deve aparecer em "Ofertas do Mês"

### Teste Manual - Validações

**Datas obrigatórias:**
1. Selecionar tipo de oferta
2. Limpar campo de data
3. Tentar salvar
4. ✅ Deve exibir erro: "Data de início é obrigatória para ofertas"

**Preço promocional obrigatório:**
1. Selecionar tipo de oferta
2. Não preencher preço promocional
3. Tentar salvar
4. ✅ Deve exibir erro: "Preço promocional é obrigatório para ofertas"

**Preço promocional maior que normal:**
1. Preço venda: R$ 100
2. Preço promocional: R$ 120
3. Tentar salvar
4. ✅ Deve exibir erro: "Preço promocional deve ser menor que o preço de venda"

---

## 📊 Estrutura de Dados

### Prisma Schema

```prisma
model Product {
  // ... outros campos

  // Ofertas (Dia/Semana/Mês)
  offerType      OfferType?
  offerStartDate DateTime?
  offerEndDate   DateTime?
  offerBadge     String? // Ex: "LIMITADO", "QUEIMA DE ESTOQUE"

  // ...
}

enum OfferType {
  DIA
  SEMANA
  MES
}
```

### API Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Filtro de Óleo Mann W75/3",
      "category": "Filtros",
      "salePrice": 100.00,
      "promoPrice": 79.90,
      "images": ["https://..."],
      "offerType": "DIA",
      "offerStartDate": "2025-11-26T00:00:00Z",
      "offerEndDate": "2025-11-27T23:59:59Z",
      "offerBadge": "LIMITADO"
    }
  ]
}
```

---

## 🚀 Melhorias Futuras

- [ ] Dashboard de análise de ofertas (conversão, vendas)
- [ ] Sistema de agendamento de ofertas (futuras)
- [ ] Notificações para clientes quando produto favorito entrar em oferta
- [ ] Histórico de ofertas passadas
- [ ] Templates de ofertas (Black Friday, Natal, etc.)
- [ ] Sistema de ofertas recorrentes (toda segunda-feira)

---

## 📝 Changelog

**26/11/2025 - v2.0.0**
- ✅ Implementado smart defaults automáticos
- ✅ Validação completa frontend e backend
- ✅ Correção do bug de ofertas SEMANA/MÊS não aparecerem
- ✅ Documentação completa do sistema

**Versão anterior:**
- ❌ Ofertas SEMANA/MÊS não apareciam
- ❌ Validações inconsistentes
- ❌ Sem feedback visual adequado
