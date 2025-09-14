// ========================================
// SERVIDOR PRINCIPAL - MORIA BACKEND
// Node.js + Express + SQLite3
// ========================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { testConnection, ensureDatabaseSetup, closeDatabase } = require('./src/database.js');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Segurança com Helmet
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configurado
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    // Desenvolvimento local
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    // Produção VPS
    'http://72.60.10.108:3030',
    `http://${process.env.VPS_HOST || '72.60.10.108'}:${process.env.FRONTEND_PORT || '3030'}`
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Parse JSON e URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requisições
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ========================================
// ROTAS BÁSICAS
// ========================================

// Health Check
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    database: 'SQLite3',
    message: 'Moria Backend está funcionando!'
  };

  res.status(200).json(healthCheck);
});

// Rota raiz da API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Moria Peças & Serviços',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      products: '/api/products/*',
      services: '/api/services/*',
      orders: '/api/orders/*',
      promotions: '/api/promotions/*',
      coupons: '/api/coupons/*'
    }
  });
});

// ========================================
// ROTAS DA API - FASE 3 IMPLEMENTADA
// ========================================

// Importar rotas
const authRoutes = require('./src/routes/auth.js');
const productRoutes = require('./src/routes/products.js');
const serviceRoutes = require('./src/routes/services.js');
const orderRoutes = require('./src/routes/orders.js');
const promotionRoutes = require('./src/routes/promotions.js');

// Importar middlewares de erro
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler.js');

// Registrar rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);

// ========================================
// MIDDLEWARE DE ERRO GLOBAL
// ========================================

// 404 - Not Found (deve vir antes do error handler)
app.use(notFoundHandler);

// Error Handler Global personalizado
app.use(errorHandler);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const startServer = async () => {
  try {
    console.log('🚀 Iniciando Moria Backend...');

    // Testar conexão com banco
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Falha na conexão com o banco de dados');
    }

    // Verificar setup do banco
    await ensureDatabaseSetup();

    // Iniciar servidor
    const server = app.listen(PORT, HOST, () => {
      console.log('┌─────────────────────────────────────┐');
      console.log('│     🎯 MORIA BACKEND ONLINE!        │');
      console.log('├─────────────────────────────────────┤');
      console.log(`│ Servidor: http://${HOST}:${PORT}     │`);
      console.log(`│ API: http://${HOST}:${PORT}/api      │`);
      console.log(`│ Health: http://${HOST}:${PORT}/api/health │`);
      console.log(`│ Ambiente: ${process.env.NODE_ENV || 'development'}${' '.repeat(21 - (process.env.NODE_ENV || 'development').length)}│`);
      console.log('└─────────────────────────────────────┘');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Recebido sinal ${signal}. Encerrando servidor...`);

      server.close(async () => {
        console.log('✅ Servidor HTTP fechado');

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