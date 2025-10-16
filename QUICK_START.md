# 🚀 Quick Start - Moria Pesca e Serviços

Guia rápido para começar a desenvolver no monorepo.

## ⚡ Setup Inicial (5 minutos)

### 1. Clone e Instale
```bash
# Clone o repositório
git clone <repository-url>
cd moria-pesca-servicos

# Instale todas as dependências
npm install
```

### 2. Configure Ambiente
```bash
# Frontend
cd apps/frontend
cp .env.example .env
# Edite .env se necessário

# Volte para raiz
cd ../..
```

### 3. Rode o Frontend
```bash
npm run dev
# ou
npm run dev:frontend
```

Acesse: http://localhost:5173

## 📁 Estrutura Rápida

```
moria-pesca-servicos/
├── apps/
│   ├── frontend/        ← Aplicação React
│   └── backend/         ← Backend (a implementar)
└── packages/
    ├── types/           ← Tipos compartilhados
    └── utils/           ← Utilitários compartilhados
```

## 🛠️ Comandos Principais

```bash
# Desenvolvimento
npm run dev              # Frontend
npm run dev:frontend     # Frontend (explícito)
npm run dev:backend      # Backend (quando implementado)
npm run dev:all          # Ambos simultaneamente

# Build
npm run build            # Build tudo
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Lint
npm run lint             # Lint tudo

# Limpar
npm run clean            # Limpar builds e deps
```

## 📦 Adicionar Dependências

```bash
# Dependência no frontend
npm install <package> --workspace=apps/frontend

# Dependência no backend
npm install <package> --workspace=apps/backend

# Dependência global (root)
npm install <package>
```

## 🎯 Workflow Diário

### Desenvolvendo Frontend
```bash
# 1. Inicie o dev server
npm run dev:frontend

# 2. Acesse
# http://localhost:5173

# 3. Edite arquivos em apps/frontend/src/
# Hot reload automático
```

### Usando Packages Compartilhados
```typescript
// Em qualquer arquivo do frontend ou backend
import { Customer, Product } from '@moria/types';
import { formatCurrency, validateCPF } from '@moria/utils';
```

## 🔌 Preparando Backend

Quando for implementar o backend:

```bash
# 1. Escolha uma stack (veja apps/backend/README.md)
# Exemplo: Node.js + Express + Prisma

cd apps/backend

# 2. Instale dependências
npm install express prisma @prisma/client cors dotenv

# 3. Crie estrutura
mkdir -p src/{routes,controllers,services,models}

# 4. Configure .env
cp .env.example .env

# 5. Implemente endpoints
# Veja FRONTEND_BACKEND_INTEGRATION.md

# 6. Rode o backend
npm run dev
```

## 📚 Documentação

- [README.md](./README.md) - Documentação completa
- [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) - Arquitetura
- [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) - Integração
- [apps/frontend/README.md](./apps/frontend/README.md) - Frontend
- [apps/backend/README.md](./apps/backend/README.md) - Backend

## 🐛 Troubleshooting

### Erro: Cannot find module '@moria/types'
```bash
# Reinstale as dependências
npm install
```

### Erro: Port 5173 already in use
```bash
# Mude a porta no vite.config.ts
# ou mate o processo na porta 5173
```

### Build falha
```bash
# Limpe e reinstale
npm run clean
npm install
npm run build
```

### Tipos não atualizam
```bash
# Force reinstall dos packages
rm -rf node_modules package-lock.json
npm install
```

## ✅ Checklist de Setup

- [ ] Repositório clonado
- [ ] `npm install` executado
- [ ] `.env` configurado em `apps/frontend/`
- [ ] Frontend rodando em localhost:5173
- [ ] Acesso ao painel admin
- [ ] Acesso ao painel do cliente
- [ ] Hot reload funcionando

## 🎓 Próximos Passos

1. **Explorar Frontend**
   - Navegue pelas páginas
   - Veja os componentes
   - Entenda a estrutura

2. **Implementar Backend**
   - Escolha a stack
   - Implemente endpoints
   - Conecte ao frontend

3. **Adicionar Features**
   - Novos componentes
   - Novas páginas
   - Novos services

4. **Testes**
   - Unit tests
   - Integration tests
   - E2E tests

## 💡 Dicas

- Use `@moria/types` para manter consistência de tipos
- Use `@moria/utils` para funções reutilizáveis
- Siga os padrões de código existentes
- Consulte a documentação quando tiver dúvidas

## 🆘 Ajuda

Se encontrar problemas:
1. Verifique a documentação
2. Veja os issues no GitHub
3. Entre em contato com a equipe

---

**Happy Coding! 🚀**
