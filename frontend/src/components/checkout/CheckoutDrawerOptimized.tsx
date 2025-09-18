// ========================================
// COMPONENTE DE CHECKOUT SIMPLIFICADO - MORIA FRONTEND
// Componente otimizado para processo de checkout
// ========================================

import { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Mail,
  Package,
  Wrench,
  ShoppingCart,
  CreditCard,
  CheckCircle
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCoupons } from "@/hooks/useCouponsHook";
import { usePromotions } from "@/hooks/usePromotionsHook";
import { apiClient } from "@/services/api";

interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerWhatsApp: string;
  customerAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: 'cash' | 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer';
  notes: string;
  couponCode?: string;
}

export function CheckoutDrawer() {
  const { items, totalPrice, originalTotalPrice, totalSavings, clearCart, closeCart } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const { appliedCoupon, validateCoupon, applyCoupon, removeCoupon, isValidatingCoupon } = useCoupons();
  const { activePromotions, getAppliedPromotions } = usePromotions();

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: customer?.name || "",
    customerEmail: customer?.email || "",
    customerPhone: customer?.phone || "",
    customerWhatsApp: customer?.whatsapp || "",
    customerAddress: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: ""
    },
    paymentMethod: "cash",
    notes: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  // Calcular itens do carrinho
  const products = useMemo(() => items.filter(item => item.type !== 'service'), [items]);
  const services = useMemo(() => items.filter(item => item.type === 'service'), [items]);
  const hasProducts = products.length > 0;
  const hasServices = services.length > 0;

  // Promoções aplicadas
  const appliedPromotions = useMemo(() => getAppliedPromotions(items), [getAppliedPromotions, items]);

  // Formatar preço
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }, []);

  // Validar cupom
  const handleValidateCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    
    try {
      const result = await validateCoupon(couponCode, totalPrice);
      if (result?.success && result.data?.coupon) {
        applyCoupon(result.data.coupon);
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
    }
  }, [couponCode, totalPrice, validateCoupon, applyCoupon]);

  // Remover cupom
  const handleRemoveCoupon = useCallback(() => {
    removeCoupon();
    setCouponCode("");
  }, [removeCoupon]);

  // Formatador de WhatsApp
  const formatWhatsApp = useCallback((value: string) => {
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
  }, []);

  // Manipulador de mudança de formulário
  const handleInputChange = useCallback((field: keyof CheckoutFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Manipulador de mudança de endereço
  const handleAddressChange = useCallback((field: keyof CheckoutFormData['customerAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      customerAddress: {
        ...prev.customerAddress,
        [field]: value
      }
    }));
  }, []);

  // Criar pedido
  const createOrder = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Preparar dados do pedido
      const orderData = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim().toLowerCase(),
        customerPhone: formData.customerPhone.replace(/\D/g, ''),
        customerWhatsApp: formData.customerWhatsApp.replace(/\D/g, ''),
        customerAddress: formData.customerAddress,
        paymentMethod: formData.paymentMethod.toUpperCase(),
        notes: formData.notes.trim() || null,
        items: items.map(item => ({
          type: item.type.toUpperCase(),
          itemId: item.id,
          itemName: item.name,
          itemDescription: item.description || '',
          quantity: item.quantity,
          unitPrice: item.price,
          originalUnitPrice: item.originalPrice,
          appliedPromotions: item.appliedPromotion ? [item.appliedPromotion] : []
        })),
        couponCode: appliedCoupon?.code || null,
        totalAmount: totalPrice
      };

      // Enviar pedido para API
      const response = await apiClient.createOrder(orderData);
      
      if (response?.success) {
        setIsSuccess(true);
        clearCart();
        
        // Redirecionar para WhatsApp após breve delay
        setTimeout(() => {
          const message = `Olá ${formData.customerName}! Recebemos seu pedido #${response.data.order.id}. Em breve entraremos em contato para confirmar os detalhes.`;
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${formData.customerWhatsApp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, items, appliedCoupon, totalPrice, clearCart]);

  // Manipulador de envio
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.customerName.trim() || !formData.customerEmail.trim() || !formData.customerPhone.trim()) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    await createOrder();
  }, [formData, createOrder]);

  // Renderizar estado de sucesso
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center h-full p-6">
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
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-moria-orange border-t-transparent"></div>
            <span className="text-sm font-medium">Abrindo WhatsApp</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
          <p className="text-muted-foreground">
            Preencha seus dados para finalizar o pedido via WhatsApp
          </p>
        </div>

        <Separator />

        {/* Resumo do Pedido */}
        <div className="space-y-4">
          <h3 className="font-semibold">Resumo do Pedido</h3>
          
          {hasProducts && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
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
            <div className="space-y-3">
              <div className="flex items-center gap-2">
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

          {/* Promoções aplicadas */}
          {(appliedPromotions.length > 0 || appliedCoupon) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-green-700 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Descontos Aplicados
                </p>
                {appliedPromotions.map(promotion => (
                  <div key={promotion.id} className="flex justify-between items-center text-xs">
                    <span className="text-green-600">{promotion.name}</span>
                    <span className="text-green-600 font-medium">
                      -{formatPrice(totalSavings)}
                    </span>
                  </div>
                ))}
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-green-600">{appliedCoupon.code}</span>
                      <button 
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        (remover)
                      </button>
                    </div>
                    <span className="text-green-600 font-medium">
                      -{formatPrice(appliedCoupon.discountValue)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Total */}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">
              {hasProducts ? 'Total Produtos' : 'Itens'}
            </span>
            <span className="text-xl font-bold text-moria-orange">
              {hasProducts ? formatPrice(totalPrice) : `${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
            </span>
          </div>
          
          {totalSavings > 0 && (
            <div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded text-sm">
              <span className="text-green-700 font-medium">Você economizou:</span>
              <span className="text-green-700 font-bold">{formatPrice(totalSavings)}</span>
            </div>
          )}
          
          {hasServices && hasProducts && (
            <p className="text-xs text-muted-foreground">
              * Serviços serão orçados separadamente
            </p>
          )}
        </div>

        <Separator />

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customerName"
                  placeholder="Seu nome completo"
                  className="pl-10 h-10"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-sm">E-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 h-10"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-sm">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerPhone"
                    placeholder="(11) 99999-9999"
                    className="pl-10 h-10"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerWhatsApp" className="text-sm">WhatsApp</Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customerWhatsApp"
                  placeholder="(11) 99999-9999"
                  className="pl-10 h-10"
                  value={formData.customerWhatsApp}
                  onChange={(e) => {
                    const formatted = formatWhatsApp(e.target.value);
                    handleInputChange('customerWhatsApp', formatted);
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress.street" className="text-sm">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customerAddress.street"
                  placeholder="Rua, Avenida, etc."
                  className="pl-10 h-10"
                  value={formData.customerAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerAddress.number" className="text-sm">Número</Label>
                <Input
                  id="customerAddress.number"
                  placeholder="123"
                  className="h-10"
                  value={formData.customerAddress.number}
                  onChange={(e) => handleAddressChange('number', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress.complement" className="text-sm">Complemento</Label>
                <Input
                  id="customerAddress.complement"
                  placeholder="Apto, Bloco, etc."
                  className="h-10"
                  value={formData.customerAddress.complement}
                  onChange={(e) => handleAddressChange('complement', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress.neighborhood" className="text-sm">Bairro</Label>
                <Input
                  id="customerAddress.neighborhood"
                  placeholder="Bairro"
                  className="h-10"
                  value={formData.customerAddress.neighborhood}
                  onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerAddress.city" className="text-sm">Cidade</Label>
                <Input
                  id="customerAddress.city"
                  placeholder="Cidade"
                  className="h-10"
                  value={formData.customerAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress.state" className="text-sm">Estado</Label>
                <Input
                  id="customerAddress.state"
                  placeholder="UF"
                  className="h-10"
                  value={formData.customerAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress.zipCode" className="text-sm">CEP</Label>
                <Input
                  id="customerAddress.zipCode"
                  placeholder="00000-000"
                  className="h-10"
                  value={formData.customerAddress.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm">Forma de Pagamento</Label>
              <select
                id="paymentMethod"
                className="w-full h-10 px-3 rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                disabled={isLoading}
              >
                <option value="cash">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="bank_transfer">Transferência Bancária</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm">Observações</Label>
              <textarea
                id="notes"
                placeholder="Alguma observação sobre o pedido?"
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="couponCode" className="text-sm">Cupom de Desconto</Label>
              <div className="flex gap-2">
                <Input
                  id="couponCode"
                  placeholder="Digite o código do cupom"
                  className="flex-1"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={isLoading || !!appliedCoupon}
                />
                {!appliedCoupon ? (
                  <Button
                    type="button"
                    onClick={handleValidateCoupon}
                    disabled={isLoading || isValidatingCoupon || !couponCode.trim()}
                    className="h-10"
                  >
                    {isValidatingCoupon ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      "Aplicar"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveCoupon}
                    className="h-10"
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full h-11 bg-moria-orange hover:bg-moria-orange/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Finalizar Pedido
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={closeCart}
              className="w-full h-11"
              disabled={isLoading}
            >
              Continuar Comprando
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}