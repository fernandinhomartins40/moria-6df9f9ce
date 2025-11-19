# 🚀 Guia Rápido de Deploy - Moria VPS

## ⚡ Deploy Rápido (Recomendado)

### Opção 1: Deploy Automático Completo

```bash
# No servidor VPS
bash deploy.sh
```

Este script faz **TUDO**:
- ✅ Limpa containers antigos
- ✅ Build do backend
- ✅ Build do frontend
- ✅ Build da imagem Docker
- ✅ Inicia novo container
- ✅ Validações automáticas

---

### Opção 2: Deploy Manual Passo-a-Passo

#### 1️⃣ Limpeza (IMPORTANTE!)

```bash
# Limpar containers e imagens antigas
bash cleanup-docker.sh
```

#### 2️⃣ Atualizar Código

```bash
git pull origin main
```

#### 3️⃣ Build Backend

```bash
cd apps/backend
npm install
npx prisma generate
npm run build
cd ../..
```

#### 4️⃣ Build Frontend

```bash
cd apps/frontend
npm install
rm -rf dist  # IMPORTANTE: Limpar build anterior
NODE_ENV=production npm run build
cd ../..
```

**Verificar build:**
```bash
ls -lh apps/frontend/dist/index.html
ls -lh apps/frontend/dist/assets/
```

#### 5️⃣ Build Docker

```bash
# Com timestamp para forçar rebuild
docker build -f Dockerfile.vps -t moria-app:$(date +%Y%m%d_%H%M%S) -t moria-app:latest .
```

#### 6️⃣ Parar Container Antigo

```bash
docker stop moria-app 2>/dev/null || true
docker rm moria-app 2>/dev/null || true
```

#### 7️⃣ Iniciar Novo Container

```bash
docker run -d \
  --name moria-app \
  --restart unless-stopped \
  -p 3090:3090 \
  -v $(pwd)/apps/backend/uploads:/app/apps/backend/uploads \
  --network moria-network \
  moria-app:latest
```

#### 8️⃣ Verificar

```bash
docker logs -f moria-app
```

---

## 🔍 Troubleshooting

### Problema: Página ainda está branca após deploy

**Causa:** Container usando build antigo

**Solução:**
```bash
# 1. Limpar TUDO
bash cleanup-docker.sh

# 2. Rebuild frontend
cd apps/frontend
rm -rf dist node_modules
npm install
npm run build
cd ../..

# 3. Rebuild Docker SEM CACHE
docker build --no-cache -f Dockerfile.vps -t moria-app:latest .

# 4. Iniciar novo container
docker stop moria-app && docker rm moria-app
docker run -d --name moria-app --restart unless-stopped -p 3090:3090 --network moria-network moria-app:latest
```

### Problema: Build do Dockerfile falha

**Erro:** `ERROR: Frontend não foi buildado!`

**Solução:**
```bash
cd apps/frontend
npm run build
cd ../..
docker build -f Dockerfile.vps -t moria-app:latest .
```

### Problema: Container não inicia

**Verificar logs:**
```bash
docker logs moria-app
```

**Causas comuns:**
- Porta 3090 já em uso
- Database não acessível
- Variáveis de ambiente faltando

**Solução:**
```bash
# Verificar portas
netstat -tulpn | grep 3090

# Verificar rede
docker network ls | grep moria-network

# Verificar database
docker ps | grep postgres
```

---

## 📋 Checklist Pré-Deploy

Antes de fazer deploy, confirme:

- [ ] Código commitado e pushed para main
- [ ] `.env.production` configurado no backend
- [ ] JWT_SECRET alterado (não usar valor de dev)
- [ ] DATABASE_URL correto
- [ ] CORS_ORIGIN com domínio de produção

---

## 🧹 Limpeza de Containers Órfãos

### Listar todos os containers Moria:
```bash
docker ps -a | grep moria
```

### Remover containers órfãos:
```bash
docker ps -a | grep moria | awk '{print $1}' | xargs docker rm -f
```

### Remover imagens antigas:
```bash
docker images | grep moria | grep -v latest | awk '{print $3}' | xargs docker rmi -f
```

### Limpeza geral do Docker:
```bash
# Remove containers parados
docker container prune -f

# Remove imagens não utilizadas
docker image prune -a -f

# Remove volumes órfãos
docker volume prune -f

# Remove redes não utilizadas
docker network prune -f
```

---

## 🎯 Validação Pós-Deploy

### 1. Health Check
```bash
curl http://localhost:3090/health
```

**Esperado:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### 2. Frontend
```bash
curl -I http://localhost:3090/
```

**Esperado:** HTTP 200 OK

### 3. API
```bash
curl http://localhost:3090/api/products
```

**Esperado:** Lista de produtos

### 4. Logs
```bash
docker logs moria-app --tail 50
```

**Esperado:** Sem erros, servidor rodando na porta 3001

---

## 📊 Comandos Úteis

### Ver todos os containers:
```bash
docker ps -a
```

### Entrar no container:
```bash
docker exec -it moria-app sh
```

### Ver logs em tempo real:
```bash
docker logs -f moria-app
```

### Reiniciar container:
```bash
docker restart moria-app
```

### Ver uso de recursos:
```bash
docker stats moria-app
```

### Ver arquivos buildados dentro do container:
```bash
docker exec moria-app ls -lh /app/apps/frontend/dist/
```

### Verificar versão do bundle JS no container:
```bash
docker exec moria-app cat /app/apps/frontend/dist/index.html | grep -o 'index\.[^"]*\.js'
```

---

## ⚠️ IMPORTANTE

### Sempre Faça Limpeza Antes de Deploy!

**Por quê?**
- Containers antigos podem estar usando imagens antigas
- Docker pode cachear layers mesmo com código novo
- Volumes órfãos podem causar conflitos

**Como:**
```bash
bash cleanup-docker.sh
# OU
bash deploy.sh  # Já faz limpeza automaticamente
```

### Rebuild do Frontend é Obrigatório

O frontend **DEVE** ser rebuildo ANTES de buildar o Docker:

```bash
cd apps/frontend
rm -rf dist  # Limpar build anterior
npm run build
cd ../..
docker build -f Dockerfile.vps -t moria-app:latest .
```

**Nunca** buildar Docker sem rebuild do frontend após mudanças no código!

---

## 🆘 Suporte

Se ainda tiver problemas:

1. Execute `bash cleanup-docker.sh`
2. Execute `bash deploy.sh`
3. Verifique logs: `docker logs moria-app`
4. Teste health: `curl http://localhost:3090/health`

Se persistir, abra uma issue com:
- Output do deploy.sh completo
- Logs do container
- Resultado do curl health check
