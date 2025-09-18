#!/bin/bash
# ============================================
# Script de Desenvolvimento - Moria Full Stack
# Inicia backend e frontend para desenvolvimento
# ============================================

set -e

echo "🛠️ Moria Development Server"
echo "============================"

# Verificar estrutura
[ -d "backend" ] || { echo "❌ Pasta backend/ não encontrada!"; exit 1; }
[ -f "package.json" ] || { echo "❌ package.json (frontend) não encontrado!"; exit 1; }

# Função para parar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

# Verificar se as portas estão livres
check_port() {
    local port=$1
    if lsof -i:$port >/dev/null 2>&1; then
        echo "⚠️ Porta $port está em uso!"
        read -p "Deseja finalizar o processo? (y/N): " answer
        if [[ $answer =~ ^[Yy]$ ]]; then
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 2
        else
            echo "❌ Cancelando..."
            exit 1
        fi
    fi
}

# Verificar portas
echo "🔍 Verificando portas..."
check_port 3001  # Backend
check_port 8080  # Frontend

# Instalar dependências se necessário
echo "📦 Verificando dependências..."

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Verificar banco de dados
if [ ! -f "backend/database/database.sqlite" ]; then
    echo "🗄️ Preparando banco de dados..."
    cd backend
    if [ -f "knexfile.js" ]; then
        npx knex migrate:latest
        npx knex seed:run
    fi
    cd ..
fi

# Iniciar backend
echo "🔌 Iniciando backend (porta 3001)..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
echo "⏳ Aguardando backend..."
for i in {1..20}; do
    if curl -f -s http://localhost:3001/api/health >/dev/null 2>&1; then
        echo "✅ Backend online!"
        break
    fi
    sleep 1
done

# Iniciar frontend
echo "🎨 Iniciando frontend (porta 8080)..."
npm run dev &
FRONTEND_PID=$!

# Aguardar frontend inicializar
echo "⏳ Aguardando frontend..."
sleep 5

echo ""
echo "🎉 Servidores em execução!"
echo "================================"
echo "🔌 Backend: http://localhost:3001/api"
echo "🩺 Health: http://localhost:3001/api/health"
echo "🎨 Frontend: http://localhost:8080"
echo ""
echo "💡 Logs em tempo real..."
echo "🛑 Pressione Ctrl+C para parar"
echo ""

# Aguardar até ser interrompido
wait