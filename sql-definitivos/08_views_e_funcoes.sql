-- ========================================
-- SQL 08: VIEWS E FUNÇÕES COMPLEXAS
-- Execute OITAVO (após todas as tabelas)
-- ========================================

-- View para produtos com informações estatísticas
CREATE OR REPLACE VIEW products_stats AS
SELECT 
  p.*,
  COALESCE(fav_count.count, 0) as favorites_count,
  COALESCE(order_count.count, 0) as times_ordered
FROM products p
LEFT JOIN (
  SELECT product_id, COUNT(*) as count 
  FROM favorites 
  GROUP BY product_id
) fav_count ON p.id = fav_count.product_id
LEFT JOIN (
  SELECT product_id, COUNT(*) as count 
  FROM order_items 
  WHERE product_id IS NOT NULL
  GROUP BY product_id
) order_count ON p.id = order_count.product_id;

-- View para serviços com estatísticas
CREATE OR REPLACE VIEW services_stats AS
SELECT 
  s.*,
  COALESCE(order_count.count, 0) as times_ordered
FROM services s
LEFT JOIN (
  SELECT service_id, COUNT(*) as count 
  FROM order_items 
  WHERE service_id IS NOT NULL
  GROUP BY service_id
) order_count ON s.id = order_count.service_id;

-- View para pedidos com informações completas
CREATE OR REPLACE VIEW orders_detailed AS
SELECT 
  o.*,
  p.full_name as customer_name,
  p.email as customer_email,
  COUNT(oi.id) as items_count
FROM orders o
JOIN profiles p ON o.user_id = p.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, p.full_name, p.email;

-- Função para calcular total do carrinho
CREATE OR REPLACE FUNCTION calculate_cart_total(cart_items jsonb)
RETURNS numeric AS $$
DECLARE
  total numeric := 0;
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    IF item->>'type' = 'product' THEN
      total := total + (
        SELECT price * (item->>'quantity')::integer 
        FROM products 
        WHERE id = (item->>'id')::uuid
      );
    ELSIF item->>'type' = 'service' THEN
      total := total + (
        SELECT price * (item->>'quantity')::integer 
        FROM services 
        WHERE id = (item->>'id')::uuid
      );
    END IF;
  END LOOP;
  
  RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql;

-- Função para aplicar desconto de promoção
CREATE OR REPLACE FUNCTION apply_promotion_discount(
  cart_total numeric,
  promotion_id uuid
)
RETURNS numeric AS $$
DECLARE
  promotion_record promotions;
  discount_amount numeric := 0;
BEGIN
  SELECT * INTO promotion_record 
  FROM promotions 
  WHERE id = promotion_id 
    AND is_active = true 
    AND now() BETWEEN start_date AND end_date;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Verificar valor mínimo
  IF cart_total < promotion_record.min_amount THEN
    RETURN 0;
  END IF;

  -- Calcular desconto
  IF promotion_record.discount_type = 'percentage' THEN
    discount_amount := cart_total * (promotion_record.discount_value / 100);
  ELSIF promotion_record.discount_type = 'fixed' THEN
    discount_amount := promotion_record.discount_value;
  END IF;

  -- Não pode ser maior que o total
  IF discount_amount > cart_total THEN
    discount_amount := cart_total;
  END IF;

  RETURN discount_amount;
END;
$$ LANGUAGE plpgsql;

-- Verificar se foi criado com sucesso
SELECT 
  'Views e funções criadas com sucesso!' as status,
  current_timestamp as executado_em;