import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { CustomerDashboard } from "../components/customer/CustomerDashboard";
import { CustomerProfile } from "../components/customer/CustomerProfile";
import { CustomerOrders } from "../components/customer/CustomerOrders";
import { CustomerFavorites } from "../components/customer/CustomerFavorites";
import { CustomerRevisions } from "../components/customer/CustomerRevisions";
import "../styles/cliente.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "../components/ui/drawer";
import { Gift, MessageCircle, Percent, Clock, User, Mail, Phone, Lock, LogIn, UserPlus } from "lucide-react";

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

// Login Component with Drawer
function CustomerLogin() {
  const { login, register, isLoading } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    cpf: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginData.email, loginData.password);
    if (success) {
      setIsDrawerOpen(false);
    } else {
      alert("Email ou senha incorretos. Tente: joao@email.com / 123456");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(registerData);
    if (success) {
      setIsDrawerOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Área do Cliente</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar pedidos e favoritos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full"
            onClick={() => setIsDrawerOpen(true)}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Entrar ou Cadastrar
          </Button>
        </CardContent>
      </Card>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Área do Cliente</DrawerTitle>
              <DrawerDescription>
                Entre na sua conta ou crie uma nova
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="p-4 pb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4 mt-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Teste: joao@email.com / 123456
                    </p>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4 mt-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Senha</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF (opcional)</Label>
                      <Input
                        id="cpf"
                        value={registerData.cpf}
                        onChange={(e) => setRegisterData({...registerData, cpf: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
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
    <CustomerLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderTabContent()}
    </CustomerLayout>
  );
}