# 🚀 Moria Backend - Node.js + SQLite3

Backend completo para o sistema Moria Peças & Serviços.

## 📋 Fase 1 - ✅ CONCLUÍDA

### ✅ Entregáveis Implementados

- **✅ Backend funcional com servidor Express**
  - Servidor rodando na porta 3001
  - Middlewares de segurança configurados (helmet, cors)
  - Logging com morgan
  - Tratamento de erros global

- **✅ Banco SQLite3 configurado**
  - Knex.js configurado para desenvolvimento e produção
  - Conexão testada e funcional
  - Pool de conexões configurado

- **✅ Estrutura de pastas definida**
  ```
  backend/
  ├── src/
  │   ├── controllers/   # Controladores (Fase 3)
  │   ├── middleware/    # Middlewares customizados (Fase 3)
  │   ├── models/        # Modelos de dados (Fase 2)
  │   ├── routes/        # Rotas da API (Fase 3)
  │   ├── services/      # Lógica de negócio (Fase 3)
  │   ├── utils/         # Utilitários (Fase 3)
  │   └── database.js    # ✅ Configuração do banco
  ├── migrations/        # Migrações Knex (Fase 2)
  ├── seeds/            # Dados iniciais (Fase 2)
  ├── database/         # ✅ Pasta para SQLite
  ├── knexfile.js       # ✅ Configuração Knex
  ├── server.js         # ✅ Servidor principal
  ├── package.json      # ✅ Dependências e scripts
  └── .env              # ✅ Variáveis de ambiente
  ```

- **✅ Scripts npm funcionais**
  - `npm run dev` - Desenvolvimento com nodemon
  - `npm start` - Produção
  - `npm run migrate` - Executar migrações
  - `npm run seed` - Executar seeds
  - `npm run db:reset` - Reset completo do banco

## 🔧 Como usar

### Instalação
```bash
cd backend
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Testar API
```bash
# Health Check
curl http://localhost:3001/api/health

# Informações da API
curl http://localhost:3001/api
```

## 🌐 Endpoints Disponíveis

- **GET /api** - Informações da API
- **GET /api/health** - Health check

### Resposta Health Check
```json
{
  "status": "OK",
  "timestamp": "2025-01-14T20:00:43.412Z",
  "uptime": 12.1393967,
  "environment": "development",
  "version": "1.0.0",
  "database": "SQLite3",
  "message": "Moria Backend está funcionando!"
}
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)
```bash
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
DATABASE_URL=./database/moria.sqlite
JWT_SECRET=sua-chave-secreta
CORS_ORIGIN=http://localhost:8080,http://localhost:3000
```

## ✅ Fase 2 - 100% CONCLUÍDA

### ✅ Entregáveis Implementados

- **✅ 10 migrações executadas com sucesso**
  - users - Sistema completo de usuários
  - addresses - Endereços dos usuários
  - products - Catálogo de produtos
  - services - Serviços oferecidos
  - orders + order_items - Sistema de pedidos
  - promotions - Campanhas promocionais
  - coupons - Sistema de cupons
  - favorites - Lista de favoritos
  - settings - Configurações da aplicação

- **✅ Seeds com dados iniciais**
  - Usuário admin padrão (admin@moria.com.br / admin123456)
  - Usuário cliente teste (cliente@teste.com / 123456)
  - 5 produtos de exemplo com dados realistas
  - 4 serviços base da oficina
  - 9 configurações essenciais da aplicação

- **✅ Models base implementados**
  - BaseModel com CRUD genérico + paginação
  - User com autenticação bcrypt e métodos específicos
  - Product com controle de estoque e estatísticas
  - Service com sistema de agendamentos
  - Order com criação transacional de pedidos

- **✅ Validações Joi completas**
  - Validações para todas as entidades
  - Middleware de validação automático
  - Schemas para filtros e queries
  - Mensagens de erro personalizadas

### 🗄️ Estrutura do Banco Testada

**Dados Inseridos pelos Seeds:**
- ✅ 2 usuários (1 admin + 1 cliente)
- ✅ 5 produtos com categorias variadas
- ✅ 4 serviços da oficina
- ✅ 9 configurações da aplicação
- ✅ Estrutura pronta para pedidos e favoritos

**Models Funcionais:**
- ✅ Todos os CRUDs básicos funcionando
- ✅ Métodos especializados por entidade
- ✅ Relacionamentos entre tabelas
- ✅ Transações para operações complexas

## 🎯 Próximos Passos

### Fase 3 - API Endpoints (Próximo)
- [ ] Sistema de autenticação JWT
- [ ] Rotas CRUD para produtos e serviços
- [ ] Sistema completo de pedidos
- [ ] Promoções e cupons funcionais
- [ ] Middleware de autorização

### Fase 4 - Integração (Final)
- [ ] Conectar frontend ao backend real
- [ ] Remover dados mockados do React
- [ ] Deploy completo funcional
- [ ] Documentação da API

---

**Status**: ✅ Fases 1 e 2 - 100% CONCLUÍDAS
**Próximo**: Implementar Fase 3 - API REST Endpoints