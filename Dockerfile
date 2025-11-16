# Multi-stage Dockerfile for Moria Application
# Stage 1: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /build

# Copy root package files
COPY package*.json ./
COPY packages ./packages

# Copy backend files
COPY apps/backend/package*.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/src ./apps/backend/src

# Install dependencies (including devDependencies for build)
RUN npm install --workspace=apps/backend
RUN npm install --workspace=packages/types

# Generate Prisma Client
RUN cd apps/backend && npx prisma generate

# Build backend
RUN npm run build:backend

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy root package files
COPY package*.json ./
COPY packages ./packages

# Copy frontend files
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/frontend/tsconfig*.json ./apps/frontend/
COPY apps/frontend/vite.config.ts ./apps/frontend/
COPY apps/frontend/index.html ./apps/frontend/
COPY apps/frontend/public ./apps/frontend/public
COPY apps/frontend/src ./apps/frontend/src

# Install dependencies
RUN npm install --workspace=apps/frontend
RUN npm install --workspace=packages/types

# Build frontend (production mode)
RUN npm run build:frontend

# Stage 3: Production Runtime
FROM node:20-alpine

# Install OpenSSL 3, supervisor, curl for healthcheck, and postgresql-client
RUN apk add --no-cache supervisor curl postgresql-client openssl openssl-dev

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy packages
COPY packages ./packages

# Copy backend built files and package.json
COPY apps/backend/package*.json ./apps/backend/
COPY --from=backend-builder /build/apps/backend/dist ./apps/backend/dist
COPY --from=backend-builder /build/apps/backend/prisma ./apps/backend/prisma

# Copy frontend built files
COPY --from=frontend-builder /build/apps/frontend/dist ./apps/frontend/dist

# Install ONLY production dependencies
RUN npm install --production --workspace=apps/backend
RUN npm install --production --workspace=packages/types

# Create necessary directories with proper permissions BEFORE generating Prisma
RUN mkdir -p /app/node_modules/@prisma/engines && \
    chown -R node:node /app

# Generate Prisma Client in production node_modules with proper permissions
RUN cd apps/backend && npx prisma generate

# Create uploads directory
RUN mkdir -p /app/apps/backend/uploads && \
    chown -R node:node /app/apps/backend/uploads

# Create log directory with proper permissions
RUN mkdir -p /var/log && \
    touch /var/log/supervisord.log \
          /var/log/backend.stdout.log \
          /var/log/backend.stderr.log \
          /var/log/frontend.stdout.log \
          /var/log/frontend.stderr.log && \
    chown -R node:node /var/log

# Configure supervisor (run as node user, not root)
COPY <<EOF /etc/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisord.log
pidfile=/tmp/supervisord.pid

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock

[unix_http_server]
file=/tmp/supervisor.sock
chmod=0700

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[program:backend]
command=node dist/server.js
directory=/app/apps/backend
autostart=true
autorestart=true
stdout_logfile=/var/log/backend.stdout.log
stderr_logfile=/var/log/backend.stderr.log
environment=NODE_ENV=production

[program:frontend]
command=npx serve -s dist -l 8080
directory=/app/apps/frontend
autostart=true
autorestart=true
stdout_logfile=/var/log/frontend.stdout.log
stderr_logfile=/var/log/frontend.stderr.log
EOF

# Install serve globally for serving frontend
RUN npm install -g serve

# Expose port
EXPOSE 3090

# Create startup script
COPY <<'EOF' /app/startup.sh
#!/bin/sh
set -e

echo "=== Starting Moria Application ==="

# Wait for database
echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -U ${POSTGRES_USER:-moria}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Running database migrations..."
cd /app/apps/backend
npx prisma migrate deploy

echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
EOF

RUN chmod +x /app/startup.sh

USER node

CMD ["/app/startup.sh"]
