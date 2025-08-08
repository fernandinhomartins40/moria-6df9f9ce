# Artefato 6: Migração para Sistema Robusto Single-Tenant

## Contexto
Já tenho uma aplicação que foi criada usando os **artefatos antigos** (menos robustos), e agora preciso **migrar e reorganizar** toda a aplicação para usar os **novos artefatos robustos** (Artefatos 1-5). Esta migração deve garantir que tudo funcione perfeitamente após a atualização, corrigindo problemas conhecidos e aplicando todas as melhorias propostas.

## Objetivos da Migração
- **Migrar aplicação existente** para arquitetura robusta
- **Corrigir problemas conhecidos** (APIs vazias, deploy sem validação, etc.)
- **Aplicar todas as melhorias** dos novos artefatos
- **Preservar dados existentes** durante a migração
- **Validar funcionamento completo** após migração
- **Garantir rollback seguro** se algo der errado

## Análise da Aplicação Atual

### 1. Auditoria Completa da Aplicação Existente

**Primeiro, preciso que você analise completamente:**

#### **Estrutura Atual:**
- Examine TODA a estrutura de arquivos do projeto
- Identifique quais artefatos antigos foram aplicados
- Mapeie diferenças entre estrutura atual vs nova arquitetura
- Liste arquivos que precisam ser criados, modificados ou removidos

#### **Backend Atual:**
- Analise server.js e identifique melhorias necessárias
- Verifique se há validação de environment
- Confirme se logs estruturados existem
- Identifique se health checks são completos
- Verifique sistema de tratamento de erros

#### **Frontend Atual:**
- Analise services e hooks existentes
- Verifique se há retry automático
- Confirme tratamento de estados vazios
- Identifique se há sistema de debug
- Analise componentes de UI para melhorias

#### **Banco de Dados Atual:**
- Examine schema atual do Prisma
- Identifique campos faltantes (is_public, status, etc.)
- Verifique se há dados que precisam migração
- Confirme se há scripts de backup
- Analise se dados estão marcados como públicos

#### **Deploy Atual:**
- Verifique se há scripts de deploy
- Confirme se há validação pré-deploy
- Identifique se há sistema de rollback
- Analise logs de deploy (se existirem)

## Processo de Migração Segura

### 2. Backup Completo Pré-Migração

**Criar backup de segurança de tudo:**
```bash
# Script de backup completo
#!/bin/bash
BACKUP_DIR="migration-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup do banco
cp backend/prisma/database.db "$BACKUP_DIR/" 2>/dev/null || echo "Banco não encontrado"

# Backup de configurações
cp backend/.env "$BACKUP_DIR/" 2>/dev/null || echo ".env não encontrado"
cp backend/package.json "$BACKUP_DIR/package.json.backup"
cp frontend/package.json "$BACKUP_DIR/package-frontend.json.backup"

# Backup de arquivos críticos
cp -r backend/src "$BACKUP_DIR/backend-src/" 2>/dev/null || echo "Backend src não encontrado"
cp -r frontend/src "$BACKUP_DIR/frontend-src/" 2>/dev/null || echo "Frontend src não encontrado"

# Backup do schema
cp backend/prisma/schema.prisma "$BACKUP_DIR/" 2>/dev/null || echo "Schema não encontrado"

echo "✅ Backup completo criado em: $BACKUP_DIR"
```

### 3. Migração do Backend (Artefato 1 Robusto)

**Implementar todas as melhorias do backend:**

#### **Validação de Environment:**
- Criar `backend/src/config/environment.js` com validações obrigatórias
- Modificar server.js para usar validação antes de qualquer coisa
- Criar .env.example se não existir
- Validar todas as variáveis necessárias

#### **Sistema de Logs:**
- Criar `backend/src/config/logger.js` com Winston
- Substituir todos os console.log por logger estruturado
- Configurar rotação de logs
- Criar diretório logs/ se não existir

#### **Health Checks Completos:**
- Criar `backend/src/routes/health.js` robusto
- Implementar verificações de banco, memória, disco
- Adicionar endpoints de diagnóstico
- Integrar com sistema de logs

