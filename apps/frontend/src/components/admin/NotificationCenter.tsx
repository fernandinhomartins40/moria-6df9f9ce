import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Bell,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
  X,
  MessageCircle
} from "lucide-react";

interface Notification {
  id: string;
  type: 'order' | 'quote' | 'stock' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  pendingOrders: number;
  pendingQuotes: number;
  lowStockProducts: number;
  onActionClick?: (notification: Notification) => void;
}

export function NotificationCenter({
  pendingOrders,
  pendingQuotes,
  lowStockProducts,
  onActionClick
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    generateNotifications();
  }, [pendingOrders, pendingQuotes, lowStockProducts]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    // Pedidos pendentes
    if (pendingOrders > 0) {
      newNotifications.push({
        id: `order-${Date.now()}`,
        type: 'order',
        title: 'Pedidos Pendentes',
        message: `Você tem ${pendingOrders} pedido(s) aguardando confirmação`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
        actionLabel: 'Ver Pedidos',
        actionUrl: '/orders'
      });
    }

    // Orçamentos pendentes
    if (pendingQuotes > 0) {
      newNotifications.push({
        id: `quote-${Date.now()}`,
        type: 'quote',
        title: 'Orçamentos Pendentes',
        message: `${pendingQuotes} solicitação(ões) de orçamento aguardando resposta`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
        actionLabel: 'Ver Orçamentos',
        actionUrl: '/quotes'
      });
    }

    // Estoque baixo
    if (lowStockProducts > 0) {
      newNotifications.push({
        id: `stock-${Date.now()}`,
        type: 'stock',
        title: 'Alerta de Estoque',
        message: `${lowStockProducts} produto(s) com estoque baixo`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        actionLabel: 'Ver Produtos',
        actionUrl: '/products'
      });
    }

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'quote':
        return <Wrench className="h-5 w-5 text-orange-600" />;
      case 'stock':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Central de Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Acompanhe as atividades importantes da sua loja
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-2" />
            <p className="font-medium">Tudo em ordem!</p>
            <p className="text-sm">Nenhuma notificação pendente</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-all ${
                    notification.read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-moria-orange'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {notification.title}
                          </p>
                          <Badge
                            variant="secondary"
                            className={getPriorityColor(notification.priority)}
                          >
                            {notification.priority === 'high' ? 'Urgente' :
                             notification.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {notification.timestamp.toLocaleString('pt-BR')}
                        </p>
                        {notification.actionLabel && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              markAsRead(notification.id);
                              onActionClick?.(notification);
                            }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
