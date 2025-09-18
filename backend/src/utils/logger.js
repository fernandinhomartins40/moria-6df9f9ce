// ========================================
// PINO LOGGER - MORIA BACKEND
// Sistema de logging profissional simplificado
// ========================================

const pino = require('pino');
const pinoHttp = require('pino-http');
const env = require('../config/environment');

// Configuração do logger principal
const logger = pino({
  level: env.get('LOG_LEVEL'),
  transport: env.isDevelopment() ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname'
    }
  } : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  }
});

// Middleware para logging HTTP
const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.connection?.remoteAddress || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent']
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders?.()
    })
  }
});

// Funções de conveniência
const debug = (message, meta = {}) => logger.debug(meta, message);
const info = (message, meta = {}) => logger.info(meta, message);
const warn = (message, meta = {}) => logger.warn(meta, message);
const error = (message, meta = {}) => logger.error(meta, message);

// Log de requisições HTTP
const logRequest = (req, res, responseTime) => {
  info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    contentLength: res.get('content-length'),
    userId: req.user?.id
  });
};

// Log de operações de banco
const logDatabase = (operation, table, data = {}) => {
  debug('Database Operation', {
    operation,
    table,
    ...data
  });
};

// Log de autenticação
const logAuth = (action, userId, details = {}) => {
  info('Authentication', {
    action,
    userId,
    ...details
  });
};

// Log de erros de validação
const logValidation = (errors, context = {}) => {
  warn('Validation Failed', {
    errors,
    context
  });
};

// Log de performance
const logPerformance = (operation, duration, details = {}) => {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger[level]('Performance', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

module.exports = {
  logger,
  httpLogger,
  debug,
  info,
  warn,
  error,
  logRequest,
  logDatabase,
  logAuth,
  logValidation,
  logPerformance
};