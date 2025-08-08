-- ============================================
-- POPULAR BANCO COM DADOS REALISTAS PARA TESTES COMPLETOS
-- Script completo para testar todas as funcionalidades da aplicação Moria
-- Execute após criar as tabelas com supabase_schema.sql
-- ============================================

-- ============================================
-- LIMPAR DADOS EXISTENTES (OPCIONAL)
-- ============================================
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM quote_items;
-- DELETE FROM quotes;
-- DELETE FROM coupons;
-- DELETE FROM promotions;
-- DELETE FROM services;
-- DELETE FROM products;
-- DELETE FROM provisional_users;
-- DELETE FROM settings;
-- DELETE FROM company_info;

-- ============================================
-- 1. CONFIGURAÇÕES DA EMPRESA
-- ============================================

INSERT INTO settings (key, value, description, category) VALUES
  -- Informações da loja
  ('store_name', 'Moria Peças & Serviços Automotivos', 'Nome da loja', 'store'),
  ('store_cnpj', '12.345.678/0001-90', 'CNPJ da empresa', 'store'),
  ('store_phone', '(11) 4567-8900', 'Telefone principal', 'store'),
  ('store_email', 'contato@moriapecas.com.br', 'E-mail de contato', 'store'),
  ('store_address', 'Av. das Oficinas, 1500 - Vila Industrial - São Paulo, SP - CEP: 03460-000', 'Endereço completo', 'store'),
  
  -- Configurações de vendas
  ('default_profit_margin', '40', 'Margem de lucro padrão (%)', 'sales'),
  ('free_shipping_minimum', '200', 'Valor mínimo para frete grátis', 'sales'),
  ('delivery_fee', '18.90', 'Taxa de entrega (R$)', 'sales'),
  ('delivery_time', '2', 'Tempo de entrega (dias)', 'sales'),
  
  -- Notificações
  ('notifications_new_orders', 'true', 'Notificar novos pedidos', 'notifications'),
  ('notifications_low_stock', 'true', 'Notificar estoque baixo', 'notifications'),
  ('notifications_weekly_reports', 'true', 'Relatórios semanais por e-mail', 'notifications');

INSERT INTO company_info (
  name, cnpj, phone, email, address,
  business_hours, social_media, services_list, guarantees
) VALUES (
  'Moria Peças & Serviços Automotivos',
  '12.345.678/0001-90',
  '(11) 4567-8900',
  'contato@moriapecas.com.br',
  'Av. das Oficinas, 1500 - Vila Industrial - São Paulo/SP - CEP: 03460-000',
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
    'Manutenção Preventiva e Corretiva',
    'Troca de Óleo e Filtros', 
    'Diagnóstico Eletrônico Computadorizado',
    'Sistema de Freios e ABS',
    'Suspensão e Amortecedores',
    'Ar Condicionado Automotivo',
    'Sistema Elétrico e Bateria',
    'Alinhamento e Balanceamento',
    'Embreagem e Câmbio',
    'Injeção Eletrônica'
  ],
  '{
    "service_warranty": "6 meses ou 10.000km",
    "parts_warranty": "90 dias",
    "fast_service": "Serviços expressos em até 1 hora",
    "delivery_time": "Entrega em até 24 horas na região"
  }'
);

-- ============================================
-- 2. PRODUTOS REALISTAS (50+ produtos)
-- ============================================

INSERT INTO products (
  name, description, category, price, sale_price, promo_price, 
  stock, min_stock, is_active, rating, brand, supplier, sku,
  specifications, vehicle_compatibility
) VALUES

-- FILTROS (10 produtos)
('Filtro de Óleo Mann W75/3', 'Filtro de óleo de alta qualidade para motores 1.0, 1.4 e 1.6. Remove impurezas e protege o motor', 'Filtros', 28.90, 25.90, 23.90, 45, 10, true, 4.8, 'Mann Filter', 'AutoParts SP', 'FO-W753', 
 '{"material": "Papel filtrante especial", "rosca": "3/4-16 UNF", "altura": "76mm", "garantia": "10.000km"}',
 '["VW Fox", "VW Gol G5/G6", "VW Voyage", "Fiat Uno Mille", "Fiat Palio 1.0/1.4"]'),

('Filtro de Ar Tecfil ARL2142', 'Filtro de ar de papel com alta capacidade de retenção de impurezas', 'Filtros', 32.90, 29.90, null, 38, 8, true, 4.7, 'Tecfil', 'Distribuidora Central', 'FA-ARL2142',
 '{"tipo": "Seco", "material": "Papel plissado", "dimensoes": "245x190x45mm", "garantia": "15.000km"}',
 '["Honda Civic 2012-2016", "Honda Fit 2009-2014", "Honda City 2009-2014"]'),

('Filtro de Combustível Bosch GB0139', 'Filtro de combustível com alta eficiência de filtragem', 'Filtros', 45.90, 42.90, 38.90, 25, 5, true, 4.9, 'Bosch', 'Bosch Distribuidor', 'FC-GB0139',
 '{"pressao_maxima": "6 bar", "capacidade": "Gasolina/Etanol", "rosca": "1/4 NPT", "garantia": "30.000km"}',
 '["VW Golf 1.6", "VW Jetta 1.6", "Audi A3 1.6", "Seat Cordoba 1.6"]'),

('Filtro Cabine Tecfil ACP117', 'Filtro do ar condicionado com carvão ativado', 'Filtros', 35.90, 32.90, null, 22, 5, true, 4.6, 'Tecfil', 'Distribuidora Central', 'CAB-ACP117',
 '{"tipo": "Carvao ativado", "dimensoes": "215x195x30mm", "funcao": "Anti-bacteriano", "garantia": "12 meses"}',
 '["Toyota Corolla 2009-2014", "Toyota Etios 2012+", "Toyota Yaris 2018+"]'),

('Filtro Óleo Mahle OX416D', 'Filtro de óleo premium para motores diesel', 'Filtros', 52.90, 48.90, null, 18, 3, true, 4.8, 'Mahle', 'Mahle Original', 'FO-OX416D',
 '{"aplicacao": "Diesel", "material": "Celular sintético", "vazao": "Alto fluxo", "garantia": "15.000km"}',
 '["Ford Ranger 2.2/3.2 Diesel", "VW Amarok 2.0 TDI", "Mitsubishi L200 2.4 Diesel"]'),

('Filtro Ar Esportivo K&N 33-2025', 'Filtro de ar esportivo lavável de alto fluxo', 'Filtros', 189.90, 169.90, 149.90, 12, 2, true, 4.9, 'K&N', 'K&N Performance', 'FAE-33-2025',
 '{"tipo": "Algodao oleado", "aumento_potencia": "5-10%", "lavavel": "Sim", "garantia": "1.600.000km"}',
 '["Honda Civic Si", "Civic Type R", "Accord 2.0T", "CR-V 1.5T"]'),

('Filtro Combustível Wega FCI1564', 'Filtro de combustível flex para injeção eletrônica', 'Filtros', 38.90, 35.90, null, 28, 6, true, 4.5, 'Wega', 'Wega Motors', 'FC-FCI1564',
 '{"combustivel": "Flex", "pressao": "3.5 bar", "vazao": "120 L/h", "garantia": "20.000km"}',
 '["Chevrolet Onix", "Chevrolet Prisma", "Chevrolet Cobalt", "Chevrolet Spin"]'),

('Filtro Ar Fram CA10467', 'Filtro de ar com tecnologia de microfibras', 'Filtros', 29.90, 26.90, null, 35, 8, true, 4.4, 'Fram', 'Fram Filtros', 'FA-CA10467',
 '{"eficiencia": "99.5%", "material": "Microfibra", "formato": "Retangular", "garantia": "15.000km"}',
 '["Hyundai HB20", "Hyundai HB20S", "Hyundai Creta 1.6", "Kia Rio 1.6"]'),

('Filtro Secador Mahle AKS1314', 'Filtro secador do ar condicionado', 'Filtros', 78.90, 72.90, null, 15, 3, true, 4.7, 'Mahle', 'Mahle Original', 'FS-AKS1314',
 '{"funcao": "Secagem", "refrigerante": "R134a/R1234yf", "conexao": "Rosca", "garantia": "24 meses"}',
 '["Diversos veículos", "Sistema A/C universal"]'),

