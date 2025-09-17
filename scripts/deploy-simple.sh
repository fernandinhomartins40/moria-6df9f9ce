#!/bin/bash
# scripts/deploy-simple.sh
# ========================================
# DEPLOY SCRIPT SIMPLES - FASE 4
# Conforme PLANO_MIGRACAO_KNEX_PRISMA_DOCKER.md
# ========================================

echo "🚀 Deploy Moria (Knex → Prisma + Docker)"

# Parar aplicação
docker-compose down

# Build com cache reset
docker-compose build --no-cache

# Subir aplicação
docker-compose up -d

# Aguardar inicialização
echo "⏳ Aguardando Prisma migrations..."
sleep 30

# Health check
echo "🩺 Verificando saúde..."
if curl -f http://localhost/api/health >/dev/null 2>&1; then
    echo "✅ Aplicação rodando: http://localhost"
else
    echo "❌ Erro no deploy"
    docker-compose logs
fi