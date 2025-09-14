// ========================================
// API CLIENT PARA BACKEND NODE.JS
// API Client para backend Node.js + SQLite3
// ========================================

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface ApiError {
  success: false;
  message: string;
  error?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      // Adicionar token de autenticação se disponível
      const authToken = localStorage.getItem('moria_auth_token');
      if (authToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${authToken}`,
        };
      }

      const response = await fetch(url, config);

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      const data = isJson ? await response.json() : { message: await response.text() };

      if (!response.ok) {
        // Se token expirou, tentar renovar
        if (response.status === 401 && authToken && endpoint !== '/auth/refresh') {
          const refreshResult = await this.refreshToken();
          if (refreshResult.success) {
            // Tentar novamente com o novo token
            return this.request(endpoint, options);
          } else {
            // Se não conseguiu renovar, remover token e redirecionar para login
            localStorage.removeItem('moria_auth_token');
            localStorage.removeItem('moria_refresh_token');
          }
        }

        throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return {
        data: data.data || data,
        success: data.success !== false,
        message: data.message,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        error,
      };
    }
  }

  // Métodos CRUD genéricos
  async get<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Métodos específicos para produtos
  async getProducts(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/products${queryParams ? `?${queryParams}` : ''}`);
  }

  async getProduct(id: string) {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.post('/products', productData);
  }

  async updateProduct(id: string, productData: any) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id: string) {
    return this.delete(`/products/${id}`);
  }

  // Métodos específicos para serviços
  async getServices(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/services${queryParams ? `?${queryParams}` : ''}`);
  }

  async getService(id: string) {
    return this.get(`/services/${id}`);
  }

  async createService(serviceData: any) {
    return this.post('/services', serviceData);
  }

  async updateService(id: string, serviceData: any) {
    return this.put(`/services/${id}`, serviceData);
  }

  async deleteService(id: string) {
    return this.delete(`/services/${id}`);
  }

  // Métodos específicos para pedidos
  async getOrders(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/orders${queryParams ? `?${queryParams}` : ''}`);
  }

  async getOrder(id: string) {
    return this.get(`/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.post('/orders', orderData);
  }

  async updateOrder(id: string, orderData: any) {
    return this.put(`/orders/${id}`, orderData);
  }

  // Métodos específicos para promoções
  async getPromotions(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/promotions${queryParams ? `?${queryParams}` : ''}`);
  }

  async getActivePromotions() {
    return this.get('/promotions/active');
  }

  async getPromotionsByProduct(productId: string) {
    return this.get(`/promotions/product/${productId}`);
  }

  async getPromotionsByCategory(category: string) {
    return this.get(`/promotions/category/${category}`);
  }

  async createPromotion(promotionData: any) {
    return this.post('/promotions', promotionData);
  }

  async updatePromotion(id: string, promotionData: any) {
    return this.put(`/promotions/${id}`, promotionData);
  }

  async deletePromotion(id: string) {
    return this.delete(`/promotions/${id}`);
  }

  // Métodos específicos para cupons (nota: rotas são /promotions/coupons no backend)
  async getCoupons(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/promotions/coupons${queryParams ? `?${queryParams}` : ''}`);
  }

  async getActiveCoupons() {
    return this.get('/promotions/coupons/active');
  }

  async validateCoupon(code: string, orderAmount?: number) {
    const params = orderAmount ? `?order_amount=${orderAmount}` : '';
    return this.get(`/promotions/coupons/validate/${code}${params}`);
  }

  async createCoupon(couponData: any) {
    return this.post('/promotions/coupons', couponData);
  }

  async updateCoupon(id: string, couponData: any) {
    return this.put(`/promotions/coupons/${id}`, couponData);
  }

  async deleteCoupon(id: string) {
    return this.delete(`/promotions/coupons/${id}`);
  }

  // Métodos de autenticação
  async login(credentials: { email: string; password: string }) {
    const result = await this.post('/auth/login', credentials);
    if (result.success && result.data?.token) {
      localStorage.setItem('moria_auth_token', result.data.token);
      if (result.data.refreshToken) {
        localStorage.setItem('moria_refresh_token', result.data.refreshToken);
      }
    }
    return result;
  }

  async register(userData: any) {
    const result = await this.post('/auth/register', userData);
    if (result.success && result.data?.token) {
      localStorage.setItem('moria_auth_token', result.data.token);
      if (result.data.refreshToken) {
        localStorage.setItem('moria_refresh_token', result.data.refreshToken);
      }
    }
    return result;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('moria_refresh_token');
    if (!refreshToken) {
      return { success: false, message: 'Refresh token não encontrado' };
    }

    const result = await this.post('/auth/refresh', { refreshToken });
    if (result.success && result.data?.token) {
      localStorage.setItem('moria_auth_token', result.data.token);
      if (result.data.refreshToken) {
        localStorage.setItem('moria_refresh_token', result.data.refreshToken);
      }
    }
    return result;
  }

  async logout() {
    const result = await this.post('/auth/logout', {});
    localStorage.removeItem('moria_auth_token');
    localStorage.removeItem('moria_refresh_token');
    return result.success ? result : { success: true, data: null };
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async updateProfile(profileData: any) {
    return this.put('/auth/profile', profileData);
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return this.put('/auth/change-password', passwordData);
  }

  // Métodos adicionais para produtos
  async getProductCategories() {
    return this.get('/products/categories');
  }

  async getPopularProducts(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.get(`/products/popular${params}`);
  }

  async getProductsOnSale(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    const queryString = params.toString();
    return this.get(`/products/on-sale${queryString ? `?${queryString}` : ''}`);
  }

  async searchProducts(query: string, page?: number, limit?: number) {
    const params = new URLSearchParams({ q: query });
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    return this.get(`/products/search?${params.toString()}`);
  }

  // Métodos adicionais para serviços
  async getServiceCategories() {
    return this.get('/services/categories');
  }

  async getPopularServices(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.get(`/services/popular${params}`);
  }

  async bookService(serviceId: string) {
    return this.post(`/services/${serviceId}/book`, {});
  }

  // Métodos adicionais para pedidos
  async getMyOrders(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    const queryString = params.toString();
    return this.get(`/orders/my-orders${queryString ? `?${queryString}` : ''}`);
  }

  async cancelOrder(orderId: string, reason?: string) {
    return this.put(`/orders/${orderId}/cancel`, reason ? { reason } : {});
  }

  async reorder(orderId: string) {
    return this.post(`/orders/${orderId}/reorder`, {});
  }

  async updateOrderStatus(orderId: string, status: string, adminNotes?: string) {
    return this.put(`/orders/${orderId}/status`, { status, admin_notes: adminNotes });
  }
}

// Instância exportada da API
export const apiClient = new ApiClient();

// Tipos e utilitários
export type { ApiResponse, ApiError };
export default apiClient;