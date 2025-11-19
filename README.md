# Moria Pesca e Serviços - Monorepo

Sistema de e-commerce para venda de produtos de pesca e agendamento de serviços náuticos.

## 🏗️ Arquitetura Monorepo

Este projeto utiliza uma arquitetura monorepo com **npm workspaces** e **Turbo** para gerenciar múltiplos pacotes e aplicações.

```
moria-pesca-servicos/
├── apps/
│   ├── frontend/          # Aplicação React + Vite
│   └── backend/           # Backend (aguardando implementação)
├── packages/
│   ├── types/             # Tipos TypeScript compartilhados
│   └── utils/             # Utilitários compartilhados
├── package.json           # Workspace root
├── turbo.json            # Configuração Turbo
└── README.md
```

## 🚀 Tecnologias

### Monorepo
- **npm workspaces** - Gerenciamento de monorepo
- **Turbo** - Build system otimizado

### Frontend
- **React 18** com TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **React Router** - Roteamento
- **React Query** - Gestão de estado
- **Axios** - Cliente HTTP
- **Zod** - Validação

### Backend
- ⏳ Aguardando implementação
- Sugestões: Node.js/Python/Go + PostgreSQL

### Packages
- **@moria/types** - Tipos compartilhados
- **@moria/utils** - Utilitários compartilhados

## 📦 Instalação

```bash
# Instalar todas as dependências do monorepo
npm install

# Ou
npm run install:all
```

## 🛠️ Desenvolvimento

```bash
# Rodar apenas o frontend
npm run dev
# ou
npm run dev:frontend

# Rodar apenas o backend (quando implementado)
npm run dev:backend

# Rodar frontend e backend simultaneamente
npm run dev:all
```

## 🏗️ Build

```bash
# Build de todos os workspaces
npm run build

# Build apenas do frontend
npm run build:frontend

# Build apenas do backend
npm run build:backend
```

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

## 📁 Estrutura do Projeto

```
src/
├── api/              # Services de integração com backend
├── components/       # Componentes React reutilizáveis
│   ├── ui/          # Componentes base do Shadcn/ui
│   ├── admin/       # Componentes do painel admin
│   └── customer/    # Componentes do painel do cliente
├── contexts/        # Contexts do React (Auth, Cart, etc)
├── hooks/           # Custom hooks
├── pages/           # Páginas/rotas da aplicação
├── lib/             # Utilitários e helpers
├── schemas/         # Schemas de validação Zod
├── types/           # Definições de tipos TypeScript
├── utils/           # Funções utilitárias
└── config/          # Configurações da aplicação
```

## 🎯 Funcionalidades

### Área Pública
- ✅ Catálogo de produtos de pesca
- ✅ Catálogo de serviços náuticos
- ✅ Sistema de promoções avançado
- ✅ Carrinho de compras
- ✅ Checkout com cupons de desconto
- ✅ Filtros avançados de produtos
- ✅ Busca inteligente

### Painel do Cliente
- ✅ Dashboard personalizado
- ✅ Perfil e dados pessoais
- ✅ Histórico de pedidos
- ✅ Produtos favoritos
- ✅ Gestão de endereços
- ✅ Sistema de níveis (Bronze, Prata, Ouro, Platina)

### Painel Administrativo
- ✅ Dashboard com analytics
- ✅ Gestão de produtos
- ✅ Gestão de serviços
- ✅ Gestão de pedidos
- ✅ Gestão de clientes
- ✅ Sistema de promoções
- ✅ Gestão de cupons
- ✅ Relatórios e estatísticas

## 🔌 Integração Backend

O frontend está **preparado para receber um backend**. Consulte o arquivo [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) para:
- Endpoints esperados
- Estrutura de dados
- Autenticação JWT
- Guia de integração

### Status Atual
- ✅ Frontend totalmente funcional (UI/UX)
- ✅ Services API prontos para integração
- ⏳ Backend aguardando implementação
- ⏳ Chamadas de API aguardando endpoints reais

## 🎨 Componentes UI

O projeto utiliza o **Shadcn/ui**, uma coleção de componentes reutilizáveis construídos com Radix UI e Tailwind CSS:

- Accordion
- Alert Dialog
- Avatar
- Badge
- Button
- Card
- Checkbox
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Select
- Table
- Tabs
- Toast
- Tooltip
- E mais...

## 🛣️ Rotas

- `/` - Página inicial
- `/about` - Sobre a empresa
- `/contact` - Contato
- `/customer` - Painel do cliente
  - `/customer/dashboard` - Dashboard
  - `/customer/profile` - Perfil
  - `/customer/orders` - Pedidos
  - `/customer/favorites` - Favoritos
- `/admin` - Painel administrativo
  - `/admin/dashboard` - Dashboard
  - `/admin/products` - Produtos
  - `/admin/services` - Serviços
  - `/admin/orders` - Pedidos
  - `/admin/customers` - Clientes
  - `/admin/promotions` - Promoções
  - `/admin/analytics` - Analytics

## 🔐 Autenticação

O sistema está preparado para autenticação JWT:
- Token armazenado em `localStorage`
- Interceptor automático no Axios
- Proteção de rotas privadas
- Renovação automática de sessão

## 📱 Responsividade

O frontend é totalmente responsivo e otimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Wide Desktop (1440px+)

## 🧪 Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 📦 Gestão de Volumes e Imagens

O projeto utiliza **Docker Named Volumes** para persistir imagens de produtos entre deploys.

### Scripts de Gerenciamento

```bash
# Verificar status dos volumes e contagem de imagens
./scripts/verify-volumes.sh

# Criar backup das imagens de produtos
./scripts/backup-uploads.sh

# Restaurar imagens de um backup
./scripts/restore-uploads.sh ./backups/uploads_backup_XXXXX.tar.gz
```

### ⚠️ Comandos Proibidos em Produção

**NUNCA execute:**
```bash
# ❌ Remove volumes e PERDE todas as imagens!
docker-compose -f docker-compose.vps.yml down -v
docker volume rm moria-6df9f9ce_uploads_data
docker volume prune
```

### ✅ Comandos Seguros

```bash
# ✅ Para containers preservando volumes
docker-compose -f docker-compose.vps.yml down

# ✅ Reinicia sem afetar dados
docker-compose -f docker-compose.vps.yml restart
```

📚 **Documentação completa**: [docs/VOLUMES-E-IMAGENS.md](docs/VOLUMES-E-IMAGENS.md)

## 📝 Próximos Passos

1. **Implementar Backend**
   - Escolher stack (Node.js/Python/Go/etc)
   - Implementar endpoints conforme documentação
   - Conectar banco de dados

2. **Testes**
   - Implementar testes unitários
   - Implementar testes E2E
   - Cobertura de código

3. **Deploy**
   - Configurar CI/CD
   - Deploy do frontend (Vercel/Netlify)
   - Deploy do backend

## 📄 Licença

Propriedade de Moria Pesca e Serviços. Todos os direitos reservados.

## 👥 Contato

Para mais informações, entre em contato através do nosso site ou redes sociais.
