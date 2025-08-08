import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';

interface UseSupabaseDataOptions {
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
}

interface UseSupabaseDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
}

export function useSupabaseData<T = any>({
  tableName,
  select = '*',
  filters = {},
  orderBy,
  enabled = true
}: UseSupabaseDataOptions): UseSupabaseDataResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(tableName).select(select);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key.includes('search')) {
            // Para busca por texto, usar ilike
            const searchColumn = key.replace('search_', '');
            query = query.ilike(searchColumn, `%${value}%`);
          } else if (typeof value === 'boolean') {
            query = query.eq(key, value);
          } else if (typeof value === 'string') {
            query = query.eq(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Aplicar ordenação
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      const { data: result, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      setData(result || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error(`Erro ao buscar ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const create = async (newData: Partial<T>): Promise<T | null> => {
    try {
      setError(null);
      const { data: result, error: supabaseError } = await supabase
        .from(tableName)
        .insert(newData)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Atualizar dados locais
      if (result) {
        setData(prev => prev ? [result, ...prev] : [result]);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar';
      setError(errorMessage);
      console.error(`Erro ao criar ${tableName}:`, err);
      return null;
    }
  };

  const update = async (id: string, updateData: Partial<T>): Promise<T | null> => {
    try {
      setError(null);
      const { data: result, error: supabaseError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Atualizar dados locais
      if (result) {
        setData(prev => prev ? prev.map(item => 
          (item as any).id === id ? result : item
        ) : [result]);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar';
      setError(errorMessage);
      console.error(`Erro ao atualizar ${tableName}:`, err);
      return null;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: supabaseError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Remover dos dados locais
      setData(prev => prev ? prev.filter(item => (item as any).id !== id) : []);

      return true;
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
    remove
  };
}

// Hook especializado para produtos
export function useProducts(filters?: { 
  category?: string; 
  search?: string; 
  active?: boolean 
}) {
  return useSupabaseData<any>({
    tableName: 'products_view',
    select: '*',
    filters: {
      category: filters?.category,
      search_name: filters?.search,
      is_active: filters?.active ?? true
    },
    orderBy: { column: 'created_at', ascending: false }
  });
}

// Hook especializado para serviços
export function useServices(filters?: { 
  search?: string; 
  active?: boolean 
}) {
  return useSupabaseData<any>({
    tableName: 'services',
    select: '*',
    filters: {
      search_name: filters?.search,
      is_active: filters?.active ?? true
    },
    orderBy: { column: 'created_at', ascending: false }
  });
}

// Hook para um único item por ID
export function useSupabaseItem<T = any>(tableName: string, id: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: result, error: supabaseError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        setData(result);
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