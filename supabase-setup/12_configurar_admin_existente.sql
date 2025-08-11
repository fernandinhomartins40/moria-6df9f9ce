-- ========================================
-- CONFIGURAR USUÁRIO EXISTENTE COMO ADMIN
-- Use este SQL para tornar o usuário admin@moria.com.br um administrador
-- ========================================

-- Criar/atualizar perfil do usuário admin existente
INSERT INTO profiles (
  user_id, 
  name, 
  phone,
  role, 
  total_orders, 
  total_spent
) VALUES (
  'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed', -- ID do admin@moria.com.br
  'Administrador Moria',
  '(11) 99999-9999',
  'admin',
  0,
  0.00
) ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;

-- Verificar se o admin foi configurado corretamente
SELECT 
  'ADMIN CONFIGURADO COM SUCESSO!' as status,
  au.email,
  p.name,
  p.role,
  p.phone,
  p.created_at
FROM auth.users au
JOIN profiles p ON au.id = p.user_id
WHERE au.email = 'admin@moria.com.br';

-- Verificar todos os admins do sistema
SELECT 
  'TODOS OS ADMINISTRADORES:' as info,
  au.email,
  p.name,
  p.role
FROM auth.users au
JOIN profiles p ON au.id = p.user_id
WHERE p.role = 'admin';

SELECT 'Usuário admin@moria.com.br configurado como administrador!' as resultado;