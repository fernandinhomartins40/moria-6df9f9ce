# Frontend - Moria Pesca e Serviços

Aplicação React com Vite para o e-commerce de produtos de pesca e serviços náuticos.

## 🚀 Tecnologias

- **React 18** com TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **React Router** - Roteamento
- **React Query** - Gestão de estado e cache
- **Axios** - Cliente HTTP
- **Zod** - Validação de dados
- **React Hook Form** - Formulários

## 📦 Instalação

```bash
# A partir da raiz do monorepo
npm install

# Ou diretamente neste workspace
npm install --workspace=apps/frontend
```

## 🛠️ Desenvolvimento

```bash
# A partir da raiz
npm run dev:frontend

# Ou diretamente
npm run dev
```

## 🔧 Configuração

Crie um arquivo `.env` neste diretório baseado no `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

## 📁 Estrutura

```
src/
├── api/              # Services de integração com backend
├── components/       # Componentes React
│   ├── ui/          # Componentes base Shadcn/ui
│   ├── admin/       # Componentes admin
│   └── customer/    # Componentes cliente
├── contexts/        # React Contexts
├── hooks/           # Custom hooks
├── pages/           # Páginas/rotas
├── lib/             # Utilitários
├── schemas/         # Schemas Zod
├── types/           # Tipos TypeScript
├── utils/           # Funções utilitárias
└── config/          # Configurações
```

## 🎯 Funcionalidades

### Área Pública
- ✅ Catálogo de produtos
- ✅ Catálogo de serviços
- ✅ Sistema de promoções
- ✅ Carrinho de compras
- ✅ Checkout com cupons
- ✅ Filtros avançados
- ✅ Busca inteligente

### Painel do Cliente
- ✅ Dashboard
- ✅ Perfil
- ✅ Histórico de pedidos
- ✅ Favoritos
- ✅ Endereços
- ✅ Sistema de níveis

### Painel Admin
- ✅ Dashboard com analytics
- ✅ Gestão de produtos
- ✅ Gestão de serviços
- ✅ Gestão de pedidos
- ✅ Gestão de clientes
- ✅ Sistema de promoções
- ✅ Gestão de cupons

## 🔌 Integração Backend

O frontend está preparado para receber um backend. Consulte:
- [FRONTEND_BACKEND_INTEGRATION.md](../../FRONTEND_BACKEND_INTEGRATION.md)
- [apps/backend/README.md](../backend/README.md)

## 🎨 Componentes UI

Utilizamos **Shadcn/ui** com Radix UI e Tailwind CSS:
- Accordion, Alert Dialog, Avatar, Badge
- Button, Card, Checkbox, Dialog
- Dropdown Menu, Form, Input, Label
- Select, Table, Tabs, Toast, Tooltip
- E mais...

## 🛣️ Rotas

- `/` - Home
- `/about` - Sobre
- `/contact` - Contato
- `/customer/*` - Painel do cliente
- `/admin/*` - Painel administrativo

## 📱 Responsividade

Otimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Wide (1440px+)

## 🧪 Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview build
npm run lint         # Lint
npm run clean        # Limpar
```

## 🔐 Autenticação

Sistema preparado para JWT:
- Token em `localStorage`
- Interceptor automático Axios
- Proteção de rotas
- Renovação de sessão

## 📦 Packages Compartilhados

```typescript
// Tipos
import { Customer, Product } from '@moria/types';

// Utils
import { formatCurrency, validateCPF } from '@moria/utils';
```

## 🌐 Porta

http://localhost:5173
