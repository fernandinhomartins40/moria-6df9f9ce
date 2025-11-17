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
  AlertCircle,
  Plus,
  Gift,
  TrendingUp,
  Lock,
  ShoppingCart,
  Users,
  Image,
  Tag,
  Truck,
  Box,
  Download,
  BarChart3,
  FileText
} from "lucide-react";
import { RevisionsContent } from "./RevisionsContent";
import { RevisionsListContent } from "./RevisionsListContent";
import adminService from "@/api/adminService";
import productService from "@/api/productService";
import serviceService from "@/api/serviceService";
import couponService from "@/api/couponService";

interface StoreOrder {
  id: string;
  userId: string;
  customerName: string;
  customerWhatsApp: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    type?: string;
  }>;
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

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  sku: string;
  supplier: string;
  costPrice: number;
  salePrice: number;
  promoPrice?: number;
  stock: number;
  minStock: number;
  images: string[];
  specifications: Record<string, string>;
  vehicleCompatibility: string[];
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

interface Quote {
  id: string;
  customerName: string;
  customerWhatsApp: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  activeProducts: number;
  lowStockProducts: number;
  activeCoupons: number;
  recentOrders: StoreOrder[];
}

export function AdminContent({ activeTab }: AdminContentProps) {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<ProvisionalUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<StoreOrder[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [revisionView, setRevisionView] = useState<'list' | 'create'>('list');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
    filterQuotes();
    filterServices();
    filterCoupons();
    filterProducts();
  }, [orders, quotes, services, coupons, products, searchTerm, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load data from backend APIs
      const [dashboardStatsRes, ordersRes, servicesRes, couponsRes, productsRes, customersRes] = await Promise.all([
        adminService.getDashboardStats().catch(() => null),
        adminService.getOrders({ page: 1, limit: 100 }).catch(() => ({ orders: [], totalCount: 0 })),
        adminService.getServices({ page: 1, limit: 100 }).catch(() => ({ services: [], totalCount: 0 })),
        adminService.getCoupons({ page: 1, limit: 100 }).catch(() => ({ coupons: [], totalCount: 0 })),
        adminService.getProducts({ page: 1, limit: 100 }).catch(() => ({ products: [], totalCount: 0 })),
        adminService.getCustomers({ page: 1, limit: 100 }).catch(() => ({ customers: [], totalCount: 0 }))
      ]);

      setDashboardStats(dashboardStatsRes);
      setOrders(ordersRes.orders || []);
      setServices(servicesRes.services || []);
      setCoupons(couponsRes.coupons || []);
      setProducts(productsRes.products || []);
      setUsers(customersRes.customers || []);

      // Show orders with services as quotes (orçamentos são pedidos com serviços)
      const ordersWithServices = (ordersRes.orders || []).filter(order => order.hasServices);
      setQuotes(ordersWithServices.map(order => ({
        ...order,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          description: item.type === 'service' ? 'Serviço' : undefined
        }))
      })) as any);
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

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter(product => product.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(product => !product.isActive);
    } else if (statusFilter === "low_stock") {
      filtered = filtered.filter(product => product.stock <= product.minStock);
    } else if (statusFilter === "out_of_stock") {
      filtered = filtered.filter(product => product.stock === 0);
    }

    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setFilteredProducts(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      PREPARING: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: Package },
      SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
      DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      // Fallback para status antigos em lowercase
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      quote_requested: { label: 'Orçamento Solicitado', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
  };

  const handleWhatsAppContact = (order: StoreOrder) => {
    const message = `Olá ${order.customerName}! Vi seu pedido #${order.id} aqui no nosso painel. Como posso te ajudar?`;
    const phone = order.customerWhatsApp ? order.customerWhatsApp.replace(/\D/g, '') : '';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Use backend stats if available, otherwise calculate from local data
  const stats = dashboardStats ? {
    totalOrders: dashboardStats.totalOrders,
    totalQuotes: quotes.length,
    totalServices: services.length,
    totalCoupons: coupons.length,
    totalProducts: products.length,
    pendingOrders: dashboardStats.pendingOrders,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    activeServices: services.filter(s => s.isActive).length,
    activeCoupons: dashboardStats.activeCoupons,
    activeProducts: dashboardStats.activeProducts,
    lowStockProducts: dashboardStats.lowStockProducts,
    outOfStockProducts: products.filter(p => p.stock === 0).length,
    totalInventoryValue: products.reduce((sum, product) => sum + (product.stock * product.costPrice), 0),
    totalRevenue: dashboardStats.totalRevenue,
    totalCustomers: dashboardStats.totalCustomers,
    averageTicket: dashboardStats.totalOrders > 0 ? dashboardStats.totalRevenue / dashboardStats.totalOrders : 0,
    conversionRate: quotes.length > 0 ? (dashboardStats.totalOrders / (dashboardStats.totalOrders + quotes.length)) * 100 : 0,
  } : {
    totalOrders: orders.length,
    totalQuotes: quotes.length,
    totalServices: services.length,
    totalCoupons: coupons.length,
    totalProducts: products.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    activeServices: services.filter(s => s.isActive).length,
    activeCoupons: coupons.filter(c => c.isActive && new Date(c.expiresAt) > new Date()).length,
    activeProducts: products.filter(p => p.isActive).length,
    lowStockProducts: products.filter(p => p.stock <= p.minStock).length,
    outOfStockProducts: products.filter(p => p.stock === 0).length,
    totalInventoryValue: products.reduce((sum, product) => sum + (product.stock * product.costPrice), 0),
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalCustomers: users.length,
    averageTicket: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    conversionRate: quotes.length > 0 ? (orders.length / (orders.length + quotes.length)) * 100 : 0,
  };

  const renderDashboard = () => (
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
            {(() => {
              const recentOrders = dashboardStats?.recentOrders || orders.slice(0, 5);
              return recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2">Nenhum pedido recebido ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => {
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
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Atividades simuladas baseadas nos dados existentes */}
              {[
                ...services.slice(0, 2).map(service => ({
                  type: 'service',
                  icon: Wrench,
                  color: 'text-orange-600',
                  title: `Serviço "${service.name}" ${service.isActive ? 'ativado' : 'criado'}`,
                  time: service.updatedAt
                })),
                ...coupons.slice(0, 2).map(coupon => ({
                  type: 'coupon',
                  icon: Gift,
                  color: 'text-green-600',
                  title: `Cupom "${coupon.code}" ${coupon.isActive ? 'ativado' : 'criado'}`,
                  time: coupon.updatedAt
                })),
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
                      {quote.items.map((item, index: number) => (
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
                        const phone = quote.customerWhatsApp ? quote.customerWhatsApp.replace(/\D/g, '') : '';
                        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Tempo: {service.estimatedTime}</span>
                      </div>
                      {service.basePrice && service.basePrice > 0 ? (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Preço: {formatPrice(service.basePrice)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-orange-600">Sob orçamento</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Criado: {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const updatedServices = services.filter(s => s.id !== service.id);
                          setServices(updatedServices);
                          localStorage.setItem('store_services', JSON.stringify(updatedServices));
                        }}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const updatedCoupons = coupons.filter(c => c.id !== coupon.id);
                            setCoupons(updatedCoupons);
                            localStorage.setItem('store_coupons', JSON.stringify(updatedCoupons));
                          }}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                          disabled={expired}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const link = `${window.location.origin}/customer`;
                            navigator.clipboard.writeText(`Cupom: ${coupon.code} - ${coupon.description}. Acesse: ${link}`);
                            // Aqui você poderia adicionar uma notificação de sucesso
                          }}
                          title="Copiar link para compartilhar"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
              <SelectItem value="PREPARING">Preparando</SelectItem>
              <SelectItem value="SHIPPED">Enviado</SelectItem>
              <SelectItem value="DELIVERED">Entregue</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
      </CardContent>
    </Card>
  );

  const renderCustomers = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Clientes Cadastrados</CardTitle>
            <CardDescription>Usuários provisórios criados automaticamente no checkout</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-moria-orange text-white rounded-full p-2">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.whatsapp}</p>
                      <p className="text-xs text-gray-400">
                        Cadastrado: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Provisório
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Login: {user.login}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Senha: {user.password}</span>
                  </div>
                </div>

                <Separator className="mb-4" />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = `Olá ${user.name}! Seus dados de acesso ao painel: Login: ${user.login} | Senha: ${user.password} | Link: ${window.location.origin}/customer`;
                      const phone = user.whatsapp ? user.whatsapp.replace(/\D/g, '') : '';
                      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Enviar Dados
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Pedidos
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Produtos</CardTitle>
              <CardDescription>Controle seu estoque e catálogo de peças automotivas</CardDescription>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadData}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                size="sm" 
                className="bg-moria-orange hover:bg-moria-orange/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, SKU, categoria, fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum produto encontrado</p>
              <p>Adicione produtos ao seu catálogo ou ajuste os filtros.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                const isOutOfStock = product.stock === 0;
                const hasPromo = product.promoPrice && product.promoPrice < product.salePrice;
                
                return (
                  <div key={product.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-moria-orange text-white rounded-lg p-3">
                          <Box className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {product.category}
                            </Badge>
                            {product.subcategory && (
                              <Badge variant="outline">{product.subcategory}</Badge>
                            )}
                            {!product.isActive && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Inativo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={isOutOfStock ? 'bg-red-100 text-red-800' : isLowStock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                            {isOutOfStock ? 'Sem Estoque' : isLowStock ? 'Estoque Baixo' : 'Em Estoque'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-600">Fornecedor: {product.supplier}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Preços</span>
                        </div>
                        <div className="text-sm">
                          <p>Custo: <span className="font-medium">{formatPrice(product.costPrice)}</span></p>
                          <p>Venda: <span className="font-medium">{formatPrice(product.salePrice)}</span></p>
                          {hasPromo && (
                            <p className="text-green-600">Promoção: <span className="font-medium">{formatPrice(product.promoPrice!)}</span></p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Estoque</span>
                        </div>
                        <div className="text-sm">
                          <p>Atual: <span className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'}`}>{product.stock} un.</span></p>
                          <p>Mínimo: <span className="font-medium">{product.minStock} un.</span></p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Compatibilidade</span>
                        </div>
                        <div className="text-sm">
                          {product.vehicleCompatibility && product.vehicleCompatibility.length > 0 ? (
                            <>
                              <p className="text-gray-600">{product.vehicleCompatibility.slice(0, 2).join(', ')}</p>
                              {product.vehicleCompatibility.length > 2 && (
                                <p className="text-xs text-gray-500">+{product.vehicleCompatibility.length - 2} mais</p>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-500 text-xs">Não especificado</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Data</span>
                        </div>
                        <div className="text-sm">
                          <p>Criado: {new Date(product.createdAt).toLocaleDateString('pt-BR')}</p>
                          <p>Editado: {new Date(product.updatedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Margem: <span className="font-medium">{((product.salePrice - product.costPrice) / product.salePrice * 100).toFixed(1)}%</span></p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={product.isActive ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => {
                            const updatedProducts = products.map(p =>
                              p.id === product.id ? { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString() } : p
                            );
                            setProducts(updatedProducts);
                            localStorage.setItem('store_products', JSON.stringify(updatedProducts));
                          }}
                        >
                          {product.isActive ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-1" />
                              Inativo
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const updatedProducts = products.filter(p => p.id !== product.id);
                            setProducts(updatedProducts);
                            localStorage.setItem('store_products', JSON.stringify(updatedProducts));
                          }}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
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

  const renderReports = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Dados simulados para gráficos baseados nos dados reais
    const salesByMonth = Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      revenue: Math.max(0, stats.totalRevenue / 12 + (Math.random() - 0.5) * 1000),
      orders: Math.max(0, Math.floor(stats.totalOrders / 12 + (Math.random() - 0.5) * 5))
    }));

    const topCategories = [
      { name: 'Filtros', value: 35, revenue: formatPrice(stats.totalRevenue * 0.35) },
      { name: 'Freios', value: 25, revenue: formatPrice(stats.totalRevenue * 0.25) },
      { name: 'Suspensão', value: 20, revenue: formatPrice(stats.totalRevenue * 0.20) },
      { name: 'Motor', value: 15, revenue: formatPrice(stats.totalRevenue * 0.15) },
      { name: 'Outros', value: 5, revenue: formatPrice(stats.totalRevenue * 0.05) }
    ];

    return (
      <div className="space-y-6">
        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita do Mês</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                  <p className="text-xs text-gray-500">+12.5% vs mês anterior</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos do Mês</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-500">+8.2% vs mês anterior</p>
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
                  <p className="text-xs text-gray-500">+3.1% vs mês anterior</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">+5.7% vs mês anterior</p>
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
  };

  const renderPromotions = () => {
    // Dados simulados de promoções baseados no conceito de campanhas de marketing
    const promotions = [
      {
        id: 'promo-001',
        name: 'Black Friday Automotiva',
        description: 'Descontos especiais em peças selecionadas',
        type: 'discount',
        value: 25,
        isActive: true,
        startDate: '2024-11-20',
        endDate: '2024-11-30',
        targetProducts: ['Filtros', 'Pastilhas de Freio'],
        minValue: 100,
        usageCount: 45,
        maxUsage: 100,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'promo-002', 
        name: 'Combo Revisão Completa',
        description: 'Kit completo para revisão com desconto progressivo',
        type: 'bundle',
        value: 15,
        isActive: true,
        startDate: '2024-11-01',
        endDate: '2024-12-31',
        targetProducts: ['Filtros', 'Óleo Motor', 'Velas'],
        minValue: 200,
        usageCount: 12,
        maxUsage: 50,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'promo-003',
        name: 'Frete Grátis Dezembro',
        description: 'Frete gratuito para pedidos acima de R$ 150',
        type: 'shipping',
        value: 0,
        isActive: false,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        targetProducts: [],
        minValue: 150,
        usageCount: 0,
        maxUsage: 200,
        createdAt: new Date().toISOString(),
      }
    ];

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gerenciar Promoções</CardTitle>
                <CardDescription>Configure campanhas de marketing e ofertas especiais</CardDescription>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadData}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button 
                  size="sm" 
                  className="bg-moria-orange hover:bg-moria-orange/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Promoção
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar promoções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {promotions.map((promotion) => {
                const isExpired = new Date(promotion.endDate) < new Date();
                const isUpcoming = new Date(promotion.startDate) > new Date();
                const usage = (promotion.usageCount / promotion.maxUsage) * 100;
                
                const getPromotionTypeIcon = () => {
                  switch (promotion.type) {
                    case 'discount': return <TrendingUp className="h-6 w-6" />;
                    case 'bundle': return <Package className="h-6 w-6" />;
                    case 'shipping': return <Truck className="h-6 w-6" />;
                    default: return <Gift className="h-6 w-6" />;
                  }
                };

                const getPromotionTypeLabel = () => {
                  switch (promotion.type) {
                    case 'discount': return 'Desconto';
                    case 'bundle': return 'Combo';
                    case 'shipping': return 'Frete';
                    default: return 'Promoção';
                  }
                };

                return (
                  <div key={promotion.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-moria-orange text-white rounded-lg p-3">
                          {getPromotionTypeIcon()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{promotion.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{promotion.description}</p>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {getPromotionTypeLabel()}
                            </Badge>
                            {isExpired ? (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Expirada
                              </Badge>
                            ) : isUpcoming ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Programada
                              </Badge>
                            ) : promotion.isActive ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Ativa
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                Inativa
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {promotion.type === 'discount' && (
                          <p className="text-2xl font-bold text-green-600">{promotion.value}%</p>
                        )}
                        {promotion.type === 'shipping' && (
                          <p className="text-lg font-bold text-blue-600">Frete Grátis</p>
                        )}
                        <p className="text-sm text-gray-600">Min: {formatPrice(promotion.minValue)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Período</span>
                        </div>
                        <div className="text-sm">
                          <p>Início: {new Date(promotion.startDate).toLocaleDateString('pt-BR')}</p>
                          <p>Fim: {new Date(promotion.endDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Uso</span>
                        </div>
                        <div className="text-sm">
                          <p>{promotion.usageCount} / {promotion.maxUsage}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-moria-orange h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(usage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Produtos</span>
                        </div>
                        <div className="text-sm">
                          {promotion.targetProducts.length > 0 ? (
                            <p className="text-gray-600">{promotion.targetProducts.join(', ')}</p>
                          ) : (
                            <p className="text-gray-500">Todos os produtos</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Performance</span>
                        </div>
                        <div className="text-sm">
                          <p className="text-green-600 font-medium">{usage.toFixed(1)}% usado</p>
                          <p className="text-gray-500">{promotion.maxUsage - promotion.usageCount} restantes</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Criado: {new Date(promotion.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={promotion.isActive ? "secondary" : "outline"}
                          size="sm"
                          disabled={isExpired}
                          onClick={() => {
                            // Simulação de ativação/desativação
                            console.log(`Toggling promotion ${promotion.id}`);
                          }}
                        >
                          {promotion.isActive ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Ativa
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-1" />
                              Inativa
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const link = `${window.location.origin}/customer`;
                            const message = `🎯 Promoção especial: ${promotion.name}! ${promotion.description}. Acesse: ${link}`;
                            navigator.clipboard.writeText(message);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>Configure e gerencie as definições da loja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Informações da Loja */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Informações da Loja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Loja</label>
                  <Input defaultValue="Moria Peças & Serviços" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CNPJ</label>
                  <Input defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input defaultValue="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input defaultValue="contato@moriapecas.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Endereço</label>
                  <Input defaultValue="Av. das Oficinas, 123 - Centro - São Paulo, SP" />
                </div>
              </div>
            </div>

            {/* Configurações de Vendas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Configurações de Vendas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Margem de Lucro Padrão (%)</label>
                  <Input type="number" defaultValue="35" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Mínimo para Frete Grátis</label>
                  <Input type="number" defaultValue="150" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taxa de Entrega (R$)</label>
                  <Input type="number" defaultValue="15.90" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tempo de Entrega (dias)</label>
                  <Input type="number" defaultValue="3" />
                </div>
              </div>
            </div>

            {/* Notificações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Notificações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Novos Pedidos</p>
                    <p className="text-sm text-gray-600">Receber notificação quando houver novos pedidos</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Ativo
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Estoque Baixo</p>
                    <p className="text-sm text-gray-600">Alerta quando produtos estão com estoque baixo</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Ativo
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Relatórios Semanais</p>
                    <p className="text-sm text-gray-600">Receber relatório semanal de vendas por e-mail</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-1" />
                    Inativo
                  </Button>
                </div>
              </div>
            </div>

            {/* Integrações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Integrações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium">WhatsApp Business</p>
                          <p className="text-sm text-gray-600">Integração ativa</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">Configurar</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">Correios API</p>
                          <p className="text-sm text-gray-600">Cálculo de frete</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Disponível</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">Conectar</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="font-medium">Gateway Pagamento</p>
                          <p className="text-sm text-gray-600">PIX, Cartão, Boleto</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Disponível</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">Conectar</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-8 w-8 text-orange-600" />
                        <div>
                          <p className="font-medium">Google Analytics</p>
                          <p className="text-sm text-gray-600">Análise de tráfego</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Disponível</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">Conectar</Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Backup e Dados */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Backup e Dados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Backup Automático</h4>
                      <p className="text-sm text-gray-600">Último backup: Hoje às 03:00</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Fazer Backup
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Exportar Dados</h4>
                      <p className="text-sm text-gray-600">Exporte dados para análise externa</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Botões de Ação */}
            <div className="flex justify-between">
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                Limpar Dados de Teste
              </Button>
              <Button className="bg-moria-orange hover:bg-moria-orange/90">
                <CheckCircle className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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
      return renderProducts();
    case 'services':
      return renderServices();
    case 'revisions':
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {revisionView === 'list' ? 'Revisões' : 'Nova Revisão'}
            </h2>
            <div className="flex gap-2">
              <Button
                variant={revisionView === 'list' ? 'default' : 'outline'}
                onClick={() => setRevisionView('list')}
              >
                Listar Revisões
              </Button>
              <Button
                variant={revisionView === 'create' ? 'default' : 'outline'}
                onClick={() => setRevisionView('create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Revisão
              </Button>
            </div>
          </div>
          {revisionView === 'list' ? <RevisionsListContent /> : <RevisionsContent />}
        </div>
      );
    case 'coupons':
      return renderCoupons();
    case 'promotions':
      return renderPromotions();
    case 'reports':
      return renderReports();
    case 'settings':
      return renderSettings();
    default:
      return renderDashboard();
  }
}