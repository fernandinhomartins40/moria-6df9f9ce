// ========================================
// SERVICE PÚBLICO - APIs sem autenticação
// ========================================
// Service específico para dados públicos das páginas acessíveis sem login

/**
 * Configuração para APIs públicas
 */
const config = {
  API_BASE_URL: '/api/public',
  ENABLE_LOGS: import.meta.env.DEV,
  REQUEST_TIMEOUT: 10000,
  // Cache local para dados públicos (5 minutos)
  CACHE_TTL: 5 * 60 * 1000,
};

/**
 * Cache local simples para dados públicos
 */
class LocalCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < config.CACHE_TTL) {
      return cached.data;
    }
    // Remove cache expirado
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

const localCache = new LocalCache();

/**
 * Service para APIs públicas
 */
class PublicDataService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  /**
   * Log helper para desenvolvimento
   */
  log(message, data = null) {
    if (config.ENABLE_LOGS) {
      console.log(`[PUBLIC API] ${message}`, data || '');
    }
  }

  /**
   * Método privado para fazer requisições HTTP públicas
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const requestConfig = { ...defaultOptions, ...options };

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.REQUEST_TIMEOUT);
    requestConfig.signal = controller.signal;

    try {
      this.log(`${requestConfig.method} ${url}`);
      
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        this.log(`Error ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }

      this.log(`Success ${response.status}:`, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error(`Timeout: Request took longer than ${config.REQUEST_TIMEOUT}ms`);
        this.log('Timeout error:', timeoutError.message);
        throw timeoutError;
      }
      
      this.log(`Network error:`, error.message);
      throw error;
    }
  }

  /**
   * Wrapper para requests com cache
   */
  async cachedRequest(endpoint, cacheKey = null) {
    const key = cacheKey || endpoint;
    
    // Verificar cache primeiro
    const cached = localCache.get(key);
    if (cached) {
      this.log(`Cache hit for ${key}`);
      return cached;
    }

    try {
      const data = await this.request(endpoint);
      localCache.set(key, data);
      return data;
    } catch (error) {
      // Em caso de erro, retornar estrutura de fallback
      this.log(`Error in ${endpoint}, returning fallback`);
      return {
        success: false,
        data: [],
        error: error.message,
        fallback: true
      };
    }
  }

  // ========================================
  // HEALTH CHECK PÚBLICO
  // ========================================
  async healthCheck() {
    return this.request('/health');
  }

  // ========================================
  // PRODUTOS PÚBLICOS
  // ========================================

  /**
   * Listar produtos públicos
   */
  async getPublicProducts(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== 'Todos') {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    if (filters.sort) {
      params.append('sort', filters.sort);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    const cacheKey = `products_${queryString}`;
    
    return this.cachedRequest(endpoint, cacheKey);
  }

  /**
   * Buscar produto público específico
   */
  async getPublicProduct(id) {
    const endpoint = `/products/${id}`;
    const cacheKey = `product_${id}`;
    
    return this.cachedRequest(endpoint, cacheKey);
  }

  /**
   * Listar categorias de produtos públicas
   */
  async getPublicProductCategories() {
    const endpoint = '/products/categories';
    const cacheKey = 'product_categories';
    
    return this.cachedRequest(endpoint, cacheKey);
  }

  // ========================================
  // SERVIÇOS PÚBLICOS
  // ========================================

  /**
   * Listar serviços públicos
   */
  async getPublicServices(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    const cacheKey = `services_${queryString}`;
    
    return this.cachedRequest(endpoint, cacheKey);
  }

  /**
   * Buscar serviço público específico
   */
  async getPublicService(id) {
    const endpoint = `/services/${id}`;
    const cacheKey = `service_${id}`;
    
    return this.cachedRequest(endpoint, cacheKey);
  }

  // ========================================
  // PROMOÇÕES PÚBLICAS
  // ========================================

  /**
   * Listar promoções públicas ativas
   */
  async getPublicPromotions() {
    const endpoint = '/promotions';
    const cacheKey = 'active_promotions';
    
    return this.cachedRequest(endpoint, cacheKey);
  }

  // ========================================
  // BUSCA GLOBAL PÚBLICA
  // ========================================

  /**
   * Busca global em produtos e serviços públicos
   */
  async searchPublic(query, filters = {}) {
    if (!query || query.length < 2) {
      return {
        success: false,
        error: 'Termo de busca deve ter pelo menos 2 caracteres',
        data: { products: [], services: [] }
      };
    }

    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const queryString = params.toString();
    const endpoint = `/search?${queryString}`;
    
    // Não fazer cache de buscas (dados muito dinâmicos)
    return this.request(endpoint);
  }

  // ========================================
  // INFORMAÇÕES GERAIS PÚBLICAS
  // ========================================

  /**
   * Informações gerais da empresa e estatísticas públicas
   */
  async getPublicInfo() {
    const endpoint = '/info';
    const cacheKey = 'public_info';
    
    return this.cachedRequest(endpoint, cacheKey);
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  /**
   * Limpar cache local
   */
  clearCache() {
    localCache.clear();
    this.log('Cache local limpo');
  }

  /**
   * Helper para formatar preços
   */
  formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  /**
   * Helper para formatar datas
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  /**
   * Helper para formatar data e hora
   */
  formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('pt-BR');
  }

  /**
   * Helper para verificar se dados são do cache
   */
  isFromCache(response) {
    return response && response.cached === true;
  }

  /**
   * Helper para verificar se resposta é de fallback (erro)
   */
  isFallback(response) {
    return response && response.fallback === true;
  }

  /**
   * Helper para processar resposta da API pública
   */
  processPublicResponse(response) {
    if (!response || !response.success) {
      return {
        data: [],
        error: response?.error || 'Erro desconhecido',
        total: 0,
        pagination: null
      };
    }

    return {
      data: response.data || [],
      total: response.total || response.data?.length || 0,
      pagination: response.pagination || null,
      error: null,
      cached: this.isFromCache(response),
      fallback: this.isFallback(response)
    };
  }
}

// Instância singleton do serviço público
const publicDataService = new PublicDataService();

// ========================================
// EXPORT - Métodos diretos para facilitar uso
// ========================================

export default publicDataService;

// Exports nomeados para conveniência
export const {
  healthCheck,
  getPublicProducts,
  getPublicProduct,
  getPublicProductCategories,
  getPublicServices,
  getPublicService,
  getPublicPromotions,
  searchPublic,
  getPublicInfo,
  clearCache,
  formatPrice,
  formatDate,
  formatDateTime,
  processPublicResponse
} = publicDataService;

// ========================================
// EXEMPLO DE USO:
// ========================================

/*
// Importar o service completo
import publicDataService from '@/services/publicDataService.js';
const products = await publicDataService.getPublicProducts({ category: 'Motor' });

// Ou importar métodos específicos
import { getPublicProducts, searchPublic } from '@/services/publicDataService.js';
const products = await getPublicProducts({ category: 'Filtros' });

// Com tratamento de erro e fallback
try {
  const response = await getPublicProducts();
  const { data, error, fallback } = publicDataService.processPublicResponse(response);
  
  if (error && !fallback) {
    console.error('Erro ao carregar produtos:', error);
    // Mostrar mensagem de erro para usuário
  } else if (data.length === 0) {
    // Mostrar mensagem de "nenhum produto encontrado"
  } else {
    // Renderizar produtos normalmente
    console.log('Produtos carregados:', data);
  }
} catch (error) {
  console.error('Erro crítico:', error);
  // Fallback para dados estáticos ou página de erro
}
*/