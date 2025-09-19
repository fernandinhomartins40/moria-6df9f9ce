#!/bin/bash

# ========================================
# SCRIPT DE DEPLOY SIMPLES - MORIA FULL STACK
# ✅ Deploy automatizado para ambiente de desenvolvimento
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

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não encontrado! Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose não encontrado! Por favor, instale o Docker Compose."
    exit 1
fi

print_status "Iniciando deploy simples do Moria Full Stack..."

# Parar containers existentes
print_status "Parando containers existentes..."
docker compose down --volumes --remove-orphans 2>/dev/null || true

# Limpar recursos órfãos
print_status "Limpando recursos órfãos..."
docker compose down --volumes --remove-orphans 2>/dev/null || true
docker network prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true

# Construir imagens
print_status "Construindo imagens com Docker Compose..."
docker compose build --no-cache

# Iniciar serviços
print_status "Iniciando serviços..."
docker compose up -d

# Aguardar inicialização
print_status "Aguardando inicialização dos serviços (60 segundos)..."
sleep 60

# Verificar status dos containers
print_status "Verificando status dos containers..."
docker compose ps

# Testar health checks
print_status "Testando health checks..."

# Testar nginx
print_status "Testando health check do nginx..."
for i in {1..10}; do
    if curl -f -s http://localhost:3030/health >/dev/null 2>&1; then
        print_success "Nginx health check passou!"
        break
    fi
    echo "Nginx - Tentativa $i/10 - aguardando 3s..."
    sleep 3
done

# Testar API
print_status "Testando health check da API..."
for i in {1..10}; do
    if curl -f -s http://localhost:3030/api/health >/dev/null 2>&1; then
        print_success "API health check passou!"
        break
    fi
    echo "API - Tentativa $i/10 - aguardando 3s..."
    sleep 3
done

# Verificação final
print_status "Realizando verificação final..."
if curl -f -s http://localhost:3030/health >/dev/null 2>&1 && curl -f -s http://localhost:3030/api/health >/dev/null 2>&1; then
    print_success "🎉 DEPLOY SIMPLES CONCLUÍDO COM SUCESSO!"
    echo ""
    echo "🔗 Acesse a aplicação:"
    echo "🌐 Frontend: http://localhost:3030"
    echo "🔌 Backend API: http://localhost:3030/api"
    echo "🩺 Health Check: http://localhost:3030/health"
    echo ""
    echo "📋 Comandos úteis:"
    echo "  Ver logs: docker compose logs -f"
    echo "  Parar: docker compose down"
    echo "  Reiniciar: ./scripts/deploy-simple.sh"
else
    print_error "Falha na verificação final!"
    echo "Exibindo logs detalhados..."
    docker compose logs --tail 30
    exit 1
fi