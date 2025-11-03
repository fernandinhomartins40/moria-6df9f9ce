import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
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

export function createApp(): Express {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // CORS
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

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
