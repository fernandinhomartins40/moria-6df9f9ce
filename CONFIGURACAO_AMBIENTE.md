# Configuração de Ambiente - Moria

## 🏗️ Arquitetura

### **Produção (VPS com Nginx)**

```
Cliente → Nginx (porta 80/443) → Backend (porta 3001)
                                ↓
                             Frontend
```

- **Nginx** recebe requisições em `/api/*`
- **Rewrite**: Remove prefixo `/api` antes de enviar para backend (nginx.conf linha 15)
- **Backend** expõe rotas SEM prefixo (ex: `/auth/profile`)
- **Frontend** faz requisições para `/api/auth/profile`

### **Development Local (Sem Nginx)**

```
Cliente → Frontend (porta 3000) → Backend (porta 3001)
```

- **Backend** roda diretamente SEM Nginx
- **Frontend** acessa diretamente SEM prefixo `/api`
- Rotas: `http://localhost:3001/auth/profile`

## ⚙️ Variáveis de Ambiente

### Frontend

**Development (.env):**
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_ENV=development
```

**Production (.env.production):**
```env
VITE_API_BASE_URL=/api
VITE_APP_ENV=production
```

### Backend

**Development (.env):**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moria_db?schema=public
```

**Production (docker-compose.vps.yml):**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://moria:password@postgres:5432/moria?schema=public
```

## 🚀 Como Rodar

### Development Local

```bash
# Backend (porta 3001)
cd apps/backend
npm run dev

# Frontend (porta 3000)
cd apps/frontend
npm run dev
```

### Production (VPS)

```bash
docker-compose -f docker-compose.vps.yml up -d
```

## 📝 Notas Importantes

1. **Nginx Rewrite**: Em produção, o Nginx remove `/api` automaticamente
2. **Portas**:
   - Dev: Backend 3001, Frontend 3000
   - Prod: Backend 3001 (interno), Frontend 3000 (interno), Nginx 80/443 (externo)
3. **CORS**: Backend aceita origens configuradas em `CORS_ORIGIN`
