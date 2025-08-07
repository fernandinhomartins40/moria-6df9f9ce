// Debug server para identificar problema
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3081;

console.log('🔍 Iniciando servidor de debug...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL);

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  console.log('📥 Request recebido em /test');
  res.json({ message: 'Debug server funcionando!', timestamp: new Date().toISOString() });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('📥 Request recebido em /api/health');
  res.json({ 
    success: true, 
    message: 'Debug health check OK',
    timestamp: new Date().toISOString()
  });
});

// Test produtos
app.get('/api/products', (req, res) => {
  console.log('📥 Request recebido em /api/products');
  res.json({ 
    success: true,
    data: [
      { id: 1, name: 'Produto Teste', category: 'Teste', price: 10.0 }
    ]
  });
});

console.log('🚀 Tentando iniciar servidor na porta', PORT);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Servidor de debug iniciado com sucesso!');
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('📡 Test: http://localhost:' + PORT + '/test');
  console.log('❤️ Health: http://localhost:' + PORT + '/api/health');
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});