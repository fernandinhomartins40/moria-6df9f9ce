-- ============================================
-- SCRIPT COMPLETO: ADICIONAR TABELAS FALTANTES AO SUPABASE
-- Adiciona tabelas que estão sendo usadas pela aplicação mas não existem no schema
-- Execute APÓS o supabase_schema.sql
-- ============================================

-- ============================================
-- TABELA: SETTINGS - Para configurações do sistema
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Políticas: Configurações podem ser lidas publicamente, mas só admin altera
CREATE POLICY "Settings podem ser lidas publicamente" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode gerenciar settings" ON settings
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger para updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: COMPANY_INFO - Informações da empresa
-- ============================================
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  business_hours JSONB DEFAULT '{}'::jsonb,
  social_media JSONB DEFAULT '{}'::jsonb,
  services_list TEXT[] DEFAULT ARRAY[]::TEXT[],
  guarantees JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Políticas: Informações da empresa são públicas para leitura
CREATE POLICY "Company info é pública para leitura" ON company_info
  FOR SELECT USING (true);

CREATE POLICY "Apenas admin pode gerenciar company info" ON company_info
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger para updated_at
CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: QUOTES - Orçamentos de serviços
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT,
  customer_email TEXT,
  vehicle_info TEXT, -- Ex: "Honda Civic 2015 - Automático"
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  notes TEXT,
  valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_whatsapp ON quotes(customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);

-- RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuários veem apenas seus próprios orçamentos
CREATE POLICY "Usuários veem seus próprios orçamentos" ON quotes
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Qualquer pessoa pode criar orçamentos" ON quotes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin pode ver todos os orçamentos" ON quotes
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger para updated_at
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: QUOTE_ITEMS - Itens dos orçamentos
-- ============================================
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_service_id ON quote_items(service_id);

-- RLS
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Políticas: Herdam acesso do orçamento pai
CREATE POLICY "Acesso a itens baseado no orçamento" ON quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND (auth.uid() = quotes.user_id OR quotes.user_id IS NULL OR auth.role() = 'service_role')
    )
  );

-- ============================================
-- TABELA: PROVISIONAL_USERS - Usuários provisórios
-- (Para clientes que fazem pedidos sem se cadastrar completamente)
-- ============================================
CREATE TABLE IF NOT EXISTS provisional_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT UNIQUE NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Hash da senha
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_provisional_users_whatsapp ON provisional_users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_provisional_users_login ON provisional_users(login);

-- RLS
ALTER TABLE provisional_users ENABLE ROW LEVEL SECURITY;

-- Políticas: Apenas admin pode ver usuários provisórios
CREATE POLICY "Apenas admin pode gerenciar usuários provisórios" ON provisional_users
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger para updated_at
CREATE TRIGGER update_provisional_users_updated_at BEFORE UPDATE ON provisional_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AJUSTAR TABELA ORDERS PARA COMPATIBILIDADE
-- ============================================

-- Adicionar colunas que podem estar faltando na tabela orders
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS has_products BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) GENERATED ALWAYS AS (total_amount) STORED;

-- Atualizar check constraint para incluir novos status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'delivered', 'cancelled'));

-- ============================================
-- AJUSTAR TABELA ORDER_ITEMS PARA COMPATIBILIDADE
-- ============================================

-- Modificar order_items para aceitar UUIDs e ser compatível
ALTER TABLE order_items 
  DROP CONSTRAINT IF EXISTS order_items_type_check;

ALTER TABLE order_items 
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;

-- Atualizar constraint
ALTER TABLE order_items ADD CONSTRAINT order_items_has_item 
  CHECK (product_id IS NOT NULL OR service_id IS NOT NULL);

-- ============================================
-- ADICIONAR COLUNAS FALTANTES EM PRODUCTS
-- ============================================

-- Adicionar colunas que podem ser usadas pela aplicação
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS supplier TEXT,
  ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;

-- Índice para SKU
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ============================================
-- DADOS INICIAIS OBRIGATÓRIOS
-- ============================================

-- Inserir configurações básicas
INSERT INTO settings (key, value, description, category) VALUES
  ('store_name', 'Moria Pecas e Servicos Automotivos', 'Nome da loja', 'store'),
  ('store_phone', '(11) 4567-8900', 'Telefone principal', 'store'),
  ('store_email', 'contato@moriapecas.com.br', 'E-mail de contato', 'store'),
  ('notifications_new_orders', 'true', 'Notificar novos pedidos', 'notifications'),
  ('notifications_low_stock', 'true', 'Notificar estoque baixo', 'notifications')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

-- Inserir informações básicas da empresa
INSERT INTO company_info (name, phone, email) VALUES
  ('Moria Pecas e Servicos Automotivos', '(11) 4567-8900', 'contato@moriapecas.com.br')
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS ADICIONAIS PARA COMPATIBILIDADE
-- ============================================

-- View para orçamentos com informações calculadas
CREATE OR REPLACE VIEW quotes_view AS
SELECT 
  q.*,
  COUNT(qi.id) as total_items,
  COALESCE(SUM(qi.total_price), 0) as calculated_total
FROM quotes q
LEFT JOIN quote_items qi ON q.id = qi.quote_id
GROUP BY q.id;

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
  (SELECT COUNT(*) FROM services WHERE is_active = true) as active_services,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM quotes) as total_quotes,
  (SELECT COUNT(*) FROM coupons WHERE is_active = true) as active_coupons,
  (SELECT COUNT(*) FROM provisional_users WHERE is_active = true) as provisional_users,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status NOT IN ('cancelled')) as total_revenue;

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE settings IS 'Configurações do sistema (chave-valor)';
COMMENT ON TABLE company_info IS 'Informações da empresa/loja';
COMMENT ON TABLE quotes IS 'Orçamentos de serviços solicitados pelos clientes';
COMMENT ON TABLE quote_items IS 'Itens dos orçamentos (produtos ou serviços)';
COMMENT ON TABLE provisional_users IS 'Usuários temporários criados durante o checkout';

COMMENT ON COLUMN quotes.vehicle_info IS 'Informações do veículo do cliente';
COMMENT ON COLUMN quotes.valid_until IS 'Data de validade do orçamento';
COMMENT ON COLUMN provisional_users.password IS 'Hash da senha do usuário provisório';

-- ============================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Para relatórios e dashboards
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_status_created ON quotes(status, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Listar todas as tabelas criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('settings', 'company_info', 'quotes', 'quote_items', 'provisional_users')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('settings', 'company_info', 'quotes', 'quote_items', 'provisional_users')
ORDER BY tablename;

-- Sucesso!
SELECT '✅ Todas as tabelas faltantes foram criadas com sucesso!' as status;
SELECT '🔧 Tabelas adicionadas: settings, company_info, quotes, quote_items, provisional_users' as details;
SELECT '📊 Schema do banco agora está completo para a aplicação Moria!' as result;