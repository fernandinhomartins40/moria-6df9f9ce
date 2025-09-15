// ========================================
// WINSTON LOGGER - MORIA BACKEND
// Sistema de logging profissional estruturado
// ========================================

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const env = require('../config/environment');
const LogSanitizer = require('./logSanitizer');

class Logger {
  constructor() {
    this.logger = this.createLogger();
  }

  createLogger() {
    const formats = [];

    // Timestamp
    formats.push(winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }));

    // Errors com stack trace
    formats.push(winston.format.errors({ stack: true }));

    // Metadata adicional
    formats.push(winston.format.metadata({
      fillExcept: ['message', 'level', 'timestamp']
    }));

    // Formato para desenvolvimento
    if (env.isDevelopment()) {
      formats.push(winston.format.colorize());
      formats.push(winston.format.printf(({ timestamp, level, message, metadata }) => {
        let log = `${timestamp} [${level}]: ${message}`;

        if (Object.keys(metadata).length > 0) {
          log += ` ${JSON.stringify(metadata, null, 2)}`;
        }

        return log;
      }));
    } else {
      // Formato JSON para produção
      formats.push(winston.format.json());
    }

    const transports = [];

    // Console sempre ativo
    transports.push(new winston.transports.Console({
      level: env.get('LOG_LEVEL'),
      handleExceptions: true,
      handleRejections: true
    }));

    // Arquivos apenas se habilitado
    if (env.get('LOG_FILE')) {
      // Log geral com rotação diária
      transports.push(new DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info'
      }));

      // Log de erros separado
      transports.push(new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error'
      }));

      // Log de acesso HTTP
      transports.push(new DailyRotateFile({
        filename: 'logs/access-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '50m',
        maxFiles: '14d',
        level: 'http'
      }));
    }

    return winston.createLogger({
      level: env.get('LOG_LEVEL'),
      format: winston.format.combine(...formats),
      transports,
      exitOnError: false
    });
  }

  // Métodos de conveniência
  debug(message, meta = {}) {
    this.logger.debug(message, LogSanitizer.sanitize(meta));
  }

  info(message, meta = {}) {
    this.logger.info(message, LogSanitizer.sanitize(meta));
  }

  warn(message, meta = {}) {
    this.logger.warn(message, LogSanitizer.sanitize(meta));
  }

  error(message, meta = {}) {
    this.logger.error(message, LogSanitizer.sanitize(meta));
  }

  http(message, meta = {}) {
    this.logger.http(message, LogSanitizer.sanitize(meta));
  }

  // Log de requisições HTTP
  logRequest(req, res, responseTime) {
    const { method, originalUrl, ip, headers } = req;
    const { statusCode } = res;

    this.http('HTTP Request', {
      method,
      url: originalUrl,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip: this.getClientIP(req),
      userAgent: headers['user-agent'],
      contentLength: res.get('content-length'),
      userId: req.user?.id
    });
  }

  // Log de operações de banco
  logDatabase(operation, table, data = {}) {
    this.debug('Database Operation', {
      operation,
      table,
      ...data
    });
  }

  // Log de autenticação
  logAuth(action, userId, details = {}) {
    this.info('Authentication', {
      action,
      userId,
      ...details
    });
  }

  // Log de erros de validação
  logValidation(errors, context = {}) {
    this.warn('Validation Failed', {
      errors,
      context
    });
  }

  // Log de performance
  logPerformance(operation, duration, details = {}) {
    const level = duration > 1000 ? 'warn' : 'debug';
    this.logger.log(level, 'Performance', {
      operation,
      duration: `${duration}ms`,
      ...details
    });
  }

  getClientIP(req) {
    return req.headers['x-forwarded-for'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
  }

  // Stream para Morgan (log de acesso HTTP)
  getHttpStream() {
    return {
      write: (message) => {
        this.http(message.trim());
      }
    };
  }
}

module.exports = new Logger();