import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api.ts';
import { useNotification } from '../contexts/NotificationContext';
import { showToast } from '../components/ui/toast-custom';
import { useAdminAuth } from './useAdminAuth';

/**
 * Hook para gerenciamento de produtos no painel admin
 * Integra com API SQLite backend e verificações de autenticação
 */
export const useAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Verificações de autenticação
  const adminAuth = useAdminAuth();

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
  }, [addNotification]);

  // Carregar produtos da API com verificação de autenticação
  const fetchProducts = useCallback(async (filters = {}) => {
    // Verificar se pode fazer chamadas administrativas
    if (!adminAuth.canMakeAdminCall('/products')) {
      if (!adminAuth.isLoading) {
        setError('Acesso não autorizado');
        notify({
          type: 'error',
          title: 'Acesso negado',
          message: 'Você precisa estar logado como administrador para ver os produtos'
        });
      }
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Carregando produtos (admin)...');

      // Usar includeAuth: true para forçar autenticação
      const response = await apiClient.getProducts(filters, true);

      if (response && response.success && Array.isArray(response.data)) {
        console.log(`✅ Produtos carregados: ${response.data.length} itens`);
        setProducts(response.data);
        return response.data;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar produtos';
      console.error('❌ Erro ao carregar produtos:', err);
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
  }, [adminAuth, notify]);

  // Criar novo produto com verificação de autenticação
  const createProduct = useCallback(async (productData) => {
    if (!adminAuth.requiresAdminAccess('Criar produto')) {
      return null;
    }

    try {
      setCreateLoading(true);
      setError(null);

      // Validação básica
      if (!productData.name || !productData.category || !productData.price) {
        throw new Error('Nome, categoria e preço são obrigatórios');
      }

      console.log('➕ Criando novo produto...');

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

      const response = await apiClient.createProduct(apiData);

      if (response && response.success) {
        // Adicionar produto à lista local
        const newProduct = response.data;
        setProducts(prev => [newProduct, ...prev]);

        console.log(`✅ Produto criado: ${newProduct.name}`);

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
      console.error('❌ Erro ao criar produto:', err);
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
  }, [adminAuth, notify]);

  // Atualizar produto com verificação de autenticação
  const updateProduct = useCallback(async (productId, productData) => {
    if (!adminAuth.requiresAdminAccess('Atualizar produto')) {
      return null;
    }

    try {
      setUpdateLoading(true);
      setError(null);

      console.log(`📝 Atualizando produto ${productId}...`);

      const response = await apiClient.updateProduct(productId, productData);

      if (response && response.success) {
        const updatedProduct = response.data;

        // Atualizar produto na lista local
        setProducts(prev =>
          prev.map(p => p.id === productId ? updatedProduct : p)
        );

        console.log(`✅ Produto atualizado: ${updatedProduct.name}`);

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
      console.error('❌ Erro ao atualizar produto:', err);
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
  }, [adminAuth, notify]);

  // Deletar produto com verificação de autenticação
  const deleteProduct = useCallback(async (productId) => {
    if (!adminAuth.requiresAdminAccess('Excluir produto')) {
      return false;
    }

    try {
      setDeleteLoading(true);
      setError(null);

      console.log(`🗑️ Excluindo produto ${productId}...`);

      const response = await apiClient.deleteProduct(productId);

      if (response && response.success) {
        // Remover produto da lista local
        setProducts(prev => prev.filter(p => p.id !== productId));

        console.log(`✅ Produto excluído: ${productId}`);

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
      console.error('❌ Erro ao excluir produto:', err);
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
  }, [adminAuth, notify]);

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
      const response = await apiClient.getProduct(productId);
      
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

  // Carregar produtos na inicialização, mas apenas se o usuário for admin
  useEffect(() => {
    const loadInitialData = async () => {
      // Aguardar autenticação completar
      if (adminAuth.isLoading) {
        console.log('⏳ Aguardando autenticação completar...');
        return;
      }

      // Só carregar se for admin
      if (adminAuth.canAccessAdminFeatures) {
        console.log('🔓 Usuário autorizado, carregando produtos...');
        await fetchProducts();
      } else {
        console.log('🔒 Usuário não é admin, não carregando produtos');
        setProducts([]); // Limpar produtos se não for admin
      }
    };

    loadInitialData();
  }, [adminAuth.isLoading, adminAuth.canAccessAdminFeatures, fetchProducts]);

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

    // Estados de autenticação
    isAuthenticated: adminAuth.isAuthenticated,
    isAdmin: adminAuth.isAdmin,
    canAccessAdminFeatures: adminAuth.canAccessAdminFeatures,
    authLoading: adminAuth.isLoading,

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
    isEmpty: !loading && products.length === 0 && !adminAuth.isLoading,
    hasError: !!error,
    isReady: !adminAuth.isLoading && adminAuth.canAccessAdminFeatures,

    // Mensagens de status para debug
    authStatus: adminAuth.canAccessAdminFeatures
      ? 'Autorizado'
      : adminAuth.isLoading
        ? 'Verificando...'
        : 'Não autorizado'
  };
};