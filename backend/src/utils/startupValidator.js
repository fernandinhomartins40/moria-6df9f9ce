// ========================================
// STARTUP VALIDATOR - MORIA BACKEND
// Validador de inicialização do sistema
// ========================================

const env = require('../config/environment.js');
const fs = require('fs').promises;
const path = require('path');
const { info, error, warn } = require('./logger');

class StartupValidator {
  static async validateAll() {
    info('🔍 Validando configurações de inicialização...');

    try {
      await this.validateEnvironment();
      await this.validateDatabase();
      await this.validateDirectories();
      this.validateNetwork();
      this.validateSecurity();

      info('✅ Todas as configurações de inicialização são válidas');
      return { isValid: true };
    } catch (err) {
      error('❌ Falha na validação de inicialização:', { error: err.message });
      return { isValid: false, error: err.message };
    }
  }

  static async validateEnvironment() {
    info('   🔧 Validando ambiente...');

    // Validar Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);

    if (majorVersion < 16) {
      throw new Error(`Node.js versão ${nodeVersion} não é suportada. Mínimo: v16.x`);
    }

    // Validar variáveis de ambiente obrigatórias
    const requiredVars = ['NODE_ENV'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}`);
    }

    // Validar configurações do environment manager
    const configValidation = env.validate();
    if (!configValidation.isValid) {
      throw new Error(`Environment Manager: ${configValidation.errors.join(', ')}`);
    }

    info('     ✓ Ambiente válido');
  }

  static async validateDatabase() {
    info('   🗄️ Validando banco de dados...');

    try {
      const dbPath = env.get('DATABASE_URL').replace('file:', '');
      const dbDir = path.dirname(dbPath);

      // Verificar se o diretório do banco existe
      try {
        await fs.access(dbDir);
      } catch (error) {
        // Criar diretório se não existir
        await fs.mkdir(dbDir, { recursive: true });
        info(`     📁 Diretório do banco criado: ${dbDir}`);
      }

      // Tentar conectar com o banco Prisma
      const prisma = require('../services/prisma.js');
      await prisma.$connect();
      info('     ✅ Conexão Prisma estabelecida');

      info('     ✓ Banco de dados acessível');
    } catch (err) {
      throw new Error(`Validação do banco falhou: ${err.message}`);
    }
  }

  static async validateDirectories() {
    info('   📁 Validando diretórios...');

    const requiredDirs = [
      'logs',
      'uploads',
      'temp',
      'backups'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);

      try {
        await fs.access(dirPath);
      } catch (error) {
        // Criar diretório se não existir
        await fs.mkdir(dirPath, { recursive: true });
        info(`     📁 Diretório criado: ${dir}`);
      }
    }

    // Verificar permissões de escrita
    const testFile = path.join(process.cwd(), 'temp', '.write-test');
    try {
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
    } catch (error) {
      throw new Error('Sem permissões de escrita no diretório de trabalho');
    }

    info('     ✓ Diretórios válidos');
  }

  static validateNetwork() {
    info('   🌐 Validando configurações de rede...');

    const port = env.get('PORT');
    const host = env.get('HOST');

    // Validar porta
    if (port < 1 || port > 65535) {
      throw new Error(`Porta inválida: ${port}. Deve estar entre 1 e 65535`);
    }

    // Verificar se a porta não está sendo usada (check simples)
    if (port < 1024 && process.getuid && process.getuid() !== 0) {
      warn(`     ⚠️ Porta ${port} pode requerer privilégios administrativos`);
    }

    // Validar host
    const validHosts = ['0.0.0.0', '127.0.0.1', 'localhost'];
    const isValidIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

    if (!validHosts.includes(host) && !isValidIP) {
      throw new Error(`Host inválido: ${host}`);
    }

    // Validar CORS origin
    const corsOrigin = env.get('CORS_ORIGIN');
    if (corsOrigin && corsOrigin !== '*') {
      // Suportar múltiplas URLs separadas por vírgula
      const origins = Array.isArray(corsOrigin) ? corsOrigin : corsOrigin.split(',');
      for (const origin of origins) {
        const trimmedOrigin = origin.trim();
        if (trimmedOrigin && trimmedOrigin !== '*') {
          try {
            new URL(trimmedOrigin);
          } catch (error) {
            throw new Error(`CORS_ORIGIN inválido: ${trimmedOrigin}`);
          }
        }
      }
    }

    info('     ✓ Configurações de rede válidas');
  }

  static validateSecurity() {
    info('   🔐 Validando configurações de segurança...');

    // Validar JWT Secret
    const jwtSecret = env.get('JWT_SECRET');
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres');
    }

    if (env.isProduction()) {
      // Validações específicas de produção
      if (jwtSecret.includes('dev') || jwtSecret.includes('test')) {
        throw new Error('JWT_SECRET não deve conter "dev" ou "test" em produção');
      }

      // Validar se CORS não está muito permissivo
      const corsOrigin = env.get('CORS_ORIGIN');
      if (corsOrigin === '*') {
        warn('     ⚠️ CORS configurado como "*" em produção pode ser inseguro');
      }

      // Verificar HTTPS
      if (!corsOrigin.startsWith('https://')) {
        warn('     ⚠️ CORS Origin não está usando HTTPS em produção');
      }
    }

    // Validar configurações de upload
    const maxSize = env.get('UPLOAD_MAX_SIZE');
    if (maxSize > 50 * 1024 * 1024) { // 50MB
      warn('     ⚠️ Tamanho máximo de upload muito alto (>50MB)');
    }

    info('     ✓ Configurações de segurança válidas');
  }

  // Validações de performance
  static validatePerformance() {
    info('   ⚡ Validando configurações de performance...');

    // Verificar memória disponível
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    if (memoryUsagePercent > 90) {
      warn(`     ⚠️ Uso de memória alto: ${memoryUsagePercent.toFixed(1)}%`);
    }

    // Verificar CPU cores
    const cpuCores = require('os').cpus().length;
    if (cpuCores < 2) {
      warn('     ⚠️ Sistema com poucos cores de CPU pode afetar performance');
    }

    // Verificar limites do sistema
    const maxConnections = env.get('RATE_LIMIT_MAX_REQUESTS');
    if (maxConnections > 10000) {
      warn('     ⚠️ Limite de conexões muito alto pode sobrecarregar o sistema');
    }

    info('     ✓ Configurações de performance verificadas');
  }

  // Health check pós-inicialização
  static async healthCheck() {
    const startTime = Date.now();

    try {
      // Test database connection with Prisma
      const prisma = require('../services/prisma.js');
      await prisma.$connect();
      const dbStatus = true;

      // Test memory usage
      const memUsage = process.memoryUsage();
      const memoryMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      };

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime()),
        database: dbStatus ? 'connected' : 'disconnected',
        memory: memoryMB,
        environment: env.getEnvironment(),
        responseTime: `${responseTime}ms`,
        version: env.get('APP_VERSION')
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = StartupValidator;