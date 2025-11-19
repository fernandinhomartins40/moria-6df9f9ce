#!/bin/bash

# Script de Limpeza Docker - Remove containers, imagens e volumes órfãos
# Use este script antes de fazer um novo deploy

set -e

echo "======================================"
echo "🧹 LIMPEZA DOCKER MORIA"
echo "======================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Confirmação
read -p "⚠️  Isso vai PARAR e REMOVER todos os containers Moria. Continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 0
fi

echo ""
echo "🛑 Parando containers Moria..."
CONTAINERS=$(docker ps -a | grep -E 'moria|moria-app|moria-vps|moria-postgres' | awk '{print $1}')
if [ ! -z "$CONTAINERS" ]; then
    echo "$CONTAINERS" | xargs docker stop
    echo -e "${GREEN}✅ Containers parados${NC}"
else
    echo "Nenhum container Moria rodando"
fi

echo ""
echo "🗑️  Removendo containers Moria..."
CONTAINERS=$(docker ps -a | grep -E 'moria|moria-app|moria-vps|moria-postgres' | awk '{print $1}')
if [ ! -z "$CONTAINERS" ]; then
    echo "$CONTAINERS" | xargs docker rm -f
    echo -e "${GREEN}✅ Containers removidos${NC}"
else
    echo "Nenhum container Moria para remover"
fi

echo ""
echo "🖼️  Removendo imagens Moria antigas (mantendo latest)..."
IMAGES=$(docker images | grep -E 'moria' | grep -v latest | awk '{print $3}')
if [ ! -z "$IMAGES" ]; then
    echo "$IMAGES" | xargs docker rmi -f 2>/dev/null || true
    echo -e "${GREEN}✅ Imagens antigas removidas${NC}"
else
    echo "Nenhuma imagem antiga para remover"
fi

echo ""
echo "💾 Removendo volumes órfãos..."
docker volume prune -f
echo -e "${GREEN}✅ Volumes órfãos removidos${NC}"

echo ""
echo "🌐 Removendo redes não utilizadas..."
docker network prune -f
echo -e "${GREEN}✅ Redes limpas${NC}"

echo ""
echo "📊 Status atual do Docker:"
echo ""
echo "Containers:"
docker ps -a | head -5

echo ""
echo "Imagens Moria:"
docker images | grep moria || echo "Nenhuma imagem Moria"

echo ""
echo "Uso de disco:"
docker system df

echo ""
echo "======================================"
echo "✅ LIMPEZA CONCLUÍDA"
echo "======================================"
echo ""
echo "Agora você pode executar um novo deploy limpo com:"
echo "  bash deploy.sh"
echo ""
