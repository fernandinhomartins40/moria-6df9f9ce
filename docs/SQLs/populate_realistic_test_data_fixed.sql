-- ============================================
-- POPULAR BANCO COM DADOS REALISTAS PARA TESTES COMPLETOS
-- Script completo para testar todas as funcionalidades da aplicacao Moria
-- Execute apos criar as tabelas com supabase_schema.sql
-- ============================================

-- ============================================
-- LIMPAR DADOS EXISTENTES PARA POPULAR COM DADOS DE TESTE
-- ============================================
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM quote_items;
DELETE FROM quotes;
DELETE FROM coupons;
DELETE FROM promotions;
DELETE FROM services;
DELETE FROM products;
DELETE FROM provisional_users;
DELETE FROM settings;
DELETE FROM company_info;

-- ============================================
-- 1. CONFIGURACOES DA EMPRESA
-- ============================================

INSERT INTO settings (key, value, description, category) VALUES
  -- Informacoes da loja
  ('store_name', 'Moria Pecas e Servicos Automotivos', 'Nome da loja', 'store'),
  ('store_cnpj', '12.345.678/0001-90', 'CNPJ da empresa', 'store'),
  ('store_phone', '(11) 4567-8900', 'Telefone principal', 'store'),
  ('store_email', 'contato@moriapecas.com.br', 'E-mail de contato', 'store'),
  ('store_address', 'Av. das Oficinas, 1500 - Vila Industrial - Sao Paulo, SP - CEP: 03460-000', 'Endereco completo', 'store'),
  
  -- Configuracoes de vendas
  ('default_profit_margin', '40', 'Margem de lucro padrao (%)', 'sales'),
  ('free_shipping_minimum', '200', 'Valor minimo para frete gratis', 'sales'),
  ('delivery_fee', '18.90', 'Taxa de entrega (R$)', 'sales'),
  ('delivery_time', '2', 'Tempo de entrega (dias)', 'sales'),
  
  -- Notificacoes
  ('notifications_new_orders', 'true', 'Notificar novos pedidos', 'notifications'),
  ('notifications_low_stock', 'true', 'Notificar estoque baixo', 'notifications'),
  ('notifications_weekly_reports', 'true', 'Relatorios semanais por e-mail', 'notifications')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO company_info (
  name, cnpj, phone, email, address,
  business_hours, social_media, services_list, guarantees
) VALUES (
  'Moria Pecas e Servicos Automotivos',
  '12.345.678/0001-90',
  '(11) 4567-8900',
  'contato@moriapecas.com.br',
  'Av. das Oficinas, 1500 - Vila Industrial - Sao Paulo/SP - CEP: 03460-000',
  '{
    "weekdays": {"open": "07:30", "close": "18:00"},
    "saturday": {"open": "07:30", "close": "13:00"},
    "sunday": "closed"
  }',
  '{
    "facebook": "https://facebook.com/moriapecas",
    "instagram": "@moriapecas",
    "whatsapp": "5511456789000"
  }',
  ARRAY[
    'Manutencao Preventiva e Corretiva',
    'Troca de Oleo e Filtros', 
    'Diagnostico Eletronico Computadorizado',
    'Sistema de Freios e ABS',
    'Suspensao e Amortecedores',
    'Ar Condicionado Automotivo',
    'Sistema Eletrico e Bateria',
    'Alinhamento e Balanceamento',
    'Embreagem e Cambio',
    'Injecao Eletronica'
  ],
  '{
    "service_warranty": "6 meses ou 10.000km",
    "parts_warranty": "90 dias",
    "fast_service": "Servicos expressos em ate 1 hora",
    "delivery_time": "Entrega em ate 24 horas na regiao"
  }'
);

-- ============================================
-- 2. PRODUTOS REALISTAS (25+ produtos essenciais)
-- ============================================

INSERT INTO products (
  name, description, category, price, sale_price, promo_price, 
  stock, min_stock, is_active, rating, brand, supplier, sku,
  specifications, vehicle_compatibility
) VALUES

-- FILTROS (8 produtos)
('Filtro de Oleo Mann W75/3', 'Filtro de oleo de alta qualidade para motores 1.0, 1.4 e 1.6', 'Filtros', 28.90, 25.90, 23.90, 45, 10, true, 4.8, 'Mann Filter', 'AutoParts SP', 'FO-W753', 
 '{"material": "Papel filtrante especial", "rosca": "3/4-16 UNF", "altura": "76mm", "garantia": "10.000km"}',
 '["VW Fox", "VW Gol G5/G6", "VW Voyage", "Fiat Uno Mille", "Fiat Palio 1.0/1.4"]'),

('Filtro de Ar Tecfil ARL2142', 'Filtro de ar de papel com alta capacidade de retencao', 'Filtros', 32.90, 29.90, null, 38, 8, true, 4.7, 'Tecfil', 'Distribuidora Central', 'FA-ARL2142',
 '{"tipo": "Seco", "material": "Papel plissado", "dimensoes": "245x190x45mm", "garantia": "15.000km"}',
 '["Honda Civic 2012-2016", "Honda Fit 2009-2014", "Honda City 2009-2014"]'),

('Filtro de Combustivel Bosch GB0139', 'Filtro de combustivel com alta eficiencia', 'Filtros', 45.90, 42.90, 38.90, 25, 5, true, 4.9, 'Bosch', 'Bosch Distribuidor', 'FC-GB0139',
 '{"pressao_maxima": "6 bar", "capacidade": "Gasolina/Etanol", "rosca": "1/4 NPT", "garantia": "30.000km"}',
 '["VW Golf 1.6", "VW Jetta 1.6", "Audi A3 1.6", "Seat Cordoba 1.6"]'),

