# 🚀 Backend Unificado React+Vite - Single Tenant

## 📋 Visão Geral

Este é um backend **single-tenant** Node.js/Express integrado perfeitamente com a aplicação React+Vite existente. Cada cliente recebe uma instância completa e independente da aplicação.

### 🏗️ Arquitetura Single-Tenant

- **Modelo:** Uma aplicação completa por cliente
- **Deploy:** Instâncias separadas por cliente
- **Dados:** Banco dedicado por instância (futuro)
- **Desenvolvimento:** Frontend (8080) + Backend (3080) com proxy
- **Produção:** Unificado em uma única porta (backend serve React build)

## 📁 Estrutura do Projeto

```
moria-6df9f9ce/
├── src/                    # Frontend React+Vite (EXISTENTE)
├── backend/               # Novo backend Node.js/Express
│   ├── src/
│   │   ├── server.js      # Servidor principal
│   │   ├── routes/
│   │   │   └── api.js     # Rotas da API com dados mock
│   │   └── middleware/    # Futuros middlewares
│   ├── package.json       # Dependências do backend
│   └── .env              # Variáveis de ambiente
├── vite.config.ts        # Configurado com proxy para /api
├── package.json          # Scripts unificados
└── BACKEND_README.md     # Este arquivo
```

## 🚀 Comandos Disponíveis

### Desenvolvimento (Frontend + Backend juntos)
```bash
# Instalar todas as dependências
npm run install:all

# Rodar frontend e backend simultaneamente
npm run dev
# Frontend: http://localhost:8080
# Backend:  http://localhost:3080
# Proxy:    /api/* -> backend automático
```

### Frontend isolado
```bash
npm run frontend:dev    # Apenas Vite dev server
```

### Backend isolado
```bash
npm run backend:dev     # Apenas backend Express
```

### Produção
```bash
# Build do frontend e start do backend
npm run deploy

# Ou separadamente:
npm run build          # Build do React
npm run start          # Start do backend (serve frontend + APIs)
```

### Testes
```bash
npm test              # Todos os testes
npm run test:frontend # Testes do frontend
npm run test:backend  # Testes do backend
```

## 🌐 URLs e Endpoints

### Desenvolvimento
- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3080
- **APIs:** http://localhost:8080/api/* (proxy automático)

### Produção
- **Aplicação completa:** http://localhost:3080
- **Frontend:** Servido estaticamente pelo backend
- **APIs:** http://localhost:3080/api/*

## 📡 APIs Disponíveis

### Health Check
```bash
GET /api/health
# Retorna status do backend
```

### Dashboard
```bash
GET /api/dashboard/stats
# Estatísticas gerais do sistema
```

### Produtos
```bash
GET    /api/products                    # Listar produtos
GET    /api/products/:id                # Buscar produto específico
POST   /api/products                    # Criar produto
PUT    /api/products/:id                # Atualizar produto
DELETE /api/products/:id                # Deletar produto

# Filtros disponíveis:
GET /api/products?category=Filtros      # Por categoria
GET /api/products?active=true           # Por status
GET /api/products?search=óleo           # Busca textual
```

### Pedidos
```bash
GET  /api/orders                        # Listar pedidos
POST /api/orders                        # Criar pedido

# Filtros disponíveis:
GET /api/orders?status=pending          # Por status
GET /api/orders?customer=João           # Por nome do cliente
```

### Serviços
```bash
GET /api/services                       # Listar serviços
GET /api/services?active=true           # Apenas ativos
```

## 💻 Uso no Frontend

### Importar API Service
```javascript
// Importar service completo
import api from '@/services/api.js';

// Ou importar métodos específicos
import { getProducts, createProduct, formatPrice } from '@/services/api.js';
```

### Exemplos de Uso
```javascript
// Listar produtos ativos
const response = await api.getProducts({ active: true });
const products = response.data;

// Criar novo produto
const newProduct = {
  name: 'Filtro de Óleo',
  description: 'Filtro de alta qualidade',
  category: 'Filtros',
  price: 25.90,
  stock: 50
};
await api.createProduct(newProduct);

// Health check
const health = await api.healthCheck();
console.log('Backend status:', health.message);

// Dashboard stats
const stats = await api.getDashboardStats();
console.log('Total produtos:', stats.data.totalProducts);
```

