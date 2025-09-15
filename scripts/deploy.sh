#!/bin/bash
# ============================================
# Script de Deploy Local - Moria Full Stack
# Node.js Backend + React Frontend
# ============================================

set -e

echo "🚀 Moria Deploy Script - Full Stack"
echo "======================================"

# Verificar dependências
command -v docker >/dev/null 2>&1 || { echo "❌ Docker não encontrado!"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose não encontrado!"; exit 1; }

# Verificar arquivos essenciais
echo "🔍 Verificando estrutura do projeto..."
[ -f "docker-compose.yml" ] || { echo "❌ docker-compose.yml não encontrado!"; exit 1; }
[ -f "backend/Dockerfile" ] || { echo "❌ backend/Dockerfile não encontrado!"; exit 1; }
[ -f "Dockerfile" ] || { echo "❌ Dockerfile (frontend) não encontrado!"; exit 1; }
[ -f "backend/server.js" ] || { echo "❌ backend/server.js não encontrado!"; exit 1; }

# Carregar variáveis de ambiente
if [ -f ".env.production" ]; then
    echo "📋 Carregando .env.production..."
    export $(grep -v '^#' .env.production | xargs)
elif [ -f ".env.local" ]; then
    echo "📋 Carregando .env.local..."
    export $(grep -v '^#' .env.local | xargs)
else
    echo "⚠️ Nenhum arquivo .env encontrado, usando valores padrão..."
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3001
    export VITE_API_BASE_URL=http://localhost:3001/api
fi

echo "📋 Configuração:"
echo "  Frontend: http://localhost:${FRONTEND_PORT:-8080}"
echo "  Backend: http://localhost:${BACKEND_PORT:-3001}/api"
echo "  Projeto: ${COMPOSE_PROJECT_NAME:-moria}"

# Parar stack anterior
echo "⏹️ Parando stack anterior..."
docker compose -p ${COMPOSE_PROJECT_NAME:-moria} down --remove-orphans 2>/dev/null || true

# Definir timestamp para forçar rebuild
export BUILD_TIMESTAMP=$(date +%s)
echo "⏰ Build Timestamp: $BUILD_TIMESTAMP"

# Limpar cache (opcional)
if [ "$1" = "--clean" ]; then
    echo "🧹 Limpando cache Docker..."
    docker system prune -f
    docker builder prune -f
fi

# Build e start
echo "🏗️ Construindo imagens..."
docker compose -p ${COMPOSE_PROJECT_NAME:-moria} build --build-arg BUILD_TIMESTAMP=$BUILD_TIMESTAMP

echo "🚀 Iniciando stack..."
docker compose -p ${COMPOSE_PROJECT_NAME:-moria} up -d

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 15

# Verificar saúde dos serviços
echo "🔍 Verificando serviços..."
docker compose -p ${COMPOSE_PROJECT_NAME:-moria} ps

# Testar endpoints
echo "🩺 Testando endpoints..."

# Testar backend
BACKEND_URL="http://localhost:${BACKEND_PORT:-3001}/api/health"
for i in {1..5}; do
    if curl -f -s "$BACKEND_URL" >/dev/null 2>&1; then
        echo "✅ Backend OK: $BACKEND_URL"
        break
    fi
    echo "🔄 Backend tentativa $i/5..."
    sleep 3
done

# Testar frontend
FRONTEND_URL="http://localhost:${FRONTEND_PORT:-8080}"
for i in {1..5}; do
    if curl -f -s "$FRONTEND_URL" >/dev/null 2>&1; then
        echo "✅ Frontend OK: $FRONTEND_URL"
        break
    fi
    echo "🔄 Frontend tentativa $i/5..."
    sleep 3
done

echo ""
echo "🎉 Deploy concluído!"
echo "======================================"
echo "🌐 Frontend: http://localhost:${FRONTEND_PORT:-8080}"
echo "🔌 Backend: http://localhost:${BACKEND_PORT:-3001}/api"
echo "🩺 Health: http://localhost:${BACKEND_PORT:-3001}/api/health"
echo ""
echo "📋 Comandos úteis:"
echo "  docker compose -p ${COMPOSE_PROJECT_NAME:-moria} logs -f    # Ver logs"
echo "  docker compose -p ${COMPOSE_PROJECT_NAME:-moria} down       # Parar"
echo "  ./scripts/deploy.sh --clean                                 # Deploy com limpeza"