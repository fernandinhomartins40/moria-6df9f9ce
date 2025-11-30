#!/bin/bash
# Script de diagnóstico PWA em produção

echo "🔍 Diagnóstico PWA - Moria Peças"
echo "================================"
echo ""

# 1. Verificar se estamos no container
if [ -f "/.dockerenv" ]; then
    echo "📦 Executando dentro do container Docker"
    BASE_PATH="/app/apps/frontend/dist"
else
    echo "💻 Executando no host"
    BASE_PATH="apps/frontend/dist"
fi

echo ""
echo "=== 1. Verificar estrutura de arquivos ==="

# Verificar arquivos PWA
if [ -f "$BASE_PATH/manifest.webmanifest" ]; then
    echo "✅ manifest.webmanifest encontrado"
    echo "   Tamanho: $(stat -f%z "$BASE_PATH/manifest.webmanifest" 2>/dev/null || stat -c%s "$BASE_PATH/manifest.webmanifest" 2>/dev/null) bytes"
else
    echo "❌ manifest.webmanifest NÃO ENCONTRADO!"
fi

if [ -d "$BASE_PATH/cliente" ]; then
    echo "✅ Diretório /cliente encontrado"
    echo "   Arquivos: $(find "$BASE_PATH/cliente" -type f | wc -l)"
else
    echo "❌ Diretório /cliente NÃO ENCONTRADO!"
fi

if [ -d "$BASE_PATH/icons" ]; then
    echo "✅ Diretório /icons encontrado"
    echo "   Ícones: $(find "$BASE_PATH/icons" -name '*.png' | wc -l) PNGs"
else
    echo "❌ Diretório /icons NÃO ENCONTRADO!"
fi

if [ -f "$BASE_PATH/sw.js" ]; then
    echo "✅ Service Worker (sw.js) encontrado"
else
    echo "❌ Service Worker NÃO ENCONTRADO!"
fi

echo ""
echo "=== 2. Verificar index.html do Customer PWA ==="
if [ -f "$BASE_PATH/cliente/index.html" ]; then
    echo "✅ $BASE_PATH/cliente/index.html existe"

    # Verificar se contém InstallBanner
    if grep -q "InstallBanner\|install-banner" "$BASE_PATH/cliente/index.html"; then
        echo "✅ index.html menciona InstallBanner"
    else
        echo "⚠️ InstallBanner não encontrado no HTML"
    fi

    # Verificar manifest link
    if grep -q "manifest" "$BASE_PATH/cliente/index.html"; then
        echo "✅ Link para manifest encontrado"
        grep "manifest" "$BASE_PATH/cliente/index.html" | head -2
    else
        echo "❌ Link para manifest NÃO ENCONTRADO!"
    fi

    # Verificar meta theme-color
    if grep -q "theme-color" "$BASE_PATH/cliente/index.html"; then
        echo "✅ Meta theme-color encontrado"
    else
        echo "❌ Meta theme-color NÃO ENCONTRADO!"
    fi
else
    echo "❌ $BASE_PATH/cliente/index.html NÃO EXISTE!"
fi

echo ""
echo "=== 3. Testar endpoints HTTP ==="

# Testar manifest
echo "📡 Testando /manifest.webmanifest..."
MANIFEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{content_type}" http://localhost:3090/manifest.webmanifest)
HTTP_CODE=$(echo $MANIFEST_RESPONSE | cut -d'|' -f1)
CONTENT_TYPE=$(echo $MANIFEST_RESPONSE | cut -d'|' -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Manifest retorna 200 OK"
    if [[ "$CONTENT_TYPE" == *"application/manifest+json"* ]]; then
        echo "✅ Content-Type correto: $CONTENT_TYPE"
    else
        echo "❌ Content-Type incorreto: $CONTENT_TYPE (esperado: application/manifest+json)"
    fi
else
    echo "❌ Manifest retorna $HTTP_CODE"
fi

# Testar ícone
echo "📡 Testando /icons/customer-192.png..."
ICON_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3090/icons/customer-192.png)
if [ "$ICON_RESPONSE" = "200" ]; then
    echo "✅ Ícone acessível (200 OK)"
else
    echo "❌ Ícone retorna $ICON_RESPONSE"
fi