#### **Tratamento de Erros:**
- Criar `backend/src/middleware/errorHandler.js`
- Implementar captura global de erros
- Configurar logs de erro estruturados
- Adicionar responses user-friendly

### 4. Migração da Integração Frontend-Backend (Artefato 2 Robusto)

**Aplicar melhorias na comunicação:**

#### **API Client Robusto:**
- Criar `frontend/src/services/api/client.js` com retry automático
- Implementar circuit breaker
- Adicionar timeout e error handling
- Configurar logs estruturados no frontend

#### **Hooks Robustos:**
- Migrar hooks existentes para versões robustas
- Adicionar tratamento de estados vazios
- Implementar cache inteligente
- Adicionar retry manual e automático

#### **Componentes de Estado:**
- Criar componentes LoadingState, ErrorState, EmptyState
- Substituir estados básicos por versões informativas
- Adicionar ações de retry e fallbacks
- Implementar estados de debug

#### **Services Robustos:**
- Migrar services existentes para versões com cache
- Adicionar validação de entrada
- Implementar transformação de dados
- Configurar logs de debug

### 5. Migração do Banco de Dados (Artefato 3 Robusto)

**Aplicar schema robusto e migrar dados:**

#### **Schema Completo:**
- Atualizar schema.prisma com todos os campos necessários
- Adicionar campos de controle (is_public, status, is_deleted)
- Implementar indexes para performance
- Configurar relacionamentos adequados

#### **Migração de Dados Legacy:**
- Executar script de migração para dados existentes
- Marcar dados como públicos onde apropriado
- Popular campos novos com valores padrão
- Validar integridade após migração

#### **Scripts de Operação:**
- Criar scripts de backup automático
- Implementar validação de dados
- Configurar seeds para desenvolvimento
- Adicionar scripts de correção

### 6. Migração do Sistema de Deploy (Artefato 4 Robusto)

**Implementar deploy seguro:**

#### **Scripts de Deploy:**
- Criar checklist pré-deploy obrigatório
- Implementar validação pós-deploy
- Configurar sistema de rollback
- Adicionar logs de deploy estruturados

#### **Validação:**
- Implementar health checks end-to-end
- Validar APIs públicas funcionando
- Verificar dados disponíveis
- Confirmar frontend servindo corretamente

### 7. Migração das Páginas Públicas (Artefato 5 Robusto)

**Implementar APIs públicas seguras:**

#### **APIs Públicas:**
- Criar controllers públicos seguros
- Implementar filtros de dados sensíveis
- Configurar cache para performance
- Adicionar rate limiting específico

#### **Validação de Dados Públicos:**
- Verificar se dados estão marcados como públicos
- Implementar correção automática se necessário
- Validar que APIs não retornam vazias
- Configurar logs de acesso público

## Script Principal de Migração

### 8. Migração Automatizada

**Arquivo:** `scripts/migration/migrate-to-robust.js`

