#!/bin/bash

# Script de Monitoramento de Uploads
# Moria Peças e Serviços
# Executa a cada 6 horas via cron para monitorar volume de uploads

set -e

VOLUME_NAME="moria-6df9f9ce_uploads_data"
LOG_FILE="/var/log/moria-monitor.log"
LAST_COUNT_FILE="/tmp/moria-last-count"
LAST_SIZE_FILE="/tmp/moria-last-size"

# Criar log se não existir
touch "$LOG_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] =====================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando monitoramento de uploads..." >> "$LOG_FILE"

# 1. Verificar se volume existe
if ! docker volume ls | grep -q "$VOLUME_NAME"; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ALERTA CRÍTICO: Volume $VOLUME_NAME não encontrado!" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] O volume de uploads foi removido ou não existe!" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] AÇÃO NECESSÁRIA: Restaurar do backup imediatamente!" >> "$LOG_FILE"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Volume existe: $VOLUME_NAME" >> "$LOG_FILE"

# 2. Contar arquivos no volume
FILE_COUNT=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  find /data/products -type f 2>/dev/null | wc -l || echo "0")

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Arquivos encontrados: $FILE_COUNT" >> "$LOG_FILE"

# 3. Calcular tamanho do volume
VOLUME_SIZE_BYTES=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  du -sb /data 2>/dev/null | cut -f1 || echo "0")
VOLUME_SIZE_HUMAN=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  du -sh /data 2>/dev/null | cut -f1 || echo "0")

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Tamanho do volume: $VOLUME_SIZE_HUMAN" >> "$LOG_FILE"

# 4. Comparar com última verificação (detectar perda de arquivos)
if [ -f "$LAST_COUNT_FILE" ]; then
  LAST_COUNT=$(cat "$LAST_COUNT_FILE")
  DIFF=$((FILE_COUNT - LAST_COUNT))

  if [ "$DIFF" -lt 0 ]; then
    LOST=$((DIFF * -1))
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ ALERTA: Perda de $LOST arquivo(s) detectada!" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Contagem anterior: $LAST_COUNT" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Contagem atual: $FILE_COUNT" >> "$LOG_FILE"

    # Alerta crítico se perda significativa
    if [ "$LOST" -gt 10 ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ALERTA CRÍTICO: Perda significativa de arquivos!" >> "$LOG_FILE"
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] AÇÃO NECESSÁRIA: Investigar causa e restaurar do backup!" >> "$LOG_FILE"
    fi
  elif [ "$DIFF" -gt 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Novos arquivos: +$DIFF" >> "$LOG_FILE"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Sem alterações na contagem de arquivos" >> "$LOG_FILE"
  fi
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️ Primeira execução - estabelecendo baseline" >> "$LOG_FILE"
fi

# Salvar contagem atual
echo "$FILE_COUNT" > "$LAST_COUNT_FILE"

# 5. Comparar tamanho (detectar corrupção ou alterações suspeitas)
if [ -f "$LAST_SIZE_FILE" ]; then
  LAST_SIZE=$(cat "$LAST_SIZE_FILE")
  SIZE_DIFF=$((VOLUME_SIZE_BYTES - LAST_SIZE))

  if [ "$SIZE_DIFF" -lt 0 ]; then
    SIZE_LOST=$(echo "scale=2; ($SIZE_DIFF * -1) / 1048576" | bc 2>/dev/null || echo "?")
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ ALERTA: Redução de ${SIZE_LOST}MB no volume" >> "$LOG_FILE"
  elif [ "$SIZE_DIFF" -gt 0 ]; then
    SIZE_ADDED=$(echo "scale=2; $SIZE_DIFF / 1048576" | bc 2>/dev/null || echo "?")
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Crescimento: +${SIZE_ADDED}MB" >> "$LOG_FILE"
  fi
fi

# Salvar tamanho atual
echo "$VOLUME_SIZE_BYTES" > "$LAST_SIZE_FILE"

# 6. Verificar últimos arquivos modificados
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Últimas modificações:" >> "$LOG_FILE"
RECENT_FILES=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  find /data/products -type f -mtime -1 2>/dev/null | wc -l || echo "0")

if [ "$RECENT_FILES" -gt 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Arquivos modificados nas últimas 24h: $RECENT_FILES" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️ Nenhum arquivo modificado nas últimas 24h" >> "$LOG_FILE"
fi

# 7. Verificar saúde do container
if docker ps | grep -q moria-vps; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Container moria-vps está rodando" >> "$LOG_FILE"

  # Verificar se o diretório está acessível dentro do container
  if docker exec moria-vps test -d /app/apps/backend/uploads/products 2>/dev/null; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Diretório de uploads acessível no container" >> "$LOG_FILE"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ALERTA: Diretório de uploads NÃO acessível no container!" >> "$LOG_FILE"
  fi
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ AVISO: Container moria-vps não está rodando" >> "$LOG_FILE"
fi

# 8. Verificar espaço em disco do host
DISK_USAGE=$(df -h /var/lib/docker | tail -1 | awk '{print $5}' | sed 's/%//' || echo "0")
DISK_FREE=$(df -h /var/lib/docker | tail -1 | awk '{print $4}' || echo "?")

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 💾 Disco: ${DISK_USAGE}% usado, ${DISK_FREE} livre" >> "$LOG_FILE"

if [ "$DISK_USAGE" -gt 90 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ALERTA CRÍTICO: Disco quase cheio (${DISK_USAGE}%)!" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] AÇÃO NECESSÁRIA: Liberar espaço urgentemente!" >> "$LOG_FILE"
elif [ "$DISK_USAGE" -gt 80 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ AVISO: Disco acima de 80% (${DISK_USAGE}%)" >> "$LOG_FILE"
fi

# 9. Verificar último backup
BACKUP_DIR="/root/moria-backups/uploads"
if [ -d "$BACKUP_DIR" ]; then
  LAST_BACKUP=$(ls -t "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null | head -1 || echo "")

  if [ -n "$LAST_BACKUP" ]; then
    BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LAST_BACKUP" 2>/dev/null || stat -f %m "$LAST_BACKUP" 2>/dev/null || echo "0")) / 86400 ))
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Último backup: $(basename $LAST_BACKUP) (${BACKUP_AGE} dias)" >> "$LOG_FILE"

    if [ "$BACKUP_AGE" -gt 7 ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ AVISO: Backup tem mais de 7 dias!" >> "$LOG_FILE"
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Considere executar backup manual" >> "$LOG_FILE"
    fi
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ AVISO: Nenhum backup encontrado!" >> "$LOG_FILE"
  fi
fi

# 10. Resumo
echo "[$(date '+%Y-%m-%d %H:%M:%S')] =====================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Resumo do monitoramento:" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] • Volume: $VOLUME_NAME" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] • Arquivos: $FILE_COUNT" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] • Tamanho: $VOLUME_SIZE_HUMAN" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] • Disco: ${DISK_USAGE}% usado" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Monitoramento concluído" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] =====================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit 0
