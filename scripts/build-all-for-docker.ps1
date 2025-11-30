#!/usr/bin/env pwsh
# Build completo para Docker - PowerShell

Write-Host "=== Build completo para Docker ===" -ForegroundColor Cyan

# 1. Build Backend
Write-Host "`n📦 Building Backend..." -ForegroundColor Yellow
npm run build:backend
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 2. Build Frontend (legado)
Write-Host "`n📦 Building Frontend..." -ForegroundColor Yellow
npm run build:frontend
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 3. Build PWAs
Write-Host "`n📦 Building Customer PWA..." -ForegroundColor Yellow
npm run build:customer
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n📦 Building Mechanic/Admin PWA..." -ForegroundColor Yellow
npm run build:mechanic
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 4. Copiar arquivos PWA para frontend/dist
Write-Host "`n🔄 Copiando PWAs para frontend/dist..." -ForegroundColor Yellow

# Criar diretórios
New-Item -ItemType Directory -Force -Path "apps/frontend/dist/cliente" | Out-Null
New-Item -ItemType Directory -Force -Path "apps/frontend/dist/mecanico" | Out-Null
New-Item -ItemType Directory -Force -Path "apps/frontend/dist/icons" | Out-Null
New-Item -ItemType Directory -Force -Path "apps/frontend/dist/screenshots" | Out-Null

# Copiar customer PWA
Write-Host "  ➜ Customer PWA -> /cliente" -ForegroundColor Gray
Copy-Item -Path "apps/customer-pwa/dist/*" -Destination "apps/frontend/dist/cliente/" -Recurse -Force
Copy-Item -Path "apps/customer-pwa/dist/manifest.webmanifest" -Destination "apps/frontend/dist/" -Force
if (Test-Path "apps/customer-pwa/dist/sw.js") {
    Copy-Item -Path "apps/customer-pwa/dist/sw.js" -Destination "apps/frontend/dist/" -Force
}
Get-ChildItem "apps/customer-pwa/dist/workbox-*.js" -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName -Destination "apps/frontend/dist/" -Force
}

# Copiar mechanic PWA
Write-Host "  ➜ Mechanic PWA -> /mecanico" -ForegroundColor Gray
Copy-Item -Path "apps/mechanic-pwa/dist/*" -Destination "apps/frontend/dist/mecanico/" -Recurse -Force
Copy-Item -Path "apps/mechanic-pwa/dist/manifest.webmanifest" -Destination "apps/frontend/dist/manifest-mecanico.webmanifest" -Force

# Copiar ícones e screenshots
Write-Host "  ➜ Ícones e screenshots" -ForegroundColor Gray
if (Test-Path "apps/customer-pwa/dist/icons") {
    Copy-Item -Path "apps/customer-pwa/dist/icons/*" -Destination "apps/frontend/dist/icons/" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "apps/mechanic-pwa/dist/icons") {
    Copy-Item -Path "apps/mechanic-pwa/dist/icons/*" -Destination "apps/frontend/dist/icons/" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "apps/customer-pwa/dist/screenshots") {
    Copy-Item -Path "apps/customer-pwa/dist/screenshots/*" -Destination "apps/frontend/dist/screenshots/" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "apps/mechanic-pwa/dist/screenshots") {
    Copy-Item -Path "apps/mechanic-pwa/dist/screenshots/*" -Destination "apps/frontend/dist/screenshots/" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`n✅ Build completo!" -ForegroundColor Green
Write-Host ""
Write-Host "Estrutura final:" -ForegroundColor Cyan
Write-Host "  apps/frontend/dist/"
Write-Host "    ├── index.html (frontend legado)"
Write-Host "    ├── cliente/ (Customer PWA)"
Write-Host "    ├── mecanico/ (Mechanic PWA)"
Write-Host "    ├── icons/ (ícones PWA)"
Write-Host "    ├── screenshots/ (screenshots PWA)"
Write-Host "    ├── manifest.webmanifest (customer)"
Write-Host "    └── sw.js (service worker)"
Write-Host ""
Write-Host "🐳 Pronto para buildar Docker!" -ForegroundColor Green
