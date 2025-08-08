-- ============================================
-- POPULAR BANCO COM DADOS REALISTAS COMPLETOS
-- Script baseado na estrutura real das tabelas Supabase
-- Execute APÓS criar todas as tabelas
-- ============================================

-- ============================================
-- MÉTODO SEGURO: USAR UPSERTS PARA EVITAR CONFLITOS
-- ============================================

-- ============================================
-- 1. CONFIGURAÇÕES DA EMPRESA
-- ============================================
INSERT INTO settings (key, value, description, category) VALUES
  ('store_name', 'Moria Pecas & Servicos Automotivos', 'Nome da loja', 'store'),
  ('store_cnpj', '12.345.678/0001-90', 'CNPJ da empresa', 'store'),
  ('store_phone', '(11) 4567-8900', 'Telefone principal', 'store'),
  ('store_email', 'contato@moriapecas.com.br', 'E-mail principal', 'store'),
  ('store_address', 'Av. das Oficinas, 1500 - Vila Industrial - Sao Paulo, SP - CEP: 03460-000', 'Endereco completo', 'store'),
  ('store_hours', 'Segunda a Sexta: 8h às 18h | Sabado: 8h às 12h', 'Horario funcionamento', 'store'),
  
  -- Configuracoes de vendas
  ('default_margin', '25', 'Margem padrão de lucro (%)', 'sales'),
  ('free_shipping_min', '150.00', 'Valor minimo frete gratis', 'sales'),
  ('delivery_fee', '15.00', 'Taxa de entrega local', 'sales'),
  ('max_installments', '6', 'Parcelas maximas', 'sales'),
  
  -- Notificacoes
  ('notifications_new_orders', 'true', 'Notificar novos pedidos', 'notifications'),
  ('notifications_low_stock', 'true', 'Notificar estoque baixo', 'notifications'),
  ('notifications_weekly_reports', 'true', 'Relatorios semanais por e-mail', 'notifications')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = CURRENT_TIMESTAMP;

-- Dados da empresa salvos nas configurações acima

