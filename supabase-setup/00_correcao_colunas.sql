-- ========================================
-- CORREÇÃO DEFINITIVA: COMPANY_INFO COMPLETA
-- Execute este SQL se houver erro de "column does not exist"
-- ========================================

-- Verificar se a tabela existe e tem a estrutura correta
DO $$ 
DECLARE
    col_count integer;
BEGIN
    -- Contar quantas das colunas obrigatórias existem
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'company_info' 
    AND table_schema = 'public'
    AND column_name IN ('name', 'description', 'email', 'phone', 'whatsapp', 'address', 'business_hours');
    
    RAISE NOTICE 'Colunas encontradas na company_info: %', col_count;
    
    -- Se menos de 7 colunas essenciais, recriar tabela
    IF col_count < 7 THEN
        RAISE NOTICE 'Estrutura incompleta. Recriando tabela company_info...';
        
        -- Salvar dados existentes se houver
        CREATE TEMP TABLE temp_company_backup AS 
        SELECT * FROM company_info WHERE EXISTS (SELECT 1 FROM company_info LIMIT 1);
        
        -- Recriar tabela completa
        DROP TABLE IF EXISTS company_info CASCADE;
        
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
        
        -- Política básica: todos podem ver
        CREATE POLICY "Informações da empresa são visíveis para todos" ON company_info
            FOR SELECT USING (true);
        
        RAISE NOTICE 'Tabela company_info recriada com estrutura completa!';
        
    ELSE
        -- Estrutura OK, apenas adicionar colunas faltantes
        RAISE NOTICE 'Estrutura OK. Adicionando colunas faltantes...';
        
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS name text;
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS description text;
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS email text;
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS phone text;
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS whatsapp text;
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS address text;
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS logo_url text;
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS website text;
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}';
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{}';
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
        ALTER TABLE company_info ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Verificar estrutura final
SELECT 
    'ESTRUTURA FINAL DA TABELA COMPANY_INFO:' as titulo,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'company_info' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Contar colunas
SELECT 
    'TOTAL DE COLUNAS:' as info,
    COUNT(*) as quantidade
FROM information_schema.columns 
WHERE table_name = 'company_info' 
AND table_schema = 'public';

SELECT 'company_info corrigida e pronta para uso!' as status;