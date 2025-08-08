-- ============================================
-- CRIAR USUÁRIO ADMINISTRADOR - Supabase Self-Hosted
-- Para Moria Peças & Serviços
-- Execute este SQL no painel do Supabase ou via psql
-- ============================================

-- ============================================
-- 1. CRIAR USUÁRIO DE AUTENTICAÇÃO
-- ============================================

-- Inserir usuário na tabela auth.users
-- IMPORTANTE: Substitua os valores pelos dados reais do administrador
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',  -- instance_id padrão
  gen_random_uuid(),                        -- id único
  'authenticated',                          -- aud
  'authenticated',                          -- role
  'admin@moria.com.br',                    -- ✏️ ALTERE: seu email de admin
  crypt('admin123456', gen_salt('bf')),    -- ✏️ ALTERE: sua senha (será criptografada)
  NOW(),                                   -- email_confirmed_at
  NULL,                                    -- phone_confirmed_at
  '',                                      -- confirmation_token
  '',                                      -- recovery_token  
  '',                                      -- email_change_token_new
  '',                                      -- email_change
  '{"provider":"email","providers":["email"],"role":"admin"}', -- app_meta_data com role admin
  '{"name":"Administrador Moria","role":"admin"}',             -- user_meta_data
  true,                                    -- is_super_admin
  NOW(),                                   -- created_at
  NOW()                                    -- updated_at
);

-- ============================================
-- 2. CRIAR ENTRADA DE IDENTIDADE
-- ============================================

-- Inserir identidade correspondente na tabela auth.identities
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@moria.com.br'),  -- provider_id = user_id
  (SELECT id FROM auth.users WHERE email = 'admin@moria.com.br'),  -- user_id
  jsonb_build_object(
    'sub', (SELECT id FROM auth.users WHERE email = 'admin@moria.com.br')::text,
    'email', 'admin@moria.com.br',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',                                  -- provider
  NOW(),                                   -- last_sign_in_at
  NOW(),                                   -- created_at
  NOW()                                    -- updated_at
);

-- ============================================
-- 3. VERIFICAR CRIAÇÃO
-- ============================================

-- Consultar o usuário criado
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'admin@moria.com.br';

-- Verificar identidade
SELECT 
  user_id,
  provider,
  identity_data,
  created_at
FROM auth.identities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@moria.com.br');

-- ============================================
-- 4. OPCIONAL: ATUALIZAR RLS POLICIES PARA ADMIN
-- ============================================

-- Se quiser criar políticas específicas para role 'admin' (além de service_role)
-- Você pode adicionar essas condições às políticas existentes:

-- Exemplo: Política para produtos (permitir admin além de service_role)
-- DROP POLICY IF EXISTS "Admin pode gerenciar produtos" ON products;
-- CREATE POLICY "Admin pode gerenciar produtos" ON products
--   FOR ALL USING (
--     auth.role() = 'service_role' OR 
--     (auth.jwt() ->> 'role')::text = 'admin' OR
--     (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
--   );

-- ============================================
-- 5. DADOS PARA LOGIN
-- ============================================

-- ✅ CREDENCIAIS PARA LOGIN:
-- Email: admin@moria.com.br
-- Senha: admin123456
-- Role: admin (com is_super_admin = true)

-- ============================================
-- 6. COMANDOS DE VERIFICAÇÃO
-- ============================================

-- Verificar se o usuário pode autenticar
-- (Execute após tentar fazer login na aplicação)
SELECT 
  'Usuário criado com sucesso!' as status,
  'Email: admin@moria.com.br' as login,
  'Senha: admin123456' as senha,
  'Role: admin (super_admin)' as permissoes;

-- Para resetar senha se necessário:
-- UPDATE auth.users 
-- SET encrypted_password = crypt('nova_senha_aqui', gen_salt('bf'))
-- WHERE email = 'admin@moria.com.br';

-- Para verificar política RLS ativa:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND rowsecurity = true;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================

/*
1. 📧 ALTERE O EMAIL: Substitua 'admin@moria.com.br' pelo email real do administrador
2. 🔐 ALTERE A SENHA: Substitua 'admin123456' por uma senha forte
3. 🛡️ SEGURANÇA: A senha será automaticamente criptografada com bcrypt
4. ✅ CONFIRMADO: O email estará automaticamente confirmado (email_confirmed_at = NOW())
5. 👑 SUPER ADMIN: is_super_admin = true permite acesso total
6. 🔑 ROLE ADMIN: app_metadata contém role='admin' para políticas RLS customizadas
7. 🆔 UUID ÚNICO: Cada usuário terá um ID único gerado automaticamente

Para usar em produção:
- Use uma senha forte e complexa
- Configure 2FA se disponível
- Monitore logs de acesso
- Considere criar usuários admin específicos por pessoa
*/

-- Sucesso! ✅
SELECT '🎉 Script de criação de usuário admin concluído!' as resultado;