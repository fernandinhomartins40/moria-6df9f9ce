# 🚀 Guia de Setup para Produção - Moria Peças & Serviços

## ✅ Checklist Pré-Deploy

### 1. Configuração do Supabase

#### 1.1 Criar Projeto no Supabase
```bash
# 1. Acesse https://supabase.com/dashboard
# 2. Clique em "New Project"
# 3. Escolha um nome e região
# 4. Anote a URL e chave anônima
```

#### 1.2 Executar Migrações SQL
```sql
-- Execute na ordem os arquivos:
-- 1. docs/SQLs/complete_database_schema_final.sql
-- 2. docs/SQLs/create_auth_tables.sql

-- Ou execute este comando completo:
```

#### 1.3 Configurar Variáveis de Ambiente
```bash
# .env.production
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
VITE_ENVIRONMENT=production
VITE_WHATSAPP_NUMBER=5511999999999
VITE_COMPANY_NAME="Moria Peças & Serviços"
```

### 2. Preparação do Código

#### 2.1 Instalar Dependências
```bash
npm install
```

#### 2.2 Verificar Build
```bash
# Testar build de produção
npm run build

# Testar preview
npm run preview
```

#### 2.3 Executar Testes (Quando disponível)
```bash
npm test
```

### 3. Deploy no Vercel/Netlify

#### 3.1 Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard
```

#### 3.2 Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## 🔧 Configurações Importantes

### 1. Supabase Auth

#### 1.1 Configurar Providers
```bash
# Dashboard Supabase > Authentication > Providers
# Habilitar: Email (padrão ativo)
# Configurar redirect URLs: https://seudominio.com/
```

#### 1.2 RLS (Row Level Security)
```sql
-- Verificar se as políticas estão ativas:
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

#### 1.3 Criar Usuário Admin
```sql
-- 1. Criar no Supabase Dashboard > Authentication > Users
-- Email: admin@moria.com
-- Password: (senha segura)

-- 2. Depois executar:
INSERT INTO profiles (user_id, name, role) 
VALUES ('USER_ID_AQUI', 'Administrador', 'admin');
```

### 2. Dados Iniciais

#### 2.1 Produtos de Exemplo
```sql
-- Execute: docs/SQLs/populate_realistic_test_data_fixed.sql
-- Isso criará produtos, serviços e categorias iniciais
```

#### 2.2 Configurações da Empresa
```sql
INSERT INTO company_info (
  name, 
  email, 
  phone, 
  whatsapp, 
  address,
  description
) VALUES (
  'Moria Peças & Serviços',
  'contato@moria.com',
  '(11) 3333-3333',
  '5511999999999',
  'Rua das Peças, 123 - São Paulo, SP',
  'Especializada em peças automotivas e serviços de qualidade'
);
```

---

## 📋 Lista de Verificação Final

### ✅ Supabase
- [ ] Projeto criado
- [ ] Banco de dados estruturado
- [ ] RLS configurado
- [ ] Usuário admin criado
- [ ] Dados iniciais populados

### ✅ Aplicação
- [ ] Build passando
- [ ] Tipos TypeScript corretos
- [ ] Variáveis de ambiente configuradas
- [ ] Autenticação funcionando
- [ ] CRUD de produtos funcionando
- [ ] Sistema de checkout funcionando

### ✅ Deploy
- [ ] Domínio configurado
- [ ] SSL ativado
- [ ] Variáveis de ambiente no serviço de hosting
- [ ] Redirect URLs configuradas no Supabase

### ✅ Testes de Funcionalidade
- [ ] Login/logout funcionando
- [ ] Cadastro de usuário funcionando
- [ ] CRUD de produtos (admin)
- [ ] CRUD de serviços (admin)
- [ ] Adicionar ao carrinho
- [ ] Checkout via WhatsApp
- [ ] Painel do cliente
- [ ] Painel administrativo

---

## 🔍 Troubleshooting

### Problema: "Invalid API key"
**Solução:** Verificar se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretas

### Problema: "Row level security policy violation"
**Solução:** Executar novamente o script create_auth_tables.sql

### Problema: "User não encontrado"
**Solução:** Certificar que o usuário foi criado tanto no Auth quanto na tabela profiles

### Problema: Build com erros TypeScript
**Solução:** Executar `npx tsc --noEmit` para ver erros específicos

---

## 📊 Monitoramento

### 1. Métricas Importantes
- Tempo de carregamento da página
- Taxa de conversão do carrinho
- Erros JavaScript (usar Sentry)
- Performance do banco (Supabase Dashboard)

### 2. Logs
- Supabase: Dashboard > Logs
- Vercel: Dashboard > Functions > Logs
- Netlify: Dashboard > Site > Functions

### 3. Analytics
```html
<!-- Google Analytics (opcional) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

---

## 🔄 Processo de Atualização

### 1. Desenvolvimento
```bash
git checkout -b feature/nova-funcionalidade
# ... desenvolver
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 2. Review e Merge
```bash
# Criar Pull Request
# Review do código
# Merge para main
```

### 3. Deploy Automático
```bash
# Vercel/Netlify fazem deploy automático do main
# Verificar se deploy foi bem sucedido
```

---

## 📞 Contatos de Suporte

- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **React:** https://react.dev/
- **TypeScript:** https://typescriptlang.org/docs/

---

*Este guia deve ser seguido sequencialmente para garantir que todos os componentes estejam funcionando corretamente em produção.*