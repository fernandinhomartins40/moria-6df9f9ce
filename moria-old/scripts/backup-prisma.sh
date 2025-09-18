#!/bin/bash
# ========================================
# BACKUP SCRIPT - MORIA PRISMA DATABASE
# ✅ Backup automático do SQLite Prisma
# ✅ Compressão automática
# ✅ Limpeza de backups antigos
# ✅ Validação de integridade
# ========================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
BACKUP_DIR="./backups"
MAX_BACKUPS=10
CONTAINER_NAME="moria-backend"
DB_PATH="/app/data/moria.db"

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

# Verificar se container está rodando
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error "Container $CONTAINER_NAME não está rodando"
    fi
    success "Container $CONTAINER_NAME está ativo"
}

# Criar diretório de backup
setup_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log "Diretório de backup: $BACKUP_DIR"
}

# Backup principal
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/moria_backup_${timestamp}.db"
    local compressed_file="${backup_file}.gz"

    log "Iniciando backup da base de dados..."

    # 1. Backup direto via SQLite
    log "Executando backup SQLite..."
    docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" ".backup /tmp/backup_temp.db" || {
        error "Falha ao criar backup SQLite"
    }

    # 2. Copiar backup do container
    log "Copiando backup do container..."
    docker cp "$CONTAINER_NAME:/tmp/backup_temp.db" "$backup_file" || {
        error "Falha ao copiar backup do container"
    }

    # 3. Validar integridade do backup
    log "Validando integridade do backup..."
    if sqlite3 "$backup_file" "PRAGMA integrity_check;" | grep -q "ok"; then
        success "Backup íntegro"
    else
        error "Backup corrompido"
    fi

    # 4. Comprimir backup
    log "Comprimindo backup..."
    gzip "$backup_file" || {
        error "Falha ao comprimir backup"
    }

    # 5. Verificar tamanho
    local size=$(du -h "$compressed_file" | cut -f1)
    success "Backup criado: $compressed_file (${size})"

    # 6. Limpar arquivo temporário do container
    docker exec "$CONTAINER_NAME" rm -f /tmp/backup_temp.db 2>/dev/null || true

    echo "$compressed_file"
}

# Validar backup existente
validate_backup() {
    local backup_file=$1

    if [[ ! -f "$backup_file" ]]; then
        error "Arquivo de backup não encontrado: $backup_file"
    fi

    log "Validando backup: $(basename "$backup_file")"

    # Descomprimir temporariamente para validação
    local temp_file="/tmp/temp_backup_validation.db"
    gunzip -c "$backup_file" > "$temp_file"

    # Verificar integridade
    if sqlite3 "$temp_file" "PRAGMA integrity_check;" | grep -q "ok"; then
        success "Backup válido"
    else
        error "Backup corrompido: $backup_file"
    fi

    # Verificar se tem dados
    local table_count=$(sqlite3 "$temp_file" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
    if [ "$table_count" -gt 0 ]; then
        success "Backup contém $table_count tabelas"
    else
        warn "Backup parece estar vazio"
    fi

    # Limpar arquivo temporário
    rm -f "$temp_file"
}

# Listar backups disponíveis
list_backups() {
    log "Backups disponíveis em $BACKUP_DIR:"
    echo ""

    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        warn "Nenhum backup encontrado"
        return
    fi

    printf "%-30s %-15s %-20s\n" "ARQUIVO" "TAMANHO" "DATA"
    printf "%-30s %-15s %-20s\n" "$(printf '%*s' 30 '' | tr ' ' '-')" "$(printf '%*s' 15 '' | tr ' ' '-')" "$(printf '%*s' 20 '' | tr ' ' '-')"

    for backup in "$BACKUP_DIR"/moria_backup_*.db.gz; do
        if [ -f "$backup" ]; then
            local filename=$(basename "$backup")
            local size=$(du -h "$backup" | cut -f1)
            local date=$(stat -c %y "$backup" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1 || date -r "$backup" "+%Y-%m-%d %H:%M:%S")
            printf "%-30s %-15s %-20s\n" "$filename" "$size" "$date"
        fi
    done
}

# Limpeza de backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos (mantendo os $MAX_BACKUPS mais recentes)..."

    local backup_count=$(ls "$BACKUP_DIR"/moria_backup_*.db.gz 2>/dev/null | wc -l)

    if [ "$backup_count" -le "$MAX_BACKUPS" ]; then
        success "Apenas $backup_count backups encontrados, nenhuma limpeza necessária"
        return
    fi

    # Manter apenas os MAX_BACKUPS mais recentes
    ls -t "$BACKUP_DIR"/moria_backup_*.db.gz | tail -n +$((MAX_BACKUPS + 1)) | while read -r backup; do
        log "Removendo backup antigo: $(basename "$backup")"
        rm -f "$backup"
    done

    success "Limpeza concluída"
}

