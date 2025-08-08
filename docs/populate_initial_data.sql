-- ============================================
-- POPULAR BANCO COM DADOS INICIAIS REAIS
-- Execute após criar as tabelas com supabase_schema.sql
-- ============================================

-- ============================================
-- CRIAR TABELAS DE CONFIGURAÇÕES E EMPRESA
-- ============================================

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de informações da empresa
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  business_hours JSONB,
  social_media JSONB,
  services_list TEXT[],
  guarantees JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- RLS Policies para settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow full access to settings for admin" ON settings USING (true) WITH CHECK (true);

-- RLS Policies para company_info
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read company_info" ON company_info FOR SELECT USING (true);
CREATE POLICY "Allow full access to company_info for admin" ON company_info USING (true) WITH CHECK (true);

-- ============================================
-- DADOS INICIAIS DAS CONFIGURAÇÕES
-- ============================================

-- Configurações da loja
INSERT INTO settings (key, value, description, category) VALUES
  ('store_name', 'Moria Peças & Serviços', 'Nome da loja', 'store'),
  ('store_cnpj', '12.345.678/0001-90', 'CNPJ da empresa', 'store'),
  ('store_phone', '(11) 99999-9999', 'Telefone principal', 'store'),
  ('store_email', 'contato@moriapecas.com', 'E-mail de contato', 'store'),
  ('store_address', 'Av. das Oficinas, 123 - Centro - São Paulo, SP', 'Endereço completo', 'store'),
  
  -- Configurações de vendas
  ('default_profit_margin', '35', 'Margem de lucro padrão (%)', 'sales'),
  ('free_shipping_minimum', '150', 'Valor mínimo para frete grátis', 'sales'),
  ('delivery_fee', '15.90', 'Taxa de entrega (R$)', 'sales'),
  ('delivery_time', '3', 'Tempo de entrega (dias)', 'sales'),
  
  -- Notificações
  ('notifications_new_orders', 'true', 'Notificar novos pedidos', 'notifications'),
  ('notifications_low_stock', 'true', 'Notificar estoque baixo', 'notifications'),
  ('notifications_weekly_reports', 'false', 'Relatórios semanais por e-mail', 'notifications');

-- Informações da empresa
INSERT INTO company_info (
  name, cnpj, phone, email, address,
  business_hours, social_media, services_list, guarantees
) VALUES (
  'Moria Peças & Serviços',
  '12.345.678/0001-90',
  '(11) 99999-9999',
  'contato@moriapecas.com.br',
  'Rua das Oficinas, 123 - Centro - São Paulo/SP - CEP: 01234-567',
  '{
    "weekdays": {"open": "08:00", "close": "18:00"},
    "saturday": {"open": "08:00", "close": "12:00"},
    "sunday": "closed"
  }',
  '{
    "facebook": "#",
    "instagram": "#"
  }',
  ARRAY[
    'Manutenção Preventiva',
    'Troca de Óleo', 
    'Diagnóstico Eletrônico',
    'Freios e Suspensão',
    'Ar Condicionado',
    'Sistema Elétrico'
  ],
  '{
    "service_warranty": "6 meses",
    "fast_service": "30 minutos",
    "delivery_time": "24 horas"
  }'
);

-- ============================================
-- PRODUTOS REAIS PARA TESTES
-- ============================================

