#!/bin/bash
set -e

echo "=== Build completo para Docker ==="

# 1. Build Backend
echo "📦 Building Backend..."
npm run build:backend

# 2. Build Frontend (legado)
echo "📦 Building Frontend..."
npm run build:frontend

# 3. Build PWAs
echo "📦 Building Customer PWA..."
npm run build:customer

echo "📦 Building Mechanic/Admin PWA..."
npm run build:mechanic

# 4. Copiar arquivos PWA para frontend/dist (para nginx servir tudo junto)
echo "🔄 Copiando PWAs para frontend/dist..."

# Criar diretórios
mkdir -p apps/frontend/dist/cliente
mkdir -p apps/frontend/dist/mecanico
mkdir -p apps/frontend/dist/icons
mkdir -p apps/frontend/dist/screenshots

# Copiar customer PWA
echo "  ➜ Customer PWA -> /cliente"
cp -r apps/customer-pwa/dist/* apps/frontend/dist/cliente/
cp apps/customer-pwa/dist/manifest.webmanifest apps/frontend/dist/manifest.webmanifest
cp apps/customer-pwa/dist/sw.js apps/frontend/dist/sw.js 2>/dev/null || true
cp apps/customer-pwa/dist/workbox-*.js apps/frontend/dist/ 2>/dev/null || true

# Copiar mechanic PWA
echo "  ➜ Mechanic PWA -> /mecanico"
cp -r apps/mechanic-pwa/dist/* apps/frontend/dist/mecanico/
cp apps/mechanic-pwa/dist/manifest.webmanifest apps/frontend/dist/manifest-mecanico.webmanifest

# Copiar ícones e screenshots (compartilhados)
echo "  ➜ Ícones e screenshots"
cp -r apps/customer-pwa/dist/icons/* apps/frontend/dist/icons/ 2>/dev/null || true
cp -r apps/mechanic-pwa/dist/icons/* apps/frontend/dist/icons/ 2>/dev/null || true
cp -r apps/customer-pwa/dist/screenshots/* apps/frontend/dist/screenshots/ 2>/dev/null || true
cp -r apps/mechanic-pwa/dist/screenshots/* apps/frontend/dist/screenshots/ 2>/dev/null || true

echo "✅ Build completo!"
echo ""
echo "Estrutura final:"
echo "  apps/frontend/dist/"
echo "    ├── index.html (frontend legado)"
echo "    ├── cliente/ (Customer PWA)"
echo "    ├── mecanico/ (Mechanic PWA)"
echo "    ├── icons/ (ícones PWA)"
echo "    ├── screenshots/ (screenshots PWA)"
echo "    ├── manifest.webmanifest (customer)"
echo "    └── sw.js (service worker)"
echo ""
echo "🐳 Pronto para buildar Docker!"
