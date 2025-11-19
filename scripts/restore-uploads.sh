#!/bin/bash

# Script de Restauração do Volume de Uploads
# Moria Peças e Serviços

set -e

echo "======================================"
echo "♻️  Restauração de Uploads - Moria"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar parâmetro
if [ -z "$1" ]; then
    echo -e "${RED}❌ Uso: $0 <arquivo_backup.tar.gz>${NC}"
    echo ""
    echo "Backups disponíveis:"
    ls -lh ./backups/uploads_backup_*.tar.gz 2>/dev/null || echo "   Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Arquivo de backup não encontrado: $BACKUP_FILE${NC}"
    exit 1
fi

# Verificar se container está rodando
if ! docker ps | grep -q moria-vps; then
    echo -e "${RED}❌ Container moria-vps não está rodando${NC}"
    echo "   Inicie o container com: docker-compose -f docker-compose.vps.yml up -d"
    exit 1
fi

# Mostrar informações do backup
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "📦 Backup a restaurar:"
echo "   Arquivo: $BACKUP_FILE"
echo "   Tamanho: $BACKUP_SIZE"
echo ""

# Confirmar ação
read -p "⚠️  Deseja continuar? Isso irá SOBRESCREVER os arquivos atuais! (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada"
    exit 0
fi

# Fazer backup dos arquivos atuais primeiro
echo ""
echo "📸 Fazendo backup de segurança dos arquivos atuais..."
SAFETY_BACKUP="./backups/uploads_before_restore_$(date +"%Y%m%d_%H%M%S").tar.gz"
docker exec moria-vps tar -czf - /app/apps/backend/uploads/products 2>/dev/null > "$SAFETY_BACKUP" || echo "⚠️  Nenhum arquivo atual para backup"

# Restaurar backup
echo ""
echo "♻️  Restaurando backup..."
cat "$BACKUP_FILE" | docker exec -i moria-vps tar -xzf - -C /

# Verificar se restauração foi bem-sucedida
FILE_COUNT=$(docker exec moria-vps find /app/apps/backend/uploads/products -type f 2>/dev/null | wc -l || echo "0")

if [ "$FILE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Restauração concluída com sucesso!${NC}"
    echo ""
    echo "   Arquivos restaurados: $FILE_COUNT"
    echo "   Backup de segurança salvo em: $SAFETY_BACKUP"
    echo ""

    # Ajustar permissões
    echo "🔧 Ajustando permissões..."
    docker exec moria-vps chmod -R 755 /app/apps/backend/uploads
    docker exec moria-vps chown -R root:root /app/apps/backend/uploads

    echo ""
    echo "======================================"
    echo "✅ Restauração concluída"
    echo "======================================"
    echo ""
    echo "💡 Verifique as imagens no site para confirmar"
else
    echo -e "${RED}❌ Erro na restauração - nenhum arquivo encontrado${NC}"
    exit 1
fi
