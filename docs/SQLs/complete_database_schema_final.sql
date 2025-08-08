-- ============================================
-- MORIA PEÇAS & SERVIÇOS - SCHEMA COMPLETO FINAL
-- Baseado na Auditoria Completa da Aplicação
-- Data: 2025-08-08
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto

-- ============================================
-- 1. AJUSTES NAS TABELAS EXISTENTES
-- ============================================

-- Adicionar colunas faltantes na tabela PRODUCTS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS supplier TEXT,
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;

-- Adicionar colunas faltantes na tabela ORDERS
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS has_products BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Adicionar colunas faltantes na tabela ORDER_ITEMS
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id),
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id);

-- ============================================
-- 2. TABELA: SETTINGS (CRÍTICA)
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

-- Índices para SETTINGS
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- RLS para SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Política: Apenas service_role (admin) pode acessar configurações
CREATE POLICY "Apenas admin acessa configurações" ON settings
  FOR ALL USING (auth.role() = 'service_role');

-- Inserir configurações padrão (usando INSERT seguro)
DO $$
BEGIN
  -- Inserir apenas se não existir
  INSERT INTO settings (key, value, description, category) 
  SELECT * FROM (VALUES
    ('store_name', 'Moria Peças & Serviços Automotivos', 'Nome da loja', 'store'),
    ('store_cnpj', '12.345.678/0001-90', 'CNPJ da empresa', 'store'),
    ('store_phone', '(11) 4567-8900', 'Telefone principal', 'store'),
    ('store_email', 'contato@moriapecas.com.br', 'E-mail principal', 'store'),
    ('store_address', 'Av. das Oficinas, 1500 - Vila Industrial - São Paulo, SP - CEP: 03460-000', 'Endereço completo', 'store'),
    ('store_hours', 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h', 'Horário funcionamento', 'store'),
    ('default_margin', '25', 'Margem padrão de lucro (%)', 'sales'),
    ('free_shipping_min', '150.00', 'Valor mínimo frete grátis', 'sales'),
    ('delivery_fee', '15.00', 'Taxa de entrega local', 'sales'),
    ('max_installments', '6', 'Parcelas máximas', 'sales'),
    ('notifications_new_orders', 'true', 'Notificar novos pedidos', 'notifications'),
    ('notifications_low_stock', 'true', 'Notificar estoque baixo', 'notifications'),
    ('notifications_weekly_reports', 'true', 'Relatórios semanais por e-mail', 'notifications')
  ) AS v(key, value, description, category)
  WHERE NOT EXISTS (
    SELECT 1 FROM settings WHERE settings.key = v.key
  );
END $$;

-- ============================================
-- 3. TABELA: COMPANY_INFO
-- ============================================
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
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

-- RLS para COMPANY_INFO
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Política: Público pode ler, admin pode escrever
CREATE POLICY "Informações da empresa são públicas" ON company_info
  FOR SELECT USING (true);

CREATE POLICY "Apenas admin edita informações da empresa" ON company_info
  FOR ALL USING (auth.role() = 'service_role');

-- Inserir informações padrão da empresa (usando INSERT seguro)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM company_info WHERE cnpj = '12.345.678/0001-90') THEN
    INSERT INTO company_info (name, cnpj, phone, email, address, business_hours, services_list, guarantees) VALUES (
      'Moria Peças & Serviços Automotivos',
      '12.345.678/0001-90',
      '(11) 4567-8900',
      'contato@moriapecas.com.br',
      'Av. das Oficinas, 1500 - Vila Industrial - São Paulo, SP - CEP: 03460-000',
      '{"weekdays": "08:00 - 18:00", "saturday": "08:00 - 12:00", "sunday": "Fechado"}'::jsonb,
      ARRAY['Manutenção Preventiva', 'Freios', 'Suspensão', 'Ar Condicionado', 'Elétrica', 'Geometria']::TEXT[],
      '{"products": "90 dias", "services": "6 meses", "warranty_conditions": "Conforme fabricante"}'::jsonb
    );
  END IF;
END $$;

