# ANÁLISE COMPLETA DE SCHEMA INTEGRATION - MORIA

## 🔍 RESUMO EXECUTIVO

A aplicação MORIA foi desenvolvida em camadas (banco → backend → frontend) causando **desconexões críticas** entre os schemas. Identificamos **32 inconsistências específicas** que impedem o funcionamento correto do CRUD admin e APIs públicas.

## 📊 PROBLEMAS IDENTIFICADOS POR ENTIDADE

### 1. **PROMOTIONS - CRÍTICO** ⚠️

#### **Database Schema (schema.prisma):**
```sql
model Promotion {
  title           String     ✅
  startDate       DateTime   ✅  
  endDate         DateTime   ✅
  category        String?    ✅
  minAmount       Float?     ✅
  -- CAMPOS QUE EXISTEM NO SCHEMA --
}
```

#### **Backend API (api.js) - PROBLEMAS:**
- ❌ **Linha 673**: Filtro por campo `type` (não existe)
- ❌ **Linhas 684-695**: Transforma campos inexistentes: `name`, `conditions`, `startsAt`, `endsAt`, `maxDiscount`
- ❌ **Linhas 757, 794**: Aceita campos inexistentes no create/update

#### **Frontend Hook (useAdminPromotions.js) - PROBLEMAS:**
- ❌ **Linha 73**: Validação de `name`, `type` (não existem)
- ❌ **Linhas 79-88**: Monta objeto com campos inexistentes: `name`, `type`, `conditions`, `maxDiscount`, `startsAt`, `endsAt`
- ❌ **Linha 142**: Usa `name` em mensagem de sucesso

#### **Frontend Modal (PromotionModal.tsx) - PROBLEMAS:**
- ❌ **Linhas 15-24**: Interface TypeScript com campos inexistentes
- ❌ **Linhas 42-50**: FormData inicial com campos errados
- ❌ **Linhas 58-70**: Mapeamento de campos incorreto no useEffect
- ❌ **Linhas 105-111**: Validação de campos inexistentes

#### **Frontend Public Hook (usePromotions.js) - PROBLEMAS:**
- ❌ **Linha 98**: Usa `promotion.name` como fallback
- ❌ **Linha 116**: Referência a `promotion.type` 
- ❌ **Linhas 137-138**: Usa `startsAt/endsAt` e `promotion.name`

---

### 2. **COUPONS - ALTO** ⚠️

#### **Database Schema vs Backend API:**
```sql
-- DATABASE TEM:
minAmount     Float?    ✅
usedCount     Int       ✅  
maxUses       Int?      ✅

-- BACKEND API BUSCA (ERRADO):
minimumAmount  ❌ (linha 624)
usageCount     ❌ (linha 617) 
usageLimit     ❌ (linha 617)
```

#### **Frontend Hooks/Modals - PROBLEMAS:**
- ❌ **useAdminCoupons.js (84-87)**: Usa `minimumAmount`, `usageLimit`, `usageCount`
- ❌ **CouponModal.tsx (19-23)**: Interface com campos errados
- ❌ **CouponModal.tsx (62-65, 85-87)**: FormData e validação incorretos

---

### 3. **SERVICES - MÉDIO** ⚠️

#### **Problema Principal:**
- ❌ **useAdminServices.js (linha 83)**: Converte `estimatedTime` para `parseInt()` mas database espera String
- ❌ **Database**: Espera `"30 minutos"`, `"2 horas"` (formato texto)
- ❌ **Frontend**: Envia números inteiros

---

### 4. **PRODUCTS - BAIXO** ℹ️

#### **Problemas Menores:**
- ❌ **useProducts.js (54-60)**: Lógica de preços confusa (`salePrice || price`)
- ❌ **ProductModal.tsx**: Campos extras não no schema (`sku`, `brand`, `supplier`, `minStock`)

---

## 🔧 PLANO DE CORREÇÃO SISTEMÁTICA

### **FASE 1: Backend API (1-2h)**
```bash
Arquivo: backend/src/routes/api.js

CUPONS:
✅ Linha 617: usageCount → usedCount 
✅ Linha 617: usageLimit → maxUses
✅ Linha 624: minimumAmount → minAmount

PROMOÇÕES:
✅ Linha 673: Remover filtro por 'type'
✅ Linhas 684-695: Usar apenas campos do schema (title, startDate, endDate, category, minAmount)
✅ Linhas 757, 794: Filtrar campos inexistentes no create/update
```

