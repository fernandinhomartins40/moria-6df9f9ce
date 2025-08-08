-- ============================================
-- MORIA PEÇAS & SERVIÇOS - Schema PostgreSQL para Supabase
-- Data: 2025-08-08
-- Migração de SQLite para PostgreSQL com RLS
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  promo_price DECIMAL(10,2),
  images JSONB DEFAULT '[]'::jsonb,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  specifications JSONB DEFAULT '{}'::jsonb,
  vehicle_compatibility JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- RLS para produtos (dados públicos)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa pode ver produtos ativos
CREATE POLICY "Produtos públicos são visíveis para todos" ON products
  FOR SELECT USING (is_active = true);

-- Política: Apenas admins podem inserir/editar produtos (implementar depois com auth)
CREATE POLICY "Admin pode gerenciar produtos" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABELA: SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  base_price DECIMAL(10,2),
  estimated_time TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_name ON services USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- RLS para serviços (dados públicos)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa pode ver serviços ativos
CREATE POLICY "Serviços públicos são visíveis para todos" ON services
  FOR SELECT USING (is_active = true);

-- Política: Apenas admins podem gerenciar serviços
CREATE POLICY "Admin pode gerenciar serviços" ON services
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABELA: ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- RLS para pedidos (dados privados por usuário)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas seus próprios pedidos
CREATE POLICY "Usuários veem seus próprios pedidos" ON orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Política: Qualquer pessoa pode criar pedidos
CREATE POLICY "Qualquer pessoa pode criar pedidos" ON orders
  FOR INSERT WITH CHECK (true);

-- Política: Admin pode ver todos os pedidos
CREATE POLICY "Admin pode ver todos os pedidos" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABELA: ORDER_ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('product', 'service')),
  item_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- RLS para itens de pedido (herdam permissão do pedido)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política: Acesso baseado no acesso ao pedido pai
CREATE POLICY "Acesso a itens baseado no pedido" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (auth.uid() = orders.user_id OR orders.user_id IS NULL OR auth.role() = 'service_role')
    )
  );

-- ============================================
-- TABELA: PROMOTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  category TEXT,
  min_amount DECIMAL(10,2),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);

-- RLS para promoções (dados públicos)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Política: Promoções ativas são visíveis para todos
CREATE POLICY "Promoções ativas são públicas" ON promotions
  FOR SELECT USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());

-- Política: Admin pode gerenciar promoções
CREATE POLICY "Admin pode gerenciar promoções" ON promotions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABELA: COUPONS
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- RLS para cupons (dados públicos para validação)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Política: Cupons ativos podem ser consultados para validação
CREATE POLICY "Cupons podem ser validados publicamente" ON coupons
  FOR SELECT USING (is_active = true);

-- Política: Admin pode gerenciar cupons
CREATE POLICY "Admin pode gerenciar cupons" ON coupons
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABELA: APP_CONFIGS
-- ============================================
CREATE TABLE IF NOT EXISTS app_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_app_configs_key ON app_configs(key);

-- RLS para configurações (apenas admin)
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admin pode acessar configurações
CREATE POLICY "Apenas admin acessa configurações" ON app_configs
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FUNÇÕES PARA UPDATED_AT AUTOMÁTICO
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers para updated_at em todas as tabelas
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_configs_updated_at BEFORE UPDATE ON app_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================
-- Inserir algumas categorias padrão e dados de exemplo
INSERT INTO app_configs (key, value, description) VALUES
('store_name', '"Moria Peças & Serviços"', 'Nome da loja'),
('store_description', '"Sua oficina de confiança - peças e serviços automotivos"', 'Descrição da loja'),
('contact_phone', '"+55 11 99999-9999"', 'Telefone de contato'),
('contact_email', '"contato@moria.com.br"', 'Email de contato'),
('store_address', '"Rua das Oficinas, 123 - Centro - São Paulo/SP"', 'Endereço da loja')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- VIEWS PARA FACILITAR CONSULTAS
-- ============================================

-- View para produtos com informações calculadas
CREATE OR REPLACE VIEW products_view AS
SELECT 
  *,
  CASE 
    WHEN promo_price IS NOT NULL THEN promo_price
    WHEN sale_price IS NOT NULL THEN sale_price
    ELSE price
  END AS effective_price,
  CASE 
    WHEN promo_price IS NOT NULL THEN ROUND(((price - promo_price) / price * 100), 2)
    WHEN sale_price IS NOT NULL THEN ROUND(((price - sale_price) / price * 100), 2)
    ELSE 0
  END AS discount_percentage
FROM products;

-- View para pedidos com total de itens
CREATE OR REPLACE VIEW orders_view AS
SELECT 
  o.*,
  COUNT(oi.id) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- ============================================
-- ÍNDICES COMPOSTOS PARA QUERIES COMPLEXAS
-- ============================================

-- Para busca de produtos por categoria e status
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);

-- Para busca de produtos por preço
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price) WHERE is_active = true;

-- Para relatórios de pedidos por período
CREATE INDEX IF NOT EXISTS idx_orders_created_period ON orders(created_at, status);

-- ============================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- ============================================

COMMENT ON TABLE products IS 'Tabela de produtos - peças automotivas';
COMMENT ON COLUMN products.images IS 'Array JSON com URLs das imagens do produto';
COMMENT ON COLUMN products.specifications IS 'Objeto JSON com especificações técnicas';
COMMENT ON COLUMN products.vehicle_compatibility IS 'Array JSON com veículos compatíveis';

COMMENT ON TABLE services IS 'Tabela de serviços automotivos oferecidos';
COMMENT ON COLUMN services.estimated_time IS 'Tempo estimado para execução (ex: "2 horas")';

COMMENT ON TABLE orders IS 'Tabela de pedidos dos clientes';
COMMENT ON COLUMN orders.user_id IS 'Referência ao usuário autenticado (pode ser NULL para pedidos anônimos)';

COMMENT ON TABLE order_items IS 'Itens dos pedidos (produtos ou serviços)';

-- ============================================
-- FINALIZAÇÃO
-- ============================================

-- Garantir que as políticas RLS estão ativas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Sucesso!
SELECT '✅ Schema do Supabase criado com sucesso!' as status;