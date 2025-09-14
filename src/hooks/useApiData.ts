import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

interface UseApiDataOptions {
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
}

interface UseApiDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Mapeamento de nomes de tabela para métodos da API
const API_METHOD_MAP = {
  products: {
    getAll: (filters?: any) => apiClient.getProducts(filters),
    getById: (id: string) => apiClient.getProduct(id),
    create: (data: any) => apiClient.createProduct(data),
    update: (id: string, data: any) => apiClient.updateProduct(id, data),
    delete: (id: string) => apiClient.deleteProduct(id)
  },
  services: {
    getAll: (filters?: any) => apiClient.getServices(filters),
    getById: (id: string) => apiClient.getService(id),
    create: (data: any) => apiClient.createService(data),
    update: (id: string, data: any) => apiClient.updateService(id, data),
    delete: (id: string) => apiClient.deleteService(id)
  },
  orders: {
    getAll: (filters?: any) => apiClient.getOrders(filters),
    getById: (id: string) => apiClient.getOrder(id),
    create: (data: any) => apiClient.createOrder(data),
    update: (id: string, data: any) => apiClient.updateOrder(id, data),
    delete: (id: string) => apiClient.cancelOrder(id, 'Cancelado pelo usuário')
  },
  promotions: {
    getAll: (filters?: any) => {
      // Se está buscando apenas promoções ativas (uso público), usar rota pública
      if (filters?.is_active === true && Object.keys(filters).length <= 2) {
        return apiClient.getActivePromotions();
      }
      // Caso contrário, usar rota administrativa
      return apiClient.getPromotions(filters);
    },
    getById: (id: string) => apiClient.get(`/promotions/${id}`),
    create: (data: any) => apiClient.createPromotion(data),
    update: (id: string, data: any) => apiClient.updatePromotion(id, data),
    delete: (id: string) => apiClient.deletePromotion(id)
  },
  coupons: {
    getAll: (filters?: any) => apiClient.getCoupons(filters),
    getById: (id: string) => apiClient.get(`/promotions/coupons/${id}`),
    create: (data: any) => apiClient.createCoupon(data),
    update: (id: string, data: any) => apiClient.updateCoupon(id, data),
    delete: (id: string) => apiClient.deleteCoupon(id)
  }
};

