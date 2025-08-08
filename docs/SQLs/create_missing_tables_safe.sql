-- ============================================
-- CRIAR TABELAS FALTANTES - VERSÃO SEGURA
-- Baseado na Auditoria Completa da Aplicação Moria
-- Este script pode ser executado múltiplas vezes
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. AJUSTES NAS TABELAS EXISTENTES
-- ============================================

-- Adicionar colunas faltantes na tabela PRODUCTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
        ALTER TABLE products ADD COLUMN brand TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'supplier') THEN
        ALTER TABLE products ADD COLUMN supplier TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
        ALTER TABLE products ADD COLUMN sku TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_stock') THEN
        ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 5;
    END IF;
END $$;

-- Adicionar colunas faltantes na tabela ORDERS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_whatsapp') THEN
        ALTER TABLE orders ADD COLUMN customer_whatsapp TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'has_products') THEN
        ALTER TABLE orders ADD COLUMN has_products BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
        ALTER TABLE orders ADD COLUMN delivery_address TEXT;
    END IF;
END $$;

-- Adicionar colunas faltantes na tabela ORDER_ITEMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_id') THEN
        ALTER TABLE order_items ADD COLUMN product_id UUID REFERENCES products(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'service_id') THEN
        ALTER TABLE order_items ADD COLUMN service_id UUID REFERENCES services(id);
    END IF;
END $$;

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
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'settings' AND policyname = 'Apenas admin acessa configurações') THEN
        CREATE POLICY "Apenas admin acessa configurações" ON settings
          FOR ALL USING (auth.role() = 'service_role');
    END IF;
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

-- Políticas para COMPANY_INFO
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_info' AND policyname = 'Informações da empresa são públicas') THEN
        CREATE POLICY "Informações da empresa são públicas" ON company_info
          FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_info' AND policyname = 'Apenas admin edita informações da empresa') THEN
        CREATE POLICY "Apenas admin edita informações da empresa" ON company_info
          FOR ALL USING (auth.role() = 'service_role');
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

-- Políticas para QUOTES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quotes' AND policyname = 'Cliente vê seus orçamentos') THEN
        CREATE POLICY "Cliente vê seus orçamentos" ON quotes
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quotes' AND policyname = 'Admin vê todos orçamentos') THEN
        CREATE POLICY "Admin vê todos orçamentos" ON quotes
          FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

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

-- Políticas para QUOTE_ITEMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quote_items' AND policyname = 'Acesso via orçamento') THEN
        CREATE POLICY "Acesso via orçamento" ON quote_items
          FOR SELECT USING (
            quote_id IN (
              SELECT id FROM quotes 
              WHERE auth.uid() = user_id OR auth.role() = 'service_role'
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quote_items' AND policyname = 'Admin gerencia itens do orçamento') THEN
        CREATE POLICY "Admin gerencia itens do orçamento" ON quote_items
          FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================
-- 6. TABELA: PROVISIONAL_USERS (CRÍTICA)
-- ============================================
CREATE TABLE IF NOT EXISTS provisional_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT UNIQUE NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para PROVISIONAL_USERS
CREATE INDEX IF NOT EXISTS idx_provisional_users_whatsapp ON provisional_users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_provisional_users_login ON provisional_users(login);

-- RLS para PROVISIONAL_USERS
ALTER TABLE provisional_users ENABLE ROW LEVEL SECURITY;

-- Política para PROVISIONAL_USERS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'provisional_users' AND policyname = 'Sistema e admin acessam usuários provisórios') THEN
        CREATE POLICY "Sistema e admin acessam usuários provisórios" ON provisional_users
          FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

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

-- Políticas para CUSTOMERS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Cliente vê seus dados') THEN
        CREATE POLICY "Cliente vê seus dados" ON customers
          FOR SELECT USING (auth.uid() = auth_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Cliente edita seus dados') THEN
        CREATE POLICY "Cliente edita seus dados" ON customers
          FOR UPDATE USING (auth.uid() = auth_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Admin vê todos clientes') THEN
        CREATE POLICY "Admin vê todos clientes" ON customers
          FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

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

-- Políticas para CUSTOMER_ADDRESSES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customer_addresses' AND policyname = 'Cliente vê seus endereços') THEN
        CREATE POLICY "Cliente vê seus endereços" ON customer_addresses
          FOR SELECT USING (
            customer_id IN (
              SELECT id FROM customers WHERE auth.uid() = auth_user_id
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customer_addresses' AND policyname = 'Cliente edita seus endereços') THEN
        CREATE POLICY "Cliente edita seus endereços" ON customer_addresses
          FOR ALL USING (
            customer_id IN (
              SELECT id FROM customers WHERE auth.uid() = auth_user_id
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customer_addresses' AND policyname = 'Admin vê todos endereços') THEN
        CREATE POLICY "Admin vê todos endereços" ON customer_addresses
          FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

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

-- Políticas para CUSTOMER_FAVORITES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customer_favorites' AND policyname = 'Cliente vê seus favoritos') THEN
        CREATE POLICY "Cliente vê seus favoritos" ON customer_favorites
          FOR SELECT USING (
            customer_id IN (
              SELECT id FROM customers WHERE auth.uid() = auth_user_id
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customer_favorites' AND policyname = 'Cliente gerencia seus favoritos') THEN
        CREATE POLICY "Cliente gerencia seus favoritos" ON customer_favorites
          FOR ALL USING (
            customer_id IN (
              SELECT id FROM customers WHERE auth.uid() = auth_user_id
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customer_favorites' AND policyname = 'Admin vê todos favoritos') THEN
        CREATE POLICY "Admin vê todos favoritos" ON customer_favorites
          FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================
-- 10. INSERIR DADOS PADRÃO
-- ============================================

-- Configurações padrão
DO $$
BEGIN
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

-- Informações da empresa
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
-- 11. VERIFICAÇÃO FINAL
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'TABELAS FALTANTES CRIADAS COM SUCESSO!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tabelas criadas/verificadas:';
    RAISE NOTICE '- settings: %', CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN 'OK' ELSE 'ERRO' END;
    RAISE NOTICE '- company_info: %', CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'company_info') THEN 'OK' ELSE 'ERRO' END;
    RAISE NOTICE '- quotes: %', CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN 'OK' ELSE 'ERRO' END;
    RAISE NOTICE '- quote_items: %', CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quote_items') THEN 'OK' ELSE 'ERRO' END;
    RAISE NOTICE '- provisional_users: %', CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'provisional_users') THEN 'OK' ELSE 'ERRO' END;
    RAISE NOTICE '- customers: %', CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN 'OK' ELSE 'ERRO' END;
    RAISE NOTICE '- customer_addresses: %', CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_addresses') THEN 'OK' ELSE 'ERRO' END;
    RAISE NOTICE '- customer_favorites: %', CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_favorites') THEN 'OK' ELSE 'ERRO' END;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'APLICAÇÃO MORIA PRONTA PARA USO COMPLETO!';
    RAISE NOTICE '============================================';
END $$;