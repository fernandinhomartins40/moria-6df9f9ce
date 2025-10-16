# Backend - Moria Pesca e Serviços

Este diretório está preparado para receber a implementação do backend.

## 🎯 Status

⏳ **Aguardando implementação**

## 🛠️ Stacks Sugeridas

Escolha uma das seguintes stacks para implementar o backend:

### 1. Node.js + Express + Prisma + PostgreSQL
```bash
npm install express prisma @prisma/client cors dotenv
npm install -D @types/express @types/cors @types/node tsx nodemon
```

### 2. Node.js + Fastify + Prisma + PostgreSQL
```bash
npm install fastify @fastify/cors prisma @prisma/client dotenv
npm install -D @types/node tsx
```

### 3. Node.js + NestJS + Prisma + PostgreSQL
```bash
npm install @nestjs/core @nestjs/common @nestjs/platform-express prisma @prisma/client
npm install -D @nestjs/cli @types/node tsx
```

### 4. Python + FastAPI + SQLAlchemy + PostgreSQL
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose passlib
```

### 5. Go + Gin + GORM + PostgreSQL
```bash
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
```

## 📁 Estrutura Sugerida

```
apps/backend/
├── src/
│   ├── config/           # Configurações
│   ├── controllers/      # Controllers/Handlers
│   ├── services/         # Lógica de negócio
│   ├── models/           # Modelos do banco
│   ├── routes/           # Rotas da API
│   ├── middlewares/      # Middlewares
│   ├── utils/            # Utilitários
│   └── index.ts          # Entry point
├── prisma/               # Schema do Prisma (se usar)
│   ├── schema.prisma
│   └── migrations/
├── tests/                # Testes
├── .env                  # Variáveis de ambiente
├── .env.example          # Exemplo de .env
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Endpoints Necessários

Consulte o arquivo [FRONTEND_BACKEND_INTEGRATION.md](../../FRONTEND_BACKEND_INTEGRATION.md) na raiz do projeto para ver a lista completa de endpoints que o frontend espera.

### Principais Grupos de Endpoints

- **Auth**: Login, registro, perfil
- **Products**: CRUD de produtos
- **Services**: CRUD de serviços
- **Promotions**: Sistema de promoções
- **Orders**: Gestão de pedidos
- **Customers**: Gestão de clientes
- **Favorites**: Favoritos
- **Coupons**: Cupons de desconto
- **Addresses**: Endereços

## 🗄️ Banco de Dados

Escolha um dos seguintes bancos:
- PostgreSQL (recomendado)
- MySQL
- SQLite (desenvolvimento)
- MongoDB

## 🔐 Autenticação

Implementar autenticação JWT:
- Token JWT retornado no login/registro
- Validação de token em rotas protegidas
- Refresh token (opcional)

## 🚀 Desenvolvimento

Após escolher e implementar a stack:

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar migrations (se usar Prisma)
npx prisma migrate dev

# Rodar seeds
npm run seed

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## 📦 Tipos Compartilhados

O monorepo possui um pacote `@moria/types` com todos os tipos TypeScript compartilhados entre frontend e backend.

Para usar:
```typescript
import { Customer, Product, Order } from '@moria/types';
```

## 🧪 Testes

Implementar testes:
- Unitários
- Integração
- E2E

## 📝 Próximos Passos

1. Escolher stack
2. Instalar dependências
3. Configurar banco de dados
4. Implementar modelos
5. Implementar rotas e controllers
6. Implementar autenticação
7. Testar integração com frontend
8. Implementar testes
9. Deploy

## 🔗 Links Úteis

- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Express](https://expressjs.com/)
- [Documentação Fastify](https://www.fastify.io/)
- [Documentação NestJS](https://nestjs.com/)
- [Documentação FastAPI](https://fastapi.tiangolo.com/)
