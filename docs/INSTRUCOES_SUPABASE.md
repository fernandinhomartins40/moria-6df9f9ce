# 🚀 Instruções para Configurar Supabase

## Passo 1: Criar Projeto no Supabase

1. **Acesse**: https://supabase.com
2. **Clique em**: "Start your project"
3. **Faça login** com GitHub ou Google
4. **Clique em**: "New Project"
5. **Configure o projeto**:
   - **Name**: `moria-pecas-servicos`
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: `South America (São Paulo)` (mais próximo do Brasil)
   - **Pricing Plan**: Free (suficiente para desenvolvimento)
6. **Clique em**: "Create new project"
7. **Aguarde** 2-3 minutos para o projeto ser provisionado

## Passo 2: Obter Credenciais do Projeto

1. **No dashboard do projeto**, vá em **Settings → API**
2. **Copie as seguintes informações**:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Passo 3: Configurar Variáveis de Ambiente

1. **Copie** o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. **Edite** `.env.local` com suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://sua-url-aqui.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   ```

## Passo 4: Criar Schema no Banco de Dados

1. **No dashboard do Supabase**, vá em **SQL Editor**
2. **Clique em**: "New query"
3. **Cole todo o conteúdo** do arquivo `supabase_schema.sql`
4. **Clique em**: "Run" para executar o script
5. **Aguarde** até ver a mensagem: "✅ Schema do Supabase criado com sucesso!"

## Passo 5: Configurar Autenticação (Opcional para Admins)

### Para habilitar login de administradores:

1. **No dashboard**, vá em **Authentication → Settings**
2. **Em "Site URL"**, adicione: `http://localhost:8080`
3. **Em "Redirect URLs"**, adicione: 
   - `http://localhost:8080`
   - `https://seu-dominio.com` (para produção)

### Para criar usuário administrador:

1. **Vá em**: **Authentication → Users**
2. **Clique em**: "Add user"
3. **Preencha**:
   - **Email**: admin@moria.com.br
   - **Password**: uma senha forte
   - **Auto Confirm User**: ✅ Marque esta opção
4. **Clique em**: "Create user"

## Passo 6: Importar Dados de Exemplo

### Opção A: Via SQL Editor (Recomendado)
1. **Vá em**: SQL Editor
2. **Cole o conteúdo** do arquivo `backup_before_supabase/supabase_import.sql`
3. **Execute** para importar produtos e serviços de exemplo

### Opção B: Via CSV Import
1. **Vá em**: Table Editor → products
2. **Clique em**: "Insert" → "Import via CSV"
3. **Faça upload** dos dados exportados

## Passo 7: Testar Conexão

1. **Execute** o projeto:
   ```bash
   npm run dev
   ```

2. **Abra**: http://localhost:8080

3. **Verifique** no console do browser se aparece:
   - ✅ "Conexão com Supabase estabelecida com sucesso!"

4. **Teste** se os produtos aparecem na página inicial

## Passo 8: Verificar Row Level Security (RLS)

No SQL Editor, execute para verificar as políticas:

```sql
-- Ver todas as políticas RLS ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🔧 Troubleshooting

### Erro de Conectividade
- Verifique se as URLs e chaves estão corretas em `.env.local`
- Confirme se o projeto Supabase está ativo
- Verifique se não há espaços extras nas variáveis de ambiente

### Erro de Permissão (RLS)
- Verifique se as políticas RLS foram criadas
- Para dados públicos (produtos, serviços), não precisa autenticação
- Para dados privados (pedidos), será necessário implementar autenticação

### Erro no Schema
- Execute o script SQL novamente
- Verifique no "Table Editor" se as tabelas foram criadas
- Confirme se todas as extensões foram habilitadas

## 📊 Monitoramento

### Para ver atividade do banco:
1. **Dashboard** → **Reports**
2. Monitore queries, performance e uso de recursos

### Para ver logs:
1. **Logs** → **Database** para queries SQL
2. **Logs** → **API** para requisições da aplicação

## 🚀 Deploy para Produção

### Quando estiver pronto para produção:

1. **Configure domínio** em Authentication → Settings
2. **Atualize variáveis** de ambiente no seu hosting (Vercel, Netlify)
3. **Configure backup** automático no Supabase
4. **Configure alertas** para monitoramento

## ✅ Checklist de Validação

- [ ] Projeto Supabase criado e ativo
- [ ] Variáveis de ambiente configuradas
- [ ] Schema executado sem erros
- [ ] Tabelas criadas no Table Editor
- [ ] RLS ativado em todas as tabelas
- [ ] Dados de exemplo importados
- [ ] Frontend conectando com sucesso
- [ ] Produtos visíveis na página pública

---

**🎉 Parabéns!** Seu projeto agora está usando Supabase como backend!

**Próximos passos**: Execute `npm run dev` e teste todas as funcionalidades.