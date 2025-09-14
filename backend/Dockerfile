# ============================================
# Dockerfile para Backend Node.js - Moria Peças & Serviços
# API REST com Express + SQLite3 + Knex
# ============================================

FROM node:20-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar package files para cache otimizado
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production --no-audit --no-fund --silent

# Copiar código fonte
COPY . .

# Criar diretório para banco de dados
RUN mkdir -p /app/database

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL=/app/database/database.sqlite

# Expor porta
EXPOSE 3001

# Labels para identificação
LABEL maintainer="Moria Peças & Serviços"
LABEL version="1.0.0"
LABEL description="Backend Node.js + Express + SQLite3"

# Comando de health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Comando para iniciar aplicação
CMD ["npm", "start"]