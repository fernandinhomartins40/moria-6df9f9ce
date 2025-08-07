import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { 
  User, 
  Phone, 
  MessageCircle, 
  ShoppingBag, 
  Loader2,
  CheckCircle,
  Package,
  Wrench
} from "lucide-react";
import { toast } from "sonner";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CheckoutForm {
  name: string;
  whatsapp: string;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { items, totalPrice, clearCart, closeCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>({ name: "", whatsapp: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const createProvisionalUser = async (name: string, whatsapp: string) => {
    // Simula criação de usuário provisório
    const login = whatsapp.replace(/\D/g, ''); // Remove caracteres não numéricos
    const password = name.slice(0, 3).toLowerCase(); // 3 primeiras letras do nome
    
    const user = {
      id: Date.now().toString(),
      name,
      whatsapp,
      login,
      password,
      isProvisional: true,
      createdAt: new Date().toISOString()
    };

    // Salva no localStorage (simula backend)
    const users = JSON.parse(localStorage.getItem('provisional_users') || '[]');
    users.push(user);
    localStorage.setItem('provisional_users', JSON.stringify(users));

    return user;
  };

  const createOrder = async (user: any) => {
    const order = {
      id: Date.now().toString(),
      userId: user.id,
      customerName: user.name,
      customerWhatsApp: user.whatsapp,
      items: items.map(item => ({
        ...item,
        subtotal: item.price * item.quantity
      })),
      total: totalPrice,
      hasProducts: items.some(item => item.type !== 'service'),
      hasServices: items.some(item => item.type === 'service'),
      status: items.some(item => item.type === 'service') ? 'quote_requested' : 'pending',
      createdAt: new Date().toISOString(),
      source: 'website'
    };

    // Salva no localStorage (simula backend)
    const orders = JSON.parse(localStorage.getItem('store_orders') || '[]');
    orders.push(order);
    localStorage.setItem('store_orders', JSON.stringify(orders));

    return order;
  };

  const generateWhatsAppMessage = (order: any) => {
    const hasProducts = order.hasProducts;
    const hasServices = order.hasServices;
    
    let message = `🔧 *Moria Peças e Serviços*\n`;
    message += `👤 *Cliente:* ${order.customerName}\n`;
    message += `📞 *WhatsApp:* ${order.customerWhatsApp}\n`;
    message += `📋 *Pedido:* #${order.id}\n\n`;

    if (hasProducts) {
      message += `🛒 *PRODUTOS:*\n`;
      order.items.filter((item: any) => item.type !== 'service').forEach((item: any, index: number) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   • Quantidade: ${item.quantity}x\n`;
        message += `   • Valor: ${formatPrice(item.price)}\n`;
        message += `   • Subtotal: ${formatPrice(item.subtotal)}\n\n`;
      });
    }

    if (hasServices) {
      message += `🔧 *SERVIÇOS (Orçamento):*\n`;
      order.items.filter((item: any) => item.type === 'service').forEach((item: any, index: number) => {
        message += `${index + 1}. ${item.name}\n`;
        if (item.description) {
          message += `   • Descrição: ${item.description}\n`;
        }
        message += `   • Quantidade: ${item.quantity}x\n\n`;
      });
    }

    if (hasProducts) {
      message += `💰 *Total dos Produtos: ${formatPrice(totalPrice)}*\n\n`;
    }

    if (hasServices && hasProducts) {
      message += `📋 Este pedido contém produtos com valores definidos e serviços que precisam de orçamento.\n\n`;
    } else if (hasServices) {
      message += `📋 Solicitação de orçamento para os serviços listados acima.\n\n`;
    }

    message += `🕒 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\n\n`;
    message += `Gostaria de confirmar este pedido${hasServices ? ' e receber o orçamento' : ''}. Aguardo retorno!`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.whatsapp.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (form.whatsapp.replace(/\D/g, '').length < 10) {
      toast.error("WhatsApp deve ter pelo menos 10 dígitos");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Criar usuário provisório
      const user = await createProvisionalUser(form.name, form.whatsapp);
      
      // 2. Criar pedido
      const order = await createOrder(user);
      
      // 3. Gerar mensagem do WhatsApp
      const message = generateWhatsAppMessage(order);
      const whatsappNumber = "5511999999999"; // Número da loja
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      // Simular delay do processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      
      // 4. Abrir WhatsApp após sucesso
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        
        // Limpar carrinho e fechar diálogos
        setTimeout(() => {
          clearCart();
          closeCart();
          onOpenChange(false);
          setIsSuccess(false);
          setForm({ name: "", whatsapp: "" });
          toast.success("Pedido enviado! Você será redirecionado para o WhatsApp.");
        }, 1000);
      }, 2000);
      
    } catch (error) {
      toast.error("Erro ao processar pedido. Tente novamente.");
      setIsLoading(false);
    }
  };

  const products = items.filter(item => item.type !== 'service');
  const services = items.filter(item => item.type === 'service');
  const hasProducts = products.length > 0;
  const hasServices = services.length > 0;

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8 space-y-4">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Pedido Processado!</h3>
              <p className="text-muted-foreground">
                Redirecionando para o WhatsApp...
              </p>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Abrindo WhatsApp</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-moria-orange" />
            Finalizar Pedido
          </DialogTitle>
          <DialogDescription>
            Preencha seus dados para finalizar o pedido via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6 pt-0">
            {/* Resumo do Pedido */}
            <div className="flex flex-col h-full">
              <h3 className="font-semibold mb-4">Resumo do Pedido</h3>
              
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                {hasProducts && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Produtos</span>
                    </div>
                    {products.map((item) => (
                      <div key={`product-${item.id}`} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-moria-orange">
                              {item.quantity}x {formatPrice(item.price)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {hasServices && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">Serviços (Orçamento)</span>
                    </div>
                    {services.map((item) => (
                      <div key={`service-${item.id}`} className="border rounded-lg p-3 bg-orange-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                            <Badge variant="outline" className="text-xs mt-1">
                              Orçamento necessário
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {item.quantity}x
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </ScrollArea>

              {hasProducts && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-bold mb-2">
                    <span>Total dos Produtos:</span>
                    <span className="text-lg text-moria-orange">{formatPrice(totalPrice)}</span>
                  </div>
                  {hasServices && (
                    <p className="text-xs text-muted-foreground">
                      * Serviços serão orçados separadamente
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Formulário */}
            <div className="flex flex-col h-full">
              <h3 className="font-semibold mb-4">Seus Dados</h3>
              
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Seu nome completo"
                        className="pl-10 h-10"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        placeholder="(11) 99999-9999"
                        className="pl-10 h-10"
                        value={form.whatsapp}
                        onChange={(e) => {
                          const formatted = formatWhatsApp(e.target.value);
                          setForm(prev => ({ ...prev, whatsapp: formatted }));
                        }}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Como funciona:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✅ Processamos seu pedido automaticamente</li>
                      <li>📱 Você será redirecionado para o WhatsApp</li>
                      <li>💬 A mensagem será gerada automaticamente</li>
                      <li>🤝 Nossa equipe entrará em contato</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 h-11" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Finalizar via WhatsApp
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}