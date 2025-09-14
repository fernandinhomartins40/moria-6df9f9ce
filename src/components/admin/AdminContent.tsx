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
  FileText,
  AlertCircle
} from "lucide-react";
import { AdminServicesSection } from './AdminServicesSection';
import { AdminCouponsSection } from './AdminCouponsSection';
import { AdminPromotionsSection } from './AdminPromotionsSection';
import { AdminProductsSection } from './AdminProductsSection';
import { ProductModal } from './ProductModal';
import { apiClient } from '../../services/api';

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

export function AdminContent({ activeTab }: AdminContentProps) {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<ProvisionalUser[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<StoreOrder[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados do modal de produtos
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(false);

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
      console.log('🔄 Carregando dados REAIS do API...');
      
      // Carregar dados REAIS do API em paralelo
      const [
        productsResponse,
        servicesResponse, 
        couponsResponse,
        ordersResponse,
        promotionsResponse
      ] = await Promise.all([
        apiClient.getProducts({ active: undefined }), // Todos os produtos
        apiClient.getServices({ active: undefined }), // Todos os serviços  
        apiClient.getCoupons({ active: undefined }), // Todos os cupons
        apiClient.getOrders(), // Todos os pedidos
        apiClient.getPromotions({ active: undefined }) // Todas as promoções
      ]);

      console.log('📦 Produtos do API:', productsResponse?.data?.length || 0);
      console.log('🛠️ Serviços do API:', servicesResponse?.data?.length || 0);
      console.log('🎫 Cupons do API:', couponsResponse?.data?.length || 0);
      console.log('📝 Pedidos do API:', ordersResponse?.data?.length || 0);

      // Definir dados dos estados
      setProducts(productsResponse?.data || []);
      setServices(servicesResponse?.data || []);
      setCoupons(couponsResponse?.data || []);
      setOrders(ordersResponse?.data || []);
      
      // TODO: Implementar quotes e users no API futuramente
      setQuotes([]); // Orçamentos serão implementados no API
      setUsers([]); // Usuários serão migrados para auth.users

      console.log('✅ Dados do API carregados com sucesso!');
      
      // Carregar configurações também
      await loadSettings();
    } catch (error) {
      console.error('❌ Erro ao carregar dados do API:', error);
      
      // Em caso de erro, definir arrays vazios
      setProducts([]);
      setServices([]);
      setCoupons([]);
      setOrders([]);
      setQuotes([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const response = await apiClient.getSettings();
      if (response?.success && response.data) {
        const settingsMap = response.data.reduce((acc: any, setting: any) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Salvar todas as configurações atualizadas
      const updates = Object.entries(settings).map(([key, value]) =>
        apiClient.updateSetting(key, String(value))
      );
      
      await Promise.all(updates);
      console.log('✅ Configurações salvas com sucesso!');
      
      // Recarregar dados
      await loadSettings();
      await loadData();
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  // Funções do CRUD de produtos
  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await apiClient.deleteProduct(productId);
        console.log('✅ Produto excluído com sucesso');
        await loadData(); // Recarregar lista
      } catch (error) {
        console.error('❌ Erro ao excluir produto:', error);
      }
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      setIsProductLoading(true);

      if (selectedProduct?.id) {
        // Editar produto existente
        await apiClient.updateProduct(selectedProduct.id, productData);
        console.log('✅ Produto atualizado com sucesso');
      } else {
        // Criar novo produto
        await apiClient.createProduct(productData);
        console.log('✅ Produto criado com sucesso');
      }

      await loadData(); // Recarregar lista
      setIsProductModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      throw error; // Re-throw para o modal tratar
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    try {
      const updatedProduct = { ...product, isActive: !product.isActive };
      await apiClient.updateProduct(product.id, updatedProduct);
      console.log(`✅ Produto ${updatedProduct.isActive ? 'ativado' : 'desativado'} com sucesso`);
      await loadData(); // Recarregar lista
    } catch (error) {
      console.error('❌ Erro ao atualizar status do produto:', error);
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
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      quote_requested: { label: 'Orçamento Solicitado', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const handleWhatsAppContact = (order: StoreOrder) => {
    const message = `Olá ${order.customerName}! Vi seu pedido #${order.id} aqui no nosso painel. Como posso te ajudar?`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${order.customerWhatsApp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const stats = {
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
                        const whatsappUrl = `https://api.whatsapp.com/send?phone=${quote.customerWhatsApp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
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
    return (
      <div className="space-y-6">
        <AdminServicesSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
    );
  };

  const renderProducts = () => {
    return (
      <div className="space-y-6">
        <AdminProductsSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
    );
  };

  const renderCoupons = () => {
    return (
      <div className="space-y-6">
        <AdminCouponsSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
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
                      const whatsappUrl = `https://api.whatsapp.com/send?phone=${user.whatsapp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
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


  const renderReports = () => {
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
  };

  const renderPromotions = () => {
    return (
      <div className="space-y-6">
        <AdminPromotionsSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
    );
  };


  const renderSettings = () => {

    if (isLoadingSettings) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moria-orange"></div>
        </div>
      );
    }

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
                  <Input 
                    value={settings.store_name || ''} 
                    onChange={(e) => updateSetting('store_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CNPJ</label>
                  <Input 
                    value={settings.store_cnpj || ''} 
                    onChange={(e) => updateSetting('store_cnpj', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input 
                    value={settings.store_phone || ''} 
                    onChange={(e) => updateSetting('store_phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input 
                    value={settings.store_email || ''} 
                    onChange={(e) => updateSetting('store_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Endereço</label>
                  <Input 
                    value={settings.store_address || ''} 
                    onChange={(e) => updateSetting('store_address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Configurações de Vendas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Configurações de Vendas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Margem de Lucro Padrão (%)</label>
                  <Input 
                    type="number" 
                    value={settings.default_profit_margin || ''} 
                    onChange={(e) => updateSetting('default_profit_margin', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Mínimo para Frete Grátis</label>
                  <Input 
                    type="number" 
                    value={settings.free_shipping_minimum || ''} 
                    onChange={(e) => updateSetting('free_shipping_minimum', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taxa de Entrega (R$)</label>
                  <Input 
                    type="number" 
                    value={settings.delivery_fee || ''} 
                    onChange={(e) => updateSetting('delivery_fee', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tempo de Entrega (dias)</label>
                  <Input 
                    type="number" 
                    value={settings.delivery_time || ''} 
                    onChange={(e) => updateSetting('delivery_time', e.target.value)}
                  />
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={settings.notifications_new_orders === 'true' ? "bg-green-100 text-green-800" : ""}
                    onClick={() => updateSetting('notifications_new_orders', settings.notifications_new_orders === 'true' ? 'false' : 'true')}
                  >
                    {settings.notifications_new_orders === 'true' ? (
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
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Estoque Baixo</p>
                    <p className="text-sm text-gray-600">Alerta quando produtos estão com estoque baixo</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={settings.notifications_low_stock === 'true' ? "bg-green-100 text-green-800" : ""}
                    onClick={() => updateSetting('notifications_low_stock', settings.notifications_low_stock === 'true' ? 'false' : 'true')}
                  >
                    {settings.notifications_low_stock === 'true' ? (
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
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Relatórios Semanais</p>
                    <p className="text-sm text-gray-600">Receber relatório semanal de vendas por e-mail</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={settings.notifications_weekly_reports === 'true' ? "bg-green-100 text-green-800" : ""}
                    onClick={() => updateSetting('notifications_weekly_reports', settings.notifications_weekly_reports === 'true' ? 'false' : 'true')}
                  >
                    {settings.notifications_weekly_reports === 'true' ? (
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
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
                className="bg-moria-orange hover:bg-moria-orange/80"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
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

  // Função helper para renderização segura com error boundary
  const safeRender = (renderFunction: () => React.ReactNode, tabName: string) => {
    try {
      return renderFunction();
    } catch (error) {
      console.error(`Erro ao renderizar ${tabName}:`, error);
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Erro ao carregar {tabName}
            </CardTitle>
            <CardDescription>
              Ocorreu um erro ao carregar esta seção. Tente recarregar a página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      );
    }
  };

  // Renderizar conteúdo principal com modal de produtos
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return safeRender(renderDashboard, 'Dashboard');
      case 'orders':
        return safeRender(renderOrders, 'Pedidos');
      case 'quotes':
        return safeRender(renderQuotes, 'Orçamentos');
      case 'customers':
        return safeRender(renderCustomers, 'Clientes');
      case 'products':
        return safeRender(renderProducts, 'Produtos');
      case 'services':
        return safeRender(renderServices, 'Serviços');
      case 'coupons':
        return safeRender(renderCoupons, 'Cupons');
      case 'promotions':
        return safeRender(renderPromotions, 'Promoções');
      case 'reports':
        return safeRender(renderReports, 'Relatórios');
      case 'settings':
        return safeRender(renderSettings, 'Configurações');
      default:
        return safeRender(renderDashboard, 'Dashboard');
    }
  };

  return (
    <>
      {renderMainContent()}

      {/* Modal de Produtos - sempre renderizado */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
        loading={isProductLoading}
      />
    </>
  );
}