### **FASE 2: Frontend Hooks (2-3h)**
```bash
PROMOÇÕES - useAdminPromotions.js:
✅ Linha 73: name → title, remover type
✅ Linhas 79-88: Usar campos corretos do schema
✅ Linha 142: promotion.name → promotion.title

CUPONS - useAdminCoupons.js:  
✅ Linhas 84-87: minimumAmount → minAmount, usageLimit → maxUses, usageCount → usedCount

SERVIÇOS - useAdminServices.js:
✅ Linha 83: Manter estimatedTime como string

PROMOÇÕES PÚBLICAS - usePromotions.js:
✅ Linha 98: Remover promotion.name
✅ Linha 116: Remover promotion.type  
✅ Linhas 137-138: Usar apenas startDate/endDate
```

### **FASE 3: Frontend Components (2-3h)**
```bash
PromotionModal.tsx:
✅ Linhas 15-24: Interface com campos corretos (title, category, minAmount, startDate, endDate)
✅ Linhas 42-50: FormData inicial corrigido
✅ Linhas 58-70: Mapeamento correto no useEffect  
✅ Linhas 105-111: Validação de campos existentes

CouponModal.tsx:
⏳ Interface e FormData com campos corretos
⏳ Validação alinhada com schema
⏳ Labels e placeholders atualizados

ServiceModal.tsx:
⏳ Campo estimatedTime como input text
⏳ Placeholder: "Ex: 30 minutos, 2 horas"

ProductModal.tsx:
⏳ Remover campos não existentes no schema atual
⏳ Simplificar interface para campos básicos
```

### **FASE 4: Seed Data Alignment (30min)**
```bash
✅ seed-simple.js: Corrigir campos name vs title
✅ seed-realistic.js: Alinhar com schema real
⏳ Verificar todos os campos estão corretos
```

### **FASE 5: Testes de Integração (1h)**
```bash
⏳ Testar CRUD completo de Produtos
⏳ Testar CRUD completo de Serviços  
⏳ Testar CRUD completo de Cupons
⏳ Testar CRUD completo de Promoções
⏳ Validar APIs públicas funcionando
⏳ Verificar painel admin completamente funcional
```

---

## 🎯 STATUS ATUAL DAS CORREÇÕES

### ✅ **CONCLUÍDO:**
- [x] Backend API - Correção campos cupons
- [x] useAdminPromotions - Campos básicos corrigidos
- [x] useAdminCoupons - Campos básicos corrigidos  
- [x] useAdminServices - estimatedTime corrigido
- [x] usePromotions - Campos básicos corrigidos
- [x] PromotionModal - Interface e FormData inicial (PARCIAL)

### ⏳ **EM PROGRESSO:**
- [ ] PromotionModal - Validação e mapeamento completo
- [ ] CouponModal - Correção completa
- [ ] ServiceModal - Ajustes de campo  
- [ ] ProductModal - Limpeza de campos extras

### ❌ **PENDENTE:**
- [ ] Testes de integração completos
- [ ] Deploy e validação na VPS
- [ ] Verificação final de todos os CRUDs

---

## 🚨 ARQUIVOS CRÍTICOS PARA CORREÇÃO

### **Backend:**
- `backend/src/routes/api.js` (linhas 617-640, 673-694, 757-767, 794-805)

### **Frontend Hooks:**
- `src/hooks/useAdminPromotions.js` (PRIORITÁRIO)
- `src/hooks/useAdminCoupons.js` (PRIORITÁRIO)  
- `src/hooks/usePromotions.js` (MÉDIO)
- `src/hooks/useAdminServices.js` (BAIXO)

### **Frontend Components:**
- `src/components/admin/PromotionModal.tsx` (PRIORITÁRIO)
- `src/components/admin/CouponModal.tsx` (PRIORITÁRIO)
- `src/components/admin/ServiceModal.tsx` (MÉDIO)
- `src/components/admin/ProductModal.tsx` (BAIXO)

---

## 💡 IMPACTO ESPERADO PÓS-CORREÇÃO

1. **✅ Admin Panel 100% Funcional**: Todos os CRUDs funcionando perfeitamente
2. **✅ APIs Públicas Estáveis**: Sem erros de campos inexistentes  
3. **✅ Integração Harmoniosa**: Frontend ↔ Backend ↔ Database alinhados
4. **✅ Experiência do Usuário**: Sem crashes ou erros de validação
5. **✅ Manutenibilidade**: Código consistente e previsível

---

## ⚡ PRÓXIMOS PASSOS IMEDIATOS

1. **Finalizar PromotionModal.tsx** (15min)
2. **Corrigir CouponModal.tsx completamente** (30min)  
3. **Ajustar ServiceModal.tsx** (15min)
4. **Limpar ProductModal.tsx** (15min)
5. **Testar todos os CRUDs** (30min)
6. **Deploy e validação final** (15min)

**TEMPO TOTAL ESTIMADO PARA CONCLUSÃO: 2-3 horas**

---

*Última atualização: $(date)*
*Status: 60% das correções críticas concluídas*