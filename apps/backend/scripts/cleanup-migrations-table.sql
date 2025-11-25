-- ============================================================================
-- Script de Limpeza da Tabela _prisma_migrations
-- ============================================================================
--
-- OBJETIVO: Resetar tabela _prisma_migrations para refletir estado real
--
-- QUANDO EXECUTAR: Antes do próximo deploy
-- COMO EXECUTAR:
--   1. SSH no servidor: ssh root@moriapecas.com.br
--   2. Conectar ao banco: docker exec -it moria-postgres psql -U moria -d moria
--   3. Copiar e colar este script
--
-- ============================================================================

-- Exibir estado atual
SELECT
  '📊 ESTADO ATUAL' AS info,
  migration_name,
  CASE
    WHEN finished_at IS NOT NULL THEN '✅ Aplicada'
    WHEN rolled_back_at IS NOT NULL THEN '🔄 Rolled back'
    ELSE '❌ Failed'
  END AS status,
  started_at
FROM _prisma_migrations
ORDER BY started_at;

-- ============================================================================
-- STEP 1: Limpar TODAS as entradas (vamos recomeçar limpo)
-- ============================================================================

DELETE FROM _prisma_migrations;

-- Verificar limpeza
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Tabela limpa com sucesso'
    ELSE '⚠️  Ainda existem entradas'
  END AS resultado
FROM _prisma_migrations;

-- ============================================================================
-- STEP 2: Marcar migration init como aplicada
-- ============================================================================
-- A migration init (fantasma) criou todas as 21 tabelas
-- Precisamos marcar ela como aplicada para o Prisma não tentar recriar tudo

INSERT INTO _prisma_migrations (
  id,
  checksum,
  finished_at,
  migration_name,
  logs,
  rolled_back_at,
  started_at,
  applied_steps_count
) VALUES (
  '20251117130259-init',
  '00000000000000000000000000000000000000',
  '2025-11-17 13:09:06.453917+00',
  '20251117130259_init',
  'Initial schema - all 21 tables created. Manually marked as applied.',
  NULL,
  '2025-11-17 13:09:06.453917+00',
  1
);

-- Verificar inserção
SELECT
  CASE
    WHEN COUNT(*) = 1 THEN '✅ Migration init marcada como aplicada'
    ELSE '❌ Falha ao marcar migration init'
  END AS resultado
FROM _prisma_migrations
WHERE migration_name = '20251117130259_init';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

SELECT
  '🎯 ESTADO FINAL' AS info,
  migration_name,
  CASE
    WHEN finished_at IS NOT NULL THEN '✅ Aplicada'
    ELSE '❌ Pendente'
  END AS status,
  started_at,
  LEFT(logs, 60) AS logs_preview
FROM _prisma_migrations
ORDER BY started_at;

-- Contar migrations
SELECT
  COUNT(*) as total_migrations,
  COUNT(*) FILTER (WHERE finished_at IS NOT NULL) as aplicadas,
  COUNT(*) FILTER (WHERE finished_at IS NULL) as pendentes
FROM _prisma_migrations;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
--
-- Total de migrations: 1
-- - 20251117130259_init | Aplicada
--
-- Após o próximo deploy, será adicionada:
-- - 20251125000000_fix_cascade_and_rls | Aplicada
--
-- ============================================================================
