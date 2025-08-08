import { useState, useEffect, useCallback } from 'react';
import supabaseApi from '../services/supabaseApi.ts';
import { useNotification } from '../contexts/NotificationContext';
import { showToast } from '../components/ui/toast-custom';

/**
 * Hook para gerenciamento de produtos no painel admin
 * Integra com API SQLite backend
 */
export const useAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Tentar usar contexto de notificação, usar toast como fallback
  let addNotification = null;
  try {
    ({ addNotification } = useNotification());
  } catch (e) {
    // Contexto não disponível
  }

  const notify = useCallback((notification) => {
    if (addNotification) {
      addNotification(notification);
    } else {
      showToast(notification);
    }
  }, [notify]);

  // Carregar produtos da API
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await supabaseApi.getProducts(filters);
      
      if (response && response.success && Array.isArray(response.data)) {
        setProducts(response.data);
        return response.data;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar produtos';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao carregar produtos',
        message: errorMessage
      });
      
      // Fallback para array vazio em caso de erro
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [notify]);

  // Criar novo produto
  const createProduct = useCallback(async (productData) => {
    try {
      setCreateLoading(true);
      setError(null);
      
      // Validação básica
      if (!productData.name || !productData.category || !productData.price) {
        throw new Error('Nome, categoria e preço são obrigatórios');
      }
      
      // Preparar dados para API
      const apiData = {
        name: productData.name,
        description: productData.description || '',
        category: productData.category,
        price: parseFloat(productData.price),
        salePrice: productData.salePrice ? parseFloat(productData.salePrice) : null,
        promoPrice: productData.promoPrice ? parseFloat(productData.promoPrice) : null,
        stock: parseInt(productData.stock) || 0,
        minStock: parseInt(productData.minStock) || 5,
        sku: productData.sku || '',
        brand: productData.brand || '',
        supplier: productData.supplier || '',
        images: productData.images || [],
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        specifications: productData.specifications || {},
        vehicleCompatibility: productData.vehicleCompatibility || []
      };
      
      const response = await supabaseApi.createProduct(apiData);
      
      if (response && response.success) {
        // Adicionar produto à lista local
        const newProduct = response.data;
        setProducts(prev => [newProduct, ...prev]);
        
        notify({
          type: 'success',
          title: 'Produto criado',
          message: `${newProduct.name} foi criado com sucesso`
        });
        
        return newProduct;
      } else {
        throw new Error(response?.error || 'Erro ao criar produto');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar produto';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao criar produto',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setCreateLoading(false);
    }
  }, [notify]);

  // Atualizar produto
  const updateProduct = useCallback(async (productId, productData) => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      const response = await supabaseApi.updateProduct(productId, productData);
      
      if (response && response.success) {
        const updatedProduct = response.data;
        
        // Atualizar produto na lista local
        setProducts(prev => 
          prev.map(p => p.id === productId ? updatedProduct : p)
        );
        
        notify({
          type: 'success',
          title: 'Produto atualizado',
          message: `${updatedProduct.name} foi atualizado com sucesso`
        });
        
        return updatedProduct;
      } else {
        throw new Error(response?.error || 'Erro ao atualizar produto');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar produto';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao atualizar produto',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  }, [notify]);

  // Deletar produto
  const deleteProduct = useCallback(async (productId) => {
    try {
      setDeleteLoading(true);
      setError(null);
      
      const response = await supabaseApi.deleteProduct(productId);
      
      if (response && response.success) {
        // Remover produto da lista local
        setProducts(prev => prev.filter(p => p.id !== productId));
        
        notify({
          type: 'success',
          title: 'Produto excluído',
          message: 'Produto foi excluído com sucesso'
        });
        
        return true;
      } else {
        throw new Error(response?.error || 'Erro ao excluir produto');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao excluir produto';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao excluir produto',
        message: errorMessage
      });
      
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  }, [notify]);

  // Toggle status do produto (ativar/desativar)
  const toggleProductStatus = useCallback(async (productId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      
      await updateProduct(productId, { isActive: newStatus });
      
      notify({
        type: 'success',
        title: `Produto ${newStatus ? 'ativado' : 'desativado'}`,
        message: `${product.name} foi ${newStatus ? 'ativado' : 'desativado'} com sucesso`
      });
      
      return newStatus;
    } catch (err) {
      // Erro já tratado no updateProduct
      throw err;
    }
  }, [products, updateProduct, notify]);

  // Buscar produto específico
  const getProduct = useCallback(async (productId) => {
    try {
      const response = await supabaseApi.getProduct(productId);
      
      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.error || 'Produto não encontrado');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar produto';
      setError(errorMessage);
      
      notify({
        type: 'error',
        title: 'Erro ao buscar produto',
        message: errorMessage
      });
      
      throw err;
    }
  }, [notify]);

  // Carregar produtos na inicialização
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    products,
    loading,
    error,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Ações
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProduct,
    clearError,
    
    // Utilitários
    refetch: fetchProducts,
    isEmpty: !loading && products.length === 0,
    hasError: !!error
  };
};