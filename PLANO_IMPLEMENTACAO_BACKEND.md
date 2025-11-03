# Plano de Implementação do Backend - Moria Pesca e Serviços

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                    │
│                      Port 80/443                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/*      → http://backend:3001                    │   │
│  │ /*          → http://frontend:5173                   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────┬────────────────────────┬─────────────────────┘
               │                        │
               ▼                        ▼
┌──────────────────────────┐  ┌───────────────────────────────┐
│   Frontend Container     │  │    Backend Container          │
│   (React + Vite)         │  │    (Node.js + TypeScript)     │
│   Port: 5173             │  │    Port: 3001                 │
│                          │  │                               │
│   - React 18             │  │   - Express.js                │
│   - TypeScript           │  │   - TypeScript                │
│   - Vite                 │  │   - Prisma ORM                │
│   - TailwindCSS          │  │   - JWT Authentication        │
│   - ShadcN UI            │  │   - Bcrypt                    │
│                          │  │   - Zod Validation            │
└──────────────────────────┘  └─────────────┬─────────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────────┐
                              │   PostgreSQL Container        │
                              │   Port: 5432                  │
                              │                               │
                              │   - PostgreSQL 16             │
                              │   - Persistent Volume         │
                              │   - Database: moria_db        │
                              └───────────────────────────────┘
```

---

## Análise Completa da Aplicação Atual

### 1. Funcionalidades Identificadas

#### 1.1 Autenticação e Usuários
- **Login e Registro de Clientes**
- **Gerenciamento de Perfil**
- **Sistema de Níveis de Cliente** (BRONZE, SILVER, GOLD, PLATINUM)
- **Gerenciamento de Endereços**
- **Histórico de Compras**
- **Favoritos de Produtos**

#### 1.2 Catálogo de Produtos
- **Produtos com Especificações Técnicas Avançadas**
- **Categorias e Subcategorias**
- **Compatibilidade Veicular Detalhada**
- **Sistema de Filtros Avançados**
- **Busca por Especificações**
- **Imagens e Galeria**
- **Controle de Estoque**
- **Preços e Promoções**

#### 1.3 Serviços
- **Catálogo de Serviços**
- **Categorias de Serviços**
- **Tempo Estimado e Preços**
- **Especificações de Serviços**

#### 1.4 Carros e Veículos
- **Cadastro de Marcas**
- **Modelos e Variantes**
- **Especificações Técnicas de Veículos**
- **Motores e Transmissões**
- **Compatibilidade de Peças**

#### 1.5 Revisões Veiculares (Sistema Avançado)
- **Cadastro de Clientes Específico para Revisões**
- **Cadastro de Veículos dos Clientes**
- **Sistema de Checklist Customizável**
  - 10 Categorias Padrão (Freios, Suspensão, Motor, etc.)
  - Itens de Checklist por Categoria
  - Status de Verificação (OK, Atenção, Crítico, N/A)
  - Fotos e Anotações por Item
- **Gestão de Revisões**
  - Status: Draft, In Progress, Completed, Cancelled
  - Quilometragem
  - Recomendações
  - Histórico de Revisões por Veículo

#### 1.6 Sistema de Promoções Avançado
- **12 Tipos de Promoção**
  - PERCENTAGE, FIXED, BUY_ONE_GET_ONE, BUY_X_GET_Y
  - TIERED_DISCOUNT, CASHBACK, FREE_SHIPPING, BUNDLE_DISCOUNT
  - LOYALTY_POINTS, PROGRESSIVE_DISCOUNT, TIME_LIMITED_FLASH, QUANTITY_BASED, CATEGORY_COMBO
- **Segmentação de Clientes** (10+ segmentos)
- **Regras e Condições Complexas**
- **Agendamento e Recorrência**
- **Descontos Escalonados**
- **Analytics e Métricas**
- **Templates de Promoção**
- **Testes A/B**
- **Combinação de Promoções**

#### 1.7 Cupons
- **Cupons de Desconto**
- **Validação de Cupons**
- **Limite de Uso**
- **Validade e Expiração**

#### 1.8 Pedidos (Orders)
- **Criação de Pedidos**
- **Pedidos Mistos (Produtos + Serviços)**
- **Rastreamento de Pedidos**
- **Status de Pedidos** (PENDING, CONFIRMED, PREPARING, SHIPPED, DELIVERED, CANCELLED)
- **Histórico de Pedidos**
- **Origem do Pedido** (WEB, APP, PHONE)

#### 1.9 Carrinho de Compras
- **Itens Mistos (Produtos e Serviços)**
- **Aplicação de Cupons**
- **Cálculo de Descontos**
- **Persistência**

---

## FASE 1: Fundação e Infraestrutura Base

### Objetivo
Configurar toda a infraestrutura Docker, Nginx, PostgreSQL, estrutura base do backend com Prisma, autenticação JWT e APIs essenciais de Customers e Auth.

### 1.1 Estrutura de Diretórios Completa

```
moria-6df9f9ce/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   ├── environment.ts
│   │   │   │   └── cors.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── error.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   ├── logger.middleware.ts
│   │   │   │   └── rateLimit.middleware.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── auth.validation.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   │   └── update-profile.dto.ts
│   │   │   │   │   └── types/
│   │   │   │   │       ├── auth.types.ts
│   │   │   │   │       └── jwt-payload.types.ts
│   │   │   │   ├── customers/
│   │   │   │   │   ├── customers.controller.ts
│   │   │   │   │   ├── customers.service.ts
│   │   │   │   │   ├── customers.routes.ts
│   │   │   │   │   ├── customers.validation.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-customer.dto.ts
│   │   │   │   │   │   └── update-customer.dto.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── customer.types.ts
│   │   │   │   └── addresses/
│   │   │   │       ├── addresses.controller.ts
│   │   │   │       ├── addresses.service.ts
│   │   │   │       ├── addresses.routes.ts
│   │   │   │       ├── addresses.validation.ts
│   │   │   │       ├── dto/
│   │   │   │       │   ├── create-address.dto.ts
│   │   │   │       │   └── update-address.dto.ts
│   │   │   │       └── types/
│   │   │   │           └── address.types.ts
│   │   │   ├── shared/
│   │   │   │   ├── types/
│   │   │   │   │   ├── api-response.types.ts
│   │   │   │   │   ├── pagination.types.ts
│   │   │   │   │   └── query-params.types.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── hash.util.ts
│   │   │   │   │   ├── jwt.util.ts
│   │   │   │   │   ├── logger.util.ts
│   │   │   │   │   ├── error.util.ts
│   │   │   │   │   └── pagination.util.ts
│   │   │   │   ├── constants/
│   │   │   │   │   ├── http-status.constants.ts
│   │   │   │   │   ├── error-messages.constants.ts
│   │   │   │   │   └── regex.constants.ts
│   │   │   │   └── enums/
│   │   │   │       ├── customer-status.enum.ts
│   │   │   │       ├── customer-level.enum.ts
│   │   │   │       └── address-type.enum.ts
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   └── routes.ts
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── .dockerignore
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nodemon.json
│   └── frontend/
│       └── [estrutura existente]
├── nginx/
│   ├── nginx.conf
│   ├── conf.d/
│   │   ├── default.conf
│   │   ├── backend.conf
│   │   └── frontend.conf
│   ├── ssl/
│   │   └── .gitkeep
│   └── logs/
│       └── .gitkeep
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   └── .env.docker
├── packages/
│   └── types/
│       └── [estrutura existente]
└── scripts/
    ├── setup-dev.sh
    ├── setup-prod.sh
    └── db-seed.sh
```

### 1.2 Docker e Nginx - Configuração Completa

#### 1.2.1 docker-compose.yml (Desenvolvimento)

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: moria-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-moria}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-moria_dev_2024}
      POSTGRES_DB: ${POSTGRES_DB:-moria_db}
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=pt_BR.UTF-8"
      TZ: America/Sao_Paulo
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init:/docker-entrypoint-initdb.d
    networks:
      - moria-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-moria} -d ${POSTGRES_DB:-moria_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
      target: development
    container_name: moria-backend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: postgresql://${POSTGRES_USER:-moria}:${POSTGRES_PASSWORD:-moria_dev_2024}@postgres:5432/${POSTGRES_DB:-moria_db}?schema=public
      JWT_SECRET: ${JWT_SECRET:-moria_jwt_secret_dev_2024_change_in_production}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
      BCRYPT_ROUNDS: ${BCRYPT_ROUNDS:-10}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000,http://localhost:5173}
      LOG_LEVEL: ${LOG_LEVEL:-debug}
      TZ: America/Sao_Paulo
    ports:
      - "3001:3001"
    volumes:
      - ./apps/backend:/app
      - /app/node_modules
      - ./apps/backend/logs:/app/logs
    networks:
      - moria-network
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Application
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      target: development
    container_name: moria-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      VITE_API_URL: ${VITE_API_URL:-http://localhost/api}
      VITE_APP_NAME: ${VITE_APP_NAME:-Moria Pesca e Serviços}
    ports:
      - "5173:5173"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
    networks:
      - moria-network
    depends_on:
      - backend
    command: npm run dev

  # Nginx Reverse Proxy
  nginx:
    image: nginx:1.25-alpine
    container_name: moria-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
      - nginx_cache:/var/cache/nginx
    networks:
      - moria-network
    depends_on:
      - backend
      - frontend
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
  nginx_cache:
    driver: local

networks:
  moria-network:
    driver: bridge
```

#### 1.2.2 nginx.conf (Configuração Principal)

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Cache
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m
                     max_size=100m inactive=60m use_temp_path=off;

    # Upstream Definitions
    upstream backend_upstream {
        least_conn;
        server backend:3001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream frontend_upstream {
        least_conn;
        server frontend:5173 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Include server configurations
    include /etc/nginx/conf.d/*.conf;
}
```

#### 1.2.3 nginx/conf.d/default.conf

```nginx
server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Backend API
    location /api {
        limit_req zone=api_limit burst=20 nodelay;

        # Remove /api prefix before proxying
        rewrite ^/api/(.*) /$1 break;

        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;

        # Cache configuration for GET requests
        proxy_cache api_cache;
        proxy_cache_bypass $http_cache_control;
        proxy_cache_methods GET HEAD;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Auth endpoints with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login_limit burst=3 nodelay;

        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/auth/register {
        limit_req zone=login_limit burst=3 nodelay;

        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint (no rate limiting)
    location /api/health {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        access_log off;
    }

    # Frontend Application
    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;

        # WebSocket support for HMR
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for SSE/WebSocket
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend_upstream;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 1.3 Backend - Configuração Base

#### 1.3.1 apps/backend/package.json

```json
{
  "name": "@moria/backend",
  "version": "1.0.0",
  "description": "Backend API for Moria Pesca e Serviços",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "NODE_ENV=production node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:prod": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "@prisma/client": "^5.19.0",
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8",
    "dotenv": "^16.4.5",
    "winston": "^3.13.0",
    "express-rate-limit": "^7.3.1",
    "express-async-errors": "^3.1.1",
    "date-fns": "^3.6.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.9",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/uuid": "^10.0.0",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "prisma": "^5.19.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.3",
    "nodemon": "^3.1.4",
    "eslint": "^8.57.0",
    "prettier": "^3.3.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.1.5"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

#### 1.3.2 apps/backend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@config/*": ["config/*"],
      "@middlewares/*": ["middlewares/*"],
      "@modules/*": ["modules/*"],
      "@shared/*": ["shared/*"]
    },
    "resolveJsonModule": true,
    "allowJs": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### 1.3.3 apps/backend/Dockerfile

```dockerfile
# Multi-stage build for Backend

# Base stage
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl curl

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Development dependencies stage
FROM base AS dev-dependencies
COPY package*.json ./
RUN npm ci

# Development stage
FROM base AS development
COPY --from=dev-dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
COPY --from=dev-dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && \
    npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY package*.json ./

USER node
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

### 1.4 Prisma Schema - Fase 1 (Auth, Customers, Addresses)

#### 1.4.1 apps/backend/prisma/schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================

enum CustomerStatus {
  ACTIVE
  INACTIVE
  BLOCKED
}

enum CustomerLevel {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

enum AddressType {
  HOME
  WORK
  OTHER
}

// ============================================================================
// MODELS - FASE 1
// ============================================================================

model Customer {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  name          String
  phone         String
  cpf           String?        @unique
  birthDate     DateTime?
  status        CustomerStatus @default(ACTIVE)
  level         CustomerLevel  @default(BRONZE)
  totalOrders   Int            @default(0)
  totalSpent    Decimal        @default(0) @db.Decimal(10, 2)

  // Timestamps
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  lastLoginAt   DateTime?

  // Relations
  addresses     Address[]

  @@index([email])
  @@index([cpf])
  @@index([status])
  @@index([level])
  @@index([createdAt])
  @@map("customers")
}

model Address {
  id           String      @id @default(uuid())
  customerId   String
  type         AddressType @default(HOME)
  street       String
  number       String
  complement   String?
  neighborhood String
  city         String
  state        String      @db.Char(2)
  zipCode      String      @db.Char(8)
  isDefault    Boolean     @default(false)

  // Timestamps
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Relations
  customer     Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([customerId])
  @@index([zipCode])
  @@map("addresses")
}
```

### 1.5 Backend Core - Configurações

#### 1.5.1 apps/backend/src/config/environment.ts

```typescript
import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment schema validation
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Bcrypt
  BCRYPT_ROUNDS: z.string().transform(Number).default('10'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate and parse environment variables
const env = envSchema.parse(process.env);

export const environment = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  database: {
    url: env.DATABASE_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },

  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },

  cors: {
    origins: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  },

  logging: {
    level: env.LOG_LEVEL,
  },
} as const;

export type Environment = typeof environment;
```

#### 1.5.2 apps/backend/src/config/database.ts

```typescript
import { PrismaClient } from '@prisma/client';
import { environment } from './environment.js';
import { logger } from '@shared/utils/logger.util.js';

// Prisma Client Singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: environment.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
    errorFormat: 'pretty',
  });

if (environment.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

// Database connection handler
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Database disconnection handler
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting database:', error);
  }
}

// Graceful shutdown handlers
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
```

#### 1.5.3 apps/backend/src/config/cors.ts

```typescript
import { CorsOptions } from 'cors';
import { environment } from './environment.js';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (environment.cors.origins.includes('*') || environment.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
```

### 1.6 Shared Utilities - Fase 1

#### 1.6.1 apps/backend/src/shared/utils/logger.util.ts

```typescript
import winston from 'winston';
import { environment } from '@config/environment.js';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

export const logger = winston.createLogger({
  level: environment.logging.level,
  format: logFormat,
  defaultMeta: { service: 'moria-backend' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});
```

#### 1.6.2 apps/backend/src/shared/utils/hash.util.ts

```typescript
import bcrypt from 'bcryptjs';
import { environment } from '@config/environment.js';

export class HashUtil {
  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(environment.bcrypt.rounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validate password strength
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   */
  static validatePasswordStrength(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber
    );
  }
}
```

#### 1.6.3 apps/backend/src/shared/utils/jwt.util.ts

```typescript
import jwt, { JwtPayload } from 'jsonwebtoken';
import { environment } from '@config/environment.js';

