// ========================================
// API CLIENT OTIMIZADO COM AXIOS INTERCEPTORS - MORIA FRONTEND
// Cliente API otimizado com interceptors do Axios para tratamento automático de tokens
// ========================================

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

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
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // Criar instância do Axios
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configurar interceptors
    this.setupInterceptors();
  }

  // Configurar interceptors do Axios
  private setupInterceptors(): void {
    // Request interceptor - adicionar token de autenticação
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('moria_auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - tratar erros de autenticação
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Se erro de autenticação (401) e não é tentativa de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Tentar renovar token
            const refreshToken = localStorage.getItem('moria_refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${this.baseURL}/auth/refresh`, { refreshToken });
              
              if (response.data.success && response.data.data?.token) {
                // Salvar novos tokens
                localStorage.setItem('moria_auth_token', response.data.data.token);
                if (response.data.data.refreshToken) {
                  localStorage.setItem('moria_refresh_token', response.data.data.refreshToken);
                }

                // Tentar novamente a requisição original
                originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
                return this.axiosInstance(originalRequest);
              }
            }
          } catch (refreshError) {
            // Se falhar ao renovar, limpar tokens e redirecionar para login
            localStorage.removeItem('moria_auth_token');
            localStorage.removeItem('moria_refresh_token');
            console.log('Sessão expirada. Faça login novamente.');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private requiresAuth(endpoint: string, method: string = 'GET'): boolean {
    // Rotas que REQUEREM autenticação
    const authRequiredRoutes = [
      // Autenticação
      '^/auth/profile,
      '^/auth/change-password,
      '^/auth/logout,
      '^/auth/users',

      // IMPORTANTE: Rotas administrativas que sempre requerem auth + admin role
      '^/orders, // GET /orders (listar todos os pedidos - apenas admin)
      '^/orders/[^/]+, // GET /orders/:id (ver detalhes - admin ou próprio usuário)

      // Pedidos do usuário
      '^/orders/my-orders',
      '^/orders/[^/]+/cancel,
      '^/orders/[^/]+/reorder,
      '^/orders/[^/]+/status,

      // Agendamento de serviços
      '^/services/[^/]+/book,

      // Upload de imagens (requer autenticação)
      '^/images/upload,
      '^/images/process,
      '^/images/crop,

      // Configurações administrativas (exceto públicas)
      '^/settings/(?!public$|company-info$|category/)',
      '^/settings, // GET /settings (admin - todas as configurações)

      // PRODUTOS: Apenas rotas administrativas requerem auth
      '^/products/admin/',

      // SERVIÇOS: Apenas rotas administrativas requerem auth
      '^/services/admin/',

      // PROMOÇÕES: Rotas administrativas requerem auth
      '^/promotions/(?!active$|product/|category/|coupons/active$|coupons/validate/)',
      '^/promotions, // GET /promotions (admin - listar todas)
      '^/promotions/[^/]+, // GET/PUT/DELETE /promotions/:id (admin)
      '^/promotions/coupons/(?!active$|validate/)',
      '^/promotions/coupons, // GET /promotions/coupons (admin)
      '^/promotions/coupons/[^/]+, // operations on specific coupons (admin)

      // IMAGENS: Todas as operações requerem auth
      '^/images/'
    ];

    // Métodos que sempre requerem autenticação (exceto em rotas específicas públicas)
    const authRequiredMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    // Se o método requer autenticação e não é uma rota pública específica
    if (authRequiredMethods.includes(method.toUpperCase())) {
      const publicPostRoutes = [
        '^/auth/login,
        '^/auth/register,
        '^/auth/refresh,
        '^/orders, // Criar pedido como guest (POST /orders)
      ];

      const isPublicPost = publicPostRoutes.some(pattern => {
        const regex = new RegExp(pattern);
        return regex.test(endpoint);
      });

      if (!isPublicPost) {
        return true;
      }
    }

    return authRequiredRoutes.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(endpoint);
    });
  }

  // Métodos CRUD genéricos
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T> | ApiError> {
    try {
      const response = await this.axiosInstance(config);
      return {
        data: response.data?.data || response.data,
        success: response.data?.success !== false,
        message: response.data?.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erro desconhecido',
        error,
      };
    }
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>({ method: 'GET', url: endpoint, ...config });
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>({ method: 'POST', url: endpoint, data, ...config });
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>({ method: 'PUT', url: endpoint, data, ...config });
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>({ method: 'DELETE', url: endpoint, ...config });
  }

  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>({ method: 'PATCH', url: endpoint, data, ...config });
  }

  // Utilitário para filtrar parâmetros undefined/null/empty
  private buildQueryParams(filters?: any): string {
    if (!filters) return '';

    const validParams: Record<string, string> = {};

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        validParams[key] = String(value);
      }
    });

    const queryParams = new URLSearchParams(validParams).toString();
    return queryParams ? `?${queryParams}` : '';
  }

  // Métodos específicos para produtos
  async getProducts(filters?: any, includeUserData: boolean = false) {
    const queryString = this.buildQueryParams(filters);
    return this.get(`/products${queryString}`, includeUserData ? { headers: { Authorization: `Bearer ${localStorage.getItem('moria_auth_token')}` } } : {});
  }

  async getProduct(id: string, includeUserData: boolean = false) {
    return this.get(`/products/${id}`, includeUserData ? { headers: { Authorization: `Bearer ${localStorage.getItem('moria_auth_token')}` } } : {});
  }

  async createProduct(productData: any) {
    return this.post('/products', productData);
  }

  async updateProduct(id: string, productData: any) {
    return this.put(`/products/${id}`, productData);
  }

  async patchProduct(id: string, productData: any) {
    return this.patch(`/products/${id}`, productData);
  }

  async deleteProduct(id: string) {
    return this.delete(`/products/${id}`);
  }

  // Métodos específicos para serviços
  async getServices(filters?: any, includeUserData: boolean = false) {
    const queryString = this.buildQueryParams(filters);
    return this.get(`/services${queryString}`, includeUserData ? { headers: { Authorization: `Bearer ${localStorage.getItem('moria_auth_token')}` } } : {});
  }

  async getService(id: string, includeUserData: boolean = false) {
    return this.get(`/services/${id}`, includeUserData ? { headers: { Authorization: `Bearer ${localStorage.getItem('moria_auth_token')}` } } : {});
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
    const queryString = this.buildQueryParams(filters);
    return this.get(`/orders${queryString}`);
  }

  async getOrder(id: string, includeUserData: boolean = false) {
    return this.get(`/orders/${id}`, includeUserData ? { headers: { Authorization: `Bearer ${localStorage.getItem('moria_auth_token')}` } } : {});
  }

  async createOrder(orderData: any) {
    return this.post('/orders', orderData);
  }

  async updateOrder(id: string, orderData: any) {
    return this.put(`/orders/${id}`, orderData);
  }

  // Métodos específicos para promoções
  async getPromotions(filters?: any) {
    const queryString = this.buildQueryParams(filters);
    return this.get(`/promotions${queryString}`);
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
    const queryString = this.buildQueryParams(filters);
    const baseUrl = '/promotions/coupons/';
    return this.get(queryString ? `${baseUrl.slice(0, -1)}${queryString}` : baseUrl);
  }

  async getActiveCoupons() {
    return this.get('/promotions/coupons/active');
  }

  async validateCoupon(code: string, orderAmount?: number) {
    const params = orderAmount ? `?order_amount=${orderAmount}` : '';
    return this.get(`/promotions/coupons/validate/${code}${params}`);
  }

  async createCoupon(couponData: any) {
    return this.post('/promotions/coupons/', couponData);
  }

  async updateCoupon(id: string, couponData: any) {
    return this.put(`/promotions/coupons/${id}`, couponData);
  }

  async deleteCoupon(id: string) {
    return this.delete(`/promotions/coupons/${id}`);
  }

  // Métodos específicos para configurações
  async getPublicSettings() {
    return this.get('/settings/public');
  }

  async getCompanyInfo() {
    return this.get('/settings/company-info');
  }

  async getSettingsByCategory(category: string) {
    return this.get(`/settings/category/${category}`);
  }

  // Métodos administrativos de settings (requerem autenticação)
  async getAllSettings() {
    return this.get('/settings');
  }

  // Alias para compatibilidade
  async getSettings() {
    return this.getAllSettings();
  }

  async getSettingByKey(key: string) {
    return this.get(`/settings/${key}`);
  }

  async createSetting(settingData: any) {
    return this.post('/settings', settingData);
  }

  async updateSetting(id: string, settingData: any) {
    return this.put(`/settings/${id}`, settingData);
  }

  async updateSettingByKey(key: string, value: any) {
    return this.patch(`/settings/key/${key}`, { value });
  }

  async upsertSetting(settingData: any) {
    return this.post('/settings/upsert', settingData);
  }

  async deleteSetting(id: string) {
    return this.delete(`/settings/${id}`);
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

  // Método de upload de arquivos
  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, String(additionalData[key]));
      });
    }

    try {
      const response = await this.axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}

// Instância exportada da API
export const apiClient = new ApiClient();

// Tipos e utilitários
export type { ApiResponse, ApiError };
export default apiClient;