#!/bin/bash

# Script de Backup Automático de Uploads
# Moria Peças e Serviços
# Executado via cron diariamente às 3h da manhã

set -e

BACKUP_DIR="/root/moria-backups/uploads"
VOLUME_NAME="moria-6df9f9ce_uploads_data"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/uploads_${DATE}.tar.gz"
LOG_FILE="/var/log/moria-backup.log"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] =====================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup automático de imagens..." >> "$LOG_FILE"

# Verificar se volume existe
if ! docker volume ls | grep -q "$VOLUME_NAME"; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERRO CRÍTICO: Volume $VOLUME_NAME não encontrado!" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Execute: docker volume ls para verificar volumes disponíveis" >> "$LOG_FILE"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Volume $VOLUME_NAME encontrado" >> "$LOG_FILE"

# Contar arquivos antes do backup
FILE_COUNT_BEFORE=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  find /data/products -type f 2>/dev/null | wc -l || echo "0")

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Arquivos para backup: $FILE_COUNT_BEFORE" >> "$LOG_FILE"

if [ "$FILE_COUNT_BEFORE" -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ AVISO: Nenhum arquivo encontrado para backup" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup vazio será criado" >> "$LOG_FILE"
fi

# Criar backup usando container temporário
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Criando arquivo de backup..." >> "$LOG_FILE"
docker run --rm \
  -v "${VOLUME_NAME}:/data:ro" \
  -v "${BACKUP_DIR}:/backup" \
  alpine:latest \
  tar czf "/backup/uploads_${DATE}.tar.gz" -C /data . 2>/dev/null

# Verificar se backup foi criado
if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

  # Verificar integridade do backup
  if tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
    FILES=$(tar -tzf "$BACKUP_FILE" 2>/dev/null | grep -v '/$' | wc -l || echo "0")
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup criado com sucesso!" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')]    Arquivo: $BACKUP_FILE" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')]    Tamanho: $SIZE" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')]    Arquivos: $FILES" >> "$LOG_FILE"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERRO: Backup corrompido!" >> "$LOG_FILE"
    rm -f "$BACKUP_FILE"
    exit 1
  fi
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERRO: Backup não foi criado!" >> "$LOG_FILE"
  exit 1
fi

# Manter apenas últimos 7 backups
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Limpando backups antigos..." >> "$LOG_FILE"
cd "$BACKUP_DIR"
BACKUP_COUNT_BEFORE=$(ls -1 uploads_*.tar.gz 2>/dev/null | wc -l || echo "0")
ls -t uploads_*.tar.gz 2>/dev/null | tail -n +8 | while read file; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')]    Removendo: $file" >> "$LOG_FILE"
  rm -f "$file"
done
BACKUP_COUNT_AFTER=$(ls -1 uploads_*.tar.gz 2>/dev/null | wc -l || echo "0")
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Backups mantidos: $BACKUP_COUNT_AFTER (removidos: $((BACKUP_COUNT_BEFORE - BACKUP_COUNT_AFTER)))" >> "$LOG_FILE"

# Verificar espaço em disco
DISK_USAGE=$(df -h /root | tail -1 | awk '{print $5}' | sed 's/%//' || echo "0")
DISK_FREE=$(df -h /root | tail -1 | awk '{print $4}' || echo "?")
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 💾 Espaço em disco: ${DISK_USAGE}% usado, ${DISK_FREE} livre" >> "$LOG_FILE"

if [ "$DISK_USAGE" -gt 80 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ ALERTA: Uso de disco crítico em ${DISK_USAGE}%!" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ Considere limpar arquivos ou expandir disco" >> "$LOG_FILE"
fi

# Verificar tamanho total dos backups
TOTAL_BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "?")
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📦 Tamanho total de backups: $TOTAL_BACKUP_SIZE" >> "$LOG_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup automático concluído com sucesso" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] =====================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Retornar sucesso
exit 0
