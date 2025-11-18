# 📊 Matriz de Configurações - Moria Peças e Serviços

## Tabela de Configurações por Ambiente

### Frontend

| Variável | Dev Local | Docker Dev | Produção VPS | Descrição |
|----------|-----------|------------|--------------|-----------|
| **VITE_API_BASE_URL** | `http://localhost:3001` | `http://localhost/api` | `/api` | URL base da API |
| **VITE_APP_ENV** | `development` | `development` | `production` | Ambiente da aplicação |
| **VITE_APP_VERSION** | `1.0.0` | `1.0.0` | `1.0.0` | Versão da aplicação |
| **Porta Vite Dev** | `3000` | - | - | Servidor de desenvolvimento |
| **Porta Nginx** | - | `80` | `3090` | Servidor web |

### Backend

| Variável | Dev Local | Docker Dev | Produção VPS | Descrição |
|----------|-----------|------------|--------------|-----------|
| **NODE_ENV** | `development` | `development` | `production` | Ambiente Node.js |
| **PORT** | `3001` | `3001` | `3001` | Porta do servidor Express |
| **DATABASE_URL** | `postgresql://postgres:postgres@localhost:5432/moria_db` | `postgresql://moria:moria_dev_2024@postgres:5432/moria_db` | `postgresql://moria:SENHA_SEGURA@postgres:5432/moria_db` | Conexão PostgreSQL |
| **JWT_SECRET** | `moria_jwt_secret_dev_2024...` | `moria_jwt_secret_dev_2024...` | `SECRET_PRODUÇÃO_32+_CHARS` | Secret para JWT ⚠️ |
| **JWT_EXPIRES_IN** | `7d` | `7d` | `7d` | Expiração do token |
| **BCRYPT_ROUNDS** | `10` | `10` | `12` | Rounds de hash bcrypt |
| **CORS_ORIGIN** | `http://localhost:3000,http://localhost:5173` | `http://localhost` | `http://localhost:3090,https://dominio.com` | Origens permitidas |
| **LOG_LEVEL** | `debug` | `debug` | `info` | Nível de log |

### Database

| Variável | Dev Local | Docker Dev | Produção VPS | Descrição |
|----------|-----------|------------|--------------|-----------|
| **POSTGRES_USER** | `postgres` | `moria` | `moria` | Usuário PostgreSQL |
| **POSTGRES_PASSWORD** | `postgres` | `moria_dev_2024` | `SENHA_SEGURA` | Senha PostgreSQL ⚠️ |
| **POSTGRES_DB** | `moria_db` | `moria_db` | `moria_db` | Nome do banco |
| **POSTGRES_PORT** | `5432` | `5432` | `5432` | Porta PostgreSQL |

---

## 🔄 Fluxo de Requisições

### Desenvolvimento Local

```
Browser (localhost:3000)
    ↓
    GET /
    ↓
Vite Dev Server (localhost:3000)
    ↓ serve index.html

Browser
    ↓
    GET /api/products
    ↓
Axios (VITE_API_BASE_URL=http://localhost:3001)
    ↓
Backend Express (localhost:3001)
    ↓ /products
Database (localhost:5432)
```

### Produção VPS

```
Browser (dominio.com)
    ↓
    GET /
    ↓
Nginx (porta 3090)
    ↓ serve /app/apps/frontend/dist/index.html

Browser
    ↓
    GET /api/products
    ↓
Nginx (porta 3090)
    ↓ location /api/
    ↓ proxy_pass http://127.0.0.1:3001/ (remove /api)
    ↓
Backend Express (localhost:3001)
    ↓ /products (sem /api)
Database (postgres:5432 via Docker network)
```

**Ponto Crítico:**
- Frontend chama: `/api/products`
- Nginx recebe: `/api/products`
- Nginx reescreve para: `/products` (remove `/api`)
- Backend recebe: `/products`

---

## 🔐 Variáveis Sensíveis

### ⚠️ NUNCA usar em Produção:

| Variável | Valor Dev | Problema |
|----------|-----------|----------|
| JWT_SECRET | `moria_jwt_secret_dev_2024...` | Secret previsível e curto |
| DATABASE_URL | `postgres:postgres@...` | Credenciais padrão |
| POSTGRES_PASSWORD | `postgres` ou `moria_dev_2024` | Senha fraca |

### ✅ Valores Recomendados para Produção:

