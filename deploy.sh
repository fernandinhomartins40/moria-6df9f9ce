#!/bin/bash

# Script de Deploy Completo - Moria Peças e Serviços
# Garante limpeza de containers antigos e rebuild correto

set -e

echo "======================================"
echo "🚀 DEPLOY MORIA - VPS"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Diretório correto verificado${NC}"
echo ""

# 1. LIMPEZA COMPLETA DE CONTAINERS ANTIGOS
echo "======================================"
echo "🧹 ETAPA 1: Limpeza de Containers Antigos"
echo "======================================"
echo ""

echo "Parando todos os containers moria..."
docker ps -a | grep moria | awk '{print $1}' | xargs -r docker stop 2>/dev/null || true

echo "Removendo todos os containers moria..."
docker ps -a | grep moria | awk '{print $1}' | xargs -r docker rm 2>/dev/null || true

echo "Removendo imagens antigas moria (mantendo última)..."
docker images | grep moria | tail -n +2 | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "Removendo volumes órfãos..."
docker volume prune -f

echo "Removendo redes não utilizadas..."
docker network prune -f

echo -e "${GREEN}✅ Limpeza concluída${NC}"
echo ""

# 2. BUILD DO BACKEND
echo "======================================"
echo "🔨 ETAPA 2: Build do Backend"
echo "======================================"
echo ""

cd apps/backend

echo "Instalando dependências do backend..."
npm install

echo "Gerando Prisma Client..."
npx prisma generate

echo "Buildando backend..."
npm run build

if [ ! -f "dist/server.js" ]; then
    echo -e "${RED}❌ Erro: Build do backend falhou!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend buildado com sucesso${NC}"
echo ""

cd ../..

# 3. BUILD DO FRONTEND
echo "======================================"
echo "🔨 ETAPA 3: Build do Frontend"
echo "======================================"
echo ""

cd apps/frontend

echo "Instalando dependências do frontend..."
npm install

echo "Limpando build anterior..."
rm -rf dist

echo "Buildando frontend (modo production)..."
NODE_ENV=production npm run build

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Erro: Build do frontend falhou!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend buildado:${NC}"
ls -lh dist/index.html
ls -lh dist/assets/ | head -10

cd ../..

# 4. VERIFICAR ARQUIVOS CRÍTICOS
echo ""
echo "======================================"
echo "🔍 ETAPA 4: Verificação de Arquivos"
echo "======================================"
echo ""

echo "Verificando arquivos críticos..."

FILES_OK=true

if [ ! -f "apps/frontend/dist/index.html" ]; then
    echo -e "${RED}❌ dist/index.html não encontrado${NC}"
    FILES_OK=false
fi

if [ ! -f "apps/backend/dist/server.js" ]; then
    echo -e "${RED}❌ backend dist/server.js não encontrado${NC}"
    FILES_OK=false
fi

if [ ! -f "apps/backend/.env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production não encontrado (usando padrão)${NC}"
fi

if [ "$FILES_OK" = false ]; then
    echo -e "${RED}❌ Arquivos críticos faltando! Abortando deploy.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todos os arquivos verificados${NC}"
echo ""

# 5. BUILD DA IMAGEM DOCKER
echo "======================================"
echo "🐳 ETAPA 5: Build da Imagem Docker"
echo "======================================"
echo ""

# Adicionar timestamp à tag para forçar rebuild
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Buildando nova imagem Docker (tag: ${TIMESTAMP})..."
docker build -f Dockerfile.vps -t moria-app:${TIMESTAMP} -t moria-app:latest .

echo -e "${GREEN}✅ Imagem Docker criada${NC}"
docker images | grep moria-app | head -3
echo ""

# 6. CRIAR REDE SE NÃO EXISTIR
echo "======================================"
echo "🌐 ETAPA 6: Configuração de Rede"
echo "======================================"
echo ""

if ! docker network ls | grep -q moria-network; then
    echo "Criando rede moria-network..."
    docker network create moria-network
else
    echo "Rede moria-network já existe"
fi

echo -e "${GREEN}✅ Rede configurada${NC}"
echo ""

# 7. INICIAR CONTAINER
echo "======================================"
echo "🚀 ETAPA 7: Iniciar Container"
echo "======================================"
echo ""

echo "Iniciando novo container..."
docker run -d \
  --name moria-app \
  --restart unless-stopped \
  -p 3090:3090 \
  -v $(pwd)/apps/backend/uploads:/app/apps/backend/uploads \
  --network moria-network \
  moria-app:latest

echo ""
echo "Aguardando container inicializar (10 segundos)..."
sleep 10

# 8. VERIFICAÇÃO FINAL
echo ""
echo "======================================"
echo "✅ ETAPA 8: Verificação Final"
echo "======================================"
echo ""

echo "Status do container:"
docker ps | grep moria-app

echo ""
echo "Logs do container (últimas 30 linhas):"
docker logs moria-app --tail 30

echo ""
echo "Testando health check..."
sleep 5
curl -f http://localhost:3090/health || echo -e "${YELLOW}⚠️  Health check falhou (pode estar inicializando)${NC}"

echo ""
echo "======================================"
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "======================================"
echo ""
echo "📊 Informações do Deploy:"
echo "  - Imagem: moria-app:${TIMESTAMP}"
echo "  - Container: moria-app"
echo "  - Porta: 3090"
echo "  - Frontend: /app/apps/frontend/dist/"
echo "  - Backend: /app/apps/backend/dist/"
echo ""
echo "🔍 Comandos úteis:"
echo "  - Ver logs: docker logs -f moria-app"
echo "  - Entrar no container: docker exec -it moria-app sh"
echo "  - Reiniciar: docker restart moria-app"
echo "  - Parar: docker stop moria-app"
echo ""
echo "🌐 Acessar aplicação:"
echo "  - Frontend: http://seu-servidor:3090"
echo "  - Health: http://seu-servidor:3090/health"
echo "  - API: http://seu-servidor:3090/api/health"
echo ""
