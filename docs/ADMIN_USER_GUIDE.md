# 👑 Guia: Criar Usuário Administrador no Supabase

## 🚀 **Passo a Passo Rápido**

### **1. Acesse o Painel Supabase**
- URL: http://31.97.85.98:3019
- Vá em **SQL Editor** ou **Database** > **SQL Editor**

### **2. Execute o Script SQL**
- Abra o arquivo: [`docs/create_admin_user.sql`](./create_admin_user.sql)
- **IMPORTANTE**: Edite as seguintes linhas:
  ```sql
  'admin@moria.com.br',                    -- ✏️ ALTERE: seu email de admin  
  crypt('admin123456', gen_salt('bf')),    -- ✏️ ALTERE: sua senha
  ```
- Cole e execute todo o SQL no painel

### **3. Credenciais Criadas**
Após executar o script, você terá:
- **Email**: `admin@moria.com.br` (ou o que você alterou)
- **Senha**: `admin123456` (ou a que você alterou)
- **Permissões**: Super Admin + Role Admin

---

## 🔧 **Métodos de Execução**

### **Método 1: Painel Web Supabase**
1. Acesse: http://31.97.85.98:3019
2. Login com credenciais de projeto
3. Vá em **SQL Editor**
4. Cole o script modificado
5. Clique **Run**

### **Método 2: Via psql (Linha de Comando)**
```bash
# Conectar ao PostgreSQL (use as credenciais da sua instância)
psql -h 31.97.85.98 -p [PORTA_DB] -U postgres -d postgres

# Dentro do psql, execute o script
\i docs/create_admin_user.sql
```

### **Método 3: Usando Docker (se aplicável)**
```bash
# Se sua instância roda via Docker
docker exec -i nome_container_postgres psql -U postgres -d postgres < docs/create_admin_user.sql
```

---

## ✅ **Verificação de Sucesso**

### **1. Verificar no Banco**
Execute no SQL Editor:
```sql
SELECT 
  email,
  is_super_admin,
  raw_app_meta_data,
  email_confirmed_at
FROM auth.users 
WHERE email = 'admin@moria.com.br';
```

### **2. Testar Login na Aplicação**
1. Acesse: http://31.97.85.98:3018/store-panel
2. Tente fazer login com as credenciais criadas
3. Deve conseguir acessar todos os painéis administrativos

### **3. Verificar Permissões**
O usuário deve ter acesso a:
- ✅ **Painel Lojista**: CRUD produtos, serviços, pedidos
- ✅ **Todas as tabelas**: Sem restrições RLS
- ✅ **Configurações**: Acesso total ao app_configs

---

## 🛡️ **Segurança e Boas Práticas**

### **⚠️ Alterações Obrigatórias para Produção:**

1. **Email Real**:
   ```sql
   'seu-email-real@empresa.com'  -- Em vez de admin@moria.com.br
   ```

2. **Senha Forte**:
   ```sql
   crypt('SuaSenhaForte!2024@Moria', gen_salt('bf'))  -- Em vez de admin123456
   ```

3. **Dados do Usuário**:
   ```sql
   '{"name":"Seu Nome Real","role":"admin"}'  -- Em vez de "Administrador Moria"
   ```

### **🔒 Recomendações de Segurança:**

- ✅ Use senha com 12+ caracteres
- ✅ Inclua números, símbolos, maiúsculas e minúsculas  
- ✅ Não compartilhe as credenciais
- ✅ Considere criar múltiplos admins para diferentes pessoas
- ✅ Monitore logs de acesso administrativo

---

## 🔧 **Comandos Úteis**

### **Resetar Senha de Admin**
```sql
UPDATE auth.users 
SET encrypted_password = crypt('nova_senha_aqui', gen_salt('bf'))
WHERE email = 'admin@moria.com.br';
```

### **Criar Admin Adicional**
Execute o script novamente alterando apenas:
- Email para o novo admin
- Nome nos metadados
- Mantenha `is_super_admin = true`

### **Listar Todos os Admins**
```sql
SELECT 
  email,
  raw_user_meta_data ->> 'name' as nome,
  is_super_admin,
  created_at
FROM auth.users 
WHERE is_super_admin = true 
   OR raw_app_meta_data ->> 'role' = 'admin';
```

### **Desabilitar Admin (sem deletar)**
```sql
UPDATE auth.users 
SET is_super_admin = false,
    raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"user"')
WHERE email = 'admin@moria.com.br';
```

---

## ❓ **Troubleshooting**

### **Erro: "duplicate key value violates unique constraint"**
- **Causa**: Email já existe
- **Solução**: Use email diferente ou delete o usuário existente primeiro

### **Erro: "function gen_random_uuid() does not exist"**  
- **Causa**: Extensão não habilitada
- **Solução**: Execute `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### **Erro: "function crypt() does not exist"**
- **Causa**: Extensão pgcrypto não habilitada  
- **Solução**: Execute `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`

### **Login não funciona na aplicação**
1. Verifique se `email_confirmed_at` não é NULL
2. Confirme se a instância Supabase está configurada corretamente no frontend
3. Verifique se as policies RLS permitem acesso para super_admin

---

## 📞 **Suporte**

Se encontrar problemas:

1. **Verifique logs**: No painel Supabase > Logs
2. **Teste conexão**: Use o health check da aplicação
3. **Validação**: Execute as queries de verificação do script

---

**✨ Pronto! Seu usuário administrador está criado e funcionando!**