// ========================================
// ERROR HANDLER MIDDLEWARE - MORIA BACKEND
// Tratamento centralizado de erros
// ========================================

// Middleware de tratamento de erro global
const errorHandler = (error, req, res, next) => {
  console.error('Erro capturado pelo middleware:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Erro de validação do Joi
  if (error.isJoi || error.details) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: error.details?.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erro de duplicação no banco (SQLite UNIQUE constraint)
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.errno === 19) {
    return res.status(409).json({
      success: false,
      message: 'Dados já existem no sistema',
      details: 'Conflito de dados únicos'
    });
  }

  // Erro de banco de dados
  if (error.code && error.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      success: false,
      message: 'Erro no banco de dados',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação inválido'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação expirado'
    });
  }

  // Erro de recurso não encontrado
  if (error.name === 'NotFoundError' || error.status === 404) {
    return res.status(404).json({
      success: false,
      message: 'Recurso não encontrado'
    });
  }

  // Erro de permissão
  if (error.name === 'UnauthorizedError' || error.status === 403) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado'
    });
  }

  // Erro interno do servidor (padrão)
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

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

// Wrapper para async functions
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Classe de erro customizada
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
};