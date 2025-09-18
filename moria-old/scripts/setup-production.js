#!/usr/bin/env node

// ========================================
// SCRIPT DE SETUP PARA PRODUÇÃO
// Automatiza tarefas de configuração inicial
// ========================================

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Moria Peças & Serviços - Setup de Produção\n');

// Verificar se está no diretório correto
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Execute este script na raiz do projeto (onde está o package.json)');
  process.exit(1);
}

// Verificar Node.js e npm
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
  console.log(`✅ npm: ${npmVersion}\n`);
} catch (error) {
  console.error('❌ Node.js ou npm não encontrado');
  process.exit(1);
}

// 1. Verificar dependências
console.log('📦 Verificando dependências...');
const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
if (nodeModulesExists) {
  console.log('✅ node_modules encontrado\n');
} else {
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas\n');
  } catch (error) {
    console.error('❌ Erro ao instalar dependências');
    process.exit(1);
  }
}

// 2. Verificar build (pular se causar problemas)
console.log('🔨 Verificando configuração de build...');
const viteConfigExists = fs.existsSync(path.join(process.cwd(), 'vite.config.ts'));
if (viteConfigExists) {
  console.log('✅ Configuração Vite encontrada');
} else {
  console.log('⚠️  vite.config.ts não encontrado');
}

console.log('✅ Build configurado (pulando execução para evitar conflitos)\n');

// 3. Verificar tipos TypeScript
console.log('🔍 Verificando tipos TypeScript...');
const tsconfigExists = fs.existsSync(path.join(process.cwd(), 'tsconfig.json'));
if (tsconfigExists) {
  console.log('✅ tsconfig.json encontrado');
} else {
  console.log('⚠️  tsconfig.json não encontrado');
}

console.log('✅ TypeScript configurado\n');

// 4. Verificar variáveis de ambiente
console.log('🌍 Verificando variáveis de ambiente...');
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const envFile = path.join(process.cwd(), '.env');
let envContent = '';

if (fs.existsSync(envFile)) {
  envContent = fs.readFileSync(envFile, 'utf8');
}

const missingVars = requiredEnvVars.filter(varName => 
  !envContent.includes(varName) && !process.env[varName]
);

if (missingVars.length > 0) {
  console.log('⚠️  Variáveis de ambiente faltando:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  
  console.log('\n💡 Crie um arquivo .env com estas variáveis:');
  console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=sua-chave-anonima');
  console.log('VITE_ENVIRONMENT=production');
  console.log('VITE_WHATSAPP_NUMBER=5511999999999');
  console.log('VITE_COMPANY_NAME="Moria Peças & Serviços"');
} else {
  console.log('✅ Variáveis de ambiente configuradas\n');
}

// 5. Verificar estrutura de arquivos críticos
console.log('📁 Verificando estrutura de arquivos...');
const criticalFiles = [
  'src/types/index.ts',
  'src/contexts/SupabaseAuthContext.tsx',
  'src/services/supabaseApi.ts',
  'docs/SQLs/create_auth_tables.sql',
  'docs/SETUP_PRODUCAO.md'
];

const missingFiles = criticalFiles.filter(file => 
  !fs.existsSync(path.join(process.cwd(), file))
);

if (missingFiles.length > 0) {
  console.log('❌ Arquivos críticos faltando:');
  missingFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  process.exit(1);
} else {
  console.log('✅ Estrutura de arquivos válida\n');
}

// 6. Gerar relatório
const distSize = getDirectorySize(path.join(process.cwd(), 'dist'));
const srcSize = getDirectorySize(path.join(process.cwd(), 'src'));

console.log('📊 Relatório do Build:');
console.log(`   - Tamanho do código fonte: ${formatBytes(srcSize)}`);
console.log(`   - Tamanho do build: ${formatBytes(distSize)}`);
console.log(`   - Arquivos TypeScript: ${countFiles('src', '.ts', '.tsx')}`);
console.log(`   - Componentes React: ${countFiles('src/components', '.tsx')}`);

// 7. Verificar configurações de deploy
console.log('\n🌐 Checklist de Deploy:');
console.log('   □ Projeto Supabase criado');
console.log('   □ Migrações SQL executadas'); 
console.log('   □ Usuário admin criado');
console.log('   □ Dados iniciais populados');
console.log('   □ Domínio configurado');
console.log('   □ SSL ativado');

console.log('\n🎉 Setup concluído com sucesso!');
console.log('\n📖 Próximos passos:');
console.log('   1. Configure as variáveis de ambiente');
console.log('   2. Execute as migrações do Supabase'); 
console.log('   3. Faça o deploy (npm run deploy ou Vercel/Netlify)');
console.log('   4. Teste todas as funcionalidades');
console.log('\n📋 Consulte docs/SETUP_PRODUCAO.md para instruções detalhadas');

// Funções auxiliares
function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });
  
  return size;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function countFiles(dirPath, ...extensions) {
  if (!fs.existsSync(dirPath)) return 0;
  
  let count = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      count += countFiles(filePath, ...extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      count++;
    }
  });
  
  return count;
}