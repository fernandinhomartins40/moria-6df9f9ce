// ========================================
// SERVIDOR ROBUSTO - MORIA BACKEND
// Migrado automaticamente para versão robusta
// ========================================

// CRÍTICO: Validação de environment ANTES de tudo
const config = require('./config/environment');
const logger = require('./config/logger');

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

// Middlewares robustos
const loggingMiddleware = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Rotas
const apiRoutes = require('./routes/api');
const publicApiRoutes = require('./routes/publicApi');
const healthRoutes = require('./routes/health');
const diagnosticsRoutes = require('./routes/diagnostics');
const { connectDatabase } = require('./config/database');

const app = express();

// Usar configurações validadas
const PORT = config.port;
const NODE_ENV = config.nodeenv;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));

// CORS Configuration robusta
const corsOptions = {
  origin: config.corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware de logging ANTES de qualquer rota
app.use(loggingMiddleware);

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging já configurado no middleware

// Rotas de sistema (health checks e diagnósticos)
app.use('/api/health', healthRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);

// API Routes Públicas (SEM autenticação)
app.use('/api/public', publicApiRoutes);

// API Routes Privadas (COM autenticação futura)
app.use('/api', apiRoutes);

// Serve arquivos estáticos do build React (produção)
if (NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../dist');
  app.use(express.static(frontendBuildPath));
  
  // SPA fallback para React Router - CRÍTICO para Single Page Application
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // Em desenvolvimento, retorna dashboard de informações
  app.get('/', (req, res) => {
    res.json({ 
      service: config.appname,
      message: 'Backend robusto funcionando em modo desenvolvimento',
      environment: NODE_ENV,
      port: PORT,
      uptime: Math.floor(process.uptime()),
      endpoints: {
        health: `http://localhost:${PORT}/api/health`,
        diagnostics: `http://localhost:${PORT}/api/diagnostics`,
        publicApi: `http://localhost:${PORT}/api/public`,
        privateApi: `http://localhost:${PORT}/api`
      },
      frontend: 'http://localhost:5173',
      timestamp: new Date().toISOString()
    });
  });
}

// Error handling robusto DEPOIS de todas as rotas
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.warn(`Recebido sinal ${signal}, iniciando shutdown graceful...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Erro durante shutdown do servidor', err);
    } else {
      logger.info('Servidor fechado com sucesso');
    }
    
    // Fechar conexão do banco
    if (global.prisma) {
      global.prisma.$disconnect()
        .then(() => {
          logger.info('Conexão do banco fechada');
          process.exit(err ? 1 : 0);
        })
        .catch((dbErr) => {
          logger.error('Erro ao fechar conexão do banco', dbErr);
          process.exit(1);
        });
    } else {
      process.exit(err ? 1 : 0);
    }
  });
};

// Start server with database connection
let server;

async function startServer() {
  try {
    logger.systemEvent('server_startup_initiated');
    
    // Conectar ao banco primeiro
    await connectDatabase();
    logger.systemEvent('database_connected');
    
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info('🚀 ========================================');
      logger.info(`📱 ${config.appname}`);
      logger.info(`👤 Cliente: ${config.clientname}`);
      logger.info(`🌍 Ambiente: ${NODE_ENV}`);
      logger.info(`💾 Banco: SQLite (database.db)`);
      logger.info(`🔗 Servidor: http://localhost:${PORT}`);
      logger.info(`📡 APIs: http://localhost:${PORT}/api`);
      logger.info(`🏥 Health: http://localhost:${PORT}/api/health`);
      if (config.isDevelopment) {
        logger.info(`⚛️  Frontend Dev: http://localhost:5173`);
        logger.info(`🔧 Diagnostics: http://localhost:${PORT}/api/diagnostics`);
      }
      logger.info('========================================');
      
      logger.systemEvent('server_startup_completed', {
        port: PORT,
        environment: NODE_ENV,
        uptime: process.uptime()
      });
    });
    
    server.on('error', (err) => {
      logger.error('Erro no servidor', err);
      process.exit(1);
    });
    
    // Configurar handlers de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon
    
  } catch (error) {
    logger.error('Erro ao iniciar servidor', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;