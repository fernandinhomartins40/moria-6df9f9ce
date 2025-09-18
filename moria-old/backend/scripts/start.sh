#!/bin/bash

# ============================================
# Script de inicialização do Backend Moria
# Executa migrações, seeds e inicia servidor
# ============================================

set -e

echo "🚀 Iniciando backend Moria..."

# Verificar se o diretório do banco existe
mkdir -p /app/database

echo "📦 Executando migrações..."
npm run migrate

echo "🌱 Executando seeds..."
npm run seed

echo "🎯 Iniciando servidor..."
npm start