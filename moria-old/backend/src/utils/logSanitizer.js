// ========================================
// LOG SANITIZER - MORIA BACKEND
// Sanitização de dados sensíveis em logs
// ========================================

class LogSanitizer {
  static sensitiveFields = [
    'password',
    'token',
    'authorization',
    'cookie',
    'x-api-key',
    'secret',
    'private_key',
    'credit_card',
    'ssn',
    'cpf',
    'jwt',
    'bearer',
    'refresh_token',
    'session_id',
    'csrf_token'
  ];

  static sanitize(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      if (this.sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else if (typeof value === 'string' && this.isJWT(value)) {
        // Detectar e sanitizar JWTs
        sanitized[key] = '[JWT_REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  static sanitizeRequest(req) {
    return {
      url: req.originalUrl,
      method: req.method,
      headers: this.sanitize(req.headers),
      body: this.sanitize(req.body),
      query: this.sanitize(req.query),
      params: req.params
    };
  }

  static sanitizeError(error) {
    const sanitized = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };

    // Sanitizar propriedades adicionais do erro
    Object.keys(error).forEach(key => {
      if (!['name', 'message', 'stack'].includes(key)) {
        sanitized[key] = this.sanitize(error[key]);
      }
    });

    return sanitized;
  }

  // Detectar se uma string é um JWT
  static isJWT(str) {
    if (typeof str !== 'string') return false;

    // JWT tem 3 partes separadas por pontos
    const parts = str.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  // Sanitizar logs de autenticação
  static sanitizeAuthLog(data) {
    const sanitized = this.sanitize(data);

    // Remover informações específicas de autenticação
    if (sanitized.email) {
      // Mascarar parte do email
      const [local, domain] = sanitized.email.split('@');
      if (local && domain) {
        sanitized.email = `${local.substring(0, 2)}***@${domain}`;
      }
    }

    return sanitized;
  }

  // Sanitizar logs de transações
  static sanitizeTransactionLog(data) {
    const sanitized = this.sanitize(data);

    // Mascarar números de cartão se existirem
    if (sanitized.card_number) {
      sanitized.card_number = `****-****-****-${sanitized.card_number.slice(-4)}`;
    }

    return sanitized;
  }
}

module.exports = LogSanitizer;