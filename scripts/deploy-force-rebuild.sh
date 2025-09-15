#!/bin/bash
# ============================================
# Script de Deploy COMPLETO - Força Rebuild Total
# Elimina cache Docker e garante versões atualizadas
# ============================================

set -e

echo "🚀 DEPLOY FORCE REBUILD - Moria Full Stack"
echo "============================================="

# Verificar dependências
command -v docker >/dev/null 2>&1 || { echo "❌ Docker não encontrado!"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose não encontrado!"; exit 1; }

# Timestamp para forçar rebuild
BUILD_TIMESTAMP=$(date +%s)
echo "⏰ Build Timestamp: $BUILD_TIMESTAMP"

# Carregar variáveis de ambiente
if [ -f ".env.production" ]; then
    echo "📋 Carregando .env.production..."
    export $(grep -v '^#' .env.production | xargs)
elif [ -f ".env.local" ]; then
    echo "📋 Carregando .env.local..."
    export $(grep -v '^#' .env.local | xargs)
else
    echo "⚠️  Usando valores padrão..."
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3001
    export VITE_API_BASE_URL=http://localhost:3001/api
fi

# Export timestamp
export BUILD_TIMESTAMP=$BUILD_TIMESTAMP

echo "📋 Configuração do Deploy:"
echo "  Frontend: http://localhost:${FRONTEND_PORT:-8080}"
echo "  Backend: http://localhost:${BACKEND_PORT:-3001}/api"
echo "  Build Timestamp: $BUILD_TIMESTAMP"
echo ""

# PASSO 1: Parar tudo e limpar completamente
echo "🛑 PASSO 1: Parando todos os containers..."
docker compose down --remove-orphans --volumes 2>/dev/null || true
docker compose -p moria down --remove-orphans --volumes 2>/dev/null || true

# PASSO 2: Limpeza total do cache Docker
echo "🧹 PASSO 2: Limpeza TOTAL do cache Docker..."
echo "  Removendo containers parados..."
docker container prune -f || true

echo "  Removendo imagens não utilizadas..."
docker image prune -a -f || true

echo "  Removendo cache de build..."
docker builder prune -a -f || true

echo "  Removendo volumes órfãos..."
docker volume prune -f || true

echo "  Removendo redes não utilizadas..."
docker network prune -f || true

# PASSO 3: Remover imagens específicas do projeto (se existirem)
echo "🗑️  PASSO 3: Removendo imagens específicas do Moria..."
docker rmi $(docker images --format "table {{.Repository}}:{{.Tag}}" | grep moria || echo "") 2>/dev/null || true
docker rmi moria-frontend:latest 2>/dev/null || true
docker rmi moria-backend:latest 2>/dev/null || true

# PASSO 4: Build forçado sem cache
echo "🏗️  PASSO 4: BUILD FORÇADO sem cache..."
docker compose build \
  --no-cache \
  --pull \
  --build-arg BUILD_TIMESTAMP=$BUILD_TIMESTAMP \
  --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:3001/api} \
  --build-arg VITE_APP_NAME="Moria Peças & Serviços"

# PASSO 5: Subir stack
echo "🚀 PASSO 5: Iniciando stack atualizada..."
docker compose up -d

# PASSO 6: Aguardar e verificar
echo "⏳ PASSO 6: Aguardando inicialização..."
sleep 20

echo "🔍 Verificando serviços..."
docker compose ps

# PASSO 7: Testes de conectividade
echo "🩺 PASSO 7: Testando endpoints..."

# Testar backend
BACKEND_URL="http://localhost:${BACKEND_PORT:-3001}/api/health"
echo "🔌 Testando Backend: $BACKEND_URL"
for i in {1..10}; do
    if curl -f -s "$BACKEND_URL" >/dev/null 2>&1; then
        echo "✅ Backend OK ($i/10)"
        break
    fi
    echo "🔄 Backend tentativa $i/10..."
    sleep 2
done

# Testar frontend
FRONTEND_URL="http://localhost:${FRONTEND_PORT:-8080}"
echo "🌐 Testando Frontend: $FRONTEND_URL"
for i in {1..10}; do
    if curl -f -s "$FRONTEND_URL" >/dev/null 2>&1; then
        echo "✅ Frontend OK ($i/10)"
        break
    fi
    echo "🔄 Frontend tentativa $i/10..."
    sleep 2
done

# PASSO 8: Informações finais
echo ""
echo "🎉 DEPLOY FORCE REBUILD CONCLUÍDO!"
echo "============================================="
echo "🌐 Frontend: http://localhost:${FRONTEND_PORT:-8080}"
echo "🔌 Backend: http://localhost:${BACKEND_PORT:-3001}/api"
echo "🩺 Health: http://localhost:${BACKEND_PORT:-3001}/api/health"
echo "⏰ Build Timestamp: $BUILD_TIMESTAMP"
echo ""
echo "📊 Verificar logs:"
echo "  docker compose logs -f backend"
echo "  docker compose logs -f frontend"
echo ""
echo "📋 Outros comandos:"
echo "  docker compose ps              # Status dos containers"
echo "  docker compose down            # Parar tudo"
echo "  docker images | grep moria     # Ver imagens criadas"