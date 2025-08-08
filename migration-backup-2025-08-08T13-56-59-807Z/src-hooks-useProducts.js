import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { useApi } from './useApi.js';
import publicDataService from '../services/publicDataService.js';

/**
 * Hook para gerenciar produtos - ATUALIZADO PARA PÁGINAS PÚBLICAS
 * Usa APIs públicas por padrão, com fallback para APIs privadas se necessário
 */
export const useProducts = (initialFilters = {}, usePublicAPI = true) => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: 'Todos',
    active: true,
    search: '',
    ...initialFilters
  });
  
  const { loading, error, execute, clearError } = useApi();

  // Carregar produtos da API (pública ou privada)
  const fetchProducts = useCallback(async (customFilters = null) => {
    const apiFilters = customFilters || filters;
    
    // Converter filtros do frontend para formato da API
    const backendFilters = {};
    
    if (apiFilters.category && apiFilters.category !== 'Todos') {
      backendFilters.category = apiFilters.category;
    }
    
    if (apiFilters.active !== undefined) {
      backendFilters.active = apiFilters.active;
    }
    
    if (apiFilters.search) {
      backendFilters.search = apiFilters.search;
    }

    if (usePublicAPI) {
      // Usar API pública com serviço dedicado
      return execute(
        () => publicDataService.getPublicProducts(backendFilters),
        (result) => {
          const processedResult = publicDataService.processPublicResponse(result);
          
          if (processedResult.error && !processedResult.fallback) {
            console.warn('Erro na API pública, dados não disponíveis:', processedResult.error);
            setProducts([]);
            return;
          }
          
          // Transformar dados públicos para formato do frontend
          const transformedProducts = processedResult.data.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.salePrice || product.price,
            originalPrice: product.promoPrice ? product.salePrice || product.price : null,
            image: product.images?.[0] || "/api/placeholder/300/300",
            rating: product.rating || 4.5,
            inStock: product.stock > 0,
            discount: product.promoPrice 
              ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
              : null,
            description: product.description,
            stock: product.stock,
            active: product.isActive
          }));
          
          setProducts(transformedProducts);
        }
      );
    } else {
      // Usar API privada (para admin/painel)
      return execute(
        () => api.getProducts(backendFilters),
        (result) => {
          // Validar se result e result.data existem e é array
          if (!result || !result.data || !Array.isArray(result.data)) {
            console.warn('Dados de produtos inválidos:', result);
            setProducts([]);
            return;
          }
          
          // Transformar dados do backend para formato do frontend
          const transformedProducts = result.data.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.salePrice || product.price,
            originalPrice: product.promoPrice ? product.salePrice : null,
            image: product.images?.[0] || "/api/placeholder/300/300",
            rating: 4.5, // Valor padrão até implementarmos reviews
            inStock: product.stock > 0,
            discount: product.promoPrice 
              ? Math.round(((product.salePrice - product.promoPrice) / product.salePrice) * 100)
              : null,
            description: product.description,
            stock: product.stock,
            active: product.isActive
          }));
          
          setProducts(transformedProducts);
        }
      );
    }
  }, [filters, execute, usePublicAPI]);

  // Buscar produto específico (pública ou privada)
  const fetchProduct = useCallback(async (productId) => {
    if (usePublicAPI) {
      return execute(
        () => publicDataService.getPublicProduct(productId),
        (result) => {
          const processedResult = publicDataService.processPublicResponse(result);
          
          if (processedResult.error) {
            console.warn('Erro ao buscar produto público:', processedResult.error);
            return null;
          }
          
          // Transformar produto público individual
          const product = processedResult.data[0] || processedResult.data;
          if (!product) return null;
          
          return {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.salePrice || product.price,
            originalPrice: product.promoPrice ? product.salePrice || product.price : null,
            image: product.images?.[0] || "/api/placeholder/300/300",
            rating: product.rating || 4.5,
            inStock: product.stock > 0,
            discount: product.promoPrice 
              ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
              : null,
            description: product.description,
            stock: product.stock,
            active: product.isActive,
            specifications: product.specifications || {},
            vehicleCompatibility: product.vehicleCompatibility || []
          };
        }
      );
    } else {
      return execute(
        () => api.getProduct(productId),
        (result) => {
          // Validar se result e result.data existem
          if (!result || !result.data) {
            console.warn('Dados de produto inválidos:', result);
            return null;
          }
          
          // Transformar produto individual
          const product = result.data;
          return {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.salePrice || product.price,
            originalPrice: product.promoPrice ? product.salePrice : null,
            image: product.images?.[0] || "/api/placeholder/300/300",
            rating: 4.5,
            inStock: product.stock > 0,
            discount: product.promoPrice 
              ? Math.round(((product.salePrice - product.promoPrice) / product.salePrice) * 100)
              : null,
            description: product.description,
            stock: product.stock,
            active: product.isActive,
            specifications: product.specifications || {},
            vehicleCompatibility: product.vehicleCompatibility || []
          };
        }
      );
    }
  }, [execute, usePublicAPI]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      category: 'Todos',
      active: true,
      search: ''
    });
  }, []);

  // Carregar produtos quando filtros mudarem
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    filters,
    fetchProducts,
    fetchProduct,
    updateFilters,
    clearFilters,
    clearError
  };
};

/**
 * Hook simples para buscar um produto específico - ATUALIZADO PARA PÁGINAS PÚBLICAS
 */
export const useProduct = (productId, usePublicAPI = true) => {
  const [product, setProduct] = useState(null);
  const { loading, error, execute, clearError } = useApi();

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    if (usePublicAPI) {
      return execute(
        () => publicDataService.getPublicProduct(productId),
        (result) => {
          const processedResult = publicDataService.processPublicResponse(result);
          
          if (processedResult.error) {
            console.warn('Erro ao buscar produto público:', processedResult.error);
            setProduct(null);
            return null;
          }
          
          const product = processedResult.data[0] || processedResult.data;
          if (!product) {
            setProduct(null);
            return null;
          }
          
          const transformedProduct = {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.salePrice || product.price,
            originalPrice: product.promoPrice ? product.salePrice || product.price : null,
            image: product.images?.[0] || "/api/placeholder/300/300",
            rating: product.rating || 4.5,
            inStock: product.stock > 0,
            discount: product.promoPrice 
              ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
              : null,
            description: product.description,
            stock: product.stock,
            active: product.isActive,
            specifications: product.specifications || {},
            vehicleCompatibility: product.vehicleCompatibility || []
          };
          
          setProduct(transformedProduct);
          return transformedProduct;
        }
      );
    } else {
      return execute(
        () => api.getProduct(productId),
        (result) => {
          // Validar se result e result.data existem
          if (!result || !result.data) {
            console.warn('Dados de produto inválidos:', result);
            setProduct(null);
            return null;
          }
          
          const product = result.data;
          const transformedProduct = {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.salePrice || product.price,
            originalPrice: product.promoPrice ? product.salePrice : null,
            image: product.images?.[0] || "/api/placeholder/300/300",
            rating: 4.5,
            inStock: product.stock > 0,
            discount: product.promoPrice 
              ? Math.round(((product.salePrice - product.promoPrice) / product.salePrice) * 100)
              : null,
            description: product.description,
            stock: product.stock,
            active: product.isActive,
            specifications: product.specifications || {},
            vehicleCompatibility: product.vehicleCompatibility || []
          };
          
          setProduct(transformedProduct);
          return transformedProduct;
        }
      );
    }
  }, [productId, execute, usePublicAPI]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
    clearError
  };
};