#!/bin/bash
# ========================================
# DEPLOY SCRIPT - MORIA PRISMA + DOCKER
# ✅ Deploy automatizado com Prisma
# ✅ Health checks integrados
# ✅ Backup automático antes do deploy
# ✅ Rollback em caso de falha
# ========================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_NAME="moria"
BACKUP_DIR="./backups"
DEPLOY_TIMEOUT=300

# Funções utilitárias
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."

    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado ou não está no PATH"
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado ou não está no PATH"
    fi

    success "Dependências verificadas"
}

# Backup automático antes do deploy
backup_database() {
    log "Criando backup automático..."

    mkdir -p "$BACKUP_DIR"

    # Verificar se container backend está rodando
    if docker ps | grep -q "moria-backend"; then
        BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).db"

        log "Fazendo backup da base de dados..."
        docker exec moria-backend sqlite3 /app/data/moria.db ".backup /tmp/backup.db" || {
            warn "Falha no backup, mas continuando deploy..."
            return 0
        }

        docker cp moria-backend:/tmp/backup.db "$BACKUP_FILE" || {
            warn "Falha ao copiar backup, mas continuando deploy..."
            return 0
        }

        # Comprimir backup
        gzip "$BACKUP_FILE" 2>/dev/null || true

        success "Backup criado: ${BACKUP_FILE}.gz"
    else
        warn "Container backend não está rodando, pulando backup"
    fi
}

# Verificar saúde dos serviços
health_check() {
    local service=$1
    local max_attempts=30
    local attempt=1

    log "Verificando saúde do serviço: $service"

    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps "$service" | grep -q "healthy\|Up"; then
            success "Serviço $service está saudável"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    error "Serviço $service não ficou saudável após $max_attempts tentativas"
}

# Deploy principal
deploy() {
    log "🚀 Iniciando deploy do Moria (Prisma + Docker)..."

    # 1. Parar aplicação atual
    log "Parando aplicação atual..."
    docker-compose down --remove-orphans || true

    # 2. Limpar containers e imagens antigas
    log "Limpando containers antigos..."
    docker system prune -f || true

    # 3. Build com cache reset se necessário
    log "Building aplicação..."
    if [ "${FORCE_REBUILD:-false}" = "true" ]; then
        docker-compose build --no-cache
    else
        docker-compose build
    fi

    # 4. Subir aplicação
    log "Subindo aplicação..."
    docker-compose up -d

    # 5. Aguardar inicialização
    log "⏳ Aguardando inicialização dos serviços..."
    sleep 30

    # 6. Health checks
    health_check "backend"
    health_check "nginx"

    # 7. Verificar endpoints críticos
    log "Verificando endpoints críticos..."

    # Verificar API health
    timeout 30 bash -c 'until curl -f http://localhost/api/health >/dev/null 2>&1; do sleep 2; done' || {
        error "API health check falhou"
    }

    # Verificar frontend
    timeout 30 bash -c 'until curl -f http://localhost/health >/dev/null 2>&1; do sleep 2; done' || {
        error "Frontend health check falhou"
    }

    success "✅ Deploy realizado com sucesso!"
    log "Aplicação disponível em: http://localhost"
    log "API health: http://localhost/api/health"
    log "Prisma Studio: docker-compose exec backend npx prisma studio"
}

# Rollback em caso de falha
rollback() {
    warn "🔄 Iniciando rollback..."

    # Parar aplicação atual
    docker-compose down || true

    # Tentar restaurar backup mais recente
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.db.gz 2>/dev/null | head -n1)

    if [ -n "$LATEST_BACKUP" ]; then
        log "Restaurando backup: $LATEST_BACKUP"

        # Descomprimir e restaurar
        gunzip -c "$LATEST_BACKUP" > /tmp/restore.db

        # Subir apenas backend para restore
        docker-compose up -d backend
        sleep 10

        # Restaurar database
        docker cp /tmp/restore.db moria-backend:/tmp/
        docker exec moria-backend cp /tmp/restore.db /app/data/moria.db

        # Restart completo
        docker-compose restart

        success "Rollback concluído"
    else
        warn "Nenhum backup encontrado para rollback"
    fi
}

# Monitoramento pós-deploy
monitor() {
    log "📊 Monitorando aplicação pós-deploy..."

    # Logs em tempo real por 30 segundos
    timeout 30s docker-compose logs -f --tail=50 || true

    echo ""
    log "Status dos containers:"
    docker-compose ps

    echo ""
    log "Uso de recursos:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Limpeza pós-deploy
cleanup() {
    log "🧹 Limpeza pós-deploy..."

    # Remover imagens dangling
    docker image prune -f || true

    # Manter apenas os 5 backups mais recentes
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "backup_*.db.gz" -type f | sort -r | tail -n +6 | xargs rm -f 2>/dev/null || true
    fi

    success "Limpeza concluída"
}

# Menu principal
show_menu() {
    echo ""
    echo "🐳 Deploy Moria - Prisma + Docker"
    echo "=================================="
    echo "1) Deploy completo (recomendado)"
    echo "2) Deploy apenas backend"
    echo "3) Deploy apenas frontend/nginx"
    echo "4) Verificar saúde"
    echo "5) Ver logs"
    echo "6) Backup manual"
    echo "7) Rollback"
    echo "8) Limpeza"
    echo "9) Sair"
    echo ""
    read -p "Escolha uma opção: " choice
}

# Execução baseada em argumentos ou menu
main() {
    check_dependencies

    case "${1:-menu}" in
        "deploy"|"full")
            backup_database
            deploy
            monitor
            cleanup
            ;;
        "backend")
            backup_database
            docker-compose up -d --build backend
            health_check "backend"
            ;;
        "frontend"|"nginx")
            docker-compose up -d --build nginx
            health_check "nginx"
            ;;
        "health")
            health_check "backend"
            health_check "nginx"
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "backup")
            backup_database
            ;;
        "rollback")
            rollback
            ;;
        "cleanup")
            cleanup
            ;;
        "menu")
            while true; do
                show_menu
                case $choice in
                    1) backup_database && deploy && monitor && cleanup ;;
                    2) backup_database && docker-compose up -d --build backend && health_check "backend" ;;
                    3) docker-compose up -d --build nginx && health_check "nginx" ;;
                    4) health_check "backend" && health_check "nginx" ;;
                    5) docker-compose logs -f ;;
                    6) backup_database ;;
                    7) rollback ;;
                    8) cleanup ;;
                    9) exit 0 ;;
                    *) warn "Opção inválida" ;;
                esac
                echo ""
                read -p "Pressione Enter para continuar..."
            done
            ;;
        *)
            echo "Uso: $0 [deploy|backend|frontend|health|logs|backup|rollback|cleanup|menu]"
            exit 1
            ;;
    esac
}

# Trap para cleanup em caso de erro
trap 'error "Deploy interrompido"' ERR

# Executar
main "$@"