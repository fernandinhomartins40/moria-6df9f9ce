# 🚀 COMANDOS ESSENCIAIS - FASE 4 IMPLEMENTADA

## 📋 **COMANDOS ESSENCIAIS CONFORME PLANO_MIGRACAO_KNEX_PRISMA_DOCKER.md**

### **🔧 Desenvolvimento**
```bash
# Backend desenvolvimento
cd backend && npm run dev

# Database browser visual
cd backend && npx prisma studio

# Sincronizar schema com database
cd backend && npx prisma db push

# Gerar Prisma client
cd backend && npx prisma generate

# Frontend desenvolvimento
cd frontend && npm run dev
```

### **🐳 Produção Docker**
```bash
# Deploy completo (GitHub Actions)
git push origin main

# Deploy local completo
./scripts/deploy-simple.sh

# Ver logs containers
docker-compose logs -f

# Backup database Prisma
./scripts/backup-simple.sh

# Status dos containers
docker-compose ps

# Parar aplicação
docker-compose down

# Rebuild sem cache
docker-compose build --no-cache
```

### **🩺 Health Checks**
```bash
# nginx health
curl http://localhost/health

# API health via nginx
curl http://localhost/api/health

# Verificar portas ocupadas
netstat -tuln | grep :80
```

### **📊 Monitoramento**
```bash
# Logs em tempo real
docker-compose logs -f --tail=50

# Stats de recursos
docker stats --no-stream

# Volumes Docker
docker volume ls | grep moria

# Imagens Docker
docker images | grep moria
```

### **🔄 Manutenção**
```bash
# Limpeza completa
docker system prune -a

# Limpeza volumes
docker volume prune

# Restart apenas backend
docker-compose restart backend

# Restart apenas nginx
docker-compose restart nginx
```

---

## ✅ **ESTRUTURA FINAL IMPLEMENTADA**

```
moria-app/
├── docker-compose.yml         # ✅ Orquestração nginx + backend
├── nginx.conf                 # ✅ Proxy reverso + rate limiting
├── Dockerfile.nginx           # ✅ Frontend containerizado
├── backend/
│   ├── Dockerfile            # ✅ Backend Prisma otimizado
│   ├── prisma/
│   │   └── schema.prisma     # ✅ Single source of truth
│   └── src/
│       └── services/
│           └── prisma.js     # ✅ 5 linhas vs 150
├── frontend/
│   ├── package.json          # ✅ React + Vite
│   └── vite.config.js
├── scripts/
│   ├── deploy-simple.sh      # ✅ FASE 4 - Deploy automation
│   ├── backup-simple.sh      # ✅ FASE 4 - Backup automation
│   ├── deploy.sh             # ✅ Deploy avançado (Fase 3)
│   └── backup-prisma.sh      # ✅ Backup avançado (Fase 3)
├── .github/workflows/
│   └── deploy.yml            # ✅ Ajustado para Prisma + Docker
└── backups/                  # ✅ Backups SQLite + Schema
```

---

## 🎯 **COMANDOS POR CENÁRIO**

### **🚨 EMERGÊNCIA - Rollback Rápido**
```bash
# Parar aplicação atual
docker-compose down

# Voltar commit anterior
git reset --hard HEAD~1

# Deploy via GitHub Actions
git push origin main --force
```

### **🔍 DEBUG - Investigar Problemas**
```bash
# Logs detalhados backend
docker logs moria-backend --tail 100

# Logs detalhados nginx
docker logs moria-nginx --tail 100

# Entrar no container backend
docker exec -it moria-backend sh

# Verificar database
docker exec -it moria-backend sqlite3 /app/data/moria.db ".tables"
```

### **📈 PERFORMANCE - Otimização**
```bash
# Verificar uso de recursos
docker stats

# Limpar cache Docker
docker builder prune

# Otimizar imagens
docker image prune

# Backup + limpeza
./scripts/backup-simple.sh && docker system prune -f
```

---

## ✅ **FASE 4 - 100% IMPLEMENTADA**

- [x] **deploy-simple.sh** - Deploy automation
- [x] **backup-simple.sh** - Backup automation
- [x] **deploy.yml** ajustado para Prisma + Docker
- [x] **Comandos essenciais** documentados
- [x] **Health checks** via nginx
- [x] **Scripts de manutenção**

🎉 **Deploy via GitHub Actions funcionando com estrutura Prisma + Docker!**