-- ============================================
-- POPULAR BANCO COM DADOS COMPLETOS - VERSÃO FINAL
-- Baseado na estrutura completa criada pela auditoria
-- Execute APÓS criar_missing_tables_safe.sql
-- ============================================

-- ============================================
-- 1. PRODUTOS REALISTAS (30 produtos)
-- ============================================
-- Inserir produtos usando DO block para evitar duplicatas
DO $$
BEGIN
  -- Apenas inserir se não existirem produtos com SKU
  IF NOT EXISTS (SELECT 1 FROM products WHERE sku LIKE 'MAN-%' OR sku LIKE 'WEG-%') THEN
    INSERT INTO products (
      name, description, category, price, sale_price, promo_price,
      stock, is_active, rating, specifications, vehicle_compatibility,
      brand, supplier, sku, min_stock
    ) VALUES
      -- FILTROS (8 produtos)
      ('Filtro de Oleo Mann W712/75', 'Filtro de oleo original Mann para motores 1.0 a 2.0', 'Filtros', 28.90, 24.90, null, 45, true, 4.8, 
       '{"tipo": "Oleo", "rosca": "M20x1.5", "altura": "95mm", "diametro": "76mm"}', 
       '["VW Gol", "VW Fox", "Chevrolet Onix", "Fiat Uno"]', 'Mann', 'Mann Filter', 'MAN-W712-75', 10),
       
      ('Filtro de Ar Wega FAP9334', 'Filtro de ar de alta performance', 'Filtros', 32.50, 28.90, 25.90, 38, true, 4.6,
       '{"tipo": "Ar", "material": "Papel", "formato": "Retangular"}',
       '["Honda Civic", "Honda Fit", "Toyota Corolla"]', 'Wega', 'Wega Filtros', 'WEG-FAP9334', 8),
       
      ('Filtro Combustivel Tecfil PSC945', 'Filtro combustivel com separador agua', 'Filtros', 45.90, 39.90, null, 22, true, 4.7,
       '{"tipo": "Combustivel", "rosca": "M16", "funcao": "Separador"}',
       '["Ford Ka", "Ford Fiesta", "Ford EcoSport"]', 'Tecfil', 'Tecfil do Brasil', 'TEC-PSC945', 5),
       
      ('Filtro Cabine Bosch 0986BF0566', 'Filtro ar condicionado com carvao ativado', 'Filtros', 52.80, 46.90, null, 31, true, 4.9,
       '{"tipo": "Cabine", "material": "Carvao ativado", "formato": "Retangular"}',
       '["Chevrolet Cruze", "Chevrolet Tracker", "Chevrolet Spin"]', 'Bosch', 'Robert Bosch', 'BSH-0986BF0566', 6),
       
      ('Filtro Oleo Mahle OX191D', 'Filtro oleo premium Mahle', 'Filtros', 35.90, 32.90, null, 28, true, 4.8,
       '{"tipo": "Oleo", "marca": "Mahle", "aplicacao": "Diesel"}',
       '["VW Amarok", "Ford Ranger", "Mitsubishi L200"]', 'Mahle', 'Mahle Original', 'MAH-OX191D', 8),
       
      ('Filtro Ar Fram CA8715', 'Filtro de ar esportivo Fram', 'Filtros', 42.90, 38.90, 34.90, 19, true, 4.5,
       '{"tipo": "Ar", "linha": "Esportivo", "fluxo": "Alto"}',
       '["Renault Sandero", "Renault Logan", "Nissan March"]', 'Fram', 'Fram Brasil', 'FRA-CA8715', 5),
       
      ('Filtro Combustivel Wega FCI1640', 'Filtro combustivel injecao eletronica', 'Filtros', 38.90, 34.90, null, 25, true, 4.6,
       '{"tipo": "Combustivel", "sistema": "Injecao", "pressao": "3 bar"}',
       '["Hyundai HB20", "Hyundai Creta", "Kia Picanto"]', 'Wega', 'Wega Filtros', 'WEG-FCI1640', 6),
       
      ('Kit Filtros Revisao Completa', 'Kit com 4 filtros para revisao', 'Filtros', 185.90, 159.90, 139.90, 12, true, 4.9,
       '{"tipo": "Kit", "itens": "4 filtros", "aplicacao": "Revisao"}',
       '["Varios modelos populares"]', 'Varios', 'Kit Moria', 'KIT-REV001', 3),

      -- FREIOS (6 produtos)
      ('Pastilha Freio Diant Cobreq N1515', 'Pastilha freio dianteira ceramica', 'Freios', 89.90, 79.90, null, 35, true, 4.7,
       '{"posicao": "Dianteira", "material": "Ceramica", "kit": "4 pastilhas"}',
       '["VW Gol G5/G6", "VW Voyage", "VW Saveiro"]', 'Cobreq', 'Cobreq do Brasil', 'COB-N1515', 8),
       
      ('Disco Freio Varga RCDI02150', 'Par discos freio ventilado', 'Freios', 145.90, 129.90, 119.90, 18, true, 4.8,
       '{"tipo": "Ventilado", "diametro": "280mm", "espessura": "25mm"}',
       '["Honda Civic", "Honda CR-V", "Honda Fit"]', 'Varga', 'Varga Freios', 'VAR-RCDI02150', 4),
       
      ('Fluido Freio Bosch DOT4 500ml', 'Fluido freio sintetico DOT4', 'Freios', 28.90, 24.90, null, 42, true, 4.9,
       '{"tipo": "DOT4", "volume": "500ml", "temperatura": "260C"}',
       '["Universal - todos veiculos"]', 'Bosch', 'Robert Bosch', 'BSH-DOT4-500', 12),
       
      ('Cilindro Roda Tras Controil C3407', 'Cilindro roda traseira', 'Freios', 65.90, 58.90, null, 24, true, 4.6,
       '{"posicao": "Traseira", "diametro": "19mm", "material": "Ferro"}',
       '["Fiat Uno", "Fiat Palio", "Fiat Siena"]', 'Controil', 'Controil Freios', 'CTR-C3407', 6),
       
      ('Cabo Freio Mao Controil C2890', 'Cabo freio estacionamento', 'Freios', 45.90, 39.90, null, 28, true, 4.5,
       '{"tipo": "Estacionamento", "lado": "Direito", "comprimento": "1.2m"}',
       '["Chevrolet Celta", "Chevrolet Corsa", "Chevrolet Prisma"]', 'Controil', 'Controil Cabos', 'CTR-C2890', 5),
       
      ('Lona Freio Fras-le LF1635', 'Jogo lonas freio traseira', 'Freios', 72.90, 65.90, null, 22, true, 4.8,
       '{"posicao": "Traseira", "largura": "40mm", "comprimento": "200mm"}',
       '["Toyota Corolla", "Toyota Etios", "Toyota Yaris"]', 'Fras-le', 'Fras-le SA', 'FRA-LF1635', 6),

      -- MOTOR (8 produtos)
      ('Vela Ignicao NGK BPR6ES', 'Vela ignicao eletrodo simples', 'Motor', 12.90, 10.90, 9.90, 85, true, 4.8,
       '{"tipo": "Simples", "gap": "0.8mm", "rosca": "14mm"}',
       '["VW 1.0 Total Flex", "GM 1.0 SOHC", "Fiat 1.0 Fire"]', 'NGK', 'NGK do Brasil', 'NGK-BPR6ES', 20),
       
      ('Correia Dentada Gates 5472XS', 'Correia dentada com tensor', 'Motor', 89.90, 79.90, null, 28, true, 4.9,
       '{"dentes": "111", "largura": "25mm", "kit": "Correia + tensor"}',
       '["VW Golf 1.6", "Audi A3 1.6", "Seat Leon 1.6"]', 'Gates', 'Gates do Brasil', 'GAT-5472XS', 5),
       
      ('Bomba Agua Nakata NKB10025', 'Bomba agua com turbina bronze', 'Motor', 125.90, 112.90, null, 18, true, 4.7,
       '{"material": "Bronze", "vazao": "120 L/min", "temperatura": "110C"}',
       '["Chevrolet Onix", "Chevrolet Prisma", "Chevrolet Agile"]', 'Nakata', 'Nakata Automotiva', 'NAK-NKB10025', 4),
       
      ('Sensor Posicao Virabrequim Bosch', 'Sensor rotacao do motor', 'Motor', 85.90, 76.90, null, 22, true, 4.6,
       '{"tipo": "Hall", "conector": "3 pinos", "resistencia": "800 ohms"}',
       '["Ford Ka 1.0/1.6", "Ford Fiesta 1.6", "Ford EcoSport 1.6"]', 'Bosch', 'Robert Bosch', 'BSH-SEN001', 6),
       
      ('Junta Cabecote Taranto JC485', 'Junta cabecote motor 1.0', 'Motor', 145.90, 129.90, null, 12, true, 4.8,
       '{"motor": "1.0 8v", "material": "Grafite", "espessura": "1.5mm"}',
       '["Fiat Uno Mille", "Fiat Palio 1.0", "Fiat Siena 1.0"]', 'Taranto', 'Taranto Juntas', 'TAR-JC485', 3),
       
      ('Termostato Wahler 3091.87D', 'Termostato arrefecimento 87C', 'Motor', 45.90, 39.90, null, 31, true, 4.7,
       '{"temperatura": "87C", "diametro": "52mm", "tipo": "Cera"}',
       '["Honda Civic 1.8", "Honda Fit 1.5", "Honda City 1.5"]', 'Wahler', 'Wahler GmbH', 'WAH-3091-87D', 8),
       
      ('Kit Distribuicao Dayco KTB472', 'Kit completo distribuicao', 'Motor', 285.90, 259.90, 229.90, 8, true, 4.9,
       '{"itens": "Correia+tensor+bomba", "garantia": "80.000km"}',
       '["Toyota Corolla 1.8", "Toyota RAV4 2.0", "Toyota Camry 2.4"]', 'Dayco', 'Dayco Brasil', 'DAY-KTB472', 2),
       
      ('Filtro Oleo Lubrificante W712/52', 'Filtro oleo Mann premium', 'Motor', 35.90, 31.90, null, 38, true, 4.8,
       '{"marca": "Mann", "rosca": "3/4-16UNF", "altura": "108mm"}',
       '["Renault Duster 1.6/2.0", "Renault Fluence 2.0", "Nissan Sentra 2.0"]', 'Mann', 'Mann Filter', 'MAN-W712-52', 10),

      -- ELETRICA (1 produto)
      ('Bateria Moura M50JD', 'Bateria 50Ah livre manutencao', 'Eletrica', 185.90, 169.90, 159.90, 15, true, 4.8,
       '{"amperagem": "50Ah", "voltagem": "12V", "tipo": "Livre manutencao"}',
       '["VW Gol/Fox", "Chevrolet Onix/Prisma", "Fiat Uno/Palio"]', 'Moura', 'Acumuladores Moura', 'MOU-M50JD', 3);
  END IF;