INSERT INTO products (
  name, 
  description, 
  category, 
  price, 
  sale_price, 
  promo_price, 
  stock, 
  is_active, 
  rating,
  specifications,
  vehicle_compatibility
) VALUES
-- Produto 1: Filtro de Óleo
(
  'Filtro de Óleo Mann W75/3',
  'Filtro de óleo de alta qualidade para motores 1.0, 1.4 e 1.6',
  'Filtros',
  25.90,
  23.90,
  22.90,
  45,
  true,
  4.8,
  '{"aplicacao": "VW Fox, Gol, Voyage / Fiat Uno, Palio", "material": "Papel filtrante especial", "garantia": "12 meses"}',
  '["VW Fox", "VW Gol", "VW Voyage", "Fiat Uno", "Fiat Palio"]'
),
-- Produto 2: Pastilha de Freio
(
  'Pastilha de Freio Dianteira Cobreq N1049',
  'Pastilha de freio dianteira com cerâmica para maior durabilidade',
  'Freios',
  139.90,
  129.90,
  null,
  12,
  true,
  4.5,
  '{"posicao": "Dianteira", "material": "Cerâmica", "garantia": "20.000 km"}',
  '["Honda Civic", "Honda Fit", "Toyota Corolla"]'
),
-- Produto 3: Amortecedor
(
  'Amortecedor Traseiro Monroe Gas-Matic',
  'Amortecedor traseiro Monroe Gas-Matic para maior conforto de rodagem',
  'Suspensão',
  189.90,
  179.90,
  169.90,
  8,
  true,
  4.7,
  '{"posicao": "Traseiro", "tecnologia": "Gas-Matic", "garantia": "2 anos"}',
  '["VW Gol G5/G6", "VW Voyage", "VW Fox"]'
),
-- Produto 4: Vela de Ignição
(
  'Vela de Ignição NGK BKR6E',
  'Vela de ignição NGK com eletrodo de irídio para melhor performance',
  'Motor',
  32.90,
  29.90,
  null,
  25,
  true,
  4.6,
  '{"tipo": "Irídio", "abertura": "0.8mm", "garantia": "30.000 km"}',
  '["Honda Civic", "Honda Fit", "Honda City"]'
),
-- Produto 5: Óleo do Motor
(
  'Óleo Lubrax Sintético 5W30 1L',
  'Óleo de motor 100% sintético para máxima proteção do motor',
  'Lubrificantes',
  45.90,
  42.90,
  39.90,
  30,
  true,
  4.9,
  '{"viscosidade": "5W30", "tipo": "Sintético", "volume": "1 Litro"}',
  '["Todos os veículos compatíveis com 5W30"]'
),
-- Produto 6: Correia Dentada
(
  'Correia Dentada Gates PowerGrip',
  'Correia dentada de alta resistência para comando de válvulas',
  'Motor',
  89.90,
  82.90,
  null,
  15,
  true,
  4.4,
  '{"dentes": "136", "largura": "25mm", "garantia": "2 anos"}',
  '["VW Golf", "VW Bora", "Audi A3"]'
);

-- ============================================
-- SERVIÇOS REAIS PARA TESTES
-- ============================================

INSERT INTO services (
  name,
  description,
  category,
  base_price,
  estimated_time,
  specifications,
  is_active
) VALUES
-- Serviço 1: Troca de Óleo
(
  'Troca de Óleo Completa',
  'Troca completa do óleo do motor com filtro e verificação de níveis',
  'Manutenção Preventiva',
  95.00,
  '30 minutos',
  '{"inclui": ["Óleo do motor", "Filtro de óleo", "Verificação de fluidos"], "garantia": "10.000 km ou 6 meses"}',
  true
),
-- Serviço 2: Alinhamento
(
  'Alinhamento Direção 3D',
  'Alinhamento da direção com equipamento 3D de última geração',
  'Geometria',
  65.00,
  '45 minutos',
  '{"equipamento": "3D Computadorizado", "inclui": ["Relatório detalhado", "Ajustes necessários"]}',
  true
),
-- Serviço 3: Balanceamento
(
  'Balanceamento 4 Rodas',
  'Balanceamento das 4 rodas para eliminar vibrações',
  'Geometria',
  45.00,
  '30 minutos',
  '{"inclui": ["Balanceamento das 4 rodas", "Verificação de pneus"]}',
  true
),
-- Serviço 4: Revisão
(
  'Revisão dos 10.000 km',
  'Revisão preventiva conforme manual do fabricante',
  'Revisão',
  180.00,
  '2 horas',
  '{"itens": ["Troca de óleo", "Filtros", "Verificação geral", "Relatório completo"], "garantia": "90 dias"}',
  true
),
-- Serviço 5: Freios
(
  'Manutenção Completa de Freios',
  'Troca de pastilhas, verificação de discos e fluido de freio',
  'Freios',
  220.00,
  '90 minutos',
  '{"inclui": ["Pastilhas dianteiras", "Fluido DOT4", "Regulagem"], "garantia": "20.000 km"}',
  true
),
-- Serviço 6: Ar Condicionado
(
  'Higienização Ar Condicionado',
  'Limpeza completa do sistema de ar condicionado com produtos específicos',
  'Conforto',
  85.00,
  '60 minutos',
  '{"produtos": ["Higienizador bactericida", "Troca do filtro do ar"], "garantia": "30 dias"}',
  true
);

