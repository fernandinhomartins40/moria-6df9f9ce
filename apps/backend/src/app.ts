import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import { corsOptions } from '@config/cors.js';
import { ErrorMiddleware } from '@middlewares/error.middleware.js';
import { logger } from '@shared/utils/logger.util.js';
import authRoutes from '@modules/auth/auth.routes.js';
import addressesRoutes from '@modules/addresses/addresses.routes.js';
import productsRoutes from '@modules/products/products.routes.js';
import servicesRoutes from '@modules/services/services.routes.js';
import vehiclesRoutes from '@modules/vehicles/vehicles.routes.js';
import compatibilityRoutes from '@modules/compatibility/compatibility.routes.js';
import ordersRoutes from '@modules/orders/orders.routes.js';
import promotionsRoutes from '@modules/promotions/promotions.routes.js';
import couponsRoutes from '@modules/coupons/coupons.routes.js';
import favoritesRoutes from '@modules/favorites/favorites.routes.js';
import customerVehiclesRoutes from '@modules/customer-vehicles/customer-vehicles.routes.js';
import checklistRoutes from '@modules/checklist/checklist.routes.js';
import revisionsRoutes from '@modules/revisions/revisions.routes.js';
import customerRevisionsRoutes from '@modules/revisions/customer-revisions.routes.js';
import adminRoutes from '@modules/admin/admin.routes.js';
import landingRoutes from '@modules/landing/landing.routes.js';
import uploadsRoutes from '@modules/uploads/uploads.routes.js';
import loyaltyRoutes from '@modules/loyalty/loyalty.routes.js';
import loyaltyAdminRoutes from '@modules/loyalty/loyalty-admin.routes.js';
import shippingRoutes from '@modules/shipping/shipping.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // CORS
  app.use(cors(corsOptions));

  // Cookie parsing
  app.use(cookieParser());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Serve static files from uploads directory
  const uploadsPath = path.join(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes - Fase 1
  app.use('/auth', authRoutes);
  app.use('/addresses', addressesRoutes);

  // API Routes - Fase 2
  app.use('/products', productsRoutes);
  app.use('/services', servicesRoutes);
  app.use('/vehicles', vehiclesRoutes);
  app.use('/compatibility', compatibilityRoutes);

  // API Routes - Fase 3
  app.use('/orders', ordersRoutes);
  app.use('/promotions', promotionsRoutes);
  app.use('/coupons', couponsRoutes);
  app.use('/favorites', favoritesRoutes);

  // API Routes - Fase 4
  app.use('/customer-vehicles', customerVehiclesRoutes);
  app.use('/checklist', checklistRoutes);
  app.use('/revisions', revisionsRoutes);
  app.use('/customer-revisions', customerRevisionsRoutes);

  // API Routes - Fase 5: Loyalty Program
  app.use('/loyalty', loyaltyRoutes);
  app.use('/admin/loyalty', loyaltyAdminRoutes);

  // Shipping Routes
  app.use('/shipping', shippingRoutes);

  // Admin Routes
  app.use('/admin', adminRoutes);

  // Public Landing Page Routes
  app.use('/landing', landingRoutes);

  // Upload Routes
  app.use('/uploads', uploadsRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  // Error handling middleware (must be last)
  app.use(ErrorMiddleware.handle);

  return app;
}