END $$;

-- ============================================
-- 2. SERVIÇOS REALISTAS (12 serviços)
-- ============================================
INSERT INTO services (
  name, description, category, base_price, estimated_time, specifications, is_active
) 
SELECT * FROM (VALUES
  -- Manutenção Preventiva
  ('Troca de Óleo e Filtro', 'Serviço completo troca óleo motor + filtro', 'Manutencao', 45.00, '30 minutos',
   '{"inclui": "Mão de obra + descarte", "garantia": "90 dias", "oleo": "Não incluso"}', true),
   
  ('Revisão 10.000 km', 'Revisão preventiva completa 10 mil km', 'Manutencao', 150.00, '2 horas',
   '{"itens": "15 verificações", "garantia": "6 meses", "relatorio": "Incluso"}', true),
   
  ('Troca Filtro Ar Condicionado', 'Substituição filtro cabine + higienização', 'Manutencao', 35.00, '20 minutos',
   '{"higienizacao": "Inclusa", "garantia": "60 dias", "filtro": "Não incluso"}', true),
   
  ('Verificação Sistema Arrefecimento', 'Teste radiador + mangueiras + bomba', 'Manutencao', 60.00, '45 minutos',
   '{"pressao": "Teste incluso", "vazamento": "Detecção", "relatorio": "Detalhado"}', true),

  -- Freios
  ('Sangria Sistema Freios', 'Sangria completa + fluido novo', 'Freios', 80.00, '1 hora',
   '{"fluido": "DOT4 incluso", "teste": "Pedal + discos", "garantia": "90 dias"}', true),
   
  ('Substituição Pastilhas Freio', 'Troca pastilhas dianteiras ou traseiras', 'Freios', 120.00, '1.5 horas',
   '{"regulagem": "Inclusa", "teste": "Obrigatório", "pastilhas": "Não inclusas"}', true),
   
  ('Retífica Discos Freio', 'Retífica par discos freio', 'Freios', 90.00, '2 horas',
   '{"medicao": "Inclusa", "garantia": "6 meses", "balanceamento": "Incluso"}', true),

  -- Suspensão e Direção  
  ('Alinhamento + Balanceamento', 'Alinhamento 3D + balanceamento 4 rodas', 'Suspensao', 65.00, '1 hora',
   '{"equipamento": "3D laser", "relatorio": "Impresso", "garantia": "30 dias"}', true),
   
  ('Troca Amortecedores', 'Substituição par amortecedores', 'Suspensao', 150.00, '2 horas',
   '{"alinhamento": "Incluso", "teste": "Obrigatório", "amortecedores": "Não inclusos"}', true),
   
  ('Geometria Completa', 'Alinhamento + caster + camber + convergência', 'Suspensao', 85.00, '1.5 horas',
   '{"ajustes": "Todos inclusos", "relatorio": "Detalhado", "garantia": "60 dias"}', true),

  -- Ar Condicionado
  ('Carga Gás R134a', 'Carga completa gás refrigerante', 'Ar Condicionado', 120.00, '45 minutos',
   '{"gas": "R134a incluso", "teste": "Vazamentos", "garantia": "90 dias"}', true),

  -- Elétrica
  ('Scanner Diagnóstico OBD2', 'Leitura codes erro + reset modules', 'Eletrica', 60.00, '45 minutos',
   '{"relatorio": "Detalhado", "reset": "Incluso", "orientacao": "Inclusa"}', true)
) AS v(name, description, category, base_price, estimated_time, specifications, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM services WHERE services.name = v.name
);

