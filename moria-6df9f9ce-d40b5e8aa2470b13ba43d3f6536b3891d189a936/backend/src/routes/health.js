// Health checks robustos - Sistema de monitoramento
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// Health check básico
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      service: 'moria-backend'
    };

    // Verificar conexão com banco se disponível
    try {
      if (global.prisma) {
        await global.prisma.$queryRaw`SELECT 1`;
        healthData.database = {
          status: 'connected',
          responseTime: Date.now() - startTime
        };
      } else {
        // Tentar conectar se não estiver global
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$queryRaw`SELECT 1`;
        await prisma.$disconnect();
        
        healthData.database = {
          status: 'connected',
          responseTime: Date.now() - startTime
        };
      }
    } catch (dbError) {
      healthData.database = {
        status: 'disconnected',
        error: dbError.message
      };
      healthData.status = 'degraded';
    }

    logger.systemEvent('health_check', healthData);
    res.json(healthData);
    
  } catch (error) {
    logger.error('Health check failed', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: Math.floor(process.uptime())
    });
  }
});

// Health check detalhado
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // 1. Verificar sistema
    healthData.checks.system = {
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      cpu: {
        usage: process.cpuUsage()
      }
    };

    // 2. Verificar banco de dados
    const dbStartTime = Date.now();
    try {
      if (global.prisma) {
        await global.prisma.$queryRaw`SELECT 1`;
        
        // Contagem rápida de registros
        const [products, services, promotions] = await Promise.all([
          global.prisma.product.count(),
          global.prisma.service.count(), 
          global.prisma.promotion.count()
        ]);
        
        healthData.checks.database = {
          status: 'healthy',
          responseTime: Date.now() - dbStartTime,
          records: { products, services, promotions }
        };
      }
    } catch (dbError) {
      healthData.checks.database = {
        status: 'unhealthy',
        error: dbError.message,
        responseTime: Date.now() - dbStartTime
      };
      healthData.status = 'degraded';
    }

    // 3. Verificar sistema de arquivos
    try {
      const dbPath = path.join(__dirname, '../../../prisma/database.db');
      const stats = fs.statSync(dbPath);
      
      healthData.checks.filesystem = {
        status: 'healthy',
        database: {
          size: Math.round(stats.size / 1024), // KB
          lastModified: stats.mtime.toISOString()
        }
      };
    } catch (fsError) {
      healthData.checks.filesystem = {
        status: 'degraded',
        error: fsError.message
      };
    }

    // 4. Verificar logs
    try {
      const logsDir = path.join(__dirname, '../../../logs');
      const logFiles = fs.readdirSync(logsDir);
      
      healthData.checks.logging = {
        status: 'healthy',
        files: logFiles.length,
        directory: logsDir
      };
    } catch (logError) {
      healthData.checks.logging = {
        status: 'degraded',
        error: logError.message
      };
    }

    // Determinar status geral
    const hasUnhealthy = Object.values(healthData.checks).some(check => check.status === 'unhealthy');
    const hasDegraded = Object.values(healthData.checks).some(check => check.status === 'degraded');
    
    if (hasUnhealthy) {
      healthData.status = 'unhealthy';
    } else if (hasDegraded) {
      healthData.status = 'degraded';
    }

    healthData.responseTime = Date.now() - startTime;

    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;

    logger.systemEvent('detailed_health_check', healthData);
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    logger.error('Detailed health check failed', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
});

// Readiness check (para Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  try {
    // Verificar se banco está acessível
    if (global.prisma) {
      await global.prisma.$queryRaw`SELECT 1`;
    }
    
    logger.systemEvent('readiness_check', { status: 'ready' });
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
    
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({ 
      status: 'not_ready', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Liveness check (para Kubernetes/Docker)
router.get('/live', (req, res) => {
  logger.systemEvent('liveness_check', { status: 'alive' });
  res.json({ 
    status: 'alive', 
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;