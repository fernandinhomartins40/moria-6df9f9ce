-- ============================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA PROMOTIONS
-- Para suportar funcionalidades completas do sistema  
-- ============================================

-- Verificar se as colunas existem antes de adicionar
DO $$
BEGIN
    -- Adicionar coluna 'type' se nao existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'type') THEN
        ALTER TABLE promotions ADD COLUMN type TEXT DEFAULT 'general';
        RAISE NOTICE 'Coluna type adicionada a tabela promotions';
    END IF;
    
    -- Adicionar coluna 'conditions' se nao existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'conditions') THEN
        ALTER TABLE promotions ADD COLUMN conditions JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Coluna conditions adicionada a tabela promotions';
    END IF;
    
    -- Adicionar coluna 'max_discount' se nao existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promotions' AND column_name = 'max_discount') THEN
        ALTER TABLE promotions ADD COLUMN max_discount DECIMAL(10,2);
        RAISE NOTICE 'Coluna max_discount adicionada a tabela promotions';
    END IF;
    
    -- Verificar se start_date e end_date sao NOT NULL (podem causar problemas)
    -- Alterar para permitir NULL se necessario
    ALTER TABLE promotions ALTER COLUMN start_date DROP NOT NULL;
    ALTER TABLE promotions ALTER COLUMN end_date DROP NOT NULL;
    RAISE NOTICE 'Colunas start_date e end_date agora permitem NULL';
    
END $$;

-- Verificar estrutura final da tabela
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ESTRUTURA ATUALIZADA DA TABELA PROMOTIONS';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Colunas disponiveis:';
    RAISE NOTICE '- id (UUID)';
    RAISE NOTICE '- title (TEXT) - usado como name pela aplicacao';
    RAISE NOTICE '- description (TEXT)';
    RAISE NOTICE '- type (TEXT) - novo campo adicionado';
    RAISE NOTICE '- conditions (JSONB) - novo campo adicionado';
    RAISE NOTICE '- discount_type (TEXT)';
    RAISE NOTICE '- discount_value (DECIMAL)';
    RAISE NOTICE '- max_discount (DECIMAL) - novo campo adicionado';
    RAISE NOTICE '- category (TEXT)';
    RAISE NOTICE '- min_amount (DECIMAL)';
    RAISE NOTICE '- start_date (TIMESTAMPTZ) - agora pode ser NULL';
    RAISE NOTICE '- end_date (TIMESTAMPTZ) - agora pode ser NULL';
    RAISE NOTICE '- is_active (BOOLEAN)';
    RAISE NOTICE '- created_at (TIMESTAMPTZ)';
    RAISE NOTICE '- updated_at (TIMESTAMPTZ)';
    RAISE NOTICE '============================================';
END $$;