-- ============================================
-- 4. TABELA: QUOTES (CRÍTICA)
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL DEFAULT ('QT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT,
  customer_email TEXT,
  vehicle_info TEXT,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  notes TEXT,
  valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para QUOTES
CREATE INDEX IF NOT EXISTS idx_quotes_status_created ON quotes(status, created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_whatsapp ON quotes(customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until);

-- RLS para QUOTES
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Política: Cliente vê apenas seus orçamentos
CREATE POLICY "Cliente vê seus orçamentos" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Admin vê todos os orçamentos
CREATE POLICY "Admin vê todos orçamentos" ON quotes
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 5. TABELA: QUOTE_ITEMS (CRÍTICA)
-- ============================================
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  service_id UUID REFERENCES services(id),
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir que pelo menos um ID seja preenchido
  CONSTRAINT quote_items_has_reference CHECK (
    (product_id IS NOT NULL AND service_id IS NULL) OR 
    (product_id IS NULL AND service_id IS NOT NULL)
  )
);

-- Índices para QUOTE_ITEMS
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_service_id ON quote_items(service_id);

-- RLS para QUOTE_ITEMS
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Política: Acesso baseado no orçamento
CREATE POLICY "Acesso via orçamento" ON quote_items
  FOR SELECT USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE auth.uid() = user_id OR auth.role() = 'service_role'
    )
  );

CREATE POLICY "Admin gerencia itens do orçamento" ON quote_items
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 6. TABELA: PROVISIONAL_USERS (CRÍTICA)
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

-- Índices para PROVISIONAL_USERS
CREATE INDEX IF NOT EXISTS idx_provisional_users_whatsapp ON provisional_users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_provisional_users_login ON provisional_users(login);

-- RLS para PROVISIONAL_USERS
ALTER TABLE provisional_users ENABLE ROW LEVEL SECURITY;

-- Política: Sistema interno + admin
CREATE POLICY "Sistema e admin acessam usuários provisórios" ON provisional_users
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 7. TABELA: CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  cpf TEXT UNIQUE,
  birth_date DATE,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para CUSTOMERS
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_cpf ON customers(cpf);

-- RLS para CUSTOMERS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Política: Cliente vê apenas seus dados
CREATE POLICY "Cliente vê seus dados" ON customers
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Política: Cliente edita apenas seus dados
CREATE POLICY "Cliente edita seus dados" ON customers
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Política: Admin vê todos os clientes
CREATE POLICY "Admin vê todos clientes" ON customers
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 8. TABELA: CUSTOMER_ADDRESSES
-- ============================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('home', 'work', 'other')),
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para CUSTOMER_ADDRESSES
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON customer_addresses(customer_id, is_default);

-- RLS para CUSTOMER_ADDRESSES
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Política: Cliente vê apenas seus endereços
CREATE POLICY "Cliente vê seus endereços" ON customer_addresses
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth.uid() = auth_user_id
    )
  );

-- Política: Cliente edita apenas seus endereços
CREATE POLICY "Cliente edita seus endereços" ON customer_addresses
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth.uid() = auth_user_id
    )
  );

-- Política: Admin vê todos os endereços
CREATE POLICY "Admin vê todos endereços" ON customer_addresses
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 9. TABELA: CUSTOMER_FAVORITES
-- ============================================
CREATE TABLE IF NOT EXISTS customer_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir unicidade
  UNIQUE(customer_id, product_id)
);

-- Índices para CUSTOMER_FAVORITES
CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_product ON customer_favorites(product_id);

-- RLS para CUSTOMER_FAVORITES
ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

-- Política: Cliente vê apenas seus favoritos
CREATE POLICY "Cliente vê seus favoritos" ON customer_favorites
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth.uid() = auth_user_id
    )
  );

-- Política: Cliente gerencia apenas seus favoritos
CREATE POLICY "Cliente gerencia seus favoritos" ON customer_favorites
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth.uid() = auth_user_id
    )
  );

-- Política: Admin vê todos os favoritos
CREATE POLICY "Admin vê todos favoritos" ON customer_favorites
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 10. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Produtos - Melhorar busca e filtros
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand) WHERE brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock_min ON products(stock, min_stock);

-- Pedidos - Melhorar consultas administrativas
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_whatsapp ON orders(customer_whatsapp) WHERE customer_whatsapp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_total ON orders(total_amount);

-- Serviços
CREATE INDEX IF NOT EXISTS idx_services_category_active ON services(category, is_active);
CREATE INDEX IF NOT EXISTS idx_services_name_search ON services USING gin(to_tsvector('portuguese', name));

