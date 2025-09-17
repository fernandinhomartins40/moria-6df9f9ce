# ========================================
# DOCKERFILE BACKEND - MORIA PRISMA
# ✅ ELIMINA complexidades de build manual
# ✅ Otimizado para Prisma + SQLite
# ✅ Multi-stage build para produção
# ========================================

FROM node:18-alpine AS base

# Instalar dependências do sistema para Prisma + SQLite
RUN apk add --no-cache \
    sqlite \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar package files para cache de dependências
COPY package*.json ./
COPY prisma ./prisma/

# ========================================
# STAGE: DEPENDENCIES
# ========================================
FROM base AS deps

# Instalar dependências (incluindo dev para Prisma generate)
RUN npm ci --include=dev

# Gerar Prisma Client (necessário antes do build)
RUN npx prisma generate

# ========================================
# STAGE: BUILDER
# ========================================
FROM base AS builder

# Copiar node_modules do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Gerar Prisma Client para produção
RUN npx prisma generate

# Remover dependências de desenvolvimento
RUN npm prune --production

# ========================================
# STAGE: PRODUCTION
# ========================================
FROM node:18-alpine AS production

# Instalar apenas dependências runtime necessárias
RUN apk add --no-cache \
    sqlite \
    openssl \
    && rm -rf /var/cache/apk/*

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar arquivos de produção
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma/
COPY --from=builder --chown=nodejs:nodejs /app/src ./src/
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./server.js
# knexfile.js removido - usando apenas Prisma

# Criar diretórios necessários
RUN mkdir -p /app/data /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app/data /app/uploads /app/logs

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/moria.db

# Configurar usuário
USER nodejs

# Expor porta
EXPOSE 3001

# Health check com mais tempo para inicialização
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=5 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# ✅ Script de inicialização com logs de debug
CMD ["sh", "-c", "echo 'Iniciando Prisma generate...' && npx prisma generate && echo 'Fazendo DB push...' && npx prisma db push --accept-data-loss && echo 'Iniciando servidor...' && node server.js"]