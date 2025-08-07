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
    echo "📋 index.html contém 'quotes'?" && \
    grep -q "quotes" dist/index.html && echo "✅ Rota quotes encontrada" || echo "⚠️ Rota quotes NÃO encontrada"

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