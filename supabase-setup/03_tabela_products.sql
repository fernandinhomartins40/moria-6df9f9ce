-- ========================================
-- PASSO 2: TABELA DE PRODUTOS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Criar tabela products
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  sale_price decimal(10,2) CHECK (sale_price >= 0),
  promo_price decimal(10,2) CHECK (promo_price >= 0),
  images text[] DEFAULT '{}',
  stock integer DEFAULT 0 CHECK (stock >= 0),
  is_active boolean DEFAULT true,
  rating decimal(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  specifications jsonb DEFAULT '{}',
  vehicle_compatibility text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);
CREATE INDEX IF NOT EXISTS products_price_idx ON products(price);
CREATE INDEX IF NOT EXISTS products_name_idx ON products USING gin(to_tsvector('portuguese', name));

-- Trigger para updated_at (remover se existir antes de criar)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (políticas de admin serão criadas depois)
DROP POLICY IF EXISTS "Produtos públicos são visíveis para todos" ON products;

-- Política: Todos podem ver produtos ativos
CREATE POLICY "Produtos públicos são visíveis para todos" ON products
  FOR SELECT USING (is_active = true);

-- NOTA: Política de admin será criada no SQL 11 (após tabela profiles existir)

-- Verificar criação
SELECT 'Tabela products criada com sucesso!' as status;
SELECT COUNT(*) as total_products FROM products;