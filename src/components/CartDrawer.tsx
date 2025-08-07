import { useCart } from "../contexts/CartContext";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Trash2, Plus, Minus, MessageCircle, ShoppingBag, X } from "lucide-react";

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
    const phoneNumber = "5511999999999";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Sheet open={isOpen} onOpenChange={() => closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-moria-orange/10 p-2 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-moria-orange" />
                </div>
                <div>
                  <SheetTitle className="text-xl">Carrinho de Compras</SheetTitle>
                  {totalItems > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                    </p>
                  )}
                </div>
              </div>
              {totalItems > 0 && (
                <Badge className="bg-moria-orange text-white px-3 py-1">
                  {totalItems}
                </Badge>
              )}
            </div>
          </SheetHeader>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4">
                <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Carrinho vazio</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Adicione produtos ao seu carrinho para continuar com a compra
                  </p>
                </div>
                <Button onClick={closeCart} className="bg-moria-orange hover:bg-moria-orange/90">
                  Continuar Comprando
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Items List */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="group relative bg-white border rounded-xl p-4 transition-all hover:shadow-md">
                      <div className="flex gap-4">
                        {/* Product Image Placeholder */}
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                                {item.name}
                              </h4>
                              {item.category && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-lg font-bold text-moria-orange">
                              {formatPrice(item.price)}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-muted rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-background"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              
                              <span className="px-3 py-1 text-sm font-semibold min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-background"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t">
                <div className="p-6 space-y-4">
                  {/* Summary */}
                  <div className="bg-muted rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>Itens ({totalItems})</span>
                      <span className="font-medium">{formatPrice(totalPrice)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-xl font-bold text-moria-orange">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleWhatsAppCheckout}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                      size="lg"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Finalizar pelo WhatsApp
                    </Button>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="flex-1 h-10 rounded-xl"
                      >
                        Limpar Carrinho
                      </Button>
                      <Button
                        variant="outline"
                        onClick={closeCart}
                        className="flex-1 h-10 rounded-xl"
                      >
                        Continuar Comprando
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}