# Dockerfile otimizado - Usa builds já prontos
# Frontend (dist/) e Backend já processados pelo GitHub Actions

# Estágio 1: Preparar Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copiar package files do backend
COPY backend/package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev

# Copiar código do backend
COPY backend/ .

# Gerar Prisma Client
RUN npx prisma generate

# Estágio 2: Runtime - Nginx + Node.js
FROM node:18-alpine AS runtime

# Instalar Nginx
RUN apk add --no-cache nginx

# Criar diretórios necessários
RUN mkdir -p /app/frontend /app/backend /run/nginx

# Copiar frontend já buildado (dist/)
COPY dist/ /app/frontend/

# Copiar backend preparado
COPY --from=backend-builder /app/backend /app/backend

# Configurar Nginx
COPY nginx-full.conf /etc/nginx/nginx.conf

# Script de inicialização
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

WORKDIR /app/backend

# Criar banco SQLite e popular dados
RUN npx prisma migrate deploy && \
    npx prisma db seed || echo "Seed executado ou dados já existem"

# Expor portas
EXPOSE 80

# Iniciar com script que roda Nginx + Backend
ENTRYPOINT ["/docker-entrypoint.sh"]