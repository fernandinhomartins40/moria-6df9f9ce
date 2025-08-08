# 🛠️ Correção RLS - "row-level security policy" Error

## 🚨 **Problema:**
Erro ao tentar criar serviços (ou outros itens):
```
new row violates row-level security policy for table "services"
```

## ⚡ **Solução Rápida:**

### **1. Acesse o Painel Supabase**
- URL: http://31.97.85.98:3019
- Vá em **SQL Editor**

### **2. Execute o Script de Correção**
- Abra o arquivo: [`docs/fix_rls_policies.sql`](./fix_rls_policies.sql)
- **Copie TODO o conteúdo** do arquivo
- **Cole no SQL Editor** do Supabase
- **Clique em "Run"** ou **Execute**

### **3. Aguarde Execução**
- O script irá corrigir todas as políticas RLS
- Deve aparecer: `🎉 Políticas RLS corrigidas com sucesso!`

### **4. Teste a Aplicação**
- Volte para: http://31.97.85.98:3018/store-panel
- Tente criar um novo serviço
- Deve funcionar normalmente agora! ✅

---

## 🔧 **O que foi corrigido:**

### **ANTES (Problemático):**
```sql
-- Política muito restritiva
CREATE POLICY "Admin pode gerenciar serviços" ON services
  FOR ALL USING (auth.role() = 'service_role');
```
- Apenas `service_role` podia fazer CRUD
- Aplicação web usa `anon` key
- Inserções eram bloqueadas ❌

### **DEPOIS (Funcional):**
```sql
-- Política permissiva para aplicação
CREATE POLICY "Aplicação pode gerenciar serviços" ON services
  FOR ALL USING (true) WITH CHECK (true);
```
- Qualquer operação via aplicação é permitida
- CRUD completo funcionando ✅

---

## 📋 **Tabelas Corrigidas:**
- ✅ **services** - Criar/editar serviços
- ✅ **products** - Criar/editar produtos  
- ✅ **promotions** - Criar/editar promoções
- ✅ **coupons** - Criar/editar cupons
- ✅ **app_configs** - Configurações do sistema

---

## ⚠️ **Notas de Segurança:**

### **Atual (Desenvolvimento):**
- Políticas permissivas para facilitar desenvolvimento
- Acesso via painel administrativo sem autenticação
- OK para ambiente de testes/desenvolvimento

### **Futuro (Produção):**
- Implementar autenticação de usuários admin
- Políticas baseadas em user_id ou roles específicos
- Controle granular de permissões

---

## 🔍 **Verificação:**

### **Testar Funções CRUD:**
1. **Criar Serviço** - Painel > Serviços > Novo Serviço
2. **Editar Produto** - Painel > Produtos > Editar
3. **Nova Promoção** - Painel > Promoções > Criar
4. **Novo Cupom** - Painel > Cupons > Adicionar

### **Se ainda der erro:**
1. Verifique se o script foi executado completamente
2. Recarregue a página da aplicação (Ctrl+F5)
3. Verifique no console se há outros erros

---

## 🆘 **Troubleshooting:**

### **Erro: "permission denied for schema auth"**
- **Solução**: Use credenciais de superusuário no SQL Editor

### **Erro: "policy already exists"**
- **Solução**: O script já foi executado, está OK

### **Ainda não funciona:**
- Verifique logs do Supabase
- Confirme que está usando a instância correta
- Teste com dados simples primeiro

---

**✨ Após executar o script, todos os menus do Store Panel devem funcionar perfeitamente!**