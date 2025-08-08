import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api.js';
import { useApi } from './useApiRobust.js';
import publicDataService from '../services/publicDataService.js';

/**
 * Hook avançado para gerenciar promoções - ATUALIZADO PARA PÁGINAS PÚBLICAS
 * FASE 2: Cross-reference com produtos, cache inteligente e UX melhorada
 * Usa APIs públicas por padrão, com fallback para APIs privadas se necessário
 */
export const usePromotions = (initialFilters = {}, usePublicAPI = true) => {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [dailyOffers, setDailyOffers] = useState([]);
  const [weeklyOffers, setWeeklyOffers] = useState([]);
  const [monthlyOffers, setMonthlyOffers] = useState([]);
  const [cache, setCache] = useState({});
  const [lastFetch, setLastFetch] = useState(null);
  const [filters, setFilters] = useState({
    active: true,
    ...initialFilters
  });
  
  const { loading, error, execute, clearError } = useApi();
  
  // Cache TTL (Time To Live) em minutos
  const CACHE_TTL = {
    daily: 5,    // 5 minutos para ofertas diárias
    weekly: 30,  // 30 minutos para ofertas semanais  
    monthly: 60  // 1 hora para ofertas mensais
  };

  // Verificar se cache ainda é válido
  const isCacheValid = (cacheKey, ttlMinutes) => {
    if (!cache[cacheKey]) return false;
    const now = new Date();
    const cacheTime = new Date(cache[cacheKey].timestamp);
    const diffMinutes = (now - cacheTime) / (1000 * 60);
    return diffMinutes < ttlMinutes;
  };

  // Buscar produto real do banco baseado nas condições da promoção - ADAPTADO PARA SCHEMA REAL
  const findRealProduct = (promotion) => {
    if (!products.length) return null;
    
    // ADAPTAÇÃO: promotion.category é direto no schema, não dentro de conditions
    const conditions = promotion.conditions || {};
    const promotionCategory = promotion.category || conditions.category;
    
    // Primeiro, tentar encontrar produto específico por ID
    if (conditions.productId) {
      return products.find(p => p.id === conditions.productId);
    }
    
    // Depois, tentar por categoria da promoção
    if (promotionCategory) {
      const categoryProducts = products.filter(p => 
        p.category?.toLowerCase().includes(promotionCategory.toLowerCase()) && p.isActive
      );
      return categoryProducts[0]; // Pegar primeiro produto da categoria
    }
    
    // Por último, produto mais popular ou primeiro ativo
    return products.find(p => p.isActive) || products[0];
  };

  // Mapear dados do banco para formato esperado pelo componente (VERSÃO MELHORADA FASE 2)
  const transformPromotionToProduct = (promotion) => {
    // Buscar produto real do banco
    const realProduct = findRealProduct(promotion);
    
    // Calcular preços baseado no produto real ou valores padrão
    let basePrice = realProduct?.price || promotion.conditions?.basePrice || 150;
    const discountValue = promotion.discountValue || 10;
    
    let discountPrice = basePrice;
    let discountPercent = 0;
    
    // Aplicar desconto no preço real do produto
    if (promotion.discountType === 'percentage') {
      discountPercent = Math.round(discountValue);
      discountPrice = Math.round(basePrice * (1 - discountValue / 100) * 100) / 100;
      
      // Aplicar limite máximo de desconto se especificado
      if (promotion.maxDiscount && (basePrice - discountPrice) > promotion.maxDiscount) {
        discountPrice = basePrice - promotion.maxDiscount;
        discountPercent = Math.round((promotion.maxDiscount / basePrice) * 100);
      }
    } else if (promotion.discountType === 'fixed') {
      discountPrice = Math.max(0, basePrice - discountValue);
      discountPercent = Math.round((1 - discountPrice / basePrice) * 100);
    }
    
    // Determinar se é uma oferta limitada (termina em menos de 48h) - ADAPTADO PARA SCHEMA REAL
    const now = new Date();
    const endDate = promotion.endDate || promotion.endsAt;
    const isLimited = endDate && new Date(endDate) - now < 48 * 60 * 60 * 1000;
    
    // Usar nome e dados reais do produto se disponível - ADAPTADO PARA SCHEMA REAL
    const productName = realProduct?.name || promotion.title || 'Produto em Promoção';
    const productImage = realProduct?.images?.[0] || "/api/placeholder/300/300";
    const productCategory = realProduct?.category || promotion.category || "Geral";
    const stockAvailable = realProduct?.stock || 0;
    const stockLow = stockAvailable > 0 && stockAvailable < 5;
    
    return {
      id: promotion.id,
      productId: realProduct?.id, // ID do produto real para referência
      name: productName,
      originalPrice: basePrice,
      discountPrice: discountPrice,
      discount: discountPercent,
      image: productImage,
      category: productCategory,
      limited: isLimited,
      endTime: promotion.endDate ? new Date(promotion.endDate) : null,
      description: realProduct?.description || promotion.description,
      // Campo type não existe no schema, removido
      // Novos campos da Fase 2
      stock: stockAvailable,
      stockLow: stockLow,
      realProduct: realProduct, // Dados completos do produto
      promotionData: promotion, // Dados originais da promoção
      savings: Math.round((basePrice - discountPrice) * 100) / 100 // Economia calculada
    };
  };

  // Categorizar promoções por tipo baseado no tempo de duração (ADAPTADO PARA SCHEMA REAL)
  const categorizePromotions = (promotions) => {
    const now = new Date();
    const daily = [];
    const weekly = [];
    const monthly = [];

    promotions.forEach(promotion => {
      if (!promotion.isActive) return;
      
      // ADAPTAÇÃO: usar startDate/endDate ao invés de startsAt/endsAt
      const startsAt = promotion.startDate ? new Date(promotion.startDate) : new Date(0);
      const endsAt = promotion.endDate ? new Date(promotion.endDate) : new Date('2099-12-31');
      
      if (now < startsAt || now > endsAt) return;
      
      const product = transformPromotionToProduct(promotion);
      
      // Categorizar baseado na duração (já que não temos campo 'type')
      const duration = endsAt - startsAt;
      const hours = duration / (1000 * 60 * 60);
      
      // Categorizar por duração ou título da promoção
      const title = (promotion.title || '').toLowerCase();
      
      if (hours <= 24 || title.includes('flash') || title.includes('diári')) {
        daily.push(product);
      } else if (hours <= 168 || title.includes('semana') || title.includes('kit')) { // 7 dias
        weekly.push(product);
      } else {
        monthly.push(product);
      }
    });

    return { daily, weekly, monthly };
  };

  // Buscar produtos ativos para cross-reference (pública ou privada)
  const fetchProducts = useCallback(async () => {
    const cacheKey = 'products';
    
    // Verificar cache de produtos (válido por 30 minutos)
    if (isCacheValid(cacheKey, 30)) {
      setProducts(cache[cacheKey].data);
      return cache[cacheKey].data;
    }

    try {
      let response;
      
      if (usePublicAPI) {
        // Usar API pública
        response = await publicDataService.getPublicProducts({ active: true });
        const processedResult = publicDataService.processPublicResponse(response);
        
        if (processedResult.error && !processedResult.fallback) {
          console.warn('Erro ao buscar produtos públicos para promoções:', processedResult.error);
          return [];
        }
        
        if (processedResult.data && processedResult.data.length > 0) {
          const productsData = processedResult.data;
          setProducts(productsData);
          
          // Atualizar cache
          setCache(prev => ({
            ...prev,
            [cacheKey]: {
              data: productsData,
              timestamp: new Date().toISOString()
            }
          }));
          
          return productsData;
        }
      } else {
        // Usar API privada
        response = await api.getProducts({ active: true });
        if (response?.success && response?.data) {
          const productsData = response.data;
          setProducts(productsData);
          
          // Atualizar cache
          setCache(prev => ({
            ...prev,
            [cacheKey]: {
              data: productsData,
              timestamp: new Date().toISOString()
            }
          }));
          
          return productsData;
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar produtos para promoções:', error);
    }
    
    return [];
  }, [cache, usePublicAPI]);

  // Buscar promoções da API com cache inteligente
  const fetchPromotions = useCallback(async () => {
    clearError();
    
    const cacheKey = `promotions_${JSON.stringify(filters)}`;
    
    // Verificar cache baseado no tipo de promoção
    if (isCacheValid(cacheKey, CACHE_TTL.daily)) {
      const cachedData = cache[cacheKey];
      setPromotions(cachedData.promotions);
      setDailyOffers(cachedData.daily);
      setWeeklyOffers(cachedData.weekly);
      setMonthlyOffers(cachedData.monthly);
      return;
    }
    
    // Buscar produtos primeiro se não temos
    let productsData = products;
    if (!products.length) {
      productsData = await fetchProducts();
    }

    let response;
    
    if (usePublicAPI) {
      // Usar API pública
      response = await execute(async () => {
        const result = await publicDataService.getPublicPromotions();
        return result;
      });
      
      // Processar resposta da API pública
      const processedResult = publicDataService.processPublicResponse(response);
      
      if (processedResult.error && !processedResult.fallback) {
        console.warn('Erro na API pública de promoções:', processedResult.error);
        setDailyOffers([]);
        setWeeklyOffers([]);
        setMonthlyOffers([]);
        return;
      }
      
      response = { success: true, data: processedResult.data };
    } else {
      // Usar API privada
      response = await execute(async () => {
        const params = new URLSearchParams();
        
        if (filters.active !== undefined) {
          params.append('active', filters.active);
        }
        
        const result = await api.getPromotions(Object.fromEntries(params));
        return result;
      });
    }

    if (response?.success && response?.data) {
      const promotionsData = response.data;
      setPromotions(promotionsData);
      
      // Categorizar promoções com produtos reais
      const { daily, weekly, monthly } = categorizePromotions(promotionsData);
      
      // Limitar quantidade de ofertas por categoria
      const dailyLimited = daily.slice(0, 4);
      const weeklyLimited = weekly.slice(0, 4);
      const monthlyLimited = monthly.slice(0, 2);
      
      setDailyOffers(dailyLimited);
      setWeeklyOffers(weeklyLimited);
      setMonthlyOffers(monthlyLimited);
      
      // Atualizar cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          promotions: promotionsData,
          daily: dailyLimited,
          weekly: weeklyLimited,
          monthly: monthlyLimited,
          timestamp: new Date().toISOString()
        }
      }));
      
      setLastFetch(new Date());
    } else {
      // Em caso de erro, manter arrays vazios para não quebrar a UI
      setDailyOffers([]);
      setWeeklyOffers([]);
      setMonthlyOffers([]);
    }
  }, [filters, execute, clearError, products, cache, fetchProducts, usePublicAPI]);

  // Carregar promoções ao montar o componente ou quando filtros mudarem
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Auto-refresh para ofertas diárias (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      // Só fazer refresh se há ofertas diárias e não está carregando
      if (dailyOffers.length > 0 && !loading) {
        fetchPromotions();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [dailyOffers.length, loading, fetchPromotions]);

  // Atualizar filtros e limpar cache relacionado
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Limpar cache relacionado quando filtros mudam
    const newFilterKey = `promotions_${JSON.stringify({ ...filters, ...newFilters })}`;
    setCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (key.startsWith('promotions_') && key !== newFilterKey) {
          delete newCache[key];
        }
      });
      return newCache;
    });
  }, [filters]);

  // Refresh manual com limpeza de cache
  const refresh = useCallback(() => {
    setCache({}); // Limpar todo cache
    fetchPromotions();
  }, [fetchPromotions]);

  // Limpar cache expirado
  const clearExpiredCache = useCallback(() => {
    const now = new Date();
    setCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        const cacheTime = new Date(newCache[key].timestamp);
        const diffMinutes = (now - cacheTime) / (1000 * 60);
        if (diffMinutes > 120) { // Cache expirado há mais de 2 horas
          delete newCache[key];
        }
      });
      return newCache;
    });
  }, []);

  // Executar limpeza de cache periodicamente
  useEffect(() => {
    const cleanup = setInterval(clearExpiredCache, 30 * 60 * 1000); // A cada 30 minutos
    return () => clearInterval(cleanup);
  }, [clearExpiredCache]);

  // Memoizar dados para evitar re-renders desnecessários
  const memoizedData = useMemo(() => ({
    dailyOffers,
    weeklyOffers,
    monthlyOffers,
    promotions,
    products,
    lastFetch,
    cacheStatus: {
      size: Object.keys(cache).length,
      lastCleanup: new Date().toISOString()
    }
  }), [dailyOffers, weeklyOffers, monthlyOffers, promotions, products, lastFetch, cache]);

  return {
    // Dados categorizados para compatibilidade com Promotions.tsx
    ...memoizedData,
    
    // Estados
    loading,
    error,
    
    // Métodos avançados da Fase 2
    updateFilters,
    refresh,
    clearError,
    clearCache: () => setCache({}),
    invalidateCache: (pattern) => {
      setCache(prev => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach(key => {
          if (key.includes(pattern)) {
            delete newCache[key];
          }
        });
        return newCache;
      });
    },
    
    // Utilities para debug (apenas development)
    ...(process.env.NODE_ENV === 'development' && {
      _debug: {
        cache,
        lastFetch,
        filters,
        cacheHitRate: Object.keys(cache).length > 0 ? 'cached' : 'fresh'
      }
    })
  };
};