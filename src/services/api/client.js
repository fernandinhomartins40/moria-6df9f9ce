// API Client robusto com retry, circuit breaker e cache
class RobustApiClient {
  constructor() {
    this.baseURL = import.meta.env.NODE_ENV === 'development' 
      ? 'http://localhost:3081/api'
      : '/api';
    
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 segundo base
    this.timeout = 10000; // 10 segundos
    
    // Circuit breaker simples
    this.circuitBreaker = {
      failures: 0,
      threshold: 5,
      timeout: 30000, // 30 segundos
      nextAttempt: Date.now()
    };
    
    // Cache local
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    
    this.debug = import.meta.env.NODE_ENV === 'development';
  }

  log(level, message, data = null) {
    if (this.debug) {
      const timestamp = new Date().toISOString();
      console[level](`[API Client ${timestamp}] ${message}`, data || '');
    }
  }

  // Verificar se circuit breaker está aberto
  isCircuitOpen() {
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      if (Date.now() < this.circuitBreaker.nextAttempt) {
        return true;
      }
      // Reset do circuit breaker após timeout
      this.circuitBreaker.failures = 0;
    }
    return false;
  }

  // Marcar falha no circuit breaker
  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.nextAttempt = Date.now() + this.circuitBreaker.timeout;
    this.log('warn', 'Circuit breaker failure recorded', {
      failures: this.circuitBreaker.failures,
      threshold: this.circuitBreaker.threshold
    });
  }

  // Reset do circuit breaker em caso de sucesso
  recordSuccess() {
    if (this.circuitBreaker.failures > 0) {
      this.log('info', 'Circuit breaker reset - connection restored');
      this.circuitBreaker.failures = 0;
    }
  }

  // Gerar chave de cache
  getCacheKey(method, endpoint, data) {
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${endpoint}:${dataStr}`;
  }

  // Verificar cache
  getFromCache(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      this.log('info', 'Cache hit', cacheKey);
      return cached.data;
    }
    return null;
  }

  // Salvar no cache
  saveToCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    // Limpar cache antigo (simples)
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  // Request principal com todas as funcionalidades
  async request(method, endpoint, data = null, options = {}) {
    // Verificar circuit breaker
    if (this.isCircuitOpen()) {
      const error = new Error('Circuit breaker is open - service unavailable');
      error.isCircuitBreakerError = true;
      throw error;
    }

    // Verificar cache para GET requests
    const cacheKey = this.getCacheKey(method, endpoint, data);
    if (method === 'GET' && !options.skipCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = Date.now();
    let lastError;

    // Retry logic
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.log('info', `Request attempt ${attempt}/${this.retryAttempts}`, {
          method,
          endpoint,
          hasData: !!data
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const responseTime = Date.now() - startTime;

        // Sucesso - reset circuit breaker e cache
        this.recordSuccess();
        
        if (method === 'GET') {
          this.saveToCache(cacheKey, result);
        }

        this.log('info', 'Request successful', {
          method,
          endpoint,
          responseTime,
          cached: false
        });

        return result;

      } catch (error) {
        lastError = error;
        const responseTime = Date.now() - startTime;
        
        this.log('error', `Request attempt ${attempt} failed`, {
          method,
          endpoint,
          error: error.message,
          responseTime
        });

        // Se for o último attempt ou erro não recuperável
        if (attempt === this.retryAttempts || 
            error.name === 'AbortError' || 
            (error.message.includes('HTTP 4') && !error.message.includes('HTTP 429'))) {
          break;
        }

        // Delay exponencial entre tentativas
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Falha após todas as tentativas
    this.recordFailure();
    
    // Tentar cache como fallback para GET requests
    if (method === 'GET') {
      const staleCache = this.cache.get(cacheKey);
      if (staleCache) {
        this.log('warn', 'Using stale cache due to API failure', cacheKey);
        return {
          ...staleCache.data,
          _isStale: true,
          _error: lastError.message
        };
      }
    }

    throw lastError;
  }

  // Métodos de conveniência
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  // Método para limpar cache
  clearCache(pattern = null) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
      this.log('info', 'Cache cleared for pattern', pattern);
    } else {
      this.cache.clear();
      this.log('info', 'All cache cleared');
    }
  }

  // Status do cliente
  getStatus() {
    return {
      circuitBreaker: {
        isOpen: this.isCircuitOpen(),
        failures: this.circuitBreaker.failures,
        threshold: this.circuitBreaker.threshold
      },
      cache: {
        size: this.cache.size,
        maxSize: 100
      },
      config: {
        baseURL: this.baseURL,
        retryAttempts: this.retryAttempts,
        timeout: this.timeout
      }
    };
  }

  // Health check da API
  async healthCheck() {
    try {
      const result = await this.get('/health', { skipCache: true });
      this.log('info', 'Health check successful', result);
      return result;
    } catch (error) {
      this.log('error', 'Health check failed', error.message);
      throw error;
    }
  }
}

// Instância singleton
export const apiClient = new RobustApiClient();

// Para debugging em desenvolvimento
if (import.meta.env.NODE_ENV === 'development') {
  window.apiClient = apiClient;
}

export default apiClient;