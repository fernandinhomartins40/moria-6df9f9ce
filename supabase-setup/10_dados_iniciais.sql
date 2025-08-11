-- ========================================
-- PASSO 9: INSERIR DADOS INICIAIS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Inserir informações da empresa (versão ultra-segura - apenas coluna obrigatória)
INSERT INTO company_info (name) 
VALUES ('Moria Peças & Serviços') 
ON CONFLICT DO NOTHING;

-- Tentar atualizar com todas as colunas (ignorar erro se coluna não existir)
DO $$ 
BEGIN
  -- Tentar adicionar description
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='company_info' AND column_name='description'
  ) THEN
    UPDATE company_info SET description = 'Especializada em peças automotivas e serviços de qualidade há mais de 20 anos.'
    WHERE name = 'Moria Peças & Serviços';
  END IF;
  
  -- Tentar adicionar email
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='company_info' AND column_name='email'
  ) THEN
    UPDATE company_info SET email = 'contato@moria.com'
    WHERE name = 'Moria Peças & Serviços';
  END IF;
  
  -- Tentar adicionar phone
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='company_info' AND column_name='phone'
  ) THEN
    UPDATE company_info SET phone = '(11) 3333-3333'
    WHERE name = 'Moria Peças & Serviços';
  END IF;
  
  -- Tentar adicionar address
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='company_info' AND column_name='address'
  ) THEN
    UPDATE company_info SET address = 'Rua das Peças, 123 - Centro, São Paulo - SP, 01234-567'
    WHERE name = 'Moria Peças & Serviços';
  END IF;
  
  -- Tentar adicionar whatsapp
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='company_info' AND column_name='whatsapp'
  ) THEN
    UPDATE company_info SET whatsapp = '5511999999999' 
    WHERE name = 'Moria Peças & Serviços';
  END IF;
  
  -- Tentar adicionar business_hours
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='company_info' AND column_name='business_hours'
  ) THEN
    UPDATE company_info SET business_hours = '{
      "monday": "08:00-18:00",
      "tuesday": "08:00-18:00", 
      "wednesday": "08:00-18:00",
      "thursday": "08:00-18:00",
      "friday": "08:00-18:00",
      "saturday": "08:00-12:00",
      "sunday": "Fechado"
    }'::jsonb
    WHERE name = 'Moria Peças & Serviços';
  END IF;
END $$;

-- Inserir configurações básicas
INSERT INTO settings (key, value, description, category) VALUES
('site_name', 'Moria Peças & Serviços', 'Nome do site', 'general'),
('whatsapp_number', '5511999999999', 'Número do WhatsApp para pedidos', 'contact'),
('email_contact', 'contato@moria.com', 'Email de contato principal', 'contact'),
('currency', 'BRL', 'Moeda utilizada', 'general'),
('tax_rate', '0.00', 'Taxa de imposto (%)', 'financial'),
('free_shipping_minimum', '100.00', 'Valor mínimo para frete grátis', 'shipping'),
('enable_promotions', 'true', 'Habilitar sistema de promoções', 'features'),
('enable_coupons', 'true', 'Habilitar sistema de cupons', 'features')
ON CONFLICT (key) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO products (name, description, category, price, sale_price, stock, is_active, specifications, vehicle_compatibility) VALUES
(
  'Filtro de Óleo Bosch',
  'Filtro de óleo original Bosch para motores 1.0 a 2.0. Garante máxima proteção e performance do motor.',
  'Filtros',
  35.90,
  29.90,
  50,
  true,
  '{"brand": "Bosch", "compatibility": "Motores 1.0-2.0", "material": "Papel especial", "warranty": "12 meses"}',
  '["VW Gol", "VW Fox", "Fiat Uno", "Ford Ka", "Chevrolet Onix"]'
),
(
  'Pastilha de Freio Dianteira',
  'Pastilha de freio dianteira com tecnologia cerâmica. Maior durabilidade e segurança.',
  'Freios',
  89.90,
  79.90,
  25,
  true,
  '{"brand": "TRW", "type": "Cerâmica", "position": "Dianteira", "warranty": "24 meses"}',
  '["VW Golf", "VW Jetta", "Audi A3", "Ford Focus"]'
),
(
  'Óleo Motor Castrol GTX 20W-50',
  'Óleo mineral premium para motores. Proteção superior contra desgaste e formação de borras.',
  'Óleos e Lubrificantes',
  45.90,
  NULL,
  100,
  true,
  '{"brand": "Castrol", "viscosity": "20W-50", "type": "Mineral", "volume": "1L"}',
  '["Universal"]'
),
(
  'Bateria Moura 60Ah',
  'Bateria automotiva Moura 60Ah com 24 meses de garantia. Ideal para veículos 1.0 a 1.6.',
  'Elétrica',
  299.90,
  279.90,
  15,
  true,
  '{"brand": "Moura", "capacity": "60Ah", "voltage": "12V", "warranty": "24 meses", "cca": "420A"}',
  '["VW Gol", "Fiat Palio", "Ford Ka", "Chevrolet Celta"]'
),
(
  'Amortecedor Dianteiro Monroe',
  'Amortecedor dianteiro Monroe com tecnologia OESpectrum. Conforto e segurança originais.',
  'Suspensão',
  189.90,
  169.90,
  20,
  true,
  '{"brand": "Monroe", "position": "Dianteiro", "type": "Hidráulico", "warranty": "12 meses"}',
  '["VW Polo", "VW Golf", "Audi A1"]'
)
ON CONFLICT DO NOTHING;

