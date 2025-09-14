import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services/api.ts';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Hook genérico para chamadas de API
 * Gerencia loading, error e data states automaticamente
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Hook de notificação pode não estar disponível em todos os contextos
  let addNotification = null;
  try {
    ({ addNotification } = useNotification());
  } catch (e) {
    // Contexto não disponível, usar console
  }

  const execute = useCallback(async (apiCall, onSuccess = null, onError = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      
      // Mostrar notificação de erro se disponível
      if (addNotification) {
        addNotification({
          type: 'error',
          title: 'Erro na API',
          message: errorMessage
        });
      }
      
      if (onError) {
        onError(err);
      } else {
        console.error('API Error:', errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError
  };
};

/**
 * Hook para operações assíncronas básicas
 * Similar ao useApi mas com foco em data fetching
 */
export const useAsync = (asyncFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
      setData(result);
      
      return result;
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
      console.error('Async Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook para localStorage com API integration
 */
export const useLocalStorage = (key, initialValue = null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook para debounce de valores
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

