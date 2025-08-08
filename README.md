# 🚗 Moria Peças & Serviços

**Sistema completo de e-commerce para oficina automotiva com Supabase**

## 🏗️ Arquitetura

**Frontend-Only com Supabase Backend**
- ✅ **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui
- ✅ **Backend**: Supabase (PostgreSQL + Row Level Security)
- ✅ **Painéis**: Lojista e Cliente mantidos
- ✅ **Deploy**: Simplificado (apenas frontend)

## 🚀 Configuração Rápida

### **Pré-requisitos:**
- Node.js 18+ e npm
- Conta no [Supabase](https://supabase.com) (gratuita)

### **1. Clone e instale:**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### **2. Configure Supabase:**

**Siga o guia completo:** [`docs/INSTRUCOES_SUPABASE.md`](./docs/INSTRUCOES_SUPABASE.md)

Resumo rápido:
1. Crie projeto no [Supabase](https://supabase.com)
2. Execute o schema: [`docs/supabase_schema.sql`](./docs/supabase_schema.sql)
3. Configure `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://sua-url.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-aqui
   ```

### **3. Execute:**
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

## 🛡️ Segurança (RLS)

### **Dados Públicos:**
- ✅ Produtos e serviços ativos
- ✅ Promoções vigentes

### **Dados Privados:**
- ✅ Pedidos (apenas do usuário)
- ✅ Perfil e favoritos

### **Apenas Admin:**
- ✅ Gerenciar produtos/serviços
- ✅ Ver todos pedidos
- ✅ Configurações da loja

---

## 🗂️ Estrutura do Projeto

```
📁 src/
├── 📁 config/
│   └── 📄 supabase.ts          # Configuração Supabase
├── 📁 services/
│   └── 📄 supabaseApi.ts       # API client Supabase
├── 📁 hooks/
│   ├── 📄 useAuth.ts           # Autenticação
│   ├── 📄 useSupabaseData.ts   # Hook genérico
│   └── 📄 useAdmin*.js         # Hooks dos painéis
├── 📁 components/
│   ├── 📁 ui/                  # shadcn/ui components
│   ├── 📁 admin/               # Componentes do painel lojista
│   └── 📁 customer/            # Componentes do painel cliente
└── 📁 pages/
    ├── 📄 Index.tsx            # Página pública
    ├── 📄 StorePanel.tsx       # Painel lojista
    └── 📄 CustomerPanel.tsx    # Painel cliente

📁 docs/                        # Documentação
├── 📄 supabase_schema.sql      # Schema PostgreSQL
├── 📄 INSTRUCOES_SUPABASE.md   # Setup do Supabase
└── 📄 MIGRACAO_CONCLUIDA.md    # Info da migração

📁 backup_before_supabase/      # Backup do backend anterior
📄 Dockerfile                   # Container otimizado
📄 .github/workflows/deploy.yml # Deploy automatizado
```

---

## 📊 Banco de Dados (Supabase)

### **Tabelas principais:**
- `products` - Peças automotivas
- `services` - Serviços oferecidos  
- `orders` + `order_items` - Sistema de pedidos
- `promotions` - Campanhas de desconto
- `coupons` - Cupons de desconto
- `app_configs` - Configurações da loja

### **Recursos avançados:**
- ✅ **Views otimizadas** para consultas complexas
- ✅ **Triggers** para updated_at automático
- ✅ **Índices** para performance
- ✅ **Row Level Security** para segurança

---

## 🚀 Deploy

### **Frontend (Recomendado: Vercel/Netlify)**

**Vercel:**
```bash
# 1. Build
npm run build

# 2. Deploy
npx vercel

# 3. Configure environment variables no dashboard
```

**Netlify:**
```bash
# 1. Build  
npm run build

# 2. Deploy pasta dist/
```

### **Configuração de Produção:**

**No Supabase:**
- Configure domínio em Authentication → Settings
- Configure CORS se necessário

**No hosting:**
- Configure variáveis: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 📈 Monitoramento

**Dashboard Supabase disponível:**
- ✅ **Métricas**: Requisições, performance, uso
- ✅ **Logs**: Database, API, Auth em tempo real
- ✅ **Alertas**: Configuráveis por uso/erro

---

## 🛠️ Tecnologias

### **Frontend:**
- **React 18** - Interface moderna
- **Vite** - Build tool rápida  
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utilitário
- **shadcn/ui** - Componentes acessíveis
- **React Query** - State management

### **Backend:**
- **Supabase** - BaaS completo
- **PostgreSQL** - Banco robusto
- **Row Level Security** - Segurança automática
- **Real-time** - Capacidades nativas

---

## 📝 Scripts Disponíveis

```bash
npm run dev         # Desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview do build
npm run lint        # Análise de código
```

---

## 🎯 Vantagens da Arquitetura

### **Operacionais:**
- ✅ **Zero manutenção** de servidor
- ✅ **Backup automático**  
- ✅ **Escala automática**
- ✅ **Deploy simples**

### **Performance:**
- ✅ **CDN global**
- ✅ **Cache otimizado**
- ✅ **PostgreSQL** performático

### **Segurança:**
- ✅ **SSL gerenciado**
- ✅ **RLS automático**
- ✅ **Isolamento de dados**

### **Desenvolvimento:**
- ✅ **Real-time** nativo
- ✅ **Types** automáticos
- ✅ **API REST/GraphQL** geradas
- ✅ **Dashboard** built-in

---

## 🆘 Suporte

1. **Configuração**: Veja [`docs/INSTRUCOES_SUPABASE.md`](./docs/INSTRUCOES_SUPABASE.md)
2. **Migração**: Veja [`docs/MIGRACAO_CONCLUIDA.md`](./docs/MIGRACAO_CONCLUIDA.md)
3. **Backup**: Disponível em `backup_before_supabase/`

---

**✨ Sistema pronto para produção com Supabase!**