import { useState, useEffect } from "react";
import { useAuth, Order } from "../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  Package, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  MessageCircle,
  Calendar,
  MapPin,
  CreditCard,
  RefreshCw
} from "lucide-react";

export function CustomerOrders() {
  const { getOrders } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const orderList = await getOrders();
      setOrders(orderList);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      preparing: { label: 'Preparando', color: 'bg-orange-100 text-orange-800', icon: Package },
      shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const handleTrackingClick = (trackingCode: string) => {
    const message = `Olá! Gostaria de rastrear meu pedido. Código de rastreamento: ${trackingCode}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5511999999999&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleOrderSupport = (orderId: string) => {
    const message = `Olá! Preciso de ajuda com meu pedido #${orderId}. Pode me ajudar?`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5511999999999&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-moria-orange" />
        <span className="ml-2">Carregando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe o status dos seus pedidos</p>
        </div>
        <Button onClick={loadOrders} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número do pedido ou produto..."
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
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="preparing">Preparando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-lg font-medium">
                {searchTerm || statusFilter !== "all" 
                  ? "Nenhum pedido encontrado" 
                  : "Você ainda não fez nenhum pedido"
                }
              </h3>
              <p className="mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Que tal explorar nossos produtos?"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button className="mt-4" onClick={() => window.location.hash = '#pecas'}>
                  Ver Produtos
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                        <CardDescription>
                          Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={statusInfo.color} variant="secondary">
                        {statusInfo.label}
                      </Badge>
                      <p className="text-lg font-bold mt-1">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-2">Itens do Pedido ({order.items.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.id}`} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-sm">{item.name}</span>
                            <span className="text-sm font-medium">
                              {item.quantity}x {formatCurrency(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Order Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center text-muted-foreground">
                          <CreditCard className="w-4 h-4 mr-2" />
                          <span>Pagamento: {order.paymentMethod}</span>
                        </div>
                        {order.trackingCode && (
                          <div className="flex items-center text-muted-foreground">
                            <Truck className="w-4 h-4 mr-2" />
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-moria-orange hover:text-moria-orange/80"
                              onClick={() => handleTrackingClick(order.trackingCode!)}
                            >
                              Rastrear: {order.trackingCode}
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{order.address.city}, {order.address.state}</span>
                        </div>
                        {order.estimatedDelivery && (
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Entrega prevista: {new Date(order.estimatedDelivery).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Pedido #{order.id}</DialogTitle>
                            <DialogDescription>
                              Informações completas do seu pedido
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Status */}
                              <div className="flex items-center justify-between">
                                <Badge className={statusInfo.color} variant="secondary">
                                  {statusInfo.label}
                                </Badge>
                                <span className="text-lg font-bold">{formatCurrency(selectedOrder.total)}</span>
                              </div>

                              {/* Items */}
                              <div>
                                <h4 className="font-medium mb-3">Itens</h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item) => (
                                    <div key={`${selectedOrder.id}-${item.id}-detail`} className="flex justify-between items-center p-3 border rounded">
                                      <div>
                                        <span className="font-medium">{item.name}</span>
                                        <p className="text-sm text-muted-foreground">
                                          Quantidade: {item.quantity}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                        <p className="text-sm text-muted-foreground">
                                          {formatCurrency(item.price)} cada
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Address */}
                              <div>
                                <h4 className="font-medium mb-3">Endereço de Entrega</h4>
                                <div className="p-3 bg-muted rounded">
                                  <p>{selectedOrder.address.street}, {selectedOrder.address.number}</p>
                                  {selectedOrder.address.complement && (
                                    <p>{selectedOrder.address.complement}</p>
                                  )}
                                  <p>{selectedOrder.address.neighborhood}</p>
                                  <p>{selectedOrder.address.city}, {selectedOrder.address.state}</p>
                                  <p>CEP: {selectedOrder.address.zipCode}</p>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div>
                                <h4 className="font-medium mb-3">Status do Pedido</h4>
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">Pedido confirmado</span>
                                  </div>
                                  {selectedOrder.status !== 'pending' && (
                                    <div className="flex items-center space-x-3">
                                      <Package className="h-4 w-4 text-orange-600" />
                                      <span className="text-sm">Pedido sendo preparado</span>
                                    </div>
                                  )}
                                  {['shipped', 'delivered'].includes(selectedOrder.status) && (
                                    <div className="flex items-center space-x-3">
                                      <Truck className="h-4 w-4 text-purple-600" />
                                      <span className="text-sm">Pedido enviado</span>
                                    </div>
                                  )}
                                  {selectedOrder.status === 'delivered' && (
                                    <div className="flex items-center space-x-3">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-sm">Pedido entregue</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {order.trackingCode && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTrackingClick(order.trackingCode!)}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Rastrear
                        </Button>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOrderSupport(order.id)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Suporte
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}