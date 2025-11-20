#!/bin/bash

# Script de Verificação Pré-Deploy
# Moria Peças e Serviços
# Executa verificações críticas antes de cada deploy

set -e

VOLUME_NAME="moria-6df9f9ce_uploads_data"
BACKUP_DIR="/root/moria-backups/uploads"
MIN_DISK_FREE_GB=5

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "======================================"
echo "🔍 Verificação Pré-Deploy - Moria"
echo "======================================"
echo ""

# Contador de erros
ERRORS=0
WARNINGS=0

# 1. Verificar se volume existe
echo -e "${BLUE}[1/6]${NC} Verificando volume Docker..."
if ! docker volume ls | grep -q "$VOLUME_NAME"; then
  echo -e "${RED}❌ ERRO CRÍTICO: Volume $VOLUME_NAME não encontrado!${NC}"
  echo -e "${RED}   O volume de uploads não existe. Imagens serão perdidas!${NC}"
  echo -e "${YELLOW}   Ações possíveis:${NC}"
  echo -e "${YELLOW}   1. Restaurar do backup: ./scripts/restore-uploads-advanced.sh${NC}"
  echo -e "${YELLOW}   2. Criar volume vazio: docker volume create $VOLUME_NAME${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Volume encontrado: $VOLUME_NAME${NC}"

  # Obter informações do volume
  VOLUME_PATH=$(docker volume inspect "$VOLUME_NAME" --format '{{ .Mountpoint }}' 2>/dev/null || echo "N/A")
  echo "   Localização: $VOLUME_PATH"
fi
echo ""

# 2. Contar arquivos no volume
echo -e "${BLUE}[2/6]${NC} Contando arquivos de imagens..."
FILE_COUNT=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  find /data/products -type f 2>/dev/null | wc -l || echo "0")

if [ "$FILE_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  AVISO: Nenhum arquivo encontrado no volume${NC}"
  echo "   Isso é normal para novo deploy ou volume recém-criado"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ Arquivos encontrados: $FILE_COUNT${NC}"

  # Calcular tamanho do volume
  VOLUME_SIZE=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
    du -sh /data 2>/dev/null | cut -f1 || echo "N/A")
  echo "   Tamanho total: $VOLUME_SIZE"
fi
echo ""

# 3. Verificar último backup
echo -e "${BLUE}[3/6]${NC} Verificando backups..."
if [ -d "$BACKUP_DIR" ]; then
  LAST_BACKUP=$(ls -t "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null | head -1 || echo "")

  if [ -z "$LAST_BACKUP" ]; then
    echo -e "${YELLOW}⚠️  AVISO: Nenhum backup encontrado!${NC}"
    echo -e "${YELLOW}   Recomenda-se criar backup antes do deploy${NC}"
    echo -e "${YELLOW}   Execute: ./scripts/auto-backup-uploads.sh${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LAST_BACKUP" 2>/dev/null || stat -f %m "$LAST_BACKUP" 2>/dev/null || echo "0")) / 86400 ))
    BACKUP_SIZE=$(du -h "$LAST_BACKUP" | cut -f1)
    BACKUP_NAME=$(basename "$LAST_BACKUP")

    echo -e "${GREEN}✅ Último backup: $BACKUP_NAME${NC}"
    echo "   Tamanho: $BACKUP_SIZE"
    echo "   Idade: ${BACKUP_AGE} dia(s)"

    if [ "$BACKUP_AGE" -gt 2 ]; then
      echo -e "${YELLOW}⚠️  AVISO: Backup tem mais de 2 dias${NC}"
      echo -e "${YELLOW}   Considere criar novo backup antes do deploy${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi

    # Contar backups disponíveis
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null | wc -l || echo "0")
    echo "   Backups disponíveis: $BACKUP_COUNT"
  fi
else
  echo -e "${YELLOW}⚠️  AVISO: Diretório de backup não existe${NC}"
  echo "   Será criado em: $BACKUP_DIR"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 4. Verificar espaço em disco
