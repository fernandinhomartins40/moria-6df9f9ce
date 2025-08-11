-- ========================================
-- SQL 09: POLÍTICAS ADMINISTRATIVAS (CRÍTICO)
-- Execute NONO - APÓS tabela profiles existir
-- ========================================

-- ATENÇÃO: Este SQL só funciona DEPOIS que profiles foi criada
-- Políticas que verificam role='admin' na tabela profiles

-- ========================================
-- POLÍTICAS ADMIN PARA PRODUTOS
-- ========================================

CREATE POLICY "Admin full access products" ON products
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- POLÍTICAS ADMIN PARA SERVIÇOS
-- ========================================

CREATE POLICY "Admin full access services" ON services
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- POLÍTICAS ADMIN PARA PEDIDOS
-- ========================================

CREATE POLICY "Admin full access orders" ON orders
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access order_items" ON order_items
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- POLÍTICAS ADMIN PARA PROMOÇÕES
-- ========================================

CREATE POLICY "Admin full access promotions" ON promotions
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access coupons" ON coupons
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- POLÍTICAS ADMIN PARA CONFIGURAÇÃO
-- ========================================

CREATE POLICY "Admin full access settings" ON settings
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access company_info" ON company_info
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- POLÍTICAS ADMIN PARA PERFIS
-- ========================================

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.user_id = auth.uid() 
      AND p2.role = 'admin'
    )
  );

CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.user_id = auth.uid() 
      AND p2.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.user_id = auth.uid() 
      AND p2.role = 'admin'
    )
  );

-- Verificar se foi criado com sucesso
SELECT 
  'Políticas administrativas criadas com sucesso!' as status,
  current_timestamp as executado_em;