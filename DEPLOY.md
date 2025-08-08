# Deploy Moria Frontend

## Estrutura de Deploy

A aplicação foi configurada para deploy como frontend estático usando Docker e nginx na porta 3018.

## Arquivos de Configuração

### 1. Dockerfile
- Imagem base: `nginx:alpine`
- Porta: 3018
- Serve arquivos estáticos via nginx
- Healthcheck configurado

### 2. docker-compose.yml
- Configuração completa para produção
- Network isolada
- Restart automático
- Labels para Traefik (opcional)

### 3. nginx.conf
- Configuração otimizada para SPA
- Cache headers para assets estáticos
- Gzip compression
- Security headers
- Endpoint /health para monitoramento

### 4. Deploy Script (deploy.sh)
- Script automatizado para deploy
- Funções: deploy, status, cleanup, logs
- Cores no terminal para melhor UX
- Healthcheck automático

## Como Fazer o Deploy

### Pré-requisitos
- Docker instalado na VPS
- Acesso SSH à VPS
- Portas 3018 disponível

### Passos:

1. **Enviar arquivos para VPS:**
```bash
scp -r . usuario@sua-vps:/opt/moria-frontend/
```

2. **Conectar na VPS:**
```bash
ssh usuario@sua-vps
cd /opt/moria-frontend
```

3. **Executar deploy:**
```bash
chmod +x deploy.sh
./deploy.sh prod
```

### Comandos Úteis:

```bash
# Ver status
./deploy.sh status

# Ver logs em tempo real
./deploy.sh logs

# Limpar containers antigos
./deploy.sh cleanup

# Deploy manual com docker-compose
docker-compose up -d

# Verificar saúde da aplicação
curl http://localhost:3018/health
```

## Configuração para Produção

### 1. Domínio (Opcional)
Edite o docker-compose.yml para configurar seu domínio:
```yaml
labels:
  - "traefik.http.routers.moria.rule=Host(`seu-dominio.com`)"
```

### 2. SSL/HTTPS
Configure um proxy reverso (nginx, Traefik, Caddy) na frente da aplicação.

### 3. Monitoramento
- Endpoint `/health` disponível para healthchecks
- Logs disponíveis via `docker logs`

## Preparação para Supabase

A aplicação está pronta para integração com Supabase:

1. **API Service**: `/src/services/api.js` usa paths relativos
2. **Configuração**: Remover proxy do Vite (já feito)
3. **Authentication**: Hooks prontos para Supabase Auth
4. **Database**: Estrutura preparada para migração

### Próximos Passos:
1. Configurar projeto Supabase
2. Migrar dados do backend local
3. Atualizar `api.js` para usar Supabase Client
4. Configurar autenticação Supabase
5. Deploy final

## Troubleshooting

### Container não inicia
```bash
docker logs moria-frontend
```

### Porta ocupada
```bash
sudo lsof -i :3018
sudo kill -9 <PID>
```

### Rebuild completo
```bash
./deploy.sh cleanup
docker system prune -f
./deploy.sh prod
```

## Arquitetura

```
Internet -> VPS:3018 -> Docker Container -> Nginx -> Static Files
                    -> /health (healthcheck)
                    -> /api (preparado para Supabase)
```