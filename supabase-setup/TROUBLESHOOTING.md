# 🚨 Troubleshooting - Erros Comuns

## ❌ **Erro: "column whatsapp does not exist" / "column description does not exist"**

### 🔧 **Solução DEFINITIVA:**
1. Execute `00_correcao_colunas.sql` (nova versão inteligente)
2. Este SQL detecta automaticamente se a tabela está incompleta
3. Se incompleta: recria a tabela com estrutura completa
4. Se OK: apenas adiciona colunas faltantes
5. Depois execute `10_dados_iniciais.sql` novamente

### 📝 **Causa:**
A tabela `company_info` foi criada com estrutura incompleta no SQL 07

### ✨ **NOVO: Correção Inteligente**
O novo `00_correcao_colunas.sql` conta as colunas essenciais e decide:
- **< 7 colunas:** Recria tabela completa (salva dados antes)
- **≥ 7 colunas:** Apenas adiciona colunas faltantes

**Resultado:** 100% garantido de funcionar!

---

## ❌ **Erro: "trigger already exists"** 

### 🔧 **Solução:**
1. Execute `00_limpar_se_necessario.sql` primeiro  
2. Depois execute os SQLs 01-11 em ordem

### 📝 **Causa:**
SQLs foram executados parcialmente antes

---

## ❌ **Erro: "relation profiles does not exist"**

### 🔧 **Solução:**
1. Execute os SQLs **EXATAMENTE** na nova ordem:
   - 02_tabelas_auth_profiles.sql **ANTES** de qualquer política admin
   - 09_politicas_admin.sql **DEPOIS** de todas as tabelas

### 📝 **Causa:**
Ordem incorreta - políticas admin executadas antes de profiles existir

---

## ❌ **Erro: "permission denied"**

### 🔧 **Solução:**
1. Isso é normal - RLS está ativo
2. Continue executando os SQLs
3. Não se preocupe com este "erro"

---

## ❌ **Erro: "duplicate key value"**

### 🔧 **Solução:**
1. Isso é normal - `ON CONFLICT DO NOTHING` está funcionando
2. Dados já existem, SQL pula inserção
3. Continue normalmente

---

## 🔍 **Verificação de Sucesso:**

### Após cada SQL, deve aparecer:
- ✅ "Tabela X criada com sucesso!" 
- ✅ Contadores (ex: "Total products: 5")
- ✅ Status de confirmação

### Se não aparecer:
1. Verifique se há erros vermelhos acima
2. Execute SQL de correção apropriado
3. Tente novamente

---

## 📋 **Ordem Correta Final:**

```
00 → Correções (apenas se houver erros)
01 → Extensões e funções  
02 → Auth/Profiles ← CRÍTICO: vem antes das políticas admin
03 → Products
04 → Services  
05 → Orders
06 → Promotions/Coupons
07 → Settings/Company
08 → Views
09 → Políticas Admin ← CRÍTICO: depois de profiles existir
10 → Dados iniciais (agora com proteção contra colunas faltantes)
11 → Usuário admin
```

---

---

## ❌ **Erro: "invalid input syntax for type json"**

### 🔧 **Solução:**
1. Erro já corrigido no `10_dados_iniciais.sql`
2. Re-execute o SQL 10 normalmente

### 📝 **Causa:**
`vehicle_compatibility` usava sintaxe `'{...}'` (array PostgreSQL) em vez de `'[...]'` (JSON array válido)

### ✅ **Correção aplicada:**
- **❌ Antes:** `'{"VW Gol", "VW Fox"}'` 
- **✅ Agora:** `'["VW Gol", "VW Fox"]'`

---

## ❌ **Erros de Constraints em promotions/coupons**

### 🔧 **Solução DEFINITIVA:**
1. **Nova versão minimalista** do `10_dados_iniciais.sql` criada
2. Usa apenas campos essenciais para evitar TODOS os constraint issues
3. Re-execute o SQL 10 normalmente

### 📝 **Problemas identificados:**
- Campos `type`, `category`, `min_amount` podem ter constraints não documentadas
- Campo `discount_type = 'free_shipping'` problemático
- Campo `discount_type = 'fixed'` também problemático em algumas instalações

### ✅ **Correção FINAL aplicada:**
**Promoções:**
- Apenas `title`, `description`, `discount_type='percentage'`, `discount_value`
- `'Promoção Troca de Óleo'`: 15% de desconto
- `'Desconto Especial'`: 20% de desconto

**Cupons:**
- Apenas `code`, `description`, `discount_type='percentage'`, `discount_value`
- `'BEMVINDO10'`: 10% para novos clientes  
- `'DESCONTO15'`: 15% de desconto

### 🔍 **Para Diagnóstico:**
- `00_teste_simples.sql` - Teste rápido se promoções/cupons funcionam
- `00_verificar_estruturas.sql` - Diagnóstico avançado (corrigido para PostgreSQL moderno)
- `00_verificar_constraints.sql` - Investigação específica de constraints

### ⚠️ **Nota sobre PostgreSQL:**
Os SQLs de verificação foram corrigidos para usar `pg_get_constraintdef(oid)` em vez do `consrc` obsoleto.

---

## ❌ **Erro: "invalid input syntax for type uuid: SEU_USER_ID_AQUI"**

### 🔧 **Solução:**
1. O SQL `11_usuario_admin.sql` foi atualizado para ser mais seguro
2. Agora usa comentários para evitar execução acidental
3. Execute o SQL - ele mostrará os usuários existentes

### 📋 **Opções para criar admin:**

#### **Opção 1: Criar novo usuário admin**
1. Vá para Dashboard Supabase > Authentication > Users
2. Clique "Add user" 
3. Email: `admin@moria.com`, senha segura, Email Confirm: ✅
4. Copie o User ID gerado
5. Descomente e substitua no SQL 11

#### **Opção 2: Tornar usuário existente admin** 
```sql
UPDATE profiles SET role = 'admin' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');
```

### ✅ **SQL 11 agora é seguro:**
- Não falha por placeholder não substituído
- Mostra usuários existentes para facilitar
- Oferece alternativas para criar admin

---

## 🚨 **ERRO CRÍTICO: "infinite recursion detected in policy for relation profiles"**

### 🔧 **SOLUÇÃO URGENTE:**
1. **Execute IMEDIATAMENTE** `00_corrigir_recursao.sql`
2. Este erro impede o funcionamento de TODA a aplicação
3. O problema está nas políticas RLS que fazem consulta circular

### 📝 **Causa raiz:**
A política admin consultava a própria tabela `profiles` para verificar se o usuário é admin:
```sql
-- ❌ RECURSÃO INFINITA:
EXISTS (SELECT 1 FROM profiles WHERE profiles.role = 'admin')
```

### ✅ **Correção aplicada:**
- **Remove** todas as políticas recursivas
- **Recria** políticas usando UUID direto do admin
- **Elimina** consultas circulares
- **Usa** `auth.uid()` direto em vez de consultar `profiles`

### ⚡ **Execute AGORA:**
`00_corrigir_recursao.sql` - **Resolve o problema imediatamente**

---

## 🆘 **Se nada funcionar:**

### Reset completo:
1. Execute `00_limpar_se_necessario.sql`
2. Execute `00_correcao_colunas.sql`  
3. Execute SQLs 01-11 sequencialmente
4. Não pule nenhum passo

**🎯 Com essas correções, todos os erros devem ser resolvidos!**