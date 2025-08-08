#!/bin/bash

# Script de Deploy - Moria Frontend
# Uso: ./deploy.sh [ambiente]
# Ambientes: dev, prod

set -e

# Configurações
ENVIRONMENT=${1:-prod}
CONTAINER_NAME="moria-frontend"
IMAGE_NAME="moria-frontend"
PORT=3018

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker não está rodando. Inicie o Docker e tente novamente."
        exit 1
    fi
    log_success "Docker está rodando"
}

# Limpar containers antigos
cleanup() {
    log_info "Limpando containers antigos..."
    
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        log_info "Parando container existente..."
        docker stop $CONTAINER_NAME
    fi
    
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
        log_info "Removendo container existente..."
        docker rm $CONTAINER_NAME
    fi
    
    # Remover imagens não utilizadas
    docker image prune -f
    
    log_success "Limpeza concluída"
}

# Build da aplicação
build_app() {
    log_info "Iniciando build da aplicação..."
    
    # Build da imagem Docker
    docker build -t $IMAGE_NAME:latest .
    
    if [ $? -eq 0 ]; then
        log_success "Build concluído com sucesso"
    else
        log_error "Falha no build"
        exit 1
    fi
}

# Deploy da aplicação
deploy_app() {
    log_info "Iniciando deploy..."
    
    # Executar docker-compose
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        log_success "Deploy concluído com sucesso"
    else
        log_error "Falha no deploy"
        exit 1
    fi
}

# Verificar saúde da aplicação
health_check() {
    log_info "Verificando saúde da aplicação..."
    
    # Aguardar container inicializar
    sleep 10
    
    # Tentar acessar o endpoint de saúde
    for i in {1..30}; do
        if curl -f http://localhost:$PORT/health >/dev/null 2>&1; then
            log_success "Aplicação está saudável e rodando na porta $PORT"
            return 0
        fi
        log_info "Tentativa $i/30 - Aguardando aplicação..."
        sleep 2
    done
    
    log_error "Aplicação não respondeu ao health check"
    log_info "Verificando logs do container..."
    docker logs $CONTAINER_NAME
    exit 1
}

# Mostrar status
show_status() {
    log_info "Status dos containers:"
    docker ps -a --filter name=$CONTAINER_NAME
    
    log_info "Logs recentes:"
    docker logs --tail 20 $CONTAINER_NAME
}

# Menu principal
main() {
    echo "======================================"
    echo "    DEPLOY MORIA FRONTEND - $ENVIRONMENT"
    echo "======================================"
    
    check_docker
    cleanup
    build_app
    deploy_app
    health_check
    show_status
    
    log_success "Deploy finalizado! Aplicação disponível em http://localhost:$PORT"
}

# Verificar argumentos
case "$1" in
    "dev"|"prod"|"")
        main
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "logs")
        docker logs -f $CONTAINER_NAME
        ;;
    *)
        echo "Uso: $0 [dev|prod|status|cleanup|logs]"
        echo "  dev/prod: Deploy da aplicação"
        echo "  status: Mostrar status dos containers"
        echo "  cleanup: Limpar containers antigos"
        echo "  logs: Mostrar logs em tempo real"
        exit 1
        ;;
esac