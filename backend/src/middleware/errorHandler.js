// Error handler robusto com logging estruturado
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Log completo do erro
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Determinar tipo de erro e resposta apropriada
  let statusCode = err.status || err.statusCode || 500;
  let message = 'Erro interno do servidor';
  let details = null;

  // Erros específicos do Prisma
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Dados duplicados - este registro já existe';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Registro não encontrado';
  } else if (err.code?.startsWith('P')) {
    statusCode = 400;
    message = 'Erro de banco de dados';
  }

  // Erros de validação
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dados inválidos';
    if (process.env.NODE_ENV === 'development') {
      details = err.message;
    }
  }

  // Erros de sintaxe JSON
  if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Formato JSON inválido';
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    statusCode = 429;
    message = 'Muitas requisições - tente novamente em alguns minutos';
  }

  // Preparar resposta
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  // Adicionar detalhes em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    response.details = details || err.message;
    response.stack = err.stack;
  }

  // Log específico para diferentes severidades
  if (statusCode >= 500) {
    logger.error('Server Error', {
      statusCode,
      message: err.message,
      stack: err.stack,
      url: req.url
    });
  } else if (statusCode >= 400) {
    logger.warn('Client Error', {
      statusCode,
      message: err.message,
      url: req.url,
      ip: req.ip
    });
  }

  res.status(statusCode).json(response);
};

// Handler para rotas não encontradas
const notFoundHandler = (req, res) => {
  const message = req.path.startsWith('/api/') 
    ? 'API endpoint não encontrado' 
    : 'Página não encontrada';
    
  logger.warn('404 Not Found', {
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    error: message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};