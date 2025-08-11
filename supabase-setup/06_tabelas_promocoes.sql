-- ========================================
-- PASSO 5: TABELAS DE PROMOÇÕES E CUPONS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Criar tabela promotions
CREATE TABLE IF NOT EXISTS promotions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  description text,
  type text DEFAULT 'general',
  conditions jsonb DEFAULT '{}',
  discount_type text CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value decimal(10,2) CHECK (discount_value >= 0),
  max_discount decimal(10,2) CHECK (max_discount >= 0),
  category text,
  min_amount decimal(10,2) CHECK (min_amount >= 0),
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela coupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL CHECK (discount_value >= 0),
  min_amount decimal(10,2) CHECK (min_amount >= 0),
  max_uses integer CHECK (max_uses > 0),
  used_count integer DEFAULT 0 CHECK (used_count >= 0),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS promotions_is_active_idx ON promotions(is_active);
CREATE INDEX IF NOT EXISTS promotions_start_date_idx ON promotions(start_date);
CREATE INDEX IF NOT EXISTS promotions_end_date_idx ON promotions(end_date);
CREATE INDEX IF NOT EXISTS promotions_category_idx ON promotions(category);

CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons(code);
CREATE INDEX IF NOT EXISTS coupons_is_active_idx ON coupons(is_active);
CREATE INDEX IF NOT EXISTS coupons_expires_at_idx ON coupons(expires_at);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (políticas de admin no SQL 09)
DROP POLICY IF EXISTS "Promoções ativas são visíveis para todos" ON promotions;
CREATE POLICY "Promoções ativas são visíveis para todos" ON promotions
  FOR SELECT USING (is_active = true AND start_date <= now() AND (end_date IS NULL OR end_date >= now()));

-- Políticas para coupons
DROP POLICY IF EXISTS "Cupons ativos são visíveis para todos" ON coupons;
CREATE POLICY "Cupons ativos são visíveis para todos" ON coupons
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at >= now()));

-- NOTA: Políticas de admin para promoções e cupons serão criadas no SQL 09

-- Verificar criação
SELECT 'Tabelas de promoções e cupons criadas com sucesso!' as status;
SELECT COUNT(*) as total_promotions FROM promotions;
SELECT COUNT(*) as total_coupons FROM coupons;