export function useApiData<T = any>({
  tableName,
  select = '*',
  filters = {},
  orderBy,
  enabled = true
}: UseApiDataOptions): UseApiDataResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchData = async () => {
    if (!enabled) return;

    const apiMethods = API_METHOD_MAP[tableName as keyof typeof API_METHOD_MAP];
    if (!apiMethods) {
      setError(`Tabela '${tableName}' não suportada`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar filtros para a API
      const apiFilters = { ...filters };

      // Aplicar ordenação se especificada
      if (orderBy) {
        apiFilters.sort = orderBy.column;
        apiFilters.order = orderBy.ascending ? 'asc' : 'desc';
      }

      const result = await apiMethods.getAll(apiFilters);

      if (result.success) {
        // Se a resposta tem paginação, usar data.data, senão usar data diretamente
        if (result.data?.data && result.data?.pagination) {
          setData(result.data.data);
          setPagination(result.data.pagination);
        } else if (Array.isArray(result.data)) {
          setData(result.data);
        } else {
          setData([result.data]);
        }
      } else {
        throw new Error(result.message || 'Erro ao buscar dados');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error(`Erro ao buscar ${tableName}:`, err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (newData: Partial<T>): Promise<T | null> => {
    const apiMethods = API_METHOD_MAP[tableName as keyof typeof API_METHOD_MAP];
    if (!apiMethods) {
      setError(`Tabela '${tableName}' não suportada`);
      return null;
    }

    try {
      setError(null);

      const result = await apiMethods.create(newData);

      if (result.success) {
        // Recarregar dados após criação
        await fetchData();
        return result.data;
      } else {
        throw new Error(result.message || 'Erro ao criar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar';
      setError(errorMessage);
      console.error(`Erro ao criar ${tableName}:`, err);
      return null;
    }
  };

  const update = async (id: string, updateData: Partial<T>): Promise<T | null> => {
    const apiMethods = API_METHOD_MAP[tableName as keyof typeof API_METHOD_MAP];
    if (!apiMethods) {
      setError(`Tabela '${tableName}' não suportada`);
      return null;
    }

    try {
      setError(null);

      const result = await apiMethods.update(id, updateData);

      if (result.success) {
        // Recarregar dados após atualização
        await fetchData();
        return result.data;
      } else {
        throw new Error(result.message || 'Erro ao atualizar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar';
      setError(errorMessage);
      console.error(`Erro ao atualizar ${tableName}:`, err);
      return null;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    const apiMethods = API_METHOD_MAP[tableName as keyof typeof API_METHOD_MAP];
    if (!apiMethods) {
      setError(`Tabela '${tableName}' não suportada`);
      return false;
    }

    try {
      setError(null);

      const result = await apiMethods.delete(id);

      if (result.success) {
        // Recarregar dados após remoção
        await fetchData();
        return true;
      } else {
        throw new Error(result.message || 'Erro ao deletar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar';
      setError(errorMessage);
      console.error(`Erro ao deletar ${tableName}:`, err);
      return false;
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [tableName, JSON.stringify(filters), JSON.stringify(orderBy), enabled]);

  return {
    data,
    loading,
    error,
    refetch,
    create,
    update,
    remove,
    pagination
  };
}

// Hook especializado para produtos
export function useProducts(filters?: {
  category?: string;
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}) {
  return useApiData<any>({
    tableName: 'products',
    filters: {
      category: filters?.category,
      search: filters?.search,
      is_active: filters?.active,
      page: filters?.page || 1,
      limit: filters?.limit || 10
    },
    enabled: true
  });
}

// Hook especializado para serviços
export function useServices(filters?: {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}) {
  return useApiData<any>({
    tableName: 'services',
    filters: {
      search: filters?.search,
      is_active: filters?.active,
      page: filters?.page || 1,
      limit: filters?.limit || 10
    },
    enabled: true
  });
}

// Hook especializado para pedidos
export function useOrders(filters?: {
  status?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) {
  return useApiData<any>({
    tableName: 'orders',
    filters: {
      status: filters?.status,
      user_id: filters?.user_id,
      start_date: filters?.start_date,
      end_date: filters?.end_date,
      page: filters?.page || 1,
      limit: filters?.limit || 10
    },
    enabled: true
  });
}

// Hook especializado para promoções
export function usePromotions(filters?: {
  is_active?: boolean;
  page?: number;
  limit?: number;
}) {
  return useApiData<any>({
    tableName: 'promotions',
    filters: {
      is_active: filters?.is_active,
      page: filters?.page || 1,
      limit: filters?.limit || 10
    },
    enabled: true
  });
}

// Hook especializado para cupons
export function useCoupons(filters?: {
  is_active?: boolean;
  page?: number;
  limit?: number;
}) {
  return useApiData<any>({
    tableName: 'coupons',
    filters: {
      is_active: filters?.is_active,
      page: filters?.page || 1,
      limit: filters?.limit || 10
    },
    enabled: true
  });
}

// Hook para um único item por ID
export function useApiItem<T = any>(tableName: string, id: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    const fetchItem = async () => {
      const apiMethods = API_METHOD_MAP[tableName as keyof typeof API_METHOD_MAP];
      if (!apiMethods) {
        setError(`Tabela '${tableName}' não suportada`);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await apiMethods.getById(id);

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Item não encontrado');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar item';
        setError(errorMessage);
        console.error(`Erro ao buscar ${tableName} com id ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [tableName, id]);

  return { data, loading, error };
}

// Hook para produtos populares
export function usePopularProducts(limit?: number) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiClient.getPopularProducts(limit);

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Erro ao buscar produtos populares');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao buscar produtos populares:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { data, loading, error };
}

// Hook para promoções ativas
export function useActivePromotions() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiClient.getActivePromotions();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Erro ao buscar promoções');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao buscar promoções ativas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}