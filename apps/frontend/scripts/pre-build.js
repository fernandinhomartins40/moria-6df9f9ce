#!/usr/bin/env node

/**
 * Script executado ANTES do build
 * Valida que as variáveis de ambiente estão corretas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function preBuild() {
  log(COLORS.blue, '\n🔍 Verificando configurações antes do build...\n');

  const mode = process.env.npm_lifecycle_event || 'unknown';
  const isProduction = mode === 'build' || process.env.NODE_ENV === 'production';

  log(COLORS.blue, `   Modo detectado: ${mode}`);
  log(COLORS.blue, `   Ambiente: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}\n`);

  if (isProduction) {
    // Validar .env.production para build de produção
    const envProductionPath = path.join(__dirname, '..', '.env.production');

    if (!fs.existsSync(envProductionPath)) {
      log(COLORS.red, '❌ ERRO: .env.production não encontrado!');
      log(COLORS.yellow, '\nO build de produção requer um arquivo .env.production com:');
      log(COLORS.yellow, '  VITE_API_BASE_URL=/api');
      log(COLORS.yellow, '  VITE_APP_ENV=production');
      log(COLORS.yellow, '  VITE_APP_VERSION=1.0.0\n');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envProductionPath, 'utf-8');

    // Validar variáveis críticas
    const requiredVars = {
      'VITE_API_BASE_URL': '/api',
      'VITE_APP_ENV': 'production',
    };

    const errors = [];
    for (const [varName, expectedValue] of Object.entries(requiredVars)) {
      const regex = new RegExp(`${varName}\\s*=\\s*${expectedValue.replace('/', '\\/')}`);
      if (!regex.test(envContent)) {
        errors.push(`${varName} não está configurado como "${expectedValue}"`);
      }
    }

    if (errors.length > 0) {
      log(COLORS.red, '❌ ERROS no .env.production:');
      errors.forEach(e => log(COLORS.red, `   - ${e}`));
      console.log('');
      process.exit(1);
    }

    log(COLORS.green, '✅ .env.production validado com sucesso!');
  } else {
    // Build de desenvolvimento - verificar .env
    const envPath = path.join(__dirname, '..', '.env');

    if (fs.existsSync(envPath)) {
      log(COLORS.green, '✅ .env encontrado para desenvolvimento');
    } else {
      log(COLORS.yellow, '⚠️  .env não encontrado. Usando valores padrão.');
    }
  }

  log(COLORS.green, '✅ Pré-validação concluída. Iniciando build...\n');
}

preBuild();
