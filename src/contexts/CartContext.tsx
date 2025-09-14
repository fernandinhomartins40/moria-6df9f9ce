import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { apiClient } from '../services/api.ts';

export interface CartItem {
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

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  availablePromotions: Promotion[];
  appliedPromotions: Promotion[];
  appliedCoupon: any | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity' | 'originalPrice' | 'appliedPromotion'> }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_PROMOTIONS'; payload: Promotion[] }
  | { type: 'APPLY_PROMOTIONS' }
  | { type: 'APPLY_COUPON'; payload: any }
  | { type: 'REMOVE_COUPON' };

const initialState: CartState = {
  items: [],
  isOpen: false,
  availablePromotions: [],
  appliedPromotions: [],
  appliedCoupon: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        const newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
        return applyPromotionsToState(newState);
      }
      const newItem: CartItem = {
        ...action.payload,
        originalPrice: action.payload.price,
        quantity: 1,
        appliedPromotion: undefined
      };
      const newState = {
        ...state,
        items: [...state.items, newItem],
      };
      return applyPromotionsToState(newState);

    case 'REMOVE_ITEM':
      const removeState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
      return applyPromotionsToState(removeState);

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        const deleteState = {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
        return applyPromotionsToState(deleteState);
      }
      const updateState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
      return applyPromotionsToState(updateState);

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        appliedPromotions: [],
      };
    
    case 'LOAD_PROMOTIONS':
      const stateWithPromotions = {
        ...state,
        availablePromotions: action.payload,
      };
      return applyPromotionsToState(stateWithPromotions);
      
    case 'APPLY_PROMOTIONS':
      return applyPromotionsToState(state);

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
}

// Função para aplicar promoções ao estado do carrinho
function applyPromotionsToState(state: CartState): CartState {
  const { items, availablePromotions } = state;
  
  // Calcular subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  
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
  
  const appliedPromotions = activePromotions.filter(promo => 
    appliedPromotionIds.has(promo.id)
  );
  
  return {
    ...state,
    items: updatedItems,
    appliedPromotions
  };
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  originalTotalPrice: number;
  totalSavings: number;
  appliedPromotions: Promotion[];
  appliedCoupon: any | null;
  addItem: (item: Omit<CartItem, 'quantity' | 'originalPrice' | 'appliedPromotion'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  loadPromotions: () => Promise<void>;
  validateCoupon: (code: string) => Promise<{ valid: boolean; coupon?: any; message?: string; discount?: number }>;
  applyCoupon: (coupon: any) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotalPrice = state.items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const totalSavings = originalTotalPrice - totalPrice;

  // Carregar promoções ao inicializar
  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await apiClient.getActivePromotions();
      if (response?.success && response.data) {
        // Mapear dados da API para formato esperado pelo frontend
        const promotions = response.data.map((promo: any) => ({
          id: promo.id,
          name: promo.name,
          type: 'general' as const, // Adaptar conforme necessário
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
        dispatch({ type: 'LOAD_PROMOTIONS', payload: promotions });
      }
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
    }
  };

  const validateCoupon = async (code: string): Promise<{ valid: boolean; coupon?: any; message?: string; discount?: number }> => {
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
  };

  const applyCoupon = (coupon: any) => {
    dispatch({ type: 'APPLY_COUPON', payload: coupon });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const contextValue: CartContextType = {
    items: state.items,
    isOpen: state.isOpen,
    totalItems,
    totalPrice,
    originalTotalPrice,
    totalSavings,
    appliedPromotions: state.appliedPromotions,
    appliedCoupon: state.appliedCoupon,
    addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    updateQuantity: (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
    openCart: () => dispatch({ type: 'OPEN_CART' }),
    closeCart: () => dispatch({ type: 'CLOSE_CART' }),
    loadPromotions,
    validateCoupon,
    applyCoupon,
    removeCoupon,
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