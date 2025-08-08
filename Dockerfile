# ============================================
# Dockerfile para Moria Peças & Serviços - Frontend Supabase
# Multi-stage build otimizado para produção
# ============================================

# Stage 1: Build da aplicação React+Vite
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files para cache otimizado
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci --silent

# Copiar código fonte
COPY . .

# Args para variáveis de ambiente do Supabase (não são segredos sensíveis - são públicos)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Definir variáveis de ambiente para o build
# Nota: VITE_SUPABASE_ANON_KEY é uma chave pública, não um segredo
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build da aplicação
RUN npm run build

# Stage 2: Nginx para servir arquivos estáticos
FROM nginx:alpine

# Remover arquivos padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Criar configuração otimizada do Nginx
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://supabase.co https://*.supabase.co data: blob:;" always;

    # Cache estático (JS, CSS, imagens)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback - todas as rotas vão para index.html
    location / {
        try_files $uri $uri/ /index.html;
        
        # Headers para index.html (não cachear)
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }

    # Health check para Docker
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Expor porta 80
EXPOSE 80

# Labels para identificação
LABEL maintainer="Moria Peças & Serviços"
LABEL version="2.0-supabase"
LABEL description="Frontend React+Vite com Supabase"

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]