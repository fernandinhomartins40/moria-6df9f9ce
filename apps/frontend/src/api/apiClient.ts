// src/api/apiClient.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Determinar baseURL baseado no ambiente
const getBaseURL = () => {
  // Se tiver variável de ambiente definida, usar ela
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Em produção, usar URL relativa (mesmo servidor/domínio)
  if (import.meta.env.PROD) {
    // Como o Nginx já roteia /api/* para o backend,
    // usar window.location.origin garante que funcione em qualquer domínio/IP
    return `${window.location.origin}`;
  }

  // Em desenvolvimento, usar localhost
  return 'http://localhost:3003';
};

// Configuração base do cliente
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
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
    // Mas também enviamos token JWT no header para rotas admin

    // Lista de rotas que requerem token admin (além das rotas /admin)
    const adminRoutes = ['/admin', '/shipping'];
    const isAdminRoute = adminRoutes.some(route => config.url?.includes(route));

    // Tenta obter token admin do localStorage primeiro
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken && isAdminRoute) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    // Se não for rota admin, tenta token de cliente
    const customerToken = localStorage.getItem('customer_token');
    if (customerToken && !isAdminRoute) {
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
    // Extrair data de respostas com formato { success: true, data: ..., meta: ... }
    if (response.data?.success && response.data?.data !== undefined) {
      // Se houver meta, preservar na resposta
      if (response.data.meta) {
        return { ...response, data: { data: response.data.data, meta: response.data.meta } };
      }
      return { ...response, data: response.data.data };
    }
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