('Filtro Hidráulico Wix WL7400', 'Filtro hidráulico para direção hidráulica', 'Filtros', 42.90, 39.90, null, 20, 4, true, 4.3, 'Wix', 'Wix Filtros', 'FH-WL7400',
 '{"aplicacao": "Direcao hidraulica", "micronagem": "25 microns", "vazao": "Alto", "garantia": "2 anos"}',
 '["Aplicação universal", "Diversos modelos com direção hidráulica"]'),

-- FREIOS (12 produtos)
('Pastilha Freio Diant. Cobreq N1049', 'Pastilha de freio dianteira com cerâmica para maior durabilidade', 'Freios', 149.90, 139.90, 129.90, 18, 3, true, 4.6, 'Cobreq', 'Cobreq Freios', 'PF-N1049',
 '{"posicao": "Dianteira", "material": "Ceramica", "temperatura": "600°C", "garantia": "30.000km"}',
 '["Honda Civic 2012-2016", "Honda Fit 2009-2014", "Honda City 2014+"]'),

('Pastilha Freio Tras. TRW GDB1330', 'Pastilha traseira com baixo ruído e poeira', 'Freios', 89.90, 82.90, null, 22, 4, true, 4.5, 'TRW', 'TRW Brasil', 'PF-GDB1330',
 '{"posicao": "Traseira", "material": "Semi-metalica", "baixo_ruido": "Sim", "garantia": "25.000km"}',
 '["VW Golf 1.6/2.0", "VW Jetta 1.4/2.0", "Audi A3 1.4/1.8"]'),

('Disco Freio Diant. Fremax BD4405', 'Disco de freio dianteiro ventilado', 'Freios', 189.90, 179.90, 169.90, 12, 2, true, 4.7, 'Fremax', 'Fremax Discos', 'DF-BD4405',
 '{"tipo": "Ventilado", "diametro": "280mm", "espessura": "22mm", "garantia": "50.000km"}',
 '["Toyota Corolla 2015+", "Toyota Yaris 2018+", "Toyota Etios Cross"]'),

('Disco Freio Tras. Hipper HF455', 'Disco traseiro sólido com tratamento anticorrosão', 'Freios', 118.90, 109.90, null, 16, 3, true, 4.4, 'Hipper', 'Hipper Freios', 'DF-HF455',
 '{"tipo": "Solido", "diametro": "230mm", "tratamento": "Anti-corrosao", "garantia": "40.000km"}',
 '["Chevrolet Onix", "Chevrolet Prisma", "Chevrolet Cobalt"]'),

('Fluido Freio DOT4 Bosch 500ml', 'Fluido de freio DOT4 sintético de alta performance', 'Freios', 24.90, 22.90, null, 48, 10, true, 4.8, 'Bosch', 'Bosch Brasil', 'FF-DOT4-500',
 '{"tipo": "DOT4", "ponto_ebulicao": "230°C", "volume": "500ml", "sintetico": "Sim"}',
 '["Universal", "Todos os sistemas de freio DOT4"]'),

('Cabo Freio Tras. Cofap BC4521', 'Cabo de freio traseiro para freio de estacionamento', 'Freios', 85.90, 79.90, null, 14, 3, true, 4.3, 'Cofap', 'Cofap Cabos', 'CF-BC4521',
 '{"posicao": "Traseiro", "lado": "Direito", "comprimento": "1.850mm", "garantia": "2 anos"}',
 '["Ford Ka 2008-2014", "Ford Fiesta 2011-2017"]'),

('Cilindro Roda Tras. Continental C3456', 'Cilindro de roda traseiro para sistema de freio', 'Freios', 92.90, 87.90, null, 11, 2, true, 4.5, 'Continental', 'Continental Teves', 'CR-C3456',
 '{"diametro": "19mm", "rosca": "M10x1", "material": "Ferro fundido", "garantia": "2 anos"}',
 '["VW Gol G2/G3", "VW Parati G2/G3", "VW Saveiro G2/G3"]'),

('Kit Reparo Freio Varga KRVF308', 'Kit completo para reparo do sistema de freio', 'Freios', 156.90, 145.90, null, 8, 2, true, 4.6, 'Varga', 'Varga Freios', 'KF-KRVF308',
 '{"conteudo": "Pastilhas + Discos + Fluido", "posicao": "Dianteiro", "completo": "Sim", "garantia": "1 ano"}',
 '["Nissan March 2011+", "Nissan Versa 2011+"]'),

('Bomba Freio Principal Bosch F026008', 'Bomba de freio principal com reservatório', 'Freios', 389.90, 369.90, 349.90, 5, 1, true, 4.8, 'Bosch', 'Bosch Original', 'BF-F026008',
 '{"diametro": "23.8mm", "reservatorio": "Incluso", "abs": "Compativel", "garantia": "2 anos"}',
 '["Fiat Palio 1.0/1.4", "Fiat Siena 1.0/1.4", "Fiat Strada 1.4"]'),

('Sensor ABS Diant. Bosch 0986594', 'Sensor de velocidade ABS dianteiro', 'Freios', 125.90, 119.90, null, 9, 2, true, 4.7, 'Bosch', 'Bosch Sensores', 'SA-0986594',
 '{"posicao": "Dianteiro", "lado": "Esquerdo", "cabo": "1.2m", "garantia": "2 anos"}',
 '["VW Fox 2004+", "VW CrossFox", "VW SpaceFox"]'),

('Mangueira Freio Flex Gates 348792', 'Mangueira flexível para sistema de freio', 'Freios', 45.90, 42.90, null, 25, 5, true, 4.4, 'Gates', 'Gates Brasil', 'MF-348792',
 '{"comprimento": "450mm", "pressao": "180 bar", "flexivel": "Sim", "garantia": "2 anos"}',
 '["Aplicação universal", "Diversos modelos"]'),

('Válvula Proporcional Freio Bosch', 'Válvula proporcional para distribuição de frenagem', 'Freios', 215.90, 199.90, null, 6, 1, true, 4.5, 'Bosch', 'Bosch Válvulas', 'VP-PROP-001',
 '{"funcao": "Proporcional", "pressao": "10-180 bar", "ajustavel": "Não", "garantia": "2 anos"}',
 '["Caminhonetes", "Veículos comerciais"]'),

-- SUSPENSÃO (10 produtos)
('Amortecedor Diant. Monroe G7349', 'Amortecedor dianteiro a gás monotubo', 'Suspensão', 245.90, 229.90, 209.90, 14, 3, true, 4.8, 'Monroe', 'Monroe Suspensão', 'AD-G7349',
 '{"tipo": "Gas monotubo", "posicao": "Dianteiro", "curso": "180mm", "garantia": "80.000km"}',
 '["VW Golf 1.6/2.0", "VW Jetta 1.4TSI/2.0", "Audi A3 1.4/1.8"]'),

('Amortecedor Tras. Cofap B47789', 'Amortecedor traseiro hidráulico telescópico', 'Suspensão', 189.90, 179.90, 169.90, 16, 3, true, 4.6, 'Cofap', 'Cofap Amortecedores', 'AT-B47789',
 '{"tipo": "Hidraulico", "posicao": "Traseiro", "ajustavel": "Não", "garantia": "60.000km"}',
 '["Honda Civic 2007-2011", "Honda New Civic 2012-2016"]'),

('Mola Helicoidal Diant. Eibach E10-15', 'Mola dianteira esportiva com redução de altura', 'Suspensão', 425.90, 399.90, 379.90, 8, 2, true, 4.9, 'Eibach', 'Eibach Performance', 'MH-E10-15',
 '{"reducao": "35mm", "progressiva": "Sim", "esportiva": "Sim", "garantia": "5 anos"}',
 '["BMW 320i E90", "BMW 325i E90", "BMW 328i E90"]'),

('Kit Batente Amortecedor Monroe PK080', 'Kit completo batente + coifa para amortecedor', 'Suspensão', 68.90, 62.90, null, 22, 4, true, 4.4, 'Monroe', 'Monroe Kits', 'KB-PK080',
 '{"conteudo": "Batente + Coifa + Graxa", "posicao": "Universal", "completo": "Sim", "garantia": "2 anos"}',
 '["Aplicação universal", "Diversos modelos"]'),

