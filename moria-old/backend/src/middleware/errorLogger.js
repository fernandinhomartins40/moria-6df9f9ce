// ========================================
// ERROR LOGGER MIDDLEWARE - MORIA BACKEND
// Log estruturado de erros categorizados
// ========================================

const logger = require('../utils/logger');

function errorLogger(err, req, res, next) {
  // Categorizar erro
  const errorCategory = categorizeError(err);

  // Preparar contexto do erro
  const errorContext = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    category: errorCategory,
    url: req.originalUrl,
    method: req.method,
    ip: logger.getClientIP(req),
    userId: req.user?.id,
    headers: req.headers,
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query
  };

  // Log baseado na severidade
  switch (errorCategory) {
    case 'VALIDATION':
      logger.logValidation([err.message], errorContext);
      break;
    case 'AUTHENTICATION':
      logger.logAuth('failed', req.user?.id, errorContext);
      break;
    case 'DATABASE':
      logger.error('Database Error', errorContext);
      break;
    case 'NETWORK':
      logger.warn('Network Error', errorContext);
      break;
    default:
      logger.error('Unhandled Error', errorContext);
  }

  next(err);
}

function categorizeError(err) {
  if (err.name === 'ValidationError') return 'VALIDATION';
  if (err.name === 'UnauthorizedError') return 'AUTHENTICATION';
  if (err.code === 'SQLITE_ERROR') return 'DATABASE';
  if (err.code === 'ECONNRESET') return 'NETWORK';
  if (err.status === 404) return 'NOT_FOUND';
  if (err.status >= 400 && err.status < 500) return 'CLIENT_ERROR';
  if (err.status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

module.exports = errorLogger;