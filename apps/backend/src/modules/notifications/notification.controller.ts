import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service.js';
import { NotificationRecipientType } from '@prisma/client';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // ==================== ADMIN NOTIFICATIONS ====================

  getAdminNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).admin?.id;

      if (!adminId) {
        res.status(401).json({ error: 'Admin não autenticado' });
        return;
      }

      const { unreadOnly, limit } = req.query;

      const notifications = await this.notificationService.getByRecipient(
        adminId,
        'ADMIN' as NotificationRecipientType,
        {
          unreadOnly: unreadOnly === 'true',
          limit: limit ? parseInt(limit as string) : undefined,
        }
      );

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  };

  getAdminUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).admin?.id;

      if (!adminId) {
        res.status(401).json({ error: 'Admin não autenticado' });
        return;
      }

      const count = await this.notificationService.countUnread(
        adminId,
        'ADMIN' as NotificationRecipientType
      );

      res.json({ count });
    } catch (error) {
      next(error);
    }
  };

  markAdminNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const notification = await this.notificationService.markAsRead(id);

      res.json(notification);
    } catch (error) {
      next(error);
    }
  };

  markAllAdminNotificationsAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).admin?.id;

      if (!adminId) {
        res.status(401).json({ error: 'Admin não autenticado' });
        return;
      }

      await this.notificationService.markAllAsRead(
        adminId,
        'ADMIN' as NotificationRecipientType
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  // ==================== CUSTOMER NOTIFICATIONS ====================

  getCustomerNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      const { unreadOnly, limit } = req.query;

      const notifications = await this.notificationService.getByRecipient(
        customerId,
        'CUSTOMER' as NotificationRecipientType,
        {
          unreadOnly: unreadOnly === 'true',
          limit: limit ? parseInt(limit as string) : undefined,
        }
      );

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  };

  getCustomerUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      const count = await this.notificationService.countUnread(
        customerId,
        'CUSTOMER' as NotificationRecipientType
      );

      res.json({ count });
    } catch (error) {
      next(error);
    }
  };

  markCustomerNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const notification = await this.notificationService.markAsRead(id);

      res.json(notification);
    } catch (error) {
      next(error);
    }
  };

  markAllCustomerNotificationsAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).customer?.id;

      if (!customerId) {
        res.status(401).json({ error: 'Cliente não autenticado' });
        return;
      }

      await this.notificationService.markAllAsRead(
        customerId,
        'CUSTOMER' as NotificationRecipientType
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
