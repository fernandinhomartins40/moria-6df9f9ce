import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  User,
  Package,
  Heart,
  Home,
  LogOut,
  Settings,
  Gift,
  MessageCircle,
  ShoppingBag,
  Star,
  TrendingUp,
  Calendar,
  ClipboardCheck,
  Car
} from "lucide-react";

interface CustomerLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function CustomerLayout({ children, currentTab, onTabChange }: CustomerLayoutProps) {
  const { customer, logout } = useAuth();

  if (!customer) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Visão geral da conta' },
    { id: 'profile', label: 'Meu Perfil', icon: User, description: 'Dados pessoais e endereços' },
    { id: 'orders', label: 'Meus Pedidos', icon: Package, description: 'Histórico e acompanhamento' },
    { id: 'vehicles', label: 'Meus Veículos', icon: Car, description: 'Gerencie seus veículos' },
    { id: 'revisions', label: 'Minhas Revisões', icon: ClipboardCheck, description: 'Histórico de revisões veiculares' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, description: 'Produtos salvos' },
    { id: 'coupons', label: 'Cupons', icon: Gift, description: 'Descontos disponíveis' },
    { id: 'support', label: 'Suporte', icon: MessageCircle, description: 'Atendimento ao cliente' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'CL';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMembershipLevel = (totalSpent: number) => {
    if (totalSpent >= 5000) return { level: 'Platinum', color: 'bg-purple-100 text-purple-800' };
    if (totalSpent >= 2000) return { level: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (totalSpent >= 500) return { level: 'Silver', color: 'bg-gray-100 text-gray-800' };
    return { level: 'Bronze', color: 'bg-orange-100 text-orange-800' };
  };

  const membership = getMembershipLevel(customer.totalSpent);

  const handleLogout = () => {
    logout();
    // Redireciona para a home após logout
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Customer Info Card */}
              <Card>
                <CardHeader className="text-center pb-4">
                  <Avatar className="mx-auto w-20 h-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-moria-orange text-white text-xl font-bold">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription className="text-sm">{customer.email}</CardDescription>
                    <Badge className={`text-xs ${membership.color}`} variant="secondary">
                      Cliente {membership.level}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center text-moria-orange">
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        <span className="text-lg font-bold">{customer.totalOrders}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-lg font-bold">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Gasto Total</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Menu */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Menu</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start h-auto p-4 ${
                            isActive 
                              ? 'bg-moria-orange/10 text-moria-orange border-r-2 border-moria-orange' 
                              : 'hover:bg-moria-orange/5'
                          }`}
                          onClick={() => onTabChange(item.id)}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </nav>
                  
                  <Separator className="my-2" />
                  
                  <div className="p-4">
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair da Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}