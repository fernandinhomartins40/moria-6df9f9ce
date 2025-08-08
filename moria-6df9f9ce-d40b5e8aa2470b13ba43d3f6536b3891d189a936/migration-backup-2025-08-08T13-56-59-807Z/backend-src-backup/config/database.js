// ============================================
// DATABASE CONFIG - SQLite Single-Tenant
// ============================================

const { PrismaClient } = require('@prisma/client');

// Configuração otimizada para SQLite
const prisma = new PrismaClient({
  log: process.env.ENABLE_QUERY_LOGS === 'true' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  errorFormat: 'pretty',
});

// ============================================
// OTIMIZAÇÕES SQLite para Performance
// ============================================

async function optimizeSQLite() {
  try {
    // WAL mode para melhor concorrência
    await prisma.$queryRaw`PRAGMA journal_mode=WAL`;
    
    // Sincronização normal (balance performance/safety)  
    await prisma.$queryRaw`PRAGMA synchronous=NORMAL`;
    
    // Cache size otimizado (8MB)
    await prisma.$queryRaw`PRAGMA cache_size=-8000`;
    
    // Timeout para locks (5 segundos)
    await prisma.$queryRaw`PRAGMA busy_timeout=5000`;
    
    // Foreign keys habilitadas
    await prisma.$queryRaw`PRAGMA foreign_keys=ON`;
    
    console.log('✅ SQLite otimizado para performance');
  } catch (error) {
    console.error('❌ Erro ao otimizar SQLite:', error.message);
  }
}

// ============================================
// HEALTH CHECK do Banco
// ============================================

async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1 as health`;
    return { status: 'connected', database: 'SQLite' };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
}

// ============================================
// CONEXÃO e SETUP
// ============================================

async function connectDatabase() {
  try {
    // Conectar ao banco
    await prisma.$connect();
    console.log('🔗 Conectado ao SQLite');
    
    // Aplicar otimizações
    await optimizeSQLite();
    
    return prisma;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
    process.exit(1);
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('beforeExit', async () => {
  console.log('🔌 Desconectando do banco de dados...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('🔌 Desconectando do banco de dados...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔌 Desconectando do banco de dados...');
  await prisma.$disconnect();
  process.exit(0);
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
  prisma,
  connectDatabase,
  healthCheck,
  optimizeSQLite
};