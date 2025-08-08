// Hook useApi robusto com retry, cache e estados avançados
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api/client';

// Hook principal para requisições de API
export const useApi = (endpoint, options = {}) => {
  const {
    method = 'GET',
    params = null,
    body = null,
    immediate = true,
    refreshInterval = null,
    retryAttempts = 3,
    enabled = true,
    onSuccess = null,
    onError = null,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate && enabled);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const mountedRef = useRef(true);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Função de requisição principal
  const execute = useCallback(async (overrideOptions = {}) => {
    if (!enabled) return;

    // Abortar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const finalEndpoint = endpoint + (params ? `?${new URLSearchParams(params).toString()}` : '');
      const requestOptions = {
        signal: abortControllerRef.current.signal,
        ...overrideOptions
      };

      let result;
      
      switch (method.toUpperCase()) {
        case 'GET':
          result = await apiClient.get(finalEndpoint, requestOptions);
          break;
        case 'POST':
          result = await apiClient.post(finalEndpoint, body, requestOptions);
          break;
        case 'PUT':
          result = await apiClient.put(finalEndpoint, body, requestOptions);
          break;
        case 'DELETE':
          result = await apiClient.delete(finalEndpoint, requestOptions);
          break;
        default:
          throw new Error(`Método HTTP não suportado: ${method}`);
      }

      if (mountedRef.current) {
        setData(result);
        setLastFetch(new Date().toISOString());
        setRetryCount(0);
        
        if (onSuccess) {
          onSuccess(result);
        }
      }

      return result;

    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Requisição cancelada, não é erro
      }

      if (mountedRef.current) {
        setError(err);
        
        if (onError) {
          onError(err);
        }
      }

      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [endpoint, method, params, body, enabled, onSuccess, onError]);

  // Retry com backoff exponencial
  const retry = useCallback(async () => {
    if (retryCount >= retryAttempts) {
      return;
    }

    setRetryCount(prev => prev + 1);
    
    // Delay exponencial: 1s, 2s, 4s, etc.
    const delay = Math.pow(2, retryCount) * 1000;
    
    setTimeout(() => {
      execute();
    }, delay);
  }, [execute, retryCount, retryAttempts]);

  // Refresh manual
  const refresh = useCallback(() => {
    setRetryCount(0);
    return execute();
  }, [execute]);

  // Reset completo
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setRetryCount(0);
    setLastFetch(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Executar requisição inicial e quando dependências mudarem
  useEffect(() => {
    if (immediate && enabled) {
      execute();
    }
  }, [execute, immediate, enabled, ...dependencies]);

  // Configurar refresh automático
  useEffect(() => {
    if (refreshInterval && enabled && !error) {
      intervalRef.current = setInterval(() => {
        execute();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [execute, refreshInterval, enabled, error]);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    refresh,
    reset,
    lastFetch,
    retryCount,
    canRetry: retryCount < retryAttempts,
    isStale: data && data._isStale,
    hasError: !!error
  };
};

// Hook específico para buscar dados com paginação
export const usePaginatedApi = (endpoint, options = {}) => {
  const {
    pageSize = 20,
    initialPage = 1,
    ...restOptions
  } = options;

  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const params = {
    page,
    limit: pageSize,
    ...restOptions.params
  };

  const { data, loading, error, execute, refresh, reset } = useApi(endpoint, {
    ...restOptions,
    params,
    immediate: true,
    onSuccess: (result) => {
      if (result.data) {
        if (page === 1) {
          setAllData(result.data);
        } else {
          setAllData(prev => [...prev, ...result.data]);
        }
        
        setHasMore(result.data.length === pageSize);
      }
      
      if (restOptions.onSuccess) {
        restOptions.onSuccess(result);
      }
    }
  });

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
    reset();
  }, [reset, initialPage]);

  const refreshPagination = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
    return refresh();
  }, [refresh, initialPage]);

  return {
    data: allData,
    rawData: data,
    loading,
    error,
    hasMore,
    page,
    loadMore,
    refresh: refreshPagination,
    reset: resetPagination,
    execute
  };
};

// Hook para operações CRUD
export const useCrudApi = (baseEndpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar todos os itens
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.get(baseEndpoint);
      setData(result.data || []);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseEndpoint]);

  // Buscar item por ID
  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.get(`${baseEndpoint}/${id}`);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseEndpoint]);

  // Criar novo item
  const create = useCallback(async (item) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.post(baseEndpoint, item);
      
      // Adicionar à lista local
      if (result.data) {
        setData(prev => [...prev, result.data]);
      }
      
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseEndpoint]);

  // Atualizar item
  const update = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.put(`${baseEndpoint}/${id}`, updates);
      
      // Atualizar na lista local
      if (result.data) {
        setData(prev => prev.map(item => 
          item.id === id ? { ...item, ...result.data } : item
        ));
      }
      
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseEndpoint]);

  // Deletar item
  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.delete(`${baseEndpoint}/${id}`);
      
      // Remover da lista local
      setData(prev => prev.filter(item => item.id !== id));
      
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseEndpoint]);

  return {
    data,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    refresh: fetchAll,
    reset: () => {
      setData([]);
      setError(null);
    }
  };
};

export default useApi;