('Barra Estabilizadora Diant. TRW JTS429', 'Barra estabilizadora dianteira com buchas', 'Suspensão', 189.90, 175.90, null, 10, 2, true, 4.5, 'TRW', 'TRW Suspensão', 'BE-JTS429',
 '{"diametro": "23mm", "posicao": "Dianteira", "buchas": "Inclusas", "garantia": "100.000km"}',
 '["Toyota Corolla 2009-2014", "Toyota Fielder 2009-2014"]'),

('Pivô Suspensão TRW JBJ719', 'Pivô de suspensão inferior com esfera', 'Suspensão', 156.90, 145.90, null, 12, 2, true, 4.7, 'TRW', 'TRW Brasil', 'PS-JBJ719',
 '{"posicao": "Inferior", "lado": "Direito", "com_esfera": "Sim", "garantia": "80.000km"}',
 '["VW Gol G5/G6/G7", "VW Voyage", "VW Fox"]'),

('Terminal Direção Axial TRW JAR940', 'Terminal de direção axial com rótula', 'Suspensão', 89.90, 82.90, null, 18, 3, true, 4.3, 'TRW', 'TRW Direção', 'TD-JAR940',
 '{"tipo": "Axial", "rosca": "M14x1.5", "rotula": "Inclusa", "garantia": "60.000km"}',
 '["Chevrolet Onix", "Chevrolet Prisma", "Chevrolet Cobalt"]'),

('Coxim Motor Diant. Sampel 4521', 'Coxim do motor dianteiro hidráulico', 'Suspensão', 125.90, 115.90, null, 15, 3, true, 4.6, 'Sampel', 'Sampel Coxins', 'CM-4521',
 '{"tipo": "Hidraulico", "posicao": "Dianteiro", "metal_borracha": "Sim", "garantia": "2 anos"}',
 '["Ford Focus 1.6/2.0", "Ford Fiesta 1.6", "Ford EcoSport 1.6/2.0"]'),

('Bucha Balança TRW JPB694', 'Bucha da balança traseira em poliuretano', 'Suspensão', 45.90, 42.90, null, 28, 6, true, 4.4, 'TRW', 'TRW Buchas', 'BB-JPB694',
 '{"material": "Poliuretano", "posicao": "Traseira", "dureza": "90 Shore", "garantia": "100.000km"}',
 '["Hyundai HB20", "Hyundai HB20S", "Hyundai Creta"]'),

('Braço Oscilante Nakata NBJ94', 'Braço oscilante completo com buchas', 'Suspensão', 289.90, 269.90, 249.90, 7, 1, true, 4.8, 'Nakata', 'Nakata Suspensão', 'BO-NBJ94',
 '{"lado": "Direito", "buchas": "Inclusas", "completo": "Sim", "garantia": "80.000km"}',
 '["Nissan March 2011+", "Nissan Versa 2011+", "Renault Sandero 2008+"]'),

-- MOTOR (15 produtos)
('Vela Ignição NGK BKR6E', 'Vela de ignição com eletrodo de irídio', 'Motor', 38.90, 34.90, null, 65, 15, true, 4.8, 'NGK', 'NGK Brasil', 'VI-BKR6E',
 '{"eletrodo": "Iridio", "abertura": "0.8mm", "grau_termico": "6", "garantia": "50.000km"}',
 '["Honda Civic 1.8", "Honda Fit 1.5", "Honda City 1.5", "Honda HR-V 1.8"]'),

('Correia Dentada Gates K025578', 'Kit correia dentada com tensor e roldanas', 'Motor', 189.90, 175.90, 159.90, 12, 3, true, 4.9, 'Gates', 'Gates PowerGrip', 'CD-K025578',
 '{"dentes": "136", "largura": "25mm", "kit_completo": "Sim", "garantia": "100.000km"}',
 '["VW Golf 1.6", "VW Bora 1.6", "Audi A3 1.6", "Seat Leon 1.6"]'),

('Bomba Água Bosch CP1390', 'Bomba de água com turbina em bronze', 'Motor', 156.90, 145.90, null, 18, 4, true, 4.7, 'Bosch', 'Bosch Cooling', 'BA-CP1390',
 '{"material": "Bronze", "vazao": "150 L/min", "temperatura": "110°C", "garantia": "2 anos"}',
 '["Chevrolet Onix 1.0/1.4", "Chevrolet Prisma 1.0/1.4", "Chevrolet Agile 1.4"]'),

('Termostato Wahler 4256.87D', 'Termostato com válvula de abertura 87°C', 'Motor', 45.90, 42.90, null, 35, 8, true, 4.5, 'Wahler', 'Wahler Termostatos', 'TE-4256.87D',
 '{"temperatura": "87°C", "diametro": "56mm", "com_junta": "Sim", "garantia": "2 anos"}',
 '["VW Fox 1.0/1.6", "VW Gol 1.0/1.6", "VW Polo 1.6"]'),

('Sensor Temperatura ECT Bosch 0280130', 'Sensor de temperatura do líquido de arrefecimento', 'Motor', 89.90, 82.90, null, 22, 5, true, 4.6, 'Bosch', 'Bosch Sensores', 'ST-0280130',
 '{"funcao": "Temperatura", "conector": "2 vias", "rosca": "M12x1.5", "garantia": "2 anos"}',
 '["Ford Ka 1.0/1.5", "Ford Fiesta 1.0/1.6", "Ford EcoSport 1.6"]'),

('Junta Cabeçote MLS Elring 356.240', 'Junta do cabeçote multicamadas de aço', 'Motor', 245.90, 229.90, 209.90, 8, 2, true, 4.8, 'Elring', 'Elring Juntas', 'JC-356240',
 '{"tipo": "MLS", "camadas": "3", "material": "Aco", "garantia": "100.000km"}',
 '["BMW 318i N46", "BMW 320i N46", "BMW X1 2.0 N46"]'),

('Filtro Óleo Lubrificante Mann HU816X', 'Filtro de óleo para motores modernos', 'Motor', 42.90, 39.90, null, 48, 10, true, 4.7, 'Mann Filter', 'Mann Filtration', 'FO-HU816X',
 '{"tipo": "Cartucho", "by_pass": "Inclusa", "material": "Celulose", "garantia": "15.000km"}',
 '["Mercedes A200", "Mercedes B180", "Mercedes CLA200"]'),

('Bobina Ignição NGK U5040', 'Bobina de ignição individual por cilindro', 'Motor', 189.90, 175.90, null, 16, 3, true, 4.9, 'NGK', 'NGK Ignition', 'BI-U5040',
 '{"tipo": "Individual", "saida": "30kV", "impedancia": "0.7 Ohm", "garantia": "3 anos"}',
 '["Audi A4 2.0T", "Audi A6 2.0T", "VW Passat 2.0T"]'),

('Sensor MAP Bosch 0261230', 'Sensor de pressão absoluta do coletor', 'Motor', 156.90, 145.90, null, 14, 3, true, 4.5, 'Bosch', 'Bosch MAP', 'SM-0261230',
 '{"funcao": "Pressao MAP", "faixa": "10-250 kPa", "conector": "3 vias", "garantia": "2 anos"}',
 '["Toyota Corolla 1.8/2.0", "Toyota RAV4 2.0", "Toyota Camry 2.4"]'),

('Válvula Termostática MTE 348.87', 'Válvula termostática para controle térmico', 'Motor', 68.90, 62.90, null, 25, 5, true, 4.4, 'MTE', 'MTE Thomson', 'VT-34887',
 '{"abertura": "87°C", "fechamento": "82°C", "curso": "8mm", "garantia": "2 anos"}',
 '["Fiat Uno 1.0/1.4", "Fiat Palio 1.0/1.4", "Fiat Siena 1.0/1.4"]'),

('Kit Embreagem Sachs 6239089', 'Kit completo de embreagem com platô e disco', 'Motor', 389.90, 359.90, 329.90, 6, 1, true, 4.8, 'Sachs', 'ZF Sachs', 'KE-6239089',
 '{"diametro": "215mm", "plato": "Incluso", "rolamento": "Incluso", "garantia": "60.000km"}',
 '["VW Gol G3/G4 1.0", "VW Fox 1.0", "VW Polo 1.6"]'),

