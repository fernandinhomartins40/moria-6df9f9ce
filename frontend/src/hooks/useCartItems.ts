// ========================================
// HOOKS DE CARRINHO - MORIA FRONTEND
// Hooks customizados para gerenciamento do carrinho
// ========================================

import { useState, useCallback, useMemo } from 'react';
import { apiClient } from '../services/api';
import type { CartItem } from '../types';

interface UseCartItemsProps {
  initialItems?: CartItem[];
}

export const useCartItems = ({ initialItems = [] }: UseCartItemsProps = {}) => {
  const [items, setItems] = useState<CartItem[]>(initialItems);

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
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

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
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

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

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    originalTotalPrice,
    totalSavings
  };
};