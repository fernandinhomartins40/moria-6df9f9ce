# Guia de Deploy - Moria Peças e Serviços

Este documento contém todas as informações necessárias para fazer deploy da aplicação Moria em diferentes ambientes.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Deploy Local (Desenvolvimento)](#deploy-local-desenvolvimento)
4. [Deploy em VPS (Produção)](#deploy-em-vps-produção)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A aplicação Moria é composta por:

- **Frontend**: React + Vite (porta 5173 em dev, 8080 em prod)
- **Backend**: Node.js + Express (porta 3003)
- **Banco de Dados**: PostgreSQL 16 (porta 5432)

### Arquitetura de Deploy

**Desenvolvimento Local:**
```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend   │────▶│  PostgreSQL  │
│ (port 5173) │     │ (port 3003) │     │ (port 5432)  │
└─────────────┘     └─────────────┘     └──────────────┘
```

**Produção (VPS):**
```
┌─────────────┐
│    Nginx    │ (port 80/443)
└─────┬───────┘
      │
      ├─▶ Frontend (port 8080)
      │
      ├─▶ Backend API (port 3090)
      │
      └─▶ PostgreSQL (internal network)
```

---

## Pré-requisitos

### Para Desenvolvimento Local

- Node.js 18+ ou 20+
- Docker e Docker Compose
- Git
- 4GB RAM mínimo
- 10GB espaço em disco

### Para Produção (VPS)

- VPS com Ubuntu 20.04+ ou Debian 11+
- Docker e Docker Compose instalados
- Nginx (opcional, se usar outro proxy)
- Domínio configurado
- Certificado SSL (Let's Encrypt recomendado)
- 2GB RAM mínimo
- 20GB espaço em disco

---

## Deploy Local (Desenvolvimento)

### Opção 1: Usando Docker Compose (Recomendado)

Esta é a forma mais simples de rodar a aplicação completa localmente.

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/moria-6df9f9ce.git
cd moria-6df9f9ce

# 2. Inicie os containers
cd docker
docker compose up -d

# 3. Aguarde os serviços iniciarem (1-2 minutos)
docker compose logs -f backend

# 4. Acesse a aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:3003/health
```

**Serviços disponíveis:**
- PostgreSQL: `localhost:5432`
- Backend API: `localhost:3003`
- Frontend: `localhost:5173`
- Nginx (proxy): `localhost:80`

**Comandos úteis:**
```bash
# Ver logs
docker compose logs -f [backend|frontend|postgres]

# Parar serviços
docker compose down

# Rebuild após mudanças
docker compose up -d --build

# Acessar banco de dados
docker compose exec postgres psql -U moria -d moria_db
```

### Opção 2: Desenvolvimento sem Docker

Para desenvolvimento ativo com hot-reload.

#### 1. Configurar PostgreSQL

```bash
# Iniciar apenas o PostgreSQL com Docker
cd docker
docker compose up -d postgres

# OU instalar PostgreSQL localmente
sudo apt install postgresql-16
sudo service postgresql start

# Criar banco e usuário
sudo -u postgres psql
CREATE USER moria WITH PASSWORD 'moria_dev_2024';
CREATE DATABASE moria_db OWNER moria;
\q
```

#### 2. Configurar Backend

```bash
cd apps/backend

# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env se necessário (já tem valores corretos)
# DATABASE_URL=postgresql://moria:moria_dev_2024@localhost:5432/moria_db?schema=public
# PORT=3003

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate dev

# Popular banco com dados de exemplo
npm run prisma:seed

# Iniciar backend em modo desenvolvimento
npm run dev
```

#### 3. Configurar Frontend

```bash
# Em outro terminal
cd apps/frontend

# Copiar variáveis de ambiente
cp .env.example .env

# .env já tem o valor correto:
# VITE_API_BASE_URL=http://localhost:3003

# Instalar dependências
npm install

# Iniciar frontend em modo desenvolvimento
npm run dev
```

#### 4. Acessar aplicação

- Frontend: http://localhost:5173
- Backend API: http://localhost:3003
- Health Check: http://localhost:3003/health

---

## Deploy em VPS (Produção)

### 1. Preparar VPS

```bash
# SSH no servidor
ssh usuario@seu-servidor.com

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout e login novamente para aplicar grupo docker
exit
```

### 2. Clonar Repositório

```bash
# Criar diretório da aplicação
mkdir -p ~/apps
cd ~/apps

# Clonar repositório (usar HTTPS ou SSH)
git clone https://github.com/seu-usuario/moria-6df9f9ce.git
cd moria-6df9f9ce
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.vps.example .env

# Editar arquivo .env com valores de produção
nano .env
```

**IMPORTANTE:** Altere TODOS os valores de segurança:

```bash
# Gerar senhas fortes
# PostgreSQL
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# JWT Secret (64+ caracteres)
JWT_SECRET=$(openssl rand -base64 64)

# Atualizar DATABASE_URL com a senha do PostgreSQL
DATABASE_URL=postgresql://moria:${POSTGRES_PASSWORD}@postgres:5432/moria_db?schema=public

# Configurar domínio
CORS_ORIGIN=https://moriapescaservicos.com,https://www.moriapescaservicos.com
FRONTEND_URL=https://moriapescaservicos.com

# Primeira vez: popular banco com seed
RUN_SEED=true  # Depois mudar para false
```

### 4. Fazer Build e Deploy

```bash
# Build da aplicação
docker compose -f docker-compose.vps.yml build

# Iniciar serviços em background
docker compose -f docker-compose.vps.yml up -d

# Verificar logs
docker compose -f docker-compose.vps.yml logs -f app

# Aguardar inicialização (pode levar 2-3 minutos)
# Verificar se está saudável
docker compose -f docker-compose.vps.yml ps
```

### 5. Configurar Nginx (Reverse Proxy)

Se estiver usando Nginx como proxy reverso na VPS:

```bash
sudo nano /etc/nginx/sites-available/moria
```

```nginx
# HTTP - Redirecionar para HTTPS
server {
    listen 80;
    server_name moriapescaservicos.com www.moriapescaservicos.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name moriapescaservicos.com www.moriapescaservicos.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/moriapescaservicos.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/moriapescaservicos.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3091/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin routes (rotas do /admin)
    location /admin {
        proxy_pass http://127.0.0.1:3091/admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3091/health;
        access_log off;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:3091/uploads/;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/moria /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 6. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d moriapescaservicos.com -d www.moriapescaservicos.com

# Testar renovação automática
sudo certbot renew --dry-run
```

### 7. Verificar Deploy

```bash
# Verificar se containers estão rodando
docker compose -f docker-compose.vps.yml ps

# Testar backend
curl http://localhost:3091/health

# Testar frontend
curl http://localhost:8080

# Verificar logs
docker compose -f docker-compose.vps.yml logs -f app
```

Acessar aplicação:
- https://moriapescaservicos.com

---

## Variáveis de Ambiente

### Backend (.env)

| Variável | Descrição | Exemplo Dev | Exemplo Prod |
|----------|-----------|-------------|--------------|
| `NODE_ENV` | Ambiente de execução | `development` | `production` |
| `PORT` | Porta do servidor | `3003` | `3003` |
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://moria:pass@localhost:5432/moria_db` | `postgresql://moria:SENHA_FORTE@postgres:5432/moria_db` |
| `JWT_SECRET` | Segredo para tokens JWT | Qualquer string longa | **64+ caracteres aleatórios** |
| `JWT_EXPIRES_IN` | Expiração token cliente | `7d` | `7d` |
| `JWT_ADMIN_EXPIRES_IN` | Expiração token admin | `8h` | `8h` |
| `BCRYPT_ROUNDS` | Rounds de hash bcrypt | `10` | `12` |
| `CORS_ORIGIN` | URLs permitidas CORS | `http://localhost:5173` | `https://seudominio.com` |
| `LOG_LEVEL` | Nível de logs | `debug` | `info` |

### Frontend (.env)

| Variável | Descrição | Exemplo Dev | Exemplo Prod |
|----------|-----------|-------------|--------------|
| `VITE_API_BASE_URL` | URL base da API | `http://localhost:3003` | `https://api.seudominio.com` |
| `VITE_APP_ENV` | Ambiente | `development` | `production` |
| `VITE_APP_VERSION` | Versão | `1.0.0` | `1.0.0` |

### Docker Compose VPS (.env)

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `POSTGRES_USER` | Usuário PostgreSQL | ✅ |
| `POSTGRES_PASSWORD` | Senha PostgreSQL | ✅ |
| `POSTGRES_DB` | Nome do banco | ✅ |
| `DATABASE_URL` | URL completa do banco | ✅ |
| `JWT_SECRET` | Secret JWT | ✅ |
| `CORS_ORIGIN` | URLs CORS | ✅ |
| `FRONTEND_URL` | URL do frontend | ✅ |
| `RUN_SEED` | Executar seed? | ❌ (default: false) |

---

## Troubleshooting

### Backend não inicia

**Erro: "tsx: not found"**
```bash
# Solução: nodemon.json já está configurado com npx tsx
# Verificar se existe nodemon.json com:
cat apps/backend/nodemon.json
# Deve conter: "exec": "npx tsx src/server.ts"
```

**Erro: conexão ao banco recusada**
```bash
# Verificar se PostgreSQL está rodando
docker compose ps postgres
# OU
sudo service postgresql status

# Verificar URL de conexão no .env
# Para Docker: @postgres:5432
# Para local: @localhost:5432
```

**Erro: "CustomerLevel" not found**
```bash
# Regenerar Prisma Client
cd apps/backend
rm -rf ../../node_modules/@prisma
npx prisma generate
```

### Frontend não conecta ao backend

**Erro 404 ou CORS**
```bash
# Verificar VITE_API_BASE_URL no .env do frontend
cat apps/frontend/.env
# Deve ser: http://localhost:3003 (sem /api no final)

# Verificar CORS_ORIGIN no .env do backend
# Deve incluir: http://localhost:5173
```

### Store Panel não mostra dados

**Problema: Páginas vazias**

Ver documentação completa em `STORE_PANEL_SETUP.md`

Resumo:
1. Backend precisa estar rodando
2. PostgreSQL precisa estar acessível
3. Migrations precisam estar aplicadas
4. Seed opcional para dados de exemplo

```bash
# Verificar health
curl http://localhost:3003/health

# Rodar migrations
cd apps/backend
npx prisma migrate deploy

# Popular com dados (opcional)
npm run prisma:seed
```

### Docker Compose falha

**Erro: porta já em uso**
```bash
# Encontrar processo usando a porta
sudo lsof -i :3003
# Matar processo
sudo kill -9 PID

# OU mudar porta no docker-compose.yml
```

**Erro: sem espaço em disco**
```bash
# Limpar imagens não utilizadas
docker system prune -a

# Ver uso de espaço
docker system df
```

### Produção (VPS)

**Container reiniciando constantemente**
```bash
# Ver logs
docker compose -f docker-compose.vps.yml logs app

# Problemas comuns:
# - DATABASE_URL incorreta
# - JWT_SECRET não configurado
# - Migrations não aplicadas (são aplicadas automaticamente no startup)
```

**502 Bad Gateway no Nginx**
```bash
# Verificar se app está rodando
curl http://localhost:3091/health

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar configuração
sudo nginx -t
```

**SSL não funciona**
```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## Atualizações e Manutenção

### Atualizar aplicação em produção

```bash
cd ~/apps/moria-6df9f9ce

# Pull latest changes
git pull origin main

# Rebuild e restart
docker compose -f docker-compose.vps.yml up -d --build

# Verificar logs
docker compose -f docker-compose.vps.yml logs -f app
```

### Backup do banco de dados

```bash
# Criar backup
docker compose -f docker-compose.vps.yml exec postgres pg_dump -U moria moria_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose -f docker-compose.vps.yml exec -T postgres psql -U moria -d moria_db < backup_20240101.sql
```

### Monitoramento

```bash
# Ver uso de recursos
docker stats

# Ver logs em tempo real
docker compose -f docker-compose.vps.yml logs -f

# Health checks
curl https://moriapescaservicos.com/health
```

---

## Suporte

Para problemas não cobertos neste guia:

1. Verificar logs: `docker compose logs -f`
2. Verificar issues no GitHub
3. Consultar documentação específica:
   - `STORE_PANEL_SETUP.md` - Setup do painel admin
   - `README.md` - Visão geral do projeto

---

**Versão do Documento:** 1.0.0
**Última Atualização:** 2025-11-17
