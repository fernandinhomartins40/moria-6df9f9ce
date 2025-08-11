-- ========================================
-- SQL 03: TABELA DE PRODUTOS
-- Execute TERCEIRO (após auth, antes de políticas admin)
-- ========================================

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  sku text UNIQUE,
  weight numeric(8,3) DEFAULT 0,
  dimensions jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adicionar referência de products em favorites
ALTER TABLE favorites 
ADD CONSTRAINT fk_favorites_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ========================================
-- POLÍTICAS RLS BÁSICAS (SEM ADMIN)
-- ========================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas básicas - Todos podem ver produtos ativos
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Verificar se foi criado com sucesso
SELECT 
  'Tabela de produtos criada com sucesso!' as status,
  current_timestamp as executado_em;