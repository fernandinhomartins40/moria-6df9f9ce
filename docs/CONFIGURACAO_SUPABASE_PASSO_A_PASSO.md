# 🔧 Configuração Supabase - Passo a Passo

## ⚠️ ATENÇÃO: Configuração Obrigatória
**Sem essas configurações no Supabase, a aplicação NÃO funcionará!**

---

## 🚀 PASSO 1: Criar Projeto Supabase

### 1.1 Acessar Supabase
1. Vá para https://supabase.com/
2. Clique em "Start your project"
3. Faça login com GitHub/Google
4. Clique em "New Project"

### 1.2 Configurar Projeto
```
Nome: moria-pecas-servicos
Organização: [sua organização]
Região: South America (São Paulo) - para melhor performance no Brasil
Senha do BD: [anote a senha - você precisará]
```

### 1.3 Aguardar Criação
- ⏱️ Leva ~2 minutos
- ✅ Quando pronto, você verá o dashboard

---

## 🗄️ PASSO 2: Configurar Banco de Dados

### 2.1 Acessar SQL Editor
1. No dashboard, clique em "SQL Editor" (ícone </> na lateral)
2. Clique em "New query"

### 2.2 Executar Schema Principal
1. Copie **TODO o conteúdo** do arquivo `docs/SQLs/complete_database_schema_final.sql`
2. Cole no SQL Editor
3. Clique em "Run" (▶️)
4. ✅ Deve aparecer "Success. No rows returned"

### 2.3 Executar Schema de Autenticação  
1. Nova query no SQL Editor
2. Copie **TODO o conteúdo** do arquivo `docs/SQLs/create_auth_tables.sql`
3. Cole e execute
4. ✅ Deve criar tabelas: profiles, addresses, favorites

### 2.4 Verificar Tabelas Criadas
1. Vá em "Table Editor" na lateral
2. ✅ Você deve ver estas tabelas:
   ```
   - products
   - services  
   - orders
   - order_items
   - promotions
   - coupons
   - profiles (nova)
   - addresses (nova)
   - favorites (nova)
   - company_info
   - settings
   ```

---

## 🔐 PASSO 3: Configurar Autenticação

### 3.1 Acessar Authentication
1. Clique em "Authentication" na lateral
2. Vá em "Settings"

### 3.2 Configurar URLs
```
Site URL: http://localhost:8080 (desenvolvimento)
Redirect URLs: 
  - http://localhost:8080
  - https://seudominio.com (produção - adicionar depois)
```

### 3.3 Configurar Email Templates (Opcional)
1. Vá em "Auth" > "Templates"
2. Customize os templates de confirmação se desejar

---

## 🔑 PASSO 4: Obter Chaves da API

### 4.1 Acessar Settings
1. Clique em "Settings" (⚙️) na lateral
2. Vá em "API"

### 4.2 Copiar Informações Importantes
```env
# Anote essas informações:
Project URL: https://abc123.supabase.co
anon key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
service_role key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9... (NUNCA EXPOR!)
```

### 4.3 Criar Arquivo .env
Crie o arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
VITE_ENVIRONMENT=development
VITE_WHATSAPP_NUMBER=5511999999999
VITE_COMPANY_NAME="Moria Peças & Serviços"
```

---

## 👤 PASSO 5: Criar Usuário Administrador

### 5.1 Via Dashboard Supabase
1. Vá em "Authentication" > "Users"
2. Clique em "Add user" 
3. Preencha:
   ```
   Email: admin@moria.com
   Password: [senha segura - anote!]
   Email Confirm: ✅ (marcar)
   ```
4. Clique em "Create user"
5. ✅ Usuário criado no auth.users

### 5.2 Criar Perfil de Admin
1. Copie o **User ID** do usuário criado (ex: a1b2c3d4-e5f6-...)
2. No SQL Editor, execute:
```sql
-- SUBSTITUA 'USER_ID_AQUI' pelo ID real do usuário
INSERT INTO profiles (user_id, name, role, total_orders, total_spent) 
VALUES ('USER_ID_AQUI', 'Administrador Moria', 'admin', 0, 0.00);
```
3. ✅ Agora você tem um admin completo

---

## 🛍️ PASSO 6: Popular Dados Iniciais (Opcional)

### 6.1 Dados de Exemplo
Execute no SQL Editor:
```sql
-- Produtos de exemplo
INSERT INTO products (name, description, category, price, stock, is_active) VALUES
('Filtro de Óleo Bosch', 'Filtro de óleo para motores 1.0 a 2.0', 'Filtros', 35.90, 50, true),
('Pastilha de Freio Dianteira', 'Pastilha para freios dianteiros', 'Freios', 89.90, 25, true),
('Óleo Motor Castrol 5W30', 'Óleo sintético para motor', 'Óleos', 45.90, 100, true);

