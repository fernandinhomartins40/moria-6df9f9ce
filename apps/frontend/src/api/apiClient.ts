// src/api/apiClient.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Configuração base do cliente
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Interceptador de requisições
apiClient.interceptors.request.use(
  (config) => {
    // Cookies são enviados automaticamente com withCredentials: true
    // O cookie httpOnly 'adminToken' é enviado automaticamente pelo browser
    // Não precisamos adicionar Authorization header manualmente

    // Para clientes (não admin), ainda usamos localStorage por compatibilidade
    const customerToken = localStorage.getItem('customer_token');
    if (customerToken && !config.url?.includes('/admin') && !config.url?.includes('/auth/admin')) {
      config.headers.Authorization = `Bearer ${customerToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de respostas
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Tratamento global de erros
    if (error.response?.status === 401) {
      // Não redirecionar para evitar loop infinito na verificação de autenticação
      // A aplicação já trata o estado de não autenticado
      // Suprimir log de erro 401 em /auth/profile (esperado durante inicialização)
      if (error.config?.url?.includes('/auth/profile')) {
        // Silently reject for profile checks
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
