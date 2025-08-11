-- ========================================
-- PASSO 9: POLÍTICAS DE ADMIN
-- Execute este SQL APÓS criar todas as tabelas (SQLs 1-8)
-- ========================================

-- Políticas que dependem da tabela profiles existir
-- Agora que profiles existe, podemos criar políticas que verificam role = 'admin'

-- ========================================
-- PRODUTOS - Políticas de Admin
-- ========================================
DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON products;
CREATE POLICY "Admins podem gerenciar produtos" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- SERVIÇOS - Políticas de Admin  
-- ========================================
DROP POLICY IF EXISTS "Admins podem gerenciar serviços" ON services;
CREATE POLICY "Admins podem gerenciar serviços" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- PEDIDOS - Políticas de Admin
-- ========================================
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

DROP POLICY IF EXISTS "Admins podem gerenciar todos os pedidos" ON orders;
CREATE POLICY "Admins podem gerenciar todos os pedidos" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas para order_items
DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON order_items;
CREATE POLICY "Usuários podem ver itens de seus pedidos" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
      ))
    )
  );

DROP POLICY IF EXISTS "Usuários podem criar itens para seus pedidos" ON order_items;
CREATE POLICY "Usuários podem criar itens para seus pedidos" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins podem gerenciar todos os itens" ON order_items;
CREATE POLICY "Admins podem gerenciar todos os itens" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- PROMOÇÕES - Políticas de Admin
-- ========================================
DROP POLICY IF EXISTS "Admins podem gerenciar promoções" ON promotions;
CREATE POLICY "Admins podem gerenciar promoções" ON promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- CUPONS - Políticas de Admin
-- ========================================
DROP POLICY IF EXISTS "Admins podem gerenciar cupons" ON coupons;
CREATE POLICY "Admins podem gerenciar cupons" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- CONFIGURAÇÕES - Políticas de Admin
-- ========================================
DROP POLICY IF EXISTS "Admins podem gerenciar configurações" ON settings;
CREATE POLICY "Admins podem gerenciar configurações" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins podem gerenciar informações da empresa" ON company_info;
CREATE POLICY "Admins podem gerenciar informações da empresa" ON company_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Verificar criação das políticas
SELECT 'Políticas de admin criadas com sucesso!' as status;

-- Contar políticas criadas
SELECT 
  schemaname,
  tablename,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;