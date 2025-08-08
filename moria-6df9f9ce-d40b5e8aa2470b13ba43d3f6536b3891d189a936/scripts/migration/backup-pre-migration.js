#!/usr/bin/env node

// ========================================
// BACKUP COMPLETO PRÉ-MIGRAÇÃO
// ========================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PreMigrationBackup {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = path.join(process.cwd(), `migration-backup-${this.timestamp}`);
  }

  async createFullBackup() {
    console.log('💾 Criando backup completo pré-migração...');
    
    try {
      // Criar diretório de backup
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Backup criado em: ${this.backupDir}`);

      // Lista de arquivos críticos para backup
      const criticalFiles = [
        // Backend
        { src: 'backend/prisma/database.db', desc: 'Banco de dados principal' },
        { src: 'backend/prisma/schema.prisma', desc: 'Schema do banco' },
        { src: 'backend/.env', desc: 'Environment do backend' },
        { src: 'backend/package.json', desc: 'Dependencies do backend' },
        { src: 'backend/src/server.js', desc: 'Servidor principal' },
        
        // Frontend
        { src: 'package.json', desc: 'Dependencies do frontend' },
        { src: 'vite.config.ts', desc: 'Configuração do Vite' },
        { src: 'tailwind.config.ts', desc: 'Configuração do Tailwind' },
        
        // Configurações
        { src: 'components.json', desc: 'Configuração de componentes' },
        { src: 'tsconfig.json', desc: 'Configuração TypeScript' }
      ];

      let backupCount = 0;
      let errors = [];

      // Fazer backup de arquivos críticos
      criticalFiles.forEach(file => {
        try {
          if (fs.existsSync(file.src)) {
            const destPath = path.join(this.backupDir, file.src.replace(/\//g, '-'));
            fs.copyFileSync(file.src, destPath);
            console.log(`  ✅ ${file.desc}: ${file.src}`);
            backupCount++;
          } else {
            console.log(`  ⚠️ Não encontrado: ${file.src}`);
          }
        } catch (error) {
          const errMsg = `Erro no backup de ${file.src}: ${error.message}`;
          console.error(`  ❌ ${errMsg}`);
          errors.push(errMsg);
        }
      });

      // Backup de diretórios importantes
      const directories = [
        { src: 'backend/src', dest: 'backend-src', desc: 'Código fonte do backend' },
        { src: 'src', dest: 'frontend-src', desc: 'Código fonte do frontend' },
        { src: 'backend/prisma/migrations', dest: 'migrations', desc: 'Migrations do banco' }
      ];

      directories.forEach(dir => {
        try {
          if (fs.existsSync(dir.src)) {
            const destPath = path.join(this.backupDir, dir.dest);
            this.copyDirectoryRecursive(dir.src, destPath);
            console.log(`  ✅ ${dir.desc}: ${dir.src}/`);
            backupCount++;
          }
        } catch (error) {
          const errMsg = `Erro no backup do diretório ${dir.src}: ${error.message}`;
          console.error(`  ❌ ${errMsg}`);
          errors.push(errMsg);
        }
      });

      // Criar arquivo de informações do backup
      const backupInfo = {
        timestamp: this.timestamp,
        backupDir: this.backupDir,
        filesBackedUp: backupCount,
        errors: errors,
        migration: 'AJUSTES_FINAIS - Sistema Robusto',
        notes: 'Backup automático antes da migração para sistema robusto single-tenant'
      };

      fs.writeFileSync(
        path.join(this.backupDir, 'backup-info.json'), 
        JSON.stringify(backupInfo, null, 2)
      );

      console.log(`\n✅ Backup completo finalizado:`);
      console.log(`  📁 Local: ${this.backupDir}`);
      console.log(`  📄 Arquivos: ${backupCount}`);
      console.log(`  ❌ Erros: ${errors.length}`);

      if (errors.length > 0) {
        console.log('\n⚠️ Erros encontrados:');
        errors.forEach(error => console.log(`    ${error}`));
      }

      return {
        success: errors.length === 0,
        backupDir: this.backupDir,
        timestamp: this.timestamp,
        errors: errors
      };

    } catch (error) {
      console.error(`❌ Falha crítica no backup: ${error.message}`);
      throw error;
    }
  }

  copyDirectoryRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        // Pular node_modules e outros diretórios desnecessários
        if (['node_modules', '.git', 'dist', 'build'].includes(item)) {
          return;
        }
        this.copyDirectoryRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  // Método para restaurar backup se necessário
  static async restoreFromBackup(backupDir) {
    console.log(`🔄 Restaurando backup de: ${backupDir}`);
    
    try {
      const backupInfoPath = path.join(backupDir, 'backup-info.json');
      if (!fs.existsSync(backupInfoPath)) {
        throw new Error('Arquivo de informações do backup não encontrado');
      }

      const backupInfo = JSON.parse(fs.readFileSync(backupInfoPath, 'utf8'));
      console.log(`📋 Backup de: ${backupInfo.timestamp}`);

      // Restaurar arquivos críticos
      const filesToRestore = [
        { backup: 'backend-prisma-database.db', restore: 'backend/prisma/database.db' },
        { backup: 'backend-.env', restore: 'backend/.env' },
        { backup: 'backend-src-server.js', restore: 'backend/src/server.js' },
        { backup: 'backend-prisma-schema.prisma', restore: 'backend/prisma/schema.prisma' }
      ];

      filesToRestore.forEach(file => {
        const backupPath = path.join(backupDir, file.backup);
        if (fs.existsSync(backupPath)) {
          // Criar diretório se não existir
          const restoreDir = path.dirname(file.restore);
          if (!fs.existsSync(restoreDir)) {
            fs.mkdirSync(restoreDir, { recursive: true });
          }
          
          fs.copyFileSync(backupPath, file.restore);
          console.log(`  ✅ Restaurado: ${file.restore}`);
        }
      });

      // Restaurar diretórios
      const dirsToRestore = [
        { backup: 'backend-src', restore: 'backend/src' },
        { backup: 'frontend-src', restore: 'src' },
        { backup: 'migrations', restore: 'backend/prisma/migrations' }
      ];

      dirsToRestore.forEach(dir => {
        const backupPath = path.join(backupDir, dir.backup);
        if (fs.existsSync(backupPath)) {
          // Remove diretório existente
          if (fs.existsSync(dir.restore)) {
            fs.rmSync(dir.restore, { recursive: true, force: true });
          }
          
          // Restaura do backup
          this.copyDirectoryRecursive(backupPath, dir.restore);
          console.log(`  ✅ Diretório restaurado: ${dir.restore}/`);
        }
      });

      console.log('✅ Restauração do backup concluída');
      return true;

    } catch (error) {
      console.error(`❌ Erro na restauração: ${error.message}`);
      throw error;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const backup = new PreMigrationBackup();
  
  backup.createFullBackup()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 BACKUP PRÉ-MIGRAÇÃO CONCLUÍDO COM SUCESSO!');
        console.log('📍 Próximos passos:');
        console.log('  1. Execute: node scripts/migration/migrate-to-robust.js');
        console.log('  2. Em caso de problema: node scripts/migration/backup-pre-migration.js --restore');
      } else {
        console.log('\n⚠️ Backup concluído com alguns erros. Verifique os logs acima.');
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 FALHA NO BACKUP:', error.message);
      console.error('🛑 Não é seguro prosseguir com a migração sem backup!');
      process.exit(1);
    });
}

module.exports = { PreMigrationBackup };