```bash
# Gerar JWT_SECRET seguro (32+ caracteres)
openssl rand -base64 32

# Exemplo: kR9xL2mP5nQ8wT4yU7vZ1aB3cD6eF9gH

# Gerar senha PostgreSQL
openssl rand -base64 24

# Exemplo: xY8zW7vU6tS5rQ4pO3nM2lK1
```

---

## 📝 Arquivos de Configuração

### Frontend

| Arquivo | Quando é Usado | Prioridade |
|---------|----------------|-----------|
| `.env` | Sempre (valores base) | 3 (mais baixa) |
| `.env.local` | Dev local (sobrescreve .env) | 2 |
| `.env.production` | Build production (`npm run build`) | 1 (mais alta) |
| `.env.production.local` | Produção local (ignorado pelo Git) | 1 (mais alta) |

### Backend

| Arquivo | Quando é Usado | Prioridade |
|---------|----------------|-----------|
| `.env.example` | Template (não usado em runtime) | - |
| `.env` | Desenvolvimento local | 2 |
| `.env.production` | Produção (`NODE_ENV=production`) | 1 (mais alta) |

### Docker

| Arquivo | Quando é Usado |
|---------|----------------|
| `.env.docker` | `docker-compose.yml` (apenas desenvolvimento) |
| `Dockerfile.vps` | Build de produção no VPS |

---

## 🔧 Como Funciona a Prioridade

### Vite (Frontend)

1. Vite lê `.env` primeiro
2. Depois sobrescreve com `.env.[mode]` (ex: `.env.production`)
3. Depois sobrescreve com `.env.local`
4. Depois sobrescreve com `.env.[mode].local`

**Comandos e seus modos:**
- `npm run dev` → mode: `development` → usa `.env.development` (se existir) ou `.env`
- `npm run build` → mode: `production` → usa `.env.production`
- `npm run build:dev` → mode: `development` → usa `.env.development` ou `.env`

### Node.js (Backend)

1. Usa `process.env` (variáveis do sistema)
2. `dotenv` lê `.env` e adiciona ao `process.env`
3. Se `NODE_ENV=production`, lê `.env.production` (se existir)

---

## ⚡ Quick Reference

### Verificar qual .env está sendo usado

**Frontend:**
```bash
# Durante build
npm run build
# Veja a saída do script pre-build.js

# Ou inspecione o build
cat apps/frontend/dist/assets/index.*.js | grep -o "http[s]*://[^\"]*"
```

**Backend:**
```bash
# Ler variáveis em runtime
docker exec moria-app printenv | grep -E "NODE_ENV|PORT|DATABASE_URL|CORS"
```

### Forçar rebuild com .env correto

**Frontend:**
```bash
cd apps/frontend
rm -rf dist
NODE_ENV=production npm run build
```

**Backend:**
```bash
cd apps/backend
rm -rf dist
npm run build
```

---

## 🐛 Debug de Configurações

### 1. Frontend não está usando /api em produção

**Sintoma:** Frontend buildado tenta chamar `http://localhost:3001/...`

**Diagnóstico:**
```bash
# Ver qual URL está embedada no build
grep -r "localhost:3001" apps/frontend/dist/
```

**Solução:**
```bash
# Garantir que .env.production existe e está correto
cat apps/frontend/.env.production

# Rebuild
cd apps/frontend
rm -rf dist
npm run build
```

### 2. Backend não aceita CORS de produção

**Sintoma:** Erro `blocked by CORS policy`

**Diagnóstico:**
```bash
# Ver CORS configurado
docker exec moria-app printenv CORS_ORIGIN
```

**Solução:**
```bash
# Editar Dockerfile.vps linha 138
# Adicionar domínio: CORS_ORIGIN="http://localhost:3090,https://dominio.com"

# Rebuild Docker
docker build -f Dockerfile.vps -t moria-app .
docker restart moria-app
```

### 3. Validação de ambiente falha

**Sintoma:** Container não inicia, logs mostram: `❌ ERROS DE CONFIGURAÇÃO`

**Diagnóstico:**
```bash
docker logs moria-app | head -30
```

**Solução:**
1. Ver quais variáveis estão faltando nos logs
2. Corrigir `apps/backend/.env.production`
3. Rebuild e restart

---

## 📚 Documentos Relacionados

- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy
- [README.md](./README.md) - Visão geral do projeto
- [apps/backend/.env.example](./apps/backend/.env.example) - Template de configuração backend
- [apps/frontend/.env.example](./apps/frontend/.env.example) - Template de configuração frontend

---

**Última atualização:** 2025-01-18
**Versão:** 1.0.0
