// ========================================
// API CLIENT - MORIA FRONTEND
// Cliente HTTP centralizado usando Environment Manager
// ========================================

import env from '../config/environment';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  timestamp?: string;
  path?: string;
}

// Request configuration interface
interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private defaultHeaders: Record<string, string>;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor() {
    this.baseURL = env.get('API_BASE_URL');
    this.timeout = env.get('API_TIMEOUT');
    this.retryAttempts = env.get('RETRY_ATTEMPTS');
    this.cache = new Map();

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': env.get('VERSION'),
      'X-Client-Platform': 'web'
    };

    // Auto cleanup cache every 5 minutes
    if (env.shouldCache()) {
      setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
    }
  }

  // Set authorization token
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Get authorization token
  getAuthToken(): string | null {
    const auth = this.defaultHeaders['Authorization'];
    return auth ? auth.replace('Bearer ', '') : null;
  }

  // Build full URL
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  // Generate cache key
  private getCacheKey(method: string, url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method.toUpperCase()}-${url}-${paramsStr}`;
  }

  // Check cache
  private getFromCache(key: string): any | null {
    if (!env.shouldCache()) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Set cache
  private setCache(key: string, data: any, ttl?: number): void {
    if (!env.shouldCache()) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || env.getCacheTTL()
    });
  }

  // Cleanup expired cache entries
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.timestamp + cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      throw new Error('Falha ao processar resposta do servidor');
    }

    if (!response.ok) {
      // Log error if debug is enabled
      if (env.get('ENABLE_DEBUG')) {
        env.log('error', `HTTP ${response.status} - ${response.statusText}`, {
          url: response.url,
          data
        });
      }

      const apiError: ApiError = {
        success: false,
        message: data.message || data.error || `Erro ${response.status}: ${response.statusText}`,
        errors: data.errors,
        timestamp: data.timestamp,
        path: data.path
      };

      throw apiError;
    }

    return data as ApiResponse<T>;
  }

  // Main request method
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const cacheKey = this.getCacheKey(method, url, data);

    // Check cache for GET requests
    if (method.toUpperCase() === 'GET' && config.cache !== false) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        env.log('debug', `Cache hit: ${endpoint}`);
        return cached;
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        ...this.defaultHeaders,
        ...config.headers
      },
      signal: AbortSignal.timeout(config.timeout || this.timeout)
    };

    // Add body for non-GET requests
    if (data && method.toUpperCase() !== 'GET') {
      if (data instanceof FormData) {
        delete requestOptions.headers?.['Content-Type'];
        requestOptions.body = data;
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    // Add query parameters for GET requests
    if (data && method.toUpperCase() === 'GET') {
      const searchParams = new URLSearchParams();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          searchParams.append(key, String(data[key]));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        const separator = url.includes('?') ? '&' : '?';
        requestOptions.signal = AbortSignal.timeout(config.timeout || this.timeout);
        return this.requestWithRetry(method, `${url}${separator}${queryString}`, requestOptions, config.retries || this.retryAttempts, cacheKey);
      }
    }

    return this.requestWithRetry(method, url, requestOptions, config.retries || this.retryAttempts, cacheKey);
  }

  // Request with retry logic
  private async requestWithRetry<T>(
    method: string,
    url: string,
    options: RequestInit,
    retries: number,
    cacheKey?: string
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (env.get('ENABLE_DEBUG')) {
          env.log('debug', `API Request: ${method} ${url}`, {
            attempt: attempt + 1,
            maxRetries: retries + 1
          });
        }

        const response = await fetch(url, options);
        const result = await this.handleResponse<T>(response);

        // Cache successful GET responses
        if (method.toUpperCase() === 'GET' && cacheKey) {
          this.setCache(cacheKey, result);
        }

        return result;

      } catch (error) {
        lastError = error as Error;

        if (env.get('ENABLE_DEBUG')) {
          env.log('warn', `Request failed (attempt ${attempt + 1})`, {
            error: lastError.message,
            url
          });
        }

        // Don't retry on certain errors
        if (lastError.name === 'AbortError' ||
            (error as any).status === 401 ||
            (error as any).status === 403 ||
            (error as any).status === 404) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, params, config);
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  // Upload file with progress
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    // Validate file
    if (!env.isValidFileType(file)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
    }

    if (!env.isValidFileSize(file)) {
      throw new Error(`Arquivo muito grande. Máximo: ${env.getMaxUploadSizeFormatted()}`);
    }

    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, String(additionalData[key]));
      });
    }

    // Note: Progress tracking would require XMLHttpRequest or a library
    // For now, using fetch without progress
    return this.request<T>('POST', endpoint, formData, {
      timeout: this.timeout * 3, // Longer timeout for uploads
      cache: false
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await this.get('health', undefined, {
        timeout: 5000,
        retries: 0,
        cache: false
      });
      return response.data;
    } catch (error) {
      env.log('error', 'Health check failed', error);
      throw error;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    env.log('info', 'API cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

// Export types for use in other files
export type { RequestConfig };