('Filtro Cabine Tecfil ACP117', 'Filtro do ar condicionado com carvao ativado', 'Filtros', 35.90, 32.90, null, 22, 5, true, 4.6, 'Tecfil', 'Distribuidora Central', 'CAB-ACP117',
 '{"tipo": "Carvao ativado", "dimensoes": "215x195x30mm", "funcao": "Anti-bacteriano", "garantia": "12 meses"}',
 '["Toyota Corolla 2009-2014", "Toyota Etios 2012+", "Toyota Yaris 2018+"]'),

('Filtro Oleo Mahle OX416D', 'Filtro de oleo premium para motores diesel', 'Filtros', 52.90, 48.90, null, 18, 3, true, 4.8, 'Mahle', 'Mahle Original', 'FO-OX416D',
 '{"aplicacao": "Diesel", "material": "Celular sintetico", "vazao": "Alto fluxo", "garantia": "15.000km"}',
 '["Ford Ranger 2.2/3.2 Diesel", "VW Amarok 2.0 TDI", "Mitsubishi L200 2.4 Diesel"]'),

('Filtro Ar Esportivo KN 33-2025', 'Filtro de ar esportivo lavavel de alto fluxo', 'Filtros', 189.90, 169.90, 149.90, 12, 2, true, 4.9, 'K&N', 'K&N Performance', 'FAE-33-2025',
 '{"tipo": "Algodao oleado", "aumento_potencia": "5-10%", "lavavel": "Sim", "garantia": "1.600.000km"}',
 '["Honda Civic Si", "Civic Type R", "Accord 2.0T", "CR-V 1.5T"]'),

('Filtro Combustivel Wega FCI1564', 'Filtro de combustivel flex para injecao eletronica', 'Filtros', 38.90, 35.90, null, 28, 6, true, 4.5, 'Wega', 'Wega Motors', 'FC-FCI1564',
 '{"combustivel": "Flex", "pressao": "3.5 bar", "vazao": "120 L/h", "garantia": "20.000km"}',
 '["Chevrolet Onix", "Chevrolet Prisma", "Chevrolet Cobalt", "Chevrolet Spin"]'),

('Filtro Ar Fram CA10467', 'Filtro de ar com tecnologia de microfibras', 'Filtros', 29.90, 26.90, null, 35, 8, true, 4.4, 'Fram', 'Fram Filtros', 'FA-CA10467',
 '{"eficiencia": "99.5%", "material": "Microfibra", "formato": "Retangular", "garantia": "15.000km"}',
 '["Hyundai HB20", "Hyundai HB20S", "Hyundai Creta 1.6", "Kia Rio 1.6"]'),

-- FREIOS (8 produtos)
('Pastilha Freio Diant. Cobreq N1049', 'Pastilha de freio dianteira com ceramica para maior durabilidade', 'Freios', 149.90, 139.90, 129.90, 18, 3, true, 4.6, 'Cobreq', 'Cobreq Freios', 'PF-N1049',
 '{"posicao": "Dianteira", "material": "Ceramica", "temperatura": "600°C", "garantia": "30.000km"}',
 '["Honda Civic 2012-2016", "Honda Fit 2009-2014", "Honda City 2014+"]'),

('Pastilha Freio Tras. TRW GDB1330', 'Pastilha traseira com baixo ruido e poeira', 'Freios', 89.90, 82.90, null, 22, 4, true, 4.5, 'TRW', 'TRW Brasil', 'PF-GDB1330',
 '{"posicao": "Traseira", "material": "Semi-metalica", "baixo_ruido": "Sim", "garantia": "25.000km"}',
 '["VW Golf 1.6/2.0", "VW Jetta 1.4/2.0", "Audi A3 1.4/1.8"]'),

('Disco Freio Diant. Fremax BD4405', 'Disco de freio dianteiro ventilado', 'Freios', 189.90, 179.90, 169.90, 12, 2, true, 4.7, 'Fremax', 'Fremax Discos', 'DF-BD4405',
 '{"tipo": "Ventilado", "diametro": "280mm", "espessura": "22mm", "garantia": "50.000km"}',
 '["Toyota Corolla 2015+", "Toyota Yaris 2018+", "Toyota Etios Cross"]'),

('Disco Freio Tras. Hipper HF455', 'Disco traseiro solido com tratamento anticorrosao', 'Freios', 118.90, 109.90, null, 16, 3, true, 4.4, 'Hipper', 'Hipper Freios', 'DF-HF455',
 '{"tipo": "Solido", "diametro": "230mm", "tratamento": "Anti-corrosao", "garantia": "40.000km"}',
 '["Chevrolet Onix", "Chevrolet Prisma", "Chevrolet Cobalt"]'),

('Fluido Freio DOT4 Bosch 500ml', 'Fluido de freio DOT4 sintetico de alta performance', 'Freios', 24.90, 22.90, null, 48, 10, true, 4.8, 'Bosch', 'Bosch Brasil', 'FF-DOT4-500',
 '{"tipo": "DOT4", "ponto_ebulicao": "230°C", "volume": "500ml", "sintetico": "Sim"}',
 '["Universal", "Todos os sistemas de freio DOT4"]'),

('Cabo Freio Tras. Cofap BC4521', 'Cabo de freio traseiro para freio de estacionamento', 'Freios', 85.90, 79.90, null, 14, 3, true, 4.3, 'Cofap', 'Cofap Cabos', 'CF-BC4521',
 '{"posicao": "Traseiro", "lado": "Direito", "comprimento": "1.850mm", "garantia": "2 anos"}',
 '["Ford Ka 2008-2014", "Ford Fiesta 2011-2017"]'),

