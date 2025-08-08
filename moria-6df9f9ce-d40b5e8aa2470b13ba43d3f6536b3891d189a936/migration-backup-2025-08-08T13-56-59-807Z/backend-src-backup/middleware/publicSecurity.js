// ========================================
// MIDDLEWARE DE SEGURANÇA PARA APIs PÚBLICAS
// ========================================

const rateLimit = require('express-rate-limit');

/**
 * Rate limiting mais restritivo para APIs públicas
 */
const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 requests por IP por janela de tempo
  message: {
    success: false,
    error: 'Muitas solicitações. Tente novamente em 15 minutos.',
    retryAfter: 900 // 15 minutos em segundos
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Pular rate limiting para health checks
    return req.path === '/api/public/health';
  },
});

/**
 * Rate limiting específico para buscas
 */
const searchRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // máximo 50 buscas por IP por 5 minutos
  message: {
    success: false,
    error: 'Muitas buscas realizadas. Tente novamente em alguns minutos.',
    retryAfter: 300
  },
});

/**
 * Cache simples em memória para dados públicos
 */
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    // Remove cache expirado
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  set(key, data, ttlSeconds = 300) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Instância global do cache
const publicCache = new SimpleCache();

/**
 * Middleware de cache para APIs públicas
 */
const cacheMiddleware = (ttlSeconds = 300) => {
  return (req, res, next) => {
    // Só fazer cache de requests GET
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.originalUrl}`;
    const cached = publicCache.get(cacheKey);

    if (cached) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Interceptar o método json para salvar no cache
    const originalJson = res.json;
    res.json = function(data) {
      // Só fazer cache de respostas de sucesso
      if (data && data.success !== false) {
        publicCache.set(cacheKey, data, ttlSeconds);
        console.log(`[CACHE SET] ${cacheKey}`);
      }
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware principal de segurança para APIs públicas
 */
const publicSecurityMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log de acesso público
  console.log(`[PUBLIC API] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')?.substring(0, 50)}`);
  
  // Headers de segurança
  res.set({
    'Cache-Control': 'public, max-age=300', // 5 minutos de cache
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });

  // Interceptar resposta para log de tempo
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`[PUBLIC API] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para validar filtros de busca
 */
const validateSearchFilters = (req, res, next) => {
  const { search, category, page, limit } = req.query;
  
  // Validar termo de busca
  if (search && (search.length < 2 || search.length > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Termo de busca deve ter entre 2 e 100 caracteres'
    });
  }

  // Validar categoria
  if (category && (typeof category !== 'string' || category.length > 50)) {
    return res.status(400).json({
      success: false,
      error: 'Categoria inválida'
    });
  }

  // Validar paginação
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Página deve ser um número positivo'
    });
  }

  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Limite deve ser um número entre 1 e 100'
    });
  }

  next();
};

/**
 * Middleware para detectar possíveis tentativas de acesso não autorizado
 */
const securityMonitor = (req, res, next) => {
  const suspiciousPatterns = [
    /admin/i,
    /login/i,
    /password/i,
    /token/i,
    /auth/i,
    /config/i,
    /database/i,
    /\.env/i,
    /\.config/i
  ];

  const url = req.originalUrl.toLowerCase();
  const userAgent = req.get('User-Agent') || '';

  // Detectar padrões suspeitos na URL
  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    console.warn(`[SECURITY] Possível tentativa de acesso não autorizado: ${req.ip} - ${url}`);
  }

  // Detectar user agents suspeitos
  if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
    console.log(`[BOT DETECTED] ${req.ip} - ${userAgent}`);
  }

  next();
};

/**
 * Middleware para limpeza periódica do cache
 */
const scheduleCleanup = () => {
  setInterval(() => {
    const cacheSize = publicCache.size();
    if (cacheSize > 1000) { // Limpar cache se muito grande
      publicCache.clear();
      console.log(`[CACHE CLEANUP] Cache limpo - tinha ${cacheSize} entradas`);
    }
  }, 30 * 60 * 1000); // A cada 30 minutos
};

// Inicializar limpeza do cache
scheduleCleanup();

module.exports = {
  publicRateLimit,
  searchRateLimit,
  publicSecurityMiddleware,
  cacheMiddleware,
  validateSearchFilters,
  securityMonitor,
  publicCache
};