# Restaurar backup
restore_backup() {
    local backup_file=$1

    warn "⚠️  ATENÇÃO: Esta operação irá substituir a base de dados atual!"
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restauração cancelada"
        exit 0
    fi

    log "Iniciando restauração do backup..."

    # Validar backup antes de restaurar
    validate_backup "$backup_file"

    # Criar backup da base atual antes de restaurar
    log "Criando backup de segurança da base atual..."
    local safety_backup=$(create_backup)
    success "Backup de segurança criado: $safety_backup"

    # Parar aplicação temporariamente
    log "Parando aplicação..."
    docker-compose stop backend || true

    # Descomprimir e restaurar
    local temp_restore="/tmp/restore_$(date +%s).db"
    gunzip -c "$backup_file" > "$temp_restore"

    # Copiar para container
    log "Restaurando base de dados..."
    docker-compose start backend
    sleep 5
    docker cp "$temp_restore" "$CONTAINER_NAME:/tmp/restore.db"
    docker exec "$CONTAINER_NAME" cp /tmp/restore.db "$DB_PATH"

    # Reiniciar aplicação
    log "Reiniciando aplicação..."
    docker-compose restart backend

    # Limpar arquivos temporários
    rm -f "$temp_restore"
    docker exec "$CONTAINER_NAME" rm -f /tmp/restore.db 2>/dev/null || true

    success "Restauração concluída com sucesso"
    warn "Backup de segurança mantido em: $safety_backup"
}

# Estatísticas dos backups
backup_stats() {
    log "Estatísticas dos backups:"
    echo ""

    if [ ! -d "$BACKUP_DIR" ]; then
        warn "Diretório de backup não existe"
        return
    fi

    local total_backups=$(ls "$BACKUP_DIR"/moria_backup_*.db.gz 2>/dev/null | wc -l)
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    local oldest_backup=""
    local newest_backup=""

    if [ "$total_backups" -gt 0 ]; then
        oldest_backup=$(ls -tr "$BACKUP_DIR"/moria_backup_*.db.gz | head -n1 | xargs basename)
        newest_backup=$(ls -tr "$BACKUP_DIR"/moria_backup_*.db.gz | tail -n1 | xargs basename)
    fi

    echo "Total de backups: $total_backups"
    echo "Tamanho total: $total_size"
    echo "Backup mais antigo: ${oldest_backup:-N/A}"
    echo "Backup mais recente: ${newest_backup:-N/A}"
    echo "Limite de backups: $MAX_BACKUPS"
}

# Menu principal
show_menu() {
    echo ""
    echo "💾 Backup Moria - Prisma Database"
    echo "================================="
    echo "1) Criar backup"
    echo "2) Listar backups"
    echo "3) Validar backup"
    echo "4) Restaurar backup"
    echo "5) Estatísticas"
    echo "6) Limpeza manual"
    echo "7) Sair"
    echo ""
    read -p "Escolha uma opção: " choice
}

# Função principal
main() {
    case "${1:-menu}" in
        "backup"|"create")
            setup_backup_dir
            check_container
            backup_file=$(create_backup)
            cleanup_old_backups
            success "Backup completo: $backup_file"
            ;;
        "list")
            list_backups
            ;;
        "validate")
            if [ -z "${2:-}" ]; then
                error "Uso: $0 validate <arquivo_backup>"
            fi
            validate_backup "$2"
            ;;
        "restore")
            if [ -z "${2:-}" ]; then
                error "Uso: $0 restore <arquivo_backup>"
            fi
            check_container
            restore_backup "$2"
            ;;
        "stats")
            backup_stats
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "menu")
            while true; do
                show_menu
                case $choice in
                    1)
                        setup_backup_dir
                        check_container
                        backup_file=$(create_backup)
                        cleanup_old_backups
                        ;;
                    2) list_backups ;;
                    3)
                        read -p "Digite o caminho do backup para validar: " backup_path
                        validate_backup "$backup_path"
                        ;;
                    4)
                        list_backups
                        echo ""
                        read -p "Digite o caminho do backup para restaurar: " backup_path
                        restore_backup "$backup_path"
                        ;;
                    5) backup_stats ;;
                    6) cleanup_old_backups ;;
                    7) exit 0 ;;
                    *) warn "Opção inválida" ;;
                esac
                echo ""
                read -p "Pressione Enter para continuar..."
            done
            ;;
        *)
            echo "Uso: $0 [backup|list|validate|restore|stats|cleanup|menu]"
            echo ""
            echo "Exemplos:"
            echo "  $0 backup                                    # Criar backup"
            echo "  $0 list                                      # Listar backups"
            echo "  $0 validate ./backups/backup_20231201.db.gz # Validar backup"
            echo "  $0 restore ./backups/backup_20231201.db.gz  # Restaurar backup"
            echo "  $0 stats                                     # Ver estatísticas"
            exit 1
            ;;
    esac
}

# Executar
main "$@"