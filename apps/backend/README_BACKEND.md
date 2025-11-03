# Moria Backend - API REST

Backend completo desenvolvido com Node.js, TypeScript, Express, Prisma e PostgreSQL.

## 🚀 Tecnologias

- **Node.js 18+**
- **TypeScript 5.5**
- **Express.js 4.19**
- **Prisma ORM 5.19**
- **PostgreSQL 16**
- **JWT Authentication**
- **Bcrypt** para hash de senhas
- **Zod** para validação
- **Winston** para logging

## 📁 Estrutura

```
src/
├── config/              # Configurações (database, environment, cors)
├── middlewares/         # Middlewares (auth, error)
├── modules/             # Módulos da aplicação
│   ├── auth/           # Autenticação e perfil
│   └── addresses/      # Gerenciamento de endereços
├── shared/             # Código compartilhado
│   └── utils/          # Utilidades (hash, jwt, logger, pagination, error)
├── app.ts              # Configuração do Express
└── server.ts           # Entry point da aplicação
```

## 🔧 Configuração

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. **Gerar Prisma Client:**
```bash
npx prisma generate
```

4. **Executar migrations:**
```bash
npx prisma migrate dev
```

5. **Iniciar em modo desenvolvimento:**
```bash
npm run dev
```

## 📡 Endpoints

### Autenticação

- `POST /auth/register` - Registrar novo cliente
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Obter perfil (autenticado)
- `PUT /auth/profile` - Atualizar perfil (autenticado)

### Endereços

- `GET /addresses` - Listar endereços (autenticado)
- `GET /addresses/:id` - Obter endereço específico (autenticado)
- `POST /addresses` - Criar endereço (autenticado)
- `PUT /addresses/:id` - Atualizar endereço (autenticado)
- `DELETE /addresses/:id` - Deletar endereço (autenticado)
- `PATCH /addresses/:id/default` - Definir como padrão (autenticado)

### Health Check

- `GET /health` - Verificar status do servidor

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação.

**Header de autorização:**
```
Authorization: Bearer <token>
```

## 🗄️ Database

O projeto utiliza Prisma ORM com PostgreSQL.

**Comandos úteis:**

```bash
# Criar migration
npx prisma migrate dev --name migration_name

# Aplicar migrations em produção
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Resetar database (CUIDADO!)
npx prisma migrate reset
```

## 🐳 Docker

O backend está configurado para rodar em Docker:

```bash
# Na raiz do projeto
cd docker
docker-compose up -d
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento com hot reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor em produção
- `npm run lint` - Executa ESLint
- `npm run format` - Formata código com Prettier
- `npm test` - Executa testes

## 🔍 Logs

Os logs são armazenados na pasta `logs/`:
- `error.log` - Apenas erros
- `combined.log` - Todos os logs

## 🛡️ Segurança

- Senhas hashadas com bcrypt (10 rounds)
- JWT com assinatura e verificação
- Helmet para headers de segurança
- CORS configurado
- Rate limiting (via Nginx)
- Validação de entrada com Zod

## 📚 Próximas Fases

Este é apenas a **Fase 1** do backend. As próximas fases incluirão:

- **Fase 2:** Produtos, Serviços, Veículos
- **Fase 3:** Pedidos, Promoções, Cupons
- **Fase 4:** Revisões Veiculares, Testes, Documentação

Consulte [PLANO_IMPLEMENTACAO_BACKEND.md](../../PLANO_IMPLEMENTACAO_BACKEND.md) para detalhes completos.
