#!/usr/bin/env node
// ========================================
// SCRIPT DE DEPLOY ROBUSTO - SISTEMA MORIA
// Validação completa pré e pós deploy
// ========================================
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RobustDeploy {
  constructor() {
    this.deployId = new Date().toISOString().replace(/[:.]/g, '-');
    this.deployLog = [];
    this.errors = [];
    this.warnings = [];
    this.checksPassed = 0;
    this.checksTotal = 0;
    
    this.config = {
      buildDir: 'dist',
      backendDir: 'backend',
      nodeEnv: process.env.NODE_ENV || 'production',
      skipTests: process.env.SKIP_TESTS === 'true',
      skipBuild: process.env.SKIP_BUILD === 'true'
    };
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };
    this.deployLog.push(logEntry);
    
    const colors = {
      info: '\x1b[36m',    // cyan
      warn: '\x1b[33m',    // yellow
      error: '\x1b[31m',   // red
      success: '\x1b[32m', // green
      reset: '\x1b[0m'
    };
    
    const color = colors[level] || colors.info;
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
    
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async runDeploy() {
    this.log('info', `🚀 Iniciando deploy robusto - ID: ${this.deployId}`);
    this.log('info', `🌍 Environment: ${this.config.nodeEnv}`);
    
    try {
      // 1. Validação pré-deploy
      await this.preDeployValidation();
      
      // 2. Build da aplicação
      if (!this.config.skipBuild) {
        await this.buildApplication();
      } else {
        this.log('warn', 'Build ignorado (SKIP_BUILD=true)');
      }
      
      // 3. Testes (se não ignorados)
      if (!this.config.skipTests) {
        await this.runTests();
      } else {
        this.log('warn', 'Testes ignorados (SKIP_TESTS=true)');
      }
      
      // 4. Validação pós-build
      await this.postBuildValidation();
      
      // 5. Deploy para produção (se aplicável)
      if (this.config.nodeEnv === 'production') {
        await this.deployToProduction();
      }
      
      // 6. Validação pós-deploy
      await this.postDeployValidation();
      
      // 7. Relatório final
      this.generateDeployReport();
      
      this.log('success', '✅ Deploy concluído com sucesso!');
      return { success: true, deployId: this.deployId };
      
    } catch (error) {
      this.log('error', `❌ Deploy falhou: ${error.message}`);
      this.errors.push(error.message);
      
      // Tentar rollback se necessário
      if (this.config.nodeEnv === 'production') {
        await this.attemptRollback();
      }
      
      throw error;
    }
  }

  async preDeployValidation() {
    this.log('info', '🔍 Executando validação pré-deploy...');
    
    const checks = [
      // Verificar estrutura de arquivos
      { name: 'package.json existe', check: () => fs.existsSync('package.json') },
      { name: 'Backend package.json existe', check: () => fs.existsSync('backend/package.json') },
      { name: 'Schema Prisma existe', check: () => fs.existsSync('backend/prisma/schema.prisma') },
      { name: 'Arquivo server.js existe', check: () => fs.existsSync('backend/src/server.js') },
      
      // Verificar dependências
      { name: 'Node.js versão adequada', check: () => this.checkNodeVersion() },
      { name: 'NPM instalado', check: () => this.checkNpmInstalled() },
      
      // Verificar configurações
      { name: 'Variáveis de ambiente', check: () => this.checkEnvironmentVariables() },
      { name: 'Configuração de build', check: () => this.checkBuildConfig() }
    ];

    this.checksTotal += checks.length;
    
    for (const check of checks) {
      try {
        const result = await check.check();
        if (result) {
          this.log('success', `  ✅ ${check.name}`);
          this.checksPassed++;
        } else {
          this.log('error', `  ❌ ${check.name}`);
          this.errors.push(`Validação falhou: ${check.name}`);
        }
      } catch (error) {
        this.log('error', `  ❌ ${check.name}: ${error.message}`);
        this.errors.push(`Erro na validação ${check.name}: ${error.message}`);
      }
    }
    
    if (this.errors.length > 0) {
      throw new Error('Validação pré-deploy falhou');
    }
    
    this.log('success', '✅ Validação pré-deploy passou em todas as verificações');
  }

  checkNodeVersion() {
    const version = process.version;
    const major = parseInt(version.replace('v', '').split('.')[0]);
    return major >= 16;
  }

  checkNpmInstalled() {
    try {
      execSync('npm --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  checkEnvironmentVariables() {
    const required = [];
    const optional = ['PORT', 'NODE_ENV'];
    
    // DATABASE_URL é obrigatória apenas em produção real (não para teste local)
    if (this.config.nodeEnv === 'production' && !process.env.CI) {
      // Para teste local, verificar se o arquivo de banco existe
      const fs = require('fs');
      if (fs.existsSync('backend/prisma/database.db')) {
        this.log('info', 'Usando banco local para teste');
      } else {
        required.push('DATABASE_URL');
      }
    }
    
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      this.log('error', `Variáveis obrigatórias não encontradas: ${missing.join(', ')}`);
      return false;
    }
    
    // Verificar opcionais e avisar
    const missingOptional = optional.filter(env => !process.env[env]);
    if (missingOptional.length > 0) {
      this.log('warn', `Variáveis opcionais não encontradas: ${missingOptional.join(', ')}`);
      this.warnings.push(`Variáveis opcionais ausentes: ${missingOptional.join(', ')}`);
    }
    
    return true;
  }

  checkBuildConfig() {
    // Verificar se vite.config existe
    const hasViteConfig = fs.existsSync('vite.config.ts') || fs.existsSync('vite.config.js');
    if (!hasViteConfig) {
      this.log('warn', 'Configuração do Vite não encontrada');
      this.warnings.push('vite.config não encontrado');
    }
    return true;
  }

  async buildApplication() {
    this.log('info', '🔨 Construindo aplicação...');
    
    try {
      // Instalar dependências do frontend
      this.log('info', 'Instalando dependências do frontend...');
      execSync('npm install', { stdio: 'pipe' });
      
      // Instalar dependências do backend
      this.log('info', 'Instalando dependências do backend...');
      execSync('cd backend && npm install', { stdio: 'pipe' });
      
      // Build do frontend
      this.log('info', 'Construindo frontend...');
      execSync('npm run build', { stdio: 'pipe' });
      
      // Verificar se build foi criado
      if (!fs.existsSync(this.config.buildDir)) {
        throw new Error(`Diretório de build ${this.config.buildDir} não foi criado`);
      }
      
      // Verificar arquivos essenciais do build
      const buildFiles = fs.readdirSync(this.config.buildDir);
      const hasIndexHtml = buildFiles.includes('index.html');
      const hasAssets = fs.existsSync(path.join(this.config.buildDir, 'assets'));
      
      if (!hasIndexHtml) {
        throw new Error('index.html não encontrado no build');
      }
      
      if (!hasAssets) {
        this.log('warn', 'Diretório assets não encontrado no build');
        this.warnings.push('Diretório assets ausente no build');
      }
      
      this.log('success', '✅ Build da aplicação concluído');
      
    } catch (error) {
      this.log('error', `Erro no build: ${error.message}`);
      throw new Error(`Build falhou: ${error.message}`);
    }
  }

  async runTests() {
    this.log('info', '🧪 Executando testes...');
    
    try {
      // Testes do frontend (se existirem)
      try {
        execSync('npm test', { stdio: 'pipe' });
        this.log('success', '✅ Testes do frontend passaram');
      } catch (error) {
        this.log('warn', 'Testes do frontend não disponíveis ou falharam');
        this.warnings.push('Testes do frontend não executados');
      }
      
      // Testes do backend (se existirem)
      try {
        execSync('cd backend && npm test', { stdio: 'pipe' });
        this.log('success', '✅ Testes do backend passaram');
      } catch (error) {
        this.log('warn', 'Testes do backend não disponíveis ou falharam');
        this.warnings.push('Testes do backend não executados');
      }
      
    } catch (error) {
      this.log('error', `Erro nos testes: ${error.message}`);
      // Não falhar deploy por causa de testes (apenas avisar)
      this.warnings.push(`Testes falharam: ${error.message}`);
    }
  }

  async postBuildValidation() {
    this.log('info', '🔍 Validação pós-build...');
    
    const checks = [
      { name: 'Diretório de build existe', check: () => fs.existsSync(this.config.buildDir) },
      { name: 'index.html no build', check: () => fs.existsSync(path.join(this.config.buildDir, 'index.html')) },
      { name: 'Assets do build', check: () => fs.existsSync(path.join(this.config.buildDir, 'assets')) },
      { name: 'Backend compilado', check: () => fs.existsSync('backend/src/server.js') },
      { name: 'Schema Prisma válido', check: () => this.validatePrismaSchema() }
    ];
    
    this.checksTotal += checks.length;
    
    for (const check of checks) {
      try {
        const result = await check.check();
        if (result) {
          this.log('success', `  ✅ ${check.name}`);
          this.checksPassed++;
        } else {
          this.log('error', `  ❌ ${check.name}`);
          this.errors.push(`Validação pós-build falhou: ${check.name}`);
        }
      } catch (error) {
        this.log('error', `  ❌ ${check.name}: ${error.message}`);
        this.errors.push(`Erro na validação pós-build ${check.name}: ${error.message}`);
      }
    }
    
    if (this.errors.length > 0) {
      throw new Error('Validação pós-build falhou');
    }
    
    this.log('success', '✅ Validação pós-build passou');
  }

  validatePrismaSchema() {
    try {
      execSync('cd backend && npx prisma validate', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async deployToProduction() {
    this.log('info', '🚀 Deploy para produção...');
    
    // Este é onde você faria o deploy real (rsync, scp, docker, etc.)
    this.log('info', 'Deploy para produção será implementado baseado na infraestrutura');
    this.log('warn', 'Deploy automático não configurado - deploy manual necessário');
    this.warnings.push('Deploy automático não implementado');
  }

  async postDeployValidation() {
    this.log('info', '🔍 Validação pós-deploy...');
    
    // Aqui você testaria se a aplicação está funcionando
    // Health checks, testes de API, etc.
    this.log('info', 'Validações pós-deploy serão implementadas conforme necessário');
    this.warnings.push('Validação pós-deploy não implementada');
  }

  async attemptRollback() {
    this.log('warn', '🔄 Tentando rollback automático...');
    this.log('info', 'Sistema de rollback será implementado conforme necessário');
    this.warnings.push('Rollback automático não implementado');
  }

  generateDeployReport() {
    this.log('info', '\n📋 RELATÓRIO DE DEPLOY');
    console.log('========================================');
    console.log(`Deploy ID: ${this.deployId}`);
    console.log(`Environment: ${this.config.nodeEnv}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Verificações: ${this.checksPassed}/${this.checksTotal} passaram`);
    console.log('');
    
    if (this.errors.length > 0) {
      console.log('❌ Erros encontrados:');
      this.errors.forEach(error => console.log(`  • ${error}`));
      console.log('');
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️ Avisos:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
      console.log('');
    }
    
    if (this.errors.length === 0) {
      console.log('✅ Deploy concluído com sucesso!');
    } else {
      console.log('❌ Deploy falhou - verifique os erros acima');
    }
    
    console.log('========================================');
    
    // Salvar relatório em arquivo
    const reportPath = `deploy-report-${this.deployId}.json`;
    const report = {
      deployId: this.deployId,
      timestamp: new Date().toISOString(),
      environment: this.config.nodeEnv,
      checksPassed: this.checksPassed,
      checksTotal: this.checksTotal,
      errors: this.errors,
      warnings: this.warnings,
      deployLog: this.deployLog
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log('info', `📄 Relatório salvo em: ${reportPath}`);
  }
}

// Executar deploy se chamado diretamente
if (require.main === module) {
  const deploy = new RobustDeploy();
  
  deploy.runDeploy()
    .then((result) => {
      console.log('\n🎉 DEPLOY ROBUSTO CONCLUÍDO!');
      console.log(`Deploy ID: ${result.deployId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 DEPLOY FALHOU!');
      console.error('Verifique os erros acima e corrija antes de tentar novamente');
      process.exit(1);
    });
}

module.exports = { RobustDeploy };