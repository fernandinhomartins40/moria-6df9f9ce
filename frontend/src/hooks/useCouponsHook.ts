// ========================================
// HOOK DE CUPONS - MORIA FRONTEND
// Hook otimizado para gerenciamento de cupons com React Query
// ========================================

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useCoupons = () => {
  const queryClient = useQueryClient();
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Query para buscar cupons ativos
  const { data: couponsData, isLoading: isLoadingCoupons } = useQuery({
    queryKey: ['coupons', 'active'],
    queryFn: () => apiClient.getActiveCoupons(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Mutation para validar cupom
  const validateCouponMutation = useMutation({
    mutationFn: ({ code, orderAmount }: { code: string; orderAmount: number }) => 
      apiClient.validateCoupon(code, orderAmount),
    onSuccess: (data) => {
      if (data?.success && data.data?.coupon) {
        setAppliedCoupon(data.data.coupon);
      }
    },
  });

  // Mutation para aplicar cupom
  const applyCouponMutation = useMutation({
    mutationFn: (coupon: Coupon) => {
      // Simular aplicação do cupom no frontend
      return Promise.resolve(coupon);
    },
    onSuccess: (coupon) => {
      setAppliedCoupon(coupon);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutation para remover cupom
  const removeCouponMutation = useMutation({
    mutationFn: () => {
      // Simular remoção do cupom no frontend
      return Promise.resolve();
    },
    onSuccess: () => {
      setAppliedCoupon(null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Funções auxiliares
  const validateCoupon = useCallback((code: string, orderAmount: number) => {
    return validateCouponMutation.mutate({ code, orderAmount });
  }, [validateCouponMutation]);

  const applyCoupon = useCallback((coupon: Coupon) => {
    applyCouponMutation.mutate(coupon);
  }, [applyCouponMutation]);

  const removeCoupon = useCallback(() => {
    removeCouponMutation.mutate();
  }, [removeCouponMutation]);

  const activeCoupons = couponsData?.success ? couponsData.data : [];

  return {
    // Estado
    appliedCoupon,
    activeCoupons,
    isLoadingCoupons,
    
    // Funções
    validateCoupon,
    applyCoupon,
    removeCoupon,
    
    // Estados de loading
    isValidatingCoupon: validateCouponMutation.isPending,
    isApplyingCoupon: applyCouponMutation.isPending,
    isRemovingCoupon: removeCouponMutation.isPending,
    
    // Erros
    validationError: validateCouponMutation.error,
    applyError: applyCouponMutation.error,
    removeError: removeCouponMutation.error,
  };
};