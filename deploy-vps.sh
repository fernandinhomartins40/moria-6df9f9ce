#!/bin/bash

# Script de Deploy VPS - Moria Peças e Serviços
# Garante que o código correto seja deployado

set -e

echo "======================================"
echo "🚀 Deploy VPS - Moria"
echo "======================================"
echo ""

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

echo "📥 1. Atualizando código do repositório..."
git fetch origin
git reset --hard origin/main
git pull origin main

echo ""
echo "✅ Código atualizado para último commit:"
git log --oneline -1

echo ""
echo "📦 2. Instalando dependências..."
npm install

echo ""
echo "🔨 3. Gerando Prisma Client..."
cd apps/backend
npx prisma generate
cd ../..

echo ""
echo "🏗️ 4. Buildando backend..."
cd apps/backend
npm run build
cd ../..

echo ""
echo "🏗️ 5. Buildando frontend..."
cd apps/frontend
npm run build

# Verificar se build foi bem-sucedido
if [ ! -f "dist/index.html" ]; then
    echo "❌ Erro: Build do frontend falhou!"
    exit 1
fi

echo ""
echo "✅ Build do frontend concluído:"
ls -lh dist/index.html

cd ../..

echo ""
echo "🐳 6. Buildando imagem Docker..."
docker build -f Dockerfile.vps -t moria-app .

echo ""
echo "🛑 7. Parando container anterior..."
docker stop moria-app 2>/dev/null || true
docker rm moria-app 2>/dev/null || true

echo ""
echo "🚀 8. Iniciando novo container..."
docker run -d \
  --name moria-app \
  --restart unless-stopped \
  -p 3090:3090 \
  -v $(pwd)/apps/backend/uploads:/app/apps/backend/uploads \
  --network moria-network \
  moria-app

echo ""
echo "⏳ Aguardando container iniciar..."
sleep 5

echo ""
echo "📋 Logs do container:"
docker logs moria-app --tail 50

echo ""
echo "======================================"
echo "✅ Deploy concluído!"
echo "======================================"
echo ""
echo "🔍 Verificações:"
echo "1. Health check: curl http://localhost:3090/health"
echo "2. Logs: docker logs -f moria-app"
echo "3. Frontend: curl http://localhost:3090/"
echo ""
