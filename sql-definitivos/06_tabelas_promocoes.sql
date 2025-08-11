-- ========================================
-- SQL 06: TABELAS DE PROMOÇÕES (CONSTRAINTS CORRIGIDAS)
-- Execute SEXTO (constraints compatíveis com dados)
-- ========================================

-- Tabela de promoções
CREATE TABLE IF NOT EXISTS promotions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value >= 0),
  min_amount numeric(10,2) DEFAULT 0 CHECK (min_amount >= 0),
  max_uses integer,
  current_uses integer DEFAULT 0 CHECK (current_uses >= 0),
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  promotion_type text DEFAULT 'general' CHECK (promotion_type IN ('general', 'category')),
  applicable_categories text[] DEFAULT '{}',
  applicable_products uuid[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de cupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value >= 0),
  min_amount numeric(10,2) DEFAULT 0 CHECK (min_amount >= 0),
  max_uses integer,
  current_uses integer DEFAULT 0 CHECK (current_uses >= 0),
  expiry_date timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS RLS BÁSICAS (SEM ADMIN)
-- ========================================

-- Habilitar RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Políticas básicas - Todos podem ver promoções/cupons ativos
CREATE POLICY "Anyone can view active promotions" ON promotions
  FOR SELECT USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR now() <= expiry_date));

-- Verificar se foi criado com sucesso
SELECT 
  'Tabelas de promoções criadas com sucesso!' as status,
  current_timestamp as executado_em;