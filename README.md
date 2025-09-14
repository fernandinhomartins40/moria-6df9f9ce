# 🚗 Moria Peças & Serviços

**Sistema completo de e-commerce para oficina automotiva**

## 🏗️ Arquitetura

**Frontend + Backend Próprio**
- ✅ **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui
- ✅ **Backend**: Node.js + Express + SQLite3 + Knex.js
- ✅ **Painéis**: Lojista e Cliente
- ✅ **Deploy**: Frontend containerizado + Backend API

## 🚀 Configuração Rápida

### **Pré-requisitos:**
- Node.js 18+ e npm
- SQLite3 (será instalado automaticamente)

### **1. Clone e instale:**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### **2. Configure variáveis de ambiente:**

Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

Configure as variáveis em `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Moria Peças & Serviços
VITE_APP_ENV=development
```

### **3. Prepare o backend:**

**Nota**: O backend Node.js será implementado posteriormente. Por enquanto, a aplicação usa dados mockados.

### **4. Execute o frontend:**
```bash
npm run dev
```

**🎉 Aplicação funcionando em:** http://localhost:8080

---

## 📱 Funcionalidades

### **📄 Página Pública** (`/`)
- ✅ Catálogo de produtos e serviços
- ✅ Busca e filtros por categoria
- ✅ Carrinho de compras
- ✅ Sistema de promoções
- ✅ Checkout completo

### **🏪 Painel do Lojista** (`/store-panel`)
- ✅ **Dashboard** com estatísticas
- ✅ **Produtos**: CRUD completo, estoque, categorias
- ✅ **Serviços**: Gerenciamento completo
- ✅ **Pedidos**: Visualização e status
- ✅ **Promoções**: Campanhas e descontos
- ✅ **Cupons**: Sistema de cupons

### **👤 Painel do Cliente** (`/customer`)
- ✅ **Perfil**: Dados pessoais
- ✅ **Pedidos**: Histórico e status
- ✅ **Favoritos**: Lista de produtos
- ✅ **Endereços**: Gerenciamento

---

## 🗂️ Estrutura do Projeto

```
📁 src/
├── 📁 services/
│   └── 📄 api.ts                # API client para backend Node.js
├── 📁 hooks/
│   ├── 📄 useAuth.ts           # Autenticação
│   ├── 📄 useApiData.ts        # Hook genérico para API
│   └── 📄 useAdmin*.js         # Hooks dos painéis
├── 📁 components/
│   ├── 📁 ui/                  # shadcn/ui components
│   ├── 📁 admin/               # Componentes do painel lojista
│   └── 📁 customer/            # Componentes do painel cliente
├── 📁 contexts/
│   ├── 📄 AuthContext.tsx      # Contexto de autenticação
│   ├── 📄 CartContext.tsx      # Contexto do carrinho
│   └── 📄 NotificationContext.tsx # Contexto de notificações
└── 📁 pages/
    ├── 📄 Index.tsx            # Página pública
    ├── 📄 StorePanel.tsx       # Painel lojista
    └── 📄 CustomerPanel.tsx    # Painel cliente

📁 backend/ (será implementado)
├── 📄 server.js                # Servidor Express
├── 📄 database.js              # Configuração SQLite + Knex
├── 📁 routes/                  # Rotas da API
├── 📁 models/                  # Modelos do banco
└── 📁 migrations/              # Migrações do banco

📄 Dockerfile                   # Container do frontend
```

---

## 📊 Banco de Dados (Planejado)

### **Stack do Backend:**
- **Node.js + Express** - Servidor API
- **SQLite3** - Banco de dados leve e confiável
- **Knex.js** - Query builder e migrações
- **JWT** - Autenticação stateless

### **Tabelas principais:**
- `products` - Peças automotivas
- `services` - Serviços oferecidos
- `orders` + `order_items` - Sistema de pedidos
- `promotions` - Campanhas de desconto
- `coupons` - Cupons de desconto
- `users` - Usuários do sistema
- `addresses` - Endereços dos clientes

### **Recursos planejados:**
- ✅ **Migrações** com Knex.js
- ✅ **Seeders** para dados iniciais
- ✅ **Validação** de dados na API
- ✅ **Paginação** e filtros otimizados

---

## 🚀 Deploy

### **Frontend (Docker)**

```bash
# Build da imagem
docker build -t moria-frontend .

# Executar container
docker run -p 80:80 moria-frontend
```

### **Backend (Futuro)**

```bash
# Instalar dependências
npm install

# Executar migrações
npm run migrate

# Executar seeds
npm run seed

# Iniciar servidor
npm run start:prod
```

---

## 🛠️ Tecnologias

### **Frontend:**
- **React 18** - Interface moderna
- **Vite** - Build tool rápida
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utilitário
- **shadcn/ui** - Componentes acessíveis
- **React Query** - State management
- **React Router** - Roteamento SPA

### **Backend (Planejado):**
- **Node.js** - Runtime JavaScript
- **Express** - Framework web minimalista
- **SQLite3** - Banco de dados embarcado
- **Knex.js** - Query builder SQL
- **JWT** - JSON Web Tokens
- **bcrypt** - Hash de senhas

---

## 📝 Scripts Disponíveis

### Frontend:
```bash
npm run dev         # Desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview do build
npm run lint        # Análise de código
npm run typecheck   # Verificação de tipos
```

### Backend (Futuro):
```bash
npm run dev         # Desenvolvimento com nodemon
npm run build       # Build do TypeScript
npm run start       # Produção
npm run migrate     # Executar migrações
npm run seed        # Executar seeds
npm run reset       # Resetar banco de dados
```

---

## 🎯 Vantagens da Nova Arquitetura

### **Operacionais:**
- ✅ **Controle total** sobre o backend
- ✅ **Banco local** (SQLite) - sem dependência externa
- ✅ **Deploy simples** - frontend + API
- ✅ **Backup fácil** - arquivo único SQLite

### **Performance:**
- ✅ **API otimizada** para as necessidades específicas
- ✅ **SQLite** - extremamente rápido para reads
- ✅ **Cache** implementado conforme necessário

### **Desenvolvimento:**
- ✅ **Full Stack JavaScript/TypeScript**
- ✅ **Desenvolvimento offline** completo
- ✅ **Migrations** e **seeds** versionados
- ✅ **API REST** padronizada

### **Custo:**
- ✅ **Zero custos** de BaaS
- ✅ **VPS simples** suficiente
- ✅ **Escalabilidade** controlada

---

## 📈 Roadmap do Backend

### **Fase 1 - API Básica:**
- [ ] Setup do servidor Express
- [ ] Configuração SQLite + Knex
- [ ] Autenticação JWT
- [ ] CRUD de produtos

### **Fase 2 - Funcionalidades Core:**
- [ ] Sistema de pedidos
- [ ] Gerenciamento de estoque
- [ ] Painel administrativo
- [ ] API de promoções

### **Fase 3 - Features Avançadas:**
- [ ] Upload de imagens
- [ ] Relatórios e dashboard
- [ ] Sistema de notificações
- [ ] Cache Redis (opcional)

---

## 🆘 Próximos Passos

1. **Implementar Backend**: Criar API Node.js + SQLite3
2. **Conectar Frontend**: Substituir dados mockados pela API real
3. **Autenticação**: Implementar login/registro completo
4. **Deploy**: Configurar ambiente de produção

---

**✨ Aplicação preparada para backend Node.js + SQLite3 + Knex!**