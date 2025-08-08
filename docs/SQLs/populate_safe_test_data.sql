-- ============================================
-- POPULAR BANCO COM DADOS DE TESTE - VERSAO SEGURA  
-- Este script pode ser executado multiplas vezes sem conflitos
-- ============================================

-- ============================================
-- 1. CONFIGURACOES - UPSERT SEGURO
-- ============================================

INSERT INTO settings (key, value, description, category) VALUES
  ('store_name', 'Moria Pecas e Servicos Automotivos', 'Nome da loja', 'store'),
  ('store_cnpj', '12.345.678/0001-90', 'CNPJ da empresa', 'store'), 
  ('store_phone', '(11) 4567-8900', 'Telefone principal', 'store'),
  ('store_email', 'contato@moriapecas.com.br', 'E-mail de contato', 'store'),
  ('default_profit_margin', '40', 'Margem de lucro padrao', 'sales'),
  ('free_shipping_minimum', '200', 'Valor minimo frete gratis', 'sales'),
  ('delivery_fee', '18.90', 'Taxa de entrega', 'sales'),
  ('delivery_time', '2', 'Tempo entrega dias', 'sales'),
  ('notifications_new_orders', 'true', 'Notificar pedidos', 'notifications'),
  ('notifications_low_stock', 'true', 'Notificar estoque baixo', 'notifications')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================  
-- 2. PRODUTOS DE TESTE - APENAS SE NAO EXISTIREM
-- ============================================

INSERT INTO products (name, description, category, price, sale_price, stock, min_stock, is_active, rating, brand, supplier, sku)
SELECT * FROM (VALUES
  ('Filtro Oleo Mann W75/3', 'Filtro de oleo alta qualidade', 'Filtros', 28.90, 25.90, 45, 10, true, 4.8, 'Mann', 'AutoParts', 'FO-W753'),
  ('Filtro Ar Tecfil ARL2142', 'Filtro de ar papel alta retencao', 'Filtros', 32.90, 29.90, 38, 8, true, 4.7, 'Tecfil', 'Central', 'FA-ARL2142'),
  ('Pastilha Freio Cobreq N1049', 'Pastilha ceramica dianteira', 'Freios', 149.90, 139.90, 18, 3, true, 4.6, 'Cobreq', 'Cobreq', 'PF-N1049'),
  ('Disco Freio Fremax BD4405', 'Disco dianteiro ventilado', 'Freios', 189.90, 179.90, 12, 2, true, 4.7, 'Fremax', 'Fremax', 'DF-BD4405'),
  ('Amortecedor Monroe G7349', 'Amortecedor dianteiro gas', 'Suspensao', 245.90, 229.90, 14, 3, true, 4.8, 'Monroe', 'Monroe', 'AD-G7349'),
  ('Vela NGK BKR6E', 'Vela ignicao iridio', 'Motor', 38.90, 34.90, 65, 15, true, 4.8, 'NGK', 'NGK', 'VI-BKR6E'),
  ('Oleo Castrol GTX 20W50', 'Oleo mineral 1L', 'Lubrificantes', 28.90, 25.90, 85, 20, true, 4.6, 'Castrol', 'Castrol', 'OM-GTX'),
  ('Bateria Moura 60Ah', 'Bateria selada AGM', 'Eletrica', 289.90, 269.90, 22, 5, true, 4.8, 'Moura', 'Moura', 'BA-M60GD'),
  ('Kit Embreagem Sachs', 'Kit completo embreagem', 'Motor', 389.90, 359.90, 6, 1, true, 4.8, 'Sachs', 'ZF', 'KE-6239089'),
  ('Correia Dentada Gates', 'Kit correia + tensor', 'Motor', 189.90, 175.90, 12, 3, true, 4.9, 'Gates', 'Gates', 'CD-K025578')
) AS v(name, description, category, price, sale_price, stock, min_stock, is_active, rating, brand, supplier, sku)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE products.sku = v.sku);

-- ============================================
-- 3. SERVICOS DE TESTE - APENAS SE NAO EXISTIREM  
-- ============================================

INSERT INTO services (name, description, category, base_price, estimated_time, is_active)
SELECT * FROM (VALUES
  ('Troca de Oleo', 'Troca oleo + filtro + verificacao', 'Manutencao', 95.00, '45 min', true),
  ('Revisao 10000km', 'Revisao preventiva completa', 'Manutencao', 280.00, '3 horas', true),
  ('Alinhamento 3D', 'Alinhamento computadorizado', 'Geometria', 75.00, '45 min', true),
  ('Balanceamento 4 Rodas', 'Balanceamento completo', 'Geometria', 50.00, '30 min', true),
  ('Freios Completo', 'Pastilhas + fluido + regulagem', 'Freios', 220.00, '2 horas', true),
  ('Diagnostico Scanner', 'Diagnostico eletronico', 'Diagnostico', 85.00, '1 hora', true),
  ('Ar Condicionado', 'Higienizacao completa A/C', 'Conforto', 120.00, '90 min', true),
  ('Amortecedores Par', 'Troca par amortecedores', 'Suspensao', 380.00, '3 horas', true)
) AS v(name, description, category, base_price, estimated_time, is_active)
WHERE NOT EXISTS (SELECT 1 FROM services WHERE services.name = v.name);

-- ============================================
-- 4. CUPONS DE TESTE - APENAS SE NAO EXISTIREM
-- ============================================

