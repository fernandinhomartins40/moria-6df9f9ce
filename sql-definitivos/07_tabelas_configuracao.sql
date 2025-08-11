-- ========================================
-- SQL 07: TABELAS DE CONFIGURAÇÃO (COLUNAS COMPLETAS)
-- Execute SÉTIMO (todas as colunas necessárias)
-- ========================================

-- Tabela de configurações gerais
CREATE TABLE IF NOT EXISTS settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de informações da empresa (TODAS as colunas identificadas nos logs)
CREATE TABLE IF NOT EXISTS company_info (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  email text,
  phone text,
  whatsapp text, -- Coluna identificada nos logs
  address text,
  business_hours jsonb DEFAULT '{}', -- Renomeado de operating_hours (logs)
  established_year integer,
  website text,
  social_media jsonb DEFAULT '{}',
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_company_info_updated_at ON company_info;
CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON company_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS RLS BÁSICAS (SEM ADMIN)
-- ========================================

-- Habilitar RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Políticas básicas - Todos podem ver informações públicas
CREATE POLICY "Anyone can view public settings" ON settings
  FOR SELECT USING (key NOT LIKE 'private_%');

CREATE POLICY "Anyone can view company info" ON company_info
  FOR SELECT USING (true);

-- Verificar se foi criado com sucesso
SELECT 
  'Tabelas de configuração criadas com sucesso!' as status,
  current_timestamp as executado_em;