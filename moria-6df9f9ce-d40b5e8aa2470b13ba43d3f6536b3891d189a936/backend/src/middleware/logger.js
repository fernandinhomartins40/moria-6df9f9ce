// Middleware de logging para todas as requisições
const logger = require('../config/logger');

const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Capturar IP real
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Override do res.end para capturar response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Determinar se é API pública
    const isPublicApi = req.path.startsWith('/api/public');
    
    if (isPublicApi) {
      logger.publicApiAccess(req.method, req.path, ip, statusCode, responseTime);
    } else {
      logger.apiAccess(req.method, req.path, ip, statusCode, responseTime, {
        userAgent: req.get('User-Agent'),
        contentLength: res.get('Content-Length') || 0
      });
    }
    
    // Log de erros HTTP
    if (statusCode >= 400) {
      logger.warn('HTTP Error Response', {
        method: req.method,
        path: req.path,
        statusCode,
        ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    // Chamar método original
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = loggingMiddleware;