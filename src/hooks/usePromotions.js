import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { useApi } from './useApi.js';

/**
 * Hook para gerenciar promoções na página pública
 * Integra com a API backend e categoriza promoções por tipo
 */
export const usePromotions = (initialFilters = {}) => {
  const [promotions, setPromotions] = useState([]);
  const [dailyOffers, setDailyOffers] = useState([]);
  const [weeklyOffers, setWeeklyOffers] = useState([]);
  const [monthlyOffers, setMonthlyOffers] = useState([]);
  const [filters, setFilters] = useState({
    active: true,
    ...initialFilters
  });
  
  const { loading, error, execute, clearError } = useApi();

  // Mapear dados do banco para formato esperado pelo componente
  const transformPromotionToProduct = (promotion) => {
    // Calcular preços baseado no tipo de desconto
    const basePrice = promotion.conditions?.basePrice || 150; // Preço base mais realista
    const discountValue = promotion.discountValue || 10;
    
    let discountPrice = basePrice;
    let discountPercent = 0;
    
    if (promotion.discountType === 'percentage') {
      discountPercent = Math.round(discountValue);
      discountPrice = Math.round(basePrice * (1 - discountValue / 100) * 100) / 100;
    } else if (promotion.discountType === 'fixed') {
      discountPrice = Math.max(0, basePrice - discountValue);
      discountPercent = Math.round((1 - discountPrice / basePrice) * 100);
    }
    
    // Determinar se é uma oferta limitada (termina em menos de 48h)
    const isLimited = promotion.endsAt && 
      new Date(promotion.endsAt) - new Date() < 48 * 60 * 60 * 1000;
    
    // Gerar nomes mais realistas baseados na categoria e desconto
    const categoryNames = {
      'motor': ['Kit Filtros + Óleo Motor', 'Velas de Ignição Premium', 'Kit Correia Dentada'],
      'freios': ['Kit Pastilha + Disco de Freio', 'Fluido de Freio DOT4', 'Lonas de Freio'],
      'suspensao': ['Amortecedores Par', 'Kit Molas Esportivas', 'Bieletas Estabilizadoras'],
      'eletrica': ['Bateria 60Ah', 'Kit Cabos de Vela', 'Alternador Remanufaturado'],
      'general': ['Kit Manutenção Completa', 'Kit Revisão', 'Combo Peças Originais']
    };
    
    const categoryKey = (promotion.conditions?.category || 'general').toLowerCase();
    const possibleNames = categoryNames[categoryKey] || categoryNames.general;
    const productName = promotion.name || possibleNames[promotion.id % possibleNames.length];
    
    return {
      id: promotion.id,
      name: productName,
      originalPrice: basePrice,
      discountPrice: discountPrice,
      discount: discountPercent,
      image: "/api/placeholder/300/300", // Placeholder por enquanto
      category: promotion.conditions?.category || "Geral",
      limited: isLimited,
      endTime: promotion.endsAt ? new Date(promotion.endsAt) : null,
      description: promotion.description,
      type: promotion.type
    };
  };

  // Categorizar promoções por tipo baseado no tempo de duração
  const categorizePromotions = (promotions) => {
    const now = new Date();
    const daily = [];
    const weekly = [];
    const monthly = [];

    promotions.forEach(promotion => {
      if (!promotion.isActive) return;
      
      // Verificar se a promoção está ativa no momento
      const startsAt = promotion.startsAt ? new Date(promotion.startsAt) : new Date(0);
      const endsAt = promotion.endsAt ? new Date(promotion.endsAt) : new Date('2099-12-31');
      
      if (now < startsAt || now > endsAt) return;
      
      const product = transformPromotionToProduct(promotion);
      
      // Categorizar baseado na duração ou tipo da promoção
      const duration = endsAt - startsAt;
      const hours = duration / (1000 * 60 * 60);
      
      if (hours <= 24 || promotion.type === 'daily') {
        daily.push(product);
      } else if (hours <= 168 || promotion.type === 'weekly') { // 7 dias
        weekly.push(product);
      } else {
        monthly.push(product);
      }
    });

    return { daily, weekly, monthly };
  };

  // Buscar promoções da API
  const fetchPromotions = useCallback(async () => {
    clearError();
    
    const response = await execute(async () => {
      const params = new URLSearchParams();
      
      if (filters.active !== undefined) {
        params.append('active', filters.active);
      }
      
      const result = await api.get(`/api/promotions?${params.toString()}`);
      return result.data;
    });

    if (response?.success && response?.data) {
      const promotionsData = response.data;
      setPromotions(promotionsData);
      
      // Categorizar promoções
      const { daily, weekly, monthly } = categorizePromotions(promotionsData);
      
      // Limitar quantidade de ofertas por categoria
      setDailyOffers(daily.slice(0, 4));
      setWeeklyOffers(weekly.slice(0, 4));
      setMonthlyOffers(monthly.slice(0, 2));
    } else {
      // Em caso de erro, manter arrays vazios para não quebrar a UI
      setDailyOffers([]);
      setWeeklyOffers([]);
      setMonthlyOffers([]);
    }
  }, [filters, execute, clearError]);

  // Carregar promoções ao montar o componente ou quando filtros mudarem
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refresh manual
  const refresh = useCallback(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return {
    // Dados categorizados para compatibilidade com Promotions.tsx
    dailyOffers,
    weeklyOffers,
    monthlyOffers,
    
    // Dados brutos se necessário
    promotions,
    
    // Estados
    loading,
    error,
    
    // Métodos
    updateFilters,
    refresh,
    clearError
  };
};