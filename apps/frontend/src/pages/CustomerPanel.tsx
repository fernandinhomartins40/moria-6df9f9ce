import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { CustomerDashboard } from "../components/customer/CustomerDashboard";
import { CustomerProfile } from "../components/customer/CustomerProfile";
import { CustomerOrders } from "../components/customer/CustomerOrders";
import { CustomerFavorites } from "../components/customer/CustomerFavorites";
import { CustomerRevisions } from "../components/customer/CustomerRevisions";
import { CustomerVehicles } from "../components/customer/CustomerVehicles";
import { CustomerCoupons } from "../components/customer/CustomerCoupons";
import { CartDrawer } from "../components/CartDrawer";
import "../styles/cliente.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MessageCircle } from "lucide-react";

function CustomerSupport() {
  const supportOptions = [
    {
      title: "WhatsApp",
      description: "Fale conosco pelo WhatsApp",
      action: "Abrir Chat",
      icon: MessageCircle,
      color: "bg-green-500"
    },
    {
      title: "Central de Ajuda",
      description: "Encontre respostas para dúvidas frequentes",
      action: "Ver FAQ",
      icon: MessageCircle,
      color: "bg-blue-500"
    }
  ];

  const handleWhatsAppSupport = () => {
    const message = "Olá! Preciso de ajuda. Podem me atender?";
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5511999999999&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suporte ao Cliente</h1>
        <p className="text-muted-foreground">Como podemos te ajudar hoje?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`${option.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={index === 0 ? handleWhatsAppSupport : undefined}
                >
                  {option.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horários de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Segunda a Sexta:</span>
              <span className="font-medium">8h às 18h</span>
            </div>
            <div className="flex justify-between">
              <span>Sábados:</span>
              <span className="font-medium">8h às 14h</span>
            </div>
            <div className="flex justify-between">
              <span>Domingos:</span>
              <span className="font-medium">Fechado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Login Component - Simplified without drawer
function CustomerLogin() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Área do Cliente</CardTitle>
          <CardDescription>
            Você precisa estar logado para acessar esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Clique no ícone de usuário no cabeçalho para fazer login ou criar uma conta.
          </p>
          <Button
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Voltar para a Página Inicial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerPanel() {
  const { customer, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState("dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moria-orange mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return <CustomerLogin />;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <CustomerDashboard />;
      case "profile":
        return <CustomerProfile />;
      case "orders":
        return <CustomerOrders />;
      case "vehicles":
        return <CustomerVehicles />;
      case "revisions":
        return <CustomerRevisions />;
      case "favorites":
        return <CustomerFavorites />;
      case "coupons":
        return <CustomerCoupons />;
      case "support":
        return <CustomerSupport />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <>
      <CustomerLayout currentTab={currentTab} onTabChange={setCurrentTab}>
        {renderTabContent()}
      </CustomerLayout>

      {/* CartDrawer disponível em todo o painel do cliente */}
      <CartDrawer />
    </>
  );
}