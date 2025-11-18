# 🚀 Guia de Deploy - Moria Peças e Serviços

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
3. [Build Local](#build-local)
4. [Deploy VPS com Docker](#deploy-vps-com-docker)
5. [Validação Pós-Deploy](#validação-pós-deploy)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Pré-requisitos

### Servidor VPS
- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (via Docker ou instalado)
- Nginx (via Docker)
- Git

### Desenvolvimento Local
- Node.js 18+
- npm 9+
- Git

---

## 🔧 Configuração de Variáveis de Ambiente

### 1. Backend - Produção

Crie/edite `apps/backend/.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3001

# Database - SUBSTITUA COM CREDENCIAIS REAIS
DATABASE_URL=postgresql://usuario:senha@postgres:5432/moria_db?schema=public

# JWT - OBRIGATÓRIO MUDAR ESTE SECRET
JWT_SECRET=seu_secret_super_seguro_minimo_32_caracteres_aqui
JWT_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=12

# CORS - ADICIONE SEU DOMÍNIO
CORS_ORIGIN=http://localhost:3090,https://seu-dominio.com,https://www.seu-dominio.com

# Logging
LOG_LEVEL=info
```

⚠️ **IMPORTANTE**:
- `JWT_SECRET`: NUNCA use o valor de desenvolvimento em produção
- `DATABASE_URL`: Substitua com credenciais seguras
- `CORS_ORIGIN`: Adicione o domínio real do servidor

### 2. Frontend - Produção

O arquivo `apps/frontend/.env.production` já está configurado:

```bash
VITE_API_BASE_URL=/api
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

✅ **Não altere** estes valores. O Nginx faz proxy reverso de `/api` para o backend.

### 3. Desenvolvimento Local

Frontend (`apps/frontend/.env.local`):
```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_ENV=development
```

Backend (`apps/backend/.env`):
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moria_db
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

---

## 🏗️ Build Local

### Build Completo (Recomendado)

```bash
# Na raiz do projeto
npm run build
```

Isso executa:
1. Build do backend (`apps/backend/dist`)
2. Build do frontend (`apps/frontend/dist`)

### Build Individual com Validação

**Frontend:**
```bash
cd apps/frontend
npm run build
```

O build automático executa:
- ✅ `prebuild`: Valida `.env.production`
- ⚙️ `build`: Gera arquivos otimizados
- ✅ `postbuild`: Valida o build gerado

**Backend:**
```bash
cd apps/backend
npm run build
```

### Validação Manual

```bash
# Validar build do frontend
cd apps/frontend
node scripts/validate-build.js

# Testar backend localmente
cd apps/backend
npm run start:prod
```

---

## 🐳 Deploy VPS com Docker

### Arquitetura de Deploy

```
┌─────────────────────────────────────┐
│         Nginx (Porta 3090)          │
│  - Serve arquivos estáticos (SPA)  │
│  - Proxy reverso /api → backend    │
└─────────────────────────────────────┘
              ↓ (proxy)
┌─────────────────────────────────────┐
│      Backend Node.js (Porta 3001)  │
│  - API REST                         │
│  - Autenticação                     │
│  - Business Logic                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      PostgreSQL (Porta 5432)        │
│  - Banco de dados                   │
└─────────────────────────────────────┘
```

### Processo de Deploy

#### 1️⃣ Preparar Código no VPS

```bash
# SSH no servidor
ssh usuario@seu-servidor.com

# Clonar repositório (primeira vez)
git clone https://github.com/seu-usuario/moria-6df9f9ce.git
cd moria-6df9f9ce

# OU atualizar código existente
cd moria-6df9f9ce
git pull origin main
```

#### 2️⃣ Configurar Variáveis de Ambiente

```bash
# Editar .env.production do backend
nano apps/backend/.env.production

# IMPORTANTE: Alterar valores sensíveis!
# - JWT_SECRET
# - DATABASE_URL
# - CORS_ORIGIN
```

#### 3️⃣ Instalar Dependências

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
cd apps/backend
npx prisma generate
cd ../..
```

#### 4️⃣ Build no Host (Fora do Docker)

⚠️ **IMPORTANTE**: O build deve ser feito NO VPS, FORA do Docker:

```bash
# Build completo
npm run build

# OU builds individuais
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..
```

**Por que buildar fora do Docker?**
- Evita problemas de rede durante npm install no Docker
- Melhor performance
- Facilita debug

#### 5️⃣ Construir Imagem Docker

```bash
# Buildar imagem
docker build -f Dockerfile.vps -t moria-app .

# Verificar imagem criada
docker images | grep moria
```

#### 6️⃣ Iniciar Container

```bash
# Parar container anterior (se existir)
docker stop moria-app 2>/dev/null || true
docker rm moria-app 2>/dev/null || true

# Iniciar novo container
docker run -d \
  --name moria-app \
  --restart unless-stopped \
  -p 3090:3090 \
  -v $(pwd)/apps/backend/uploads:/app/apps/backend/uploads \
  --network moria-network \
  moria-app

# Verificar logs
docker logs -f moria-app
```

#### 7️⃣ Verificar Database

```bash
# Entrar no container
docker exec -it moria-app sh

# Verificar schema do Prisma
cd /app/apps/backend
npx prisma db push

# Executar seed (se necessário)
npx prisma db seed

# Sair do container
exit
```

---

## ✅ Validação Pós-Deploy

### 1. Health Check

```bash
curl http://localhost:3090/health
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-18T..."
}
```

### 2. Verificar Frontend

Acesse: `http://seu-servidor:3090`

**Deve exibir:**
- ✅ Landing page com logo Moria
- ✅ Hero section com imagem de fundo
- ✅ Seções de produtos e serviços

**Abrir Console do Navegador (F12):**
- ❌ Não deve ter erros 404
- ❌ Não deve ter erros CORS
- ✅ Assets devem carregar (CSS, JS, imagens)

### 3. Verificar API

```bash
# Testar endpoint público
curl http://localhost:3090/api/products

# Testar health do backend
curl http://localhost:3090/api/health
```

### 4. Verificar Logs

```bash
# Logs gerais
docker logs moria-app

# Logs do Nginx
docker exec moria-app cat /var/log/nginx/error.log
docker exec moria-app cat /var/log/nginx/access.log

# Logs do Backend
docker exec moria-app cat /var/log/backend.stderr.log
docker exec moria-app cat /var/log/backend.stdout.log
```

---

## 🔍 Troubleshooting

### Problema 1: Página Branca

**Sintomas:**
- Navegador mostra página em branco
- Console do navegador tem erros

**Soluções:**

1️⃣ **Verificar se build usou .env.production**
```bash
# No VPS
cat apps/frontend/dist/index.html
# Deve ter referências a /assets/index.[hash].js
```

2️⃣ **Rebuild do frontend**
```bash
cd apps/frontend
rm -rf dist
npm run build
cd ../..
docker build -f Dockerfile.vps -t moria-app .
docker restart moria-app
```

3️⃣ **Verificar CORS**
```bash
# Ver logs do backend
docker logs moria-app | grep CORS
```

### Problema 2: Erro 404 na API

**Sintomas:**
- Frontend carrega mas chamadas API falham
- Console: `GET http://servidor:3090/api/... 404`

**Soluções:**

1️⃣ **Verificar Nginx proxy**
```bash
docker exec moria-app cat /etc/nginx/nginx.conf | grep "location /api"
```

Deve ter:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001/;
    ...
}
```

2️⃣ **Verificar se backend está rodando**
```bash
docker exec moria-app curl http://127.0.0.1:3001/health
```

### Problema 3: CORS Error

**Sintomas:**
- Console: `Access to XMLHttpRequest blocked by CORS policy`

**Solução:**

1️⃣ **Verificar CORS_ORIGIN no backend**
```bash
docker exec moria-app printenv CORS_ORIGIN
```

Deve retornar: `http://localhost:3090`

2️⃣ **Atualizar e rebuild**
```bash
# Editar Dockerfile.vps linha 138
# Adicionar domínio correto em CORS_ORIGIN

docker build -f Dockerfile.vps -t moria-app .
docker restart moria-app
```

### Problema 4: Database Connection Failed

**Sintomas:**
- Logs: `Error connecting to database`

**Solução:**

1️⃣ **Verificar PostgreSQL**
```bash
docker ps | grep postgres
```

2️⃣ **Verificar DATABASE_URL**
```bash
# Ver logs de validação
docker logs moria-app | grep "DATABASE_URL"
```

3️⃣ **Testar conexão manual**
```bash
docker exec -it moria-app sh
cd /app/apps/backend
npx prisma db push
```

### Problema 5: Variáveis de Ambiente Erradas

**Sintomas:**
- Container não inicia
- Erros: `JWT_SECRET não está definida`

**Solução:**

Ver logs de validação:
```bash
docker logs moria-app | head -20
```

Se houver erros:
1. Corrigir `apps/backend/.env.production`
2. Rebuild: `docker build -f Dockerfile.vps -t moria-app .`
3. Restart: `docker restart moria-app`

---

## 📊 Checklist de Deploy

### Pré-Deploy
- [ ] Código commitado e pushed
- [ ] `.env.production` configurado (backend)
- [ ] JWT_SECRET alterado (produção)
- [ ] DATABASE_URL com credenciais corretas
- [ ] CORS_ORIGIN com domínio de produção

### Build
- [ ] `npm install` executado
- [ ] `npx prisma generate` executado
- [ ] `npm run build` executado com sucesso
- [ ] Build do frontend validado (✅ no console)

### Docker
- [ ] `docker build` executado sem erros
- [ ] Container iniciado com `docker run`
- [ ] Logs não mostram erros críticos

### Validação
- [ ] `curl http://localhost:3090/health` retorna 200
- [ ] Landing page carrega no navegador
- [ ] Console do navegador sem erros
- [ ] API responde: `curl http://localhost:3090/api/products`
- [ ] Admins conseguem fazer login

---

## 🔒 Segurança

### Produção
1. **NUNCA** commitar `.env.production` no Git
2. Usar secrets manager (AWS Secrets, HashiCorp Vault, etc)
3. Configurar firewall (permitir apenas portas 80, 443, 22)
4. Usar HTTPS com certificado SSL (Let's Encrypt)
5. Configurar rate limiting no Nginx

### Exemplo Nginx com SSL:
```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3090;
    }
}
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs detalhados: `docker logs moria-app --tail 100`
2. Verificar validações: Os scripts de validação falham?
3. Comparar com esta documentação
4. Abrir issue no repositório com logs completos

---

## 📝 Changelog de Deploy

### v1.0.0 - 2025-01-18
- ✅ Corrigidos fallbacks hardcoded de API URLs
- ✅ Criado .env.production para backend
- ✅ Adicionada validação de variáveis de ambiente
- ✅ Criados scripts de validação de build
- ✅ Atualizado Dockerfile.vps com CORS_ORIGIN
- ✅ Build validado e otimizado

---

**Última atualização:** 2025-01-18
**Versão:** 1.0.0
