// ========================================
// API SERVICE - Single Tenant
// ========================================

/**
 * Configuração base da API
 * - Em desenvolvimento: usa proxy do Vite (/api -> http://localhost:3080/api)
 * - Em produção: usa paths relativos (/api - mesmo servidor)
 */

const API_BASE_URL = '/api'; // Sempre usar path relativo

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Método privado para fazer requisições HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = { ...defaultOptions, ...options };

    // Se há body e é objeto, converter para JSON
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${config.method} ${url}):`, error);
      throw error;
    }
  }

  // ========================================
  // HEALTH CHECK
  // ========================================

  async healthCheck() {
    return this.request('/health');
  }

  // ========================================
  // DASHBOARD / STATS
  // ========================================

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // ========================================
  // PRODUCTS
  // ========================================

  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.active !== undefined) params.append('active', filters.active);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: productData,
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // ORDERS
  // ========================================

  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.customer) params.append('customer', filters.customer);

    const queryString = params.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    return this.request(endpoint);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: orderData,
    });
  }

  // ========================================
  // SERVICES
  // ========================================

  async getServices(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.active !== undefined) params.append('active', filters.active);

    const queryString = params.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    
    return this.request(endpoint);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

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
}

// Instância singleton
const api = new ApiService();

// ========================================
// EXPORT - Métodos diretos para facilitar uso
// ========================================

export default api;

// Exports nomeados para conveniência
export const {
  healthCheck,
  getDashboardStats,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  createOrder,
  getServices,
  formatPrice,
  formatDate,
  formatDateTime
} = api;

// ========================================
// EXEMPLO DE USO:
// ========================================

/*
// Importar o service completo
import api from '@/services/api.js';
const products = await api.getProducts({ active: true });

// Ou importar métodos específicos
import { getProducts, createProduct } from '@/services/api.js';
const products = await getProducts({ category: 'Filtros' });

// Health check
import { healthCheck } from '@/services/api.js';
const health = await healthCheck();

// Com tratamento de erros
try {
  const products = await getProducts();
  console.log('Produtos:', products.data);
} catch (error) {
  console.error('Erro ao carregar produtos:', error.message);
}
*/