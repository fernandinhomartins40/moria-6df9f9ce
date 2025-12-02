import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import {
  Wrench,
  User,
  Phone,
  Calendar,
  DollarSign,
  Save,
  X,
  MessageCircle,
  CheckCircle,
  XCircle,
  Send,
  Calculator,
  Loader2
} from "lucide-react";
import { Quote } from "../../api/adminService";
import adminService from "../../api/adminService";
import { useToast } from "../../hooks/use-toast";

interface QuoteModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface QuoteItemWithPrice {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  quotedPrice: number;
}

export function QuoteModal({ quote, isOpen, onClose, onUpdate }: QuoteModalProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<QuoteItemWithPrice[]>([]);
  const [observations, setObservations] = useState("");
  const [validityDays, setValidityDays] = useState(7);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (quote) {
      setItems(
        quote.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price ?? undefined,
          quotedPrice: item.quotedPrice ?? item.price ?? 0,
        }))
      );
    }
  }, [quote]);

  if (!quote) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quotedPrice * item.quantity), 0);
  };

  const handlePriceChange = (itemId: string, value: string) => {
    const price = parseFloat(value) || 0;
    setItems(items.map(item =>
      item.id === itemId ? { ...item, quotedPrice: price } : item
    ));
  };

  const handleSaveQuote = async () => {
    // Validar se todos os preços foram definidos
    const hasEmptyPrices = items.some(item => !item.quotedPrice || item.quotedPrice <= 0);
    if (hasEmptyPrices) {
      toast({
        title: "⚠️ Atenção",
        description: "Por favor, defina preços válidos para todos os serviços",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const itemsWithPrices = items.map(item => ({
        id: item.id,
        quotedPrice: item.quotedPrice
      }));

      await adminService.updateQuotePrices(quote.id, itemsWithPrices);

      toast({
        title: "✅ Orçamento salvo",
        description: `Orçamento #${quote.id} foi atualizado com sucesso`,
      });

      onUpdate();
    } catch (error: any) {
      console.error('Erro ao salvar orçamento:', error);
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || "Erro desconhecido. Tente novamente";

      toast({
        title: "❌ Erro ao salvar orçamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendWhatsApp = () => {
    const total = calculateTotal();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    const itemsList = items.map(item =>
      `• ${item.name} (${item.quantity}x) - ${formatCurrency(item.quotedPrice * item.quantity)}`
    ).join('\n');

    const message = `Olá ${quote.customerName}!

🔧 *Orçamento #${quote.id}*

Segue o orçamento solicitado:

${itemsList}

━━━━━━━━━━━━━━━━
*TOTAL: ${formatCurrency(total)}*
━━━━━━━━━━━━━━━━

${observations ? `\n📋 Observações:\n${observations}\n` : ''}
⏰ Validade: até ${validUntil.toLocaleDateString('pt-BR')}

Para aprovar este orçamento, responda esta mensagem ou entre em contato conosco!

Estou à disposição para esclarecer dúvidas! 😊`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${quote.customerWhatsApp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleApprove = async () => {
    // Validar se todos os preços foram definidos
    const hasEmptyPrices = items.some(item => !item.quotedPrice || item.quotedPrice <= 0);
    if (hasEmptyPrices) {
      toast({
        title: "⚠️ Atenção",
        description: "Por favor, defina preços válidos para todos os serviços antes de aprovar",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Primeiro, salvar o orçamento (muda status para QUOTED)
      const itemsWithPrices = items.map(item => ({
        id: item.id,
        quotedPrice: item.quotedPrice
      }));

      await adminService.updateQuotePrices(quote.id, itemsWithPrices);

      // 2. Depois, aprovar o orçamento (muda status para APPROVED)
      await adminService.approveQuote(quote.id);

      toast({
        title: "✅ Orçamento aprovado",
        description: `Orçamento #${quote.id} foi salvo e aprovado com sucesso`,
      });
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Erro ao aprovar orçamento:', error);
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || "Erro desconhecido. Tente novamente";

      toast({
        title: "❌ Erro ao aprovar orçamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    setIsUpdating(true);
    try {
      await adminService.rejectQuote(quote.id);
      toast({
        title: "🚫 Orçamento rejeitado",
        description: `Orçamento #${quote.id} foi rejeitado`,
      });
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Erro ao rejeitar orçamento:', error);
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || "Erro desconhecido. Tente novamente";

      toast({
        title: "❌ Erro ao rejeitar orçamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      QUOTED: { label: 'Orçado', color: 'bg-blue-100 text-blue-800' },
      APPROVED: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
      // Mapeamento antigo para compatibilidade
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      responded: { label: 'Orçado', color: 'bg-blue-100 text-blue-800' },
      accepted: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const statusBadge = getStatusBadge(quote.status);
  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50 shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-moria-orange" />
              Orçamento #{quote.id.slice(0, 8)}
            </span>
            <Badge className={`${statusBadge.color} text-xs`} variant="secondary">
              {statusBadge.label}
            </Badge>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Solicitado em {new Date(quote.createdAt).toLocaleDateString('pt-BR')} às{' '}
            {new Date(quote.createdAt).toLocaleTimeString('pt-BR')}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="py-4 space-y-4">
          {/* Informações do Cliente */}
          <div>
            <Label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-moria-orange" />
              Informações do Cliente
            </Label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Nome</p>
                  <p className="text-sm font-medium">{quote.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-medium">{quote.customerWhatsApp}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Serviços Solicitados */}
          <div>
            <Label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-moria-orange" />
              Serviços Solicitados ({items.length})
            </Label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-gray-50 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`price-${item.id}`} className="text-xs">
                        Preço Unitário
                      </Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={item.quotedPrice || ''}
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          className="pl-7 h-9 text-sm"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Subtotal</Label>
                      <div className="mt-1 h-9 flex items-center justify-center bg-muted rounded-md font-bold text-sm">
                        {formatCurrency(item.quotedPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-3 p-2 bg-moria-orange/10 rounded">
              <div className="flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-moria-orange" />
                <span className="text-sm font-semibold">Total do Orçamento</span>
              </div>
              <span className="text-base font-bold text-moria-orange">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Observações e Validade */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label htmlFor="observations" className="text-xs">Observações (visível ao cliente)</Label>
              <Textarea
                id="observations"
                placeholder="Ex: Inclui mão de obra especializada. Peças com garantia de 90 dias..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="mt-1 text-sm"
                rows={3}
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label htmlFor="validity" className="text-xs">Validade (dias)</Label>
              <Input
                id="validity"
                type="number"
                min="1"
                max="30"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 7)}
                className="mt-1 h-9 text-sm"
                disabled={isUpdating}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Válido até: {new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

        </div>
        </div>

        {/* Footer com ações */}
        <div className="px-6 py-3 border-t bg-gray-50/50 space-y-2 shrink-0">
          <div className="flex gap-2">
            <Button
              onClick={handleSaveQuote}
              disabled={isUpdating || total === 0}
              size="sm"
              className="flex-1 bg-moria-orange hover:bg-orange-600"
            >
              {isUpdating ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={total === 0}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              WhatsApp
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isUpdating || quote.status === 'APPROVED' || quote.status === 'accepted'}
              variant="outline"
              size="sm"
              className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
              title={quote.status === 'PENDING' || quote.status === 'pending' ? 'Salvar e aprovar orçamento' : 'Aprovar orçamento'}
            >
              {isUpdating ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isUpdating ? "Aprovando..." : (quote.status === 'PENDING' || quote.status === 'pending' ? "Salvar e Aprovar" : "Aprovar")}
            </Button>
            <Button
              onClick={handleReject}
              disabled={isUpdating || quote.status === 'REJECTED' || quote.status === 'rejected'}
              variant="outline"
              size="sm"
              className="flex-1 border-red-600 text-red-700 hover:bg-red-50"
            >
              {isUpdating ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isUpdating ? "Rejeitando..." : "Rejeitar"}
            </Button>
            <Button variant="outline" onClick={onClose} size="sm">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
