-- ========================================
-- CRIAÇÃO DE TABELAS PARA AUTENTICAÇÃO REAL
-- Estruturas necessárias para integração com Supabase Auth
-- ========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuário (complementa auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  cpf text,
  birth_date date,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  total_orders integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de endereços (relacionada a usuários autenticados)
CREATE TABLE IF NOT EXISTS addresses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text DEFAULT 'home' CHECK (type IN ('home', 'work', 'other')),
  street text NOT NULL,
  number text NOT NULL,
  complement text,
  neighborhood text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de favoritos (relacionada a usuários autenticados)
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Atualizar tabela de pedidos para incluir user_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses(user_id);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON favorites(product_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar apenas seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para addresses
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios endereços" ON addresses;
CREATE POLICY "Usuários podem ver apenas seus próprios endereços" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios endereços" ON addresses;
CREATE POLICY "Usuários podem gerenciar seus próprios endereços" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para favorites
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios favoritos" ON favorites;
CREATE POLICY "Usuários podem ver apenas seus próprios favoritos" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios favoritos" ON favorites;
CREATE POLICY "Usuários podem gerenciar seus próprios favoritos" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para orders (usuários podem ver apenas seus pedidos, admins veem todos)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON orders;
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Usuários podem criar pedidos para si mesmos" ON orders;
CREATE POLICY "Usuários podem criar pedidos para si mesmos" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins podem fazer tudo
DROP POLICY IF EXISTS "Admins podem gerenciar todos os dados" ON profiles;
CREATE POLICY "Admins podem gerenciar todos os dados" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para garantir apenas um endereço padrão por usuário
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o novo endereço está sendo marcado como padrão
  IF NEW.is_default = true THEN
    -- Desmarcar outros endereços padrão do mesmo usuário
    UPDATE addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para endereço padrão único
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON addresses;
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View com dados completos do usuário
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  au.email,
  p.phone,
  p.cpf,
  p.birth_date,
  p.role,
  p.total_orders,
  p.total_spent,
  p.created_at,
  p.updated_at,
  -- Agregações úteis
  COALESCE(addr_count.count, 0) as addresses_count,
  COALESCE(fav_count.count, 0) as favorites_count
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM addresses 
  GROUP BY user_id
) addr_count ON p.user_id = addr_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM favorites 
  GROUP BY user_id
) fav_count ON p.user_id = fav_count.user_id;

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Criar usuário admin padrão (substitua pelos dados reais)
-- NOTA: Este usuário precisa ser criado via Supabase Dashboard ou API
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES ('admin@moria.com', crypt('admin123', gen_salt('bf')), now(), now(), now());

-- Comentários sobre o setup:
-- 1. O usuário admin deve ser criado primeiro no Supabase Dashboard
-- 2. Depois executar: INSERT INTO profiles (user_id, name, role) VALUES ('USER_ID_AQUI', 'Admin', 'admin');
-- 3. As políticas RLS garantem segurança dos dados
-- 4. As views facilitam consultas complexas