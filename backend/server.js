// ========================================
// SERVIDOR PRINCIPAL - MORIA BACKEND
// Node.js + Express + SQLite3
// ========================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const { testConnection, ensureDatabaseSetup, closeDatabase } = require('./src/database.js');

// Carregar variáveis de ambiente
dotenv.config();

// Importar environment manager
const env = require('./src/config/environment.js');

// Importar validador de inicialização
const StartupValidator = require('./src/utils/startupValidator.js');

// Importar config watcher para hot reload
const configWatcher = require('./src/utils/configWatcher.js');

// Importar sistema de logging estruturado
const logger = require('./src/utils/logger.js');
const requestLogger = require('./src/middleware/requestLogger.js');
const errorLogger = require('./src/middleware/errorLogger.js');
const performanceMonitor = require('./src/middleware/performanceMonitor.js');

// Importar middlewares da Fase 4
const rateLimiter = require('./src/middleware/rateLimiter.js');
const DataTransformer = require('./src/middleware/dataTransform.js');

const app = express();
const PORT = env.get('PORT');
const HOST = env.get('HOST');

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Compressão de respostas (se habilitada)
if (env.get('ENABLE_COMPRESSION')) {
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: env.isProduction() ? 6 : 1,
    threshold: 1024
  }));
}

// Segurança com Helmet
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: env.isProduction() ? undefined : false,
  hsts: env.isProduction()
}));

// CORS configurado (se habilitado)
if (env.get('ENABLE_CORS')) {
  const corsOptions = {
    origin: env.get('CORS_ORIGIN'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Cache-Control',
      'X-API-Key'
    ],
    credentials: env.get('CORS_CREDENTIALS'),
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400 // 24 horas
  };

  app.use(cors(corsOptions));
}

// Parse JSON e URL encoded
const uploadLimit = `${Math.round(env.get('UPLOAD_MAX_SIZE') / 1024 / 1024)}mb`;
app.use(express.json({
  limit: uploadLimit,
  strict: true,
  type: 'application/json'
}));
app.use(express.urlencoded({
  extended: true,
  limit: uploadLimit,
  parameterLimit: 1000
}));

// Logging de requisições (se habilitado)
if (env.get('ENABLE_REQUEST_LOGGING')) {
  let morganFormat = env.isDevelopment() ? 'dev' : 'combined';
  const morganOptions = {};

  // Skip logging in test environment
  if (env.isTest()) {
    morganOptions.skip = () => true;
  }

  // Custom token for response time in production
  if (env.isProduction()) {
    morgan.token('real-ip', (req) => {
      return req.headers['x-forwarded-for'] ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.ip;
    });
    morganFormat = ':real-ip - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
  }

  app.use(morgan(morganFormat, morganOptions));
}

// ========================================
// SISTEMA DE LOGGING ESTRUTURADO
// ========================================

// Performance monitoring (deve vir cedo na cadeia)
app.use(performanceMonitor);

// Request logging estruturado (compatível com Morgan)
app.use(requestLogger);

// ========================================
// RATE LIMITING E PROTEÇÕES - FASE 4
// ========================================

// Rate limiting geral
if (env.get('ENABLE_RATE_LIMITING')) {
  app.use(rateLimiter.general());

  // Slow down para performance
  app.use(rateLimiter.slowDown());

  logger.info('Rate Limiting ativo', {
    component: 'server',
    action: 'rate-limiting-enabled'
  });
}

// ========================================
// ROTAS BÁSICAS
// ========================================

// Health Check
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    environment: env.getEnvironment(),
    version: env.get('APP_VERSION'),
    name: env.get('APP_NAME'),
    description: env.get('APP_DESCRIPTION'),
    database: 'SQLite3',
    node_version: process.version,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    config: {
      cors_enabled: env.get('ENABLE_CORS'),
      compression_enabled: env.get('ENABLE_COMPRESSION'),
      rate_limiting_enabled: env.get('ENABLE_RATE_LIMITING'),
      request_logging_enabled: env.get('ENABLE_REQUEST_LOGGING')
    },
    message: 'Moria Backend está funcionando!'
  };

  // Adicionar informações de debug apenas em desenvolvimento
  if (env.isDevelopment()) {
    healthCheck.debug = env.getDebugInfo();
  }

  res.status(200).json(healthCheck);
});

// Rota raiz da API
app.get(env.get('API_PREFIX'), (req, res) => {
  res.json({
    success: true,
    name: env.get('APP_NAME'),
    description: env.get('APP_DESCRIPTION'),
    version: env.get('APP_VERSION'),
    api_version: env.get('API_VERSION'),
    environment: env.getEnvironment(),
    timestamp: new Date().toISOString(),
    endpoints: {
      health: `${env.get('API_PREFIX')}/health`,
      auth: `${env.get('API_PREFIX')}/auth/*`,
      products: `${env.get('API_PREFIX')}/products/*`,
      services: `${env.get('API_PREFIX')}/services/*`,
      orders: `${env.get('API_PREFIX')}/orders/*`,
      promotions: `${env.get('API_PREFIX')}/promotions/*`,
      settings: `${env.get('API_PREFIX')}/settings/*`,
      companyInfo: `${env.get('API_PREFIX')}/company-info`
    },
    features: {
      cors: env.get('ENABLE_CORS'),
      compression: env.get('ENABLE_COMPRESSION'),
      rate_limiting: env.get('ENABLE_RATE_LIMITING'),
      request_logging: env.get('ENABLE_REQUEST_LOGGING')
    },
    limits: {
      upload_max_size: `${Math.round(env.get('UPLOAD_MAX_SIZE') / 1024 / 1024)}MB`,
      allowed_types: env.get('UPLOAD_ALLOWED_TYPES').split(',')
    }
  });
});

