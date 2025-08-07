import { useCart } from "../contexts/CartContext";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Trash2, Plus, Minus, MessageCircle } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, totalItems, totalPrice, closeCart, removeItem, updateQuantity, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return "";

    let message = "🛒 *Pedido Moria Peças e Serviços*\n\n";
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Quantidade: ${item.quantity}x\n`;
      message += `   Valor unitário: ${formatPrice(item.price)}\n`;
      message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `💰 *Total do Pedido: ${formatPrice(totalPrice)}*\n\n`;
    message += "Gostaria de finalizar este pedido. Aguardo retorno com informações sobre entrega e pagamento.";
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppCheckout = () => {
    const message = generateWhatsAppMessage();
    const phoneNumber = "5511999999999"; // Substitua pelo número do WhatsApp da empresa
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Sheet open={isOpen} onOpenChange={() => closeCart()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🛒 Carrinho de Compras
            {totalItems > 0 && (
              <span className="bg-moria-orange text-white px-2 py-1 rounded-full text-sm">
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg">Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para continuar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    {item.category && (
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    )}
                    <p className="text-sm font-bold text-moria-orange">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="space-y-4">
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total de itens:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-moria-orange">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCart}
                className="flex-1"
              >
                Limpar Carrinho
              </Button>
              
              <Button
                onClick={handleWhatsAppCheckout}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Finalizar pelo WhatsApp
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}