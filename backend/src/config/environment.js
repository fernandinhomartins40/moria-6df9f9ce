// ========================================
// ENVIRONMENT MANAGER - MORIA BACKEND
// Centralizador de configurações e ambiente
// ========================================

const path = require('path');

class EnvironmentManager {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.config = this.loadConfig();
  }

  loadConfig() {
    const baseConfig = {
      // Servidor
      PORT: this.getNumber('PORT', 3001),
      HOST: this.getString('HOST', '0.0.0.0'),

      // Database
      DATABASE_URL: this.getString('DATABASE_URL', 'file:./dev.db'),
      DATABASE_POOL_MIN: this.getNumber('DATABASE_POOL_MIN', 2),
      DATABASE_POOL_MAX: this.getNumber('DATABASE_POOL_MAX', 10),

      // JWT
      JWT_SECRET: this.getString('JWT_SECRET', this.generateSecret()),
      JWT_EXPIRES_IN: this.getString('JWT_EXPIRES_IN', '24h'),
      REFRESH_TOKEN_EXPIRES_IN: this.getString('REFRESH_TOKEN_EXPIRES_IN', '7d'),

      // CORS
      CORS_ORIGIN: this.getString('CORS_ORIGIN', 'http://localhost:5173'),
      CORS_CREDENTIALS: this.getBoolean('CORS_CREDENTIALS', true),

      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: this.getNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
      RATE_LIMIT_MAX_REQUESTS: this.getNumber('RATE_LIMIT_MAX_REQUESTS', 100),

      // Logging
      LOG_LEVEL: this.getString('LOG_LEVEL', this.env === 'production' ? 'warn' : 'debug'),
      LOG_FILE: this.getBoolean('LOG_FILE', this.env === 'production'),

      // Redis (opcional)
      REDIS_URL: this.getString('REDIS_URL', null),
      REDIS_PASSWORD: this.getString('REDIS_PASSWORD', null),

      // Uploads
      UPLOAD_MAX_SIZE: this.getNumber('UPLOAD_MAX_SIZE', 5 * 1024 * 1024), // 5MB
      UPLOAD_ALLOWED_TYPES: this.getString('UPLOAD_ALLOWED_TYPES', 'image/jpeg,image/png,image/webp'),

      // Features
      ENABLE_RATE_LIMITING: this.getBoolean('ENABLE_RATE_LIMITING', true),
      ENABLE_REQUEST_LOGGING: this.getBoolean('ENABLE_REQUEST_LOGGING', true),
      ENABLE_CORS: this.getBoolean('ENABLE_CORS', true),
      ENABLE_COMPRESSION: this.getBoolean('ENABLE_COMPRESSION', true),

      // Security
      BCRYPT_ROUNDS: this.getNumber('BCRYPT_ROUNDS', 12),
      SESSION_SECRET: this.getString('SESSION_SECRET', this.generateSecret()),

      // API
      API_PREFIX: this.getString('API_PREFIX', '/api'),
      API_VERSION: this.getString('API_VERSION', 'v1'),

      // Application
      APP_NAME: this.getString('APP_NAME', 'Moria Backend'),
      APP_VERSION: this.getString('APP_VERSION', '1.0.0'),
      APP_DESCRIPTION: this.getString('APP_DESCRIPTION', 'Sistema de gestão automotiva')
    };

    // Configurações específicas por ambiente
    if (this.env === 'test') {
      baseConfig.DATABASE_URL = 'file:./test.db';
      baseConfig.LOG_LEVEL = 'error';
      baseConfig.JWT_SECRET = 'test-secret-key-for-testing-only';
      baseConfig.ENABLE_REQUEST_LOGGING = false;
      baseConfig.ENABLE_RATE_LIMITING = false;
    }

    if (this.env === 'development') {
      baseConfig.LOG_LEVEL = 'debug';
      baseConfig.ENABLE_REQUEST_LOGGING = true;
    }

    if (this.env === 'production') {
      this.validateProductionConfig(baseConfig);
    }

    return baseConfig;
  }

  getString(key, defaultValue) {
    return process.env[key] || defaultValue;
  }

  getNumber(key, defaultValue) {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  getBoolean(key, defaultValue) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  getArray(key, defaultValue = []) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  generateSecret() {
    if (this.env === 'production') {
      // Em produção, retorna um padrão se não estiver definido
      return 'moria-production-jwt-secret-default-change-this-in-env';
    }
    return `dev-secret-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  validateProductionConfig(config) {
    const requiredKeys = ['JWT_SECRET', 'DATABASE_URL'];
    const missing = requiredKeys.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Variáveis obrigatórias em produção: ${missing.join(', ')}`);
    }

    if (config.JWT_SECRET.includes('dev') || config.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET muito simples para produção (mínimo 32 caracteres)');
    }

    if (config.SESSION_SECRET.includes('dev') || config.SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET muito simples para produção (mínimo 32 caracteres)');
    }

    // Validar URL do banco
    try {
      if (config.DATABASE_URL.startsWith('http')) {
        new URL(config.DATABASE_URL);
      }
    } catch (error) {
      throw new Error('DATABASE_URL inválida para produção');
    }

    // Validar CORS Origin
    try {
      new URL(config.CORS_ORIGIN);
    } catch (error) {
      throw new Error('CORS_ORIGIN deve ser uma URL válida em produção');
    }
  }

  get(key) {
    return this.config[key];
  }

  getAll() {
    return { ...this.config };
  }

  // Helpers de ambiente
  isProduction() {
    return this.env === 'production';
  }

  isDevelopment() {
    return this.env === 'development';
  }

  isTest() {
    return this.env === 'test';
  }

  getEnvironment() {
    return this.env;
  }

  // Debug info
  getDebugInfo() {
    const sensitiveKeys = ['JWT_SECRET', 'SESSION_SECRET', 'REDIS_PASSWORD'];
    const debugConfig = { ...this.config };

    sensitiveKeys.forEach(key => {
      if (debugConfig[key]) {
        debugConfig[key] = '[REDACTED]';
      }
    });

    return {
      environment: this.env,
      node_version: process.version,
      platform: process.platform,
      config: debugConfig
    };
  }

  // Validar configuração atual
  validate() {
    const errors = [];

    // Validações básicas
    if (this.get('PORT') < 1 || this.get('PORT') > 65535) {
      errors.push('PORT deve estar entre 1 e 65535');
    }

    if (this.get('BCRYPT_ROUNDS') < 10 || this.get('BCRYPT_ROUNDS') > 15) {
      errors.push('BCRYPT_ROUNDS deve estar entre 10 e 15');
    }

    if (this.get('UPLOAD_MAX_SIZE') > 50 * 1024 * 1024) {
      errors.push('UPLOAD_MAX_SIZE não deve exceder 50MB');
    }

    // Validar tipos de arquivo permitidos
    const allowedTypes = this.get('UPLOAD_ALLOWED_TYPES').split(',');
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalidTypes = allowedTypes.filter(type => !validMimeTypes.includes(type.trim()));

    if (invalidTypes.length > 0) {
      errors.push(`Tipos de arquivo inválidos: ${invalidTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new EnvironmentManager();