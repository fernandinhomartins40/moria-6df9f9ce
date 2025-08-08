-- ============================================
-- POPULAR BANCO COM DADOS DE TESTE - VERSÃO SIMPLES
-- Execute APÓS create_missing_tables_safe.sql
-- ============================================

-- ============================================
-- 1. PRODUTOS REALISTAS (23 produtos)
-- ============================================
DO $$
BEGIN
  -- Apenas inserir se não existirem produtos com SKU
  IF NOT EXISTS (SELECT 1 FROM products WHERE sku IS NOT NULL LIMIT 1) THEN
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

      -- MOTOR (5 produtos)
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

      -- SUSPENSAO (2 produtos)
      ('Amortecedor Diant Cofap GA27012', 'Amortecedor dianteiro gas', 'Suspensao', 89.90, 79.90, null, 24, true, 4.7,
       '{"tipo": "Gas", "posicao": "Dianteira", "curso": "145mm"}',
       '["VW Gol G2/G3/G4", "VW Parati", "VW Saveiro"]', 'Cofap', 'Cofap Cia Fabricadora de Pecas', 'COF-GA27012', 6),
       
      ('Mola Suspensao Tras Eibach', 'Mola helicoidal traseira', 'Suspensao', 125.90, 112.90, null, 16, true, 4.8,
       '{"posicao": "Traseira", "tipo": "Helicoidal", "carga": "Progressiva"}',
       '["Honda Civic Si", "Honda Accord", "Honda CR-V"]', 'Eibach', 'Eibach Springs', 'EIB-TRAS001', 4),

      -- ELETRICA (2 produtos)
      ('Bateria Moura M50JD', 'Bateria 50Ah livre manutencao', 'Eletrica', 185.90, 169.90, 159.90, 15, true, 4.8,
       '{"amperagem": "50Ah", "voltagem": "12V", "tipo": "Livre manutencao"}',
       '["VW Gol/Fox", "Chevrolet Onix/Prisma", "Fiat Uno/Palio"]', 'Moura', 'Acumuladores Moura', 'MOU-M50JD', 3),
       
      ('Alternador Bosch 90A Reman', 'Alternador remanufaturado', 'Eletrica', 285.90, 259.90, null, 8, true, 4.7,
       '{"amperagem": "90A", "voltagem": "12V", "condicao": "Remanufaturado"}',
       '["VW Golf 1.6", "VW Jetta 2.0", "Audi A3 1.8T"]', 'Bosch', 'Robert Bosch', 'BSH-ALT90A', 2);
  END IF;
END $$;

-- ============================================
-- 2. SERVIÇOS (10 serviços)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM services LIMIT 1) THEN
    INSERT INTO services (
      name, description, category, base_price, estimated_time, specifications, is_active
    ) VALUES
      -- Manutenção Preventiva
      ('Troca de Oleo e Filtro', 'Servico completo troca oleo motor + filtro', 'Manutencao', 45.00, '30 minutos',
       '{"inclui": "Mao de obra + descarte", "garantia": "90 dias", "oleo": "Nao incluso"}', true),
       
      ('Revisao 10.000 km', 'Revisao preventiva completa 10 mil km', 'Manutencao', 150.00, '2 horas',
       '{"itens": "15 verificacoes", "garantia": "6 meses", "relatorio": "Incluso"}', true),
       
      ('Troca Filtro Ar Condicionado', 'Substituicao filtro cabine + higienizacao', 'Manutencao', 35.00, '20 minutos',
       '{"higienizacao": "Inclusa", "garantia": "60 dias", "filtro": "Nao incluso"}', true),

      -- Freios
      ('Sangria Sistema Freios', 'Sangria completa + fluido novo', 'Freios', 80.00, '1 hora',
       '{"fluido": "DOT4 incluso", "teste": "Pedal + discos", "garantia": "90 dias"}', true),
       
      ('Substituicao Pastilhas Freio', 'Troca pastilhas dianteiras ou traseiras', 'Freios', 120.00, '1.5 horas',
       '{"regulagem": "Inclusa", "teste": "Obrigatorio", "pastilhas": "Nao inclusas"}', true),
       
      ('Retifica Discos Freio', 'Retifica par discos freio', 'Freios', 90.00, '2 horas',
       '{"medicao": "Inclusa", "garantia": "6 meses", "balanceamento": "Incluso"}', true),

      -- Suspensão e Direção  
      ('Alinhamento + Balanceamento', 'Alinhamento 3D + balanceamento 4 rodas', 'Suspensao', 65.00, '1 hora',
       '{"equipamento": "3D laser", "relatorio": "Impresso", "garantia": "30 dias"}', true),
       
      ('Troca Amortecedores', 'Substituicao par amortecedores', 'Suspensao', 150.00, '2 horas',
       '{"alinhamento": "Incluso", "teste": "Obrigatorio", "amortecedores": "Nao inclusos"}', true),

      -- Ar Condicionado
      ('Carga Gas R134a', 'Carga completa gas refrigerante', 'Ar Condicionado', 120.00, '45 minutos',
       '{"gas": "R134a incluso", "teste": "Vazamentos", "garantia": "90 dias"}', true),

      -- Elétrica
      ('Scanner Diagnostico OBD2', 'Leitura codes erro + reset modules', 'Eletrica', 60.00, '45 minutos',
       '{"relatorio": "Detalhado", "reset": "Incluso", "orientacao": "Inclusa"}', true);
  END IF;
