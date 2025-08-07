# Dockerfile completo - Frontend + Backend SQLite
# Serve o frontend via Nginx e backend Node.js via proxy

# Estágio 1: Build do Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar package files do frontend
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Estágio 2: Preparar Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copiar package files do backend
COPY backend/package*.json ./

# Instalar dependências do backend incluindo Prisma
RUN npm ci

# Copiar código do backend
COPY backend/ .

# Gerar Prisma Client
RUN npx prisma generate

# Estágio 3: Runtime - Nginx + Node.js
FROM node:18-alpine AS runtime

# Instalar Nginx
RUN apk add --no-cache nginx

# Criar diretórios necessários
RUN mkdir -p /app/frontend /app/backend /run/nginx

# Copiar frontend buildado
COPY --from=frontend-builder /app/dist /app/frontend

# Copiar backend
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