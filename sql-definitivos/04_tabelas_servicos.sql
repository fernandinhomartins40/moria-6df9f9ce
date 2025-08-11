-- ========================================
-- SQL 04: TABELA DE SERVIÇOS
-- Execute QUARTO (após produtos, antes de políticas admin)
-- ========================================

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  duration integer DEFAULT 60, -- em minutos
  is_active boolean DEFAULT true,
  image_url text,
  requirements text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS RLS BÁSICAS (SEM ADMIN)
-- ========================================

-- Habilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Políticas básicas - Todos podem ver serviços ativos
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

-- Verificar se foi criado com sucesso
SELECT 
  'Tabela de serviços criada com sucesso!' as status,
  current_timestamp as executado_em;