-- Inserir serviços de exemplo
INSERT INTO services (name, description, category, base_price, estimated_time, is_active, specifications) VALUES
(
  'Troca de Óleo Completa',
  'Troca de óleo do motor e filtro de óleo. Inclui verificação de níveis de fluidos.',
  'Manutenção Básica',
  80.00,
  '30 minutos',
  true,
  '{"includes": ["Óleo do motor", "Filtro de óleo", "Verificação de fluidos"], "tools_required": ["Elevador", "Chaves de filtro"]}'
),
(
  'Alinhamento Computadorizado',
  'Alinhamento de direção computadorizado com equipamento de última geração.',
  'Geometria',
  120.00,
  '1 hora',
  true,
  '{"equipment": "Computadorizado", "includes": ["Alinhamento dianteiro", "Relatório impresso"], "warranty": "6 meses"}'
),
(
  'Balanceamento de Rodas',
  'Balanceamento das 4 rodas com máquina computadorizada.',
  'Pneus e Rodas',
  60.00,
  '45 minutos',
  true,
  '{"equipment": "Máquina computadorizada", "includes": ["4 rodas", "Pesos"], "warranty": "3 meses"}'
),
(
  'Revisão dos Freios',
  'Revisão completa do sistema de freios: pastilhas, discos, fluido e regulagens.',
  'Freios',
  150.00,
  '2 horas',
  true,
  '{"includes": ["Inspeção pastilhas", "Inspeção discos", "Verificação fluido", "Regulagem"], "tools_required": ["Elevador", "Ferramentas específicas"]}'
),
(
  'Diagnóstico Eletrônico',
  'Diagnóstico completo do sistema eletrônico do veículo com scanner automotivo.',
  'Eletrônica',
  100.00,
  '1 hora',
  true,
  '{"equipment": "Scanner OBD2", "includes": ["Leitura de códigos", "Relatório detalhado", "Orientações"], "warranty": "30 dias"}'
)
ON CONFLICT DO NOTHING;

-- Inserir promoções (versão minimalista - apenas campos essenciais)
INSERT INTO promotions (title, description, discount_type, discount_value) VALUES 
('Promoção Troca de Óleo', 'Desconto especial em óleos e lubrificantes', 'percentage', 15.00),
('Desconto Especial', 'Desconto para compras acima de R$ 300', 'percentage', 20.00)
ON CONFLICT DO NOTHING;

-- Inserir cupons (versão minimalista - apenas campos essenciais)
INSERT INTO coupons (code, description, discount_type, discount_value) VALUES 
('BEMVINDO10', 'Desconto de boas-vindas para novos clientes', 'percentage', 10.00),
('DESCONTO15', 'Desconto para compras acima de R$ 200', 'percentage', 15.00)
ON CONFLICT (code) DO NOTHING;

-- Verificar dados inseridos
SELECT 'Dados iniciais inseridos com sucesso!' as status;
SELECT 'Empresa:' as tipo, name as nome FROM company_info;
SELECT 'Produtos:' as tipo, COUNT(*) as quantidade FROM products;
SELECT 'Serviços:' as tipo, COUNT(*) as quantidade FROM services;
SELECT 'Configurações:' as tipo, COUNT(*) as quantidade FROM settings;
SELECT 'Promoções:' as tipo, COUNT(*) as quantidade FROM promotions;
SELECT 'Cupons:' as tipo, COUNT(*) as quantidade FROM coupons;