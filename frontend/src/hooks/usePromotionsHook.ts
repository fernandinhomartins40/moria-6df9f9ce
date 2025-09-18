// ========================================
// HOOK DE PROMOÇÕES - MORIA FRONTEND
// Hook otimizado para gerenciamento de promoções com React Query
// ========================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'product' | 'category' | 'general';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  conditions: {
    categories?: string[];
    productIds?: number[];
    minAmount?: number;
    maxUsesPerCustomer?: number;
  };
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const usePromotions = () => {
  // Query para buscar promoções ativas
  const { data: promotionsData, isLoading, error } = useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: () => apiClient.getActivePromotions(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  // Processar promoções ativas
  const activePromotions = useMemo(() => {
    if (!promotionsData?.success || !promotionsData.data) return [];
    
    return promotionsData.data.filter(promotion => {
      // Verificar se está ativa
      if (!promotion.isActive) return false;
      
      // Verificar datas
      const now = new Date();
      if (promotion.startsAt && new Date(promotion.startsAt) > now) return false;
      if (promotion.endsAt && new Date(promotion.endsAt) < now) return false;
      
      return true;
    });
  }, [promotionsData]);

  // Função para aplicar promoções a itens do carrinho
  const applyPromotionsToCart = useMemo(() => {
    return (cartItems: any[], totalAmount: number) => {
      if (activePromotions.length === 0 || cartItems.length === 0) {
        return cartItems.map(item => ({
          ...item,
          price: item.originalPrice,
          appliedPromotion: undefined
        }));
      }

      return cartItems.map(item => {
        let bestPromotion: Promotion | null = null;
        let bestDiscount = 0;

        // Verificar cada promoção ativa
        for (const promotion of activePromotions) {
          // Verificar condições mínimas
          if (promotion.conditions?.minAmount && totalAmount < promotion.conditions.minAmount) {
            continue;
          }

          let isApplicable = false;

          // Verificar aplicabilidade da promoção
          if (promotion.type === 'general') {
            isApplicable = true;
          } else if (promotion.type === 'category') {
            isApplicable = promotion.conditions?.categories?.includes(item.category || '') || false;
          } else if (promotion.type === 'product') {
            isApplicable = promotion.conditions?.productIds?.includes(item.id) || false;
          }

          if (isApplicable) {
            let discount = 0;

            // Calcular desconto
            if (promotion.discountType === 'percentage') {
              discount = (item.originalPrice * promotion.discountValue) / 100;
              if (promotion.maxDiscount) {
                discount = Math.min(discount, promotion.maxDiscount);
              }
            } else {
              discount = promotion.discountValue;
            }

            // Verificar se é a melhor promoção
            if (discount > bestDiscount) {
              bestDiscount = discount;
              bestPromotion = promotion;
            }
          }
        }

        // Aplicar a melhor promoção encontrada
        if (bestPromotion && bestDiscount > 0) {
          return {
            ...item,
            price: Math.max(0, item.originalPrice - bestDiscount),
            appliedPromotion: {
              id: bestPromotion.id,
              name: bestPromotion.name,
              discountAmount: bestDiscount,
              discountType: bestPromotion.discountType
            }
          };
        } else {
          return {
            ...item,
            price: item.originalPrice,
            appliedPromotion: undefined
          };
        }
      });
    };
  }, [activePromotions]);

  // Identificar promoções aplicadas aos itens do carrinho
  const getAppliedPromotions = useMemo(() => {
    return (cartItems: any[]) => {
      const appliedPromotionIds = new Set(
        cartItems
          .filter(item => item.appliedPromotion)
          .map(item => item.appliedPromotion.id)
      );

      return activePromotions.filter(promo => 
        appliedPromotionIds.has(promo.id)
      );
    };
  }, [activePromotions]);

  return {
    // Estado
    activePromotions,
    isLoading,
    error,

    // Funções
    applyPromotionsToCart,
    getAppliedPromotions,
  };
};