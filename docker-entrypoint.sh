#!/bin/sh

# Docker entrypoint - Iniciar Backend Node.js + Nginx

echo "🚀 Iniciando Moria Peças & Serviços - Full Stack"
echo "=================================="

# Função para log com timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Configurar variáveis de ambiente para Prisma
export DATABASE_URL="file:./prisma/database.db"

# Verificar se o banco existe e está acessível
log "📋 Verificando banco SQLite..."
if [ -f "/app/backend/prisma/database.db" ]; then
    log "✅ Banco SQLite encontrado"
else
    log "⚠️ Banco não encontrado, criando..."
    cd /app/backend
    DATABASE_URL="file:./prisma/database.db" npx prisma migrate deploy
    DATABASE_URL="file:./prisma/database.db" npx prisma db seed || log "⚠️ Seed falhou, mas continuando..."
fi

export NODE_ENV=production
export PORT=3081

# Iniciar backend Node.js em background
log "🖥️ Iniciando backend Node.js na porta 3081..."
cd /app/backend
node src/server.js &
BACKEND_PID=$!

# Aguardar backend inicializar
sleep 3

# Verificar se backend está rodando
if kill -0 $BACKEND_PID 2>/dev/null; then
    log "✅ Backend Node.js iniciado (PID: $BACKEND_PID)"
else
    log "❌ Falha ao iniciar backend"
    exit 1
fi

# Testar se backend responde
log "🔍 Testando backend..."
for i in 1 2 3 4 5; do
    if wget -q -O- http://127.0.0.1:3081/api/health >/dev/null 2>&1; then
        log "✅ Backend respondendo na porta 3081"
        break
    else
        log "⏳ Aguardando backend... (tentativa $i/5)"
        sleep 2
    fi
done

# Iniciar Nginx em foreground
log "🌐 Iniciando Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Verificar se Nginx iniciou
sleep 2
if kill -0 $NGINX_PID 2>/dev/null; then
    log "✅ Nginx iniciado (PID: $NGINX_PID)"
    log "🚀 Aplicação disponível na porta 80"
    log "📡 Frontend: http://localhost/"
    log "🔌 Backend: http://localhost/api/"
else
    log "❌ Falha ao iniciar Nginx"
    exit 1
fi

# Monitorar processos
log "👀 Monitorando processos..."

# Função de cleanup
cleanup() {
    log "🛑 Encerrando aplicação..."
    kill $BACKEND_PID $NGINX_PID 2>/dev/null
    exit 0
}

# Trap para cleanup
trap cleanup SIGTERM SIGINT

# Loop para manter container ativo e monitorar
while true; do
    # Verificar se backend ainda está rodando
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        log "❌ Backend parou de funcionar"
        exit 1
    fi
    
    # Verificar se nginx ainda está rodando  
    if ! kill -0 $NGINX_PID 2>/dev/null; then
        log "❌ Nginx parou de funcionar"
        exit 1
    fi
    
    sleep 30
done