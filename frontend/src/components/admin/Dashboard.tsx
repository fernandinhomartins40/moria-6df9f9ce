// ========================================
// COMPONENTE DE DASHBOARD - MORIA ADMIN
// Componente otimizado para dashboard administrativo
// ========================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  DollarSign, 
  Wrench, 
  User, 
  Package, 
  Gift, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle
} from "lucide-react";

interface DashboardProps {
  stats: any;
  orders: any[];
  quotes: any[];
  formatPrice: (price: number) => string;
  getStatusInfo: (status: string) => any;
}

export function Dashboard({ stats, orders, quotes, formatPrice, getStatusInfo }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Primeira linha - Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">{stats.pendingOrders} pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">Ticket médio: {formatPrice(stats.averageTicket)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orçamentos</p>
                <p className="text-2xl font-bold">{stats.totalQuotes}</p>
                <p className="text-xs text-gray-500">{stats.pendingQuotes} pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="text-xs text-gray-500">Cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha - Métricas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Serviços</p>
                <p className="text-2xl font-bold">{stats.totalServices}</p>
                <p className="text-xs text-gray-500">{stats.activeServices} ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-pink-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cupons</p>
                <p className="text-2xl font-bold">{stats.totalCoupons}</p>
                <p className="text-xs text-gray-500">{stats.activeCoupons} válidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Orçamentos → Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-500">Nenhum alerta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terceira linha - Resumos e atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos 5 pedidos recebidos</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.slice(0, 5).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">Nenhum pedido recebido ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">#{order.id}</p>
                            <p className="text-sm text-gray-500">{order.customerName}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={statusInfo.color} variant="secondary">
                            {statusInfo.label}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            {order.hasProducts ? formatPrice(order.total) : 'Orçamento'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Atividades baseadas nos dados disponíveis */}
              {[
                // Serviços e cupons agora são gerenciados pelas seções individuais
                ...orders.slice(0, 2).map(order => ({
                  type: 'order',
                  icon: ShoppingBag,
                  color: 'text-blue-600',
                  title: `Novo pedido #${order.id} recebido`,
                  time: order.createdAt
                }))
              ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5).map((activity, index) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <ActivityIcon className={`h-5 w-5 mt-1 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}