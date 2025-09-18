// ========================================
// HOOK DE ESTADO DO CARRINHO - MORIA FRONTEND
// Hook otimizado para gerenciamento do estado do carrinho com React Query
// ========================================

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { CartItem } from '@/types';

interface UseCartStateProps {
  initialItems?: CartItem[];
}

export const useCartState = ({ initialItems = [] }: UseCartStateProps = {}) => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [isOpen, setIsOpen] = useState(false);

  // Queries para promoções e cupons
  const { data: promotionsData } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => apiClient.getActivePromotions(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutations para operações de carrinho
  const addItemMutation = useMutation({
    mutationFn: async (item: Omit<CartItem, 'quantity' | 'originalPrice' | 'appliedPromotion'>) => {
      // Esta função será implementada no backend futuramente
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      // Esta função será implementada no backend futuramente
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      // Esta função será implementada no backend futuramente
      return { id, quantity };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Ações do carrinho
  const addItem = useCallback((item: Omit<CartItem, 'quantity' | 'originalPrice' | 'appliedPromotion'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      }
      
      return [
        ...prevItems,
        {
          ...item,
          originalPrice: item.price,
          quantity: 1,
          appliedPromotion: undefined
        }
      ];
    });
    
    // Acionar mutation para persistência
    addItemMutation.mutate(item);
  }, [addItemMutation]);

  const removeItem = useCallback((id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    removeItemMutation.mutate(id);
  }, [removeItemMutation]);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity } 
          : item
      )
    );
    
    updateQuantityMutation.mutate({ id, quantity });
  }, [removeItem, updateQuantityMutation]);

  const clearCart = useCallback(() => {
    setItems([]);
    queryClient.setQueryData(['cart'], []);
  }, [queryClient]);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Cálculos do carrinho
  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  );

  const totalPrice = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
    [items]
  );

  const originalTotalPrice = useMemo(() => 
    items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0), 
    [items]
  );

  const totalSavings = useMemo(() => 
    originalTotalPrice - totalPrice, 
    [originalTotalPrice, totalPrice]
  );

  // Promoções aplicadas
  const appliedPromotions = useMemo(() => {
    if (!promotionsData?.success || !promotionsData.data) return [];
    
    // Filtrar promoções ativas e aplicáveis
    return promotionsData.data.filter(promotion => {
      if (!promotion.isActive) return false;
      
      const now = new Date();
      if (promotion.startsAt && new Date(promotion.startsAt) > now) return false;
      if (promotion.endsAt && new Date(promotion.endsAt) < now) return false;
      
      // Verificar valor mínimo
      if (promotion.conditions?.minAmount && totalPrice < promotion.conditions.minAmount) return false;
      
      return true;
    });
  }, [promotionsData, totalPrice]);

  return {
    // Estado do carrinho
    items,
    isOpen,
    totalItems,
    totalPrice,
    originalTotalPrice,
    totalSavings,
    appliedPromotions,
    
    // Ações do carrinho
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    
    // Estados de loading
    isAddingItem: addItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
  };
};