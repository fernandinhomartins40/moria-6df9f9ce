-- ========================================
-- SQL 11: CONFIGURAR USUÁRIO ADMINISTRADOR
-- Execute ÚLTIMO (funciona automaticamente)
-- ========================================

-- Configurar automaticamente qualquer usuário com email admin@moria.com.br como admin
-- OU criar um perfil admin genérico se não existir usuário específico

DO $$
DECLARE
  admin_user_record RECORD;
  admin_email text := 'admin@moria.com.br';
  any_user_record RECORD;
BEGIN
  -- Primeira tentativa: buscar usuário admin@moria.com.br
  SELECT id, email INTO admin_user_record 
  FROM auth.users 
  WHERE email = admin_email;

  IF FOUND THEN
    -- Caso 1: admin@moria.com.br existe
    INSERT INTO profiles (user_id, email, full_name, role, is_active)
    VALUES (
      admin_user_record.id,
      admin_user_record.email,
      'Administrador',
      'admin',
      true
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      is_active = true,
      updated_at = now();

    RAISE NOTICE '✅ Admin configurado: %', admin_user_record.email;
  ELSE
    -- Caso 2: admin@moria.com.br não existe, pegar qualquer usuário
    SELECT id, email INTO any_user_record 
    FROM auth.users 
    ORDER BY created_at 
    LIMIT 1;

    IF FOUND THEN
      INSERT INTO profiles (user_id, email, full_name, role, is_active)
      VALUES (
        any_user_record.id,
        any_user_record.email,
        'Administrador',
        'admin',
        true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        is_active = true,
        updated_at = now();

      RAISE NOTICE '✅ Admin configurado automaticamente: %', any_user_record.email;
      RAISE NOTICE 'ℹ️ Usuário % foi promovido a administrador', any_user_record.email;
    ELSE
      -- Caso 3: Nenhum usuário existe
      RAISE NOTICE '⚠️ Nenhum usuário encontrado no auth.users';
      RAISE NOTICE 'ℹ️ Crie um usuário no Supabase Dashboard -> Authentication';
      RAISE NOTICE 'ℹ️ Depois execute este SQL novamente';
    END IF;
  END IF;
END $$;

-- Verificar resultado final
SELECT 
  'Configuração do admin finalizada!' as status,
  current_timestamp as executado_em;

-- Mostrar admins configurados
SELECT 
  user_id,
  email,
  full_name,
  role,
  is_active,
  '🔑 ADMINISTRADOR' as acesso
FROM profiles 
WHERE role = 'admin';