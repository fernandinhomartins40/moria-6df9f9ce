// ========================================
// RATE LIMITER PROFISSIONAL - MORIA BACKEND
// Sistema escalável de rate limiting - Fase 4
// ========================================

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const logger = require('../utils/logger');
const env = require('../config/environment');

// Import helper para IPv6 adequado
const { ipKeyGenerator } = require('express-rate-limit');

class RateLimiter {
  constructor() {
    logger.info('Rate Limiting ativo em memória');
  }

  createLimiter(options = {}) {
    const defaultOptions = {
      windowMs: env.get('RATE_LIMIT_WINDOW_MS'),
      max: env.get('RATE_LIMIT_MAX_REQUESTS'),
      message: {
        success: false,
        error: 'Muitas requisições, tente novamente mais tarde',
        retryAfter: Math.ceil(env.get('RATE_LIMIT_WINDOW_MS') / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res, next) => {
        logger.warn('Rate Limit Exceeded', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          url: req.originalUrl,
          userId: req.user?.id
        });

        res.status(429).json({
          success: false,
          error: 'Muitas requisições, tente novamente mais tarde',
          retryAfter: Math.ceil(options.windowMs / 1000)
        });
      }
    };

    return rateLimit({ ...defaultOptions, ...options });
  }

  // Rate limiter geral
  general() {
    return this.createLimiter();
  }

  // Rate limiter para autenticação (mais restritivo)
  auth() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 5, // 5 tentativas
      message: {
        success: false,
        error: 'Muitas tentativas de login, aguarde 15 minutos',
        retryAfter: 900
      }
    });
  }

  // Rate limiter para API (por usuário)
  api() {
    return this.createLimiter({
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 30, // 30 requisições por minuto
      keyGenerator: (req) => {
        // Rate limit por usuário se autenticado, senão por IP (IPv6-safe)
        return req.user?.id || ipKeyGenerator(req);
      }
    });
  }

  // Rate limiter para upload
  upload() {
    return this.createLimiter({
      windowMs: 10 * 60 * 1000, // 10 minutos
      max: 5, // 5 uploads
      message: {
        success: false,
        error: 'Muitos uploads, aguarde 10 minutos',
        retryAfter: 600
      }
    });
  }

  // Slow down para performance
  slowDown() {
    return slowDown({
      windowMs: 1 * 60 * 1000, // 1 minuto
      delayAfter: 10, // após 10 requisições
      delayMs: () => 500, // delay inicial de 500ms
      maxDelayMs: 20000 // máximo 20s
    });
  }

  // Rate limiter adaptativo baseado em carga do servidor
  adaptive() {
    return (req, res, next) => {
      const loadAvg = require('os').loadavg()[0];
      const cpuUsage = process.cpuUsage();
      const memUsage = process.memoryUsage();

      // Calcular fator de carga (0-1)
      const loadFactor = Math.min(1, loadAvg / require('os').cpus().length);
      const memFactor = memUsage.heapUsed / memUsage.heapTotal;

      // Ajustar limite baseado na carga
      const baseLimits = 30;
      const adjustedLimit = Math.max(5, Math.floor(baseLimits * (1 - Math.max(loadFactor, memFactor))));

      const dynamicLimiter = this.createLimiter({
        max: adjustedLimit,
        windowMs: 1 * 60 * 1000
      });

      dynamicLimiter(req, res, next);
    };
  }

  // Rate limiter para rotas sensíveis (admin)
  admin() {
    return this.createLimiter({
      windowMs: 5 * 60 * 1000, // 5 minutos
      max: 20, // 20 requisições
      keyGenerator: (req) => {
        return req.user?.id || ipKeyGenerator(req);
      },
      message: {
        success: false,
        error: 'Limite de requisições administrativas excedido',
        retryAfter: 300
      }
    });
  }

  // Rate limiter para busca/pesquisa
  search() {
    return this.createLimiter({
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 10, // 10 pesquisas por minuto
      message: {
        success: false,
        error: 'Muitas pesquisas, aguarde um momento',
        retryAfter: 60
      }
    });
  }

  // Rate limiter por IP específico (mais restritivo)
  strict() {
    return this.createLimiter({
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 10, // 10 requisições por minuto
      keyGenerator: ipKeyGenerator,
      message: {
        success: false,
        error: 'Rate limit restrito ativo',
        retryAfter: 60
      }
    });
  }
}

module.exports = new RateLimiter();