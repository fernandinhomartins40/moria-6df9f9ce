// Sistema de logs estruturado com Winston - Moria Backend
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Garantir que o diretório de logs existe
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Formato customizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    // Adicionar stack trace se houver erro
    if (stack) {
      logMessage += `\nStack: ${stack}`;
    }
    
    // Adicionar metadados se houver
    if (Object.keys(meta).length > 0) {
      logMessage += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Formato JSON para arquivos
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  defaultMeta: { 
    service: 'moria-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Log de erros separado
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Log geral
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    
    // Log de acesso para APIs públicas
    new winston.transports.File({ 
      filename: path.join(logsDir, 'public-access.log'),
      level: 'info',
      maxsize: 5242880,
      maxFiles: 3
    })
  ],
  
  // Tratar exceções não capturadas
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  ],
  
  // Tratar rejeições de Promise
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
  ]
});

// Console transport para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: customFormat,
    level: 'debug'
  }));
}

// Métodos de conveniência
logger.apiAccess = (method, path, ip, statusCode, responseTime, meta = {}) => {
  logger.info('API Access', {
    type: 'api_access',
    method,
    path,
    ip,
    statusCode,
    responseTime,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

logger.publicApiAccess = (method, path, ip, statusCode, responseTime, cached = false) => {
  logger.info('Public API Access', {
    type: 'public_api_access', 
    method,
    path,
    ip,
    statusCode,
    responseTime,
    cached,
    timestamp: new Date().toISOString()
  });
};

logger.systemEvent = (event, details = {}) => {
  logger.info('System Event', {
    type: 'system_event',
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.databaseEvent = (operation, table, duration, meta = {}) => {
  logger.info('Database Event', {
    type: 'database_event',
    operation,
    table,
    duration,
    ...meta,
    timestamp: new Date().toISOString()
  });
};

// Log inicial
logger.systemEvent('logger_initialized', {
  logLevel: logger.level,
  logsDirectory: logsDir,
  environment: process.env.NODE_ENV || 'development'
});

module.exports = logger;