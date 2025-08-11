-- ========================================
-- RECRIAR TABELA COMPANY_INFO COMPLETA
-- Execute este SQL se houver problemas persistentes com company_info
-- ========================================

-- Remover tabela se existir (cuidado: apaga dados!)
DROP TABLE IF EXISTS company_info CASCADE;

-- Recriar tabela completa
CREATE TABLE company_info (
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

-- Trigger para updated_at
CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON company_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver informações da empresa
CREATE POLICY "Informações da empresa são visíveis para todos" ON company_info
  FOR SELECT USING (true);

-- Inserir dados da empresa
INSERT INTO company_info (
  name,
  description,
  email,
  phone,
  whatsapp,
  address,
  business_hours
) VALUES (
  'Moria Peças & Serviços',
  'Especializada em peças automotivas e serviços de qualidade há mais de 20 anos.',
  'contato@moria.com',
  '(11) 3333-3333',
  '5511999999999',
  'Rua das Peças, 123 - Centro, São Paulo - SP, 01234-567',
  '{
    "monday": "08:00-18:00",
    "tuesday": "08:00-18:00", 
    "wednesday": "08:00-18:00",
    "thursday": "08:00-18:00",
    "friday": "08:00-18:00",
    "saturday": "08:00-12:00",
    "sunday": "Fechado"
  }'::jsonb
);

-- Verificar estrutura e dados
SELECT 'Tabela company_info recriada com sucesso!' as status;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'company_info' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Dados inseridos:' as info, name, email, phone FROM company_info;