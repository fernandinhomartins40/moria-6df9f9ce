import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { CustomerDashboard } from "../components/customer/CustomerDashboard";
import { CustomerProfile } from "../components/customer/CustomerProfile";
import { CustomerOrders } from "../components/customer/CustomerOrders";
import { CustomerFavorites } from "../components/customer/CustomerFavorites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Gift, MessageCircle, Percent, Clock } from "lucide-react";

// Simple components for remaining tabs
function CustomerCoupons() {
  const coupons = [
    { id: 1, code: "PRIMEIRA20", discount: 20, description: "20% de desconto na primeira compra", minValue: 100, expires: "2024-12-31", used: false },
    { id: 2, code: "FRETE10", discount: 0, description: "Frete grátis em compras acima de R$ 150", minValue: 150, expires: "2024-12-31", used: false },
    { id: 3, code: "COMBO15", discount: 15, description: "15% de desconto em combos", minValue: 200, expires: "2024-11-30", used: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Cupons</h1>
        <p className="text-muted-foreground">Descontos e promoções disponíveis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className={coupon.used ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-moria-orange" />
                  <CardTitle className="text-lg">{coupon.code}</CardTitle>
                </div>
                <Badge variant={coupon.used ? "secondary" : "default"}>
                  {coupon.used ? "Usado" : "Disponível"}
                </Badge>
              </div>
              <CardDescription>{coupon.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Percent className="w-4 h-4 mr-2" />
                  <span>
                    {coupon.discount > 0 
                      ? `${coupon.discount}% de desconto` 
                      : "Frete grátis"
                    }
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Valor mínimo: R$ {coupon.minValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Válido até {new Date(coupon.expires).toLocaleDateString('pt-BR')}</span>
                </div>
                {!coupon.used && (
                  <Button className="w-full mt-3" variant="outline">
                    Usar Cupom
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

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
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
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

export default function CustomerPanel() {
  const { customer } = useAuth();
  const [currentTab, setCurrentTab] = useState("dashboard");

  if (!customer) return null;

  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <CustomerDashboard />;
      case "profile":
        return <CustomerProfile />;
      case "orders":
        return <CustomerOrders />;
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
    <CustomerLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderTabContent()}
    </CustomerLayout>
  );
}