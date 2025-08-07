import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  Package, 
  Wrench, 
  User, 
  Phone, 
  Calendar, 
  DollarSign,
  ShoppingBag,
  MessageCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface StoreOrder {
  id: string;
  userId: string;
  customerName: string;
  customerWhatsApp: string;
  items: any[];
  total: number;
  hasProducts: boolean;
  hasServices: boolean;
  status: string;
  createdAt: string;
  source: string;
}

interface ProvisionalUser {
  id: string;
  name: string;
  whatsapp: string;
  login: string;
  password: string;
  isProvisional: boolean;
  createdAt: string;
}

export default function StorePanel() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [users, setUsers] = useState<ProvisionalUser[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<StoreOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storeOrders = JSON.parse(localStorage.getItem('store_orders') || '[]');
      const provisionalUsers = JSON.parse(localStorage.getItem('provisional_users') || '[]');
      
      setOrders(storeOrders);
      setUsers(provisionalUsers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerWhatsApp.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Ordenar por data mais recente
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      quote_requested: { label: 'Orçamento Solicitado', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const handleWhatsAppContact = (order: StoreOrder) => {
    const message = `Olá ${order.customerName}! Vi seu pedido #${order.id} aqui no nosso painel. Como posso te ajudar?`;
    const whatsappUrl = `https://wa.me/${order.customerWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    quoteRequests: orders.filter(o => o.status === 'quote_requested').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalCustomers: users.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Lojista</h1>
            <p className="text-gray-600">Gerencie pedidos e orçamentos da Moria Peças e Serviços</p>
          </div>
          <Button onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold">{stats.pendingOrders}</p>
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
                      <p className="text-2xl font-bold">{stats.quoteRequests}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Receita</p>
                      <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="mt-6">
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
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Todos os Pedidos</CardTitle>
                    <CardDescription>Gerencie pedidos e orçamentos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por pedido, cliente ou telefone..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="quote_requested">Orçamento Solicitado</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orders List */}
                <ScrollArea className="h-96">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2">Nenhum pedido encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <StatusIcon className="h-5 w-5 text-gray-500" />
                                <div>
                                  <p className="font-bold">Pedido #{order.id}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                                    {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <Badge className={statusInfo.color} variant="secondary">
                                {statusInfo.label}
                              </Badge>
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{order.customerName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{order.customerWhatsApp}</span>
                              </div>
                            </div>

                            {/* Items Summary */}
                            <div className="space-y-2 mb-4">
                              {order.hasProducts && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex items-center">
                                    <Package className="h-4 w-4 mr-1 text-blue-600" />
                                    Produtos ({order.items.filter(i => i.type !== 'service').length})
                                  </span>
                                  <span className="font-medium">{formatPrice(order.total)}</span>
                                </div>
                              )}
                              {order.hasServices && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex items-center">
                                    <Wrench className="h-4 w-4 mr-1 text-orange-600" />
                                    Serviços ({order.items.filter(i => i.type === 'service').length})
                                  </span>
                                  <span className="text-orange-600">Orçamento</span>
                                </div>
                              )}
                            </div>

                            <Separator className="mb-4" />

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleWhatsAppContact(order)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Contatar
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Clientes Cadastrados</CardTitle>
                <CardDescription>Usuários provisórios criados automaticamente</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">Nenhum cliente cadastrado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.whatsapp}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">Provisório</Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              Login: {user.login}
                            </p>
                            <p className="text-sm text-gray-500">
                              Senha: {user.password}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}