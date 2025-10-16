// src/config/environment.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Configurações específicas por ambiente
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:3001/api',
    DEBUG_MODE: true,
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_PROD_URL || 'https://api.moriapescaservicos.com/api',
    DEBUG_MODE: false,
  },
  staging: {
    API_BASE_URL: import.meta.env.VITE_API_STAGING_URL || 'https://staging-api.moriapescaservicos.com/api',
    DEBUG_MODE: true,
  },
};

export const getEnvConfig = () => {
  return ENV_CONFIG[APP_ENV as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
};