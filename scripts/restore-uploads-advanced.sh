#!/bin/bash

# Script de Restauração Avançada de Uploads
# Moria Peças e Serviços
# Versão aprimorada com validações e backup de segurança

set -e

BACKUP_FILE="$1"
VOLUME_NAME="moria-6df9f9ce_uploads_data"
BACKUP_DIR="/root/moria-backups/uploads"
SAFETY_BACKUP_DIR="/root/moria-backups/safety"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "======================================"
echo "♻️  Restauração Avançada de Uploads"
echo "======================================"
echo ""

# Verificar se foi passado argumento
if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Uso: $0 <arquivo-backup.tar.gz>${NC}"
  echo ""
  echo "Backups disponíveis:"
  echo ""

  if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/uploads_*.tar.gz 2>/dev/null)" ]; then
    ls -lht "$BACKUP_DIR"/uploads_*.tar.gz | head -10 | while read -r line; do
      echo "  $line"
    done
    echo ""
    echo "💡 Exemplo de uso:"
    LATEST=$(ls -t "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null | head -1)
    echo "   $0 $LATEST"
  else
    echo "  Nenhum backup encontrado em $BACKUP_DIR"
  fi

  echo ""
  exit 1
fi

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Arquivo de backup não encontrado: $BACKUP_FILE${NC}"
  exit 1
fi

# Validar integridade do backup
echo -e "${BLUE}[1/8]${NC} Validando integridade do backup..."
if ! tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
  echo -e "${RED}❌ ERRO: Backup corrompido ou inválido!${NC}"
  echo "O arquivo não é um tar.gz válido"
  exit 1
fi

BACKUP_FILES=$(tar -tzf "$BACKUP_FILE" 2>/dev/null | grep -v '/$' | wc -l || echo "0")
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}✅ Backup válido${NC}"
echo "   Arquivo: $(basename $BACKUP_FILE)"
echo "   Tamanho: $BACKUP_SIZE"
echo "   Arquivos: $BACKUP_FILES"
echo ""

# Verificar se volume existe
echo -e "${BLUE}[2/8]${NC} Verificando volume Docker..."
if ! docker volume ls | grep -q "$VOLUME_NAME"; then
  echo -e "${YELLOW}⚠️  Volume $VOLUME_NAME não existe${NC}"
  echo "Criando volume..."
  docker volume create "$VOLUME_NAME"
  echo -e "${GREEN}✅ Volume criado${NC}"
else
  echo -e "${GREEN}✅ Volume encontrado${NC}"
fi
echo ""

# Contar arquivos atuais
echo -e "${BLUE}[3/8]${NC} Verificando arquivos atuais..."
CURRENT_FILES=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  find /data/products -type f 2>/dev/null | wc -l || echo "0")

if [ "$CURRENT_FILES" -eq 0 ]; then
  echo "   Nenhum arquivo existente (volume vazio)"
  SKIP_SAFETY_BACKUP=true
else
  echo "   Arquivos atuais: $CURRENT_FILES"
  SKIP_SAFETY_BACKUP=false
fi
echo ""

# Confirmar ação
echo -e "${YELLOW}⚠️  ATENÇÃO:${NC}"
echo "Esta operação irá:"
if [ "$SKIP_SAFETY_BACKUP" = false ]; then
  echo "  1. Fazer backup dos arquivos atuais"
  echo "  2. SOBRESCREVER todos os arquivos no volume"
  echo "  3. Restaurar $BACKUP_FILES arquivo(s) do backup"
else
  echo "  1. Restaurar $BACKUP_FILES arquivo(s) do backup para o volume vazio"
fi
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}❌ Operação cancelada pelo usuário${NC}"
  exit 0
fi
echo ""

# Criar backup de segurança dos arquivos atuais
if [ "$SKIP_SAFETY_BACKUP" = false ]; then
  echo -e "${BLUE}[4/8]${NC} Criando backup de segurança dos arquivos atuais..."
  mkdir -p "$SAFETY_BACKUP_DIR"

  SAFETY_BACKUP="$SAFETY_BACKUP_DIR/safety_before_restore_$(date +"%Y%m%d_%H%M%S").tar.gz"

  docker run --rm \
    -v "${VOLUME_NAME}:/data:ro" \
    -v "${SAFETY_BACKUP_DIR}:/backup" \
    alpine:latest \
    tar czf "/backup/$(basename $SAFETY_BACKUP)" -C /data . 2>/dev/null

  if [ -f "$SAFETY_BACKUP" ]; then
    SAFETY_SIZE=$(du -h "$SAFETY_BACKUP" | cut -f1)
    echo -e "${GREEN}✅ Backup de segurança criado${NC}"
    echo "   Arquivo: $SAFETY_BACKUP"
    echo "   Tamanho: $SAFETY_SIZE"
  else
    echo -e "${RED}❌ Falha ao criar backup de segurança${NC}"
    read -p "Deseja continuar sem backup de segurança? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
      echo "Operação cancelada"
      exit 1
    fi
  fi
