-- ========================================
-- PASSO 3: TABELA DE SERVIÇOS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Criar tabela services
CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  base_price decimal(10,2) NOT NULL CHECK (base_price >= 0),
  estimated_time text,
  specifications jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS services_category_idx ON services(category);
CREATE INDEX IF NOT EXISTS services_is_active_idx ON services(is_active);
CREATE INDEX IF NOT EXISTS services_name_idx ON services USING gin(to_tsvector('portuguese', name));

-- Trigger para updated_at (remover se existir antes de criar)
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (políticas de admin serão criadas depois)
DROP POLICY IF EXISTS "Serviços públicos são visíveis para todos" ON services;

-- Política: Todos podem ver serviços ativos
CREATE POLICY "Serviços públicos são visíveis para todos" ON services
  FOR SELECT USING (is_active = true);

-- NOTA: Política de admin será criada no SQL 11 (após tabela profiles existir)

-- Verificar criação
SELECT 'Tabela services criada com sucesso!' as status;
SELECT COUNT(*) as total_services FROM services;