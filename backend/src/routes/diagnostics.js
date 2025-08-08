// Sistema de diagnósticos e debugging
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// Apenas em desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

if (!isDevelopment) {
  router.use((req, res) => {
    res.status(403).json({
      success: false,
      error: 'Diagnósticos disponíveis apenas em desenvolvimento'
    });
  });
}

// Informações do sistema
router.get('/system', (req, res) => {
  if (!isDevelopment) return;
  
  const systemInfo = {
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      pid: process.pid
    },
    memory: process.memoryUsage(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? '[DEFINED]' : '[NOT DEFINED]',
      PORT: process.env.PORT,
      LOG_LEVEL: process.env.LOG_LEVEL
    },
    features: {
      prismaConnected: !!global.prisma,
      logsDirectory: fs.existsSync(path.join(__dirname, '../../../logs'))
    }
  };
  
  logger.systemEvent('diagnostics_system_info_requested');
  res.json({ success: true, data: systemInfo });
});

// Informações do banco de dados
router.get('/database', async (req, res) => {
  if (!isDevelopment) return;
  
  try {
    if (!global.prisma) {
      return res.json({
        success: false,
        error: 'Prisma client não inicializado'
      });
    }

    const dbInfo = {
      connection: 'active',
      tables: {}
    };

    // Contar registros em cada tabela
    try {
      const [products, services, promotions, orders, orderItems, coupons] = await Promise.all([
        global.prisma.product.count(),
        global.prisma.service.count(),
        global.prisma.promotion.count(),
        global.prisma.order.count(),
        global.prisma.orderItem.count(),
        global.prisma.coupon.count()
      ]);

      dbInfo.tables = {
        products: { count: products },
        services: { count: services },
        promotions: { count: promotions },
        orders: { count: orders },
        orderItems: { count: orderItems },
        coupons: { count: coupons }
      };

      // Dados públicos disponíveis
      const [publicProducts, publicServices, publicPromotions] = await Promise.all([
        global.prisma.product.count({ where: { isPublic: true, isActive: true } }),
        global.prisma.service.count({ where: { isPublic: true, isActive: true } }),
        global.prisma.promotion.count({ where: { isPublic: true, isActive: true } })
      ]);

      dbInfo.publicData = {
        products: publicProducts,
        services: publicServices,
        promotions: publicPromotions
      };

    } catch (countError) {
      dbInfo.error = countError.message;
    }

    logger.systemEvent('diagnostics_database_info_requested');
    res.json({ success: true, data: dbInfo });
    
  } catch (error) {
    logger.error('Database diagnostics failed', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Logs recentes
router.get('/logs/:type?', (req, res) => {
  if (!isDevelopment) return;
  
  const logType = req.params.type || 'combined';
  const lines = parseInt(req.query.lines) || 50;
  
  try {
    const logFile = path.join(__dirname, '../../../logs', `${logType}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.json({
        success: false,
        error: `Log file ${logType}.log não encontrado`
      });
    }

    const logContent = fs.readFileSync(logFile, 'utf8');
    const logLines = logContent.split('\n').slice(-lines).filter(line => line.trim());
    
    res.json({
      success: true,
      data: {
        file: `${logType}.log`,
        lines: logLines.length,
        content: logLines
      }
    });
    
  } catch (error) {
    logger.error('Log diagnostics failed', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Teste de API pública
router.get('/test-public-apis', async (req, res) => {
  if (!isDevelopment) return;
  
  try {
    const tests = {
      health: null,
      products: null,
      services: null,
      promotions: null
    };

    const baseUrl = `http://localhost:${process.env.PORT || 3081}`;

    // Testar health
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      tests.health = {
        status: healthResponse.status,
        ok: healthResponse.ok
      };
    } catch (err) {
      tests.health = { error: err.message };
    }

    // Testar produtos públicos
    try {
      const productsResponse = await fetch(`${baseUrl}/api/public/products?limit=1`);
      const productsData = await productsResponse.json();
      tests.products = {
        status: productsResponse.status,
        ok: productsResponse.ok,
        dataCount: productsData.data?.length || 0
      };
    } catch (err) {
      tests.products = { error: err.message };
    }

    // Testar serviços públicos
    try {
      const servicesResponse = await fetch(`${baseUrl}/api/public/services?limit=1`);
      const servicesData = await servicesResponse.json();
      tests.services = {
        status: servicesResponse.status,
        ok: servicesResponse.ok,
        dataCount: servicesData.data?.length || 0
      };
    } catch (err) {
      tests.services = { error: err.message };
    }

    // Testar promoções públicas
    try {
      const promotionsResponse = await fetch(`${baseUrl}/api/public/promotions`);
      const promotionsData = await promotionsResponse.json();
      tests.promotions = {
        status: promotionsResponse.status,
        ok: promotionsResponse.ok,
        dataCount: promotionsData.data?.length || 0
      };
    } catch (err) {
      tests.promotions = { error: err.message };
    }

    logger.systemEvent('diagnostics_api_test_completed', tests);
    res.json({ success: true, data: tests });
    
  } catch (error) {
    logger.error('API test diagnostics failed', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Limpar logs (útil para debugging)
router.post('/clear-logs', (req, res) => {
  if (!isDevelopment) return;
  
  try {
    const logsDir = path.join(__dirname, '../../../logs');
    const logFiles = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
    
    logFiles.forEach(file => {
      const filePath = path.join(logsDir, file);
      fs.writeFileSync(filePath, ''); // Limpar arquivo
    });
    
    logger.systemEvent('diagnostics_logs_cleared', { files: logFiles });
    res.json({
      success: true,
      message: `${logFiles.length} arquivos de log limpos`,
      files: logFiles
    });
    
  } catch (error) {
    logger.error('Clear logs failed', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;