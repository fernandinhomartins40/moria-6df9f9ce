// ========================================
// PERFORMANCE MONITOR MIDDLEWARE - MORIA BACKEND
// Monitoramento de performance de requisições
// ========================================

const { logPerformance, debug } = require('../utils/logger');

function performanceMonitor(req, res, next) {
  const startTime = Date.now();
  const startUsage = process.cpuUsage();
  const startMemory = process.memoryUsage();

  // Interceptar fim da resposta
  res.on('finish', () => {
    const endTime = Date.now();
    const endUsage = process.cpuUsage(startUsage);
    const endMemory = process.memoryUsage();

    const metrics = {
      responseTime: endTime - startTime,
      cpuUser: endUsage.user / 1000, // microseconds to milliseconds
      cpuSystem: endUsage.system / 1000,
      memoryUsed: endMemory.heapUsed - startMemory.heapUsed,
      memoryTotal: endMemory.heapTotal,
      url: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode
    };

    // Log se performance for degradada
    if (metrics.responseTime > 1000) {
      logPerformance('slow_request', metrics.responseTime, metrics);
    }

    // Log métricas em debug
    debug('Request Metrics', metrics);
  });

  next();
}

module.exports = performanceMonitor;