-- ============================================
-- 2. PRODUTOS (40 produtos realistas)
-- ============================================
INSERT INTO products (
  name, description, category, price, sale_price, promo_price,
  stock, is_active, rating, specifications, vehicle_compatibility
) VALUES
  -- FILTROS (8 produtos)
  ('Filtro de Oleo Mann W712/75', 'Filtro de oleo original Mann para motores 1.0 a 2.0', 'Filtros', 28.90, 24.90, null, 45, true, 4.8, 
   '{"tipo": "Oleo", "rosca": "M20x1.5", "altura": "95mm", "diametro": "76mm"}', 
   '["VW Gol", "VW Fox", "Chevrolet Onix", "Fiat Uno"]'),
   
  ('Filtro de Ar Wega FAP9334', 'Filtro de ar de alta performance', 'Filtros', 32.50, 28.90, 25.90, 38, true, 4.6,
   '{"tipo": "Ar", "material": "Papel", "formato": "Retangular"}',
   '["Honda Civic", "Honda Fit", "Toyota Corolla"]'),
   
  ('Filtro Combustivel Tecfil PSC945', 'Filtro combustivel com separador agua', 'Filtros', 45.90, 39.90, null, 22, true, 4.7,
   '{"tipo": "Combustivel", "rosca": "M16", "funcao": "Separador"}',
   '["Ford Ka", "Ford Fiesta", "Ford EcoSport"]'),
   
  ('Filtro Cabine Bosch 0986BF0566', 'Filtro ar condicionado com carvao ativado', 'Filtros', 52.80, 46.90, null, 31, true, 4.9,
   '{"tipo": "Cabine", "material": "Carvao ativado", "formato": "Retangular"}',
   '["Chevrolet Cruze", "Chevrolet Tracker", "Chevrolet Spin"]'),
   
  ('Filtro Oleo Mahle OX191D', 'Filtro oleo premium Mahle', 'Filtros', 35.90, 32.90, null, 28, true, 4.8,
   '{"tipo": "Oleo", "marca": "Mahle", "aplicacao": "Diesel"}',
   '["VW Amarok", "Ford Ranger", "Mitsubishi L200"]'),
   
  ('Filtro Ar Fram CA8715', 'Filtro de ar esportivo Fram', 'Filtros', 42.90, 38.90, 34.90, 19, true, 4.5,
   '{"tipo": "Ar", "linha": "Esportivo", "fluxo": "Alto"}',
   '["Renault Sandero", "Renault Logan", "Nissan March"]'),
   
  ('Filtro Combustivel Wega FCI1640', 'Filtro combustivel injecao eletronica', 'Filtros', 38.90, 34.90, null, 25, true, 4.6,
   '{"tipo": "Combustivel", "sistema": "Injecao", "pressao": "3 bar"}',
   '["Hyundai HB20", "Hyundai Creta", "Kia Picanto"]'),
   
  ('Kit Filtros Revisao Completa', 'Kit com 4 filtros para revisao', 'Filtros', 185.90, 159.90, 139.90, 12, true, 4.9,
   '{"tipo": "Kit", "itens": "4 filtros", "aplicacao": "Revisao"}',
   '["Varios modelos populares"]'),

  -- FREIOS (8 produtos)
  ('Pastilha Freio Diant Cobreq N1515', 'Pastilha freio dianteira ceramica', 'Freios', 89.90, 79.90, null, 35, true, 4.7,
   '{"posicao": "Dianteira", "material": "Ceramica", "kit": "4 pastilhas"}',
   '["VW Gol G5/G6", "VW Voyage", "VW Saveiro"]'),
   
  ('Disco Freio Varga RCDI02150', 'Par discos freio ventilado', 'Freios', 145.90, 129.90, 119.90, 18, true, 4.8,
   '{"tipo": "Ventilado", "diametro": "280mm", "espessura": "25mm"}',
   '["Honda Civic", "Honda CR-V", "Honda Fit"]'),
   
  ('Fluido Freio Bosch DOT4 500ml', 'Fluido freio sintetico DOT4', 'Freios', 28.90, 24.90, null, 42, true, 4.9,
   '{"tipo": "DOT4", "volume": "500ml", "temperatura": "260C"}',
   '["Universal - todos veiculos"]'),
   
  ('Cilindro Roda Tras Controil C3407', 'Cilindro roda traseira', 'Freios', 65.90, 58.90, null, 24, true, 4.6,
   '{"posicao": "Traseira", "diametro": "19mm", "material": "Ferro"}',
   '["Fiat Uno", "Fiat Palio", "Fiat Siena"]'),
   
  ('Cabo Freio Mao Controil C2890', 'Cabo freio estacionamento', 'Freios', 45.90, 39.90, null, 28, true, 4.5,
   '{"tipo": "Estacionamento", "lado": "Direito", "comprimento": "1.2m"}',
   '["Chevrolet Celta", "Chevrolet Corsa", "Chevrolet Prisma"]'),
   
  ('Reparo Cilindro Mestre TRW', 'Kit reparo cilindro mestre', 'Freios', 38.90, 34.90, null, 15, true, 4.7,
   '{"tipo": "Reparo", "componente": "Cilindro mestre", "itens": "Retentores"}',
   '["Ford Ka", "Ford Fiesta", "Ford Focus"]'),
   
  ('Lona Freio Fras-le LF1635', 'Jogo lonas freio traseira', 'Freios', 72.90, 65.90, null, 22, true, 4.8,
   '{"posicao": "Traseira", "largura": "40mm", "comprimento": "200mm"}',
   '["Toyota Corolla", "Toyota Etios", "Toyota Yaris"]'),
   
  ('Mangueira Freio Diant Pirelli', 'Mangueira flexivel freio', 'Freios', 32.90, 28.90, null, 31, true, 4.6,
   '{"posicao": "Dianteira", "comprimento": "45cm", "pressao": "1800psi"}',
   '["Hyundai HB20", "Hyundai i30", "Kia Cerato"]'),

  -- MOTOR (8 produtos)
  ('Vela Ignicao NGK BPR6ES', 'Vela ignicao eletrodo simples', 'Motor', 12.90, 10.90, 9.90, 85, true, 4.8,
   '{"tipo": "Simples", "gap": "0.8mm", "rosca": "14mm"}',
   '["VW 1.0 Total Flex", "GM 1.0 SOHC", "Fiat 1.0 Fire"]'),
   
  ('Correia Dentada Gates 5472XS', 'Correia dentada com tensor', 'Motor', 89.90, 79.90, null, 28, true, 4.9,
   '{"dentes": "111", "largura": "25mm", "kit": "Correia + tensor"}',
   '["VW Golf 1.6", "Audi A3 1.6", "Seat Leon 1.6"]'),
   
  ('Bomba Agua Nakata NKB10025', 'Bomba agua com turbina bronze', 'Motor', 125.90, 112.90, null, 18, true, 4.7,
   '{"material": "Bronze", "vazao": "120 L/min", "temperatura": "110C"}',
   '["Chevrolet Onix", "Chevrolet Prisma", "Chevrolet Agile"]'),
   
  ('Sensor Posicao Virabrequim Bosch', 'Sensor rotacao do motor', 'Motor', 85.90, 76.90, null, 22, true, 4.6,
   '{"tipo": "Hall", "conector": "3 pinos", "resistencia": "800 ohms"}',
   '["Ford Ka 1.0/1.6", "Ford Fiesta 1.6", "Ford EcoSport 1.6"]'),
   
  ('Junta Cabecote Taranto JC485', 'Junta cabecote motor 1.0', 'Motor', 145.90, 129.90, null, 12, true, 4.8,
   '{"motor": "1.0 8v", "material": "Grafite", "espessura": "1.5mm"}',
   '["Fiat Uno Mille", "Fiat Palio 1.0", "Fiat Siena 1.0"]'),
   
  ('Termostato Wahler 3091.87D', 'Termostato arrefecimento 87C', 'Motor', 45.90, 39.90, null, 31, true, 4.7,
   '{"temperatura": "87C", "diametro": "52mm", "tipo": "Cera"}',
   '["Honda Civic 1.8", "Honda Fit 1.5", "Honda City 1.5"]'),
   
  ('Kit Distribuicao Dayco KTB472', 'Kit completo distribuicao', 'Motor', 285.90, 259.90, 229.90, 8, true, 4.9,
   '{"itens": "Correia+tensor+bomba", "garantia": "80.000km"}',
   '["Toyota Corolla 1.8", "Toyota RAV4 2.0", "Toyota Camry 2.4"]'),
   
  ('Filtro Oleo Lubrificante W712/52', 'Filtro oleo Mann premium', 'Motor', 35.90, 31.90, null, 38, true, 4.8,
   '{"marca": "Mann", "rosca": "3/4-16UNF", "altura": "108mm"}',
   '["Renault Duster 1.6/2.0", "Renault Fluence 2.0", "Nissan Sentra 2.0"]'),

  -- ELETRICA (8 produtos)
  ('Bateria Moura M50JD', 'Bateria 50Ah livre manutencao', 'Eletrica', 185.90, 169.90, 159.90, 15, true, 4.8,
   '{"amperagem": "50Ah", "voltagem": "12V", "tipo": "Livre manutencao"}',
   '["VW Gol/Fox", "Chevrolet Onix/Prisma", "Fiat Uno/Palio"]'),
   
  ('Alternador Bosch 90A Reman', 'Alternador remanufaturado', 'Eletrica', 285.90, 259.90, null, 8, true, 4.7,
   '{"amperagem": "90A", "voltagem": "12V", "condicao": "Remanufaturado"}',
   '["VW Golf 1.6", "VW Jetta 2.0", "Audi A3 1.8T"]'),
   
  ('Motor Partida Denso 12V 1.2KW', 'Motor arranque remanufaturado', 'Eletrica', 195.90, 175.90, null, 12, true, 4.6,
   '{"potencia": "1.2KW", "voltagem": "12V", "dentes": "9"}',
   '["Honda Civic", "Honda Accord", "Honda CR-V"]'),
   
  ('Sensor Temperatura Agua MTE', 'Sensor temperatura arrefecimento', 'Eletrica', 28.90, 24.90, null, 45, true, 4.9,
   '{"tipo": "NTC", "conector": "2 pinos", "rosca": "M12x1.5"}',
   '["Ford Ka/Fiesta", "Ford Focus", "Ford EcoSport"]'),
   
  ('Bobina Ignicao Delphi GN10118', 'Bobina ignicao individual', 'Eletrica', 125.90, 112.90, null, 22, true, 4.8,
   '{"tipo": "Individual", "voltagem": "12V", "resistencia": "0.6 ohms"}',
   '["Chevrolet Corsa/Celta", "Chevrolet Montana", "Chevrolet Meriva"]'),
   
  ('Lampada H7 Philips X-treme', 'Lampada farol super branca', 'Eletrica', 45.90, 39.90, 34.90, 35, true, 4.7,
   '{"potencia": "55W", "voltagem": "12V", "temperatura": "4200K"}',
   '["Universal H7"]'),
   
  ('Fusivel Kit Sortido 120pcs', 'Kit fusveis sortidos 5A a 30A', 'Eletrica', 28.90, 24.90, null, 25, true, 4.6,
   '{"quantidade": "120 pcs", "amperagens": "5A a 30A", "tipo": "Mini"}',
   '["Universal - todos veiculos"]'),
   
  ('Rele Auxiliar Bosch 12V 30A', 'Rele 4 terminais uso geral', 'Eletrica', 18.90, 16.90, null, 58, true, 4.8,
   '{"voltagem": "12V", "amperagem": "30A", "terminais": "4 pinos"}',
   '["Universal - aplicacao geral"]'),

  -- SUSPENSAO (8 produtos)
  ('Amortecedor Diant Cofap GA27012', 'Amortecedor dianteiro gas', 'Suspensao', 89.90, 79.90, null, 24, true, 4.7,
   '{"tipo": "Gas", "posicao": "Dianteira", "curso": "145mm"}',
   '["VW Gol G2/G3/G4", "VW Parati", "VW Saveiro"]'),
   
  ('Mola Suspensao Tras Eibach', 'Mola helicoidal traseira', 'Suspensao', 125.90, 112.90, null, 16, true, 4.8,
   '{"posicao": "Traseira", "tipo": "Helicoidal", "carga": "Progressiva"}',
   '["Honda Civic Si", "Honda Accord", "Honda CR-V"]'),
   
  ('Bucha Bandeja Inf Sampel', 'Bucha bandeja suspensao', 'Suspensao', 35.90, 31.90, null, 42, true, 4.6,
   '{"posicao": "Inferior", "material": "Poliuretano", "dureza": "90 Shore A"}',
   '["Chevrolet Corsa", "Chevrolet Celta", "Chevrolet Prisma"]'),
   
  ('Pivo Suspensao TRW JBJ742', 'Pivo bandeja superior', 'Suspensao', 68.90, 59.90, null, 28, true, 4.9,
   '{"posicao": "Superior", "rosca": "M14x1.5", "cone": "1:10"}',
   '["Ford Ka", "Ford Fiesta", "Ford Courier"]'),
   
  ('Kit Batente Amortecedor Diant', 'Kit batente + coifa dianteiro', 'Suspensao', 42.90, 38.90, null, 31, true, 4.5,
   '{"posicao": "Dianteira", "itens": "Batente + coifa", "material": "Borracha"}',
   '["Fiat Uno", "Fiat Palio", "Fiat Strada"]'),
   
  ('Barra Estabilizadora Tras', 'Barra estabilizadora traseira', 'Suspensao', 155.90, 139.90, null, 12, true, 4.7,
   '{"posicao": "Traseira", "diametro": "18mm", "material": "Aco"}',
   '["Toyota Corolla", "Toyota Fielder", "Toyota Etios Sedan"]'),
   
  ('Rolamento Roda Diant SKF', 'Rolamento roda dianteira', 'Suspensao', 85.90, 76.90, null, 19, true, 4.8,
   '{"posicao": "Dianteira", "tipo": "Dupla carreira", "vedacao": "2RS"}',
   '["Hyundai HB20", "Hyundai i30", "Kia Rio"]'),
   
  ('Coxim Motor Direito Sampel', 'Coxim motor lado direito', 'Suspensao', 78.90, 69.90, null, 22, true, 4.6,
   '{"lado": "Direito", "material": "Borracha + metal", "dureza": "65 Shore A"}',
   '["Renault Logan", "Renault Sandero", "Nissan March"]');

