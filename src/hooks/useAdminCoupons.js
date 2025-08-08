import { useState, useEffect, useCallback } from 'react';
import supabaseApi from '../services/supabaseApi.ts';
import { useNotification } from '../contexts/NotificationContext';
import { showToast } from '../components/ui/toast-custom';

/**
 * Hook para gerenciamento de cupons no painel admin
 * Integra com API SQLite backend
 */
export const useAdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);
  
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

  // Carregar cupons da API
  const fetchCoupons = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await supabaseApi.getCoupons(filters);
      
      if (response && response.success && Array.isArray(response.data)) {
        setCoupons(response.data);
        return response.data;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar cupons';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao carregar cupons',
        message: errorMessage
      });
      
      // Fallback para array vazio em caso de erro
      setCoupons([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [notify]);

  // Criar novo cupom
  const createCoupon = useCallback(async (couponData) => {
    try {
      setCreateLoading(true);
      setError(null);
      
      // Validação básica
      if (!couponData.code || !couponData.discountType || !couponData.discountValue) {
        throw new Error('Código, tipo de desconto e valor são obrigatórios');
      }
      
      // Preparar dados para API
      const apiData = {
        code: couponData.code.toUpperCase(),
        description: couponData.description || '',
        discountType: couponData.discountType,
        discountValue: parseFloat(couponData.discountValue),
        maxDiscount: couponData.maxDiscount ? parseFloat(couponData.maxDiscount) : null,
        minimumAmount: couponData.minimumAmount ? parseFloat(couponData.minimumAmount) : null,
        usageLimit: parseInt(couponData.usageLimit) || 1,
        usageCount: 0,
        expiresAt: couponData.expiresAt ? new Date(couponData.expiresAt) : null,
        isActive: couponData.isActive !== undefined ? couponData.isActive : true
      };
      
      const response = await supabaseApi.createCoupon(apiData);
      
      if (response && response.success) {
        // Adicionar cupom à lista local
        const newCoupon = response.data;
        setCoupons(prev => [newCoupon, ...prev]);
        
        notify({
          type: 'success',
          title: 'Cupom criado',
          message: `Cupom ${newCoupon.code} foi criado com sucesso`
        });
        
        return newCoupon;
      } else {
        throw new Error(response?.error || 'Erro ao criar cupom');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar cupom';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao criar cupom',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setCreateLoading(false);
    }
  }, [notify]);

  // Atualizar cupom
  const updateCoupon = useCallback(async (couponId, couponData) => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      const response = await supabaseApi.updateCoupon(couponId, couponData);
      
      if (response && response.success) {
        const updatedCoupon = response.data;
        
        // Atualizar cupom na lista local
        setCoupons(prev => 
          prev.map(c => c.id === couponId ? updatedCoupon : c)
        );
        
        notify({
          type: 'success',
          title: 'Cupom atualizado',
          message: `Cupom ${updatedCoupon.code} foi atualizado com sucesso`
        });
        
        return updatedCoupon;
      } else {
        throw new Error(response?.error || 'Erro ao atualizar cupom');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar cupom';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao atualizar cupom',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  }, [notify]);

  // Deletar cupom
  const deleteCoupon = useCallback(async (couponId) => {
    try {
      setDeleteLoading(true);
      setError(null);
      
      const response = await supabaseApi.deleteCoupon(couponId);
      
      if (response && response.success) {
        // Remover cupom da lista local
        setCoupons(prev => prev.filter(c => c.id !== couponId));
        
        notify({
          type: 'success',
          title: 'Cupom excluído',
          message: 'Cupom foi excluído com sucesso'
        });
        
        return true;
      } else {
        throw new Error(response?.error || 'Erro ao excluir cupom');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao excluir cupom';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao excluir cupom',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  }, [notify]);

  // Toggle status do cupom (ativar/desativar)
  const toggleCouponStatus = useCallback(async (couponId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const coupon = coupons.find(c => c.id === couponId);
      
      if (!coupon) {
        throw new Error('Cupom não encontrado');
      }
      
      await updateCoupon(couponId, { isActive: newStatus });
      
      notify({
        type: 'success',
        title: `Cupom ${newStatus ? 'ativado' : 'desativado'}`,
        message: `Cupom ${coupon.code} foi ${newStatus ? 'ativado' : 'desativado'} com sucesso`
      });
      
      return newStatus;
    } catch (err) {
      // Erro já tratado no updateCoupon
      throw err;
    }
  }, [coupons, updateCoupon, notify]);

  // Validar cupom
  const validateCoupon = useCallback(async (code, orderAmount) => {
    try {
      setValidateLoading(true);
      setError(null);
      
      const response = await supabaseApi.validateCoupon({ code, orderAmount });
      
      if (response && response.success) {
        notify({
          type: 'success',
          title: 'Cupom válido',
          message: `Desconto de R$ ${response.data.discountAmount.toFixed(2)} aplicado`
        });
        
        return response.data;
      } else {
        throw new Error(response?.error || 'Cupom inválido');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao validar cupom';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Cupom inválido',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setValidateLoading(false);
    }
  }, [notify]);

  // Buscar cupom específico
  const getCoupon = useCallback(async (couponId) => {
    try {
      const response = await supabaseApi.getCoupon(couponId);
      
      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.error || 'Cupom não encontrado');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar cupom';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao buscar cupom',
        message: errorMessage
      });
      
      throw err;
    }
  }, [notify]);

  // Carregar cupons na inicialização
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    coupons,
    loading,
    error,
    createLoading,
    updateLoading,
    deleteLoading,
    validateLoading,
    
    // Ações
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getCoupon,
    clearError,
    
    // Utilitários
    refetch: fetchCoupons,
    isEmpty: !loading && coupons.length === 0,
    hasError: !!error
  };
};