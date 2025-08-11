-- ========================================
-- VERIFICAR E CORRIGIR CONSTRAINTS COUPONS
-- Execute se houver problemas com discount_type='fixed'
-- ========================================

-- Verificar constraints atuais da tabela coupons (PostgreSQL moderno)
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'coupons'::regclass 
AND conname LIKE '%discount_type%';

-- Verificar estrutura da tabela coupons
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'coupons' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Se a constraint estiver errada, recriar:
-- (descomente apenas se necessário)

/*
-- Remover constraint incorreta
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;

-- Adicionar constraint correta
ALTER TABLE coupons ADD CONSTRAINT coupons_discount_type_check 
CHECK (discount_type IN ('percentage', 'fixed'));
*/

-- Testar inserção simples para verificar
INSERT INTO coupons (
    code, 
    description, 
    discount_type, 
    discount_value, 
    min_amount
) VALUES (
    'TESTE_FIXED',
    'Teste de cupom com valor fixo',
    'fixed',
    10.00,
    50.00
) ON CONFLICT (code) DO NOTHING;

-- Verificar se inseriu
SELECT 'Teste fixed:' as tipo, code, discount_type FROM coupons WHERE code = 'TESTE_FIXED';

-- Limpar teste
DELETE FROM coupons WHERE code = 'TESTE_FIXED';

SELECT 'Verificação de constraints concluída!' as status;