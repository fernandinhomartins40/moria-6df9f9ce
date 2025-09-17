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

# ❌ REMOVIDO: npm prune estava removendo dependências do Prisma
# RUN npm prune --production

# ========================================
# STAGE: PRODUCTION
# ========================================
FROM node:18-alpine AS production

# Instalar dependências runtime + curl para health checks
RUN apk add --no-cache \
    sqlite \
    openssl \
    curl \
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

# ❌ REMOVIDO: Health check movido para docker-compose para evitar conflitos
# HEALTHCHECK definido apenas no docker-compose.yml

# ✅ Script de inicialização com DEBUG COMPLETO
CMD ["sh", "-c", "\
echo '🔍 === DEBUG CONTAINER STARTUP ===' && \
echo '📋 Verificando arquivos...' && \
ls -la /app/ && \
echo '📋 Verificando node modules...' && \
ls -la /app/node_modules/ | head -10 && \
echo '📋 Verificando prisma...' && \
ls -la /app/prisma/ && \
echo '📋 Tentando prisma db push...' && \
npx prisma db push --accept-data-loss && \
echo '📋 Tentando iniciar servidor...' && \
echo '📋 Variáveis de ambiente:' && \
echo PORT=$PORT && echo HOST=$HOST && echo NODE_ENV=$NODE_ENV && \
echo '🚀 Iniciando node server.js...' && \
node server.js"]