```javascript
// Script principal de migração
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RobustMigration {
  constructor() {
    this.migrationId = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = `migration-backup-${this.migrationId}`;
    this.logFile = `migration-log-${this.migrationId}.log`;
    this.rollbackInfo = {};
  }

  async runMigration() {
    console.log(`🚀 Iniciando migração para sistema robusto: ${this.migrationId}`);

    try {
      // 1. Análise da aplicação atual
      await this.analyzeCurrentApplication();

      // 2. Backup completo
      await this.createFullBackup();

      // 3. Migração do backend
      await this.migrateBackend();

      // 4. Migração do frontend
      await this.migrateFrontend();

      // 5. Migração do banco
      await this.migrateDatabase();

      // 6. Configurar deploy robusto
      await this.setupRobustDeploy();

      // 7. Configurar páginas públicas
      await this.setupPublicPages();

      // 8. Validação final
      await this.validateMigration();

      console.log('✅ Migração concluída com sucesso!');
      return { success: true, migrationId: this.migrationId };

    } catch (error) {
      console.error(`❌ Migração falhou: ${error.message}`);
      await this.performRollback();
      throw error;
    }
  }

  async analyzeCurrentApplication() {
    console.log('🔍 Analisando aplicação atual...');

    const analysis = {
      structure: {},
      backend: {},
      frontend: {},
      database: {},
      deploy: {}
    };

    // Análise da estrutura
    analysis.structure.hasBackend = fs.existsSync('backend');
    analysis.structure.hasFrontend = fs.existsSync('frontend');
    analysis.structure.hasPackageJson = fs.existsSync('package.json');

    // Análise do backend
    if (analysis.structure.hasBackend) {
      analysis.backend.hasServer = fs.existsSync('backend/src/server.js');
      analysis.backend.hasEnv = fs.existsSync('backend/.env');
      analysis.backend.hasLogger = fs.existsSync('backend/src/config/logger.js');
      analysis.backend.hasHealthCheck = fs.existsSync('backend/src/routes/health.js');
    }

    // Análise do frontend
    if (analysis.structure.hasFrontend) {
      analysis.frontend.hasApiClient = fs.existsSync('frontend/src/services/api');
      analysis.frontend.hasHooks = fs.existsSync('frontend/src/hooks');
      analysis.frontend.hasServices = fs.existsSync('frontend/src/services');
    }

    // Análise do banco
    analysis.database.hasSchema = fs.existsSync('backend/prisma/schema.prisma');
    analysis.database.hasDatabase = fs.existsSync('backend/prisma/database.db');
    analysis.database.hasMigrations = fs.existsSync('backend/prisma/migrations');

    // Análise do deploy
    analysis.deploy.hasScripts = fs.existsSync('scripts');
    analysis.deploy.hasHealthCheck = fs.existsSync('scripts/health-check.js');

    console.log('📊 Análise concluída:', JSON.stringify(analysis, null, 2));
    this.currentAnalysis = analysis;
  }

  async createFullBackup() {
    console.log('💾 Criando backup completo...');

    fs.mkdirSync(this.backupDir, { recursive: true });

    // Backup seletivo baseado na análise
    const backupTasks = [];

    if (this.currentAnalysis.database.hasDatabase) {
      backupTasks.push({
        source: 'backend/prisma/database.db',
        dest: `${this.backupDir}/database.db`
      });
    }

    if (this.currentAnalysis.backend.hasEnv) {
      backupTasks.push({
        source: 'backend/.env',
        dest: `${this.backupDir}/.env`
      });
    }

    if (this.currentAnalysis.database.hasSchema) {
      backupTasks.push({
        source: 'backend/prisma/schema.prisma',
        dest: `${this.backupDir}/schema.prisma`
      });
    }

    // Backup de package.json files
    ['package.json', 'backend/package.json', 'frontend/package.json'].forEach(file => {
      if (fs.existsSync(file)) {
        backupTasks.push({
          source: file,
          dest: `${this.backupDir}/${file.replace('/', '-')}`
        });
      }
    });

    // Executar backups
    backupTasks.forEach(task => {
      try {
        fs.copyFileSync(task.source, task.dest);
        console.log(`  ✅ Backup: ${task.source} → ${task.dest}`);
      } catch (error) {
        console.log(`  ⚠️ Não foi possível fazer backup de ${task.source}: ${error.message}`);
      }
    });

    this.rollbackInfo.backupDir = this.backupDir;
    console.log(`✅ Backup completo criado em: ${this.backupDir}`);
  }

  async migrateBackend() {
    console.log('🔧 Migrando backend para versão robusta...');

    // Criar estrutura de diretórios robusta
    const dirs = [
      'backend/src/config',
      'backend/src/routes',
      'backend/src/middleware',
      'backend/src/controllers',
      'backend/src/services',
      'backend/src/validators',
      'backend/logs',
      'scripts/deploy',
      'scripts/database'
    ];

    dirs.forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  📁 Criado diretório: ${dir}`);
    });

    // Migrar server.js se necessário
    if (fs.existsSync('backend/src/server.js')) {
      await this.upgradeServerJs();
    }

    // Criar arquivos robustos que não existem
    await this.createRobustBackendFiles();

    console.log('✅ Backend migrado para versão robusta');
  }

  async upgradeServerJs() {
    console.log('  🔄 Atualizando server.js...');

    const currentServer = fs.readFileSync('backend/src/server.js', 'utf8');
    
    // Verificar se já tem validação de environment
    if (!currentServer.includes('environment.js') && !currentServer.includes('validateEnvironment')) {
      console.log('  ➕ Adicionando validação de environment ao server.js');
      
      // Backup do server atual
      fs.writeFileSync(`${this.backupDir}/server.js.backup`, currentServer);
      
      // Criar nova versão robusta
      const robustServer = this.generateRobustServerJs(currentServer);
      fs.writeFileSync('backend/src/server.js', robustServer);
    }
  }

  generateRobustServerJs(currentContent) {
    return `// Servidor robusto - migrado automaticamente
const express = require('express');
const path = require('path');

// CRÍTICO: Validação de environment ANTES de tudo
const config = require('./config/environment');
const logger = require('./config/logger');

const app = express();

// Middleware de logging
app.use(require('./middleware/logger'));

// Middleware de segurança
app.use(require('helmet')());
app.use(require('cors')());

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do React
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Rotas da API
app.use('/api/health', require('./routes/health'));
app.use('/api/diagnostics', require('./routes/diagnostics'));
app.use('/api/public', require('./routes/public'));
app.use('/api', require('./routes/api'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Error handler robusto
app.use(require('./middleware/errorHandler'));

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Recebido sinal de shutdown, fechando servidor...');
  server.close(() => {
    logger.info('Servidor fechado com sucesso');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Startup
const server = app.listen(config.port, () => {
  logger.info(\`🚀 Servidor robusto rodando na porta \${config.port}\`);
  logger.info(\`📍 Environment: \${config.nodeEnv}\`);
  logger.info(\`🗄️ Database: \${config.databaseUrl ? 'Configurado' : 'NÃO CONFIGURADO'}\`);
});

module.exports = { app, server };
`;
  }

  async createRobustBackendFiles() {
    console.log('  📝 Criando arquivos robustos do backend...');

    // Lista de arquivos robustos essenciais
    const robustFiles = [
      {
        path: 'backend/src/config/environment.js',
        content: this.generateEnvironmentValidator()
      },
      {
        path: 'backend/src/config/logger.js',
        content: this.generateLoggerConfig()
      },
      {
        path: 'backend/src/middleware/errorHandler.js',
        content: this.generateErrorHandler()
      },
      {
        path: 'backend/src/routes/health.js',
        content: this.generateHealthRoute()
      },
      {
        path: 'backend/src/routes/diagnostics.js',
        content: this.generateDiagnosticsRoute()
      }
    ];

    robustFiles.forEach(file => {
      if (!fs.existsSync(file.path)) {
        fs.writeFileSync(file.path, file.content);
        console.log(`    ✅ Criado: ${file.path}`);
      } else {
        console.log(`    ⚠️ Arquivo já existe: ${file.path}`);
      }
    });
  }

  async migrateFrontend() {
    console.log('🎨 Migrando frontend para versão robusta...');

    // Criar estrutura robusta
    const dirs = [
      'frontend/src/services/api',
      'frontend/src/services/monitoring',
      'frontend/src/hooks',
      'frontend/src/components/common',
      'frontend/src/components/public',
      'frontend/src/utils'
    ];

    dirs.forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  📁 Criado: ${dir}`);
    });

    // Criar arquivos robustos do frontend
    await this.createRobustFrontendFiles();

    console.log('✅ Frontend migrado para versão robusta');
  }

  async createRobustFrontendFiles() {
    console.log('  📝 Criando arquivos robustos do frontend...');

    const frontendFiles = [
      {
        path: 'frontend/src/services/api/client.js',
        content: this.generateRobustApiClient()
      },
      {
        path: 'frontend/src/hooks/useApi.js',
        content: this.generateRobustUseApiHook()
      },
      {
        path: 'frontend/src/components/common/LoadingState.js',
        content: this.generateLoadingComponent()
      },
      {
        path: 'frontend/src/components/common/ErrorState.js',
        content: this.generateErrorComponent()
      },
      {
        path: 'frontend/src/components/common/EmptyState.js',
        content: this.generateEmptyComponent()
      }
    ];

    frontendFiles.forEach(file => {
      if (!fs.existsSync(file.path)) {
        fs.writeFileSync(file.path, file.content);
        console.log(`    ✅ Criado: ${file.path}`);
      }
    });
  }

  async migrateDatabase() {
    console.log('🗄️ Migrando banco para versão robusta...');

    try {
      // Verificar schema atual
      if (fs.existsSync('backend/prisma/schema.prisma')) {
        const currentSchema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');
        
        // Verificar se schema já tem campos robustos
        const hasRobustFields = currentSchema.includes('is_public') && 
                               currentSchema.includes('status') &&
                               currentSchema.includes('is_deleted');

        if (!hasRobustFields) {
          console.log('  🔄 Atualizando schema para versão robusta...');
          
          // Backup do schema atual
          fs.writeFileSync(`${this.backupDir}/schema-backup.prisma`, currentSchema);
          
          // Aplicar schema robusto
          const robustSchema = this.generateRobustSchema(currentSchema);
          fs.writeFileSync('backend/prisma/schema.prisma', robustSchema);
          
          // Executar migration
          console.log('  📊 Executando migration...');
          execSync('cd backend && npx prisma db push', { stdio: 'inherit' });
          
          // Migrar dados existentes
          console.log('  🔄 Migrando dados existentes...');
          await this.migrateExistingData();
        } else {
          console.log('  ✅ Schema já está robusto');
        }
      }

      // Criar scripts de banco robustos
      await this.createDatabaseScripts();

    } catch (error) {
      console.error(`❌ Erro na migração do banco: ${error.message}`);
      throw error;
    }

    console.log('✅ Banco migrado para versão robusta');
  }

  async migrateExistingData() {
    console.log('  🔄 Migrando dados legacy...');

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Migrar itens existentes
      const itemsToUpdate = await prisma.item.findMany({
        where: {
          OR: [
            { is_public: null },
            { status: null },
            { is_deleted: null }
          ]
        }
      });

      console.log(`    📦 Migrando ${itemsToUpdate.length} itens...`);

      for (const item of itemsToUpdate) {
        const updates = {};
        
        if (item.is_public === null) updates.is_public = true;  // Marcar como público
        if (item.status === null) updates.status = 'published'; // Marcar como publicado
        if (item.is_deleted === null) updates.is_deleted = false;

        if (Object.keys(updates).length > 0) {
          await prisma.item.update({
            where: { id: item.id },
            data: updates
          });
        }
      }

      // Verificar dados públicos após migração
      const publicItemsCount = await prisma.item.count({
        where: {
          is_public: true,
          status: 'published',
          is_deleted: false
        }
      });

      console.log(`    🌐 ${publicItemsCount} itens agora estão públicos`);

      if (publicItemsCount === 0 && itemsToUpdate.length > 0) {
        console.warn('    ⚠️ ATENÇÃO: Nenhum item público após migração!');
      }

      await prisma.$disconnect();

    } catch (error) {
      console.error(`    ❌ Erro ao migrar dados: ${error.message}`);
      throw error;
    }
  }

  async setupRobustDeploy() {
    console.log('🚀 Configurando deploy robusto...');

    // Criar scripts de deploy
    const deployScripts = [
      {
        path: 'scripts/deploy/pre-deploy.js',
        content: this.generatePreDeployScript()
      },
      {
        path: 'scripts/deploy/post-deploy.js',
        content: this.generatePostDeployScript()
      },
      {
        path: 'scripts/deploy/rollback.js',
        content: this.generateRollbackScript()
      }
    ];

    deployScripts.forEach(script => {
      fs.writeFileSync(script.path, script.content);
      console.log(`  ✅ Criado: ${script.path}`);
    });

    // Atualizar package.json com scripts robustos
    await this.updatePackageJsonScripts();

    console.log('✅ Deploy robusto configurado');
  }

  async setupPublicPages() {
    console.log('🌐 Configurando páginas públicas robustas...');

    // Criar controllers públicos
    const publicDirs = [
      'backend/src/routes/public',
      'backend/src/controllers/public',
      'backend/src/services/public',
      'frontend/src/services/public',
      'frontend/src/hooks/public',
      'frontend/src/components/public'
    ];

    publicDirs.forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });

    // Criar arquivos de páginas públicas
    const publicFiles = [
      {
        path: 'backend/src/routes/public/index.js',
        content: this.generatePublicRoutes()
      },
      {
        path: 'backend/src/controllers/public/itemController.js',
        content: this.generatePublicController()
      },
      {
        path: 'frontend/src/services/public/publicApiService.js',
        content: this.generatePublicApiService()
      }
    ];

    publicFiles.forEach(file => {
      fs.writeFileSync(file.path, file.content);
      console.log(`  ✅ Criado: ${file.path}`);
    });

    console.log('✅ Páginas públicas configuradas');
  }

  async validateMigration() {
    console.log('✅ Validando migração...');

    const validations = [];

    // Validar estrutura de arquivos
    const requiredFiles = [
      'backend/src/config/environment.js',
      'backend/src/config/logger.js',
      'backend/src/middleware/errorHandler.js',
      'backend/src/routes/health.js',
      'scripts/deploy/pre-deploy.js'
    ];

    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        validations.push(`✅ ${file} criado`);
      } else {
        validations.push(`❌ ${file} faltando`);
      }
    });

    // Validar banco de dados
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const publicItemsCount = await prisma.item.count({
        where: { is_public: true }
      });
      
      if (publicItemsCount > 0) {
        validations.push(`✅ ${publicItemsCount} itens públicos disponíveis`);
      } else {
        validations.push(`⚠️ Nenhum item público encontrado`);
      }

      await prisma.$disconnect();
    } catch (error) {
      validations.push(`❌ Erro ao validar banco: ${error.message}`);
    }

    // Mostrar resultados
    console.log('\n📊 RESULTADOS DA VALIDAÇÃO:');
    validations.forEach(validation => console.log(`  ${validation}`));

    const hasErrors = validations.some(v => v.includes('❌'));
    if (hasErrors) {
      throw new Error('Migração falhou na validação');
    }

    console.log('\n✅ Migração validada com sucesso!');
  }

  async performRollback() {
    console.log('🔄 Executando rollback da migração...');

    try {
      // Restaurar arquivos do backup
      if (fs.existsSync(`${this.backupDir}/database.db`)) {
        fs.copyFileSync(`${this.backupDir}/database.db`, 'backend/prisma/database.db');
        console.log('  ✅ Banco restaurado');
      }

      if (fs.existsSync(`${this.backupDir}/.env`)) {
        fs.copyFileSync(`${this.backupDir}/.env`, 'backend/.env');
        console.log('  ✅ .env restaurado');
      }

      if (fs.existsSync(`${this.backupDir}/server.js.backup`)) {
        fs.copyFileSync(`${this.backupDir}/server.js.backup`, 'backend/src/server.js');
        console.log('  ✅ server.js restaurado');
      }

      console.log('✅ Rollback concluído');

    } catch (error) {
      console.error(`❌ Erro no rollback: ${error.message}`);
    }
  }

  // Métodos para gerar código dos arquivos robustos
  generateEnvironmentValidator() {
    return `// Validação robusta de environment
require('dotenv').config();

const requiredEnvVars = [
  { name: 'DATABASE_URL', type: 'string', required: true },
  { name: 'PORT', type: 'number', default: 3080 },
  { name: 'NODE_ENV', type: 'string', default: 'development' }
];

const validateEnvironment = () => {
  const errors = [];
  const config = {};
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar.name];
    
    if (envVar.required && !value) {
      errors.push(\`❌ ERRO CRÍTICO: \${envVar.name} é obrigatória mas não foi encontrada\`);
      return;
    }
    
    config[envVar.name.toLowerCase().replace('_', '')] = value || envVar.default;
  });
  
  if (errors.length > 0) {
    console.error('🚨 FALHA NA VALIDAÇÃO DE ENVIRONMENT:');
    errors.forEach(error => console.error(error));
    console.error('📋 Verifique o arquivo .env e tente novamente');
    process.exit(1);
  }
  
  return config;
};

module.exports = validateEnvironment();
`;
  }

  generateLoggerConfig() {
    return `// Sistema de logs robusto
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
`;
  }

  generateErrorHandler() {
    return `// Error handler robusto
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
`;
  }

  generateHealthRoute() {
    return `// Health check robusto
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  };

  try {
    // Verificar banco se disponível
    if (global.prisma) {
      await global.prisma.$queryRaw\`SELECT 1\`;
      healthData.database = 'connected';
    }

    res.json(healthData);
  } catch (error) {
    healthData.status = 'error';
    healthData.error = error.message;
    res.status(503).json(healthData);
  }
});

module.exports = router;
`;
  }

  generateRobustApiClient() {
    return `// API Client robusto
class RobustApiClient {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3080/api'
      : '/api';
    this.retryAttempts = 3;
  }

  async request(method, endpoint, data = null) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}\`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === this.retryAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  get(endpoint) { return this.request('GET', endpoint); }
  post(endpoint, data) { return this.request('POST', endpoint, data); }
  put(endpoint, data) { return this.request('PUT', endpoint, data); }
  delete(endpoint) { return this.request('DELETE', endpoint); }
}

export const apiClient = new RobustApiClient();
`;
  }

  // ... outros métodos de geração de código
}

// Executar migração se chamado diretamente
if (require.main === module) {
  const migration = new RobustMigration();
  
  migration.runMigration()
    .then(() => {
      console.log('\\n🎉 MIGRAÇÃO PARA SISTEMA ROBUSTO CONCLUÍDA!');
      console.log('📋 Verificações pós-migração:');
      console.log('  1. Execute: npm run health-check');
      console.log('  2. Teste as APIs públicas');
      console.log('  3. Valide o funcionamento completo');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\\n💥 MIGRAÇÃO FALHOU:', error.message);
      console.error('🔄 Rollback executado automaticamente');
      console.error('📞 Verifique os logs para mais detalhes');
      process.exit(1);
    });
}

module.exports = { RobustMigration };
```

## Resultado Esperado

Após migração, devo ter:

### ✅ Aplicação Completamente Robusta
- Backend com validações, logs estruturados e health checks
- Frontend com retry automático e estados informativos  
- Banco com schema completo e dados migrados
- Deploy seguro com validação e rollback
- Páginas públicas seguras e performáticas

### ✅ Problemas Anteriores Corrigidos
- APIs públicas não retornam mais arrays vazios
- Deploy tem validação obrigatória
- Dados estão marcados como públicos
- Sistema de logs estruturados funcionando
- Error handling robusto implementado

### ✅ Preservação de Dados
- Todos os dados existentes preservados
- Backup completo antes da migração
- Rollback automático em caso de falha
- Validação de integridade após migração

### ✅ Funcionalidades Novas
- Debug visual em desenvolvimento
- Cache inteligente para performance
- Rate limiting para APIs públicas
- Sistema de diagnóstico automático
- Scripts de deploy automatizados

## Regras Críticas de Migração

### ✅ Obrigatório:
- SEMPRE fazer backup completo antes da migração
- SEMPRE validar funcionamento após migração
- SEMPRE preservar dados existentes
- SEMPRE ter plano de rollback funcionando
- SEMPRE testar aplicação completa pós-migração

### ❌ Proibido:
- NUNCA migrar sem backup
- NUNCA ignorar validação pós-migração
- NUNCA perder dados durante migração
- NUNCA fazer migração em produção sem teste
- NUNCA pular etapas do processo de migração

---

**Importante:** Esta migração transforma sua aplicação existente em um sistema robusto e à prova de falhas, corrigindo todos os problemas conhecidos e aplicando as melhores práticas dos novos artefatos.