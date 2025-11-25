-- ============================================================================
-- Script de Limpeza de Migrations - PRODUÇÃO
-- ============================================================================
--
-- OBJETIVO: Alinhar tabela _prisma_migrations com arquivos locais
--
-- QUANDO EXECUTAR: Após fazer push das correções de Phase 1
-- COMO EXECUTAR:
--   1. SSH no servidor: ssh root@moriapecas.com.br
--   2. Conectar ao banco: docker exec -it moria-vps-postgres-1 psql -U moria -d moria
--   3. Copiar e colar este script
--
-- ATENÇÃO: Este script é IDEMPOTENTE - pode ser executado múltiplas vezes
-- ============================================================================

-- Exibir estado atual antes das mudanças
SELECT
  '📊 ESTADO ATUAL DAS MIGRATIONS' AS info,
  migration_name,
  CASE
    WHEN finished_at IS NOT NULL THEN '✅ Aplicada'
    WHEN rolled_back_at IS NOT NULL THEN '🔄 Rolled back'
    ELSE '❌ Failed'
  END AS status,
  started_at,
  finished_at,
  LEFT(logs, 50) AS logs_preview
FROM _prisma_migrations
ORDER BY started_at;

-- ============================================================================
-- STEP 1: Deletar migration fantasma que não existe localmente
-- ============================================================================

DELETE FROM _prisma_migrations
WHERE migration_name = '20251117130259_init';

-- Verificar se foi deletada
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Migration fantasma removida'
    ELSE '⚠️  Migration fantasma ainda existe'
  END AS resultado
FROM _prisma_migrations
WHERE migration_name = '20251117130259_init';

-- ============================================================================
-- STEP 2: Deletar entrada failed da migration add_audit_log
-- ============================================================================

DELETE FROM _prisma_migrations
WHERE migration_name = '20250119000000_add_audit_log'
AND finished_at IS NULL;

-- Verificar se foi deletada
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Entrada failed removida'
    ELSE '⚠️  Entrada failed ainda existe'
  END AS resultado
FROM _prisma_migrations
WHERE migration_name = '20250119000000_add_audit_log'
AND finished_at IS NULL;

-- ============================================================================
-- STEP 3: Marcar add_audit_log como aplicada (tabela já existe)
-- ============================================================================

-- ON CONFLICT garante idempotência - não duplica se já existir
INSERT INTO _prisma_migrations (
  migration_name,
  checksum,
  finished_at,
  started_at,
  applied_steps_count,
  logs
) VALUES (
  '20250119000000_add_audit_log',
  '00000000000000000000000000000000000000',
  NOW(),
  NOW(),
  1,
  'Manually marked as applied - table already exists in database'
) ON CONFLICT (migration_name) DO UPDATE SET
  finished_at = NOW(),
  logs = 'Manually marked as applied - table already exists in database';

-- Verificar se foi inserida/atualizada
SELECT
  CASE
    WHEN COUNT(*) > 0 AND finished_at IS NOT NULL THEN '✅ Migration audit_log marcada como aplicada'
    ELSE '❌ Falha ao marcar migration'
  END AS resultado
FROM _prisma_migrations
WHERE migration_name = '20250119000000_add_audit_log';

-- ============================================================================
-- STEP 4: Verificar se RLS já está ativo na tabela revisions
-- ============================================================================

SELECT
  schemaname,
  tablename,
  CASE
    WHEN rowsecurity = true THEN '✅ RLS JÁ ATIVO'
    ELSE '⚠️  RLS NÃO ATIVO'
  END AS rls_status
FROM pg_tables
WHERE tablename = 'revisions';

-- Listar policies existentes
SELECT
  '📋 Policies existentes em revisions:' AS info,
  policyname,
  cmd,
  CASE
    WHEN permissive = true THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END AS type
FROM pg_policies
WHERE tablename = 'revisions';

-- ============================================================================
-- STEP 5: Marcar enable_rls como aplicada SE RLS já estiver ativo
-- ============================================================================

-- INSTRUÇÕES MANUAIS (executar após verificar STEP 4):
--
-- Se STEP 4 mostrou "✅ RLS JÁ ATIVO" e policies existem, executar:
/*
INSERT INTO _prisma_migrations (
  migration_name,
  checksum,
  finished_at,
  started_at,
  applied_steps_count,
  logs
) VALUES (
  '20250119000001_enable_rls',
  '00000000000000000000000000000000000000',
  NOW(),
  NOW(),
  1,
  'Manually marked as applied - RLS already active in database'
) ON CONFLICT (migration_name) DO UPDATE SET
  finished_at = NOW(),
  logs = 'Manually marked as applied - RLS already active in database';
*/

-- Se STEP 4 mostrou "⚠️ RLS NÃO ATIVO", NÃO executar acima.
-- A migration será aplicada automaticamente no próximo deploy.

-- ============================================================================
-- STEP 6: Deletar migration add_deleted_at se existir
-- ============================================================================

DELETE FROM _prisma_migrations
WHERE migration_name LIKE '%add_deleted_at%';

-- Verificar se foi deletada
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Migration add_deleted_at removida (se existia)'
    ELSE '⚠️  Migration add_deleted_at ainda existe'
  END AS resultado
FROM _prisma_migrations
WHERE migration_name LIKE '%add_deleted_at%';

-- ============================================================================
-- VERIFICAÇÃO FINAL: Estado após limpeza
-- ============================================================================

SELECT
  '🎯 ESTADO FINAL DAS MIGRATIONS' AS info,
  migration_name,
  CASE
    WHEN finished_at IS NOT NULL THEN '✅ Aplicada'
    WHEN rolled_back_at IS NOT NULL THEN '🔄 Rolled back'
    ELSE '❌ Failed'
  END AS status,
  started_at,
  finished_at,
  LEFT(logs, 50) AS logs_preview
FROM _prisma_migrations
ORDER BY started_at;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
--
-- ✅ 20250119000000_add_audit_log    | Aplicada | Manually marked as applied
-- ✅ 20250119000001_enable_rls       | Aplicada | Manually marked as applied (SE RLS já ativo)
--    OU
-- ⏸️  20250119000001_enable_rls       | [não existe] | Será aplicada no próximo deploy
--
-- TOTAL: 1-2 migrations (dependendo do status do RLS)
--
-- ============================================================================

-- Exibir contagem final
SELECT
  COUNT(*) as total_migrations,
  COUNT(*) FILTER (WHERE finished_at IS NOT NULL) as aplicadas,
  COUNT(*) FILTER (WHERE finished_at IS NULL) as pendentes
FROM _prisma_migrations;
