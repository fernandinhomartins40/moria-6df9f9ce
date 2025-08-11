-- ========================================
-- SQL 05: TABELAS DE PEDIDOS
-- Execute QUINTO (após produtos/serviços, antes de políticas admin)
-- ========================================

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  shipping_fee numeric(10,2) DEFAULT 0 CHECK (shipping_fee >= 0),
  discount numeric(10,2) DEFAULT 0 CHECK (discount >= 0),
  coupon_code text,
  notes text,
  shipping_address jsonb,
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  service_id uuid REFERENCES services(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT check_product_or_service CHECK (
    (product_id IS NOT NULL AND service_id IS NULL) OR 
    (product_id IS NULL AND service_id IS NOT NULL)
  )
);

-- ========================================
-- POLÍTICAS RLS BÁSICAS (SEM ADMIN)
-- ========================================

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para ORDERS - Usuários podem ver/gerenciar próprios pedidos
CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para ORDER_ITEMS - Usuários podem ver itens dos próprios pedidos
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Verificar se foi criado com sucesso
SELECT 
  'Tabelas de pedidos criadas com sucesso!' as status,
  current_timestamp as executado_em;