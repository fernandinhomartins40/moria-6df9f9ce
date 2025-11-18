#!/usr/bin/env node

/**
 * Script de validação do build do frontend
 * Garante que o build foi feito com as variáveis corretas
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

function validateBuild() {
  const errors = [];
  const warnings = [];
  const success = [];

  log(COLORS.blue, '\n🔍 Validando build do frontend...\n');

  // 1. Verificar se .env.production existe
  const envProductionPath = path.join(__dirname, '..', '.env.production');
  if (fs.existsSync(envProductionPath)) {
    success.push('✓ .env.production encontrado');

    // Ler e validar conteúdo
    const envContent = fs.readFileSync(envProductionPath, 'utf-8');

    if (envContent.includes('VITE_API_BASE_URL=/api')) {
      success.push('✓ VITE_API_BASE_URL configurado corretamente para produção (/api)');
    } else if (envContent.includes('VITE_API_BASE_URL')) {
      errors.push('✗ VITE_API_BASE_URL não está configurado como "/api" em .env.production');
    } else {
      errors.push('✗ VITE_API_BASE_URL não encontrado em .env.production');
    }

    if (envContent.includes('VITE_APP_ENV=production')) {
      success.push('✓ VITE_APP_ENV configurado como production');
    } else {
      warnings.push('⚠ VITE_APP_ENV não está configurado como "production"');
    }
  } else {
    errors.push('✗ .env.production NÃO encontrado');
  }

  // 2. Verificar se pasta dist existe
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    success.push('✓ Pasta dist/ existe');

    // 3. Verificar se index.html existe
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      success.push('✓ index.html encontrado');

      // Ler e validar conteúdo do index.html
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      // Verificar se tem os scripts
      if (indexContent.includes('type="module"') && indexContent.includes('/assets/')) {
        success.push('✓ index.html contém referências aos assets buildados');
      } else {
        errors.push('✗ index.html não contém referências corretas aos assets');
      }
    } else {
      errors.push('✗ index.html NÃO encontrado em dist/');
    }

    // 4. Verificar se pasta assets existe e tem arquivos
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath);
      const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
      const cssFiles = assetFiles.filter(f => f.endsWith('.css'));

      if (jsFiles.length > 0) {
        success.push(`✓ ${jsFiles.length} arquivo(s) JavaScript encontrado(s)`);
      } else {
        errors.push('✗ Nenhum arquivo JavaScript encontrado em dist/assets/');
      }

      if (cssFiles.length > 0) {
        success.push(`✓ ${cssFiles.length} arquivo(s) CSS encontrado(s)`);
      } else {
        warnings.push('⚠ Nenhum arquivo CSS encontrado em dist/assets/');
      }

      // Verificar se arquivos têm hash (cache busting)
      const hashedFiles = assetFiles.filter(f => /\.[a-zA-Z0-9]{8}\.(js|css)$/.test(f));
      if (hashedFiles.length > 0) {
        success.push(`✓ ${hashedFiles.length} arquivo(s) com hash para cache-busting`);
      } else {
        warnings.push('⚠ Arquivos sem hash podem causar problemas de cache');
      }
    } else {
      errors.push('✗ Pasta assets/ NÃO encontrada em dist/');
    }

    // 5. Verificar assets públicos (logo, favicon, etc)
    const publicAssets = ['logo_moria.png', 'favicon.ico'];
    publicAssets.forEach(asset => {
      if (fs.existsSync(path.join(distPath, asset))) {
        success.push(`✓ Asset público encontrado: ${asset}`);
      } else {
        warnings.push(`⚠ Asset público não encontrado: ${asset}`);
      }
    });

  } else {
    errors.push('✗ Pasta dist/ NÃO EXISTE. Execute "npm run build" primeiro.');
  }

  // Exibir resultados
  console.log('');
  if (success.length > 0) {
    log(COLORS.green, '✅ SUCESSOS:');
    success.forEach(s => log(COLORS.green, `   ${s}`));
    console.log('');
  }

  if (warnings.length > 0) {
    log(COLORS.yellow, '⚠️  AVISOS:');
    warnings.forEach(w => log(COLORS.yellow, `   ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    log(COLORS.red, '❌ ERROS:');
    errors.forEach(e => log(COLORS.red, `   ${e}`));
    console.log('');
    log(COLORS.red, 'Corrija os erros antes de fazer deploy!');
    process.exit(1);
  }

  log(COLORS.green, '✅ Build validado com sucesso! Pronto para deploy.\n');
}

validateBuild();
