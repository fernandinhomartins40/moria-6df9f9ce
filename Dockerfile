# Dockerfile para Moria Peças e Serviços
# Aplicação React + Vite com Nginx

# Estágio de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas as dependências (incluindo dev para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Limpar cache e build da aplicação
RUN rm -rf dist node_modules/.vite .cache && \
    echo "🗂️ Arquivos TypeScript/TSX encontrados:" && \
    find src -name "*.tsx" -o -name "*.ts" | grep -E "(AdminQuotes|AdminSidebar|App)" && \
    npm run build && \
    echo "✅ Build concluído. Verificando arquivos gerados:" && \
    ls -la dist/ && \
    echo "📋 Verificando componentes no JavaScript compilado:" && \
    find dist/assets -name "*.js" -exec grep -l "AdminQuotes" {} \; | head -1 | xargs -I {} sh -c 'echo "✅ Arquivo JS com AdminQuotes: {}"; grep -o "AdminQuotes[^,}]*" {} | head -3' || echo "⚠️ AdminQuotes NÃO encontrado no JS" && \
    echo "🔍 Verificando rota quotes:" && \
    find dist/assets -name "*.js" -exec grep -l "path.*quotes" {} \; | head -1 && echo "✅ Rota quotes encontrada no bundle" || echo "⚠️ Rota quotes NÃO encontrada"

# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]