# Testar página cliente
echo "📡 Testando /cliente/..."
CLIENTE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3090/cliente/)
if [ "$CLIENTE_RESPONSE" = "200" ]; then
    echo "✅ /cliente/ acessível (200 OK)"

    # Verificar qual HTML está sendo servido
    HTML_TITLE=$(curl -s http://localhost:3090/cliente/ | grep -o '<title>[^<]*</title>' | head -1)
    echo "   Título da página: $HTML_TITLE"
else
    echo "❌ /cliente/ retorna $CLIENTE_RESPONSE"
fi

# Testar Service Worker
echo "📡 Testando /sw.js..."
SW_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{content_type}" http://localhost:3090/sw.js)
SW_CODE=$(echo $SW_RESPONSE | cut -d'|' -f1)
SW_TYPE=$(echo $SW_RESPONSE | cut -d'|' -f2)

if [ "$SW_CODE" = "200" ]; then
    echo "✅ Service Worker acessível (200 OK)"
    if [[ "$SW_TYPE" == *"javascript"* ]]; then
        echo "✅ Content-Type correto: $SW_TYPE"
    else
        echo "⚠️ Content-Type: $SW_TYPE"
    fi
else
    echo "❌ Service Worker retorna $SW_CODE"
fi

echo ""
echo "=== 4. Verificar conteúdo do manifest ==="
if command -v jq &> /dev/null; then
    curl -s http://localhost:3090/manifest.webmanifest | jq '.'
else
    curl -s http://localhost:3090/manifest.webmanifest
fi

echo ""
echo "=== 5. Verificar JavaScript bundles ==="
if [ -d "$BASE_PATH/cliente/assets" ]; then
    JS_FILES=$(find "$BASE_PATH/cliente/assets" -name "*.js" | wc -l)
    CSS_FILES=$(find "$BASE_PATH/cliente/assets" -name "*.css" | wc -l)
    echo "✅ Assets do cliente:"
    echo "   JavaScript: $JS_FILES arquivos"
    echo "   CSS: $CSS_FILES arquivos"

    # Listar principais arquivos
    echo "   Principais arquivos:"
    find "$BASE_PATH/cliente/assets" -name "index-*.js" -o -name "index-*.css" | while read file; do
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        echo "   - $(basename $file): $SIZE bytes"
    done
else
    echo "❌ Pasta assets não encontrada!"
fi

echo ""
echo "=== 6. Verificar logs do nginx ==="
if [ -f "/var/log/nginx/access.log" ]; then
    echo "📊 Últimas requisições para PWA:"
    tail -20 /var/log/nginx/access.log | grep -E "manifest|icons|cliente|sw.js" || echo "   Nenhuma requisição PWA nos últimos logs"
else
    echo "⚠️ Log do nginx não acessível"
fi

echo ""
echo "=== RESUMO DO DIAGNÓSTICO ==="
echo ""

# Calcular score
SCORE=0
TOTAL=10

[ -f "$BASE_PATH/manifest.webmanifest" ] && ((SCORE++))
[ -d "$BASE_PATH/cliente" ] && ((SCORE++))
[ -d "$BASE_PATH/icons" ] && ((SCORE++))
[ -f "$BASE_PATH/sw.js" ] && ((SCORE++))
[ -f "$BASE_PATH/cliente/index.html" ] && ((SCORE++))
[ "$HTTP_CODE" = "200" ] && ((SCORE++))
[[ "$CONTENT_TYPE" == *"manifest"* ]] && ((SCORE++))
[ "$ICON_RESPONSE" = "200" ] && ((SCORE++))
[ "$CLIENTE_RESPONSE" = "200" ] && ((SCORE++))
[ "$SW_CODE" = "200" ] && ((SCORE++))

echo "Score: $SCORE/$TOTAL"
echo ""

if [ $SCORE -eq $TOTAL ]; then
    echo "✅ Todos os componentes PWA estão funcionando!"
    echo ""
    echo "Se o banner ainda não aparece, pode ser:"
    echo "1. localStorage bloqueado (usuário já dispensou)"
    echo "2. App já instalado (modo standalone)"
    echo "3. Erro JavaScript no browser"
    echo "4. beforeinstallprompt não disparou (normal em alguns casos)"
    echo ""
    echo "Próximos passos:"
    echo "- Acessar https://moriapecas.com.br/cliente/clear-pwa-cache.html"
    echo "- Abrir DevTools (F12) e verificar Console"
    echo "- Testar em janela anônima"
elif [ $SCORE -ge 7 ]; then
    echo "⚠️ Maioria dos componentes funcionando, mas há problemas."
else
    echo "❌ Vários componentes PWA com problemas!"
fi

echo ""
echo "Fim do diagnóstico."