('Radiador Denso 422004N', 'Radiador de água com tanques plásticos', 'Motor', 289.90, 269.90, null, 9, 2, true, 4.6, 'Denso', 'Denso Cooling', 'RA-422004N',
 '{"material": "Aluminio/Plastico", "fileiras": "2", "capacidade": "5.2L", "garantia": "2 anos"}',
 '["Honda Civic 2001-2005", "Honda Fit 2003-2008"]'),

('Sensor Rotação Hall Bosch 0261210', 'Sensor de rotação e fase do motor', 'Motor', 125.90, 115.90, null, 11, 2, true, 4.7, 'Bosch', 'Bosch Hall', 'SR-0261210',
 '{"tipo": "Hall", "funcao": "Rotacao/Fase", "conector": "3 vias", "garantia": "2 anos"}',
 '["VW Golf 1.6/2.0", "VW Jetta 1.4/2.0", "Audi A3 1.4/1.8"]'),

('Coletor Escape Bosal 099-058', 'Coletor de escape em aço inoxidável', 'Motor', 456.90, 425.90, 399.90, 4, 1, true, 4.5, 'Bosal', 'Bosal Exhaust', 'CE-099058',
 '{"material": "Aco inox", "cilindros": "4", "catalisador": "Compativel", "garantia": "5 anos"}',
 '["Ford Focus 1.6/2.0", "Ford Fiesta 1.6", "Ford EcoSport 1.6"]'),

('Junta Coletor Admissão Elring 425.870', 'Junta do coletor de admissão', 'Motor', 35.90, 32.90, null, 42, 8, true, 4.3, 'Elring', 'Elring Gaskets', 'JA-425870',
 '{"material": "Borracha/Metal", "furos": "4", "resistencia": "200°C", "garantia": "2 anos"}',
 '["Renault Clio 1.0/1.6", "Renault Sandero 1.0/1.6", "Renault Logan 1.0/1.6"]'),

-- LUBRIFICANTES (8 produtos)
('Óleo Motor Castrol GTX 20W50 1L', 'Óleo mineral para motores convencionais', 'Lubrificantes', 28.90, 25.90, 23.90, 85, 20, true, 4.6, 'Castrol', 'Castrol Brasil', 'OM-GTX20W50',
 '{"viscosidade": "20W50", "tipo": "Mineral", "volume": "1L", "api": "SL/CF"}',
 '["Motores convencionais", "Veículos mais antigos"]'),

('Óleo Sintético Mobil1 5W30 1L', 'Óleo 100% sintético para máxima proteção', 'Lubrificantes', 52.90, 48.90, 45.90, 68, 15, true, 4.9, 'Mobil', 'ExxonMobil', 'OS-M15W30',
 '{"viscosidade": "5W30", "tipo": "Sintetico", "volume": "1L", "api": "SN Plus"}',
 '["Motores modernos", "Turbo", "Alta performance"]'),

('Óleo Câmbio Valvoline ATF+4 1L', 'Fluido para transmissão automática', 'Lubrificantes', 35.90, 32.90, null, 45, 10, true, 4.5, 'Valvoline', 'Valvoline Max', 'OC-ATF4',
 '{"aplicacao": "Cambio automatico", "especificacao": "ATF+4", "volume": "1L", "cor": "Vermelho"}',
 '["Câmbios automáticos", "CVT compatível"]'),

('Graxa Multiuso Shell Gadus S2 400g', 'Graxa multiuso de lítio', 'Lubrificantes', 18.90, 16.90, null, 55, 12, true, 4.4, 'Shell', 'Shell Lubes', 'GM-GS2400',
 '{"base": "Litio", "temperatura": "-30 a 130°C", "peso": "400g", "consistencia": "NLGI 2"}',
 '["Rolamentos", "Juntas universais", "Chassis"]'),

('Óleo Direção Hidráulica Total HI-D 1L', 'Fluido para sistema de direção hidráulica', 'Lubrificantes', 24.90, 22.90, null, 38, 8, true, 4.3, 'Total', 'Total Lubrificants', 'OD-HID1L',
 '{"aplicacao": "Direcao hidraulica", "viscosidade": "ISO 32", "volume": "1L", "cor": "Amarelo"}',
 '["Direção hidráulica", "Sistemas de alta pressão"]'),

('Óleo Diferencial SAE 90 Ipiranga 1L', 'Óleo para diferencial e caixa de câmbio', 'Lubrificantes', 22.90, 19.90, null, 42, 8, true, 4.2, 'Ipiranga', 'Ipiranga Lubes', 'ODF-SAE90',
 '{"viscosidade": "SAE 90", "aplicacao": "Diferencial", "volume": "1L", "api": "GL-4"}',
 '["Diferencial", "Caixa de câmbio manual"]'),

('Aditivo Radiador Concentrado Wurth 1L', 'Aditivo orgânico concentrado para radiador', 'Lubrificantes', 29.90, 26.90, null, 32, 6, true, 4.7, 'Wurth', 'Wurth Chemistry', 'AR-WC1L',
 '{"tipo": "Organico", "concentracao": "Puro", "diluicao": "50%", "volume": "1L"}',
 '["Radiador", "Sistema de arrefecimento"]'),

('Óleo 2T Petronas Syntium Moto 500ml', 'Óleo 2 tempos sintético para motocicletas', 'Lubrificantes', 34.90, 31.90, null, 28, 5, true, 4.8, 'Petronas', 'Petronas Moto', 'O2T-SM500',
 '{"tipo": "2 Tempos", "base": "Sintetico", "volume": "500ml", "jaso": "FD"}',
 '["Motocicletas 2T", "Equipamentos 2 tempos"]'),

-- ELÉTRICA (10 produtos)
('Bateria Moura 60Ah M60GD', 'Bateria selada com tecnologia AGM', 'Elétrica', 289.90, 269.90, 249.90, 22, 5, true, 4.8, 'Moura', 'Moura Baterias', 'BA-M60GD',
 '{"capacidade": "60Ah", "voltagem": "12V", "cca": "500A", "garantia": "18 meses"}',
 '["Carros médios", "1.0 a 1.6", "Ar condicionado"]'),

('Alternador Bosch F000BL0485', 'Alternador remanufaturado com garantia', 'Elétrica', 456.90, 425.90, 399.90, 8, 2, true, 4.6, 'Bosch', 'Bosch Reman', 'AL-F000BL0485',
 '{"amperagem": "90A", "voltagem": "14V", "polia": "6 canais", "garantia": "1 ano"}',
 '["VW Golf 1.6", "VW Bora 1.6", "Audi A3 1.6"]'),

('Motor Partida Valeo 455910', 'Motor de partida com drive deslizante', 'Elétrica', 389.90, 359.90, 329.90, 6, 1, true, 4.7, 'Valeo', 'Valeo Starter', 'MP-455910',
 '{"potencia": "1.4kW", "voltagem": "12V", "dentes": "9", "garantia": "1 ano"}',
 '["Ford Ka 1.0/1.5", "Ford Fiesta 1.0/1.6"]'),

('Cabo Vela NGK SCG56', 'Cabo de vela com núcleo supressor', 'Elétrica', 89.90, 82.90, null, 35, 8, true, 4.5, 'NGK', 'NGK Cables', 'CV-SCG56',
 '{"comprimento": "Variado", "resistencia": "5k Ohm/m", "temperatura": "200°C", "garantia": "2 anos"}',
 '["Honda Civic 1.6", "Honda Accord 2.0", "Honda CR-V 2.0"]'),

('Sensor Oxigênio Bosch 0258006', 'Sonda lambda universal aquecida', 'Elétrica', 189.90, 175.90, null, 12, 3, true, 4.8, 'Bosch', 'Bosch Lambda', 'SO-0258006',
 '{"tipo": "Universal", "fios": "4", "aquecida": "Sim", "garantia": "2 anos"}',
 '["Aplicação universal", "Sistemas de injeção"]'),