('Kit Reparo Freio Varga KRVF308', 'Kit completo para reparo do sistema de freio', 'Freios', 156.90, 145.90, null, 8, 2, true, 4.6, 'Varga', 'Varga Freios', 'KF-KRVF308',
 '{"conteudo": "Pastilhas + Discos + Fluido", "posicao": "Dianteiro", "completo": "Sim", "garantia": "1 ano"}',
 '["Nissan March 2011+", "Nissan Versa 2011+"]'),

('Bomba Freio Principal Bosch F026008', 'Bomba de freio principal com reservatorio', 'Freios', 389.90, 369.90, 349.90, 5, 1, true, 4.8, 'Bosch', 'Bosch Original', 'BF-F026008',
 '{"diametro": "23.8mm", "reservatorio": "Incluso", "abs": "Compativel", "garantia": "2 anos"}',
 '["Fiat Palio 1.0/1.4", "Fiat Siena 1.0/1.4", "Fiat Strada 1.4"]'),

-- SUSPENSAO (6 produtos)
('Amortecedor Diant. Monroe G7349', 'Amortecedor dianteiro a gas monotubo', 'Suspensao', 245.90, 229.90, 209.90, 14, 3, true, 4.8, 'Monroe', 'Monroe Suspensao', 'AD-G7349',
 '{"tipo": "Gas monotubo", "posicao": "Dianteiro", "curso": "180mm", "garantia": "80.000km"}',
 '["VW Golf 1.6/2.0", "VW Jetta 1.4TSI/2.0", "Audi A3 1.4/1.8"]'),

('Amortecedor Tras. Cofap B47789', 'Amortecedor traseiro hidraulico telescopico', 'Suspensao', 189.90, 179.90, 169.90, 16, 3, true, 4.6, 'Cofap', 'Cofap Amortecedores', 'AT-B47789',
 '{"tipo": "Hidraulico", "posicao": "Traseiro", "ajustavel": "Nao", "garantia": "60.000km"}',
 '["Honda Civic 2007-2011", "Honda New Civic 2012-2016"]'),

('Kit Batente Amortecedor Monroe PK080', 'Kit completo batente + coifa para amortecedor', 'Suspensao', 68.90, 62.90, null, 22, 4, true, 4.4, 'Monroe', 'Monroe Kits', 'KB-PK080',
 '{"conteudo": "Batente + Coifa + Graxa", "posicao": "Universal", "completo": "Sim", "garantia": "2 anos"}',
 '["Aplicacao universal", "Diversos modelos"]'),

('Pivo Suspensao TRW JBJ719', 'Pivo de suspensao inferior com esfera', 'Suspensao', 156.90, 145.90, null, 12, 2, true, 4.7, 'TRW', 'TRW Brasil', 'PS-JBJ719',
 '{"posicao": "Inferior", "lado": "Direito", "com_esfera": "Sim", "garantia": "80.000km"}',
 '["VW Gol G5/G6/G7", "VW Voyage", "VW Fox"]'),

('Terminal Direcao Axial TRW JAR940', 'Terminal de direcao axial com rotula', 'Suspensao', 89.90, 82.90, null, 18, 3, true, 4.3, 'TRW', 'TRW Direcao', 'TD-JAR940',
 '{"tipo": "Axial", "rosca": "M14x1.5", "rotula": "Inclusa", "garantia": "60.000km"}',
 '["Chevrolet Onix", "Chevrolet Prisma", "Chevrolet Cobalt"]'),

('Coxim Motor Diant. Sampel 4521', 'Coxim do motor dianteiro hidraulico', 'Suspensao', 125.90, 115.90, null, 15, 3, true, 4.6, 'Sampel', 'Sampel Coxins', 'CM-4521',
 '{"tipo": "Hidraulico", "posicao": "Dianteiro", "metal_borracha": "Sim", "garantia": "2 anos"}',
 '["Ford Focus 1.6/2.0", "Ford Fiesta 1.6", "Ford EcoSport 1.6/2.0"]'),

-- MOTOR (8 produtos)
('Vela Ignicao NGK BKR6E', 'Vela de ignicao com eletrodo de iridio', 'Motor', 38.90, 34.90, null, 65, 15, true, 4.8, 'NGK', 'NGK Brasil', 'VI-BKR6E',
 '{"eletrodo": "Iridio", "abertura": "0.8mm", "grau_termico": "6", "garantia": "50.000km"}',
 '["Honda Civic 1.8", "Honda Fit 1.5", "Honda City 1.5", "Honda HR-V 1.8"]'),

('Correia Dentada Gates K025578', 'Kit correia dentada com tensor e roldanas', 'Motor', 189.90, 175.90, 159.90, 12, 3, true, 4.9, 'Gates', 'Gates PowerGrip', 'CD-K025578',
 '{"dentes": "136", "largura": "25mm", "kit_completo": "Sim", "garantia": "100.000km"}',
 '["VW Golf 1.6", "VW Bora 1.6", "Audi A3 1.6", "Seat Leon 1.6"]'),

('Bomba Agua Bosch CP1390', 'Bomba de agua com turbina em bronze', 'Motor', 156.90, 145.90, null, 18, 4, true, 4.7, 'Bosch', 'Bosch Cooling', 'BA-CP1390',
 '{"material": "Bronze", "vazao": "150 L/min", "temperatura": "110°C", "garantia": "2 anos"}',
 '["Chevrolet Onix 1.0/1.4", "Chevrolet Prisma 1.0/1.4", "Chevrolet Agile 1.4"]'),

