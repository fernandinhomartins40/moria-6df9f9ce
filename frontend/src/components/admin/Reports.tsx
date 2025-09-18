// ========================================
// COMPONENTE DE RELATÓRIOS - MORIA ADMIN
// Componente otimizado para relatórios administrativos
// ========================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  Package,
  Wrench,
  Gift,
  AlertCircle,
  DollarSign,
  Truck
} from "lucide-react";

interface ReportsProps {
  stats: any;
  orders: any[];
  products: any[];
  formatPrice: (price: number) => string;
}

export function Reports({ stats, orders, products, formatPrice }: ReportsProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Dados REAIS baseados nos pedidos do API
  const salesByMonth = Array.from({ length: 12 }, (_, i) => {
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === i && orderDate.getFullYear() === currentYear;
    });
    
    return {
      month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
      orders: monthOrders.length
    };
  });

  // Calcular categorias baseadas nos produtos REAIS do API
  const categoryStats = products.reduce((acc, product) => {
    const category = product.category || 'Outros';
    if (!acc[category]) {
      acc[category] = { count: 0, revenue: 0 };
    }
    acc[category].count += 1;
    // Estimar receita baseada nos pedidos que contêm este produto
    const productOrders = orders.filter(order => 
      order.items.some(item => item.id === product.id)
    );
    acc[category].revenue += productOrders.reduce((sum, order) => {
      const productItem = order.items.find(item => item.id === product.id);
      return sum + (productItem ? productItem.quantity * productItem.price : 0);
    }, 0);
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const topCategories = Object.entries(categoryStats)
    .map(([name, data]) => ({
      name,
      value: data.count,
      revenue: formatPrice(data.revenue)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">Base: {orders.length} pedidos reais</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">{stats.pendingOrders} pendentes</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">{formatPrice(stats.averageTicket)}</p>
                <p className="text-xs text-gray-500">Valor médio por pedido</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activeProducts}</p>
                <p className="text-xs text-gray-500">de {stats.totalProducts} produtos</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Mês - {currentYear}</CardTitle>
            <CardDescription>Receita e número de pedidos mensais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByMonth.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${index === currentMonth ? 'bg-moria-orange' : 'bg-gray-300'}`} />
                    <span className="font-medium">{data.month}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(data.revenue)}</p>
                    <p className="text-sm text-gray-500">{data.orders} pedidos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categorias</CardTitle>
            <CardDescription>Categorias mais vendidas por receita</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{category.revenue}</span>
                      <span className="text-sm text-gray-500 ml-2">({category.value}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-moria-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estoque</CardTitle>
            <CardDescription>Status do inventário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de Produtos</span>
                <Badge variant="secondary">{stats.totalProducts}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Produtos Ativos</span>
                <Badge className="bg-green-100 text-green-800">{stats.activeProducts}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Estoque Baixo</span>
                <Badge className="bg-yellow-100 text-yellow-800">{stats.lowStockProducts}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sem Estoque</span>
                <Badge className="bg-red-100 text-red-800">{stats.outOfStockProducts}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sm">Valor do Inventário</span>
                <span className="text-moria-orange">{formatPrice(stats.totalInventoryValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços</CardTitle>
            <CardDescription>Performance dos serviços</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de Serviços</span>
                <Badge variant="secondary">{stats.totalServices}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Serviços Ativos</span>
                <Badge className="bg-green-100 text-green-800">{stats.activeServices}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Orçamentos Pendentes</span>
                <Badge className="bg-yellow-100 text-yellow-800">{stats.pendingQuotes}</Badge>
              </div>
              <Separator />
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-moria-orange">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Taxa de conversão orçamento → pedido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketing</CardTitle>
            <CardDescription>Campanhas e cupons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de Cupons</span>
                <Badge variant="secondary">{stats.totalCoupons}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cupons Válidos</span>
                <Badge className="bg-green-100 text-green-800">{stats.activeCoupons}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de Clientes</span>
                <Badge className="bg-blue-100 text-blue-800">{stats.totalCustomers}</Badge>
              </div>
              <Separator />
              <div className="text-center py-4">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}