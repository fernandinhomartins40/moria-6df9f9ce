-- ========================================
-- PASSO 11: CRIAR USUÁRIO ADMIN
-- ⚠️ ATENÇÃO: Execute este SQL APÓS criar o usuário no Dashboard
-- ========================================

-- 📋 INSTRUÇÕES PASSO A PASSO:
-- 1. Vá para Authentication > Users no Dashboard Supabase
-- 2. Clique em "Add user" 
-- 3. Preencha:
--    Email: admin@moria.com
--    Password: [uma senha segura - ANOTE!]
--    Email Confirm: ✅ (marcar)
-- 4. Clique em "Create user"
-- 5. COPIE o User ID que aparece (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
-- 6. SUBSTITUA o texto abaixo pelo ID real
-- 7. Execute este SQL

-- ⚠️ ATENÇÃO: VOCÊ DEVE SUBSTITUIR A LINHA ABAIXO!
-- Descomente e substitua 'COLE_SEU_USER_ID_AQUI' pelo ID real:

/*
INSERT INTO profiles (
  user_id, 
  name, 
  phone,
  role, 
  total_orders, 
  total_spent
) VALUES (
  'COLE_SEU_USER_ID_AQUI', -- ⚠️ Substitua por um UUID real (ex: 12345678-1234-1234-1234-123456789abc)
  'Administrador Moria',
  '(11) 99999-9999', 
  'admin',
  0,
  0.00
) ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;
*/

-- 🚀 ALTERNATIVA: Criar admin para qualquer usuário existente
-- Se você já tem um usuário no sistema e quer torná-lo admin:
-- (Descomente a linha abaixo e substitua o email)

-- UPDATE profiles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL@AQUI.com');

-- 📊 VERIFICAR USUÁRIOS EXISTENTES
SELECT 
  'USUÁRIOS CADASTRADOS:' as info,
  au.email,
  au.id as user_id,
  p.role,
  p.name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC;

-- Verificar se o admin foi criado corretamente
SELECT 
  'Usuário admin criado com sucesso!' as status,
  p.name,
  p.role,
  au.email,
  p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.role = 'admin';

-- Se não aparecer resultado acima, verifique:
-- 1. Se substituiu 'SEU_USER_ID_AQUI' pelo ID real
-- 2. Se o usuário foi criado no Dashboard primeiro
-- 3. Se o ID está correto (sem aspas ou espaços extras)