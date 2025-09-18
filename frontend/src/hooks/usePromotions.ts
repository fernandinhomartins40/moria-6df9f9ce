// ========================================
// HOOKS DE PROMOÇÕES - MORIA FRONTEND
// Hooks customizados para gerenciamento de promoções
// ========================================

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services/api';

interface Promotion {
  id: number;
  name: string;
  type: 'product' | 'category' | 'general';
  conditions: {
    categories?: string[];
    productIds?: number[];
    minAmount?: number;
    maxUsesPerCustomer?: number;
  };
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image?: string;
  category?: string;
  type?: 'product' | 'service';
  description?: string;
  appliedPromotion?: {
    id: number;
    name: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
  };
}

export const usePromotions = () => {
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [appliedPromotions, setAppliedPromotions] = useState<Promotion[]>([]);

  const loadPromotions = useCallback(async () => {
    try {
      const response = await apiClient.getActivePromotions();
      if (response?.success && response.data) {
        // Mapear dados da API para formato esperado pelo frontend
        const promotions = response.data.map((promo: any) => ({
          id: promo.id,
          name: promo.name,
          type: 'general' as const,
          conditions: {
            categories: JSON.parse(promo.applicable_categories || '[]'),
            productIds: JSON.parse(promo.applicable_products || '[]'),
            minAmount: promo.min_amount || 0,
            maxUsesPerCustomer: promo.usage_limit_per_user
          },
          discountType: promo.type === 'percentage' ? 'percentage' as const : 'fixed' as const,
          discountValue: promo.discount_value,
          maxDiscount: promo.type === 'percentage' ? undefined : promo.discount_value,
          startsAt: promo.start_date,
          endsAt: promo.end_date,
          isActive: promo.is_active
        }));
        setAvailablePromotions(promotions);
      }
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
    }
  }, []);

  // Carregar promoções ao inicializar
  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const applyPromotionsToItems = useCallback((items: CartItem[], subtotal: number): CartItem[] => {
    // Filtrar promoções ativas e aplicáveis
    const activePromotions = availablePromotions.filter(promotion => {
      if (!promotion.isActive) return false;
      
      // Verificar datas
      const now = new Date();
      if (promotion.startsAt && new Date(promotion.startsAt) > now) return false;
      if (promotion.endsAt && new Date(promotion.endsAt) < now) return false;
      
      // Verificar valor mínimo
      if (promotion.conditions?.minAmount && subtotal < promotion.conditions.minAmount) return false;
      
      return true;
    });
    
    // Aplicar promoções aos itens
    const updatedItems = items.map(item => {
      let bestPromotion: Promotion | null = null;
      let bestDiscount = 0;
      
      for (const promotion of activePromotions) {
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
          
          if (promotion.discountType === 'percentage') {
            discount = (item.originalPrice * promotion.discountValue) / 100;
            if (promotion.maxDiscount) {
              discount = Math.min(discount, promotion.maxDiscount);
            }
          } else {
            discount = promotion.discountValue;
          }
          
          if (discount > bestDiscount) {
            bestDiscount = discount;
            bestPromotion = promotion;
          }
        }
      }
      
      // Aplicar melhor promoção encontrada
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
    
    // Identificar promoções aplicadas
    const appliedPromotionIds = new Set(
      updatedItems
        .filter(item => item.appliedPromotion)
        .map(item => item.appliedPromotion!.id)
    );
    
    const newAppliedPromotions = activePromotions.filter(promo => 
      appliedPromotionIds.has(promo.id)
    );
    
    setAppliedPromotions(newAppliedPromotions);
    
    return updatedItems;
  }, [availablePromotions]);

  return {
    availablePromotions,
    appliedPromotions,
    loadPromotions,
    applyPromotionsToItems
  };
};