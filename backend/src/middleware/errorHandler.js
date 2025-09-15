// ========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS CENTRALIZADO - MORIA BACKEND
// Sistema profissional de error handling - Fase 4
// ========================================

const logger = require('../utils/logger');
const env = require('../config/environment');

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

class ErrorHandler {
  static handle(err, req, res, next) {
    let error = { ...err };
    error.message = err.message;

    // Log do erro
    logger.error('Error Handler', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: logger.getClientIP(req),
      userId: req.user?.id
    });

    // Cast de erros específicos
    if (err.name === 'CastError') {
      error = this.handleCastError(err);
    }

    if (err.code === 'SQLITE_CONSTRAINT') {
      error = this.handleDuplicateFieldError(err);
    }

    if (err.name === 'ValidationError') {
      error = this.handleValidationError(err);
    }

    if (err.name === 'JsonWebTokenError') {
      error = this.handleJWTError(err);
    }

    if (err.name === 'TokenExpiredError') {
      error = this.handleJWTExpiredError(err);
    }

    this.sendError(error, req, res);
  }

  static handleCastError(err) {
    const message = `Recurso não encontrado com ID: ${err.value}`;
    return new AppError(message, 400);
  }

  static handleDuplicateFieldError(err) {
    const message = 'Dados duplicados encontrados';
    return new AppError(message, 400);
  }

  static handleValidationError(err) {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Dados inválidos: ${errors.join('. ')}`;
    return new AppError(message, 400);
  }

  static handleJWTError(err) {
    return new AppError('Token inválido', 401);
  }

  static handleJWTExpiredError(err) {
    return new AppError('Token expirado', 401);
  }

  static sendError(err, req, res) {
    // Operational errors: enviar detalhes para cliente
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        success: false,
        error: err.message,
        timestamp: err.timestamp || new Date().toISOString(),
        path: req.originalUrl
      });
    } else {
      // Programming errors: não vazar detalhes
      logger.error('Programming Error', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl
      });

      res.status(500).json({
        success: false,
        error: env.isProduction()
          ? 'Algo deu errado!'
          : err.message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }
  }

  // Helper para async handlers
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

// Middleware para capturar rotas não encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
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

// Tratamento de uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Tratamento de unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

module.exports = {
  AppError,
  ErrorHandler,
  errorHandler: ErrorHandler.handle,
  notFoundHandler,
  asyncHandler: ErrorHandler.asyncHandler
};