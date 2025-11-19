import { prisma } from '@config/database.js';
import { NotificationType, NotificationRecipientType, Admin } from '@prisma/client';

export interface CreateNotificationDTO {
  recipientType: NotificationRecipientType;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  // ==================== CRUD BÁSICO ====================

  async create(data: CreateNotificationDTO) {
    return prisma.notification.create({
      data: {
        recipientType: data.recipientType,
        recipientId: data.recipientId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
      },
    });
  }

  async getByRecipient(
    recipientId: string,
    recipientType: NotificationRecipientType,
    filters?: {
      unreadOnly?: boolean;
      limit?: number;
    }
  ) {
    const where: any = {
      recipientId,
      recipientType,
    };

    if (filters?.unreadOnly) {
      where.read = false;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(recipientId: string, recipientType: NotificationRecipientType) {
    return prisma.notification.updateMany({
      where: {
        recipientId,
        recipientType,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async countUnread(recipientId: string, recipientType: NotificationRecipientType) {
    return prisma.notification.count({
      where: {
        recipientId,
        recipientType,
        read: false,
      },
    });
  }

  async deleteById(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  // ==================== NOTIFICAÇÕES ESPECÍFICAS ====================

  async notifyNewQuoteRequest(quoteId: string) {
    // Buscar dados do orçamento
    const quote = await prisma.order.findUnique({
      where: { id: quoteId },
      include: { customer: true, items: true },
    });

    if (!quote) {
      throw new Error('Orçamento não encontrado');
    }

    // Buscar todos os admins ativos
    const admins = await prisma.admin.findMany({
      where: { status: 'ACTIVE' },
    });

    // Criar notificação para cada admin
    const notifications = admins.map((admin: Admin) =>
      this.create({
        recipientType: 'ADMIN',
        recipientId: admin.id,
        type: 'NEW_QUOTE_REQUEST',
        title: 'Nova Solicitação de Orçamento',
        message: `${quote.customer.name} solicitou orçamento para ${quote.items.length} serviço(s)`,
        data: {
          quoteId: quote.id,
          customerId: quote.customerId,
          customerName: quote.customer.name,
          itemsCount: quote.items.length,
        },
      })
    );

    return Promise.all(notifications);
  }

  async notifyQuoteResponded(quoteId: string) {
    // Buscar dados do orçamento
    const quote = await prisma.order.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });

    if (!quote) {
      throw new Error('Orçamento não encontrado');
    }

    return this.create({
      recipientType: 'CUSTOMER',
      recipientId: quote.customerId,
      type: 'QUOTE_RESPONDED',
      title: 'Orçamento Respondido',
      message: `Seu orçamento foi respondido! Total: R$ ${quote.total.toFixed(2)}`,
      data: {
        quoteId: quote.id,
        total: Number(quote.total),
        itemsCount: quote.items.length,
        validUntil: quote.quotedAt
          ? new Date(quote.quotedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      },
    });
  }

  async notifyQuoteApproved(quoteId: string) {
    // Buscar dados do orçamento
    const quote = await prisma.order.findUnique({
      where: { id: quoteId },
      include: { customer: true },
    });

    if (!quote) {
      throw new Error('Orçamento não encontrado');
    }

    // Notificar cliente
    const customerNotification = this.create({
      recipientType: 'CUSTOMER',
      recipientId: quote.customerId,
      type: 'QUOTE_APPROVED',
      title: 'Orçamento Aprovado',
      message: 'Seu orçamento foi aprovado e já está em produção!',
      data: {
        quoteId: quote.id,
        orderId: quote.id,
        total: Number(quote.total),
      },
    });

    // Notificar admins
    const admins = await prisma.admin.findMany({
      where: { status: 'ACTIVE' },
    });

    const adminNotifications = admins.map((admin: Admin) =>
      this.create({
        recipientType: 'ADMIN',
        recipientId: admin.id,
        type: 'QUOTE_APPROVED',
        title: 'Orçamento Aprovado',
        message: `Orçamento de ${quote.customer.name} foi aprovado e está em produção`,
        data: {
          quoteId: quote.id,
          orderId: quote.id,
          customerId: quote.customerId,
          customerName: quote.customer.name,
          total: Number(quote.total),
        },
      })
    );

    return Promise.all([customerNotification, ...adminNotifications]);
  }

  async notifyQuoteRejected(quoteId: string, customerId: string) {
    return this.create({
      recipientType: 'CUSTOMER',
      recipientId: customerId,
      type: 'QUOTE_REJECTED',
      title: 'Orçamento Rejeitado',
      message: 'Infelizmente seu orçamento foi rejeitado. Entre em contato para mais informações.',
      data: {
        quoteId,
      },
    });
  }

  async notifyOrderStatusUpdated(orderId: string, newStatus: string) {
    // Buscar dados do pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Mapear status para mensagens amigáveis
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'Seu pedido foi confirmado e está sendo preparado',
      IN_PRODUCTION: 'Seu pedido está em produção',
      PREPARING: 'Seu pedido está sendo preparado para envio',
      SHIPPED: 'Seu pedido foi enviado e está a caminho',
      DELIVERED: 'Seu pedido foi entregue com sucesso!',
      CANCELLED: 'Seu pedido foi cancelado',
    };

    return this.create({
      recipientType: 'CUSTOMER',
      recipientId: order.customerId,
      type: 'ORDER_STATUS_UPDATED',
      title: 'Status do Pedido Atualizado',
      message: statusMessages[newStatus] || `Status atualizado para: ${newStatus}`,
      data: {
        orderId: order.id,
        oldStatus: order.status,
        newStatus,
      },
    });
  }

  async notifyOrderCreated(orderId: string) {
    // Buscar dados do pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Notificar cliente
    const customerNotification = this.create({
      recipientType: 'CUSTOMER',
      recipientId: order.customerId,
      type: 'ORDER_CREATED',
      title: 'Pedido Criado com Sucesso',
      message: `Seu pedido #${order.id.slice(0, 8)} foi criado! Total: R$ ${order.total.toFixed(2)}`,
      data: {
        orderId: order.id,
        total: Number(order.total),
        itemsCount: order.items.length,
      },
    });

    // Notificar admins
    const admins = await prisma.admin.findMany({
      where: { status: 'ACTIVE' },
    });

    const adminNotifications = admins.map((admin: Admin) =>
      this.create({
        recipientType: 'ADMIN',
        recipientId: admin.id,
        type: 'ORDER_CREATED',
        title: 'Novo Pedido Recebido',
        message: `${order.customer.name} fez um novo pedido de R$ ${order.total.toFixed(2)}`,
        data: {
          orderId: order.id,
          customerId: order.customerId,
          customerName: order.customer.name,
          total: Number(order.total),
          hasProducts: order.hasProducts,
          hasServices: order.hasServices,
        },
      })
    );

    return Promise.all([customerNotification, ...adminNotifications]);
  }
}

export default new NotificationService();