export interface TokenPayload {
  customerId: string;
  email: string;
  level: string;
  status: string;
}

export class JwtUtil {
  /**
   * Generate JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, environment.jwt.secret, {
      expiresIn: environment.jwt.expiresIn,
      issuer: 'moria-backend',
      audience: 'moria-frontend',
    });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, environment.jwt.secret, {
        issuer: 'moria-backend',
        audience: 'moria-frontend',
      }) as JwtPayload;

      return {
        customerId: decoded.customerId,
        email: decoded.email,
        level: decoded.level,
        status: decoded.status,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded) return null;

      return {
        customerId: decoded.customerId,
        email: decoded.email,
        level: decoded.level,
        status: decoded.status,
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded || !decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }
}
```

#### 1.6.4 apps/backend/src/shared/utils/pagination.util.ts

```typescript
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationUtil {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 100;

  /**
   * Validate and normalize pagination parameters
   */
  static validateParams(params: PaginationParams): Required<PaginationParams> {
    const page = Math.max(1, params.page || this.DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(1, params.limit || this.DEFAULT_LIMIT),
      this.MAX_LIMIT
    );

    return { page, limit };
  }

  /**
   * Calculate skip value for database queries
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Build pagination metadata
   */
  static buildMeta(
    page: number,
    limit: number,
    totalCount: number
  ): PaginationMeta {
    const totalPages = Math.ceil(totalCount / limit);

    return {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Build paginated response
   */
  static buildResponse<T>(
    data: T[],
    page: number,
    limit: number,
    totalCount: number
  ): PaginatedResponse<T> {
    return {
      data,
      meta: this.buildMeta(page, limit, totalCount),
    };
  }
}
```

### 1.7 Middlewares - Fase 1

#### 1.7.1 apps/backend/src/middlewares/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { JwtUtil, TokenPayload } from '@shared/utils/jwt.util.js';
import { ApiError } from '@shared/utils/error.util.js';
import { CustomerStatus } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export class AuthMiddleware {
  /**
   * Verify JWT token and attach user to request
   */
  static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('No token provided');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const payload = JwtUtil.verifyToken(token);
        req.user = payload;
        next();
      } catch (error) {
        throw ApiError.unauthorized('Invalid or expired token');
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user is active
   */
  static requireActive(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (req.user.status !== CustomerStatus.ACTIVE) {
        throw ApiError.forbidden('Account is not active');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Require specific customer level
   */
  static requireLevel(...allowedLevels: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw ApiError.unauthorized('Authentication required');
        }

        if (!allowedLevels.includes(req.user.level)) {
          throw ApiError.forbidden('Insufficient privileges');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
```

#### 1.7.2 apps/backend/src/middlewares/error.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '@shared/utils/error.util.js';
import { logger } from '@shared/utils/logger.util.js';
import { environment } from '@config/environment.js';

export class ErrorMiddleware {
  static handle(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Log error
    logger.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });

    // Handle ApiError
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        ...(environment.isDevelopment && { stack: error.stack }),
      });
      return;
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(error);
      res.status(prismaError.statusCode).json({
        success: false,
        error: prismaError.message,
      });
      return;
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      res.status(400).json({
        success: false,
        error: 'Invalid data provided',
      });
      return;
    }

    // Handle generic errors
    res.status(500).json({
      success: false,
      error: environment.isDevelopment
        ? error.message
        : 'Internal server error',
      ...(environment.isDevelopment && { stack: error.stack }),
    });
  }

  private static handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
  } {
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: 409,
          message: `Duplicate value for field: ${(error.meta?.target as string[])?.join(', ')}`,
        };
      case 'P2025':
        return {
          statusCode: 404,
          message: 'Record not found',
        };
      case 'P2003':
        return {
          statusCode: 400,
          message: 'Invalid reference to related record',
        };
      case 'P2014':
        return {
          statusCode: 400,
          message: 'Invalid relationship constraint',
        };
      default:
        return {
          statusCode: 500,
          message: 'Database error occurred',
        };
    }
  }
}
```

#### 1.7.3 apps/backend/src/shared/utils/error.util.ts

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static unprocessableEntity(message: string): ApiError {
    return new ApiError(422, message);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
}
```

