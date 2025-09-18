import { CartItem } from '../contexts/CartContext';

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

/**
 * Testa a aplicação de promoções em itens do carrinho
 * Esta função simula o comportamento do CartContext
 */
export function testPromotionApplication(
  items: Omit<CartItem, 'quantity' | 'originalPrice' | 'appliedPromotion'>[],
  promotions: Promotion[]
): {
  items: CartItem[];
  appliedPromotions: Promotion[];
  totalSavings: number;
  originalTotal: number;
  finalTotal: number;
} {
  // Converter itens para formato do carrinho
  const cartItems: CartItem[] = items.map(item => ({
    ...item,
    originalPrice: item.price,
    quantity: 1,
    appliedPromotion: undefined
  }));

  // Calcular subtotal
  const originalTotal = cartItems.reduce((sum, item) => sum + item.originalPrice, 0);
  
  // Filtrar promoções ativas e aplicáveis
  const activePromotions = promotions.filter(promotion => {
    if (!promotion.isActive) return false;
    
    // Verificar datas
    const now = new Date();
    if (promotion.startsAt && new Date(promotion.startsAt) > now) return false;
    if (promotion.endsAt && new Date(promotion.endsAt) < now) return false;
    
    // Verificar valor mínimo
    if (promotion.conditions?.minAmount && originalTotal < promotion.conditions.minAmount) return false;
    
    return true;
  });
  
  // Aplicar promoções aos itens
  const updatedItems = cartItems.map(item => {
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
  
  // Calcular valores finais
  const finalTotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
  const totalSavings = originalTotal - finalTotal;
  
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
    items: updatedItems,
    appliedPromotions,
    totalSavings,
    originalTotal,
    finalTotal
  };
}

/**
 * Cenários de teste para validar o sistema de promoções
 */
export function runPromotionTests() {
  console.log('🧪 Iniciando testes do sistema de promoções...\n');

  // Produtos de exemplo
  const testProducts = [
    { id: 1, name: 'Filtro de Óleo', price: 25.90, category: 'Filtros', type: 'product' as const },
    { id: 2, name: 'Pastilha de Freio', price: 139.90, category: 'Freios', type: 'product' as const },
    { id: 3, name: 'Troca de Óleo', price: 95.00, category: 'Manutenção', type: 'service' as const },
  ];

  // Promoções de exemplo
  const testPromotions: Promotion[] = [
    {
      id: 1,
      name: 'Desconto Geral 10%',
      type: 'general',
      conditions: {},
      discountType: 'percentage',
      discountValue: 10,
      isActive: true
    },
    {
      id: 2,
      name: 'Filtros com 20% Off',
      type: 'category',
      conditions: { categories: ['Filtros'] },
      discountType: 'percentage',
      discountValue: 20,
      maxDiscount: 15,
      isActive: true
    },
    {
      id: 3,
      name: 'R$ 50 Off Freios',
      type: 'category',
      conditions: { categories: ['Freios'], minAmount: 100 },
      discountType: 'fixed',
      discountValue: 50,
      isActive: true
    },
    {
      id: 4,
      name: 'Produto Específico',
      type: 'product',
      conditions: { productIds: [1] },
      discountType: 'fixed',
      discountValue: 5,
      isActive: true
    }
  ];

  // Teste 1: Promoção geral
  console.log('📋 Teste 1: Promoção Geral (10% em tudo)');
  const result1 = testPromotionApplication([testProducts[0]], [testPromotions[0]]);
  console.log(`Original: R$ ${result1.originalTotal.toFixed(2)}`);
  console.log(`Final: R$ ${result1.finalTotal.toFixed(2)}`);
  console.log(`Economia: R$ ${result1.totalSavings.toFixed(2)}`);
  console.log(`Promoções aplicadas: ${result1.appliedPromotions.map(p => p.name).join(', ')}\n`);

  // Teste 2: Promoção por categoria
  console.log('📋 Teste 2: Promoção por Categoria (20% em Filtros)');
  const result2 = testPromotionApplication([testProducts[0]], [testPromotions[1]]);
  console.log(`Original: R$ ${result2.originalTotal.toFixed(2)}`);
  console.log(`Final: R$ ${result2.finalTotal.toFixed(2)}`);
  console.log(`Economia: R$ ${result2.totalSavings.toFixed(2)}`);
  console.log(`Promoções aplicadas: ${result2.appliedPromotions.map(p => p.name).join(', ')}\n`);

  // Teste 3: Múltiplas promoções - melhor desconto
  console.log('📋 Teste 3: Múltiplas Promoções - Melhor Desconto');
  const result3 = testPromotionApplication([testProducts[0]], testPromotions);
  console.log(`Original: R$ ${result3.originalTotal.toFixed(2)}`);
  console.log(`Final: R$ ${result3.finalTotal.toFixed(2)}`);
  console.log(`Economia: R$ ${result3.totalSavings.toFixed(2)}`);
  console.log(`Promoções aplicadas: ${result3.appliedPromotions.map(p => p.name).join(', ')}\n`);

  // Teste 4: Carrinho misto
  console.log('📋 Teste 4: Carrinho com Produtos e Serviços');
  const result4 = testPromotionApplication(testProducts, testPromotions);
  console.log(`Original: R$ ${result4.originalTotal.toFixed(2)}`);
  console.log(`Final: R$ ${result4.finalTotal.toFixed(2)}`);
  console.log(`Economia: R$ ${result4.totalSavings.toFixed(2)}`);
  console.log(`Promoções aplicadas: ${result4.appliedPromotions.map(p => p.name).join(', ')}\n`);

  console.log('✅ Testes concluídos!');
  
  return {
    test1: result1,
    test2: result2,
    test3: result3,
    test4: result4
  };
}

// Para usar no console do navegador:
// import { runPromotionTests } from './src/utils/promotionTester.ts';
// runPromotionTests();