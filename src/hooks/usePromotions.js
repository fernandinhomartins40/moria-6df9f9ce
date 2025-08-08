import { useState, useEffect } from 'react';

// Mock data para desenvolvimento
const mockPromotions = [
  {
    id: 1,
    title: 'Combo Manutenção Completa',
    description: 'Troca de óleo + filtro + revisão por um preço especial',
    originalPrice: 189.90,
    discountPrice: 149.90,
    discount: 21,
    type: 'combo',
    validUntil: '2024-12-31',
    active: true,
    image: '/api/placeholder/400/250'
  },
  {
    id: 2,
    title: 'Frete Grátis',
    description: 'Frete grátis para compras acima de R$ 150',
    discount: 0,
    type: 'shipping',
    validUntil: '2024-11-30',
    active: true,
    image: '/api/placeholder/400/250'
  },
  {
    id: 3,
    title: 'Kit Filtros em Promoção',
    description: 'Kit com filtro de óleo, ar e combustível com 25% off',
    originalPrice: 120.00,
    discountPrice: 89.90,
    discount: 25,
    type: 'product',
    validUntil: '2024-12-15',
    active: true,
    image: '/api/placeholder/400/250'
  }
];

export function usePromotions(filters = {}) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      let filteredPromotions = mockPromotions;
      
      // Aplicar filtros se houver
      if (filters.active !== undefined) {
        filteredPromotions = filteredPromotions.filter(p => p.active === filters.active);
      }
      
      if (filters.type) {
        filteredPromotions = filteredPromotions.filter(p => p.type === filters.type);
      }

      setPromotions(filteredPromotions);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  return {
    promotions,
    loading,
    error
  };
}

export default usePromotions;