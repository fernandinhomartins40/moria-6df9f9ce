-- ========================================
-- PASSO 0: LIMPEZA SE NECESSÁRIO
-- Execute este SQL APENAS se tiver erros de "already exists"
-- ========================================

-- ⚠️ CUIDADO: Este SQL remove tudo para começar limpo
-- Só execute se estiver tendo problemas com "already exists"

-- Remover triggers se existirem
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
DROP TRIGGER IF EXISTS update_company_info_updated_at ON company_info;
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON addresses;

-- Remover políticas RLS se existirem
DROP POLICY IF EXISTS "Produtos públicos são visíveis para todos" ON products;
DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Serviços públicos são visíveis para todos" ON services;
DROP POLICY IF EXISTS "Admins podem gerenciar serviços" ON services;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON orders;
DROP POLICY IF EXISTS "Usuários podem criar pedidos para si mesmos" ON orders;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os pedidos" ON orders;
DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON order_items;
DROP POLICY IF EXISTS "Usuários podem criar itens para seus pedidos" ON order_items;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os itens" ON order_items;
DROP POLICY IF EXISTS "Promoções ativas são visíveis para todos" ON promotions;
DROP POLICY IF EXISTS "Admins podem gerenciar promoções" ON promotions;
DROP POLICY IF EXISTS "Cupons ativos são visíveis para todos" ON coupons;
DROP POLICY IF EXISTS "Admins podem gerenciar cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios endereços" ON addresses;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios favoritos" ON favorites;
DROP POLICY IF EXISTS "Configurações são visíveis para todos" ON settings;
DROP POLICY IF EXISTS "Admins podem gerenciar configurações" ON settings;
DROP POLICY IF EXISTS "Informações da empresa são visíveis para todos" ON company_info;
DROP POLICY IF EXISTS "Admins podem gerenciar informações da empresa" ON company_info;

-- Remover views se existirem
DROP VIEW IF EXISTS products_view;
DROP VIEW IF EXISTS user_profiles;
DROP VIEW IF EXISTS orders_summary;
DROP VIEW IF EXISTS dashboard_stats;

-- Remover funções personalizadas se existirem
DROP FUNCTION IF EXISTS ensure_single_default_address();

SELECT 'Limpeza concluída! Agora execute os SQLs 01-10 normalmente.' as status;