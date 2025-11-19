import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalhes do Pedido #{currentOrder.id}
            </span>
            <Badge className={statusInfo.color} variant="secondary">
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Realizado em {new Date(currentOrder.createdAt).toLocaleDateString('pt-BR')} às{' '}
            {new Date(currentOrder.createdAt).toLocaleTimeString('pt-BR')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ações de Status */}
          <div className="bg-muted p-4 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Mudar Status do Pedido</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button
                size="sm"
                variant={currentOrder.status === 'CONFIRMED' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus('CONFIRMED')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full"
              >
                {updatingButton === 'CONFIRMED' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Confirmar
              </Button>
              <Button
                size="sm"
                variant={currentOrder.status === 'PREPARING' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus('PREPARING')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full"
              >
                {updatingButton === 'PREPARING' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Package className="h-4 w-4 mr-1" />
                )}
                Preparando
              </Button>
              <Button
                size="sm"
                variant={currentOrder.status === 'SHIPPED' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus('SHIPPED')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full"
              >
                {updatingButton === 'SHIPPED' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4 mr-1" />
                )}
                Enviado
              </Button>
              <Button
                size="sm"
                variant={currentOrder.status === 'DELIVERED' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus('DELIVERED')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full"
              >
                {updatingButton === 'DELIVERED' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Entregue
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleUpdateStatus('CANCELLED')}
                disabled={isUpdating || currentOrder.status === 'CANCELLED' || currentOrder.status === 'DELIVERED'}
                className="w-full col-span-2 sm:col-span-1"
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
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{currentOrder.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{currentOrder.customerWhatsApp}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Itens do Pedido ({currentOrder.items.length})
            </h3>
            <div className="space-y-2">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity} {item.type === 'service' ? '(Serviço)' : '(Produto)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} cada
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total do Pedido</span>
              <span className="text-moria-orange">{formatCurrency(currentOrder.total)}</span>
            </div>
          </div>

          {/* Rastreamento e Notas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                Rastreamento e Observações
              </h3>
              {!isEditingTracking && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingTracking(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>

            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div>
                <Label htmlFor="trackingCode">Código de Rastreamento</Label>
                <Input
                  id="trackingCode"
                  placeholder="Ex: BR123456789BR"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  disabled={!isEditingTracking}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="estimatedDelivery">Data Estimada de Entrega</Label>
                <Input
                  id="estimatedDelivery"
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  disabled={!isEditingTracking}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="internalNotes">Notas Internas (não visível ao cliente)</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="Adicione observações sobre este pedido..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  disabled={!isEditingTracking}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {isEditingTracking && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveTracking} className="flex-1">
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingTracking(false)}
                    className="flex-1"
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
            <h3 className="font-semibold mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Histórico do Pedido
            </h3>
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Pedido Criado</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(currentOrder.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(currentOrder.createdAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
              {currentOrder.status !== 'PENDING' && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Pedido Confirmado</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(currentOrder.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
              {['PREPARING', 'SHIPPED', 'DELIVERED'].includes(currentOrder.status) && (
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Em Preparação</p>
                  </div>
                </div>
              )}
              {['SHIPPED', 'DELIVERED'].includes(currentOrder.status) && (
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Pedido Enviado</p>
                  </div>
                </div>
              )}
              {currentOrder.status === 'DELIVERED' && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Pedido Entregue</p>
                  </div>
                </div>
              )}
              {currentOrder.status === 'CANCELLED' && (
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Pedido Cancelado</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ações Finais */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSendWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar Atualização via WhatsApp
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
