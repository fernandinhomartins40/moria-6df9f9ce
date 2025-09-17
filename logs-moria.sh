#!/bin/bash
# ========================================
# SCRIPT SIMPLES - VER LOGS MORIA
# ========================================

VPS_HOST="72.60.10.108"
VPS_USER="root"

echo "🔍 Conectando ao VPS para ver logs..."

# Solicitar senha
if [ -z "$VPS_PASSWORD" ]; then
    echo "Digite a senha do VPS:"
    read -s VPS_PASSWORD
fi

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" << 'LOGS_SCRIPT'

echo "📊 === STATUS CONTAINERS ==="
docker compose -p moria ps

echo ""
echo "🔍 === LOGS DO BACKEND (ÚLTIMAS 100 LINHAS) ==="
docker compose -p moria logs backend --tail 100

echo ""
echo "🩺 === TESTANDO HEALTH CHECK ==="
docker exec moria-backend curl -f http://localhost:3001/api/health 2>&1 || echo "❌ Health check falhou"

LOGS_SCRIPT