else
  echo -e "${BLUE}[4/8]${NC} Pulando backup de segurança (volume vazio)"
fi
echo ""

# Parar containers se estiverem rodando
echo -e "${BLUE}[5/8]${NC} Parando containers..."
cd /root/moria 2>/dev/null || cd "$(dirname $(dirname $(realpath $0)))" || true

if docker-compose -f docker-compose.vps.yml ps | grep -q "Up"; then
  docker-compose -f docker-compose.vps.yml down
  echo -e "${GREEN}✅ Containers parados${NC}"
  RESTART_CONTAINERS=true
else
  echo "   Containers já estavam parados"
  RESTART_CONTAINERS=false
fi
echo ""

# Limpar volume
echo -e "${BLUE}[6/8]${NC} Limpando volume..."
docker run --rm \
  -v "${VOLUME_NAME}:/data" \
  alpine:latest \
  sh -c "rm -rf /data/* /data/.[!.]* 2>/dev/null || true"
echo -e "${GREEN}✅ Volume limpo${NC}"
echo ""

# Restaurar backup
echo -e "${BLUE}[7/8]${NC} Restaurando arquivos do backup..."
docker run --rm \
  -v "${VOLUME_NAME}:/data" \
  -v "$(dirname $(realpath $BACKUP_FILE)):/backup:ro" \
  alpine:latest \
  tar xzf "/backup/$(basename $BACKUP_FILE)" -C /data 2>/dev/null

echo -e "${GREEN}✅ Arquivos extraídos${NC}"
echo ""

# Verificar restauração
echo -e "${BLUE}[8/8]${NC} Verificando restauração..."
RESTORED_FILES=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  find /data -type f 2>/dev/null | wc -l || echo "0")

if [ "$RESTORED_FILES" -eq 0 ]; then
  echo -e "${RED}❌ ERRO: Nenhum arquivo foi restaurado!${NC}"
  echo ""
  echo "Possíveis causas:"
  echo "  • Backup está vazio"
  echo "  • Estrutura de diretórios incorreta no backup"
  echo ""

  if [ "$SKIP_SAFETY_BACKUP" = false ] && [ -f "$SAFETY_BACKUP" ]; then
    echo "💡 Você pode restaurar o estado anterior com:"
    echo "   $0 $SAFETY_BACKUP"
  fi

  exit 1
fi

RESTORED_SIZE=$(docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine:latest \
  du -sh /data 2>/dev/null | cut -f1 || echo "?")

echo -e "${GREEN}✅ Restauração concluída com sucesso!${NC}"
echo ""
echo "   Arquivos restaurados: $RESTORED_FILES"
echo "   Tamanho total: $RESTORED_SIZE"

if [ "$SKIP_SAFETY_BACKUP" = false ]; then
  echo "   Backup de segurança: $SAFETY_BACKUP"
fi
echo ""

# Ajustar permissões
echo "🔧 Ajustando permissões..."
docker run --rm \
  -v "${VOLUME_NAME}:/data" \
  alpine:latest \
  sh -c "chmod -R 755 /data && chown -R root:root /data" 2>/dev/null || true
echo -e "${GREEN}✅ Permissões ajustadas${NC}"
echo ""

# Reiniciar containers se necessário
if [ "$RESTART_CONTAINERS" = true ]; then
  echo "🚀 Reiniciando containers..."
  docker-compose -f docker-compose.vps.yml up -d
  echo -e "${GREEN}✅ Containers reiniciados${NC}"
  echo ""
  echo "⏳ Aguardando aplicação inicializar (10s)..."
  sleep 10
fi

# Verificação final
echo "======================================"
echo "✅ Restauração Concluída"
echo "======================================"
echo ""
echo "📊 Resumo:"
echo "  • Backup restaurado: $(basename $BACKUP_FILE)"
echo "  • Arquivos restaurados: $RESTORED_FILES"
echo "  • Tamanho: $RESTORED_SIZE"
echo ""

if [ "$SKIP_SAFETY_BACKUP" = false ]; then
  echo "💾 Backup de segurança dos arquivos anteriores:"
  echo "   $SAFETY_BACKUP"
  echo ""
fi

echo "💡 Próximos passos:"
echo "  1. Verifique as imagens no site"
echo "  2. Teste upload de uma nova imagem"
echo "  3. Se tudo estiver OK, pode deletar o backup de segurança"
echo ""

exit 0
