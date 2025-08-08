#!/usr/bin/env node
// ========================================
// BACKUP COMPLETO PRÉ-MIGRAÇÃO
// ========================================
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PreMigrationBackup {
  constructor() {
    this.migrationId = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = `migration-backup-${this.migrationId}`;
    this.backupPath = path.join(process.cwd(), this.backupDir);
  }

  async createBackup() {
    console.log('💾 Iniciando backup completo pré-migração...');
    
    try {
      // Criar diretório de backup
      fs.mkdirSync(this.backupPath, { recursive: true });
      console.log(`📁 Diretório de backup criado: ${this.backupDir}`);

      // Lista de arquivos críticos para backup
      const criticalFiles = [
        'backend/prisma/database.db',
        'backend/.env',
        'backend/package.json',
        'backend/src/server.js',
        'backend/prisma/schema.prisma',
        'package.json',
        'src/services/api.js',
        'src/hooks/useProducts.js',
        'src/hooks/useServices.js',
        'src/hooks/usePromotions.js'
      ];

      let backedUpFiles = 0;

      criticalFiles.forEach(file => {
        const sourcePath = path.join(process.cwd(), file);
        if (fs.existsSync(sourcePath)) {
          const fileName = file.replace(/[\/\\]/g, '-');
          const destPath = path.join(this.backupPath, fileName);
          
          try {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`  ✅ Backup: ${file}`);
            backedUpFiles++;
          } catch (error) {
            console.log(`  ⚠️ Não foi possível fazer backup de ${file}: ${error.message}`);
          }
        } else {
          console.log(`  ⚠️ Arquivo não encontrado: ${file}`);
        }
      });

      // Backup de diretórios inteiros (seletivo)
      const criticalDirs = [
        { source: 'backend/src', dest: 'backend-src-backup' },
        { source: 'src/hooks', dest: 'frontend-hooks-backup' },
        { source: 'src/services', dest: 'frontend-services-backup' }
      ];

      criticalDirs.forEach(dir => {
        const sourcePath = path.join(process.cwd(), dir.source);
        if (fs.existsSync(sourcePath)) {
          const destPath = path.join(this.backupPath, dir.dest);
          
          try {
            this.copyDirectoryRecursive(sourcePath, destPath);
            console.log(`  ✅ Backup diretório: ${dir.source}`);
            backedUpFiles++;
          } catch (error) {
            console.log(`  ⚠️ Não foi possível fazer backup do diretório ${dir.source}: ${error.message}`);
          }
        }
      });

      // Criar resumo do backup
      const backupSummary = {
        migrationId: this.migrationId,
        timestamp: new Date().toISOString(),
        backupPath: this.backupPath,
        filesBackedUp: backedUpFiles,
        criticalFiles: criticalFiles.filter(file => fs.existsSync(path.join(process.cwd(), file))),
        notes: 'Backup criado antes da migração para sistema robusto'
      };

      fs.writeFileSync(
        path.join(this.backupPath, 'backup-summary.json'),
        JSON.stringify(backupSummary, null, 2)
      );

      console.log('✅ Backup completo finalizado!');
      console.log(`📊 ${backedUpFiles} arquivos/diretórios copiados`);
      console.log(`📁 Localização: ${this.backupDir}`);
      console.log(`🆔 Migration ID: ${this.migrationId}`);

      return {
        success: true,
        migrationId: this.migrationId,
        backupPath: this.backupPath,
        filesBackedUp: backedUpFiles
      };

    } catch (error) {
      console.error(`❌ Erro no backup: ${error.message}`);
      throw error;
    }
  }

  copyDirectoryRecursive(source, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(source);
    
    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const destPath = path.join(dest, file);
      
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        this.copyDirectoryRecursive(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
  }
}

// Executar backup se chamado diretamente
if (require.main === module) {
  const backup = new PreMigrationBackup();
  
  backup.createBackup()
    .then((result) => {
      console.log('\n🎉 BACKUP PRÉ-MIGRAÇÃO CONCLUÍDO!');
      console.log('📋 Próximos passos:');
      console.log('  1. Execute o script de migração principal');
      console.log('  2. Se houver problemas, use o rollback com este backup');
      console.log(`  3. Backup salvo em: ${result.backupPath}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 BACKUP FALHOU:', error.message);
      console.error('⚠️ NÃO prossiga com a migração sem backup!');
      process.exit(1);
    });
}

module.exports = { PreMigrationBackup };