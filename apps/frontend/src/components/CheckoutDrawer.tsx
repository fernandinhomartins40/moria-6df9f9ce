import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
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

interface CheckoutDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CheckoutForm {
  name: string;
  whatsapp: string;
}

export function CheckoutDrawer({ open, onOpenChange }: CheckoutDrawerProps) {
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

  const createOrderAndQuote = async (user: any) => {
    const sessionId = Date.now().toString(); // ID único para vincular pedido e orçamento
    const products = items.filter(item => item.type !== 'service');
    const services = items.filter(item => item.type === 'service');
    
    const results = { order: null, quote: null };

    // Criar pedido apenas se houver produtos
    if (products.length > 0) {
      const productTotal = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const order = {
        id: `P${sessionId}`,
        sessionId,
        userId: user.id,
        customerName: user.name,
        customerWhatsApp: user.whatsapp,
        items: products.map(item => ({
          ...item,
          subtotal: item.price * item.quantity
        })),
        total: productTotal,
        type: 'order',
        status: 'pending',
        hasLinkedQuote: services.length > 0,
        createdAt: new Date().toISOString(),
        source: 'website'
      };

      const orders = JSON.parse(localStorage.getItem('store_orders') || '[]');
      orders.push(order);
      localStorage.setItem('store_orders', JSON.stringify(orders));
      results.order = order;
    }

    // Criar orçamento apenas se houver serviços
    if (services.length > 0) {
      const quote = {
        id: `O${sessionId}`,
        sessionId,
        userId: user.id,
        customerName: user.name,
        customerWhatsApp: user.whatsapp,
        items: services.map(item => ({
          ...item,
          quantity: item.quantity,
          description: item.description || ''
        })),
        type: 'quote',
        status: 'pending',
        hasLinkedOrder: products.length > 0,
        createdAt: new Date().toISOString(),
        source: 'website'
      };

      const quotes = JSON.parse(localStorage.getItem('store_quotes') || '[]');
      quotes.push(quote);
      localStorage.setItem('store_quotes', JSON.stringify(quotes));
      results.quote = quote;
    }

    return results;
  };

  const generateWhatsAppMessage = (results: { order: any, quote: any }) => {
    const { order, quote } = results;
    
    let message = `🔧 *Moria Peças e Serviços*\n`;
    message += `👤 *Cliente:* ${order?.customerName || quote?.customerName}\n`;
    message += `📞 *WhatsApp:* ${order?.customerWhatsApp || quote?.customerWhatsApp}\n`;
    
    if (order && quote) {
      message += `📋 *Pedido:* #${order.id} | *Orçamento:* #${quote.id}\n\n`;
    } else if (order) {
      message += `📋 *Pedido:* #${order.id}\n\n`;
    } else if (quote) {
      message += `📋 *Orçamento:* #${quote.id}\n\n`;
    }

    if (order) {
      message += `🛒 *PRODUTOS:*\n`;
      order.items.forEach((item: any, index: number) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   • Quantidade: ${item.quantity}x\n`;
        message += `   • Valor: ${formatPrice(item.price)}\n`;
        message += `   • Subtotal: ${formatPrice(item.subtotal)}\n\n`;
      });
      message += `💰 *Total dos Produtos: ${formatPrice(order.total)}*\n\n`;
    }

    if (quote) {
      message += `🔧 *SERVIÇOS (Orçamento):*\n`;
      quote.items.forEach((item: any, index: number) => {
        message += `${index + 1}. ${item.name}\n`;
        if (item.description) {
          message += `   • Descrição: ${item.description}\n`;
        }
        message += `   • Quantidade: ${item.quantity}x\n\n`;
      });
    }

    if (order && quote) {
      message += `📋 Este cliente possui produtos para compra e serviços que precisam de orçamento.\n\n`;
    } else if (quote) {
      message += `📋 Solicitação de orçamento para os serviços listados acima.\n\n`;
    }

    message += `🕒 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\n\n`;
    message += `Gostaria de confirmar${order ? ' este pedido' : ''}${order && quote ? ' e receber o orçamento' : quote ? ' o orçamento' : ''}. Aguardo retorno!`;

    return message;
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
      
      // 2. Criar pedido e/ou orçamento
      const results = await createOrderAndQuote(user);
      
      // 3. Gerar mensagem do WhatsApp
      const message = generateWhatsAppMessage(results);
      const whatsappNumber = "5511999999999"; // Número da loja
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
      
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
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Pedido Processado!</h3>
                <p className="text-muted-foreground">
                  Redirecionando para o WhatsApp...
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-moria-orange" />
                <span className="text-sm font-medium">Abrindo WhatsApp</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-moria-orange" />
            Finalizar Pedido
          </SheetTitle>
          <SheetDescription>
            Preencha seus dados para finalizar o pedido via WhatsApp
          </SheetDescription>
        </SheetHeader>

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
      </SheetContent>
    </Sheet>
  );
}