-- ============================================
-- 3. SERVIÇOS (15 serviços)
-- ============================================
INSERT INTO services (
  name, description, category, base_price, estimated_time, specifications, is_active
) VALUES
  -- Manutencao Preventiva
  ('Troca de Oleo e Filtro', 'Servico completo troca oleo motor + filtro', 'Manutencao', 45.00, '30 minutos',
   '{"inclui": "Mao de obra + descarte", "garantia": "90 dias", "oleo": "Nao incluso"}', true),
   
  ('Revisao 10.000 km', 'Revisao preventiva completa 10 mil km', 'Manutencao', 150.00, '2 horas',
   '{"itens": "15 verificacoes", "garantia": "6 meses", "relatorio": "Incluso"}', true),
   
  ('Troca Filtro Ar Condicionado', 'Substituicao filtro cabine + higienizacao', 'Manutencao', 35.00, '20 minutos',
   '{"higienizacao": "Inclusa", "garantia": "60 dias", "filtro": "Nao incluso"}', true),
   
  ('Verificacao Sistema Arrefecimento', 'Teste radiador + mangueiras + bomba', 'Manutencao', 60.00, '45 minutos',
   '{"pressao": "Teste incluso", "vazamento": "Deteccao", "relatorio": "Detalhado"}', true),
   
  ('Troca Correia Dentada', 'Substituicao correia + tensor + bomba agua', 'Manutencao', 180.00, '3 horas',
   '{"alinhamento": "Incluso", "garantia": "12 meses", "pecas": "Nao inclusas"}', true),

  -- Freios
  ('Sangria Sistema Freios', 'Sangria completa + fluido novo', 'Freios', 80.00, '1 hora',
   '{"fluido": "DOT4 incluso", "teste": "Pedal + discos", "garantia": "90 dias"}', true),
   
  ('Substituicao Pastilhas Freio', 'Troca pastilhas dianteiras ou traseiras', 'Freios', 120.00, '1.5 horas',
   '{"regulagem": "Inclusa", "teste": "Obrigatorio", "pastilhas": "Nao inclusas"}', true),
   
  ('Retifica Discos Freio', 'Retifica par discos freio', 'Freios', 90.00, '2 horas',
   '{"medicao": "Inclusa", "garantia": "6 meses", "balanceamento": "Incluso"}', true),

  -- Suspensao e Direcao  
  ('Alinhamento + Balanceamento', 'Alinhamento 3D + balanceamento 4 rodas', 'Suspensao', 65.00, '1 hora',
   '{"equipamento": "3D laser", "relatorio": "Impresso", "garantia": "30 dias"}', true),
   
  ('Troca Amortecedores', 'Substituicao par amortecedores', 'Suspensao', 150.00, '2 horas',
   '{"alinhamento": "Incluso", "teste": "Obrigatorio", "amortecedores": "Nao inclusos"}', true),
   
  ('Geometria Completa', 'Alinhamento + caster + camber + convergencia', 'Suspensao', 85.00, '1.5 horas',
   '{"ajustes": "Todos inclusos", "relatorio": "Detalhado", "garantia": "60 dias"}', true),

  -- Ar Condicionado
  ('Carga Gas R134a', 'Carga completa gas refrigerante', 'Ar Condicionado', 120.00, '45 minutos',
   '{"gas": "R134a incluso", "teste": "Vazamentos", "garantia": "90 dias"}', true),
   
  ('Higienizacao Ar Condicionado', 'Limpeza evaporador + dutos + filtro', 'Ar Condicionado', 80.00, '1 hora',
   '{"produtos": "Inclusos", "filtro": "Novo incluso", "garantia": "60 dias"}', true),

  -- Eletrica
  ('Teste Bateria + Alternador', 'Diagnostico sistema carga completo', 'Eletrica', 45.00, '30 minutos',
   '{"relatorio": "Impresso", "teste_carga": "Incluso", "garantia": "30 dias"}', true),
   
  ('Scanner Diagnostico OBD2', 'Leitura codes erro + reset modules', 'Eletrica', 60.00, '45 minutos',
   '{"relatorio": "Detalhado", "reset": "Incluso", "orientacao": "Inclusa"}', true);

