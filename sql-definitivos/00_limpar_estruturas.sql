-- ========================================
-- SQL 00: LIMPEZA DE ESTRUTURAS (OPCIONAL)
-- Execute APENAS se tiver conflitos "already exists"
-- ========================================

-- ATENÇÃO: Este SQL remove TODAS as estruturas
-- Use apenas se precisar recriar do zero

DROP POLICY IF EXISTS "admin_full_access_products" ON products;
DROP POLICY IF EXISTS "admin_full_access_services" ON services;
DROP POLICY IF EXISTS "admin_full_access_orders" ON orders;
DROP POLICY IF EXISTS "admin_full_access_promotions" ON promotions;
DROP POLICY IF EXISTS "admin_full_access_coupons" ON coupons;
DROP POLICY IF EXISTS "admin_full_access_settings" ON settings;
DROP POLICY IF EXISTS "admin_full_access_company_info" ON company_info;

-- Remover triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;

-- Remover tabelas (ordem reversa de dependência)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS company_info CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

SELECT 'Estruturas removidas - pode executar SQLs 01-11' as status;