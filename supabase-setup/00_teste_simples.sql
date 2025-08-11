-- ========================================
-- TESTE SIMPLES - VERIFICAR SE DADOS INSEREM
-- Execute para testar se promoções e cupons funcionam
-- ========================================

-- Testar inserção básica de promoção
INSERT INTO promotions (title, description, discount_type, discount_value) VALUES 
('TESTE_PROMOCAO', 'Teste de promoção básica', 'percentage', 10.00)
ON CONFLICT DO NOTHING;

-- Testar inserção básica de cupom
INSERT INTO coupons (code, description, discount_type, discount_value) VALUES 
('TESTE_CUPOM', 'Teste de cupom básico', 'percentage', 10.00)
ON CONFLICT (code) DO NOTHING;

-- Verificar se inseriu
SELECT 'TESTE PROMOÇÃO:' as status, title FROM promotions WHERE title = 'TESTE_PROMOCAO';
SELECT 'TESTE CUPOM:' as status, code FROM coupons WHERE code = 'TESTE_CUPOM';

-- Contar dados existentes
SELECT 'TOTAL PROMOÇÕES:' as info, COUNT(*) as quantidade FROM promotions;
SELECT 'TOTAL CUPONS:' as info, COUNT(*) as quantidade FROM coupons;

-- Limpar testes
DELETE FROM promotions WHERE title = 'TESTE_PROMOCAO';
DELETE FROM coupons WHERE code = 'TESTE_CUPOM';

SELECT 'Testes concluídos - tabelas funcionais!' as resultado;