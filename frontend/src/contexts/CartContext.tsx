// ========================================
// CONTEXTO DO CARRINHO SIMPLIFICADO - MORIA FRONTEND
// Contexto otimizado com hooks customizados
// ========================================

import { createContext, useContext, useState, ReactNode } from 'react';
import { useCartItems } from '../hooks/useCartItems';
import { usePromotions } from '../hooks/usePromotions';
import { useCoupons } from '../hooks/useCoupons';
import type { CartItem } from '../types';

interface CartContextType {
  // Estado do carrinho
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  originalTotalPrice: number;
  totalSavings: number;
  
  // Promoções e cupons
  appliedPromotions: any[];
  appliedCoupon: any | null;
  
  // Ações do carrinho
  addItem: (item: Omit<CartItem, 'quantity' | 'originalPrice' | 'appliedPromotion'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Ações de promoções e cupons
  loadPromotions: () => Promise<void>;
  validateCoupon: (code: string, totalPrice: number) => Promise<{ valid: boolean; coupon?: any; message?: string; discount?: number }>;
  applyCoupon: (coupon: any) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Hooks customizados
  const cartItems = useCartItems();
  const promotions = usePromotions();
  const coupons = useCoupons();
  
  // Aplicar promoções aos itens do carrinho
  const itemsWithPromotions = promotions.applyPromotionsToItems(
    cartItems.items, 
    cartItems.originalTotalPrice
  );
  
  // Atualizar itens com promoções aplicadas
  const items = itemsWithPromotions;
  const totalItems = cartItems.totalItems;
  const totalPrice = cartItems.totalPrice;
  const originalTotalPrice = cartItems.originalTotalPrice;
  const totalSavings = cartItems.totalSavings;

  // Ações do carrinho
  const toggleCart = () => setIsOpen(prev => !prev);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const contextValue: CartContextType = {
    // Estado do carrinho
    items,
    isOpen,
    totalItems,
    totalPrice,
    originalTotalPrice,
    totalSavings,
    
    // Promoções e cupons
    appliedPromotions: promotions.appliedPromotions,
    appliedCoupon: coupons.appliedCoupon,
    
    // Ações do carrinho
    addItem: cartItems.addItem,
    removeItem: cartItems.removeItem,
    updateQuantity: cartItems.updateQuantity,
    clearCart: cartItems.clearCart,
    toggleCart,
    openCart,
    closeCart,
    
    // Ações de promoções e cupons
    loadPromotions: promotions.loadPromotions,
    validateCoupon: coupons.validateCoupon,
    applyCoupon: coupons.applyCoupon,
    removeCoupon: coupons.removeCoupon
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}