// Validação robusta de environment - Sistema Single-Tenant Moria
require('dotenv').config();

const requiredEnvVars = [
  { name: 'DATABASE_URL', type: 'string', required: true },
  { name: 'PORT', type: 'number', default: 3081 },
  { name: 'NODE_ENV', type: 'string', default: 'development' },
  { name: 'APP_NAME', type: 'string', default: 'Moria Backend' },
  { name: 'CLIENT_NAME', type: 'string', default: 'Desenvolvimento' },
  { name: 'LOG_LEVEL', type: 'string', default: 'info' }
];

const validateEnvironment = () => {
  const errors = [];
  const config = {};
  
  console.log('🔍 Validando configurações de environment...');
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar.name];
    
    if (envVar.required && !value) {
      errors.push(`❌ ERRO CRÍTICO: ${envVar.name} é obrigatória mas não foi encontrada`);
      return;
    }
    
    let processedValue = value || envVar.default;
    
    // Conversão de tipo
    if (envVar.type === 'number' && processedValue) {
      processedValue = parseInt(processedValue, 10);
      if (isNaN(processedValue)) {
        errors.push(`❌ ${envVar.name} deve ser um número válido`);
        return;
      }
    }
    
    // Armazenar no config com key normalizada
    const configKey = envVar.name.toLowerCase().replace('_', '');
    config[configKey] = processedValue;
    
    console.log(`  ✅ ${envVar.name}: ${envVar.type === 'string' && envVar.name.includes('URL') ? '[REDACTED]' : processedValue}`);
  });
  
  // Validações específicas
  if (config.nodeenv === 'production' && !process.env.ALLOWED_ORIGIN) {
    console.warn('⚠️ ATENÇÃO: ALLOWED_ORIGIN não definido em produção, usando padrão');
  }
  
  if (errors.length > 0) {
    console.error('🚨 FALHA NA VALIDAÇÃO DE ENVIRONMENT:');
    errors.forEach(error => console.error(error));
    console.error('📋 Verifique o arquivo .env e as variáveis de sistema');
    console.error('📋 Exemplo de .env necessário:');
    console.error('  DATABASE_URL="file:./prisma/database.db"');
    console.error('  PORT=3081');
    console.error('  NODE_ENV=development');
    process.exit(1);
  }
  
  console.log('✅ Configurações de environment validadas com sucesso');
  
  // Adicionar configurações derivadas
  config.isDevelopment = config.nodeenv === 'development';
  config.isProduction = config.nodeenv === 'production';
  config.corsOrigin = config.nodeenv === 'development' 
    ? ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080']
    : process.env.ALLOWED_ORIGIN || 'https://yourdomain.com';
  
  return config;
};

module.exports = validateEnvironment();