#!/bin/bash
# scripts/backup-simple.sh
# ========================================
# BACKUP SCRIPT SIMPLES - FASE 4
# Conforme PLANO_MIGRACAO_KNEX_PRISMA_DOCKER.md
# ========================================

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

echo "💾 Backup Prisma Database..."

# Backup SQLite via docker
docker exec moria-backend sqlite3 /app/data/moria.db ".backup /tmp/backup_${DATE}.db"
docker cp moria-backend:/tmp/backup_${DATE}.db $BACKUP_DIR/

# Backup schema Prisma
docker cp moria-backend:/app/prisma/schema.prisma $BACKUP_DIR/schema_${DATE}.prisma

gzip "$BACKUP_DIR/backup_${DATE}.db"

echo "✅ Backup realizado:"
echo "  - Database: backup_${DATE}.db.gz"
echo "  - Schema: schema_${DATE}.prisma"