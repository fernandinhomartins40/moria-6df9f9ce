const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3081;
const NODE_ENV = process.env.NODE_ENV || 'development';

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

// CORS Configuration - Single Tenant
const corsOptions = {
  origin: NODE_ENV === 'development' 
    ? ['http://localhost:8080', 'http://127.0.0.1:8080'] // Vite dev server
    : process.env.ALLOWED_ORIGIN || 'https://yourdomain.com', // Production domain
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logs simples
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// API Routes - sempre em /api/*
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
  // Em desenvolvimento, retorna uma mensagem informativa
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Backend funcionando em modo desenvolvimento',
      environment: NODE_ENV,
      port: PORT,
      frontend: 'http://localhost:5173',
      apis: `http://localhost:${PORT}/api`
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message
  });
});

// 404 handler para APIs
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint não encontrado' });
});

// Start server with database connection
async function startServer() {
  try {
    // Conectar ao banco primeiro
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log(`📱 ${process.env.APP_NAME || 'Moria Backend'}`);
      console.log(`👤 Cliente: ${process.env.CLIENT_NAME || 'Desenvolvimento'}`);
      console.log(`🌍 Ambiente: ${NODE_ENV}`);
      console.log(`💾 Banco: SQLite (database.db)`);
      console.log(`🔗 Servidor: http://localhost:${PORT}`);
      console.log(`📡 APIs: http://localhost:${PORT}/api`);
      if (NODE_ENV === 'development') {
        console.log(`⚛️  Frontend Dev: http://localhost:8080`);
      }
      console.log('========================================');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;