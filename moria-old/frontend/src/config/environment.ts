// ========================================
// ENVIRONMENT MANAGER - MORIA FRONTEND
// Centralizador de configurações e ambiente
// ========================================

interface AppConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  API_VERSION: string;
  ENABLE_DEBUG: boolean;
  ENABLE_MOCK_DATA: boolean;
  ENABLE_ANALYTICS: boolean;
  VERSION: string;
  BUILD_DATE: string;
  APP_NAME: string;
  APP_DESCRIPTION: string;
  UPLOAD_MAX_SIZE: number;
  UPLOAD_ALLOWED_TYPES: string[];
  CACHE_TTL: number;
  RETRY_ATTEMPTS: number;
  ENABLE_PWA: boolean;
  THEME_MODE: 'auto' | 'light' | 'dark';
}

class EnvironmentManager {
  private config: AppConfig;
  private environment: string;

  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private detectEnvironment(): string {
    if (import.meta.env.PROD) return 'production';
    if (import.meta.env.DEV) return 'development';
    return 'development';
  }

  private loadConfig(): AppConfig {
    const baseConfig: AppConfig = {
      // API Configuration
      API_BASE_URL: this.getString('VITE_API_BASE_URL', 'http://localhost:3001/api'),
      API_TIMEOUT: this.getNumber('VITE_API_TIMEOUT', 10000),
      API_VERSION: this.getString('VITE_API_VERSION', 'v1'),

      // Debug & Development
      ENABLE_DEBUG: this.getBoolean('VITE_ENABLE_DEBUG', !import.meta.env.PROD),
      ENABLE_MOCK_DATA: this.getBoolean('VITE_ENABLE_MOCK_DATA', false),
      ENABLE_ANALYTICS: this.getBoolean('VITE_ENABLE_ANALYTICS', import.meta.env.PROD),

      // Application Info
      VERSION: this.getString('VITE_APP_VERSION', '1.0.0'),
      BUILD_DATE: this.getString('VITE_BUILD_DATE', new Date().toISOString()),
      APP_NAME: this.getString('VITE_APP_NAME', 'Moria'),
      APP_DESCRIPTION: this.getString('VITE_APP_DESCRIPTION', 'Sistema de Gestão Automotiva'),

      // Upload Configuration
      UPLOAD_MAX_SIZE: this.getNumber('VITE_UPLOAD_MAX_SIZE', 5 * 1024 * 1024), // 5MB
      UPLOAD_ALLOWED_TYPES: this.getArray('VITE_UPLOAD_ALLOWED_TYPES', [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
      ]),

      // Performance & Cache
      CACHE_TTL: this.getNumber('VITE_CACHE_TTL', 5 * 60 * 1000), // 5 minutes
      RETRY_ATTEMPTS: this.getNumber('VITE_RETRY_ATTEMPTS', 3),

      // Features
      ENABLE_PWA: this.getBoolean('VITE_ENABLE_PWA', false),
      THEME_MODE: this.getString('VITE_THEME_MODE', 'auto') as 'auto' | 'light' | 'dark',
    };

    // Environment-specific overrides
    if (this.environment === 'development') {
      baseConfig.ENABLE_DEBUG = true;
      baseConfig.CACHE_TTL = 1000; // 1 second for faster development
    }

    if (this.environment === 'production') {
      baseConfig.ENABLE_DEBUG = false;
      baseConfig.ENABLE_MOCK_DATA = false;
    }

    return baseConfig;
  }

  private getString(key: string, defaultValue: string): string {
    return import.meta.env[key] || defaultValue;
  }

  private getNumber(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    if (!value) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private getBoolean(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  private getArray(key: string, defaultValue: string[]): string[] {
    const value = import.meta.env[key];
    if (!value) return defaultValue;
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  private validateConfig(): void {
    const errors: string[] = [];

    // API Base URL validation
    if (!this.config.API_BASE_URL) {
      errors.push('VITE_API_BASE_URL é obrigatório');
    } else {
      try {
        new URL(this.config.API_BASE_URL);
      } catch {
        errors.push('VITE_API_BASE_URL deve ser uma URL válida');
      }
    }

    // Timeout validation
    if (this.config.API_TIMEOUT < 1000 || this.config.API_TIMEOUT > 60000) {
      errors.push('VITE_API_TIMEOUT deve estar entre 1000ms e 60000ms');
    }

    // Upload size validation
    if (this.config.UPLOAD_MAX_SIZE > 50 * 1024 * 1024) {
      errors.push('VITE_UPLOAD_MAX_SIZE não deve exceder 50MB');
    }

    // Retry attempts validation
    if (this.config.RETRY_ATTEMPTS < 0 || this.config.RETRY_ATTEMPTS > 10) {
      errors.push('VITE_RETRY_ATTEMPTS deve estar entre 0 e 10');
    }

    // Theme mode validation
    const validThemes = ['auto', 'light', 'dark'];
    if (!validThemes.includes(this.config.THEME_MODE)) {
      errors.push(`VITE_THEME_MODE deve ser: ${validThemes.join(', ')}`);
    }

    if (errors.length > 0) {
      const errorMessage = `Configuração inválida:\n${errors.join('\n')}`;
      console.error('❌ Environment Configuration Error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Public getters
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): AppConfig {
    return { ...this.config };
  }

  // Environment checks
  isProduction(): boolean {
    return this.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.environment === 'development';
  }

  getEnvironment(): string {
    return this.environment;
  }

  // Utility methods
  getDebugInfo(): Record<string, any> {
    return {
      environment: this.environment,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      config: this.config,
      vite: {
        mode: import.meta.env.MODE,
        prod: import.meta.env.PROD,
        dev: import.meta.env.DEV,
        ssr: import.meta.env.SSR
      }
    };
  }

  // Feature flags
  isFeatureEnabled(feature: keyof AppConfig): boolean {
    const value = this.config[feature];
    return Boolean(value);
  }

  // API helpers
  getApiUrl(endpoint: string = ''): string {
    const baseUrl = this.config.API_BASE_URL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
  }

  // Upload helpers
  isValidFileType(file: File): boolean {
    return this.config.UPLOAD_ALLOWED_TYPES.includes(file.type);
  }

  isValidFileSize(file: File): boolean {
    return file.size <= this.config.UPLOAD_MAX_SIZE;
  }

  // Format helpers
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getMaxUploadSizeFormatted(): string {
    return this.formatFileSize(this.config.UPLOAD_MAX_SIZE);
  }

  // Cache helpers
  shouldCache(): boolean {
    return this.config.CACHE_TTL > 0;
  }

  getCacheTTL(): number {
    return this.config.CACHE_TTL;
  }

  // Debug logging
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.config.ENABLE_DEBUG && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
    }
  }
}

// Export singleton instance
export const env = new EnvironmentManager();
export default env;

// Export types for use in other files
export type { AppConfig };