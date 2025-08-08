import { useState, useEffect } from 'react';

// Mock data para desenvolvimento organizados por tipo de oferta
const mockDailyOffers = [
  {
    id: 1,
    name: 'Filtro de Óleo Flash',
    description: 'Filtro de óleo original com desconto relâmpago',
    originalPrice: 45.90,
    discountPrice: 29.90,
    discount: 35,
    category: 'Filtros',
    type: 'daily',
    limited: true,
    stock: 15,
    stockLow: true,
    savings: 16.00,
    active: true,
    image: '/placeholder.svg',
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
  },
  {
    id: 2,
    name: 'Óleo Motor Promo Dia',
    description: 'Óleo sintético 5W30 oferta do dia',
    originalPrice: 52.90,
    discountPrice: 39.90,
    discount: 25,
    category: 'Óleos',
    type: 'daily',
    limited: true,
    stock: 8,
    stockLow: true,
    savings: 13.00,
    active: true,
    image: '/placeholder.svg',
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
];

const mockWeeklyOffers = [
  {
    id: 3,
    name: 'Kit Manutenção Completa',
    description: 'Kit completo com óleo, filtros e revisão',
    originalPrice: 189.90,
    discountPrice: 149.90,
    discount: 21,
    category: 'Kits',
    type: 'weekly',
    limited: false,
    stock: 25,
    stockLow: false,
    savings: 40.00,
    active: true,
    image: '/placeholder.svg'
  },
  {
    id: 4,
    name: 'Pastilhas de Freio Premium',
    description: 'Pastilhas de freio dianteira e traseira',
    originalPrice: 159.90,
    discountPrice: 129.90,
    discount: 19,
    category: 'Freios',
    type: 'weekly',
    limited: false,
    stock: 12,
    stockLow: false,
    savings: 30.00,
    active: true,
    image: '/placeholder.svg'
  }
];

const mockMonthlyOffers = [
  {
    id: 5,
    name: 'Super Kit Automotivo',
    description: 'Kit completo com bateria, pneus e serviços',
    originalPrice: 899.90,
    discountPrice: 699.90,
    discount: 22,
    category: 'Kits Premium',
    type: 'monthly',
    limited: true,
    stock: 5,
    stockLow: true,
    savings: 200.00,
    active: true,
    image: '/placeholder.svg'
  },
  {
    id: 6,
    name: 'Combo Pneus + Alinhamento',
    description: 'Conjunto de 4 pneus com alinhamento gratuito',
    originalPrice: 1299.90,
    discountPrice: 999.90,
    discount: 23,
    category: 'Pneus',
    type: 'monthly',
    limited: true,
    stock: 3,
    stockLow: true,
    savings: 300.00,
    active: true,
    image: '/placeholder.svg'
  }
];

export function usePromotions(filters = {}) {
  const [dailyOffers, setDailyOffers] = useState([]);
  const [weeklyOffers, setWeeklyOffers] = useState([]);
  const [monthlyOffers, setMonthlyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      try {
        let filteredDaily = mockDailyOffers;
        let filteredWeekly = mockWeeklyOffers;
        let filteredMonthly = mockMonthlyOffers;
        
        // Aplicar filtros se houver
        if (filters.active !== undefined) {
          filteredDaily = filteredDaily.filter(p => p.active === filters.active);
          filteredWeekly = filteredWeekly.filter(p => p.active === filters.active);
          filteredMonthly = filteredMonthly.filter(p => p.active === filters.active);
        }
        
        if (filters.type) {
          if (filters.type === 'daily') {
            filteredWeekly = [];
            filteredMonthly = [];
          } else if (filters.type === 'weekly') {
            filteredDaily = [];
            filteredMonthly = [];
          } else if (filters.type === 'monthly') {
            filteredDaily = [];
            filteredWeekly = [];
          }
        }

        setDailyOffers(filteredDaily);
        setWeeklyOffers(filteredWeekly);
        setMonthlyOffers(filteredMonthly);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar promoções:', err);
        setError(err);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  // Também manter compatibilidade com o formato antigo
  const allPromotions = [...dailyOffers, ...weeklyOffers, ...monthlyOffers];

  return {
    // Novo formato para o componente Promotions
    dailyOffers,
    weeklyOffers,
    monthlyOffers,
    // Formato antigo para compatibilidade
    promotions: allPromotions,
    loading,
    error,
    // Função para limpar erros (resolver o problema clearError)
    clearError: () => setError(null)
  };
}

export default usePromotions;