### 1.8 Auth Module - Implementação Completa

#### 1.8.1 apps/backend/src/modules/auth/dto/login.dto.ts

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginSchema>;
```

#### 1.8.2 apps/backend/src/modules/auth/dto/register.dto.ts

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  phone: z
    .string({ required_error: 'Phone is required' })
    .regex(/^\d{10,11}$/, 'Phone must be 10 or 11 digits')
    .trim(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'CPF must be 11 digits')
    .optional()
    .transform(val => val || undefined),
});

export type RegisterDto = z.infer<typeof registerSchema>;
```

#### 1.8.3 apps/backend/src/modules/auth/auth.service.ts

```typescript
import { Customer, CustomerStatus, CustomerLevel } from '@prisma/client';
import { prisma } from '@config/database.js';
import { HashUtil } from '@shared/utils/hash.util.js';
import { JwtUtil } from '@shared/utils/jwt.util.js';
import { ApiError } from '@shared/utils/error.util.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { logger } from '@shared/utils/logger.util.js';

export interface AuthResponse {
  token: string;
  customer: Omit<Customer, 'password'>;
}

export class AuthService {
  /**
   * Login customer
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (!customer) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if customer is blocked
    if (customer.status === CustomerStatus.BLOCKED) {
      throw ApiError.forbidden('Your account has been blocked');
    }

    // Verify password
    const isPasswordValid = await HashUtil.comparePassword(
      dto.password,
      customer.password
    );

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = JwtUtil.generateToken({
      customerId: customer.id,
      email: customer.email,
      level: customer.level,
      status: customer.status,
    });

    // Remove password from response
    const { password, ...customerWithoutPassword } = customer;

    logger.info(`Customer logged in: ${customer.email}`);

    return {
      token,
      customer: customerWithoutPassword,
    };
  }

  /**
   * Register new customer
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (existingCustomer) {
      throw ApiError.conflict('Email already registered');
    }

    // Check if CPF already exists (if provided)
    if (dto.cpf) {
      const existingCpf = await prisma.customer.findUnique({
        where: { cpf: dto.cpf },
      });

      if (existingCpf) {
        throw ApiError.conflict('CPF already registered');
      }
    }

    // Hash password
    const hashedPassword = await HashUtil.hashPassword(dto.password);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        cpf: dto.cpf,
        status: CustomerStatus.ACTIVE,
        level: CustomerLevel.BRONZE,
        lastLoginAt: new Date(),
      },
    });

    // Generate JWT token
    const token = JwtUtil.generateToken({
      customerId: customer.id,
      email: customer.email,
      level: customer.level,
      status: customer.status,
    });

    // Remove password from response
    const { password, ...customerWithoutPassword } = customer;

    logger.info(`New customer registered: ${customer.email}`);

    return {
      token,
      customer: customerWithoutPassword,
    };
  }

  /**
   * Get customer profile
   */
  async getProfile(customerId: string): Promise<Omit<Customer, 'password'>> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    customerId: string,
    data: {
      name?: string;
      phone?: string;
      cpf?: string;
      birthDate?: Date;
    }
  ): Promise<Omit<Customer, 'password'>> {
    // Check if CPF is being changed and if it's already in use
    if (data.cpf) {
      const existingCpf = await prisma.customer.findFirst({
        where: {
          cpf: data.cpf,
          NOT: { id: customerId },
        },
      });

      if (existingCpf) {
        throw ApiError.conflict('CPF already in use');
      }
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data,
    });

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }
}
```