('Termostato Wahler 4256.87D', 'Termostato com valvula de abertura 87°C', 'Motor', 45.90, 42.90, null, 35, 8, true, 4.5, 'Wahler', 'Wahler Termostatos', 'TE-4256.87D',
 '{"temperatura": "87°C", "diametro": "56mm", "com_junta": "Sim", "garantia": "2 anos"}',
 '["VW Fox 1.0/1.6", "VW Gol 1.0/1.6", "VW Polo 1.6"]'),

('Junta Cabecote MLS Elring 356.240', 'Junta do cabecote multicamadas de aco', 'Motor', 245.90, 229.90, 209.90, 8, 2, true, 4.8, 'Elring', 'Elring Juntas', 'JC-356240',
 '{"tipo": "MLS", "camadas": "3", "material": "Aco", "garantia": "100.000km"}',
 '["BMW 318i N46", "BMW 320i N46", "BMW X1 2.0 N46"]'),

('Kit Embreagem Sachs 6239089', 'Kit completo de embreagem com platao e disco', 'Motor', 389.90, 359.90, 329.90, 6, 1, true, 4.8, 'Sachs', 'ZF Sachs', 'KE-6239089',
 '{"diametro": "215mm", "plato": "Incluso", "rolamento": "Incluso", "garantia": "60.000km"}',
 '["VW Gol G3/G4 1.0", "VW Fox 1.0", "VW Polo 1.6"]'),

('Radiador Denso 422004N', 'Radiador de agua com tanques plasticos', 'Motor', 289.90, 269.90, null, 9, 2, true, 4.6, 'Denso', 'Denso Cooling', 'RA-422004N',
 '{"material": "Aluminio/Plastico", "fileiras": "2", "capacidade": "5.2L", "garantia": "2 anos"}',
 '["Honda Civic 2001-2005", "Honda Fit 2003-2008"]'),

('Sensor Rotacao Hall Bosch 0261210', 'Sensor de rotacao e fase do motor', 'Motor', 125.90, 115.90, null, 11, 2, true, 4.7, 'Bosch', 'Bosch Hall', 'SR-0261210',
 '{"tipo": "Hall", "funcao": "Rotacao/Fase", "conector": "3 vias", "garantia": "2 anos"}',
 '["VW Golf 1.6/2.0", "VW Jetta 1.4/2.0", "Audi A3 1.4/1.8"]'),

-- LUBRIFICANTES (4 produtos)
('Oleo Motor Castrol GTX 20W50 1L', 'Oleo mineral para motores convencionais', 'Lubrificantes', 28.90, 25.90, 23.90, 85, 20, true, 4.6, 'Castrol', 'Castrol Brasil', 'OM-GTX20W50',
 '{"viscosidade": "20W50", "tipo": "Mineral", "volume": "1L", "api": "SL/CF"}',
 '["Motores convencionais", "Veiculos mais antigos"]'),

('Oleo Sintetico Mobil1 5W30 1L', 'Oleo 100% sintetico para maxima protecao', 'Lubrificantes', 52.90, 48.90, 45.90, 68, 15, true, 4.9, 'Mobil', 'ExxonMobil', 'OS-M15W30',
 '{"viscosidade": "5W30", "tipo": "Sintetico", "volume": "1L", "api": "SN Plus"}',
 '["Motores modernos", "Turbo", "Alta performance"]'),

('Oleo Cambio Valvoline ATF+4 1L', 'Fluido para transmissao automatica', 'Lubrificantes', 35.90, 32.90, null, 45, 10, true, 4.5, 'Valvoline', 'Valvoline Max', 'OC-ATF4',
 '{"aplicacao": "Cambio automatico", "especificacao": "ATF+4", "volume": "1L", "cor": "Vermelho"}',
 '["Cambios automaticos", "CVT compativel"]'),

('Graxa Multiuso Shell Gadus S2 400g', 'Graxa multiuso de litio', 'Lubrificantes', 18.90, 16.90, null, 55, 12, true, 4.4, 'Shell', 'Shell Lubes', 'GM-GS2400',
 '{"base": "Litio", "temperatura": "-30 a 130°C", "peso": "400g", "consistencia": "NLGI 2"}',
 '["Rolamentos", "Juntas universais", "Chassis"]'),

-- ELETRICA (6 produtos)
('Bateria Moura 60Ah M60GD', 'Bateria selada com tecnologia AGM', 'Eletrica', 289.90, 269.90, 249.90, 22, 5, true, 4.8, 'Moura', 'Moura Baterias', 'BA-M60GD',
 '{"capacidade": "60Ah", "voltagem": "12V", "cca": "500A", "garantia": "18 meses"}',
 '["Carros medios", "1.0 a 1.6", "Ar condicionado"]'),

('Alternador Bosch F000BL0485', 'Alternador remanufaturado com garantia', 'Eletrica', 456.90, 425.90, 399.90, 8, 2, true, 4.6, 'Bosch', 'Bosch Reman', 'AL-F000BL0485',
 '{"amperagem": "90A", "voltagem": "14V", "polia": "6 canais", "garantia": "1 ano"}',
 '["VW Golf 1.6", "VW Bora 1.6", "Audi A3 1.6"]'),

('Motor Partida Valeo 455910', 'Motor de partida com drive deslizante', 'Eletrica', 389.90, 359.90, 329.90, 6, 1, true, 4.7, 'Valeo', 'Valeo Starter', 'MP-455910',
 '{"potencia": "1.4kW", "voltagem": "12V", "dentes": "9", "garantia": "1 ano"}',
 '["Ford Ka 1.0/1.5", "Ford Fiesta 1.0/1.6"]'),

('Sensor Oxigenio Bosch 0258006', 'Sonda lambda universal aquecida', 'Eletrica', 189.90, 175.90, null, 12, 3, true, 4.8, 'Bosch', 'Bosch Lambda', 'SO-0258006',
 '{"tipo": "Universal", "fios": "4", "aquecida": "Sim", "garantia": "2 anos"}',
 '["Aplicacao universal", "Sistemas de injecao"]'),

