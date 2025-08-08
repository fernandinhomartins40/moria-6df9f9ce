# Imagem base do nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy source files (temporário para teste)
COPY src /usr/share/nginx/html/src
COPY public /usr/share/nginx/html/public
COPY index.html /usr/share/nginx/html/
COPY *.ts *.js *.json /usr/share/nginx/html/

# Install curl for healthcheck
RUN apk add --no-cache curl

# Expose port 3018
EXPOSE 3018

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3018/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]