-- ============================================
-- 4. CUPONS DE DESCONTO (10 cupons)
-- ============================================
INSERT INTO coupons (
  code, description, discount_type, discount_value, 
  min_order_value, max_uses, current_uses, is_active,
  valid_from, valid_until, applicable_to
) VALUES
  ('BEMVINDO10', 'Desconto 10% primeira compra', 'percentage', 10.00, 50.00, 100, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'products'),
   
  ('FRETE25', 'Frete gratis pedidos acima R$ 200', 'shipping', 25.00, 200.00, null, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 'all'),
   
  ('REVISAO15', 'Desconto R$ 15 em servicos manutencao', 'fixed', 15.00, 80.00, 50, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', 'services'),
   
  ('FILTROS20', 'Desconto 20% linha filtros', 'percentage', 20.00, 100.00, null, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 'products'),
   
  ('FREIOS30', 'Desconto R$ 30 servicos freios', 'fixed', 30.00, 150.00, 30, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '20 days', 'services'),
   
  ('COMBO50', 'Desconto R$ 50 pedidos acima R$ 400', 'fixed', 50.00, 400.00, 25, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'all'),
   
  ('ELETRICA15', 'Desconto 15% categoria eletrica', 'percentage', 15.00, 80.00, null, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '25 days', 'products'),
   
  ('SUSPENSAO25', 'Desconto R$ 25 servicos suspensao', 'fixed', 25.00, 120.00, 40, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '35 days', 'services'),
   
  ('MOTOR12', 'Desconto 12% categoria motor', 'percentage', 12.00, 60.00, null, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '40 days', 'products'),
   
  ('CLIENTE100', 'Desconto R$ 100 pedidos acima R$ 800', 'fixed', 100.00, 800.00, 10, 0, true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '50 days', 'all');

-- ============================================
-- 5. PROMOÇÕES (5 promoções)
-- ============================================
INSERT INTO promotions (
  name, description, discount_type, discount_value,
  conditions, is_active, valid_from, valid_until
) VALUES
  ('Kit Revisao Completa', 'Desconto 25% comprando kit revisao (4 filtros)', 'percentage', 25.00,
   '{"min_items": 4, "categories": ["Filtros"], "products": ["Kit Filtros"]}', true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
   
  ('Combo Freios', 'Desconto R$ 80 comprando pastilhas + discos + fluido', 'fixed', 80.00,
   '{"min_items": 3, "categories": ["Freios"], "min_value": 300.00}', true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days'),
   
  ('Pacote Suspensao', 'Desconto 20% amortecedores + molas + buchas', 'percentage', 20.00,
   '{"min_items": 3, "categories": ["Suspensao"], "min_value": 250.00}', true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '25 days'),
   
  ('Eletrica Inverno', 'Desconto R$ 50 bateria + alternador + motor partida', 'fixed', 50.00,
   '{"min_items": 2, "categories": ["Eletrica"], "min_value": 400.00}', true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days'),
   
  ('Motor Performance', 'Desconto 18% velas + correia + filtros + oleo', 'percentage', 18.00,
   '{"min_items": 4, "categories": ["Motor", "Filtros"], "min_value": 200.00}', true,
   CURRENT_DATE, CURRENT_DATE + INTERVAL '35 days');

-- ============================================
-- 6. DADOS DE TESTE
-- Usuários serão criados via auth.users do Supabase
-- ============================================

-- ============================================
-- ESTATÍSTICAS E VERIFICAÇÃO FINAL
-- ============================================
DO $$
BEGIN
    -- Exibir estatísticas inseridas
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DADOS INSERIDOS COM SUCESSO!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Configurações: % registros', (SELECT COUNT(*) FROM settings);
    RAISE NOTICE 'Produtos: % registros', (SELECT COUNT(*) FROM products WHERE is_active = true);
    RAISE NOTICE 'Serviços: % registros', (SELECT COUNT(*) FROM services WHERE is_active = true);
    RAISE NOTICE 'Cupons: % registros', (SELECT COUNT(*) FROM coupons WHERE is_active = true);
    RAISE NOTICE 'Promoções: % registros', (SELECT COUNT(*) FROM promotions WHERE is_active = true);
    RAISE NOTICE 'Usuários teste: % registros', (SELECT COUNT(*) FROM provisional_users);
    RAISE NOTICE '============================================';
    RAISE NOTICE 'BANCO POPULADO E PRONTO PARA TESTES!';
    RAISE NOTICE '============================================';
END $$;