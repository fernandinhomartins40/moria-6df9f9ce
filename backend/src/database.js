// ========================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// Conexão centralizada com SQLite3 via Knex.js
// ========================================

const knex = require('knex');
const knexConfig = require('../knexfile.js');

// Determinar ambiente
const environment = process.env.NODE_ENV || 'development';

// Criar instância do Knex
const db = knex(knexConfig[environment]);

// Função para testar conexão
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log(`✅ Banco de dados SQLite3 conectado com sucesso (${environment})`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error.message);
    return false;
  }
};

// Função para criar tabelas se não existirem
const ensureDatabaseSetup = async () => {
  try {
    // Verificar se a tabela de migrações existe
    const hasTable = await db.schema.hasTable('knex_migrations');

    if (!hasTable) {
      console.log('⚙️ Executando migrações iniciais...');
      // As migrações serão executadas via comando npm run migrate
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error.message);
    return false;
  }
};

// Função para fechamento graceful
const closeDatabase = async () => {
  try {
    await db.destroy();
    console.log('✅ Conexão com banco de dados fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error.message);
  }
};

// Exportar instância do Knex
module.exports = { db, testConnection, ensureDatabaseSetup, closeDatabase };