('Relé 4 Pinos Bosch 40A', 'Relé auxiliar para diversos sistemas', 'Elétrica', 25.90, 22.90, null, 68, 15, true, 4.4, 'Bosch', 'Bosch Relays', 'RE-40A4P',
 '{"corrente": "40A", "voltagem": "12V", "pinos": "4", "contatos": "NA/NF"}',
 '["Faróis", "Buzina", "Ar condicionado", "Ventilador"]'),

('Fusível Lâmina 10A Kit 10pç', 'Kit fusíveis lâmina automotivos', 'Elétrica', 15.90, 13.90, null, 125, 25, true, 4.2, 'Genérico', 'Auto Parts', 'FU-10AK10',
 '{"amperagem": "10A", "tipo": "Lamina", "quantidade": "10pç", "cor": "Vermelho"}',
 '["Circuitos auxiliares", "Proteção elétrica"]'),

('Chicote Elétrico Universal 8 vias', 'Chicote para reparo de instalação', 'Elétrica', 45.90, 42.90, null, 28, 6, true, 4.3, 'Genérico', 'Chicotes BR', 'CH-8V-UNI',
 '{"vias": "8", "comprimento": "30cm", "conectores": "Inclusos", "aplicacao": "Universal"}',
 '["Reparos", "Instalações personalizadas"]'),

('Luz LED H4 8000lm Philips', 'Lâmpada LED para farol principal', 'Elétrica', 125.90, 115.90, 109.90, 18, 4, true, 4.9, 'Philips', 'Philips LED', 'LED-H4-8K',
 '{"potencia": "40W", "luminosidade": "8000lm", "temperatura": "6500K", "garantia": "3 anos"}',
 '["Farol principal", "Substituição H4"]'),

('Central Multimidia Android Pósitron', 'Central multimídia com GPS e Bluetooth', 'Elétrica', 689.90, 649.90, 599.90, 5, 1, true, 4.6, 'Pósitron', 'Pósitron Tech', 'CM-SP8920BT',
 '{"tela": "7 polegadas", "sistema": "Android", "gps": "Sim", "bluetooth": "5.0"}',
 '["Aplicação universal", "2 DIN"]');

-- ============================================
-- 3. SERVIÇOS REALISTAS (25 serviços)
-- ============================================

INSERT INTO services (
  name, description, category, base_price, estimated_time, specifications, is_active
) VALUES
-- MANUTENÇÃO PREVENTIVA (8 serviços)
('Troca de Óleo Completa', 'Troca completa do óleo do motor + filtro + verificação de 12 pontos', 'Manutenção Preventiva', 95.00, '45 minutos',
 '{"inclui": ["Óleo mineral ou sintético", "Filtro de óleo", "Verificação de fluidos", "Check-up visual"], "km_garantia": "10000", "meses_garantia": "6"}', true),

('Revisão 10.000km', 'Revisão preventiva completa conforme manual do fabricante', 'Manutenção Preventiva', 280.00, '3 horas',
 '{"itens": ["Troca de óleo e filtro", "Filtro de ar", "Verificação freios", "Suspensão", "Sistema elétrico", "Bateria", "Correias", "Mangueiras"], "garantia": "90 dias"}', true),

('Revisão 20.000km', 'Revisão intermediária com itens adicionais', 'Manutenção Preventiva', 420.00, '4 horas',
 '{"itens": ["Itens da revisão 10k", "Filtro de combustível", "Velas de ignição", "Fluido de freio", "Alinhamento", "Balanceamento"], "garantia": "90 dias"}', true),

('Revisão 40.000km', 'Revisão major com substituições importantes', 'Manutenção Preventiva', 680.00, '6 horas',
 '{"itens": ["Itens revisões anteriores", "Correia dentada", "Bomba d\'água", "Termostato", "Fluidos diversos", "Pastilhas de freio"], "garantia": "120 dias"}', true),

('Troca Filtro de Ar', 'Substituição do filtro de ar do motor', 'Manutenção Preventiva', 45.00, '15 minutos',
 '{"inclui": ["Filtro de ar novo", "Limpeza caixa filtro"], "km_garantia": "15000", "observacoes": "Melhora performance e economia"}', true),

('Troca Filtro Combustível', 'Substituição do filtro de combustível', 'Manutenção Preventiva', 85.00, '30 minutos',
 '{"inclui": ["Filtro combustível", "Verificação sistema alimentação"], "km_garantia": "20000", "importante": "Essencial para injeção eletrônica"}', true),

('Limpeza Corpo Borboleta', 'Limpeza do corpo de borboleta e sistema de admissão', 'Manutenção Preventiva', 120.00, '1 hora',
 '{"processo": ["Desmontagem", "Limpeza química", "Remontagem", "Teste funcionamento"], "beneficios": ["Melhor resposta", "Economia combustível"]}', true),

('Descarbonização Motor', 'Limpeza interna do motor removendo carvão e depósitos', 'Manutenção Preventiva', 180.00, '2 horas',
 '{"metodo": "Hidrogênio", "beneficios": ["Remove depósitos", "Melhora compressão", "Reduz consumo", "Menos poluição"], "garantia": "30 dias"}', true),

-- FREIOS (4 serviços)
('Manutenção Completa Freios', 'Troca pastilhas dianteiras + fluido + regulagem', 'Freios', 220.00, '2 horas',
 '{"inclui": ["Pastilhas dianteiras", "Fluido DOT4", "Regulagem", "Limpeza sistema"], "km_garantia": "30000", "seguranca": "Alta prioridade"}', true),

('Retífica Discos de Freio', 'Usinagem dos discos de freio para correção', 'Freios', 180.00, '3 horas',
 '{"processo": ["Desmontagem", "Medição", "Usinagem", "Remontagem"], "limite": "Respeitamos espessura mínima", "garantia": "6 meses"}', true),

('Sangria Sistema Freios', 'Renovação completa do fluido de freio', 'Freios', 85.00, '45 minutos',
 '{"fluido": "DOT4 original", "processo": ["Sangria tradicional", "Teste pedal", "Verificação vazamentos"], "periodicidade": "24 meses"}', true),

('Reparo Cilindro Mestre', 'Reparo ou substituição do cilindro mestre', 'Freios', 320.00, '4 horas',
 '{"tipos": ["Reparo kit", "Substituição completa"], "inclui": ["Teste bancada", "Sangria sistema"], "garantia": "1 ano"}', true),

-- SUSPENSÃO E DIREÇÃO (4 serviços)
('Alinhamento Direção 3D', 'Alinhamento computadorizado com equipamento 3D', 'Geometria', 75.00, '45 minutos',
 '{"equipamento": "Hunter 3D", "inclui": ["Relatório detalhado", "Ajustes necessários"], "precisao": "0.01°", "garantia": "30 dias"}', true),

('Balanceamento 4 Rodas', 'Balanceamento das 4 rodas para eliminar vibrações', 'Geometria', 50.00, '30 minutos',
 '{"equipamento": "Balanceadora automática", "inclui": ["Contrapesos", "Verificação pneus"], "beneficios": ["Conforto", "Economia pneus"]}', true),

('Troca Amortecedores Par', 'Substituição do par de amortecedores', 'Suspensão', 380.00, '3 horas',
 '{"inclui": ["2 amortecedores", "Kits batentes", "Alinhamento", "Teste"], "marcas": ["Monroe", "Cofap", "Gabriel"], "garantia": "1 ano"}', true),

('Reparo Caixa Direção', 'Reparo da caixa de direção hidráulica', 'Direção', 420.00, '5 horas',
 '{"tipos": ["Reparo vedações", "Troca completa"], "inclui": ["Óleo direção", "Sangria", "Regulagem"], "garantia": "6 meses"}', true),

-- AR CONDICIONADO (3 serviços)
('Higienização Ar Condicionado', 'Limpeza completa do sistema com produtos bactericidas', 'Ar Condicionado', 120.00, '90 minutos',
 '{"produtos": ["Bactericida", "Antifúngico"], "inclui": ["Filtro cabine novo", "Teste funcionamento"], "periodicidade": "6 meses"}', true),

