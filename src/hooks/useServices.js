import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api.ts';
import { useApi } from './useApi.js';

/**
 * Hook para gerenciar serviços
 * Integra com a API backend mantendo compatibilidade com frontend existente
 */
export const useServices = (initialFilters = {}) => {
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({
    active: true,
    ...initialFilters
  });
  
  const { loading, error, execute, clearError } = useApi();

  // Mapeamento de ícones para manter compatibilidade com frontend existente
  const getServiceIcon = (serviceName) => {
    const iconMap = {
      'Troca de Óleo': 'Droplets',
      'Manutenção Preventiva': 'Wrench',
      'Diagnóstico Eletrônico': 'Search',
      'Freios e Suspensão': 'Disc',
      'Ar Condicionado': 'Snowflake',
      'Sistema Elétrico': 'Zap',
      'Alinhamento': 'Target',
      'Balanceamento': 'RotateCcw'
    };
    
    return iconMap[serviceName] || 'Wrench';
  };

  // Carregar serviços da API
  const fetchServices = useCallback(async (customFilters = null) => {
    const apiFilters = customFilters || filters;
    
    // Converter filtros para formato da API
    const backendFilters = {};
    
    if (apiFilters.active !== undefined) {
      backendFilters.active = apiFilters.active;
    }

    return execute(
      () => apiClient.getServices(backendFilters),
      (result) => {
        // Validar se result e result.data existem e é array
        if (!result || !result.data || !Array.isArray(result.data)) {
          console.warn('Dados de serviços inválidos:', result);
          setServices([]);
          return;
        }
        
        // Transformar dados do backend para formato do frontend existente
        const transformedServices = result.data.map((service, index) => ({
          id: service.id,
          icon: getServiceIcon(service.name),
          title: service.name,
          description: service.description,
          features: [
            service.specifications?.duracao || "Serviço completo",
            service.specifications?.garantia || "Garantia inclusa",
            service.specifications?.qualidade || "Peças originais"
          ],
          price: service.basePrice && service.basePrice > 0 
            ? `A partir de R$ ${service.basePrice.toFixed(2).replace('.', ',')}`
            : "Sob orçamento",
          category: service.category || "Serviços",
          estimatedTime: service.estimatedTime || "A definir",
          active: service.isActive
        }));
        
        setServices(transformedServices);
      }
    );
  }, [filters, execute]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({ active: true });
  }, []);

  // Carregar serviços quando filtros mudarem
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    filters,
    fetchServices,
    updateFilters,
    clearFilters,
    clearError
  };
};