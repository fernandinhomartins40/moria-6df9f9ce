import { Request, Response, NextFunction } from 'express';
import { prisma } from '@config/database.js';
import { Order, OrderItem, Address } from '@prisma/client';

export class CustomerController {
  // ==================== QUOTES ====================

  getMyQuotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      const { status } = req.query;

      const where: any = {
        customerId,
        hasServices: true,
        quoteStatus: { not: null },
      };

      if (status && status !== 'all') {
        where.quoteStatus = (status as string).toUpperCase();
      }

      const quotes = await prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Mapear para formato Quote
      const mappedQuotes = quotes.map((order: Order & { items: OrderItem[] }) => ({
        id: order.id,
        userId: order.customerId,
        customerName: (req as any).customer?.name || '',
        customerWhatsApp: (req as any).customer?.phone || '',
        items: order.items.map((item: OrderItem) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          quotedPrice: item.quotedPrice ? Number(item.quotedPrice) : null,
        })),
        total: Number(order.total),
        status: order.quoteStatus || 'PENDING',
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }));

      res.json(mappedQuotes);
    } catch (error) {
      next(error);
    }
  };

  getMyQuoteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;
      const { id } = req.params;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      const quote = await prisma.order.findFirst({
        where: {
          id,
          customerId,
        },
        include: {
          items: true,
          address: true,
        },
      });

      if (!quote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      const mappedQuote = {
        id: quote.id,
        userId: quote.customerId,
        customerName: (req as any).customer?.name || '',
        customerWhatsApp: (req as any).customer?.phone || '',
        items: quote.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          quotedPrice: item.quotedPrice ? Number(item.quotedPrice) : null,
        })),
        total: Number(quote.total),
        status: quote.quoteStatus || 'PENDING',
        observations: quote.quoteNotes,
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString(),
        quotedAt: quote.quotedAt?.toISOString() || null,
      };

      res.json(mappedQuote);
    } catch (error) {
      next(error);
    }
  };

  approveMyQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;
      const { id } = req.params;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      // Buscar orçamento
      const quote = await prisma.order.findFirst({
        where: {
          id,
          customerId,
        },
      });

      if (!quote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      if (quote.quoteStatus !== 'QUOTED') {
        res.status(400).json({ error: 'Apenas orçamentos no status QUOTED podem ser aprovados' });
        return;
      }

      // Aprovar orçamento
      const updatedQuote = await prisma.order.update({
        where: { id },
        data: {
          quoteStatus: 'APPROVED',
          quoteApprovedAt: new Date(),
          status: 'IN_PRODUCTION', // Muda para produção
        },
        include: {
          items: true,
        },
      });

      res.json({
        id: updatedQuote.id,
        status: updatedQuote.quoteStatus,
        orderStatus: updatedQuote.status,
        message: 'Orçamento aprovado com sucesso! Seu pedido já está em produção.',
      });
    } catch (error) {
      next(error);
    }
  };

  rejectMyQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;
      const { id } = req.params;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      // Buscar orçamento
      const quote = await prisma.order.findFirst({
        where: {
          id,
          customerId,
        },
      });

      if (!quote) {
        res.status(404).json({ error: 'Orçamento não encontrado' });
        return;
      }

      if (quote.quoteStatus !== 'QUOTED') {
        res.status(400).json({ error: 'Apenas orçamentos no status QUOTED podem ser rejeitados' });
        return;
      }

      // Rejeitar orçamento
      const updatedQuote = await prisma.order.update({
        where: { id },
        data: {
          quoteStatus: 'REJECTED',
        },
      });

      res.json({
        id: updatedQuote.id,
        status: updatedQuote.quoteStatus,
        message: 'Orçamento rejeitado.',
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== ORDERS ====================

  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      const orders = await prisma.order.findMany({
        where: {
          customerId,
          OR: [
            { hasProducts: true },
            { status: { in: ['IN_PRODUCTION', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
          ],
        },
        include: {
          items: true,
          address: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const mappedOrders = orders.map((order: Order & { items: OrderItem[] }) => ({
        id: order.id,
        status: order.status,
        quoteStatus: order.quoteStatus,
        hasProducts: order.hasProducts,
        hasServices: order.hasServices,
        total: Number(order.total),
        items: order.items.map((item: OrderItem) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          type: item.productId ? 'product' : 'service',
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }));

      res.json(mappedOrders);
    } catch (error) {
      next(error);
    }
  };

  getMyOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;
      const { id } = req.params;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      const order = await prisma.order.findFirst({
        where: {
          id,
          customerId,
        },
        include: {
          items: true,
          address: true,
        },
      }) as (Order & { items: OrderItem[]; address: Address }) | null;

      if (!order) {
        res.status(404).json({ error: 'Pedido não encontrado' });
        return;
      }

      res.json({
        id: order.id,
        status: order.status,
        quoteStatus: order.quoteStatus,
        hasProducts: order.hasProducts,
        hasServices: order.hasServices,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        paymentMethod: order.paymentMethod,
        items: order.items.map((item: OrderItem) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          type: item.productId ? 'product' : 'service',
        })),
        address: order.address,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}
