-- ========================================
-- SQL 10: DADOS INICIAIS (SINTAXE CORRIGIDA)
-- Execute DÉCIMO (dados compatíveis com constraints)
-- ========================================

-- Inserir configurações básicas
INSERT INTO settings (key, value, description) VALUES
  ('site_name', '"Moria Store"', 'Nome do site'),
  ('site_description', '"Loja online com produtos e serviços de qualidade"', 'Descrição do site'),
  ('currency', '"BRL"', 'Moeda padrão'),
  ('shipping_fee', '15.00', 'Taxa de frete padrão'),
  ('free_shipping_min', '100.00', 'Valor mínimo para frete grátis'),
  ('max_cart_items', '10', 'Máximo de itens no carrinho'),
  ('order_expiry_hours', '24', 'Horas para expirar pedido pendente')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Inserir informações da empresa (com TODAS as colunas)
INSERT INTO company_info (
  name, 
  description, 
  email, 
  phone, 
  whatsapp, 
  address, 
  business_hours,
  established_year,
  website,
  social_media,
  logo_url
) VALUES (
  'Moria Store',
  'Sua loja online de confiança com produtos e serviços de qualidade',
  'contato@moria.com.br',
  '(11) 99999-9999',
  '(11) 99999-9999',
  'Rua das Flores, 123 - Centro, São Paulo - SP',
  '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-18:00", "saturday": "09:00-14:00", "sunday": "closed"}'::jsonb,
  2020,
  'https://moria.com.br',
  '{"instagram": "@moriastore", "facebook": "/moriastore", "whatsapp": "5511999999999"}'::jsonb,
  '/images/logo.png'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir produtos de exemplo (syntax JSON válida)
INSERT INTO products (name, description, price, category, is_active, stock_quantity, sku, tags) VALUES
  ('Produto Teste 1', 'Descrição do produto 1', 29.90, 'Eletrônicos', true, 10, 'PROD001', ARRAY['teste', 'eletrônicos']),
  ('Produto Teste 2', 'Descrição do produto 2', 49.90, 'Casa', true, 5, 'PROD002', ARRAY['teste', 'casa']),
  ('Produto Teste 3', 'Descrição do produto 3', 19.90, 'Roupas', true, 20, 'PROD003', ARRAY['teste', 'roupas'])
ON CONFLICT (sku) DO NOTHING;

-- Inserir serviços de exemplo
INSERT INTO services (name, description, price, category, duration, is_active) VALUES
  ('Consultoria Básica', 'Consultoria básica de 1 hora', 100.00, 'Consultoria', 60, true),
  ('Instalação Padrão', 'Serviço de instalação padrão', 50.00, 'Instalação', 120, true),
  ('Manutenção Preventiva', 'Serviço de manutenção preventiva', 75.00, 'Manutenção', 90, true)
ON CONFLICT (id) DO NOTHING;

-- Inserir promoções de exemplo (valores compatíveis com constraints)
INSERT INTO promotions (
  name, 
  description, 
  discount_type, 
  discount_value, 
  min_amount,
  start_date, 
  end_date, 
  is_active,
  promotion_type
) VALUES
  (
    'Desconto 10%', 
    '10% de desconto em compras acima de R$ 50', 
    'percentage', 
    10.00, 
    50.00,
    now(), 
    now() + interval '30 days', 
    true,
    'general'
  ),
  (
    'Frete Grátis', 
    'Frete grátis para compras acima de R$ 100', 
    'free_shipping', 
    0.00, 
    100.00,
    now(), 
    now() + interval '30 days', 
    true,
    'general'
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir cupons de exemplo (valores compatíveis com constraints)
INSERT INTO coupons (
  code, 
  description, 
  discount_type, 
  discount_value, 
  min_amount,
  expiry_date, 
  is_active,
  max_uses
) VALUES
  ('BEMVINDO10', '10% de desconto para novos clientes', 'percentage', 10.00, 0.00, now() + interval '90 days', true, 100),
  ('FRETE50', 'Frete grátis acima de R$ 50', 'free_shipping', 0.00, 50.00, now() + interval '60 days', true, 200)
ON CONFLICT (code) DO NOTHING;

-- Verificar se foi criado com sucesso
SELECT 
  'Dados iniciais inseridos com sucesso!' as status,
  current_timestamp as executado_em,
  (SELECT COUNT(*) FROM products) as produtos_count,
  (SELECT COUNT(*) FROM services) as servicos_count,
  (SELECT COUNT(*) FROM promotions) as promocoes_count,
  (SELECT COUNT(*) FROM coupons) as cupons_count;