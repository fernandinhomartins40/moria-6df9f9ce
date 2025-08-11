-- ========================================
-- CORRIGIR POLÍTICAS DA TABELA COMPANY_INFO
-- Para garantir que o rodapé possa acessar os dados
-- ========================================

-- Verificar políticas atuais da company_info
SELECT 
  'POLÍTICAS ATUAIS COMPANY_INFO:' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'company_info';

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Informações da empresa são visíveis para todos" ON company_info;
DROP POLICY IF EXISTS "Admins podem gerenciar informações da empresa" ON company_info;
DROP POLICY IF EXISTS "Admin total access empresa" ON company_info;

-- Recriar política pública para SELECT (rodapé precisa acessar)
CREATE POLICY "Informações da empresa são públicas" ON company_info
  FOR SELECT USING (true);

-- Política admin para INSERT/UPDATE/DELETE
CREATE POLICY "Admin gerencia informações da empresa" ON company_info
  FOR ALL USING (auth.uid() = 'b8b8398c-f6bd-4716-b2fa-d82adf26f6ed'::uuid);

-- Verificar se RLS está habilitado
SELECT 'RLS STATUS:' as info, relname as table_name, relrowsecurity as rls_enabled 
FROM pg_class 
WHERE relname = 'company_info';

-- Verificar dados na tabela
SELECT 'DADOS COMPANY_INFO:' as info, name, email, phone, address 
FROM company_info 
LIMIT 5;

-- Testar acesso público
SET ROLE anon;
SELECT 'TESTE ACESSO PÚBLICO:' as info, name, email FROM company_info LIMIT 1;
RESET ROLE;

SELECT 'Políticas company_info corrigidas para acesso público!' as resultado;