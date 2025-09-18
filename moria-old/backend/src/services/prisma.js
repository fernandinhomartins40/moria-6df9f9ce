// ========================================
// SERVIÇO PRISMA - MORIA BACKEND
// Substitui BaseModel.js (174 linhas) por 5 linhas!
// ✅ ELIMINA toda a complexidade de query building manual
// ========================================

const { PrismaClient } = require('@prisma/client');

// Instanciar cliente Prisma com configurações otimizadas
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['warn', 'error'],
  errorFormat: 'pretty'
});

// Middleware para logs e monitoramento (Prisma v5+ extension format)
if (process.env.NODE_ENV === 'development') {
  console.log('Prisma client initialized in development mode');
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;