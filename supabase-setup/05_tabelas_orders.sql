-- ========================================
-- PASSO 4: TABELAS DE PEDIDOS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Criar tabela orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  customer_address jsonb DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela order_items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  type text DEFAULT 'product' CHECK (type IN ('product', 'service')),
  item_id uuid NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamp with time zone DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_item_id_idx ON order_items(item_id);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para orders (políticas de admin serão criadas no SQL 11)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON orders;
DROP POLICY IF EXISTS "Usuários podem criar pedidos para si mesmos" ON orders;

CREATE POLICY "Usuários podem ver seus próprios pedidos" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar pedidos para si mesmos" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas básicas para order_items (políticas de admin no SQL 09)
DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON order_items;
DROP POLICY IF EXISTS "Usuários podem criar itens para seus pedidos" ON order_items;

CREATE POLICY "Usuários podem ver itens de seus pedidos" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar itens para seus pedidos" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- NOTA: Políticas de admin para order_items serão criadas no SQL 09

-- Verificar criação
SELECT 'Tabelas de pedidos criadas com sucesso!' as status;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_order_items FROM order_items;