#!/bin/bash

# Script de Backup do Volume de Uploads
# Moria Peças e Serviços

set -e

echo "======================================"
echo "💾 Backup de Uploads - Moria"
echo "======================================"
echo ""

# Configurações
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se container está rodando
if ! docker ps | grep -q moria-vps; then
    echo -e "${RED}❌ Container moria-vps não está rodando${NC}"
    echo "   Inicie o container com: docker-compose -f docker-compose.vps.yml up -d"
    exit 1
fi

# Criar diretório de backup se não existir
echo "📁 Criando diretório de backup..."
mkdir -p "$BACKUP_DIR"

# Verificar quantos arquivos existem
FILE_COUNT=$(docker exec moria-vps find /app/apps/backend/uploads/products -type f 2>/dev/null | wc -l || echo "0")

if [ "$FILE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nenhum arquivo para fazer backup${NC}"
    exit 0
fi

echo -e "${GREEN}✓${NC} Encontrados $FILE_COUNT arquivo(s) para backup"
echo ""

# Fazer backup
echo "📦 Criando backup..."
docker exec moria-vps tar -czf - /app/apps/backend/uploads/products 2>/dev/null > "$BACKUP_FILE"

# Verificar se backup foi criado
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
    echo ""
    echo "   Arquivo: $BACKUP_FILE"
    echo "   Tamanho: $BACKUP_SIZE"
    echo "   Arquivos: $FILE_COUNT"
    echo ""

    # Listar backups existentes
    echo "📋 Backups existentes:"
    ls -lh "$BACKUP_DIR"/uploads_backup_*.tar.gz 2>/dev/null || echo "   Nenhum backup anterior"

    echo ""
    echo "======================================"
    echo "✅ Backup concluído"
    echo "======================================"
    echo ""
    echo "💡 Para restaurar este backup:"
    echo "   ./scripts/restore-uploads.sh $BACKUP_FILE"
    echo ""
else
    echo -e "${RED}❌ Erro ao criar backup${NC}"
    exit 1
fi
