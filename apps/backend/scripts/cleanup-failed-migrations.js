#!/usr/bin/env node

/**
 * Script para limpar migrations failed da tabela _prisma_migrations
 * Executa de forma segura e idempotente
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupFailedMigrations() {
  try {
    console.log('🔍 Verificando migrations failed...');

    // Consultar migrations failed
    const failedMigrations = await prisma.$queryRaw`
      SELECT migration_name, started_at, finished_at, logs
      FROM _prisma_migrations
      WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL
      ORDER BY started_at DESC
    `;

    if (failedMigrations.length === 0) {
      console.log('✅ Nenhuma migration failed encontrada');
      return;
    }

    console.log(`\n⚠️  Encontradas ${failedMigrations.length} migrations failed:`);
    failedMigrations.forEach(m => {
      console.log(`   - ${m.migration_name} (iniciada em ${m.started_at})`);
    });

    // Deletar migrations failed específicas que estão bloqueando
    const migrationsToDelelete = [
      '20250119000000_add_audit_log',
      '20250119000001_enable_rls'
    ];

    console.log('\n🗑️  Removendo migrations failed...');

    for (const migrationName of migrationsToDelelete) {
      const result = await prisma.$executeRaw`
        DELETE FROM _prisma_migrations
        WHERE migration_name = ${migrationName}
        AND finished_at IS NULL
      `;

      if (result > 0) {
        console.log(`   ✓ Removida: ${migrationName}`);
      }
    }

    console.log('\n✅ Limpeza concluída com sucesso');

  } catch (error) {
    console.error('❌ Erro ao limpar migrations failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupFailedMigrations();