END $$;

-- ============================================
-- 3. CUPONS (5 cupons)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM coupons LIMIT 1) THEN
    INSERT INTO coupons (
      code, description, discount_type, discount_value, 
      min_amount, max_uses, used_count, is_active, expires_at
    ) VALUES
      ('BEMVINDO10', 'Desconto 10% primeira compra', 'percentage', 10.00, 50.00, 100, 0, true,
       CURRENT_DATE + INTERVAL '30 days'),
       
      ('FRETE25', 'Frete gratis pedidos acima R$ 200', 'fixed_amount', 25.00, 200.00, null, 0, true,
       CURRENT_DATE + INTERVAL '60 days'),
       
      ('REVISAO15', 'Desconto R$ 15 em servicos manutencao', 'fixed_amount', 15.00, 80.00, 50, 0, true,
       CURRENT_DATE + INTERVAL '45 days'),
       
      ('FILTROS20', 'Desconto 20% linha filtros', 'percentage', 20.00, 100.00, null, 0, true,
       CURRENT_DATE + INTERVAL '15 days'),
       
      ('FREIOS30', 'Desconto R$ 30 servicos freios', 'fixed_amount', 30.00, 150.00, 30, 0, true,
       CURRENT_DATE + INTERVAL '20 days');
  END IF;
END $$;

-- ============================================
-- 4. PROMOÇÕES (3 promoções)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM promotions LIMIT 1) THEN
    INSERT INTO promotions (
      title, description, discount_type, discount_value,
      category, min_amount, start_date, end_date, is_active
    ) VALUES
      ('Kit Revisao Completa', 'Desconto 25% comprando kit revisao (4 filtros)', 'percentage', 25.00,
       'Filtros', 150.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
       
      ('Combo Freios', 'Desconto R$ 80 comprando pastilhas + discos + fluido', 'fixed_amount', 80.00,
       'Freios', 300.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', true),
       
      ('Pacote Suspensao', 'Desconto 20% amortecedores + molas + buchas', 'percentage', 20.00,
       'Suspensao', 250.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '25 days', true);
  END IF;
END $$;

-- ============================================
-- 5. USUÁRIOS PROVISÓRIOS (3 usuários)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM provisional_users LIMIT 1) THEN
    INSERT INTO provisional_users (name, whatsapp, login, password, is_active) VALUES
      ('Joao Silva Santos', '11987654321', 'joao.silva', 'hashed_password_1', true),
      ('Maria Oliveira Costa', '11876543210', 'maria.oliveira', 'hashed_password_2', true),
      ('Carlos Eduardo Souza', '11765432109', 'carlos.souza', 'hashed_password_3', true);
  END IF;
END $$;

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DADOS POPULADOS COM SUCESSO!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Configuracoes: % registros', (SELECT COUNT(*) FROM settings);
    RAISE NOTICE 'Informacoes empresa: % registros', (SELECT COUNT(*) FROM company_info);
    RAISE NOTICE 'Produtos: % registros', (SELECT COUNT(*) FROM products WHERE is_active = true);
    RAISE NOTICE 'Servicos: % registros', (SELECT COUNT(*) FROM services WHERE is_active = true);
    RAISE NOTICE 'Cupons: % registros', (SELECT COUNT(*) FROM coupons WHERE is_active = true);
    RAISE NOTICE 'Promocoes: % registros', (SELECT COUNT(*) FROM promotions WHERE is_active = true);
    RAISE NOTICE 'Usuarios provisorios: % registros', (SELECT COUNT(*) FROM provisional_users WHERE is_active = true);
    RAISE NOTICE '============================================';
    RAISE NOTICE 'APLICACAO MORIA TOTALMENTE POPULADA!';
    RAISE NOTICE 'Todas as funcionalidades podem ser testadas.';
    RAISE NOTICE '============================================';
END $$;