#### 1.8.4 apps/backend/src/modules/auth/auth.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { loginSchema } from './dto/login.dto.js';
import { registerSchema } from './dto/register.dto.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await this.authService.login(dto);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await this.authService.register(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const customer = await this.authService.getProfile(req.user.customerId);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /auth/profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const customer = await this.authService.updateProfile(
        req.user.customerId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In JWT, logout is handled client-side by removing the token
      // Here we just confirm the action
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
```

#### 1.8.5 apps/backend/src/modules/auth/auth.routes.ts

```typescript
import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', AuthMiddleware.authenticate, authController.getProfile);
router.put('/profile', AuthMiddleware.authenticate, authController.updateProfile);

export default router;
```

### 1.9 Addresses Module - Implementação Completa

#### 1.9.1 apps/backend/src/modules/addresses/addresses.service.ts

```typescript
import { Address, AddressType } from '@prisma/client';
import { prisma } from '@config/database.js';
import { ApiError } from '@shared/utils/error.util.js';

export interface CreateAddressDto {
  customerId: string;
  type: AddressType;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  type?: AddressType;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isDefault?: boolean;
}

export class AddressesService {
  /**
   * Get all addresses for a customer
   */
  async getAddresses(customerId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get address by ID
   */
  async getAddressById(id: string, customerId: string): Promise<Address> {
    const address = await prisma.address.findFirst({
      where: { id, customerId },
    });

    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    return address;
  }

  /**
   * Create new address
   */
  async createAddress(dto: CreateAddressDto): Promise<Address> {
    // If this is set as default, unset other default addresses
    if (dto.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: dto.customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        customerId: dto.customerId,
        type: dto.type,
        street: dto.street,
        number: dto.number,
        complement: dto.complement,
        neighborhood: dto.neighborhood,
        city: dto.city,
        state: dto.state.toUpperCase(),
        zipCode: dto.zipCode.replace(/\D/g, ''),
        isDefault: dto.isDefault ?? false,
      },
    });