('Rele 4 Pinos Bosch 40A', 'Rele auxiliar para diversos sistemas', 'Eletrica', 25.90, 22.90, null, 68, 15, true, 4.4, 'Bosch', 'Bosch Relays', 'RE-40A4P',
 '{"corrente": "40A", "voltagem": "12V", "pinos": "4", "contatos": "NA/NF"}',
 '["Farois", "Buzina", "Ar condicionado", "Ventilador"]'),

('Luz LED H4 8000lm Philips', 'Lampada LED para farol principal', 'Eletrica', 125.90, 115.90, 109.90, 18, 4, true, 4.9, 'Philips', 'Philips LED', 'LED-H4-8K',
 '{"potencia": "40W", "luminosidade": "8000lm", "temperatura": "6500K", "garantia": "3 anos"}',
 '["Farol principal", "Substituicao H4"]');

-- ============================================
-- 3. SERVICOS REALISTAS (15 servicos)
-- ============================================

INSERT INTO services (
  name, description, category, base_price, estimated_time, specifications, is_active
) VALUES
-- MANUTENCAO PREVENTIVA (5 servicos)
('Troca de Oleo Completa', 'Troca completa do oleo do motor + filtro + verificacao de 12 pontos', 'Manutencao Preventiva', 95.00, '45 minutos',
 '{"inclui": ["Oleo mineral ou sintetico", "Filtro de oleo", "Verificacao de fluidos", "Check-up visual"], "km_garantia": "10000", "meses_garantia": "6"}', true),

('Revisao 10.000km', 'Revisao preventiva completa conforme manual do fabricante', 'Manutencao Preventiva', 280.00, '3 horas',
 '{"itens": ["Troca de oleo e filtro", "Filtro de ar", "Verificacao freios", "Suspensao", "Sistema eletrico", "Bateria", "Correias", "Mangueiras"], "garantia": "90 dias"}', true),

('Revisao 20.000km', 'Revisao intermediaria com itens adicionais', 'Manutencao Preventiva', 420.00, '4 horas',
 '{"itens": ["Itens da revisao 10k", "Filtro de combustivel", "Velas de ignicao", "Fluido de freio", "Alinhamento", "Balanceamento"], "garantia": "90 dias"}', true),

('Troca Filtro de Ar', 'Substituicao do filtro de ar do motor', 'Manutencao Preventiva', 45.00, '15 minutos',
 '{"inclui": ["Filtro de ar novo", "Limpeza caixa filtro"], "km_garantia": "15000", "observacoes": "Melhora performance e economia"}', true),

('Limpeza Corpo Borboleta', 'Limpeza do corpo de borboleta e sistema de admissao', 'Manutencao Preventiva', 120.00, '1 hora',
 '{"processo": ["Desmontagem", "Limpeza quimica", "Remontagem", "Teste funcionamento"], "beneficios": ["Melhor resposta", "Economia combustivel"]}', true),

-- FREIOS (3 servicos)
('Manutencao Completa Freios', 'Troca pastilhas dianteiras + fluido + regulagem', 'Freios', 220.00, '2 horas',
 '{"inclui": ["Pastilhas dianteiras", "Fluido DOT4", "Regulagem", "Limpeza sistema"], "km_garantia": "30000", "seguranca": "Alta prioridade"}', true),

('Sangria Sistema Freios', 'Renovacao completa do fluido de freio', 'Freios', 85.00, '45 minutos',
 '{"fluido": "DOT4 original", "processo": ["Sangria tradicional", "Teste pedal", "Verificacao vazamentos"], "periodicidade": "24 meses"}', true),

('Reparo Cilindro Mestre', 'Reparo ou substituicao do cilindro mestre', 'Freios', 320.00, '4 horas',
 '{"tipos": ["Reparo kit", "Substituicao completa"], "inclui": ["Teste bancada", "Sangria sistema"], "garantia": "1 ano"}', true),

-- SUSPENSAO E DIRECAO (3 servicos)
('Alinhamento Direcao 3D', 'Alinhamento computadorizado com equipamento 3D', 'Geometria', 75.00, '45 minutos',
 '{"equipamento": "Hunter 3D", "inclui": ["Relatorio detalhado", "Ajustes necessarios"], "precisao": "0.01°", "garantia": "30 dias"}', true),

('Balanceamento 4 Rodas', 'Balanceamento das 4 rodas para eliminar vibracoes', 'Geometria', 50.00, '30 minutos',
 '{"equipamento": "Balanceadora automatica", "inclui": ["Contrapesos", "Verificacao pneus"], "beneficios": ["Conforto", "Economia pneus"]}', true),

('Troca Amortecedores Par', 'Substituicao do par de amortecedores', 'Suspensao', 380.00, '3 horas',
 '{"inclui": ["2 amortecedores", "Kits batentes", "Alinhamento", "Teste"], "marcas": ["Monroe", "Cofap", "Gabriel"], "garantia": "1 ano"}', true),

-- AR CONDICIONADO (2 servicos)
('Higienizacao Ar Condicionado', 'Limpeza completa do sistema com produtos bactericidas', 'Ar Condicionado', 120.00, '90 minutos',
 '{"produtos": ["Bactericida", "Antifungico"], "inclui": ["Filtro cabine novo", "Teste funcionamento"], "periodicidade": "6 meses"}', true),

('Carga Gas R134a/R1234yf', 'Recarga do gas refrigerante do sistema', 'Ar Condicionado', 180.00, '1 hora',
 '{"gases": ["R134a", "R1234yf"], "inclui": ["Teste vazamentos", "Vacuo sistema", "Oleo compressor"], "garantia": "6 meses"}', true),

