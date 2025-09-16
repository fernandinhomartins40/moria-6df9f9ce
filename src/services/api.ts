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

  private requiresAuth(endpoint: string, method: string = 'GET'): boolean {
    // Rotas que REQUEREM autenticação
    const authRequiredRoutes = [
      // Autenticação
      '^/auth/profile$',
      '^/auth/change-password$',
      '^/auth/logout$',
      '^/auth/users',

      // IMPORTANTE: Rotas administrativas que sempre requerem auth + admin role
      '^/orders$', // GET /orders (listar todos os pedidos - apenas admin)
      '^/orders/[^/]+$', // GET /orders/:id (ver detalhes - admin ou próprio usuário)

      // Pedidos do usuário
      '^/orders/my-orders',
      '^/orders/[^/]+/cancel$',
      '^/orders/[^/]+/reorder$',
      '^/orders/[^/]+/status$',

      // Agendamento de serviços
      '^/services/[^/]+/book$',

      // Configurações administrativas (exceto públicas)
      '^/settings/(?!public$|company-info$|category/)',
      '^/settings$',

      // PRODUTOS: Apenas rotas administrativas requerem auth
      '^/products/admin/',

      // SERVIÇOS: Apenas rotas administrativas requerem auth
      '^/services/admin/',

      // PROMOÇÕES: Rotas administrativas requerem auth
      '^/promotions/(?!active$|product/|category/|coupons/active$|coupons/validate/)',
      '^/promotions$', // GET /promotions (admin - listar todas)
      '^/promotions/[^/]+$', // GET/PUT/DELETE /promotions/:id (admin)
      '^/promotions/coupons/(?!active$|validate/)',
      '^/promotions/coupons$', // GET /promotions/coupons (admin)
      '^/promotions/coupons/[^/]+$', // operations on specific coupons (admin)
    ];

    // Métodos que sempre requerem autenticação (exceto em rotas específicas públicas)
    const authRequiredMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    // Se o método requer autenticação e não é uma rota pública específica
    if (authRequiredMethods.includes(method.toUpperCase())) {
      const publicPostRoutes = [
        '^/auth/login$',
        '^/auth/register$',
        '^/auth/refresh$',
        '^/orders$', // Criar pedido como guest (POST /orders)
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

  private refreshAttempts: Map<string, number> = new Map();
  private readonly MAX_REFRESH_ATTEMPTS = 1;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const method = (options.method || 'GET').toString();
      const authToken = localStorage.getItem('moria_auth_token');
      const requiresAuth = this.requiresAuth(endpoint, method);

      // Debug log para rastrear chamadas de API
      const hasToken = !!authToken;
      const willSendToken = hasToken; // Agora sempre envia token quando disponível

      console.group(`🔗 API Call: ${method} ${endpoint}`);
      console.log(`📍 URL: ${url}`);
      console.log(`🔐 Requer auth: ${requiresAuth ? '✅' : '❌'}`);
      console.log(`🎫 Token disponível: ${hasToken ? '✅' : '❌'}`);
      console.log(`📤 Enviando token: ${willSendToken ? '✅' : '❌'}`);

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      // Adicionar token sempre que disponível (para identificação do usuário)
      if (authToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${authToken}`,
        };
        console.log(`🔑 Token adicionado ao header (${requiresAuth ? 'obrigatório' : 'opcional'})`);
      }

      const response = await fetch(url, config);

      // Log da resposta
      console.log(`📥 Status: ${response.status} ${response.statusText}`);

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      let data;
      try {
        data = isJson ? await response.json() : { message: await response.text() };
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse da resposta:', parseError);
        data = { message: 'Erro ao processar resposta do servidor' };
      }

      if (!response.ok) {
        // Prevenir loops infinitos de refresh
        const refreshKey = `${endpoint}-${method}`;
        const currentAttempts = this.refreshAttempts.get(refreshKey) || 0;

        // Se token expirou e ainda não tentamos fazer refresh muitas vezes
        if (response.status === 401 && authToken && endpoint !== '/auth/refresh' &&
            requiresAuth && currentAttempts < this.MAX_REFRESH_ATTEMPTS) {

          console.warn(`🔄 Token expirado para ${endpoint}. Tentativa ${currentAttempts + 1}/${this.MAX_REFRESH_ATTEMPTS}`);
          this.refreshAttempts.set(refreshKey, currentAttempts + 1);

          const refreshResult = await this.refreshToken();
          if (refreshResult.success) {
            // Tentar novamente com o novo token
            console.log(`✅ Token renovado com sucesso. Tentando ${endpoint} novamente...`);
            const result = await this.request(endpoint, options);
            // Limpar contador de tentativas em caso de sucesso
            this.refreshAttempts.delete(refreshKey);
            return result;
          } else {
            // Se não conseguiu renovar, remover token
            console.error(`❌ Falha ao renovar token para ${endpoint}`);
            localStorage.removeItem('moria_auth_token');
            localStorage.removeItem('moria_refresh_token');
            this.refreshAttempts.delete(refreshKey);
          }
        }

        // Limpar contador após exceder tentativas
        if (currentAttempts >= this.MAX_REFRESH_ATTEMPTS) {
          this.refreshAttempts.delete(refreshKey);
          console.warn(`⚠️ Máximo de tentativas de refresh excedido para ${endpoint}`);
        }

        // Se é erro 401 em uma rota que deveria ser pública, tentar sem token
        if (response.status === 401 && !requiresAuth) {
          console.warn(`🔄 Erro 401 em rota pública: ${endpoint}. Tentando novamente sem token...`);

          try {
            // Tentar novamente sem Authorization header
            const retryConfig = { ...config };
            if (retryConfig.headers && typeof retryConfig.headers === 'object') {
              const headers = { ...retryConfig.headers };
              delete headers['Authorization'];
              retryConfig.headers = headers;
            }

            const retryResponse = await fetch(url, retryConfig);
            const retryContentType = retryResponse.headers.get('content-type');
            const retryIsJson = retryContentType && retryContentType.includes('application/json');

            let retryData;
            try {
              retryData = retryIsJson ? await retryResponse.json() : { message: await retryResponse.text() };
            } catch (retryParseError) {
              console.error('❌ Erro ao fazer parse da resposta retry:', retryParseError);
              retryData = { message: 'Erro ao processar resposta do servidor' };
            }

            if (retryResponse.ok) {
              console.log(`✅ Sucesso ao tentar novamente sem token: ${endpoint}`);
              console.groupEnd();
              return { success: true, ...retryData };
            }
          } catch (retryError) {
            console.error(`❌ Falha ao tentar novamente sem token: ${endpoint}`, retryError);
          }
        }

        console.log(`❌ Erro: ${data?.message || response.statusText}`);
        console.groupEnd();
        throw new Error(data?.message || `Erro ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Sucesso`);
      console.groupEnd();

      return {
        data: data?.data || data,
        success: data?.success !== false,
        message: data?.message,
      };
    } catch (error) {
      console.log(`💥 Exceção: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      console.groupEnd();

      console.error('API Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        error,
      };
    }
  }

  // Métodos CRUD genéricos
  async get<T>(endpoint: string, includeAuth: boolean = false): Promise<ApiResponse<T> | ApiError> {
    const options: RequestInit = { method: 'GET' };

    // Forçar autenticação se solicitado
    if (includeAuth) {
      const authToken = localStorage.getItem('moria_auth_token');
      if (authToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authToken}`,
        };
      }
    }

    return this.request<T>(endpoint, options);
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

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T> | ApiError> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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
    return this.get(`/products${queryString}`, includeUserData);
  }

  async getProduct(id: string, includeUserData: boolean = false) {
    return this.get(`/products/${id}`, includeUserData);
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
    return this.get(`/services${queryString}`, includeUserData);
  }

  async getService(id: string, includeUserData: boolean = false) {
    return this.get(`/services/${id}`, includeUserData);
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
    return this.get(`/orders/${id}`, includeUserData);
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
}

// Instância exportada da API
export const apiClient = new ApiClient();

// Tipos e utilitários
export type { ApiResponse, ApiError };
export default apiClient;