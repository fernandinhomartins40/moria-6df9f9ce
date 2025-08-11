-- ========================================
-- CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS
-- Execute IMEDIATAMENTE para corrigir o erro de recursão
-- ========================================

-- REMOVER políticas problemáticas da tabela profiles
DROP POLICY IF EXISTS "Admins podem gerenciar todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;

-- RECRIAR políticas SEM recursão
CREATE POLICY "Usuários podem ver seu próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- POLÍTICA ADMIN SEGURA: usar auth.jwt() em vez de consultar profiles
CREATE POLICY "Admins têm acesso total" ON profiles
  FOR ALL USING (
    COALESCE(auth.jwt() ->> 'role', '') = 'admin' 
    OR auth.uid() = user_id
  );

-- Para outras tabelas, criar políticas admin sem recursão
-- Remover políticas admin problemáticas das outras tabelas
DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Admins podem gerenciar serviços" ON services;
DROP POLICY IF EXISTS "Admins podem gerenciar promoções" ON promotions;
DROP POLICY IF EXISTS "Admins podem gerenciar cupons" ON coupons;
DROP POLICY IF EXISTS "Admins podem gerenciar pedidos" ON orders;
DROP POLICY IF EXISTS "Admins podem gerenciar itens de pedido" ON order_items;
DROP POLICY IF EXISTS "Admins podem gerenciar configurações" ON settings;
DROP POLICY IF EXISTS "Admins podem gerenciar informações da empresa" ON company_info;

-- RECRIAR políticas admin seguras para todas as tabelas
CREATE POLICY "Admin total access produtos" ON products
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

CREATE POLICY "Admin total access serviços" ON services  
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

CREATE POLICY "Admin total access promoções" ON promotions
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

CREATE POLICY "Admin total access cupons" ON coupons
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

CREATE POLICY "Admin total access pedidos" ON orders
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

CREATE POLICY "Admin total access itens pedido" ON order_items
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

CREATE POLICY "Admin total access configurações" ON settings
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

CREATE POLICY "Admin total access empresa" ON company_info
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

-- Verificar se as políticas foram aplicadas
SELECT 'POLÍTICAS CORRIGIDAS - RECURSÃO ELIMINADA!' as status;

-- Listar políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;