-- ELETRICA E ELETRONICA (2 servicos)
('Diagnostico Eletronico Scanner', 'Diagnostico completo com scanner automotivo', 'Diagnostico', 85.00, '1 hora',
 '{"equipamento": "Scanner OBD2 profissional", "sistemas": ["Motor", "ABS", "Airbag", "A/C"], "relatorio": "Detalhado com codigos"}', true),

('Teste Sistema Eletrico', 'Verificacao completa do sistema eletrico', 'Eletrica', 120.00, '2 horas',
 '{"testes": ["Bateria", "Alternador", "Motor partida", "Chicotes"], "equipamentos": ["Multimetro", "Teste carga"], "garantia": "30 dias"}', true);

-- ============================================
-- 4. CUPONS REALISTAS (10 cupons)
-- ============================================

INSERT INTO coupons (
  code, description, discount_type, discount_value, 
  min_amount, max_uses, used_count, expires_at, is_active
) VALUES
-- CUPONS ATIVOS
('PRIMEIRA20', '20% de desconto na primeira compra de produtos', 'percentage', 20.00, 100.00, 100, 23, '2024-12-31 23:59:59', true),
('FRETEGRATIS', 'Frete gratis em compras acima de R$ 200', 'fixed_amount', 25.00, 200.00, 500, 156, '2024-12-31 23:59:59', true),
('SERVICO15', '15% de desconto em servicos de manutencao', 'percentage', 15.00, 150.00, 200, 67, '2024-12-31 23:59:59', true),
('OLEO10', 'R$ 10 de desconto na troca de oleo', 'fixed_amount', 10.00, 80.00, 300, 89, '2024-12-31 23:59:59', true),
('REVISAO25', '25% OFF na primeira revisao', 'percentage', 25.00, 200.00, 50, 18, '2024-12-31 23:59:59', true),
('FREIOS20', '20% de desconto em servicos de freio', 'percentage', 20.00, 180.00, 100, 34, '2024-12-31 23:59:59', true),
('CLIENTE10', '10% de desconto para clientes cadastrados', 'percentage', 10.00, 50.00, 1000, 445, '2024-12-31 23:59:59', true),

-- CUPONS SAZONAIS/INATIVOS
('BLACK50', 'Black Friday - 50% em produtos selecionados', 'percentage', 50.00, 200.00, 100, 85, '2024-11-30 23:59:59', false),
('NATAL25', 'Natal - 25% de desconto especial', 'percentage', 25.00, 150.00, 80, 62, '2024-12-25 23:59:59', false),
('VERAO2024', 'Verao 2024 - Ar condicionado com desconto', 'percentage', 30.00, 250.00, 60, 45, '2024-03-31 23:59:59', false);

-- ============================================
-- 5. PROMOCOES REALISTAS (5 promocoes)
-- ============================================

