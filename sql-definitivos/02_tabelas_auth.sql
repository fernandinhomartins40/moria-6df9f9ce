-- ========================================
-- SQL 02: TABELAS DE AUTENTICAÇÃO
-- Execute SEGUNDO (ANTES das políticas admin)
-- ========================================

-- Tabela de perfis dos usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de endereços
CREATE TABLE IF NOT EXISTS addresses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
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

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de favoritos (produtos)
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  product_id uuid, -- Será referenciada quando products for criada
  created_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- POLÍTICAS RLS BÁSICAS (SEM ADMIN)
-- ========================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para ADDRESSES
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para FAVORITES
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Verificar se foi criado com sucesso
SELECT 
  'Tabelas de autenticação criadas com sucesso!' as status,
  current_timestamp as executado_em;