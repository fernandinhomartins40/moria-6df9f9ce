// ========================================
// REQUEST LOGGER MIDDLEWARE - MORIA BACKEND
// Log estruturado de todas as requisições HTTP
// ========================================

const logger = require('../utils/logger');
const env = require('../config/environment');

function requestLogger(req, res, next) {
  if (!env.get('ENABLE_REQUEST_LOGGING')) {
    return next();
  }

  const startTime = Date.now();

  // Log da requisição inicial
  logger.debug('Request Started', {
    method: req.method,
    url: req.originalUrl,
    ip: logger.getClientIP(req),
    userAgent: req.headers['user-agent']
  });

  // Interceptar resposta
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;

    // Log da resposta
    logger.logRequest(req, res, responseTime);

    // Log adicional para erros
    if (res.statusCode >= 400) {
      logger.warn('HTTP Error Response', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.user?.id,
        response: res.statusCode >= 500 ? data : undefined
      });
    }

    originalSend.call(this, data);
  };

  next();
}

module.exports = requestLogger;