-- ============================================
-- CUPONS PARA TESTES
-- ============================================

INSERT INTO coupons (
  code,
  description,
  discount_type,
  discount_value,
  min_amount,
  max_uses,
  used_count,
  expires_at,
  is_active
) VALUES
-- Cupom 1: Primeira Compra
(
  'PRIMEIRA20',
  '20% de desconto na primeira compra de produtos',
  'percentage',
  20.00,
  100.00,
  100,
  12,
  '2024-12-31 23:59:59',
  true
),
-- Cupom 2: Frete Grátis  
(
  'FRETEGRATIS',
  'Frete grátis em compras acima de R$ 150',
  'fixed_amount',
  25.00,
  150.00,
  200,
  45,
  '2024-12-31 23:59:59',
  true
),
-- Cupom 3: Black Friday
(
  'BLACK30',
  'Black Friday - 30% de desconto em serviços',
  'percentage',
  30.00,
  200.00,
  50,
  8,
  '2024-11-30 23:59:59',
  false
);

-- ============================================
-- PROMOÇÕES PARA TESTES
-- ============================================

INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  category,
  min_amount,
  start_date,
  end_date,
  is_active
) VALUES
-- Promoção 1: Filtros
(
  'Combo Filtros com Desconto',
  'Leve 2 filtros e ganhe 15% de desconto no total',
  'percentage',
  15.00,
  'Filtros',
  50.00,
  '2024-01-01 00:00:00',
  '2024-12-31 23:59:59',
  true
),
-- Promoção 2: Manutenção
(
  'Pacote Manutenção Preventiva',
  'Troca de óleo + filtro + revisão básica com preço especial',
  'fixed_amount',
  50.00,
  'Manutenção Preventiva',
  200.00,
  '2024-01-01 00:00:00',
  '2024-12-31 23:59:59',
  true
);

-- ============================================
-- CONFIGURAÇÕES DA APLICAÇÃO
-- ============================================

INSERT INTO app_configs (key, value, description) VALUES
('store_name', 'Moria Peças & Serviços', 'Nome da loja'),
('store_description', 'Sua oficina de confiança - peças e serviços automotivos de qualidade', 'Descrição da loja'),
('contact_phone', '(11) 99999-9999', 'Telefone principal de contato'),
('contact_email', 'contato@moriaautomotiva.com.br', 'Email de contato'),
('store_address', 'Rua das Oficinas, 123 - Centro - São Paulo/SP - CEP: 01010-000', 'Endereço completo'),
('whatsapp_number', '5511999999999', 'Número do WhatsApp (com código do país)'),
('business_hours', 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 14h', 'Horário de funcionamento'),
('about_text', 'Com mais de 15 anos no mercado, a Moria é referência em peças e serviços automotivos na região.', 'Texto sobre a empresa')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

-- Contar registros inseridos
SELECT 
  'Produtos inseridos: ' || COUNT(*) as produtos
FROM products;

SELECT 
  'Serviços inseridos: ' || COUNT(*) as servicos
FROM services;

SELECT 
  'Cupons inseridos: ' || COUNT(*) as cupons
FROM coupons;

SELECT 
  'Promoções inseridas: ' || COUNT(*) as promocoes
FROM promotions;

SELECT 
  'Configurações inseridas: ' || COUNT(*) as configuracoes
FROM app_configs;

-- ============================================
-- SUCESSO!
-- ============================================

SELECT '🎉 Dados iniciais inseridos com sucesso no Supabase!' as status,
       '✅ Agora a aplicação terá produtos, serviços e cupons REAIS' as resultado;