### Tratamento de Erros
```javascript
try {
  const products = await api.getProducts();
  console.log('Produtos carregados:', products.data);
} catch (error) {
  console.error('Erro ao carregar produtos:', error.message);
}
```

## 🛠️ Configuração

### Environment Variables (.env do backend)
```bash
# Servidor
PORT=3080
NODE_ENV=development

# Aplicação
APP_NAME="Moria Peças & Serviços Backend"
CLIENT_NAME="Nome do Cliente"

# CORS (produção)
ALLOWED_ORIGIN=https://seudominio.com
```

### CORS Automático
- **Desenvolvimento:** Permite localhost:8080 (frontend)
- **Produção:** Permite domínio específico ou configurado

## 🔧 Características Técnicas

### Middleware Configurado
- **Helmet:** Segurança básica
- **CORS:** Configuração single-tenant
- **Express.json:** Parser JSON (limit 10MB)
- **Static files:** Servir build do React em produção
- **Logs:** Console simples com timestamp

### Dados Mock (Desenvolvimento)
- **3 produtos** de autopeças pré-cadastrados
- **1 pedido** de exemplo
- **1 serviço** de exemplo
- **IDs sequenciais** simples
- **CRUD completo** em memória

### SPA Support
- **React Router:** Fallback automático (`/*` → `index.html`)
- **API Routes:** Sempre em `/api/*`
- **Static Assets:** Servidos automaticamente

## 🔄 Como Funciona

### Desenvolvimento
1. `npm run dev` inicia frontend (8080) e backend (3080)
2. Vite configura proxy: `/api/*` → `http://localhost:3080/api/*`
3. Frontend faz requests para `/api/products` → proxy automático
4. CORS permite origin `localhost:8080`

### Produção
1. `npm run build` gera build do React em `/dist`
2. `npm run start` inicia apenas o backend
3. Backend serve `/dist` estaticamente
4. APIs continuam em `/api/*`
5. React Router funciona com SPA fallback

### Single Tenant
- **Sem complexidade multi-tenant**
- **Dados diretos, sem filtros de tenant**
- **Uma aplicação = um cliente**
- **Deploy independente por cliente**
- **Customizações específicas possíveis**

## 🚦 Testando a Integração

### 1. Health Check
```bash
# Backend direto
curl http://localhost:3080/api/health

# Via proxy (desenvolvimento)
curl http://localhost:8080/api/health
```

### 2. Componente de Exemplo
Acesse o componente `ApiExample.jsx` criado em `/src/components/examples/` para ver a integração funcionando.

### 3. Verificar Logs
O backend mostra logs coloridos de todas as requisições:
```
[2025-08-07T21:30:45.123Z] GET /api/products
[2025-08-07T21:30:45.456Z] POST /api/products
```

## ✅ Vantagens Single-Tenant

### Simplicidade
- ✅ Zero configuração de tenant
- ✅ Sem middleware de isolamento  
- ✅ Dados diretos, sem filtros
- ✅ Deploy independente por cliente

### Facilidade de Manutenção
- ✅ Uma aplicação = um cliente
- ✅ Problemas isolados por instância
- ✅ Customizações específicas possíveis
- ✅ Backup simples (uma instância)

### Performance
- ✅ Sem overhead de multi-tenancy
- ✅ Queries diretas sem filtros
- ✅ Cache simples e eficiente
- ✅ Recursos dedicados por cliente

## 🔮 Próximos Passos

1. **Banco de Dados:** Substituir dados mock por PostgreSQL/MySQL
2. **Autenticação:** JWT simples para acesso ao painel admin
3. **File Upload:** Para imagens de produtos
4. **Email Service:** Notificações automáticas
5. **Deployment:** Docker ou PM2 para produção

## 🐛 Troubleshooting

### Erro de CORS
- Verificar se frontend está na porta 8080
- Verificar ALLOWED_ORIGIN em produção

### APIs não encontradas
- Verificar se backend está rodando na porta 3080
- Verificar se proxy está configurado no vite.config.ts

### Build não servido
- Verificar se `npm run build` foi executado
- Verificar path do frontendBuildPath no server.js

---

**Este é um backend single-tenant simples e eficiente, perfeito para aplicações que serão deployadas individualmente para cada cliente! 🎉**