// ========================================
// ROTAS DA API - FASE 3 IMPLEMENTADA
// ========================================

// Importar middlewares de erro
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler.js');

// Importar rotas
const authRoutes = require('./src/routes/auth.js');
const productRoutes = require('./src/routes/products.js');
const serviceRoutes = require('./src/routes/services.js');
const orderRoutes = require('./src/routes/orders.js');
const promotionRoutes = require('./src/routes/promotions.js');
const settingRoutes = require('./src/routes/settings.js');

// Registrar rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/settings', settingRoutes);

// Rotas específicas
app.get('/api/company-info', (req, res, next) => {
  req.url = '/company-info';
  settingRoutes(req, res, next);
});

// ========================================
// MIDDLEWARE DE ERRO GLOBAL
// ========================================

// 404 - Not Found (deve vir antes do error handler)
app.use(notFoundHandler);

// Error logging estruturado (antes do tratamento final)
app.use(errorLogger);

// Error Handler Global personalizado
app.use(errorHandler);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const startServer = async () => {
  try {
    console.log('🚀 Iniciando Moria Backend...');

    // Inicializar sistema de logging
    logger.info('Sistema de Logging Inicializado', {
      component: 'server',
      action: 'startup',
      middlewares: ['performanceMonitor', 'requestLogger', 'errorLogger']
    });

    // Validações completas de inicialização
    const validationResult = await StartupValidator.validateAll();
    if (!validationResult.isValid) {
      throw new Error(`Falha na validação: ${validationResult.error}`);
    }

    // Verificar setup do banco
    console.log('📊 Configurando estrutura do banco...');
    await ensureDatabaseSetup();
    console.log('✅ Estrutura do banco configurada');

    // Iniciar servidor
    const server = app.listen(PORT, HOST, () => {
      const serverUrl = `http://${HOST}:${PORT}`;
      const apiUrl = `${serverUrl}${env.get('API_PREFIX')}`;
      const healthUrl = `${apiUrl}/health`;

      console.log('┌─────────────────────────────────────────────────────┐');
      console.log('│               🎯 MORIA BACKEND ONLINE!              │');
      console.log('├─────────────────────────────────────────────────────┤');
      console.log(`│ Servidor: ${serverUrl.padEnd(34)} │`);
      console.log(`│ API: ${apiUrl.padEnd(40)} │`);
      console.log(`│ Health: ${healthUrl.padEnd(37)} │`);
      console.log(`│ Ambiente: ${env.getEnvironment().padEnd(35)} │`);
      console.log(`│ Versão: ${env.get('APP_VERSION').padEnd(37)} │`);
      console.log('├─────────────────────────────────────────────────────┤');
      console.log(`│ CORS: ${(env.get('ENABLE_CORS') ? 'Ativado' : 'Desativado').padEnd(39)} │`);
      console.log(`│ Compressão: ${(env.get('ENABLE_COMPRESSION') ? 'Ativada' : 'Desativada').padEnd(33)} │`);
      console.log(`│ Rate Limiting: ${(env.get('ENABLE_RATE_LIMITING') ? 'Ativado' : 'Desativado').padEnd(30)} │`);
      console.log(`│ Request Logging: ${(env.get('ENABLE_REQUEST_LOGGING') ? 'Ativado' : 'Desativado').padEnd(28)} │`);
      console.log('└─────────────────────────────────────────────────────┘');

      if (env.isDevelopment()) {
        console.log('\n💻 Modo desenvolvimento ativo:');
        console.log('   - Debug habilitado');
        console.log('   - Hot reload disponível');
        console.log('   - Configurações flexíveis');

        // Iniciar hot reload de configurações
        configWatcher.startWatching();
        configWatcher.setupProcessHandlers();
        console.log('');
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Recebido sinal ${signal}. Encerrando servidor...`);

      server.close(async () => {
        console.log('✅ Servidor HTTP fechado');

        // Parar config watcher
        if (env.isDevelopment()) {
          configWatcher.stopWatching();
        }

        // Fechar conexão com banco
        await closeDatabase();

        console.log('👋 Moria Backend encerrado com sucesso');
        process.exit(0);
      });

      // Forçar encerramento após 10 segundos
      setTimeout(() => {
        console.error('⚠️ Encerramento forçado após timeout');
        process.exit(1);
      }, 10000);
    };

    // Handlers para sinais de encerramento
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar o servidor
startServer();

module.exports = app;