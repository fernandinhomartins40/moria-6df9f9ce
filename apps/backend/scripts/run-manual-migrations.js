#!/usr/bin/env node

/**
 * Script para executar migrations manuais (arquivos SQL)
 * Executa de forma segura e idempotente
 * Mantém registro de migrations já executadas para não repetir
 *
 * IMPORTANTE: Este script NÃO toca em volumes ou dados de usuário
 * Apenas executa alterações de schema (DDL)
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const MIGRATIONS_DIR = path.join(__dirname, '../prisma/manual-migrations');

async function runManualMigrations() {
  try {
    console.log('🔍 Verificando migrations manuais...');

    // Criar tabela de controle se não existir
    // Esta tabela rastreia quais migrations SQL já foram executadas
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS _manual_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW(),
        checksum VARCHAR(64)
      )
    `;
    console.log('✓ Tabela de controle _manual_migrations pronta');

    // Verificar se diretório de migrations existe
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('ℹ️  Diretório de migrations manuais não existe ainda');
      console.log(`   Crie em: ${MIGRATIONS_DIR}`);
      return;
    }

    // Ler arquivos SQL em ordem alfabética
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ordem alfabética: 001-xxx.sql, 002-xxx.sql, etc.

    if (files.length === 0) {
      console.log('ℹ️  Nenhuma migration manual encontrada');
      return;
    }

    console.log(`\n📋 Encontradas ${files.length} migration(s) manual(is):`);
    files.forEach(f => console.log(`   - ${f}`));
    console.log('');

    let executedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      const migrationName = file.replace('.sql', '');

      // Verificar se já foi executada
      const existing = await prisma.$queryRaw`
        SELECT * FROM _manual_migrations
        WHERE migration_name = ${migrationName}
      `;

      if (existing.length > 0) {
        console.log(`⏭️  Pulando (já executada): ${migrationName}`);
        skippedCount++;
        continue;
      }

      // Ler SQL
      const sqlPath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      console.log(`\n🔄 Executando: ${migrationName}`);
      console.log(`   Arquivo: ${file}`);

      try {
        // Executar SQL
        // IMPORTANTE: SQL deve ser DDL seguro (ALTER TABLE, CREATE INDEX, etc.)
        // NÃO deve conter comandos que alterem dados (DELETE, UPDATE em massa, etc.)
        await prisma.$executeRawUnsafe(sql);

        // Calcular checksum simples do conteúdo
        const checksum = Buffer.from(sql).toString('base64').substring(0, 64);

        // Marcar como executada
        await prisma.$executeRaw`
          INSERT INTO _manual_migrations (migration_name, checksum)
          VALUES (${migrationName}, ${checksum})
        `;

        console.log(`✅ Executada com sucesso: ${migrationName}`);
        executedCount++;

      } catch (error) {
        console.error(`\n❌ ERRO ao executar ${migrationName}:`);
        console.error(`   ${error.message}`);
        console.error(`\n⚠️  Migration falhou! Verifique o SQL e tente novamente.`);
        console.error(`   Arquivo: ${sqlPath}\n`);
        throw error; // Parar execução em caso de erro
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Resumo:');
    console.log(`   ✅ Executadas: ${executedCount}`);
    console.log(`   ⏭️  Puladas: ${skippedCount}`);
    console.log(`   📁 Total: ${files.length}`);
    console.log('='.repeat(60));

    if (executedCount > 0) {
      console.log('\n✅ Migrations manuais aplicadas com sucesso!');
    } else {
      console.log('\nℹ️  Nenhuma migration nova para aplicar');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal ao executar migrations manuais:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
console.log('');
console.log('='.repeat(60));
console.log('🔧 Sistema de Migrations Manuais - Moria Peças');
console.log('='.repeat(60));
console.log('');

runManualMigrations();