INSERT INTO coupons (code, description, discount_type, discount_value, min_amount, max_uses, used_count, expires_at, is_active)
SELECT * FROM (VALUES
  ('PRIMEIRA20', '20% desconto primeira compra', 'percentage', 20.00, 100.00, 100, 5, '2024-12-31 23:59:59', true),
  ('FRETE0', 'Frete gratis compras +200', 'fixed_amount', 25.00, 200.00, 500, 25, '2024-12-31 23:59:59', true),
  ('OLEO10', 'R$10 OFF troca oleo', 'fixed_amount', 10.00, 80.00, 200, 15, '2024-12-31 23:59:59', true),
  ('REVISAO15', '15% OFF revisoes', 'percentage', 15.00, 150.00, 100, 8, '2024-12-31 23:59:59', true),
  ('CLIENTE10', '10% clientes cadastrados', 'percentage', 10.00, 50.00, 1000, 150, '2024-12-31 23:59:59', true)
) AS v(code, description, discount_type, discount_value, min_amount, max_uses, used_count, expires_at, is_active)  
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE coupons.code = v.code);

-- ============================================
-- 5. USUARIOS DE TESTE - APENAS SE NAO EXISTIREM
-- ============================================

INSERT INTO provisional_users (name, whatsapp, login, password)
SELECT * FROM (VALUES
  ('Carlos Silva', '11987654321', 'carlos.silva', 'cs123'),
  ('Maria Santos', '11876543210', 'maria.santos', 'ms456'),
  ('Joao Oliveira', '11765432109', 'joao.oliveira', 'jo789'),
  ('Ana Costa', '11654321098', 'ana.costa', 'ac012'),
  ('Pedro Rodrigues', '11543210987', 'pedro.rodrigues', 'pr345'),
  ('Julia Lima', '11432109876', 'julia.lima', 'jl678'),
  ('Roberto Pereira', '11321098765', 'roberto.pereira', 'rp901'),
  ('Fernanda Alves', '11210987654', 'fernanda.alves', 'fa234'),
  ('Ricardo Nascimento', '11109876543', 'ricardo.nascimento', 'rn567'),
  ('Tatiana Barbosa', '11098765432', 'tatiana.barbosa', 'tb890')
) AS v(name, whatsapp, login, password)
WHERE NOT EXISTS (SELECT 1 FROM provisional_users WHERE provisional_users.whatsapp = v.whatsapp);

-- ============================================
-- 6. PEDIDOS DE TESTE COM USUARIOS EXISTENTES
-- ============================================

DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Criar alguns pedidos para usuarios existentes
    FOR user_record IN 
        SELECT id, name, whatsapp 
        FROM provisional_users 
        LIMIT 5
    LOOP
        -- Inserir pedido apenas se nao existir
        INSERT INTO orders (user_id, customer_name, customer_whatsapp, total, status, has_products, created_at)
        SELECT user_record.id, user_record.name, user_record.whatsapp, 
               (RANDOM() * 400 + 50)::DECIMAL(10,2), 
               CASE (RANDOM() * 4)::INT 
                   WHEN 0 THEN 'pending'
                   WHEN 1 THEN 'processing' 
                   WHEN 2 THEN 'shipped'
                   ELSE 'delivered'
               END,
               true,
               NOW() - (RANDOM() * INTERVAL '30 days')
        WHERE NOT EXISTS (
            SELECT 1 FROM orders 
            WHERE customer_whatsapp = user_record.whatsapp
        );
    END LOOP;
END $$;

-- ============================================
-- 7. ORCAMENTOS DE TESTE  
-- ============================================

DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Criar alguns orcamentos para usuarios existentes
    FOR user_record IN 
        SELECT id, name, whatsapp 
        FROM provisional_users 
        WHERE id NOT IN (SELECT user_id FROM orders)
        LIMIT 3
    LOOP
        INSERT INTO quotes (user_id, customer_name, customer_whatsapp, vehicle_info, total, status, created_at)
        SELECT user_record.id, user_record.name, user_record.whatsapp,
               'Honda Civic 2015',
               (RANDOM() * 500 + 100)::DECIMAL(10,2),
               CASE (RANDOM() * 3)::INT
                   WHEN 0 THEN 'pending'
                   WHEN 1 THEN 'approved'
                   ELSE 'rejected' 
               END,
               NOW() - (RANDOM() * INTERVAL '15 days')
        WHERE NOT EXISTS (
            SELECT 1 FROM quotes 
            WHERE customer_whatsapp = user_record.whatsapp
        );
    END LOOP;
END $$;

-- ============================================
-- ESTATISTICAS E VERIFICACAO
-- ============================================

SELECT 'DADOS DE TESTE INSERIDOS!' as status;
SELECT COUNT(*) || ' produtos' as produtos FROM products;
SELECT COUNT(*) || ' servicos' as servicos FROM services; 
SELECT COUNT(*) || ' cupons' as cupons FROM coupons;
SELECT COUNT(*) || ' usuarios' as usuarios FROM provisional_users;
SELECT COUNT(*) || ' pedidos' as pedidos FROM orders;
SELECT COUNT(*) || ' orcamentos' as orcamentos FROM quotes;
SELECT COUNT(*) || ' configuracoes' as configuracoes FROM settings;

SELECT 'APLICACAO PRONTA PARA TESTES!' as resultado;