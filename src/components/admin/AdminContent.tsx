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

interface AdminContentProps {
  activeTab: string;
}

export function AdminContent({ activeTab }: AdminContentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-500">0 pendentes</p>
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
                <p className="text-2xl font-bold">R$ 0,00</p>
                <p className="text-xs text-gray-500">Ticket médio: R$ 0,00</p>
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
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-500">0 pendentes</p>
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
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-500">Cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao Painel do Lojista</CardTitle>
          <CardDescription>Gerencie seu negócio de forma eficiente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">Dashboard em Desenvolvimento</p>
            <p>As métricas serão exibidas aqui conforme os dados chegarem.</p>
          </div>
        </CardContent>
      </Card>
    </div>
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
      return renderPlaceholder("Pedidos", "Gerencie todos os pedidos da loja");
    case 'quotes':
      return renderPlaceholder("Orçamentos", "Gerencie solicitações de orçamento");
    case 'customers':
      return renderPlaceholder("Clientes", "Visualize clientes cadastrados");
    case 'products':
      return renderPlaceholder("Produtos", "Gerencie catálogo de produtos");
    case 'services':
      return renderPlaceholder("Serviços", "Gerencie serviços oferecidos");
    case 'coupons':
      return renderPlaceholder("Cupons", "Gerencie cupons de desconto");
    case 'promotions':
      return renderPlaceholder("Promoções", "Configure ofertas especiais");
    case 'reports':
      return renderPlaceholder("Relatórios", "Análises e relatórios de vendas");
    case 'settings':
      return renderPlaceholder("Configurações", "Configurações do sistema");
    default:
      return renderDashboard();
  }
}