#!/bin/bash

# ========================================
# SCRIPT DE BACKUP SIMPLES - MORIA PRISMA
# ✅ Backup automatizado do banco de dados SQLite
# ✅ Compatível com GitHub Actions
# ========================================

set -e  # Sair imediatamente se algum comando falhar

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens com cor
print_status() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Criar diretório de backups se não existir
mkdir -p backups

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não encontrado! Por favor, instale o Docker primeiro."
    exit 1
fi

print_status "Iniciando backup simples do banco de dados Moria..."

# Verificar se o container do backend está em execução
if ! docker compose ps | grep -q "moria-backend.*Up"; then
    print_error "Container moria-backend não está em execução! Inicie-o primeiro com 'docker compose up -d'"
    exit 1
fi

# Data e hora para o nome do arquivo de backup
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="backups/moria-backup-$TIMESTAMP.db"

print_status "Criando backup do banco de dados..."
docker exec moria-backend sqlite3 /app/data/moria.db ".backup /tmp/moria-backup.db"

print_status "Copiando backup para o host..."
docker cp moria-backend:/tmp/moria-backup.db "$BACKUP_FILE"

print_status "Verificando integridade do backup..."
docker run --rm -v "$(pwd):/app" alpine sh -c "ls -la /app/$BACKUP_FILE"

print_success "🎉 BACKUP SIMPLES CONCLUÍDO COM SUCESSO!"
echo ""
echo "📁 Backup criado em: $BACKUP_FILE"
echo "📊 Tamanho do backup: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
echo "📋 Para restaurar o backup:"
echo "  1. Pare os containers: docker compose down"
echo "  2. Substitua o banco: cp $BACKUP_FILE backend/data/moria.db"
echo "  3. Inicie os containers: docker compose up -d"