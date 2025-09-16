import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api.ts';
import { useApi } from './useApi.js';

/**
 * Hook para gerenciar produtos
 * Integra com a API backend mantendo compatibilidade com frontend existente
 */
export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: 'Todos',
    active: true,
    search: '',
    ...initialFilters
  });
  
  const { loading, error, execute, clearError } = useApi();

  // Carregar produtos da API
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

    return execute(
      () => apiClient.getProducts(backendFilters),
      (result) => {
        // Validar se result e result.data existem e é array
        if (!result || !result.data || !Array.isArray(result.data)) {
          console.warn('Dados de produtos inválidos:', result);
          setProducts([]);
          return;
        }
        
        // Transformar dados do backend para formato do frontend
        const transformedProducts = result.data.map(product => {
          // Garantir que images seja sempre um array válido
          const images = Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : ["/api/placeholder/300/300"];

          return {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.sale_price || product.price,
            originalPrice: product.promo_price ? product.sale_price : null,
            image: images[0], // Primeira imagem como principal
            images: images, // Array completo de imagens
            rating: 4.5, // Valor padrão até implementarmos reviews
            inStock: product.stock > 0,
            discount: product.promo_price && product.sale_price
              ? Math.round(((product.sale_price - product.promo_price) / product.sale_price) * 100)
              : null,
            description: product.description,
            stock: product.stock,
            active: product.is_active
          };
        });
        
        setProducts(transformedProducts);
      }
    );
  }, [filters, execute]);

  // Buscar produto específico
  const fetchProduct = useCallback(async (productId) => {
    return execute(
      () => apiClient.getProduct(productId),
      (result) => {
        // Validar se result e result.data existem
        if (!result || !result.data) {
          console.warn('Dados de produto inválidos:', result);
          return null;
        }
        
        // Transformar produto individual
        const product = result.data;
        const images = Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : ["/api/placeholder/300/300"];

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.sale_price || product.price,
          originalPrice: product.promo_price ? product.sale_price : null,
          image: images[0],
          images: images,
          rating: 4.5,
          inStock: product.stock > 0,
          discount: product.promo_price && product.sale_price
            ? Math.round(((product.sale_price - product.promo_price) / product.sale_price) * 100)
            : null,
          description: product.description,
          stock: product.stock,
          active: product.is_active,
          specifications: product.specifications || {},
          vehicleCompatibility: product.vehicle_compatibility || []
        };
      }
    );
  }, [execute]);

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
 * Hook simples para buscar um produto específico
 */
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const { loading, error, execute, clearError } = useApi();

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    return execute(
      () => apiClient.getProduct(productId),
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
  }, [productId, execute]);

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