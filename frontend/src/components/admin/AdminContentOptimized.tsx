// ========================================
// COMPONENTE ADMIN CONTENT OTIMIZADO - MORIA ADMIN
// Componente centralizado para gerenciamento administrativo
// ========================================

import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Dashboard } from "./Dashboard";
import { Orders } from "./Orders";
import { Customers } from "./Customers";
import { Reports } from "./Reports";
import { Settings } from "./Settings";
import { AdminServicesSection } from "./AdminServicesSection";
import { AdminCouponsSection } from "./AdminCouponsSection";
import { AdminPromotionsSection } from "./AdminPromotionsSection";
import { AdminProductsSection } from "./AdminProductsSection";

interface AdminContentProps {
  activeTab: string;
}

export function AdminContent({ activeTab }: AdminContentProps) {
  // Hook de autenticação administrativa
  const adminAuth = useAdminAuth();
  const queryClient = useQueryClient();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  // Queries otimizadas com React Query
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => apiClient.getProducts({ is_active: 'all' }, true),
    enabled: adminAuth.canAccessAdminFeatures,
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiClient.getOrders(),
    enabled: adminAuth.canAccessAdminFeatures,
  });

  const { data: promotionsData, isLoading: isLoadingPromotions } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () => apiClient.getPromotions(),
    enabled: adminAuth.canAccessAdminFeatures,
  });

  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => apiClient.getSettings(),
    enabled: adminAuth.canAccessAdminFeatures,
  });

  // Mutations para operações de escrita
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const updates = Object.entries(settings).map(([key, value]) =>
        apiClient.updateSetting(key, String(value))
      );
      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });

  // Efeitos para atualizar settings locais
  useEffect(() => {
    if (settingsData?.success && settingsData.data) {
      const settingsMap = settingsData.data.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      setLocalSettings(settingsMap);
    }
  }, [settingsData]);

  // Funções auxiliares
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

  const handleWhatsAppContact = (order: any) => {
    const message = `Olá ${order.customerName}! Vi seu pedido #${order.id} aqui no nosso painel. Como posso te ajudar?`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${order.customerWhatsApp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Dados para estatísticas
  const products = productsData?.data || [];
  const orders = ordersData?.data || [];
  const promotions = promotionsData?.data || [];

  const stats = {
    totalOrders: orders.length,
    totalQuotes: 0, // Será implementado futuramente
    totalServices: 0, // Gerenciado por AdminServicesSection
    totalCoupons: 0, // Gerenciado por AdminCouponsSection
    totalProducts: products.length,
    pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
    pendingQuotes: 0, // Será implementado futuramente
    activeServices: 0, // Gerenciado por AdminServicesSection
    activeCoupons: 0, // Gerenciado por AdminCouponsSection
    activeProducts: products.filter((p: any) => p.isActive).length,
    lowStockProducts: products.filter((p: any) => p.stock <= p.minStock).length,
    outOfStockProducts: products.filter((p: any) => p.stock === 0).length,
    totalInventoryValue: products.reduce((sum: number, product: any) => sum + (product.stock * product.costPrice), 0),
    totalRevenue: orders.reduce((sum: number, order: any) => sum + order.total, 0),
    totalCustomers: 0, // Será implementado futuramente
    averageTicket: orders.length > 0 ? orders.reduce((sum: number, order: any) => sum + order.total, 0) / orders.length : 0,
    conversionRate: 0, // Será implementado futuramente
  };

  // Funções de manipulação de settings
  const updateSetting = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      await saveSettingsMutation.mutateAsync(localSettings);
      console.log('✅ Configurações salvas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
    }
  };

  // Renderização condicional baseada na aba ativa
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats}
            orders={orders}
            quotes={[]} // Será implementado futuramente
            formatPrice={formatPrice}
            getStatusInfo={getStatusInfo}
          />
        );
      
      case 'orders':
        return (
          <Orders 
            orders={orders}
            filteredOrders={orders} // Filtragem será feita via React Query
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            formatPrice={formatPrice}
            getStatusInfo={getStatusInfo}
            handleWhatsAppContact={handleWhatsAppContact}
          />
        );
      
      case 'customers':
        return (
          <Customers 
            users={[]} // Será implementado futuramente
            isLoading={false}
            loadData={async () => {}} // Será implementado futuramente
          />
        );
      
      case 'reports':
        return (
          <Reports 
            stats={stats}
            orders={orders}
            products={products}
            formatPrice={formatPrice}
          />
        );
      
      case 'settings':
        return (
          <Settings 
            settings={localSettings}
            isLoadingSettings={isLoadingSettings}
            isSaving={saveSettingsMutation.isPending}
            updateSetting={updateSetting}
            handleSaveSettings={handleSaveSettings}
          />
        );
      
      case 'services':
        return (
          <AdminServicesSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        );
      
      case 'products':
        return (
          <AdminProductsSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        );
      
      case 'coupons':
        return (
          <AdminCouponsSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        );
      
      case 'promotions':
        return (
          <AdminPromotionsSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        );
      
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moria-orange mx-auto mb-4"></div>
            <p>Carregando conteúdo...</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderActiveTab()}
    </div>
  );
}