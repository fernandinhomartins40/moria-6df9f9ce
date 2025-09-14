// ========================================
// CONFIGURAÇÃO KNEX.JS - MORIA BACKEND
// Configuração para SQLite3 com suporte a desenvolvimento e produção
// ========================================

const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, process.env.DATABASE_PATH || './database/moria.sqlite')
    },
    migrations: {
      directory: path.resolve(__dirname, './migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.resolve(__dirname, './seeds')
    },
    useNullAsDefault: true,
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, process.env.DATABASE_PATH || './database/moria.sqlite')
    },
    migrations: {
      directory: path.resolve(__dirname, './migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.resolve(__dirname, './seeds')
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 20,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    }
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    migrations: {
      directory: path.resolve(__dirname, './migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.resolve(__dirname, './seeds')
    },
    useNullAsDefault: true
  }
};

module.exports = config;