INSERT INTO promotions (
  title, description, discount_type, discount_value, 
  category, min_amount, start_date, end_date, is_active
) VALUES
-- PROMOCOES ATIVAS
('Combo Filtros Premium', 'Leve 3 filtros (oleo + ar + combustivel) e ganhe 20% de desconto', 'percentage', 20.00, 'Filtros', 120.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('Pacote Manutencao Completa', 'Troca de oleo + filtros + revisao de 12 pontos', 'fixed_amount', 50.00, 'Manutencao Preventiva', 250.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('Kit Freios Seguranca Total', 'Pastilhas + discos + fluido com instalacao', 'percentage', 25.00, 'Freios', 400.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('Eletrica Total Care', 'Bateria + teste sistema + 1 ano garantia', 'percentage', 15.00, 'Eletrica', 300.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('Motor Protegido', 'Oleos sinteticos + filtros premium com mega desconto', 'percentage', 30.00, 'Lubrificantes', 200.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true);

-- ============================================
-- 6. USUARIOS PROVISORIOS (15 usuarios)
-- ============================================

INSERT INTO provisional_users (name, whatsapp, login, password) VALUES
('Carlos Silva', '11987654321', 'carlos.silva', 'cs123456'),
('Maria Santos', '11876543210', 'maria.santos', 'ms789012'),
('Joao Oliveira', '11765432109', 'joao.oliveira', 'jo345678'),
('Ana Costa', '11654321098', 'ana.costa', 'ac901234'),
('Pedro Rodrigues', '11543210987', 'pedro.rodrigues', 'pr567890'),
('Juliana Lima', '11432109876', 'juliana.lima', 'jl123789'),
('Roberto Pereira', '11321098765', 'roberto.pereira', 'rp456123'),
('Fernanda Alves', '11210987654', 'fernanda.alves', 'fa789456'),
('Ricardo Nascimento', '11109876543', 'ricardo.nascimento', 'rn012345'),
('Tatiana Barbosa', '11098765432', 'tatiana.barbosa', 'tb678901'),
('Marcos Ferreira', '11987123456', 'marcos.ferreira', 'mf234567'),
('Luciana Cardoso', '11876123457', 'luciana.cardoso', 'lc890123'),
('Anderson Moura', '11765123458', 'anderson.moura', 'am456789'),
('Patricia Ramos', '11654123459', 'patricia.ramos', 'pr012345'),
('Eduardo Machado', '11543234571', 'eduardo.machado', 'em678901');

-- ============================================
-- 7. PEDIDOS REALISTAS (20 pedidos)
-- ============================================

INSERT INTO orders (
  user_id, customer_name, customer_whatsapp, total, status, 
  has_products, delivery_address, notes, created_at
) VALUES
-- PEDIDOS DE PRODUTOS
((SELECT id FROM provisional_users WHERE name = 'Carlos Silva'), 'Carlos Silva', '11987654321', 156.80, 'pending', true, 'Rua A, 123 - Vila Olimpia - Sao Paulo/SP', 'Entrega pela manha', NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Maria Santos'), 'Maria Santos', '11876543210', 89.90, 'processing', true, 'Av. B, 456 - Jardins - Sao Paulo/SP', null, NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Joao Oliveira'), 'Joao Oliveira', '11765432109', 234.70, 'shipped', true, 'Rua C, 789 - Moema - Sao Paulo/SP', 'Portao azul', NOW() - INTERVAL '5 days'),
((SELECT id FROM provisional_users WHERE name = 'Ana Costa'), 'Ana Costa', '11654321098', 445.90, 'delivered', true, 'Av. D, 321 - Itaim - Sao Paulo/SP', null, NOW() - INTERVAL '7 days'),
((SELECT id FROM provisional_users WHERE name = 'Pedro Rodrigues'), 'Pedro Rodrigues', '11543210987', 78.80, 'delivered', true, 'Rua E, 654 - Pinheiros - Sao Paulo/SP', 'Apartamento 45B', NOW() - INTERVAL '10 days'),
((SELECT id FROM provisional_users WHERE name = 'Juliana Lima'), 'Juliana Lima', '11432109876', 189.90, 'pending', true, 'Av. F, 987 - Vila Madalena - Sao Paulo/SP', null, NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Roberto Pereira'), 'Roberto Pereira', '11321098765', 298.60, 'processing', true, 'Rua G, 147 - Perdizes - Sao Paulo/SP', 'Casa com grade preta', NOW() - INTERVAL '3 days'),
((SELECT id FROM provisional_users WHERE name = 'Fernanda Alves'), 'Fernanda Alves', '11210987654', 125.40, 'shipped', true, 'Av. H, 258 - Santo Amaro - Sao Paulo/SP', null, NOW() - INTERVAL '4 days'),
((SELECT id FROM provisional_users WHERE name = 'Ricardo Nascimento'), 'Ricardo Nascimento', '11109876543', 367.80, 'delivered', true, 'Rua I, 369 - Campo Belo - Sao Paulo/SP', 'Entrega comercial', NOW() - INTERVAL '8 days'),
((SELECT id FROM provisional_users WHERE name = 'Tatiana Barbosa'), 'Tatiana Barbosa', '11098765432', 92.50, 'cancelled', true, 'Av. J, 741 - Brooklin - Sao Paulo/SP', 'Cliente desistiu', NOW() - INTERVAL '12 days'),
((SELECT id FROM provisional_users WHERE name = 'Marcos Ferreira'), 'Marcos Ferreira', '11987123456', 156.90, 'pending', true, 'Rua K, 852 - Vila Mariana - Sao Paulo/SP', null, NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Luciana Cardoso'), 'Luciana Cardoso', '11876123457', 278.30, 'processing', true, 'Av. L, 963 - Saude - Sao Paulo/SP', 'Predio comercial', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Anderson Moura'), 'Anderson Moura', '11765123458', 89.90, 'shipped', true, 'Rua M, 159 - Ipiranga - Sao Paulo/SP', null, NOW() - INTERVAL '6 days'),
((SELECT id FROM provisional_users WHERE name = 'Patricia Ramos'), 'Patricia Ramos', '11654123459', 198.70, 'delivered', true, 'Av. N, 357 - Aclimacao - Sao Paulo/SP', 'Portao automatico', NOW() - INTERVAL '9 days'),
((SELECT id FROM provisional_users WHERE name = 'Eduardo Machado'), 'Eduardo Machado', '11543234571', 123.40, 'delivered', true, 'Rua Y, 560 - Agua Branca - Sao Paulo/SP', null, NOW() - INTERVAL '14 days');

-- ============================================
-- 8. ORCAMENTOS DE SERVICOS (10 orcamentos)
-- ============================================

INSERT INTO quotes (
  user_id, customer_name, customer_whatsapp, vehicle_info, total, status, notes, created_at
) VALUES
((SELECT id FROM provisional_users WHERE name = 'Carlos Silva'), 'Carlos Silva', '11987654321', 'Honda Civic 2015 - Automatico', 420.00, 'pending', 'Revisao dos 20.000km + troca pastilhas', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Maria Santos'), 'Maria Santos', '11876543210', 'VW Gol 2018 - Manual', 125.00, 'approved', 'Alinhamento + balanceamento', NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Joao Oliveira'), 'Joao Oliveira', '11765432109', 'Toyota Corolla 2016 - CVT', 300.00, 'pending', 'Higienizacao A/C + carga gas', NOW() - INTERVAL '3 days'),
((SELECT id FROM provisional_users WHERE name = 'Ana Costa'), 'Ana Costa', '11654321098', 'Ford Ka 2019 - Manual', 95.00, 'approved', 'Troca de oleo sintetico', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Pedro Rodrigues'), 'Pedro Rodrigues', '11543210987', 'Chevrolet Onix 2020 - Automatico', 320.00, 'pending', 'Reparo cilindro mestre freios', NOW() - INTERVAL '4 days'),
((SELECT id FROM provisional_users WHERE name = 'Juliana Lima'), 'Juliana Lima', '11432109876', 'Hyundai HB20 2017 - Manual', 280.00, 'rejected', 'Revisao 10.000km - preco alto', NOW() - INTERVAL '5 days'),
((SELECT id FROM provisional_users WHERE name = 'Roberto Pereira'), 'Roberto Pereira', '11321098765', 'Nissan March 2014 - Manual', 380.00, 'approved', 'Par amortecedores traseiros', NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Fernanda Alves'), 'Fernanda Alves', '11210987654', 'Fiat Palio 2012 - Manual', 120.00, 'pending', 'Higienizacao ar condicionado', NOW() - INTERVAL '3 days'),
((SELECT id FROM provisional_users WHERE name = 'Ricardo Nascimento'), 'Ricardo Nascimento', '11109876543', 'VW Fox 2011 - Manual', 220.00, 'approved', 'Manutencao completa freios', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Tatiana Barbosa'), 'Tatiana Barbosa', '11098765432', 'Renault Sandero 2015 - Manual', 85.00, 'pending', 'Diagnostico eletronico', NOW() - INTERVAL '6 days');

-- ============================================
-- 9. ITENS DOS PEDIDOS (produtos)
-- ============================================

-- Carlos Silva - R$ 156.80
INSERT INTO order_items (order_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Carlos Silva' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Filtro de Oleo Mann W75/3' LIMIT 1),
  null, 2, 23.90, 47.80
UNION ALL
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Carlos Silva' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Pastilha Freio Diant. Cobreq N1049' LIMIT 1),
  null, 1, 129.90, 129.90;

-- Maria Santos - R$ 89.90  
INSERT INTO order_items (order_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Maria Santos' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Filtro de Ar Tecfil ARL2142' LIMIT 1),
  null, 1, 29.90, 29.90
UNION ALL
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Maria Santos' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Vela Ignicao NGK BKR6E' LIMIT 1),
  null, 2, 34.90, 69.80;

-- Joao Oliveira - R$ 234.70
INSERT INTO order_items (order_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Joao Oliveira' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Amortecedor Diant. Monroe G7349' LIMIT 1),
  null, 1, 209.90, 209.90
UNION ALL
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Joao Oliveira' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Oleo Motor Castrol GTX 20W50 1L' LIMIT 1),
  null, 1, 23.90, 23.90;

-- Ana Costa - R$ 445.90
INSERT INTO order_items (order_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Ana Costa' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Bateria Moura 60Ah M60GD' LIMIT 1),
  null, 1, 249.90, 249.90
UNION ALL
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Ana Costa' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Kit Embreagem Sachs 6239089' LIMIT 1),
  null, 1, 329.90, 329.90;

-- ============================================
-- 10. ITENS DOS ORCAMENTOS (servicos)
-- ============================================

-- Carlos Silva - Revisao 20.000km
INSERT INTO quote_items (quote_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'Carlos Silva' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Revisao 20.000km' LIMIT 1),
  1, 420.00, 420.00;

-- Maria Santos - Alinhamento + Balanceamento  
INSERT INTO quote_items (quote_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'Maria Santos' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Alinhamento Direcao 3D' LIMIT 1),
  1, 75.00, 75.00
UNION ALL
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'Maria Santos' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Balanceamento 4 Rodas' LIMIT 1),
  1, 50.00, 50.00;

-- Ana Costa - Troca oleo
INSERT INTO quote_items (quote_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'Ana Costa' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Troca de Oleo Completa' LIMIT 1),
  1, 95.00, 95.00;

-- ============================================
-- VERIFICACAO DOS DADOS INSERIDOS
-- ============================================

-- Verificar produtos inseridos
SELECT 'PRODUTOS INSERIDOS' as tabela, COUNT(*) as quantidade FROM products
UNION ALL
SELECT 'SERVICOS INSERIDOS', COUNT(*) FROM services
UNION ALL
SELECT 'CUPONS INSERIDOS', COUNT(*) FROM coupons  
UNION ALL
SELECT 'PROMOCOES INSERIDAS', COUNT(*) FROM promotions
UNION ALL
SELECT 'USUARIOS INSERIDOS', COUNT(*) FROM provisional_users
UNION ALL
SELECT 'PEDIDOS INSERIDOS', COUNT(*) FROM orders
UNION ALL
SELECT 'ORCAMENTOS INSERIDOS', COUNT(*) FROM quotes
UNION ALL
SELECT 'ITENS PEDIDOS INSERIDOS', COUNT(*) FROM order_items
UNION ALL
SELECT 'ITENS ORCAMENTOS INSERIDOS', COUNT(*) FROM quote_items
UNION ALL
SELECT 'CONFIGURACOES INSERIDAS', COUNT(*) FROM settings;

-- ============================================
-- ESTATISTICAS FINAIS
-- ============================================

SELECT 'DADOS REALISTAS INSERIDOS COM SUCESSO!' as status;
SELECT 'ESTATISTICAS FINAIS:' as info;
SELECT 
  'Produtos: ' || (SELECT COUNT(*) FROM products) || ' itens em ' || 
  (SELECT COUNT(DISTINCT category) FROM products) || ' categorias' as produtos;
SELECT 'Servicos: ' || (SELECT COUNT(*) FROM services) || ' tipos de servicos' as servicos;
SELECT 'Cupons: ' || (SELECT COUNT(*) FROM coupons WHERE is_active = true) || ' cupons ativos de ' || (SELECT COUNT(*) FROM coupons) || ' total' as cupons;
SELECT 'Pedidos: ' || (SELECT COUNT(*) FROM orders WHERE has_products = true) || ' pedidos de produtos' as pedidos;
SELECT 'Orcamentos: ' || (SELECT COUNT(*) FROM quotes) || ' solicitacoes de servicos' as orcamentos;
SELECT 'Clientes: ' || (SELECT COUNT(*) FROM provisional_users) || ' usuarios provisorios' as clientes;
SELECT 'Receita Total: R$ ' || (SELECT SUM(total) FROM orders WHERE status != 'cancelled') as receita;

SELECT 'APLICACAO PRONTA PARA TESTES COMPLETOS!' as resultado;