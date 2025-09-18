// ========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS SIMPLIFICADO - MORIA BACKEND
// Sistema profissional de error handling com @hapi/boom
// ========================================

const Boom = require('@hapi/boom');
const { error: logError } = require('../utils/logger');
const env = require('../config/environment');

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  // Log do erro
  logError('Error Handler', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection?.remoteAddress,
    userId: req.user?.id
  });

  // Se já é um erro Boom, usar diretamente
  if (Boom.isBoom(err)) {
    return res.status(err.output.statusCode).json({
      success: false,
      error: err.output.payload.message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  // Mapear erros comuns para Boom
  let boomError;
  
  if (err.name === 'JsonWebTokenError') {
    boomError = Boom.unauthorized('Token inválido');
  } else if (err.name === 'TokenExpiredError') {
    boomError = Boom.unauthorized('Token expirado');
  } else if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    boomError = Boom.badRequest(`Dados inválidos: ${errors.join('. ')}`);
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    boomError = Boom.badRequest('Dados duplicados encontrados');
  } else if (err.name === 'CastError') {
    boomError = Boom.badRequest(`Recurso não encontrado com ID: ${err.value}`);
  } else {
    // Erros genéricos
    boomError = Boom.badImplementation(err.message);
  }

  // Enviar resposta de erro
  res.status(boomError.output.statusCode).json({
    success: false,
    error: boomError.output.payload.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

// Middleware para capturar rotas não encontradas
const notFoundHandler = (req, res) => {
  const notFoundError = Boom.notFound(`Rota ${req.method} ${req.originalUrl} não encontrada`);
  
  res.status(notFoundError.output.statusCode).json({
    success: false,
    message: notFoundError.output.payload.message,
    availableRoutes: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile',
        'PUT /api/auth/profile',
        'POST /api/auth/logout',
        'POST /api/auth/refresh'
      ],
      products: [
        'GET /api/products',
        'GET /api/products/:id',
        'POST /api/products (admin)',
        'PUT /api/products/:id (admin)',
        'DELETE /api/products/:id (admin)'
      ],
      services: [
        'GET /api/services',
        'GET /api/services/:id',
        'POST /api/services (admin)',
        'PUT /api/services/:id (admin)',
        'DELETE /api/services/:id (admin)'
      ],
      orders: [
        'GET /api/orders',
        'POST /api/orders',
        'GET /api/orders/:id',
        'PUT /api/orders/:id/status (admin)'
      ]
    }
  });
};

// Helper para async handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Tratamento de uncaught exceptions
process.on('uncaughtException', (err) => {
  logError('UNCAUGHT EXCEPTION! Shutting down...', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Tratamento de unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logError('UNHANDLED REJECTION! Shutting down...', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};