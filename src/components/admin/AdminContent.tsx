import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  basePrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

interface AdminContentProps {
  activeTab: string;
}

export function AdminContent({ activeTab }: AdminContentProps) {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<ProvisionalUser[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<StoreOrder[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
    filterQuotes();
    filterServices();
    filterCoupons();
  }, [orders, quotes, services, coupons, searchTerm, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storeOrders = JSON.parse(localStorage.getItem('store_orders') || '[]');
      const storeQuotes = JSON.parse(localStorage.getItem('store_quotes') || '[]');
      const storeServices = JSON.parse(localStorage.getItem('store_services') || '[]');
      const storeCoupons = JSON.parse(localStorage.getItem('store_coupons') || '[]');
      const provisionalUsers = JSON.parse(localStorage.getItem('provisional_users') || '[]');
      
      // Se não há serviços, criar alguns exemplos
      if (storeServices.length === 0) {
        const defaultServices: Service[] = [
          {
            id: 'srv-001',
            name: 'Troca de Óleo',
            description: 'Troca completa de óleo do motor com filtro',
            category: 'Manutenção',
            estimatedTime: '30 minutos',
            basePrice: 120.00,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'srv-002',
            name: 'Alinhamento e Balanceamento',
            description: 'Alinhamento e balanceamento das 4 rodas',
            category: 'Suspensão',
            estimatedTime: '45 minutos',
            basePrice: 80.00,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'srv-003',
            name: 'Revisão Completa',
            description: 'Revisão geral do veículo com check-up completo',
            category: 'Revisão',
            estimatedTime: '2 horas',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('store_services', JSON.stringify(defaultServices));
        setServices(defaultServices);
      } else {
        setServices(storeServices);
      }
      
      // Se não há cupons, criar alguns exemplos
      if (storeCoupons.length === 0) {
        const defaultCoupons: Coupon[] = [
          {
            id: 'coupon-001',
            code: 'PRIMEIRA20',
            description: '20% de desconto na primeira compra',
            discountType: 'percentage',
            discountValue: 20,
            minValue: 100,
            maxDiscount: 50,
            expiresAt: '2024-12-31',
            usageLimit: 100,
            usedCount: 25,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'coupon-002',
            code: 'FRETE10',
            description: 'Frete grátis em compras acima de R$ 150',
            discountType: 'free_shipping',
            discountValue: 0,
            minValue: 150,
            expiresAt: '2024-12-31',
            usedCount: 12,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'coupon-003',
            code: 'COMBO15',
            description: '15% de desconto em combos',
            discountType: 'percentage',
            discountValue: 15,
            minValue: 200,
            maxDiscount: 30,
            expiresAt: '2024-11-30',
            usageLimit: 50,
            usedCount: 45,
            isActive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('store_coupons', JSON.stringify(defaultCoupons));
        setCoupons(defaultCoupons);
      } else {
        setCoupons(storeCoupons);
      }
      
      setOrders(storeOrders);
      setQuotes(storeQuotes);
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

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredOrders(filtered);
  };

  const filterQuotes = () => {
    let filtered = quotes;

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customerWhatsApp.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredQuotes(filtered);
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter(service => service.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(service => !service.isActive);
    }

    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setFilteredServices(filtered);
  };

  const filterCoupons = () => {
    let filtered = coupons;

    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter(coupon => coupon.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(coupon => !coupon.isActive);
    } else if (statusFilter === "expired") {
      filtered = filtered.filter(coupon => new Date(coupon.expiresAt) < new Date());
    }

    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setFilteredCoupons(filtered);
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
    totalQuotes: quotes.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalCustomers: users.length,
  };

  const renderDashboard = () => (
    <div className="space-y-6">
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
                <p className="text-2xl font-bold">{stats.totalQuotes}</p>
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
    </div>
  );

  const renderQuotes = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Todos os Orçamentos</CardTitle>
            <CardDescription>Solicitações de orçamento para serviços</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por orçamento, cliente ou telefone..."
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
              <SelectItem value="analyzing">Em Análise</SelectItem>
              <SelectItem value="quoted">Orçado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-96">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Wrench className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-bold">Orçamento #{quote.id}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(quote.createdAt).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800" variant="secondary">
                      {quote.status === 'pending' ? 'Pendente' : 
                       quote.status === 'analyzing' ? 'Em Análise' :
                       quote.status === 'quoted' ? 'Orçado' :
                       quote.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{quote.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{quote.customerWhatsApp}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Wrench className="h-4 w-4 mr-1 text-orange-600" />
                        Serviços ({quote.items.length})
                      </span>
                      <span className="text-orange-600">Aguardando Orçamento</span>
                    </div>
                    <div className="ml-5 text-sm text-gray-600">
                      {quote.items.map((item: any, index: number) => (
                        <div key={index} className="mb-1">
                          • {item.name} (Qtd: {item.quantity})
                          {item.description && (
                            <p className="text-xs text-gray-500 ml-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {quote.hasLinkedOrder && (
                    <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      🔗 Este cliente também possui um pedido vinculado: #{quote.sessionId?.replace('O', 'P')}
                    </div>
                  )}

                  <Separator className="mb-4" />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const message = `Olá ${quote.customerName}! Vi sua solicitação de orçamento #${quote.id}. Vou preparar um orçamento personalizado para você. Em breve entro em contato!`;
                        const whatsappUrl = `https://wa.me/${quote.customerWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Contatar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderServices = () => {
    const toggleServiceStatus = (serviceId: string) => {
      const updatedServices = services.map(service =>
        service.id === serviceId
          ? { ...service, isActive: !service.isActive, updatedAt: new Date().toISOString() }
          : service
      );
      setServices(updatedServices);
      localStorage.setItem('store_services', JSON.stringify(updatedServices));
    };

    const addNewService = () => {
      const newService: Service = {
        id: `srv-${Date.now()}`,
        name: 'Novo Serviço',
        description: 'Descrição do novo serviço',
        category: 'Geral',
        estimatedTime: '1 hora',
        basePrice: 0,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedServices = [newService, ...services];
      setServices(updatedServices);
      localStorage.setItem('store_services', JSON.stringify(updatedServices));
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Serviços</CardTitle>
              <CardDescription>Cadastre e gerencie os serviços oferecidos</CardDescription>
            </div>
            <Button onClick={addNewService} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, descrição ou categoria..."
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
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-96">
            {filteredServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wrench className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">Nenhum serviço encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Wrench className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-bold">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={service.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                          } 
                          variant="secondary"
                        >
                          {service.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleServiceStatus(service.id)}
                        >
                          {service.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Tempo: {service.estimatedTime}</span>
                      </div>
                      {service.basePrice && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Preço base: {formatPrice(service.basePrice)}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const renderCoupons = () => {
    const toggleCouponStatus = (couponId: string) => {
      const updatedCoupons = coupons.map(coupon =>
        coupon.id === couponId
          ? { ...coupon, isActive: !coupon.isActive, updatedAt: new Date().toISOString() }
          : coupon
      );
      setCoupons(updatedCoupons);
      localStorage.setItem('store_coupons', JSON.stringify(updatedCoupons));
    };

    const addNewCoupon = () => {
      const newCoupon: Coupon = {
        id: `coupon-${Date.now()}`,
        code: 'NOVO10',
        description: 'Novo cupom de desconto',
        discountType: 'percentage',
        discountValue: 10,
        minValue: 50,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        usedCount: 0,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedCoupons = [newCoupon, ...coupons];
      setCoupons(updatedCoupons);
      localStorage.setItem('store_coupons', JSON.stringify(updatedCoupons));
    };

    const getDiscountText = (coupon: Coupon) => {
      if (coupon.discountType === 'percentage') {
        return `${coupon.discountValue}% de desconto`;
      } else if (coupon.discountType === 'fixed') {
        return `${formatPrice(coupon.discountValue)} de desconto`;
      } else {
        return 'Frete grátis';
      }
    };

    const isExpired = (expiresAt: string) => {
      return new Date(expiresAt) < new Date();
    };

    const getUsageText = (coupon: Coupon) => {
      if (coupon.usageLimit) {
        return `${coupon.usedCount}/${coupon.usageLimit} usos`;
      }
      return `${coupon.usedCount} usos`;
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Cupons</CardTitle>
              <CardDescription>Crie e gerencie cupons de desconto para os clientes</CardDescription>
            </div>
            <Button onClick={addNewCoupon} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cupom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código ou descrição..."
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
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-96">
            {filteredCoupons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">Nenhum cupom encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt);
                  
                  return (
                    <div key={coupon.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Gift className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-bold text-lg">{coupon.code}</p>
                            <p className="text-sm text-gray-600">{coupon.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={
                              expired 
                                ? "bg-red-100 text-red-800"
                                : coupon.isActive 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                            } 
                            variant="secondary"
                          >
                            {expired ? 'Expirado' : coupon.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {!expired && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCouponStatus(coupon.id)}
                            >
                              {coupon.isActive ? 'Desativar' : 'Ativar'}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{getDiscountText(coupon)}</span>
                        </div>
                        {coupon.minValue && (
                          <div className="flex items-center space-x-2">
                            <ShoppingCart className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Min: {formatPrice(coupon.minValue)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Expira: {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{getUsageText(coupon)}</span>
                        </div>
                        {coupon.maxDiscount && (
                          <span className="text-sm text-gray-500">
                            Desconto máximo: {formatPrice(coupon.maxDiscount)}
                          </span>
                        )}
                      </div>

                      <Separator className="mb-4" />

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Editar
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
    );
  };

  const renderOrders = () => (
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
  );

  const renderCustomers = () => (
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
  );

  const renderPlaceholder = (title: string, description: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium mb-2">Em Desenvolvimento</p>
          <p>Esta seção será implementada em breve.</p>
        </div>
      </CardContent>
    </Card>
  );

  switch (activeTab) {
    case 'dashboard':
      return renderDashboard();
    case 'orders':
      return renderOrders();
    case 'quotes':
      return renderQuotes();
    case 'customers':
      return renderCustomers();
    case 'products':
      return renderPlaceholder('Produtos', 'Gerencie o estoque e catálogo de produtos');
    case 'services':
      return renderServices();
    case 'coupons':
      return renderCoupons();
    case 'promotions':
      return renderPlaceholder('Promoções', 'Configure ofertas especiais e descontos');
    case 'reports':
      return renderPlaceholder('Relatórios', 'Análises e relatórios de vendas');
    case 'settings':
      return renderPlaceholder('Configurações', 'Configurações do sistema');
    default:
      return renderDashboard();
  }
}