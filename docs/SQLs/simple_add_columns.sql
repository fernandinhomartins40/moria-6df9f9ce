-- Adicionar colunas faltantes na tabela promotions
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{}'::jsonb;  
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS max_discount DECIMAL(10,2);

-- Permitir NULL nas datas para flexibilidade
ALTER TABLE promotions ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE promotions ALTER COLUMN end_date DROP NOT NULL;