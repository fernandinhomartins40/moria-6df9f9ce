import { logger } from '@shared/utils/logger.util.js';

/**
 * Valida variáveis de ambiente críticas no startup
 * Previne deploy com configurações incorretas
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações críticas (impedem startup)
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL não está definida');
  }

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET não está definida');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres');
  }

  if (!process.env.PORT) {
    errors.push('PORT não está definida');
  }

  // Validações de produção (impedem deploy em prod)
  if (process.env.NODE_ENV === 'production') {
    // JWT Secret de desenvolvimento em produção
    if (process.env.JWT_SECRET?.includes('dev_2024')) {
      errors.push('⚠️ JWT_SECRET de desenvolvimento sendo usado em PRODUÇÃO! Altere imediatamente.');
    }

    // Database password fraca em produção
    if (process.env.DATABASE_URL?.includes('postgres:postgres')) {
      errors.push('⚠️ Credenciais de database padrão em PRODUÇÃO! Altere imediatamente.');
    }

    // CORS não configurado
    if (!process.env.CORS_ORIGIN) {
      warnings.push('CORS_ORIGIN não está definida em produção. Requisições podem falhar.');
    }

    // Log level inadequado
    if (process.env.LOG_LEVEL === 'debug') {
      warnings.push('LOG_LEVEL está em "debug" em produção. Considere usar "info" ou "warn".');
    }
  }

  // Avisos (não impedem startup)
  if (!process.env.CORS_ORIGIN) {
    warnings.push('CORS_ORIGIN não está definida. Usando valor padrão.');
  }

  // Exibir resultados
  if (errors.length > 0) {
    logger.error('❌ ERROS DE CONFIGURAÇÃO DETECTADOS:');
    errors.forEach(error => logger.error(`  - ${error}`));
    logger.error('');
    logger.error('Corrija os erros acima antes de continuar.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    logger.warn('⚠️ AVISOS DE CONFIGURAÇÃO:');
    warnings.forEach(warning => logger.warn(`  - ${warning}`));
    logger.warn('');
  }

  // Sucesso
  logger.info('✅ Validação de variáveis de ambiente concluída com sucesso');
  logger.info(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`   Porta: ${process.env.PORT || '3001'}`);
  logger.info(`   CORS: ${process.env.CORS_ORIGIN || 'padrão'}`);
  logger.info('');
}