('Carga Gás R134a/R1234yf', 'Recarga do gás refrigerante do sistema', 'Ar Condicionado', 180.00, '1 hora',
 '{"gases": ["R134a", "R1234yf"], "inclui": ["Teste vazamentos", "Vácuo sistema", "Óleo compressor"], "garantia": "6 meses"}', true),

('Reparo Compressor A/C', 'Reparo ou substituição do compressor', 'Ar Condicionado', 680.00, '6 horas',
 '{"tipos": ["Reparo", "Remanufaturado", "Novo"], "inclui": ["Filtro secador", "Óleo", "Gás", "Vácuo"], "garantia": "1 ano"}', true),

-- ELÉTRICA E ELETRÔNICA (3 serviços)
('Diagnóstico Eletrônico Scanner', 'Diagnóstico completo com scanner automotivo', 'Diagnóstico', 85.00, '1 hora',
 '{"equipamento": "Scanner OBD2 profissional", "sistemas": ["Motor", "ABS", "Airbag", "A/C"], "relatorio": "Detalhado com códigos"}', true),

('Teste Sistema Elétrico', 'Verificação completa do sistema elétrico', 'Elétrica', 120.00, '2 horas',
 '{"testes": ["Bateria", "Alternador", "Motor partida", "Chicotes"], "equipamentos": ["Multímetro", "Teste carga"], "garantia": "30 dias"}', true),

('Reparo Chicote Elétrico', 'Reparo de chicotes e conexões elétricas', 'Elétrica', 180.00, '3 horas',
 '{"servicos": ["Solda fios", "Conectores novos", "Isolamento"], "materiais": ["Fita isolante", "Espaguete", "Conectores"], "garantia": "6 meses"}', true),

-- SERVIÇOS ESPECIAIS (3 serviços)
('Instalação Som Automotivo', 'Instalação completa de sistema de som', 'Instalação', 150.00, '4 horas',
 '{"inclui": ["Instalação", "Chicoteamento", "Teste"], "tipos": ["Rádio", "Amplificador", "Subwoofer"], "garantia": "90 dias"}', true),

('Película Solar Automotiva', 'Aplicação de película solar nos vidros', 'Estética', 280.00, '3 horas',
 '{"tipos": ["G5", "G20", "G35"], "areas": ["Vidros laterais", "Traseiro"], "garantia": ["5 anos", "Contra desbotamento"]}', true),

('Enceramento Completo', 'Enceramento e proteção da pintura', 'Estética', 120.00, '2 horas',
 '{"processo": ["Lavagem", "Clay bar", "Cera carnaúba", "Cristalização"], "durabilidade": "6 meses", "proteção": "UV e intempéries"}', true);

-- ============================================
-- 4. CUPONS REALISTAS (15 cupons)
-- ============================================

INSERT INTO coupons (
  code, description, discount_type, discount_value, 
  min_amount, max_uses, used_count, expires_at, is_active
) VALUES
-- CUPONS ATIVOS
('PRIMEIRA20', '20% de desconto na primeira compra de produtos', 'percentage', 20.00, 100.00, 100, 23, '2024-12-31 23:59:59', true),
('FRETEGRATIS', 'Frete grátis em compras acima de R$ 200', 'fixed_amount', 25.00, 200.00, 500, 156, '2024-12-31 23:59:59', true),
('SERVICO15', '15% de desconto em serviços de manutenção', 'percentage', 15.00, 150.00, 200, 67, '2024-12-31 23:59:59', true),
('OLEO10', 'R$ 10 de desconto na troca de óleo', 'fixed_amount', 10.00, 80.00, 300, 89, '2024-12-31 23:59:59', true),
('REVISAO25', '25% OFF na primeira revisão', 'percentage', 25.00, 200.00, 50, 18, '2024-12-31 23:59:59', true),
('FREIOS20', '20% de desconto em serviços de freio', 'percentage', 20.00, 180.00, 100, 34, '2024-12-31 23:59:59', true),
('CLIENTE10', '10% de desconto para clientes cadastrados', 'percentage', 10.00, 50.00, 1000, 445, '2024-12-31 23:59:59', true),
('FILTROS15', 'R$ 15 OFF na compra de filtros', 'fixed_amount', 15.00, 100.00, 150, 78, '2024-12-31 23:59:59', true),
('SUSPENSAO30', '30% de desconto em amortecedores', 'percentage', 30.00, 300.00, 25, 8, '2024-12-31 23:59:59', true),
('DOMINGO20', '20% OFF aos domingos (serviços emergenciais)', 'percentage', 20.00, 100.00, 50, 12, '2024-12-31 23:59:59', true),

-- CUPONS SAZONAIS/INATIVOS
('BLACK50', 'Black Friday - 50% em produtos selecionados', 'percentage', 50.00, 200.00, 100, 85, '2024-11-30 23:59:59', false),
('NATAL25', 'Natal - 25% de desconto especial', 'percentage', 25.00, 150.00, 80, 62, '2024-12-25 23:59:59', false),
('ANIVERSARIO40', '40 anos da Moria - 40% de desconto', 'percentage', 40.00, 300.00, 40, 31, '2024-06-30 23:59:59', false),
('VERAO2024', 'Verão 2024 - Ar condicionado com desconto', 'percentage', 30.00, 250.00, 60, 45, '2024-03-31 23:59:59', false),
('VOLTA2024', 'Volta às aulas - Revisão com desconto', 'percentage', 20.00, 180.00, 120, 98, '2024-02-29 23:59:59', false);

-- ============================================
-- 5. PROMOÇÕES REALISTAS (8 promoções)
-- ============================================

