import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import {
  Package,
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  MessageCircle,
  Loader2
} from "lucide-react";
import { StoreOrder } from "../../api/adminService";
import adminService from "../../api/adminService";
import { useToast } from "../../hooks/use-toast";

interface OrderDetailsModalProps {
  order: StoreOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose, onUpdate }: OrderDetailsModalProps) {
  const { toast } = useToast();
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<StoreOrder | null>(order);
  const [updatingButton, setUpdatingButton] = useState<string | null>(null);

  // Update local state when order prop changes
  useEffect(() => {
    if (order) {
      setCurrentOrder(order);
    }
  }, [order]);

  if (!currentOrder) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      PREPARING: { label: 'Preparando', color: 'bg-orange-100 text-orange-800', icon: Package },
      SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
      DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    setUpdatingButton(newStatus);
    try {
      const updatedOrder = await adminService.updateOrderStatus(currentOrder.id, newStatus);

      // Update local state immediately for instant feedback
      setCurrentOrder({ ...currentOrder, status: newStatus });

      toast({
        title: "✅ Status atualizado",
        description: `Pedido #${currentOrder.id} atualizado para ${getStatusInfo(newStatus).label}`,
      });

      // Call parent update to refresh list
      onUpdate();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "❌ Erro ao atualizar status",
        description: error.response?.data?.error || error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setUpdatingButton(null);
    }
  };

  const handleSaveTracking = () => {
    toast({
      title: "Informações salvas",
      description: "Código de rastreamento e notas foram salvos",
    });
    setIsEditingTracking(false);
  };

  const handleSendWhatsApp = () => {
    const statusInfo = getStatusInfo(currentOrder.status);
    const message = `Olá ${currentOrder.customerName}!

📦 *Atualização do Pedido #${currentOrder.id}*

Status: ${statusInfo.label}
Total: ${formatCurrency(currentOrder.total)}
${trackingCode ? `\nCódigo de Rastreamento: ${trackingCode}` : ''}
${estimatedDelivery ? `\nEntrega Prevista: ${new Date(estimatedDelivery).toLocaleDateString('pt-BR')}` : ''}

Qualquer dúvida estou à disposição!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${currentOrder.customerWhatsApp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "✅ WhatsApp aberto",
      description: "Mensagem pronta para envio",
    });
  };

  const statusInfo = getStatusInfo(currentOrder.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] sm:w-[calc(100%-4rem)] max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-4rem)] p-0 flex flex-col gap-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b bg-gray-50/50 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-moria-orange" />
              Pedido #{currentOrder.id.slice(0, 8)}
            </span>
            <Badge className={`${statusInfo.color} text-xs`} variant="secondary">
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Realizado em {new Date(currentOrder.createdAt).toLocaleDateString('pt-BR')} às{' '}
            {new Date(currentOrder.createdAt).toLocaleTimeString('pt-BR')}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* Ações de Status */}
          <div className="bg-muted p-3 rounded-lg">
            <Label className="text-xs font-semibold mb-2 block">Mudar Status</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button
                size="sm"
                variant={currentOrder.status === 'CONFIRMED' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus('CONFIRMED')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full min-h-[44px] h-11 text-xs sm:text-sm touch-manipulation"
              >
                {updatingButton === 'CONFIRMED' ? (
                  <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">Confirmar</span>
              </Button>
              <Button
                size="sm"
                variant={currentOrder.status === 'PREPARING' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus('PREPARING')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full min-h-[44px] h-11 text-xs sm:text-sm touch-manipulation"
              >
                {updatingButton === 'PREPARING' ? (
                  <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" />
                ) : (
                  <Package className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">Preparar</span>
              </Button>
              <Button
                size="sm"
                variant={currentOrder.status === 'SHIPPED' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus('SHIPPED')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full min-h-[44px] h-11 text-xs sm:text-sm touch-manipulation"
              >
                {updatingButton === 'SHIPPED' ? (
                  <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">Enviar</span>
              </Button>
              <Button
                size="sm"
                variant={currentOrder.status === 'DELIVERED' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus('DELIVERED')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full min-h-[44px] h-11 text-xs sm:text-sm touch-manipulation"
              >
                {updatingButton === 'DELIVERED' ? (
                  <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">Entregar</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleUpdateStatus('CANCELLED')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full min-h-[44px] h-11 text-xs sm:text-sm col-span-2 sm:col-span-2 touch-manipulation"
              >
                {updatingButton === 'CANCELLED' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Cancelar
              </Button>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div>
            <Label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-moria-orange" />
              Informações do Cliente
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="text-sm font-medium truncate">{currentOrder.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-medium truncate">{currentOrder.customerWhatsApp}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <Label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-moria-orange" />
              Itens do Pedido ({currentOrder.items.length})
            </Label>
            <div className="space-y-1.5">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x {item.type === 'service' ? '(Serviço)' : '(Produto)'}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatCurrency(item.price)} cada
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 p-2 bg-moria-orange/10 rounded">
              <span className="text-sm font-semibold">Total do Pedido</span>
              <span className="text-base font-bold text-moria-orange">{formatCurrency(currentOrder.total)}</span>
            </div>
          </div>

          {/* Rastreamento e Notas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-moria-orange" />
                Rastreamento e Observações
              </Label>
              {!isEditingTracking && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingTracking(true)}
                  className="min-h-[36px] h-9 text-xs touch-manipulation"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              )}
            </div>

            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="trackingCode" className="text-xs">Código de Rastreamento</Label>
                  <Input
                    id="trackingCode"
                    placeholder="Ex: BR123456789BR"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    disabled={!isEditingTracking}
                    className="mt-1 min-h-[44px] h-11 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDelivery" className="text-xs">Data Estimada de Entrega</Label>
                  <Input
                    id="estimatedDelivery"
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    disabled={!isEditingTracking}
                    className="mt-1 min-h-[44px] h-11 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="internalNotes" className="text-xs">Notas Internas (não visível ao cliente)</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="Adicione observações sobre este pedido..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  disabled={!isEditingTracking}
                  className="mt-1 text-sm"
                  rows={2}
                />
              </div>

              {isEditingTracking && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveTracking} size="sm" className="flex-1 min-h-[44px] h-11 text-xs touch-manipulation">
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingTracking(false)}
                    size="sm"
                    className="flex-1 min-h-[44px] h-11 text-xs touch-manipulation"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline de Status */}
          <div>
            <Label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-moria-orange" />
              Histórico do Pedido
            </Label>
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <div>
                  <p className="text-xs font-medium">Pedido Criado</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(currentOrder.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(currentOrder.createdAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
              {currentOrder.status !== 'PENDING' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <div>
                    <p className="text-xs font-medium">Pedido Confirmado</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(currentOrder.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
              {['PREPARING', 'SHIPPED', 'DELIVERED'].includes(currentOrder.status) && (
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-orange-600" />
                  <div>
                    <p className="text-xs font-medium">Em Preparação</p>
                  </div>
                </div>
              )}
              {['SHIPPED', 'DELIVERED'].includes(currentOrder.status) && (
                <div className="flex items-center gap-2">
                  <Truck className="h-3 w-3 text-purple-600" />
                  <div>
                    <p className="text-xs font-medium">Pedido Enviado</p>
                  </div>
                </div>
              )}
              {currentOrder.status === 'DELIVERED' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <div>
                    <p className="text-xs font-medium">Pedido Entregue</p>
                  </div>
                </div>
              )}
              {currentOrder.status === 'CANCELLED' && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <div>
                    <p className="text-xs font-medium">Pedido Cancelado</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          </div>
        </ScrollArea>

        {/* Footer com ações */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t bg-gray-50/50 flex-shrink-0">
          <Button
            onClick={handleSendWhatsApp}
            size="sm"
            className="bg-green-600 hover:bg-green-700 min-h-[44px] h-11 text-xs sm:text-sm touch-manipulation"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            WhatsApp
          </Button>
          <Button variant="outline" onClick={onClose} size="sm" className="min-h-[44px] h-11 text-xs sm:text-sm touch-manipulation">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