-- ============================================
-- 3. CUPONS DE DESCONTO (8 cupons)
-- ============================================
INSERT INTO coupons (
  code, description, discount_type, discount_value, 
  min_amount, max_uses, used_count, is_active,
  expires_at
)
SELECT * FROM (VALUES
  ('BEMVINDO10', 'Desconto 10% primeira compra', 'percentage', 10.00, 50.00, 100, 0, true,
   CURRENT_DATE + INTERVAL '30 days'),
   
  ('FRETE25', 'Frete grátis pedidos acima R$ 200', 'fixed_amount', 25.00, 200.00, null, 0, true,
   CURRENT_DATE + INTERVAL '60 days'),
   
  ('REVISAO15', 'Desconto R$ 15 em serviços manutenção', 'fixed_amount', 15.00, 80.00, 50, 0, true,
   CURRENT_DATE + INTERVAL '45 days'),
   
  ('FILTROS20', 'Desconto 20% linha filtros', 'percentage', 20.00, 100.00, null, 0, true,
   CURRENT_DATE + INTERVAL '15 days'),
   
  ('FREIOS30', 'Desconto R$ 30 serviços freios', 'fixed_amount', 30.00, 150.00, 30, 0, true,
   CURRENT_DATE + INTERVAL '20 days'),
   
  ('COMBO50', 'Desconto R$ 50 pedidos acima R$ 400', 'fixed_amount', 50.00, 400.00, 25, 0, true,
   CURRENT_DATE + INTERVAL '30 days'),
   
  ('ELETRICA15', 'Desconto 15% categoria elétrica', 'percentage', 15.00, 80.00, null, 0, true,
   CURRENT_DATE + INTERVAL '25 days'),
   
  ('MOTOR12', 'Desconto 12% categoria motor', 'percentage', 12.00, 60.00, null, 0, true,
   CURRENT_DATE + INTERVAL '40 days')
) AS v(code, description, discount_type, discount_value, min_amount, max_uses, used_count, is_active, expires_at)
WHERE NOT EXISTS (
  SELECT 1 FROM coupons WHERE coupons.code = v.code
);

