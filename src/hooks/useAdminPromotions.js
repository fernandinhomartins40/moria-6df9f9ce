import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { useNotification } from '../contexts/NotificationContext';
import { showToast } from '../components/ui/toast-custom';

/**
 * Hook para gerenciamento de promoções no painel admin
 * Integra com API SQLite backend
 */
export const useAdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
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

  // Carregar promoções da API
  const fetchPromotions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getPromotions(filters);
      
      if (response && response.success && Array.isArray(response.data)) {
        setPromotions(response.data);
        return response.data;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar promoções';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao carregar promoções',
        message: errorMessage
      });
      
      // Fallback para array vazio em caso de erro
      setPromotions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [notify]);

  // Criar nova promoção
  const createPromotion = useCallback(async (promotionData) => {
    try {
      setCreateLoading(true);
      setError(null);
      
      // Validação básica
      if (!promotionData.name || !promotionData.type || !promotionData.discountType || !promotionData.discountValue) {
        throw new Error('Nome, tipo, tipo de desconto e valor são obrigatórios');
      }
      
      // Preparar dados para API
      const apiData = {
        name: promotionData.name,
        description: promotionData.description || '',
        type: promotionData.type,
        conditions: promotionData.conditions || {},
        discountType: promotionData.discountType,
        discountValue: parseFloat(promotionData.discountValue),
        maxDiscount: promotionData.maxDiscount ? parseFloat(promotionData.maxDiscount) : null,
        startsAt: promotionData.startsAt ? new Date(promotionData.startsAt) : new Date(),
        endsAt: promotionData.endsAt ? new Date(promotionData.endsAt) : null,
        isActive: promotionData.isActive !== undefined ? promotionData.isActive : true
      };
      
      const response = await api.createPromotion(apiData);
      
      if (response && response.success) {
        // Adicionar promoção à lista local
        const newPromotion = response.data;
        setPromotions(prev => [newPromotion, ...prev]);
        
        notify({
          type: 'success',
          title: 'Promoção criada',
          message: `${newPromotion.name} foi criada com sucesso`
        });
        
        return newPromotion;
      } else {
        throw new Error(response?.error || 'Erro ao criar promoção');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar promoção';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao criar promoção',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setCreateLoading(false);
    }
  }, [notify]);

  // Atualizar promoção
  const updatePromotion = useCallback(async (promotionId, promotionData) => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      const response = await api.updatePromotion(promotionId, promotionData);
      
      if (response && response.success) {
        const updatedPromotion = response.data;
        
        // Atualizar promoção na lista local
        setPromotions(prev => 
          prev.map(p => p.id === promotionId ? updatedPromotion : p)
        );
        
        notify({
          type: 'success',
          title: 'Promoção atualizada',
          message: `${updatedPromotion.name} foi atualizada com sucesso`
        });
        
        return updatedPromotion;
      } else {
        throw new Error(response?.error || 'Erro ao atualizar promoção');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar promoção';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao atualizar promoção',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  }, [notify]);

  // Deletar promoção
  const deletePromotion = useCallback(async (promotionId) => {
    try {
      setDeleteLoading(true);
      setError(null);
      
      const response = await api.deletePromotion(promotionId);
      
      if (response && response.success) {
        // Remover promoção da lista local
        setPromotions(prev => prev.filter(p => p.id !== promotionId));
        
        notify({
          type: 'success',
          title: 'Promoção excluída',
          message: 'Promoção foi excluída com sucesso'
        });
        
        return true;
      } else {
        throw new Error(response?.error || 'Erro ao excluir promoção');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao excluir promoção';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao excluir promoção',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  }, [notify]);

  // Toggle status da promoção (ativar/desativar)
  const togglePromotionStatus = useCallback(async (promotionId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const promotion = promotions.find(p => p.id === promotionId);
      
      if (!promotion) {
        throw new Error('Promoção não encontrada');
      }
      
      await updatePromotion(promotionId, { isActive: newStatus });
      
      notify({
        type: 'success',
        title: `Promoção ${newStatus ? 'ativada' : 'desativada'}`,
        message: `${promotion.name} foi ${newStatus ? 'ativada' : 'desativada'} com sucesso`
      });
      
      return newStatus;
    } catch (err) {
      // Erro já tratado no updatePromotion
      throw err;
    }
  }, [promotions, updatePromotion, notify]);

  // Buscar promoção específica
  const getPromotion = useCallback(async (promotionId) => {
    try {
      const response = await api.getPromotion(promotionId);
      
      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.error || 'Promoção não encontrada');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar promoção';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao buscar promoção',
        message: errorMessage
      });
      
      throw err;
    }
  }, [notify]);

  // Verificar se promoção está ativa considerando datas
  const isPromotionActive = useCallback((promotion) => {
    if (!promotion.isActive) return false;
    
    const now = new Date();
    const starts = promotion.startsAt ? new Date(promotion.startsAt) : null;
    const ends = promotion.endsAt ? new Date(promotion.endsAt) : null;
    
    if (starts && now < starts) return false;
    if (ends && now > ends) return false;
    
    return true;
  }, []);

  // Obter promoções ativas
  const getActivePromotions = useCallback(() => {
    return promotions.filter(promotion => isPromotionActive(promotion));
  }, [promotions, isPromotionActive]);

  // Carregar promoções na inicialização
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    promotions,
    loading,
    error,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Ações
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    getPromotion,
    clearError,
    
    // Utilitários
    refetch: fetchPromotions,
    isEmpty: !loading && promotions.length === 0,
    hasError: !!error,
    isPromotionActive,
    getActivePromotions
  };
};