-- Cupons
CREATE INDEX IF NOT EXISTS idx_coupons_code_active ON coupons(code, is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires ON coupons(expires_at);

-- Promoções
CREATE INDEX IF NOT EXISTS idx_promotions_active_dates ON promotions(is_active, start_date, end_date);

-- ============================================
-- 11. FUNCTIONS E TRIGGERS ÚTEIS
-- ============================================

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provisional_users_updated_at BEFORE UPDATE ON provisional_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para atualizar estatísticas do cliente
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas quando um pedido é criado/atualizado
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE customers SET
            total_orders = (
                SELECT COUNT(*) FROM orders 
                WHERE user_id = customers.auth_user_id AND status = 'completed'
            ),
            total_spent = (
                SELECT COALESCE(SUM(total_amount), 0) FROM orders 
                WHERE user_id = customers.auth_user_id AND status = 'completed'
            )
        WHERE auth_user_id = NEW.user_id;
        RETURN NEW;
    END IF;
    
    -- Atualizar estatísticas quando um pedido é deletado
    IF TG_OP = 'DELETE' THEN
        UPDATE customers SET
            total_orders = (
                SELECT COUNT(*) FROM orders 
                WHERE user_id = customers.auth_user_id AND status = 'completed'
            ),
            total_spent = (
                SELECT COALESCE(SUM(total_amount), 0) FROM orders 
                WHERE user_id = customers.auth_user_id AND status = 'completed'
            )
        WHERE auth_user_id = OLD.user_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para atualizar estatísticas do cliente
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- ============================================
-- 12. VIEWS ÚTEIS
-- ============================================

-- View para produtos com informações completas
CREATE OR REPLACE VIEW products_view AS
SELECT 
    p.*,
    CASE 
        WHEN p.stock <= p.min_stock THEN 'low'
        WHEN p.stock = 0 THEN 'out'
        ELSE 'in_stock'
    END as stock_status,
    CASE
        WHEN p.promo_price IS NOT NULL AND p.promo_price < p.sale_price THEN p.promo_price
        WHEN p.sale_price IS NOT NULL AND p.sale_price < p.price THEN p.sale_price
        ELSE p.price
    END as effective_price,
    CASE
        WHEN p.promo_price IS NOT NULL AND p.promo_price < p.sale_price THEN 
            ROUND(((p.price - p.promo_price) / p.price * 100)::NUMERIC, 1)
        WHEN p.sale_price IS NOT NULL AND p.sale_price < p.price THEN 
            ROUND(((p.price - p.sale_price) / p.price * 100)::NUMERIC, 1)
        ELSE 0
    END as discount_percentage
FROM products p;

-- View para pedidos com informações do cliente
CREATE OR REPLACE VIEW orders_view AS
SELECT 
    o.*,
    c.name as customer_full_name,
    c.cpf as customer_cpf,
    COUNT(oi.id) as total_items,
    SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN customers c ON o.user_id = c.auth_user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, c.name, c.cpf;

-- View para orçamentos com informações completas
CREATE OR REPLACE VIEW quotes_view AS
SELECT 
    q.*,
    c.name as customer_full_name,
    c.cpf as customer_cpf,
    COUNT(qi.id) as total_items,
    SUM(qi.quantity) as total_quantity,
    CASE 
        WHEN q.valid_until < NOW() THEN 'expired'
        ELSE q.status
    END as current_status
FROM quotes q
LEFT JOIN customers c ON q.user_id = c.auth_user_id
LEFT JOIN quote_items qi ON q.id = qi.quote_id
GROUP BY q.id, c.name, c.cpf;

-- ============================================
-- 13. VERIFICAÇÃO FINAL E ESTATÍSTICAS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SCHEMA COMPLETO CRIADO COM SUCESSO!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tabelas principais: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('products', 'services', 'orders', 'order_items', 'coupons', 'promotions'));
    RAISE NOTICE 'Tabelas adicionais: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('settings', 'company_info', 'quotes', 'quote_items', 'provisional_users', 'customers', 'customer_addresses', 'customer_favorites'));
    RAISE NOTICE 'Views criadas: %', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name LIKE '%_view');
    RAISE NOTICE 'Policies criadas: %', (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public');
    RAISE NOTICE 'Índices criados: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
    RAISE NOTICE '============================================';
    RAISE NOTICE 'BANCO DE DADOS PRONTO PARA USO COMPLETO!';
    RAISE NOTICE 'Todas as funcionalidades da aplicação Moria';
    RAISE NOTICE 'estão agora suportadas pelo banco de dados.';
    RAISE NOTICE '============================================';
END $$;