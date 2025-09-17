#!/bin/bash
# ========================================
# DEBUG DEPLOY SCRIPT - MORIA
# Investigação direta no VPS via SSH
# ========================================

VPS_HOST="72.60.10.108"
VPS_USER="root"
APP_DIR="/root/moria-pecas-servicos"

echo "🔍 === INICIANDO DEBUG NO VPS ==="
echo "📡 Conectando ao VPS: ${VPS_HOST}"

# Solicitar senha se não estiver nas variáveis
if [ -z "$VPS_PASSWORD" ]; then
    echo "Digite a senha do VPS:"
    read -s VPS_PASSWORD
fi

echo "🔧 Executando debug direto no VPS..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_HOST" << 'DEBUG_SCRIPT'
set -e

echo "🚀 === DEBUG MORIA BACKEND ==="
echo "📋 Data/Hora: $(date)"
echo "📋 Usuário: $(whoami)"
echo "📋 Diretório: $(pwd)"

# Ir para diretório da aplicação
if [ -d "/root/moria-pecas-servicos" ]; then
    cd /root/moria-pecas-servicos
    echo "✅ Diretório da aplicação encontrado"
else
    echo "❌ Diretório da aplicação não encontrado!"
    exit 1
fi

echo ""
echo "🐳 === STATUS DOCKER ==="
docker --version
docker compose version
echo ""

echo "📊 === STATUS CONTAINERS ATUAIS ==="
docker compose -p moria ps
echo ""

echo "⏹️ === PARANDO CONTAINERS ==="
docker compose -p moria down --volumes --remove-orphans
echo ""

echo "🧹 === LIMPEZA DE IMAGENS ANTIGAS ==="
docker images | grep moria | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
echo ""

echo "🔨 === REBUILD COM LOGS DETALHADOS ==="
echo "🔍 Verificando arquivos essenciais..."
ls -la docker-compose.yml nginx.conf Dockerfile.nginx
ls -la backend/Dockerfile backend/package.json backend/server.js
ls -la backend/prisma/schema.prisma
echo ""

echo "⚙️ === CONFIGURANDO VARIÁVEIS ==="
export NGINX_PORT=3032
export NODE_ENV=production
export BUILD_TIMESTAMP=$(date +%s)
echo "NGINX_PORT=$NGINX_PORT"
echo "NODE_ENV=$NODE_ENV"
echo "BUILD_TIMESTAMP=$BUILD_TIMESTAMP"
echo ""

echo "🏗️ === INICIANDO BUILD ==="
DOCKER_BUILDKIT=1 docker compose -p moria build --no-cache backend

echo ""
echo "🚀 === INICIANDO CONTAINER BACKEND (COM LOGS) ==="
docker compose -p moria up backend --no-deps &

# Aguardar um pouco para o container inicializar
sleep 10

echo ""
echo "📊 === STATUS DOS CONTAINERS ==="
docker compose -p moria ps

echo ""
echo "🔍 === LOGS DETALHADOS DO BACKEND ==="
echo "Primeiros 50 linhas dos logs:"
docker compose -p moria logs backend --tail 50

echo ""
echo "🩺 === TESTANDO HEALTH CHECK INTERNO ==="
echo "Tentando acessar health check dentro do container..."
docker exec moria-backend curl -v http://localhost:3001/api/health 2>&1 || echo "❌ Health check falhou"

echo ""
echo "🔍 === VERIFICANDO PROCESSO NODE ==="
docker exec moria-backend ps aux | grep node || echo "❌ Processo node não encontrado"

echo ""
echo "🔍 === VERIFICANDO PORTA 3001 ==="
docker exec moria-backend netstat -tuln | grep 3001 || echo "❌ Porta 3001 não está escutando"

echo ""
echo "🔍 === ÚLTIMAS 20 LINHAS DOS LOGS EM TEMPO REAL ==="
timeout 30 docker compose -p moria logs -f backend --tail 20 || echo "Timeout dos logs"

DEBUG_SCRIPT

echo ""
echo "✅ Debug concluído!"
echo "💡 Analise os logs acima para identificar o problema exato."