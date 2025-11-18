# 🚀 COMO RODAR A APLICAÇÃO MORIA

## 📋 PRÉ-REQUISITOS

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** rodando (porta 5432)
- **Database** `moria_db` criada

---

## ⚙️ CONFIGURAÇÕES DE PORTA

### Backend (API)
- **Porta**: 3001
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Frontend (Interface)
- **Porta**: 3000
- **URL**: http://localhost:3000

---

## 🔧 PASSO 1: CONFIGURAR BANCO DE DADOS

### 1.1. Iniciar PostgreSQL
```bash
# Windows (se instalado como serviço)
# O PostgreSQL já deve estar rodando automaticamente

# Verificar se está rodando:
netstat -ano | findstr ":5432"
```

### 1.2. Criar Database (se não existir)
```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar database
CREATE DATABASE moria_db;

-- Sair
\q
```

### 1.3. Rodar Migrations
```bash
cd apps/backend
npx prisma migrate dev
```

### 1.4. (Opcional) Popular Dados Iniciais
```bash
cd apps/backend
npx prisma db seed
```

---

## 🚀 PASSO 2: INICIAR BACKEND (Porta 3001)

### Opção A: Terminal Separado
```bash
# Abrir terminal na raiz do projeto
cd apps/backend

# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Você verá:**
```
🚀 Server running on port 3001
📝 Environment: development
🔗 Health check: http://localhost:3001/health
✅ Database connected successfully
```

### Opção B: Pela Raiz do Projeto
```bash
# Na raiz do projeto
npm run dev:backend
```

### ✅ Testar Backend
Abra no navegador: http://localhost:3001/health

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "uptime": 123
}
```

---

## 🎨 PASSO 3: INICIAR FRONTEND (Porta 3000)

### Opção A: Terminal Separado
```bash
# Abrir NOVO terminal na raiz do projeto
cd apps/frontend

# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Você verá:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Opção B: Pela Raiz do Projeto
```bash
# Na raiz do projeto
npm run dev:frontend
```

### ✅ Testar Frontend
Abra no navegador: http://localhost:3000

---

## ⚡ PASSO 4: RODAR TUDO DE UMA VEZ

### Iniciar Backend + Frontend Simultaneamente
```bash
# Na raiz do projeto
npm run dev:all
```

Isso inicia:
- Backend na porta **3001**
- Frontend na porta **3000**

---

## 🔍 VERIFICAR SE ESTÁ RODANDO

### Verificar Portas em Uso (Windows)
```bash
# Backend (3001)
netstat -ano | findstr ":3001"

# Frontend (3000)
netstat -ano | findstr ":3000"

# PostgreSQL (5432)
netstat -ano | findstr ":5432"
```

### Parar Processo em Porta Específica (se necessário)
```bash
# Descobrir PID
netstat -ano | findstr ":3001"
# Exemplo de output:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    4224
#                                                  ^^^^^ (PID)

# Matar processo
taskkill /PID 4224 /F
```

---

## 📱 ACESSAR A APLICAÇÃO

### URLs Principais

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface pública |
| **Backend API** | http://localhost:3001 | API REST |
| **Health Check** | http://localhost:3001/health | Status da API |
| **Admin Panel** | http://localhost:3000/admin | Painel administrativo |
| **Store Panel** | http://localhost:3000/store-panel | Painel de vendas |

---

## 🔐 CREDENCIAIS DE TESTE

### Admin Padrão
- **Email**: admin@moria.com
- **Senha**: admin123

### Cliente de Teste (se houver seed)
- **Email**: joao.silva@email.com
- **CPF**: 123.456.789-00

---

## 🛠️ COMANDOS ÚTEIS

### Backend
```bash
cd apps/backend

# Desenvolvimento
npm run dev

# Build
npm run build

# Rodar migrations
npx prisma migrate dev

# Resetar database
npx prisma migrate reset

# Abrir Prisma Studio (visualizar dados)
npx prisma studio
```

### Frontend
```bash
cd apps/frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Type checking
npx tsc --noEmit
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Port 3001 is already in use"
**Solução:**
```bash
# Descobrir processo
netstat -ano | findstr ":3001"

# Matar processo
taskkill /PID [PID] /F

# Ou mudar porta no .env
# apps/backend/.env
PORT=3000
```

### Problema: "Port 3000 is already in use"
**Solução:**
```bash
# Descobrir processo
netstat -ano | findstr ":3000"

# Matar processo
taskkill /PID [PID] /F

# Ou mudar porta no vite.config.ts
# apps/frontend/vite.config.ts
server: {
  port: 3000
}
```

### Problema: "Database connection failed"
**Verificar:**
1. PostgreSQL está rodando?
   ```bash
   netstat -ano | findstr ":5432"
   ```

2. Database existe?
   ```bash
   psql -U postgres -c "\l"
   ```

3. DATABASE_URL está correto?
   ```bash
   # apps/backend/.env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moria_db?schema=public
   ```

### Problema: "Cannot find module '@/...'"
**Solução:**
```bash
cd apps/frontend
npm install
```

### Problema: Frontend não conecta com Backend
**Verificar:**
1. Backend está rodando em 3001?
2. CORS está configurado corretamente?
3. .env do frontend aponta para backend correto?
   ```bash
   # apps/frontend/.env
   VITE_API_BASE_URL=http://localhost:3001
   ```

---

## 📊 ESTRUTURA DE PASTAS

```
moria-6df9f9ce/
├── apps/
│   ├── backend/          # API (porta 3001)
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── .env         # Configurações backend
│   │   └── package.json
│   └── frontend/         # Interface (porta 3000)
│       ├── src/
│       ├── .env         # Configurações frontend
│       ├── vite.config.ts
│       └── package.json
├── packages/             # Código compartilhado
├── package.json         # Scripts raiz
└── README.md
```

---

## ✅ CHECKLIST DE INICIALIZAÇÃO

- [ ] PostgreSQL rodando (porta 5432)
- [ ] Database `moria_db` criada
- [ ] Migrations rodadas (`npx prisma migrate dev`)
- [ ] Backend rodando (porta 3001)
- [ ] Health check funcionando (http://localhost:3001/health)
- [ ] Frontend rodando (porta 3000)
- [ ] Frontend carrega (http://localhost:3000)
- [ ] Login funciona (admin@moria.com / admin123)

---

## 🎉 PRONTO!

Agora você pode:

✅ Acessar a loja pública em http://localhost:3000
✅ Fazer login no admin panel
✅ Criar/editar produtos
✅ Ver produtos aparecendo na loja pública
✅ Testar todo o fluxo de CRUD

**As aplicações estão rodando nas portas corretas:**
- 🎨 Frontend: **3000**
- ⚙️ Backend: **3001**
- 🗄️ PostgreSQL: **5432**
