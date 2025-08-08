import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { RefreshCw, Package, Activity, AlertCircle, CheckCircle } from "lucide-react";

// Importar API service
import api, { formatPrice, formatDateTime } from '@/services/api.js';

/**
 * Componente de exemplo para demonstrar integração com backend
 * - Mostra como usar o API service
 * - Demonstra funcionamento em dev vs produção
 * - Health check da API
 * - CRUD básico de produtos
 */
const ApiExample = () => {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ========================================
  // HEALTH CHECK
  // ========================================
  
  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.healthCheck();
      setHealth(response);
    } catch (err) {
      setError(`Health Check falhou: ${err.message}`);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // DASHBOARD STATS
  // ========================================

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError(`Erro ao carregar estatísticas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // PRODUCTS
  // ========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getProducts({ active: true });
      setProducts(response.data || []);
    } catch (err) {
      setError(`Erro ao carregar produtos: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const createSampleProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newProduct = {
        name: `Produto Teste ${Date.now()}`,
        description: 'Produto criado via API para demonstração',
        category: 'Teste',
        price: 99.90,
        stock: 10,
        active: true
      };

      const response = await api.createProduct(newProduct);
      
      if (response.success) {
        // Recarregar lista após criar
        await loadProducts();
        await loadStats();
      }
    } catch (err) {
      setError(`Erro ao criar produto: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    // Carregar dados iniciais
    checkHealth();
    loadStats();
    loadProducts();
  }, []);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exemplo de Integração com Backend</h1>
          <p className="text-gray-600 mt-2">
            Demonstração do API Service funcionando em desenvolvimento e produção
          </p>
        </div>
        <Button 
          onClick={() => {
            checkHealth();
            loadStats();
            loadProducts();
          }}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Tudo
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Erro</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Backend
          </CardTitle>
          <CardDescription>
            Verificação de conectividade com a API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">API Funcionando</span>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Mensagem:</strong> {health.message}</p>
                <p><strong>Ambiente:</strong> {health.environment}</p>
                <p><strong>Timestamp:</strong> {formatDateTime(health.timestamp)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Não foi possível conectar com o backend</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Sistema</CardTitle>
            <CardDescription>
              Dados em tempo real do backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
                <div className="text-sm text-gray-600">Produtos Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Pedidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatPrice(stats.totalRevenue)}
                </div>
                <div className="text-sm text-gray-600">Receita Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos ({products.length})
              </CardTitle>
              <CardDescription>
                Lista de produtos carregada via API
              </CardDescription>
            </div>
            <Button 
              onClick={createSampleProduct}
              disabled={loading}
              size="sm"
            >
              Criar Produto Teste
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>Nenhum produto encontrado</p>
              <p className="text-sm">Clique em "Criar Produto Teste" para adicionar um item</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{product.category}</Badge>
                        {product.active ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Estoque: {product.stock}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>🔗 API Base URL:</strong> /api (path relativo)</p>
          <p><strong>⚛️ Frontend:</strong> http://localhost:8080 (desenvolvimento)</p>
          <p><strong>🚀 Backend:</strong> http://localhost:3080 (desenvolvimento)</p>
          <p><strong>📡 Proxy:</strong> Vite proxy /api → backend em desenvolvimento</p>
          <p><strong>🏭 Produção:</strong> Tudo em uma porta (backend serve frontend)</p>
          <Separator className="my-4" />
          <p className="text-gray-600">
            Este componente demonstra como usar o API service para comunicar com o backend.
            Em desenvolvimento usa proxy, em produção usa o mesmo servidor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiExample;