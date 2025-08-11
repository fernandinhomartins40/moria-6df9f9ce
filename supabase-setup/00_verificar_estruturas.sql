-- ========================================
-- VERIFICAÇÃO COMPLETA DE ESTRUTURAS
-- Execute para diagnosticar problemas nas tabelas
-- ========================================

-- Verificar constraints da tabela promotions (PostgreSQL moderno)
SELECT 
    'CONSTRAINTS PROMOTIONS:' as info,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'promotions'::regclass 
AND contype = 'c';

-- Verificar constraints da tabela coupons (PostgreSQL moderno)
SELECT 
    'CONSTRAINTS COUPONS:' as info,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'coupons'::regclass 
AND contype = 'c';

-- Verificar estruturas das tabelas
SELECT 
    'ESTRUTURA PROMOTIONS:' as tabela,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'promotions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'ESTRUTURA COUPONS:' as tabela,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'coupons' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Testar inserções simples
INSERT INTO promotions (
    title, 
    description, 
    discount_type, 
    discount_value
) VALUES (
    'TESTE_PROMOCAO',
    'Teste de promoção',
    'percentage',
    10.00
) ON CONFLICT DO NOTHING;

INSERT INTO coupons (
    code, 
    description, 
    discount_type, 
    discount_value
) VALUES (
    'TESTE_CUPOM',
    'Teste de cupom',
    'percentage',
    10.00
) ON CONFLICT (code) DO NOTHING;

-- Verificar se inseriu
SELECT 'Promoções de teste:' as tipo, title FROM promotions WHERE title = 'TESTE_PROMOCAO';
SELECT 'Cupons de teste:' as tipo, code FROM coupons WHERE code = 'TESTE_CUPOM';

-- Limpar testes
DELETE FROM promotions WHERE title = 'TESTE_PROMOCAO';
DELETE FROM coupons WHERE code = 'TESTE_CUPOM';

SELECT 'Verificação de estruturas concluída!' as status;