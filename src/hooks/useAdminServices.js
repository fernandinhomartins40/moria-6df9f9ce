import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api.ts';
import { useNotification } from '../contexts/NotificationContext';
import { showToast } from '../components/ui/toast-custom';

/**
 * Hook para gerenciamento de serviços no painel admin
 * Integra com API SQLite backend
 */
export const useAdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Tentar usar contexto de notificação, usar toast como fallback
  let addNotification = null;
  try {
    ({ addNotification } = useNotification());
  } catch (e) {
    // Contexto não disponível
  }

  const notify = useCallback((notification) => {
    if (addNotification) {
      addNotification(notification);
    } else {
      showToast(notification);
    }
  }, [addNotification]);

  // Carregar serviços da API
  const fetchServices = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getServices(filters);
      
      if (response && response.success && Array.isArray(response.data)) {
        setServices(response.data);
        return response.data;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar serviços';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao carregar serviços',
        message: errorMessage
      });
      
      // Fallback para array vazio em caso de erro
      setServices([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [notify]);

  // Criar novo serviço
  const createService = useCallback(async (serviceData) => {
    try {
      setCreateLoading(true);
      setError(null);
      
      // Validação básica
      if (!serviceData.name || !serviceData.category || !serviceData.basePrice) {
        throw new Error('Nome, categoria e preço base são obrigatórios');
      }
      
      // Preparar dados para API
      const apiData = {
        name: serviceData.name,
        description: serviceData.description || '',
        category: serviceData.category,
        basePrice: parseFloat(serviceData.basePrice),
        estimatedTime: parseInt(serviceData.estimatedTime) || 60,
        specifications: serviceData.specifications || {},
        isActive: serviceData.isActive !== undefined ? serviceData.isActive : true
      };
      
      const response = await apiClient.createService(apiData);
      
      if (response && response.success) {
        // Adicionar serviço à lista local
        const newService = response.data;
        setServices(prev => [newService, ...prev]);
        
        notify({
          type: 'success',
          title: 'Serviço criado',
          message: `${newService.name} foi criado com sucesso`
        });
        
        return newService;
      } else {
        throw new Error(response?.error || 'Erro ao criar serviço');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar serviço';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao criar serviço',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setCreateLoading(false);
    }
  }, [notify]);

  // Atualizar serviço
  const updateService = useCallback(async (serviceId, serviceData) => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      const response = await apiClient.updateService(serviceId, serviceData);
      
      if (response && response.success) {
        const updatedService = response.data;
        
        // Atualizar serviço na lista local
        setServices(prev => 
          prev.map(s => s.id === serviceId ? updatedService : s)
        );
        
        notify({
          type: 'success',
          title: 'Serviço atualizado',
          message: `${updatedService.name} foi atualizado com sucesso`
        });
        
        return updatedService;
      } else {
        throw new Error(response?.error || 'Erro ao atualizar serviço');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar serviço';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao atualizar serviço',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  }, [notify]);

  // Deletar serviço
  const deleteService = useCallback(async (serviceId) => {
    try {
      setDeleteLoading(true);
      setError(null);
      
      const response = await apiClient.deleteService(serviceId);
      
      if (response && response.success) {
        // Remover serviço da lista local
        setServices(prev => prev.filter(s => s.id !== serviceId));
        
        notify({
          type: 'success',
          title: 'Serviço excluído',
          message: 'Serviço foi excluído com sucesso'
        });
        
        return true;
      } else {
        throw new Error(response?.error || 'Erro ao excluir serviço');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao excluir serviço';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao excluir serviço',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  }, [notify]);

  // Toggle status do serviço (ativar/desativar)
  const toggleServiceStatus = useCallback(async (serviceId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const service = services.find(s => s.id === serviceId);
      
      if (!service) {
        throw new Error('Serviço não encontrado');
      }
      
      await updateService(serviceId, { isActive: newStatus });
      
      notify({
        type: 'success',
        title: `Serviço ${newStatus ? 'ativado' : 'desativado'}`,
        message: `${service.name} foi ${newStatus ? 'ativado' : 'desativado'} com sucesso`
      });
      
      return newStatus;
    } catch (err) {
      // Erro já tratado no updateService
      throw err;
    }
  }, [services, updateService, notify]);

  // Buscar serviço específico
  const getService = useCallback(async (serviceId) => {
    try {
      const response = await apiClient.getService(serviceId);
      
      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.error || 'Serviço não encontrado');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar serviço';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao buscar serviço',
        message: errorMessage
      });
      
      throw err;
    }
  }, [notify]);

  // Carregar serviços na inicialização
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    services,
    loading,
    error,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Ações
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    getService,
    clearError,
    
    // Utilitários
    refetch: fetchServices,
    isEmpty: !loading && services.length === 0,
    hasError: !!error
  };
};