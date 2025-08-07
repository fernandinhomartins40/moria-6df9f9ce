// ========================================
// API SERVICE - Single Tenant
// ========================================

/**
 * Configuração base da API
 * - Em desenvolvimento: usa proxy do Vite (/api -> http://localhost:3081/api)
 * - Em produção: usa paths relativos (/api - mesmo servidor)
 */

// Configuração environment-aware
const config = {
  API_BASE_URL: '/api', // Sempre usar path relativo
  ENABLE_LOGS: import.meta.env.DEV,
  REQUEST_TIMEOUT: 10000, // 10 segundos
};

class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  /**
   * Log helper para desenvolvimento
   */
  log(message, data = null) {
    if (config.ENABLE_LOGS) {
      console.log(`[API] ${message}`, data || '');
    }
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

    const requestConfig = { ...defaultOptions, ...options };

    // Se há body e é objeto, converter para JSON
    if (requestConfig.body && typeof requestConfig.body === 'object') {
      requestConfig.body = JSON.stringify(requestConfig.body);
    }

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.REQUEST_TIMEOUT);
    requestConfig.signal = controller.signal;

    try {
      this.log(`${requestConfig.method} ${url}`, requestConfig.body ? 'with body' : '');
      
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);
      
      // Verificar se a resposta é JSON
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
  // SERVICES - CRUD Completo
  // ========================================

  async getServices(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.active !== undefined) params.append('active', filters.active);

    const queryString = params.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    
    return this.request(endpoint);
  }

  async getService(id) {
    return this.request(`/services/${id}`);
  }

  async createService(serviceData) {
    return this.request('/services', {
      method: 'POST',
      body: serviceData,
    });
  }

  async updateService(id, serviceData) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: serviceData,
    });
  }

  async deleteService(id) {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // PROMOTIONS - CRUD Completo
  // ========================================

  async getPromotions(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.active !== undefined) params.append('active', filters.active);
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString();
    const endpoint = queryString ? `/promotions?${queryString}` : '/promotions';
    
    return this.request(endpoint);
  }

  async getPromotion(id) {
    return this.request(`/promotions/${id}`);
  }

  async createPromotion(promotionData) {
    return this.request('/promotions', {
      method: 'POST',
      body: promotionData,
    });
  }

  async updatePromotion(id, promotionData) {
    return this.request(`/promotions/${id}`, {
      method: 'PUT',
      body: promotionData,
    });
  }

  async deletePromotion(id) {
    return this.request(`/promotions/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // COUPONS - CRUD Completo
  // ========================================

  async getCoupons(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.active !== undefined) params.append('active', filters.active);
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString();
    const endpoint = queryString ? `/coupons?${queryString}` : '/coupons';
    
    return this.request(endpoint);
  }

  async getCoupon(id) {
    return this.request(`/coupons/${id}`);
  }

  async createCoupon(couponData) {
    return this.request('/coupons', {
      method: 'POST',
      body: couponData,
    });
  }

  async updateCoupon(id, couponData) {
    return this.request(`/coupons/${id}`, {
      method: 'PUT',
      body: couponData,
    });
  }

  async deleteCoupon(id) {
    return this.request(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(validationData) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: validationData,
    });
  }

  // ========================================
  // AUTH & CUSTOMERS
  // ========================================

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentCustomer() {
    return this.request('/customers/me');
  }

  async updateCustomer(customerData) {
    return this.request('/customers/me', {
      method: 'PUT',
      body: customerData,
    });
  }

  // ========================================
  // CUSTOMER FAVORITES
  // ========================================

  async getFavorites() {
    return this.request('/customers/favorites');
  }

  async addToFavorites(productId) {
    return this.request('/customers/favorites', {
      method: 'POST',
      body: { productId },
    });
  }

  async removeFromFavorites(productId) {
    return this.request(`/customers/favorites/${productId}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // CUSTOMER ORDERS
  // ========================================

  async getCustomerOrders() {
    return this.request('/customers/orders');
  }

  async getCustomerOrder(orderId) {
    return this.request(`/customers/orders/${orderId}`);
  }

  // ========================================
  // ADDRESSES
  // ========================================

  async getAddresses() {
    return this.request('/customers/addresses');
  }

  async addAddress(addressData) {
    return this.request('/customers/addresses', {
      method: 'POST',
      body: addressData,
    });
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/customers/addresses/${addressId}`, {
      method: 'PUT',
      body: addressData,
    });
  }

  async deleteAddress(addressId) {
    return this.request(`/customers/addresses/${addressId}`, {
      method: 'DELETE',
    });
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
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  // Orders
  getOrders,
  createOrder,
  // Services
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  // Promotions
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  // Coupons
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  // Auth & Customers
  login,
  register,
  logout,
  getCurrentCustomer,
  updateCustomer,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getCustomerOrders,
  getCustomerOrder,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  // Utilities
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