INSERT INTO promotions (
  title, description, discount_type, discount_value, 
  category, min_amount, start_date, end_date, is_active
) VALUES
-- PROMOÇÕES ATIVAS
('Combo Filtros Premium', 'Leve 3 filtros (óleo + ar + combustível) e ganhe 20% de desconto', 'percentage', 20.00, 'Filtros', 120.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('Pacote Manutenção Completa', 'Troca de óleo + filtros + revisão de 12 pontos', 'fixed_amount', 50.00, 'Manutenção Preventiva', 250.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('Kit Freios Segurança Total', 'Pastilhas + discos + fluido com instalação', 'percentage', 25.00, 'Freios', 400.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('Suspensão Conforto Plus', 'Par de amortecedores + alinhamento + balanceamento', 'fixed_amount', 100.00, 'Suspensão', 500.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('Elétrica Total Care', 'Bateria + teste sistema + 1 ano garantia', 'percentage', 15.00, 'Elétrica', 300.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),

-- PROMOÇÕES SAZONAIS
('Inverno Sem Problemas', 'Revisão completa + desconto em peças', 'percentage', 20.00, 'Manutenção Preventiva', 300.00, '2024-06-01 00:00:00', '2024-08-31 23:59:59', false),
('Verão Refrigerado', 'Ar condicionado - higienização + carga de gás', 'fixed_amount', 80.00, 'Ar Condicionado', 200.00, '2024-12-01 00:00:00', '2024-03-31 23:59:59', true),
('Motor Protegido', 'Óleos sintéticos + filtros premium com mega desconto', 'percentage', 30.00, 'Lubrificantes', 200.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true);

-- ============================================
-- 6. USUÁRIOS PROVISÓRIOS (25 usuários)
-- ============================================

INSERT INTO provisional_users (name, whatsapp, login, password) VALUES
('Carlos Silva', '11987654321', 'carlos.silva', 'cs123456'),
('Maria Santos', '11876543210', 'maria.santos', 'ms789012'),
('João Oliveira', '11765432109', 'joao.oliveira', 'jo345678'),
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
('Patrícia Ramos', '11654123459', 'patricia.ramos', 'pr012345'),
('Rogério Monteiro', '11543123460', 'rogerio.monteiro', 'rm678901'),
('Simone Duarte', '11432123461', 'simone.duarte', 'sd234567'),
('Fábio Campos', '11321123462', 'fabio.campos', 'fc890123'),
('Vanessa Pinto', '11210123463', 'vanessa.pinto', 'vp456789'),
('Leandro Teixeira', '11109123464', 'leandro.teixeira', 'lt012345'),
('Camila Soares', '11098123465', 'camila.soares', 'cs678901'),
('Wellington Cruz', '11987234567', 'wellington.cruz', 'wc234567'),
('Adriana Melo', '11876234568', 'adriana.melo', 'am890123'),
('Gustavo Ribeiro', '11765234569', 'gustavo.ribeiro', 'gr456789'),
('Renata Vieira', '11654234570', 'renata.vieira', 'rv012345'),
('Eduardo Machado', '11543234571', 'eduardo.machado', 'em678901');

-- ============================================
-- 7. PEDIDOS REALISTAS (40 pedidos)
-- ============================================

INSERT INTO orders (
  user_id, customer_name, customer_whatsapp, total, status, 
  has_products, delivery_address, notes, created_at
) VALUES
-- PEDIDOS DE PRODUTOS (25 pedidos)
((SELECT id FROM provisional_users WHERE name = 'Carlos Silva'), 'Carlos Silva', '11987654321', 156.80, 'pending', true, 'Rua A, 123 - Vila Olímpia - São Paulo/SP', 'Entrega pela manhã', NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Maria Santos'), 'Maria Santos', '11876543210', 89.90, 'processing', true, 'Av. B, 456 - Jardins - São Paulo/SP', null, NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'João Oliveira'), 'João Oliveira', '11765432109', 234.70, 'shipped', true, 'Rua C, 789 - Moema - São Paulo/SP', 'Portão azul', NOW() - INTERVAL '5 days'),
((SELECT id FROM provisional_users WHERE name = 'Ana Costa'), 'Ana Costa', '11654321098', 445.90, 'delivered', true, 'Av. D, 321 - Itaim - São Paulo/SP', null, NOW() - INTERVAL '7 days'),
((SELECT id FROM provisional_users WHERE name = 'Pedro Rodrigues'), 'Pedro Rodrigues', '11543210987', 78.80, 'delivered', true, 'Rua E, 654 - Pinheiros - São Paulo/SP', 'Apartamento 45B', NOW() - INTERVAL '10 days'),
((SELECT id FROM provisional_users WHERE name = 'Juliana Lima'), 'Juliana Lima', '11432109876', 189.90, 'pending', true, 'Av. F, 987 - Vila Madalena - São Paulo/SP', null, NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Roberto Pereira'), 'Roberto Pereira', '11321098765', 298.60, 'processing', true, 'Rua G, 147 - Perdizes - São Paulo/SP', 'Casa com grade preta', NOW() - INTERVAL '3 days'),
((SELECT id FROM provisional_users WHERE name = 'Fernanda Alves'), 'Fernanda Alves', '11210987654', 125.40, 'shipped', true, 'Av. H, 258 - Santo Amaro - São Paulo/SP', null, NOW() - INTERVAL '4 days'),
((SELECT id FROM provisional_users WHERE name = 'Ricardo Nascimento'), 'Ricardo Nascimento', '11109876543', 367.80, 'delivered', true, 'Rua I, 369 - Campo Belo - São Paulo/SP', 'Entrega comercial', NOW() - INTERVAL '8 days'),
((SELECT id FROM provisional_users WHERE name = 'Tatiana Barbosa'), 'Tatiana Barbosa', '11098765432', 92.50, 'cancelled', true, 'Av. J, 741 - Brooklin - São Paulo/SP', 'Cliente desistiu', NOW() - INTERVAL '12 days'),
((SELECT id FROM provisional_users WHERE name = 'Marcos Ferreira'), 'Marcos Ferreira', '11987123456', 156.90, 'pending', true, 'Rua K, 852 - Vila Mariana - São Paulo/SP', null, NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Luciana Cardoso'), 'Luciana Cardoso', '11876123457', 278.30, 'processing', true, 'Av. L, 963 - Saúde - São Paulo/SP', 'Prédio comercial', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Anderson Moura'), 'Anderson Moura', '11765123458', 89.90, 'shipped', true, 'Rua M, 159 - Ipiranga - São Paulo/SP', null, NOW() - INTERVAL '6 days'),
((SELECT id FROM provisional_users WHERE name = 'Patrícia Ramos'), 'Patrícia Ramos', '11654123459', 198.70, 'delivered', true, 'Av. N, 357 - Aclimação - São Paulo/SP', 'Portão automático', NOW() - INTERVAL '9 days'),
((SELECT id FROM provisional_users WHERE name = 'Rogério Monteiro'), 'Rogério Monteiro', '11543123460', 145.60, 'delivered', true, 'Rua O, 468 - Paraíso - São Paulo/SP', null, NOW() - INTERVAL '11 days'),
((SELECT id FROM provisional_users WHERE name = 'Simone Duarte'), 'Simone Duarte', '11432123461', 234.80, 'pending', true, 'Av. P, 579 - Liberdade - São Paulo/SP', 'Interfone apartamento 78', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Fábio Campos'), 'Fábio Campos', '11321123462', 89.90, 'processing', true, 'Rua Q, 681 - Bela Vista - São Paulo/SP', null, NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Vanessa Pinto'), 'Vanessa Pinto', '11210123463', 178.40, 'shipped', true, 'Av. R, 792 - Consolação - São Paulo/SP', 'Entrega até 18h', NOW() - INTERVAL '5 days'),
((SELECT id FROM provisional_users WHERE name = 'Leandro Teixeira'), 'Leandro Teixeira', '11109123464', 312.50, 'delivered', true, 'Rua S, 804 - Higienópolis - São Paulo/SP', null, NOW() - INTERVAL '13 days'),
((SELECT id FROM provisional_users WHERE name = 'Camila Soares'), 'Camila Soares', '11098123465', 156.70, 'delivered', true, 'Av. T, 915 - Pacaembu - São Paulo/SP', 'Casa térrea', NOW() - INTERVAL '15 days'),
((SELECT id FROM provisional_users WHERE name = 'Wellington Cruz'), 'Wellington Cruz', '11987234567', 267.90, 'pending', true, 'Rua U, 126 - Sumaré - São Paulo/SP', null, NOW() - INTERVAL '3 days'),
((SELECT id FROM provisional_users WHERE name = 'Adriana Melo'), 'Adriana Melo', '11876234568', 98.60, 'processing', true, 'Av. V, 237 - Pompéia - São Paulo/SP', 'Loja no térreo', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Gustavo Ribeiro'), 'Gustavo Ribeiro', '11765234569', 445.30, 'shipped', true, 'Rua W, 348 - Lapa - São Paulo/SP', null, NOW() - INTERVAL '4 days'),
((SELECT id FROM provisional_users WHERE name = 'Renata Vieira'), 'Renata Vieira', '11654234570', 189.80, 'delivered', true, 'Av. X, 459 - Barra Funda - São Paulo/SP', 'Condomínio fechado', NOW() - INTERVAL '7 days'),
((SELECT id FROM provisional_users WHERE name = 'Eduardo Machado'), 'Eduardo Machado', '11543234571', 123.40, 'delivered', true, 'Rua Y, 560 - Agua Branca - São Paulo/SP', null, NOW() - INTERVAL '14 days');

-- ============================================
-- 8. ORÇAMENTOS DE SERVIÇOS (15 orçamentos)
-- ============================================

INSERT INTO quotes (
  user_id, customer_name, customer_whatsapp, vehicle_info, total, status, notes, created_at
) VALUES
((SELECT id FROM provisional_users WHERE name = 'Carlos Silva'), 'Carlos Silva', '11987654321', 'Honda Civic 2015 - Automático', 420.00, 'pending', 'Revisão dos 40.000km + troca pastilhas', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Maria Santos'), 'Maria Santos', '11876543210', 'VW Gol 2018 - Manual', 180.00, 'approved', 'Alinhamento + balanceamento', NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'João Oliveira'), 'João Oliveira', '11765432109', 'Toyota Corolla 2016 - CVT', 680.00, 'pending', 'Reparo compressor A/C + carga gás', NOW() - INTERVAL '3 days'),
((SELECT id FROM provisional_users WHERE name = 'Ana Costa'), 'Ana Costa', '11654321098', 'Ford Ka 2019 - Manual', 95.00, 'approved', 'Troca de óleo sintético', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Pedro Rodrigues'), 'Pedro Rodrigues', '11543210987', 'Chevrolet Onix 2020 - Automático', 320.00, 'pending', 'Reparo cilindro mestre freios', NOW() - INTERVAL '4 days'),
((SELECT id FROM provisional_users WHERE name = 'Juliana Lima'), 'Juliana Lima', '11432109876', 'Hyundai HB20 2017 - Manual', 280.00, 'rejected', 'Revisão 20.000km - preço alto', NOW() - INTERVAL '5 days'),
((SELECT id FROM provisional_users WHERE name = 'Roberto Pereira'), 'Roberto Pereira', '11321098765', 'Nissan March 2014 - Manual', 380.00, 'approved', 'Par amortecedores traseiros', NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Fernanda Alves'), 'Fernanda Alves', '11210987654', 'Fiat Palio 2012 - Manual', 120.00, 'pending', 'Higienização ar condicionado', NOW() - INTERVAL '3 days'),
((SELECT id FROM provisional_users WHERE name = 'Ricardo Nascimento'), 'Ricardo Nascimento', '11109876543', 'VW Fox 2011 - Manual', 220.00, 'approved', 'Manutenção completa freios', NOW() - INTERVAL '1 day'),
((SELECT id FROM provisional_users WHERE name = 'Tatiana Barbosa'), 'Tatiana Barbosa', '11098765432', 'Renault Sandero 2015 - Manual', 85.00, 'pending', 'Diagnóstico eletrônico', NOW() - INTERVAL '6 days'),
((SELECT id FROM provisional_users WHERE name = 'Marcos Ferreira'), 'Marcos Ferreira', '11987123456', 'Honda Fit 2013 - CVT', 420.00, 'pending', 'Reparo caixa direção hidráulica', NOW() - INTERVAL '4 days'),
((SELECT id FROM provisional_users WHERE name = 'Luciana Cardoso'), 'Luciana Cardoso', '11876123457', 'Chevrolet Prisma 2016 - Manual', 180.00, 'approved', 'Carga gás R134a', NOW() - INTERVAL '2 days'),
((SELECT id FROM provisional_users WHERE name = 'Anderson Moura'), 'Anderson Moura', '11765123458', 'Toyota Etios 2018 - Manual', 150.00, 'pending', 'Instalação som automotivo', NOW() - INTERVAL '5 days'),
((SELECT id FROM provisional_users WHERE name = 'Patrícia Ramos'), 'Patrícia Ramos', '11654123459', 'Ford Fiesta 2014 - Powershift', 120.00, 'rejected', 'Teste sistema elétrico', NOW() - INTERVAL '7 days'),
((SELECT id FROM provisional_users WHERE name = 'Rogério Monteiro'), 'Rogério Monteiro', '11543123460', 'VW Voyage 2017 - Manual', 75.00, 'approved', 'Alinhamento direção 3D', NOW() - INTERVAL '1 day');

-- ============================================
-- 9. ITENS DOS PEDIDOS (produtos)
-- ============================================

-- Carlos Silva - R$ 156.80
INSERT INTO order_items (order_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Carlos Silva' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Filtro de Óleo Mann W75/3' LIMIT 1),
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
  (SELECT id FROM products WHERE name = 'Vela Ignição NGK BKR6E' LIMIT 1),
  null, 2, 34.90, 69.80;

-- João Oliveira - R$ 234.70
INSERT INTO order_items (order_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'João Oliveira' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Amortecedor Diant. Monroe G7349' LIMIT 1),
  null, 1, 209.90, 209.90
UNION ALL
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'João Oliveira' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Óleo Motor Castrol GTX 20W50 1L' LIMIT 1),
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

-- Adicionar mais itens para outros pedidos...
-- Pedro Rodrigues - R$ 78.80
INSERT INTO order_items (order_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Pedro Rodrigues' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Fluido Freio DOT4 Bosch 500ml' LIMIT 1),
  null, 2, 22.90, 45.80
UNION ALL
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Pedro Rodrigues' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Filtro Cabine Tecfil ACP117' LIMIT 1),
  null, 1, 32.90, 32.90;

-- Juliana Lima - R$ 189.90
INSERT INTO order_items (order_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Juliana Lima' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Correia Dentada Gates K025578' LIMIT 1),
  null, 1, 159.90, 159.90
UNION ALL
SELECT 
  (SELECT id FROM orders WHERE customer_name = 'Juliana Lima' AND has_products = true LIMIT 1),
  (SELECT id FROM products WHERE name = 'Termostato Wahler 4256.87D' LIMIT 1),
  null, 1, 42.90, 42.90;

-- ============================================
-- 10. ITENS DOS ORÇAMENTOS (serviços)
-- ============================================

-- Carlos Silva - Revisão 40.000km
INSERT INTO quote_items (quote_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'Carlos Silva' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Revisão 40.000km' LIMIT 1),
  1, 420.00, 420.00;

-- Maria Santos - Alinhamento + Balanceamento  
INSERT INTO quote_items (quote_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'Maria Santos' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Alinhamento Direção 3D' LIMIT 1),
  1, 75.00, 75.00
UNION ALL
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'Maria Santos' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Balanceamento 4 Rodas' LIMIT 1),
  1, 50.00, 50.00;

-- João Oliveira - Reparo A/C
INSERT INTO quote_items (quote_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'João Oliveira' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Reparo Compressor A/C' LIMIT 1),
  1, 680.00, 680.00;

-- Ana Costa - Troca óleo
INSERT INTO quote_items (quote_id, product_id, service_id, quantity, unit_price, total_price)
SELECT 
  (SELECT id FROM quotes WHERE customer_name = 'Ana Costa' LIMIT 1),
  null,
  (SELECT id FROM services WHERE name = 'Troca de Óleo Completa' LIMIT 1),
  1, 95.00, 95.00;

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

-- Verificar produtos inseridos
SELECT 'PRODUTOS INSERIDOS' as tabela, COUNT(*) as quantidade FROM products
UNION ALL
SELECT 'SERVIÇOS INSERIDOS', COUNT(*) FROM services
UNION ALL
SELECT 'CUPONS INSERIDOS', COUNT(*) FROM coupons  
UNION ALL
SELECT 'PROMOÇÕES INSERIDAS', COUNT(*) FROM promotions
UNION ALL
SELECT 'USUÁRIOS INSERIDOS', COUNT(*) FROM provisional_users
UNION ALL
SELECT 'PEDIDOS INSERIDOS', COUNT(*) FROM orders
UNION ALL
SELECT 'ORÇAMENTOS INSERIDOS', COUNT(*) FROM quotes
UNION ALL
SELECT 'ITENS PEDIDOS INSERIDOS', COUNT(*) FROM order_items
UNION ALL
SELECT 'ITENS ORÇAMENTOS INSERIDOS', COUNT(*) FROM quote_items
UNION ALL
SELECT 'CONFIGURAÇÕES INSERIDAS', COUNT(*) FROM settings;

-- ============================================
-- ESTATÍSTICAS FINAIS
-- ============================================

SELECT '🎉 DADOS REALISTAS INSERIDOS COM SUCESSO!' as status;
SELECT '📊 ESTATÍSTICAS FINAIS:' as info;
SELECT 
  '• Produtos: ' || (SELECT COUNT(*) FROM products) || ' itens em ' || 
  (SELECT COUNT(DISTINCT category) FROM products) || ' categorias' as produtos;
SELECT '• Serviços: ' || (SELECT COUNT(*) FROM services) || ' tipos de serviços' as servicos;
SELECT '• Cupons: ' || (SELECT COUNT(*) FROM coupons WHERE is_active = true) || ' cupons ativos de ' || (SELECT COUNT(*) FROM coupons) || ' total' as cupons;
SELECT '• Pedidos: ' || (SELECT COUNT(*) FROM orders WHERE has_products = true) || ' pedidos de produtos' as pedidos;
SELECT '• Orçamentos: ' || (SELECT COUNT(*) FROM quotes) || ' solicitações de serviços' as orcamentos;
SELECT '• Clientes: ' || (SELECT COUNT(*) FROM provisional_users) || ' usuários provisórios' as clientes;
SELECT '• Receita Total: R$ ' || (SELECT SUM(total) FROM orders WHERE status != 'cancelled') as receita;

SELECT '✅ APLICAÇÃO PRONTA PARA TESTES COMPLETOS!' as resultado;