// src/api/errorHandler.ts
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Erro de resposta do servidor
    const { status, data } = error.response;
    return new ApiError(
      data.message || `Erro ${status}: ${data.error || 'Ocorreu um erro inesperado'}`,
      data.code || 'API_ERROR',
      status,
      data.details
    );
  } else if (error.request) {
    // Erro de requisição (sem resposta)
    return new ApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      'NETWORK_ERROR',
      0
    );
  } else {
    // Erro ao configurar a requisição
    return new ApiError(
      error.message || 'Ocorreu um erro ao processar a requisição',
      'REQUEST_ERROR'
    );
  }
};

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};