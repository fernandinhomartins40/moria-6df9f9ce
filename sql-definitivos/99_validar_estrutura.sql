-- ========================================
-- SQL 99: VALIDAÇÃO DA ESTRUTURA COMPLETA
-- Execute APÓS todos os SQLs 01-11 para validar
-- ========================================

-- Verificar se todas as tabelas foram criadas
SELECT 
  'Verificando estrutura do banco...' as status;

-- Contar tabelas criadas
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'profiles', 'addresses', 'favorites', 
    'products', 'services', 'orders', 'order_items',
    'promotions', 'coupons', 'settings', 'company_info'
  ]) as table_name
),
existing_tables AS (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
)
SELECT 
  et.table_name,
  CASE WHEN ext.table_name IS NOT NULL THEN '✅ CRIADA' ELSE '❌ FALTANDO' END as status
FROM expected_tables et
LEFT JOIN existing_tables ext ON et.table_name = ext.table_name
ORDER BY et.table_name;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN policyname LIKE '%admin%' THEN '🔑 Admin'
    ELSE '👤 User' 
  END as type
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar dados inseridos
SELECT 
  'Dados inseridos:' as categoria,
  (SELECT COUNT(*) FROM products) as produtos,
  (SELECT COUNT(*) FROM services) as servicos,
  (SELECT COUNT(*) FROM promotions) as promocoes,
  (SELECT COUNT(*) FROM coupons) as cupons,
  (SELECT COUNT(*) FROM settings) as configuracoes,
  (SELECT COUNT(*) FROM company_info) as empresa_info;

-- Verificar usuários admin
SELECT 
  'Usuários administradores:' as categoria,
  COUNT(*) as total_admins
FROM profiles 
WHERE role = 'admin';

-- Verificar funções criadas
SELECT 
  routine_name,
  routine_type,
  '✅ CRIADA' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('update_updated_at_column', 'calculate_cart_total', 'apply_promotion_discount')
ORDER BY routine_name;

-- Verificar triggers
SELECT 
  event_object_table as tabela,
  trigger_name,
  '✅ ATIVO' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at'
ORDER BY event_object_table;

-- Verificar views
SELECT 
  table_name as view_name,
  '✅ CRIADA' as status
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Status final
SELECT 
  '🎯 VALIDAÇÃO COMPLETA!' as resultado,
  'Estrutura está pronta para uso!' as mensagem,
  current_timestamp as validado_em;