-- Serviços de exemplo  
INSERT INTO services (name, description, category, base_price, estimated_time, is_active) VALUES
('Troca de Óleo', 'Troca de óleo e filtro completa', 'Manutenção', 80.00, '30 minutos', true),
('Alinhamento', 'Alinhamento de rodas computadorizado', 'Suspensão', 120.00, '1 hora', true);

-- Configurações da empresa
INSERT INTO company_info (name, email, phone, whatsapp, address, description) VALUES
('Moria Peças & Serviços', 'contato@moria.com', '(11) 3333-3333', '5511999999999', 
 'Rua das Peças, 123 - São Paulo, SP', 'Especializada em peças automotivas e serviços');
```

---

## ✅ PASSO 7: Testar Configuração

### 7.1 Executar Script de Verificação
```bash
npm run setup:prod
```
✅ Deve mostrar tudo OK exceto variáveis de ambiente (se não configurou ainda)

### 7.2 Testar Conexão
```bash
npm run dev
```
1. Abrir http://localhost:8080
2. ✅ Não deve ter erros no console
3. ✅ Componente SupabaseStatus deve mostrar "Conectado"

### 7.3 Testar Login Admin
1. Ir para `/store-panel`
2. Tentar fazer login com:
   - Email: admin@moria.com
   - Senha: [a que você criou]
3. ✅ Deve logar e mostrar painel administrativo

---

## 🚨 TROUBLESHOOTING

### ❌ "Invalid API key" 
**Solução:** Verificar se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretos no .env

### ❌ "Row level security policy violation"
**Solução:** Re-executar o arquivo `docs/SQLs/create_auth_tables.sql`

### ❌ "relation does not exist"  
**Solução:** Executar primeiro `complete_database_schema_final.sql`

### ❌ Login não funciona
**Solução:** 
1. Verificar se usuário foi criado em Authentication > Users
2. Verificar se perfil foi criado na tabela profiles
3. Verificar se Site URL está correto em Auth > Settings

### ❌ Admin não tem acesso
**Solução:** Verificar se o role='admin' na tabela profiles

---

## 📋 CHECKLIST FINAL

Antes de considerar concluído:

- [ ] ✅ Projeto Supabase criado  
- [ ] ✅ Schema principal executado (produtos, serviços, etc)
- [ ] ✅ Schema de auth executado (profiles, addresses, etc)
- [ ] ✅ Arquivo .env criado com chaves corretas
- [ ] ✅ Usuário admin criado no Authentication
- [ ] ✅ Perfil admin criado na tabela profiles  
- [ ] ✅ Site URL configurado corretamente
- [ ] ✅ Dados iniciais inseridos (opcional)
- [ ] ✅ `npm run dev` funciona sem erros
- [ ] ✅ Login de admin funciona
- [ ] ✅ CRUD de produtos funciona no painel admin

---

## ⏱️ Tempo Estimado
- **Configuração inicial:** ~15 minutos
- **Execução dos SQLs:** ~5 minutos  
- **Criar admin:** ~5 minutos
- **Testes:** ~10 minutos
- **Total:** ~35 minutos

---

**🎯 Sem essas configurações, a aplicação mostrará erros de conexão e não funcionará. Este setup é OBRIGATÓRIO!**