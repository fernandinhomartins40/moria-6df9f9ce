// ========================================
// HOOKS DE CUPONS - MORIA FRONTEND
// Hooks customizados para gerenciamento de cupons
// ========================================

import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';

export const useCoupons = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  const validateCoupon = useCallback(async (code: string, totalPrice: number): Promise<{ 
    valid: boolean; 
    coupon?: any; 
    message?: string; 
    discount?: number 
  }> => {
    try {
      const result = await apiClient.validateCoupon(code, totalPrice);

      if (result.success) {
        return {
          valid: true,
          coupon: result.data.coupon,
          message: result.data.message || 'Cupom válido!',
          discount: result.data.discount
        };
      } else {
        return {
          valid: false,
          message: result.message || 'Cupom inválido'
        };
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return {
        valid: false,
        message: 'Erro ao validar cupom'
      };
    }
  }, []);

  const applyCoupon = useCallback((coupon: any) => {
    setAppliedCoupon(coupon);
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  return {
    appliedCoupon,
    validateCoupon,
    applyCoupon,
    removeCoupon
  };
};