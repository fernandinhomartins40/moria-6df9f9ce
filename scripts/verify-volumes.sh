#!/bin/bash

# Script de Verificação e Diagnóstico de Volumes
# Moria Peças e Serviços

set -e

echo "======================================"
echo "🔍 Verificação de Volumes - Moria"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar volumes Docker
echo "📦 1. Listando volumes Docker..."
echo ""
docker volume ls | grep moria || echo -e "${YELLOW}⚠️  Nenhum volume do Moria encontrado${NC}"
echo ""

# 2. Verificar volume de uploads
echo "📁 2. Verificando volume de uploads..."
UPLOADS_VOLUME=$(docker volume ls --format '{{.Name}}' | grep "moria.*uploads_data" || echo "")

if [ -z "$UPLOADS_VOLUME" ]; then
    echo -e "${RED}❌ Volume uploads_data NÃO encontrado!${NC}"
    echo "   Execute 'docker-compose -f docker-compose.vps.yml up -d' para criar"
    UPLOADS_EXISTS=false
else
    echo -e "${GREEN}✓ Volume encontrado: $UPLOADS_VOLUME${NC}"
    UPLOADS_EXISTS=true

    # Detalhes do volume
    echo ""
    echo "Detalhes do volume:"
    docker volume inspect "$UPLOADS_VOLUME" --format '  Mountpoint: {{.Mountpoint}}'
    docker volume inspect "$UPLOADS_VOLUME" --format '  Driver: {{.Driver}}'
    docker volume inspect "$UPLOADS_VOLUME" --format '  Created: {{.CreatedAt}}'
fi

echo ""

# 3. Verificar volume do PostgreSQL
echo "🗄️  3. Verificando volume do PostgreSQL..."
POSTGRES_VOLUME=$(docker volume ls --format '{{.Name}}' | grep "moria.*postgres_data" || echo "")

if [ -z "$POSTGRES_VOLUME" ]; then
    echo -e "${RED}❌ Volume postgres_data NÃO encontrado!${NC}"
    echo "   Execute 'docker-compose -f docker-compose.vps.yml up -d' para criar"
else
    echo -e "${GREEN}✓ Volume encontrado: $POSTGRES_VOLUME${NC}"

    # Detalhes do volume
    echo ""
    echo "Detalhes do volume:"
    docker volume inspect "$POSTGRES_VOLUME" --format '  Mountpoint: {{.Mountpoint}}'
    docker volume inspect "$POSTGRES_VOLUME" --format '  Driver: {{.Driver}}'
    docker volume inspect "$POSTGRES_VOLUME" --format '  Created: {{.CreatedAt}}'
fi

echo ""

# 4. Verificar arquivos no volume de uploads (se container estiver rodando)
if [ "$UPLOADS_EXISTS" = true ]; then
    echo "📸 4. Verificando arquivos de imagens..."

    if docker ps | grep -q moria-vps; then
        # Container rodando - verificar diretamente
        echo ""
        echo "Contagem de arquivos:"

        PRODUCTS_COUNT=$(docker exec moria-vps find /app/apps/backend/uploads/products -type f 2>/dev/null | wc -l || echo "0")
        TEMP_COUNT=$(docker exec moria-vps find /app/apps/backend/uploads/temp -type f 2>/dev/null | wc -l || echo "0")

        echo "  • Produtos: $PRODUCTS_COUNT arquivo(s)"
        echo "  • Temporários: $TEMP_COUNT arquivo(s)"

        if [ "$PRODUCTS_COUNT" -gt 0 ]; then
            echo ""
            echo "Últimas 5 imagens de produtos:"
            docker exec moria-vps ls -lht /app/apps/backend/uploads/products | head -6

            echo ""
            echo "Espaço usado:"
            docker exec moria-vps du -sh /app/apps/backend/uploads/products
        else
            echo -e "${YELLOW}⚠️  Nenhuma imagem de produto encontrada${NC}"
        fi

        if [ "$TEMP_COUNT" -gt 5 ]; then
            echo -e "${YELLOW}⚠️  Aviso: $TEMP_COUNT arquivos temporários (considere limpeza)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Container moria-vps não está rodando${NC}"
        echo "   Para verificar arquivos, inicie o container primeiro"
    fi
fi

echo ""
echo "======================================"
echo "✅ Verificação concluída"
echo "======================================"
echo ""

# 5. Sumário e recomendações
echo "📋 Sumário:"
if [ "$UPLOADS_EXISTS" = true ]; then
    echo -e "${GREEN}✓${NC} Volume de uploads configurado corretamente"
else
    echo -e "${RED}✗${NC} Volume de uploads precisa ser criado"
fi

if [ -n "$POSTGRES_VOLUME" ]; then
    echo -e "${GREEN}✓${NC} Volume do PostgreSQL configurado corretamente"
else
    echo -e "${RED}✗${NC} Volume do PostgreSQL precisa ser criado"
fi

echo ""
echo "💡 Comandos úteis:"
echo "   • Listar todos os volumes: docker volume ls"
echo "   • Inspecionar volume: docker volume inspect <nome>"
echo "   • Backup do volume: ./scripts/backup-uploads.sh"
echo "   • Ver logs do container: docker logs moria-vps"
echo ""