-- ============================================
-- 4. PROMOÇÕES (5 promoções)
-- ============================================
INSERT INTO promotions (
  title, description, discount_type, discount_value,
  category, min_amount, start_date, end_date, is_active
)
SELECT * FROM (VALUES
  ('Kit Revisão Completa', 'Desconto 25% comprando kit revisão (4 filtros)', 'percentage', 25.00,
   'Filtros', 150.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
   
  ('Combo Freios', 'Desconto R$ 80 comprando pastilhas + discos + fluido', 'fixed_amount', 80.00,
   'Freios', 300.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', true),
   
  ('Pacote Suspensão', 'Desconto 20% amortecedores + molas + buchas', 'percentage', 20.00,
   'Suspensao', 250.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '25 days', true),
   
  ('Elétrica Inverno', 'Desconto R$ 50 bateria + alternador + motor partida', 'fixed_amount', 50.00,
   'Eletrica', 400.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true),
   
  ('Motor Performance', 'Desconto 18% velas + correia + filtros + óleo', 'percentage', 18.00,
   'Motor', 200.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '35 days', true)
) AS v(title, description, discount_type, discount_value, category, min_amount, start_date, end_date, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM promotions WHERE promotions.title = v.title
);

-- ============================================
-- 5. USUÁRIOS PROVISÓRIOS DE TESTE (5 usuários)
-- ============================================
INSERT INTO provisional_users (name, whatsapp, login, password, is_active)
SELECT * FROM (VALUES
  ('João Silva Santos', '11987654321', 'joao.silva', 'hashed_password_1', true),
  ('Maria Oliveira Costa', '11876543210', 'maria.oliveira', 'hashed_password_2', true),
  ('Carlos Eduardo Souza', '11765432109', 'carlos.souza', 'hashed_password_3', true),
  ('Ana Paula Lima', '11654321098', 'ana.lima', 'hashed_password_4', true),
  ('Roberto Machado', '11543210987', 'roberto.machado', 'hashed_password_5', true)
) AS v(name, whatsapp, login, password, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM provisional_users WHERE provisional_users.whatsapp = v.whatsapp
);

-- ============================================
-- 6. VERIFICAÇÃO FINAL E ESTATÍSTICAS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DADOS POPULADOS COM SUCESSO!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Configurações: % registros', (SELECT COUNT(*) FROM settings);
    RAISE NOTICE 'Informações empresa: % registros', (SELECT COUNT(*) FROM company_info);
    RAISE NOTICE 'Produtos: % registros', (SELECT COUNT(*) FROM products WHERE is_active = true);
    RAISE NOTICE 'Serviços: % registros', (SELECT COUNT(*) FROM services WHERE is_active = true);
    RAISE NOTICE 'Cupons: % registros', (SELECT COUNT(*) FROM coupons WHERE is_active = true);
    RAISE NOTICE 'Promoções: % registros', (SELECT COUNT(*) FROM promotions WHERE is_active = true);
    RAISE NOTICE 'Usuários provisórios: % registros', (SELECT COUNT(*) FROM provisional_users WHERE is_active = true);
    RAISE NOTICE '============================================';
    RAISE NOTICE 'APLICAÇÃO MORIA TOTALMENTE POPULADA!';
    RAISE NOTICE 'Todas as funcionalidades podem ser testadas.';
    RAISE NOTICE '============================================';
END $$;