echo -e "${BLUE}[4/6]${NC} Verificando espaço em disco..."
DISK_FREE_GB=$(df -BG /root | tail -1 | awk '{print $4}' | sed 's/G//' || echo "0")
DISK_USAGE_PERCENT=$(df -h /root | tail -1 | awk '{print $5}' | sed 's/%//' || echo "0")
DISK_FREE_HUMAN=$(df -h /root | tail -1 | awk '{print $4}' || echo "?")

echo "   Espaço livre: $DISK_FREE_HUMAN"
echo "   Uso: ${DISK_USAGE_PERCENT}%"

if [ "$DISK_FREE_GB" -lt "$MIN_DISK_FREE_GB" ]; then
  echo -e "${RED}❌ ERRO: Espaço em disco insuficiente!${NC}"
  echo -e "${RED}   Mínimo necessário: ${MIN_DISK_FREE_GB}GB${NC}"
  echo -e "${RED}   Disponível: ${DISK_FREE_GB}GB${NC}"
  ERRORS=$((ERRORS + 1))
elif [ "$DISK_USAGE_PERCENT" -gt 80 ]; then
  echo -e "${YELLOW}⚠️  AVISO: Uso de disco acima de 80%${NC}"
  echo -e "${YELLOW}   Considere limpar arquivos antigos${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✅ Espaço em disco adequado${NC}"
fi
echo ""

# 5. Verificar containers
echo -e "${BLUE}[5/6]${NC} Verificando containers..."
if docker ps -a | grep -q moria-vps; then
  CONTAINER_STATUS=$(docker inspect moria-vps --format '{{.State.Status}}' 2>/dev/null || echo "unknown")
  echo "   Container moria-vps: $CONTAINER_STATUS"

  if [ "$CONTAINER_STATUS" == "running" ]; then
    echo -e "${GREEN}✅ Container está rodando${NC}"
  else
    echo -e "${YELLOW}⚠️  Container não está rodando (será iniciado no deploy)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Container moria-vps não existe (será criado no deploy)${NC}"
fi

if docker ps -a | grep -q moria-postgres; then
  PG_STATUS=$(docker inspect moria-postgres --format '{{.State.Status}}' 2>/dev/null || echo "unknown")
  echo "   Container moria-postgres: $PG_STATUS"

  if [ "$PG_STATUS" == "running" ]; then
    echo -e "${GREEN}✅ PostgreSQL está rodando${NC}"
  else
    echo -e "${YELLOW}⚠️  PostgreSQL não está rodando (será iniciado no deploy)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Container PostgreSQL não existe (será criado no deploy)${NC}"
fi
echo ""

# 6. Verificar docker-compose.vps.yml
echo -e "${BLUE}[6/6]${NC} Verificando configuração do Docker Compose..."
if [ -f "docker-compose.vps.yml" ]; then
  echo -e "${GREEN}✅ docker-compose.vps.yml encontrado${NC}"

  # Verificar se volume está configurado
  if grep -q "uploads_data:/app/apps/backend/uploads" docker-compose.vps.yml; then
    echo -e "${GREEN}✅ Volume uploads_data está configurado corretamente${NC}"
  else
    echo -e "${RED}❌ ERRO: Volume uploads_data não está configurado!${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}❌ ERRO: docker-compose.vps.yml não encontrado!${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Resumo final
echo "======================================"
echo "📊 Resumo da Verificação"
echo "======================================"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}✅ Todas as verificações passaram!${NC}"
  echo -e "${GREEN}   Sistema pronto para deploy${NC}"
  echo ""
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Verificação concluída com avisos${NC}"
  echo "   Erros críticos: $ERRORS"
  echo "   Avisos: $WARNINGS"
  echo ""
  echo -e "${YELLOW}Deploy pode prosseguir, mas revise os avisos acima${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Verificação FALHOU!${NC}"
  echo "   Erros críticos: $ERRORS"
  echo "   Avisos: $WARNINGS"
  echo ""
  echo -e "${RED}CORRIJA OS ERROS ANTES DE FAZER DEPLOY!${NC}"
  echo ""
  exit 1
fi
