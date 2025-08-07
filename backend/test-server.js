// Test server simples para identificar problema
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3082;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server funcionando!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server rodando em http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Erro ao iniciar servidor:', err);
});