    return address;
  }

  /**
   * Update address
   */
  async updateAddress(
    id: string,
    customerId: string,
    dto: UpdateAddressDto
  ): Promise<Address> {
    // Verify address exists and belongs to customer
    await this.getAddressById(id, customerId);

    // If setting as default, unset other default addresses
    if (dto.isDefault) {
      await prisma.address.updateMany({
        where: { customerId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.state && { state: dto.state.toUpperCase() }),
        ...(dto.zipCode && { zipCode: dto.zipCode.replace(/\D/g, '') }),
      },
    });

    return address;
  }

  /**
   * Delete address
   */
  async deleteAddress(id: string, customerId: string): Promise<void> {
    // Verify address exists and belongs to customer
    await this.getAddressById(id, customerId);

    await prisma.address.delete({
      where: { id },
    });
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(id: string, customerId: string): Promise<Address> {
    // Verify address exists and belongs to customer
    await this.getAddressById(id, customerId);

    // Unset other default addresses
    await prisma.address.updateMany({
      where: { customerId, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });

    // Set this address as default
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return address;
  }
}
```

#### 1.9.2 apps/backend/src/modules/addresses/addresses.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { AddressesService } from './addresses.service.js';

export class AddressesController {
  private addressesService: AddressesService;

  constructor() {
    this.addressesService = new AddressesService();
  }

  /**
   * GET /addresses
   */
  getAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const addresses = await this.addressesService.getAddresses(req.user.customerId);

      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /addresses/:id
   */
  getAddressById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const address = await this.addressesService.getAddressById(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /addresses
   */
  createAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const address = await this.addressesService.createAddress({
        ...req.body,
        customerId: req.user.customerId,
      });

      res.status(201).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /addresses/:id
   */
  updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const address = await this.addressesService.updateAddress(
        req.params.id,
        req.user.customerId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /addresses/:id
   */
  deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      await this.addressesService.deleteAddress(req.params.id, req.user.customerId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /addresses/:id/default
   */
  setDefaultAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const address = await this.addressesService.setDefaultAddress(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  };
}
```

#### 1.9.3 apps/backend/src/modules/addresses/addresses.routes.ts

```typescript
import { Router } from 'express';
import { AddressesController } from './addresses.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const addressesController = new AddressesController();

// All address routes require authentication
router.use(AuthMiddleware.authenticate);

router.get('/', addressesController.getAddresses);
router.get('/:id', addressesController.getAddressById);
router.post('/', addressesController.createAddress);
router.put('/:id', addressesController.updateAddress);
router.delete('/:id', addressesController.deleteAddress);
router.patch('/:id/default', addressesController.setDefaultAddress);

export default router;
```

### 1.10 Main Application Files

#### 1.10.1 apps/backend/src/app.ts

```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'express-async-errors';
import { corsOptions } from '@config/cors.js';
import { ErrorMiddleware } from '@middlewares/error.middleware.js';
import { logger } from '@shared/utils/logger.util.js';
import authRoutes from '@modules/auth/auth.routes.js';
import addressesRoutes from '@modules/addresses/addresses.routes.js';

export function createApp(): Express {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // CORS
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/auth', authRoutes);
  app.use('/addresses', addressesRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  // Error handling middleware (must be last)
  app.use(ErrorMiddleware.handle);

  return app;
}
```

#### 1.10.2 apps/backend/src/server.ts

```typescript
import { createApp } from './app.js';
import { environment } from '@config/environment.js';
import { connectDatabase, disconnectDatabase } from '@config/database.js';
import { logger } from '@shared/utils/logger.util.js';

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(environment.port, () => {
      logger.info(`🚀 Server running on port ${environment.port}`);
      logger.info(`📝 Environment: ${environment.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${environment.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received, starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
```

### 1.11 Environment Files

#### 1.11.1 apps/backend/.env.example

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://moria:moria_dev_2024@postgres:5432/moria_db?schema=public

# JWT
JWT_SECRET=moria_jwt_secret_dev_2024_change_in_production_with_at_least_32_characters
JWT_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost

# Logging
LOG_LEVEL=debug
```

### 1.12 Scripts de Configuração

#### 1.12.1 scripts/setup-dev.sh

```bash
#!/bin/bash

echo "🚀 Setting up Moria Backend - Development Environment"
echo "======================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Create necessary directories
echo -e "\n${YELLOW}📁 Creating directories...${NC}"
mkdir -p apps/backend/logs
mkdir -p nginx/logs
mkdir -p nginx/ssl
mkdir -p docker/postgres/init

# Copy environment files
echo -e "\n${YELLOW}📄 Setting up environment files...${NC}"
if [ ! -f apps/backend/.env ]; then
    cp apps/backend/.env.example apps/backend/.env
    echo -e "${GREEN}✅ Created apps/backend/.env${NC}"
fi

if [ ! -f docker/.env.docker ]; then
    cat > docker/.env.docker <<EOF
POSTGRES_USER=moria
POSTGRES_PASSWORD=moria_dev_2024
POSTGRES_DB=moria_db
POSTGRES_PORT=5432
JWT_SECRET=moria_jwt_secret_dev_2024_change_in_production_with_at_least_32_characters
VITE_API_URL=http://localhost/api
EOF
    echo -e "${GREEN}✅ Created docker/.env.docker${NC}"
fi

# Build and start Docker containers
echo -e "\n${YELLOW}🐳 Building Docker containers...${NC}"
cd docker
docker-compose -f docker-compose.yml down -v
docker-compose -f docker-compose.yml up -d postgres

echo -e "\n${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 10

# Install backend dependencies
echo -e "\n${YELLOW}📦 Installing backend dependencies...${NC}"
cd ../apps/backend
npm install

# Generate Prisma client
echo -e "\n${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Run migrations
echo -e "\n${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma migrate dev --name init

# Start remaining services
echo -e "\n${YELLOW}🚀 Starting all services...${NC}"
cd ../../docker
docker-compose -f docker-compose.yml up -d

echo -e "\n${GREEN}✅ Setup completed successfully!${NC}"
echo -e "\n${YELLOW}📝 Available services:${NC}"
echo -e "   - Frontend: ${GREEN}http://localhost${NC}"
echo -e "   - Backend API: ${GREEN}http://localhost/api${NC}"
echo -e "   - Backend Direct: ${GREEN}http://localhost:3001${NC}"
echo -e "   - PostgreSQL: ${GREEN}localhost:5432${NC}"
echo -e "\n${YELLOW}📋 Useful commands:${NC}"
echo -e "   - View logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "   - Stop services: ${GREEN}docker-compose down${NC}"
echo -e "   - Restart services: ${GREEN}docker-compose restart${NC}"
echo -e "   - Prisma Studio: ${GREEN}cd apps/backend && npx prisma studio${NC}"
```

---

## FASE 2: Produtos, Serviços e Veículos

### Objetivo
Implementar todos os módulos relacionados a produtos, serviços, catálogo de veículos, compatibilidade e especificações técnicas.

### 2.1 Schema Prisma - Adições da Fase 2

```prisma
// Continuação do schema.prisma

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
  DISCONTINUED
}

enum ServiceStatus {
  ACTIVE
  INACTIVE
}

// Produtos
model Product {
  id                    String        @id @default(uuid())
  name                  String
  description           String        @db.Text
  category              String
  subcategory           String?
  sku                   String        @unique
  supplier              String
  costPrice             Decimal       @db.Decimal(10, 2)
  salePrice             Decimal       @db.Decimal(10, 2)
  promoPrice            Decimal?      @db.Decimal(10, 2)
  stock                 Int           @default(0)
  minStock              Int           @default(5)
  images                Json          // Array de URLs
  specifications        Json?         // Especificações técnicas estruturadas
  status                ProductStatus @default(ACTIVE)

  // SEO
  slug                  String        @unique
  metaDescription       String?
  metaKeywords          String?

  // Timestamps
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  // Relations
  vehicleCompatibility  ProductVehicleCompatibility[]

  @@index([category])
  @@index([status])
  @@index([sku])
  @@index([slug])
  @@map("products")
}

// Serviços
model Service {
  id              String        @id @default(uuid())
  name            String
  description     String        @db.Text
  category        String
  estimatedTime   String        // Ex: "2 horas"
  basePrice       Decimal?      @db.Decimal(10, 2)
  specifications  Json?
  status          ServiceStatus @default(ACTIVE)

  // SEO
  slug            String        @unique
  metaDescription String?

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([category])
  @@index([status])
  @@index([slug])
  @@map("services")
}

// Marcas de Veículos
model VehicleMake {
  id        String         @id @default(uuid())
  name      String         @unique
  country   String
  logo      String?
  active    Boolean        @default(true)

  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  // Relations
  models    VehicleModel[]

  @@index([name])
  @@map("vehicle_makes")
}

// Modelos de Veículos
model VehicleModel {
  id        String           @id @default(uuid())
  makeId    String
  name      String
  segment   String           // mini, hatch, sedan, suv, etc.
  bodyType  String           // 2-door, 4-door, etc.
  fuelTypes Json             // Array de tipos de combustível
  active    Boolean          @default(true)

  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  // Relations
  make      VehicleMake      @relation(fields: [makeId], references: [id], onDelete: Cascade)
  variants  VehicleVariant[]

  @@index([makeId])
  @@index([segment])
  @@map("vehicle_models")
}

// Variantes de Veículos
model VehicleVariant {
  id             String   @id @default(uuid())
  modelId        String
  name           String
  engineInfo     Json     // Informações do motor
  transmission   String
  yearStart      Int
  yearEnd        Int?
  specifications Json     // Especificações técnicas
  active         Boolean  @default(true)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  model          VehicleModel @relation(fields: [modelId], references: [id], onDelete: Cascade)

  @@index([modelId])
  @@index([yearStart])
  @@index([yearEnd])
  @@map("vehicle_variants")
}

// Compatibilidade Produto-Veículo
model ProductVehicleCompatibility {
  id              String   @id @default(uuid())
  productId       String
  makeId          String?
  modelId         String?
  variantId       String?
  yearStart       Int?
  yearEnd         Int?
  compatibilityData Json   // Regras detalhadas de compatibilidade
  verified        Boolean  @default(false)
  notes           String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([makeId])
  @@index([modelId])
  @@map("product_vehicle_compatibility")
}
```

### 2.2 Módulos a Implementar

- **Products Module**: CRUD completo, filtros avançados, busca
- **Services Module**: CRUD completo, categorias
- **Vehicles Module**: Marcas, Modelos, Variantes
- **Compatibility Module**: Sistema de compatibilidade veicular
- **Specifications Module**: Sistema de especificações técnicas

---

## FASE 3: Pedidos, Promoções e Cupons

### Objetivo
Implementar sistema completo de pedidos, promoções avançadas, cupons e favoritos.

### 3.1 Schema Prisma - Adições da Fase 3

```prisma
// Continuação do schema.prisma

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum OrderSource {
  WEB
  APP
  PHONE
}

enum OrderItemType {
  PRODUCT
  SERVICE
}

// Pedidos
model Order {
  id                String       @id @default(uuid())
  customerId        String
  addressId         String
  status            OrderStatus  @default(PENDING)
  source            OrderSource  @default(WEB)
  hasProducts       Boolean      @default(false)
  hasServices       Boolean      @default(false)

  // Valores
  subtotal          Decimal      @db.Decimal(10, 2)
  discountAmount    Decimal      @default(0) @db.Decimal(10, 2)
  total             Decimal      @db.Decimal(10, 2)

  // Pagamento e Entrega
  paymentMethod     String
  trackingCode      String?
  estimatedDelivery DateTime?
  deliveredAt       DateTime?

  // Cupom/Promoção
  couponCode        String?
  appliedPromotions Json?        // Array de IDs de promoções aplicadas

  // Timestamps
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  cancelledAt       DateTime?

  // Relations
  customer          Customer     @relation(fields: [customerId], references: [id])
  items             OrderItem[]

  @@index([customerId])
  @@index([status])
  @@index([createdAt])
  @@map("orders")
}

// Itens do Pedido
model OrderItem {
  id          String        @id @default(uuid())
  orderId     String
  productId   String?
  serviceId   String?
  type        OrderItemType
  name        String
  price       Decimal       @db.Decimal(10, 2)
  quantity    Int
  subtotal    Decimal       @db.Decimal(10, 2)

  createdAt   DateTime      @default(now())

  // Relations
  order       Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([productId])
  @@index([serviceId])
  @@map("order_items")
}

// Promoções
model Promotion {
  id                      String   @id @default(uuid())
  name                    String
  description             String   @db.Text
  shortDescription        String?
  bannerImage             String?
  badgeText               String?

  // Configuração
  type                    String   // PERCENTAGE, FIXED, etc.
  target                  String   // ALL_PRODUCTS, SPECIFIC_PRODUCTS, etc.
  trigger                 String   // CART_VALUE, ITEM_QUANTITY, etc.

  // Segmentação
  customerSegments        Json     // Array de segmentos
  geographicRestrictions  Json?
  deviceTypes             Json?

  // Regras
  rules                   Json     // Array de regras complexas
  tiers                   Json?    // Descontos escalonados

  // Produtos alvo
  targetProductIds        Json?
  targetCategories        Json?
  targetBrands            Json?
  targetPriceRange        Json?
  excludeProductIds       Json?
  excludeCategories       Json?

  // Recompensas
  rewards                 Json     // Estrutura de recompensas

  // Agendamento
  schedule                Json     // Configuração de agenda
  startDate               DateTime
  endDate                 DateTime

  // Limitações
  usageLimit              Int?
  usageLimitPerCustomer   Int?
  usedCount               Int      @default(0)

  // Combinação
  canCombineWithOthers    Boolean  @default(false)
  excludePromotionIds     Json?
  priority                Int      @default(0)

  // Código
  code                    String?  @unique
  autoApply               Boolean  @default(false)

  // Estados
  isActive                Boolean  @default(true)
  isDraft                 Boolean  @default(false)

  // Analytics
  analytics               Json?

  // Metadados
  createdBy               String
  lastModifiedBy          String?
  approvedBy              String?
  approvedAt              DateTime?
  tags                    Json?
  notes                   String?  @db.Text

  // Configurações avançadas
  customLogic             String?  @db.Text
  webhookUrl              String?

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@index([code])
  @@index([startDate])
  @@index([endDate])
  @@index([isActive])
  @@map("promotions")
}

// Cupons
model Coupon {
  id            String   @id @default(uuid())
  code          String   @unique
  description   String
  discountType  String   // PERCENTAGE, FIXED
  discountValue Decimal  @db.Decimal(10, 2)
  minValue      Decimal? @db.Decimal(10, 2)
  maxDiscount   Decimal? @db.Decimal(10, 2)
  expiresAt     DateTime
  usageLimit    Int?
  usedCount     Int      @default(0)
  isActive      Boolean  @default(true)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([code])
  @@index([expiresAt])
  @@index([isActive])
  @@map("coupons")
}

// Favoritos
model Favorite {
  id         String   @id @default(uuid())
  customerId String
  productId  String

  createdAt  DateTime @default(now())

  // Relations
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@unique([customerId, productId])
  @@index([customerId])
  @@index([productId])
  @@map("favorites")
}

// Atualizar model Customer para incluir relations
model Customer {
  // ... campos existentes ...

  // Adicionar relations
  orders    Order[]
  favorites Favorite[]
}
```

### 3.2 Módulos a Implementar

- **Orders Module**: Criação, gestão, tracking
- **Promotions Module**: Sistema avançado de promoções
- **Coupons Module**: Validação e aplicação de cupons
- **Favorites Module**: Gestão de favoritos

---

## FASE 4: Revisões Veiculares e Finalização

### Objetivo
Implementar sistema completo de revisões veiculares, testes, documentação e otimizações.

### 4.1 Schema Prisma - Adições da Fase 4

```prisma
// Continuação do schema.prisma

enum RevisionStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ChecklistItemStatus {
  NOT_CHECKED
  OK
  ATTENTION
  CRITICAL
  NOT_APPLICABLE
}

// Veículos dos Clientes (para Revisões)
model CustomerVehicle {
  id            String     @id @default(uuid())
  customerId    String
  brand         String
  model         String
  year          Int
  plate         String     @unique
  chassisNumber String?
  color         String?
  mileage       Int?

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  customer      Customer   @relation(fields: [customerId], references: [id], onDelete: Cascade)
  revisions     Revision[]

  @@index([customerId])
  @@index([plate])
  @@map("customer_vehicles")
}

// Categorias do Checklist
model ChecklistCategory {
  id          String          @id @default(uuid())
  name        String
  description String?
  icon        String?
  isDefault   Boolean         @default(false)
  isEnabled   Boolean         @default(true)
  order       Int

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  // Relations
  items       ChecklistItem[]

  @@index([order])
  @@map("checklist_categories")
}

// Itens do Checklist
model ChecklistItem {
  id          String             @id @default(uuid())
  categoryId  String
  name        String
  description String?
  isDefault   Boolean            @default(false)
  isEnabled   Boolean            @default(true)
  order       Int

  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  // Relations
  category    ChecklistCategory  @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
  @@index([order])
  @@map("checklist_items")
}

// Revisões
model Revision {
  id              String         @id @default(uuid())
  customerId      String
  vehicleId       String
  date            DateTime
  mileage         Int?
  status          RevisionStatus @default(DRAFT)
  checklistItems  Json           // Array de itens verificados
  generalNotes    String?        @db.Text
  recommendations String?        @db.Text

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  completedAt     DateTime?

  // Relations
  customer        Customer       @relation(fields: [customerId], references: [id])
  vehicle         CustomerVehicle @relation(fields: [vehicleId], references: [id])

  @@index([customerId])
  @@index([vehicleId])
  @@index([status])
  @@index([date])
  @@map("revisions")
}

// Atualizar model Customer para incluir relations de revisões
model Customer {
  // ... campos e relations existentes ...

  // Adicionar
  vehicles  CustomerVehicle[]
  revisions Revision[]
}
```

### 4.2 Módulos a Implementar

- **Revisions Module**: Sistema completo de revisões
- **Customer Vehicles Module**: Gestão de veículos dos clientes
- **Checklist Module**: Gestão de checklists customizáveis

### 4.3 Testes e Documentação

- **Unit Tests**: Testes unitários para todos os services
- **Integration Tests**: Testes de integração para endpoints
- **E2E Tests**: Testes end-to-end
- **API Documentation**: Swagger/OpenAPI
- **README e Guias**: Documentação completa

---

## Entregáveis da Fase 1

1. ✅ Docker Compose com PostgreSQL, Backend, Frontend e Nginx
2. ✅ Nginx configurado com proxy reverso e rate limiting
3. ✅ Backend com estrutura base TypeScript + Express + Prisma
4. ✅ Autenticação JWT completa
5. ✅ Módulo de Customers com CRUD
6. ✅ Módulo de Addresses com CRUD
7. ✅ Middlewares de autenticação e erro
8. ✅ Utilities (Hash, JWT, Logger, Pagination)
9. ✅ Schema Prisma com Customer e Address
10. ✅ Scripts de setup e configuração

## Próximos Passos

Após a conclusão da **Fase 1**, seguir para **Fase 2** conforme descrito acima.
