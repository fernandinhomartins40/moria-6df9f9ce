// ============================================
// BACKUP SYSTEM - SQLite Single-Tenant
// ============================================

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurações
const DB_PATH = path.join(__dirname, '../prisma/prisma/database.db');
const BACKUP_DIR = path.join(__dirname, '../backups');
const BACKUP_ENABLED = process.env.BACKUP_ENABLED === 'true';
const BACKUP_INTERVAL_HOURS = parseInt(process.env.BACKUP_INTERVAL_HOURS) || 24;
const MAX_BACKUPS = 30; // Manter últimos 30 backups

/**
 * Criar backup do banco SQLite
 */
async function createBackup() {
  try {
    if (!BACKUP_ENABLED) {
      console.log('⚠️  Backup desabilitado via .env');
      return false;
    }

    // Verificar se arquivo do banco existe
    if (!fs.existsSync(DB_PATH)) {
      console.log('❌ Arquivo do banco não encontrado:', DB_PATH);
      return false;
    }

    // Garantir que diretório de backup existe
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('📁 Diretório de backup criado:', BACKUP_DIR);
    }

    // Gerar nome do backup com timestamp
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .substring(0, 19);
    
    const backupFileName = `backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // Copiar arquivo do banco
    fs.copyFileSync(DB_PATH, backupPath);

    // Verificar se backup foi criado corretamente
    const stats = fs.statSync(backupPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log('✅ Backup criado com sucesso!');
    console.log(`📂 Arquivo: ${backupFileName}`);
    console.log(`📊 Tamanho: ${sizeMB} MB`);
    console.log(`📅 Data: ${now.toLocaleString('pt-BR')}`);

    return backupPath;
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error.message);
    return false;
  }
}

/**
 * Limpar backups antigos (manter apenas MAX_BACKUPS)
 */
async function cleanOldBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return;
    }

    // Listar todos os arquivos de backup
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        stats: fs.statSync(path.join(BACKUP_DIR, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    // Se temos mais backups que o máximo permitido
    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Backup antigo removido: ${file.name}`);
      }

      console.log(`✅ Limpeza concluída. Mantidos ${MAX_BACKUPS} backups mais recentes.`);
    }
  } catch (error) {
    console.error('❌ Erro ao limpar backups antigos:', error.message);
  }
}

/**
 * Restaurar backup específico
 */
async function restoreBackup(backupFileName) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    // Verificar se backup existe
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Backup não encontrado:', backupFileName);
      return false;
    }

    // Fazer backup do banco atual antes de restaurar
    const currentBackupName = `pre-restore-${Date.now()}.db`;
    const currentBackupPath = path.join(BACKUP_DIR, currentBackupName);
    
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, currentBackupPath);
      console.log('💾 Backup do banco atual criado:', currentBackupName);
    }

    // Restaurar o backup
    fs.copyFileSync(backupPath, DB_PATH);
    
    console.log('✅ Backup restaurado com sucesso!');
    console.log(`📂 Arquivo restaurado: ${backupFileName}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error.message);
    return false;
  }
}

/**
 * Listar backups disponíveis
 */
async function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('📂 Nenhum backup encontrado');
      return [];
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          date: stats.mtime.toLocaleString('pt-BR')
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (files.length === 0) {
      console.log('📂 Nenhum backup encontrado');
      return [];
    }

    console.log('📋 Backups disponíveis:');
    console.log('----------------------------------------');
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   📊 Tamanho: ${file.size}`);
      console.log(`   📅 Data: ${file.date}`);
      console.log('');
    });

    return files;
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error.message);
    return [];
  }
}

/**
 * Iniciar backup automático (se habilitado)
 */
function startAutoBackup() {
  if (!BACKUP_ENABLED) {
    console.log('⚠️  Backup automático desabilitado');
    return null;
  }

  const intervalMs = BACKUP_INTERVAL_HOURS * 60 * 60 * 1000;
  
  console.log(`⏰ Backup automático habilitado a cada ${BACKUP_INTERVAL_HOURS}h`);
  
  // Fazer backup inicial
  setTimeout(async () => {
    console.log('🔄 Iniciando backup automático...');
    await createBackup();
    await cleanOldBackups();
  }, 5000); // 5 segundos após início

  // Configurar intervalo
  const intervalId = setInterval(async () => {
    console.log('🔄 Backup automático agendado executando...');
    await createBackup();
    await cleanOldBackups();
  }, intervalMs);

  return intervalId;
}

// ============================================
// CLI INTERFACE
// ============================================

async function main() {
  const command = process.argv[2];
  const param = process.argv[3];

  switch (command) {
    case 'create':
      await createBackup();
      await cleanOldBackups();
      break;
      
    case 'list':
      await listBackups();
      break;
      
    case 'restore':
      if (!param) {
        console.log('❌ Especifique o nome do backup para restaurar');
        console.log('Uso: node backup.js restore <nome-do-backup.db>');
        process.exit(1);
      }
      await restoreBackup(param);
      break;
      
    case 'clean':
      await cleanOldBackups();
      break;
      
    case 'auto':
      console.log('🚀 Iniciando sistema de backup automático...');
      startAutoBackup();
      // Manter processo ativo
      process.on('SIGINT', () => {
        console.log('\n🛑 Backup automático parado');
        process.exit(0);
      });
      break;
      
    default:
      console.log('🔧 Sistema de Backup SQLite - Moria Peças & Serviços');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log('  create  - Criar backup manual');
      console.log('  list    - Listar backups disponíveis');
      console.log('  restore <arquivo> - Restaurar backup específico');
      console.log('  clean   - Limpar backups antigos');
      console.log('  auto    - Iniciar backup automático');
      console.log('');
      console.log('Exemplos:');
      console.log('  node backup.js create');
      console.log('  node backup.js list');
      console.log('  node backup.js restore backup-2025-08-07T22-30-00.db');
      break;
  }
}

// ============================================
// EXPORTS e EXECUÇÃO
// ============================================

// Se executado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  cleanOldBackups,
  startAutoBackup
};