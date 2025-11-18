import { createApp } from './app.js';
import { environment } from '@config/environment.js';
import { connectDatabase, disconnectDatabase } from '@config/database.js';
import { logger } from '@shared/utils/logger.util.js';
import { validateEnvironment } from '@config/validate-env.js';

async function bootstrap(): Promise<void> {
  try {
    // Validate environment variables first
    validateEnvironment();

    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(environment.port, () => {
      logger.info(`🚀 Server running on port ${environment.port}`);
      logger.info(`📝 Environment: ${environment.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${environment.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received, starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

