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
import { SupportDashboard } from "../components/customer/support/SupportDashboard";
import { CartDrawer } from "../components/CartDrawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import "../styles/cliente.css";

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
        return <SupportDashboard />;
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