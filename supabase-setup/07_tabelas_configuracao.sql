-- ========================================
-- PASSO 7: TABELAS DE CONFIGURAÇÃO
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Criar tabela settings
CREATE TABLE IF NOT EXISTS settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  category text DEFAULT 'general',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela company_info
CREATE TABLE IF NOT EXISTS company_info (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  email text,
  phone text,
  whatsapp text,
  address text,
  logo_url text,
  website text,
  social_media jsonb DEFAULT '{}',
  business_hours jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS settings_key_idx ON settings(key);
CREATE INDEX IF NOT EXISTS settings_category_idx ON settings(category);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_info_updated_at ON company_info;
CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON company_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (políticas de admin no SQL 09)
DROP POLICY IF EXISTS "Configurações são visíveis para todos" ON settings;
CREATE POLICY "Configurações são visíveis para todos" ON settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Informações da empresa são visíveis para todos" ON company_info;
CREATE POLICY "Informações da empresa são visíveis para todos" ON company_info
  FOR SELECT USING (true);

-- NOTA: Políticas de admin para configurações serão criadas no SQL 09

-- Verificar criação
SELECT 'Tabelas de configuração criadas com sucesso!' as status;
SELECT COUNT(*) as total_settings FROM settings;
SELECT COUNT(*) as total_company_info FROM company_info;