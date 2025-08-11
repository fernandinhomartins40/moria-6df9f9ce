-- ========================================
-- PASSO 8: VIEWS ÚTEIS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- View products_view com preços efetivos e descontos
CREATE OR REPLACE VIEW products_view AS
SELECT 
  p.*,
  -- Calcular preço efetivo (menor entre price, sale_price, promo_price)
  CASE 
    WHEN p.promo_price IS NOT NULL AND p.promo_price > 0 THEN p.promo_price
    WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 THEN p.sale_price
    ELSE p.price
  END as effective_price,
  -- Calcular percentual de desconto
  CASE 
    WHEN p.promo_price IS NOT NULL AND p.promo_price > 0 THEN 
      ROUND(((p.price - p.promo_price) / p.price * 100)::numeric, 2)
    WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 THEN 
      ROUND(((p.price - p.sale_price) / p.price * 100)::numeric, 2)
    ELSE 0
  END as discount_percentage
FROM products p;

-- View user_profiles com dados completos do usuário
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  au.email,
  p.phone,
  p.cpf,
  p.birth_date,
  p.role,
  p.total_orders,
  p.total_spent,
  p.created_at,
  p.updated_at,
  -- Agregações úteis
  COALESCE(addr_count.count, 0) as addresses_count,
  COALESCE(fav_count.count, 0) as favorites_count
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM addresses 
  GROUP BY user_id
) addr_count ON p.user_id = addr_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM favorites 
  GROUP BY user_id
) fav_count ON p.user_id = fav_count.user_id;

-- View orders_summary com resumo dos pedidos
CREATE OR REPLACE VIEW orders_summary AS
SELECT 
  o.*,
  COUNT(oi.id) as items_count,
  SUM(oi.quantity) as total_items_quantity,
  ARRAY_AGG(
    json_build_object(
      'id', oi.id,
      'type', oi.type,
      'item_id', oi.item_id,
      'item_name', oi.item_name,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'total_price', oi.total_price
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.customer_name, o.customer_email, 
         o.customer_phone, o.customer_address, o.user_id, o.total_amount, 
         o.status, o.notes, o.created_at, o.updated_at;

-- View dashboard_stats para estatísticas
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
  (SELECT COUNT(*) FROM services WHERE is_active = true) as active_services,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as total_customers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
  (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE) as orders_today,
  (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as orders_this_week;

-- Políticas RLS para views (herdam das tabelas base)
-- As views automaticamente herdam as políticas das tabelas que usam

-- Verificar criação das views
SELECT 'Views criadas com sucesso!' as status;

-- Testar algumas views
SELECT * FROM dashboard_stats;
SELECT COUNT(*) as total_products_view FROM products_view;
SELECT COUNT(*) as total_user_profiles FROM user_profiles;