# Plano de Implementação do Backend - 3 Fases

Este documento detalha o plano em 3 fases para implementar o backend da aplicação Moria Peças e Serviços, reorganizar a estrutura de pastas e seguir as melhores práticas de organização.

## Fase 1: Estruturação Inicial e Configuração do Backend

### Objetivo
Criar a estrutura base do backend com Node.js, Express e Prisma, configurar o Docker e preparar o ambiente de desenvolvimento.

### Tarefas

1. **Criar estrutura de pastas do backend**
   ```
   backend/
   ├── src/
   │   ├── controllers/
   │   ├── models/ (ou services/)
   │   ├── routes/
   │   ├── middleware/
   │   ├── config/
   │   ├── utils/
   │   └── index.ts
   ├── prisma/
   │   ├── schema.prisma
   │   └── migrations/
   ├── tests/
   ├── Dockerfile
   ├── docker-compose.yml
   ├── .env
   ├── .env.example
   ├── .gitignore
   ├── package.json
   └── tsconfig.json
   ```

2. **Configurar package.json do backend**
   - Dependências: express, prisma, @prisma/client, sqlite, dotenv, cors, helmet, bcrypt, jsonwebtoken
   - Dependências de desenvolvimento: typescript, ts-node, nodemon, @types/node, @types/express
   - Scripts: dev, build, start, test

3. **Configurar TypeScript**
   - Criar tsconfig.json
   - Configurar aliases de importação

4. **Configurar Prisma**
   - Inicializar Prisma: `npx prisma init`
   - Configurar schema.prisma com o provedor SQLite
   - Definir modelos base (Customer, Address, Order, Product, Service, Promotion)

5. **Configurar Docker**
   - Criar Dockerfile para o backend
   - Criar docker-compose.yml para orquestrar frontend e backend
   - Configurar volumes para persistência de dados SQLite

6. **Configurar variáveis de ambiente**
   - Criar .env com configurações de banco de dados, porta, chaves JWT
   - Criar .env.example como template

7. **Configurar servidor Express básico**
   - Criar server.ts com configurações básicas
   - Implementar middlewares essenciais (cors, helmet, body-parser)
   - Configurar rotas básicas de health check

### Critérios de Conclusão
- Backend em execução com Docker
- Prisma configurado e conectado ao SQLite
- Estrutura de pastas criada
- Servidor Express respondendo em localhost:3001

## Fase 2: Implementação dos Modelos de Dados e API

### Objetivo
Implementar todos os modelos de dados identificados na auditoria, criar os endpoints da API e integrar autenticação.

### Tarefas

1. **Definir modelos Prisma completos**
   - Customer (com relacionamentos)
   - Address (relacionado a Customer)
   - Product
   - Service
   - Promotion
   - Order (com OrderItem)
   - Favorite (relacionamento many-to-many entre Customer e Product)

2. **Gerar migrations do Prisma**
   - `npx prisma migrate dev --name init`
   - Verificar criação das tabelas no banco SQLite

3. **Implementar controllers e rotas para cada modelo**
   - Autenticação (/auth)
   - Clientes (/customers)
   - Endereços (/addresses)
   - Produtos (/products)
   - Serviços (/services)
   - Promoções (/promotions)
   - Pedidos (/orders)
   - Favoritos (/favorites)

4. **Implementar autenticação e autorização**
   - Registro de usuários
   - Login com JWT
   - Middleware de autenticação
   - Controle de permissões (cliente vs administrador)

5. **Implementar validação de dados**
   - Usar bibliotecas como Joi ou Zod
   - Validar todas as entradas da API

6. **Implementar tratamento de erros**
   - Middleware global de tratamento de erros
   - Formato padronizado de respostas de erro

7. **Implementar logging**
   - Configurar winston ou pino para logging
   - Logs de requisições e erros

### Critérios de Conclusão
- Todos os modelos Prisma implementados e migrados
- Endpoints da API funcionando para todas as entidades
- Autenticação e autorização implementadas
- Validação de dados em todos os endpoints
- Tratamento de erros padronizado

## Fase 3: Integração, Testes e Deploy

### Objetivo
Integrar o frontend com o backend, implementar testes, configurar o Nginx como proxy reverso e preparar para deploy.

### Tarefas

1. **Atualizar configuração do Nginx**
   - Configurar proxy reverso para rotear /api/* para o backend
   - Manter o frontend servido pelo Nginx
   - Configurar cabeçalhos de segurança apropriados

2. **Atualizar variáveis de ambiente do frontend**
   - Ajustar VITE_API_BASE_URL para apontar para o backend através do Nginx
   - Testar integração frontend-backend

3. **Implementar testes**
   - Testes unitários para controllers e services do backend
   - Testes de integração para endpoints da API
   - Testes E2E para fluxos críticos

4. **Implementar documentação da API**
   - Configurar Swagger/OpenAPI
   - Documentar todos os endpoints
   - Exemplos de requisições e respostas

5. **Configurar CI/CD**
   - Configurar GitHub Actions para testes automatizados
   - Configurar deploy automático (se aplicável)

6. **Otimizações de performance**
   - Implementar cache com Redis (opcional)
   - Configurar compressão de resposta
   - Otimizar queries do Prisma

7. **Preparar para produção**
   - Configurar ambiente de produção
   - Configurar SSL/HTTPS
   - Configurar backup do banco de dados
   - Configurar monitoramento

### Critérios de Conclusão
- Frontend e backend integrados e funcionando
- Nginx configurado como proxy reverso
- Testes implementados e passando
- Documentação da API disponível
- Aplicação pronta para deploy em produção

## Estrutura Final do Projeto

Após a conclusão das 3 fases, a estrutura do projeto será:

```
moria-6df9f9ce/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/ (ou models/)
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── utils/
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/ (conteúdo atual da pasta src movido para cá)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── ...
│   ├── Dockerfile
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── ...
├── nginx/
│   └── nginx.conf
├── docker-compose.yml (orquestração de todos os serviços)
├── .gitignore
└── README.md
```

## Considerações Finais

Este plano em 3 fases permite uma implementação incremental e organizada do backend, mantendo a qualidade do código e seguindo as melhores práticas de desenvolvimento. Cada fase tem objetivos claros e critérios de conclusão bem definidos, facilitando o acompanhamento do progresso.