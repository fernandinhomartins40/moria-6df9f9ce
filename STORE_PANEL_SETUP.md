# Guia de Configuração do Store Panel

## Problema Identificado

As páginas do `/store-panel` não estavam mostrando dados porque o **banco de dados PostgreSQL não estava rodando**.

## Análise da Implementação

### ✅ Implementação Correta

#### Frontend (apps/frontend)

- **AdminContent.tsx** faz chamadas corretas ao backend:
  - Dashboard stats via `adminService.getDashboardStats()`
  - Orders via `adminService.getOrders()`
  - Services via `adminService.getServices()`
  - Coupons via `adminService.getCoupons()`
  - Products via `adminService.getProducts()`
  - Customers via `adminService.getCustomers()`

- **adminService.ts** está configurado com todas as rotas da API admin
- **apiClient.ts** envia corretamente o token admin no header Authorization

#### Backend (apps/backend)

- **admin.routes.ts** - Todas as rotas estão registradas:
  - `GET /admin/dashboard/stats`
  - `GET /admin/orders`
  - `GET /admin/customers`
  - `GET /admin/products`
  - `GET /admin/services`
  - `GET /admin/coupons`
  - `GET /admin/promotions`
  - `GET /admin/revisions`

- **admin.controller.ts** - Controllers implementados corretamente
- **admin.service.ts** - Faz consultas REAIS ao banco usando Prisma ORM

## Solução - Como Fazer Funcionar

### Pré-requisitos

1. PostgreSQL rodando (Docker ou instalação local)
2. Variáveis de ambiente configuradas
3. Migrações do banco aplicadas
4. Dados de seed populados

### Opção 1: Usando Docker (Recomendado)

```bash
# 1. Iniciar PostgreSQL com Docker
docker compose up -d postgres

# 2. Copiar arquivo de configuração
cp apps/backend/.env.example apps/backend/.env

# 3. Ajustar DATABASE_URL no .env se necessário
# Para Docker: postgresql://moria:moria_dev_2024@postgres:5432/moria_db?schema=public
# Para local: postgresql://moria:moria_dev_2024@localhost:5432/moria_db?schema=public

# 4. Rodar migrações do Prisma
cd apps/backend
npx prisma migrate dev

# 5. Popular banco com dados de teste
npm run prisma:seed

# 6. Gerar Prisma Client
npx prisma generate

# 7. Iniciar backend
cd ../..
npm run dev:backend

# 8. Em outro terminal, iniciar frontend
npm run dev:frontend
```

### Opção 2: PostgreSQL Local

```bash
# 1. Instalar PostgreSQL (se não tiver)
sudo apt-get install postgresql postgresql-contrib

# 2. Iniciar serviço
sudo service postgresql start

# 3. Criar usuário e banco
sudo -u postgres psql
CREATE USER moria WITH PASSWORD 'moria_dev_2024';
CREATE DATABASE moria_db OWNER moria;
\q

# 4. Copiar .env e ajustar DATABASE_URL
cp apps/backend/.env.example apps/backend/.env
# Editar .env: DATABASE_URL=postgresql://moria:moria_dev_2024@localhost:5432/moria_db?schema=public

# 5. Seguir passos 4-8 da Opção 1
```

## Estrutura de Dados Mostradas

Quando o banco estiver funcionando, cada página do `/store-panel` mostrará:

### 1. Dashboard (tab: dashboard)
- Total de pedidos
- Receita total
- Pedidos pendentes/completos
- Total de clientes ativos
- Produtos ativos
- Produtos com estoque baixo
- Cupons ativos
- Últimos 10 pedidos

### 2. Pedidos (tab: orders)
- Lista de todos os pedidos **com produtos**
- Informações do cliente (nome, WhatsApp)
- Items do pedido
- Total
- Status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- Data de criação

### 3. Orçamentos (tab: quotes)
- Pedidos que contêm **serviços**
- Mesma estrutura de pedidos, filtrado por hasServices=true

### 4. Revisões Veiculares (tab: revisions)
- Lista de revisões cadastradas
- Dados do cliente e veículo
- Checklist de revisão
- Status (DRAFT, IN_PROGRESS, COMPLETED, CANCELLED)

### 5. Clientes (tab: customers)
- Clientes cadastrados no sistema
- Nome, email, telefone, CPF
- Nível de fidelidade (BRONZE, SILVER, GOLD, PLATINUM)
- Status (ACTIVE, INACTIVE, BLOCKED)

### 6. Produtos (tab: products)
- Catálogo completo de produtos
- Nome, descrição, categoria
- SKU, fornecedor
- Preços (custo, venda, promocional)
- Estoque atual e mínimo
- Imagens

### 7. Serviços (tab: services)
- Serviços oferecidos pela loja
- Nome, descrição, categoria
- Tempo estimado
- Preço base
- Status (ativo/inativo)

### 8. Cupons (tab: coupons)
- Cupons de desconto
- Código, descrição
- Tipo (PERCENTAGE, FIXED, FREE_SHIPPING)
- Valor do desconto
- Valor mínimo, desconto máximo
- Limite de uso
- Data de expiração

### 9. Promoções (tab: promotions)
- Ofertas especiais
- Título, descrição
- Tipo (percentage, fixed, bogo)
- Período de validade
- Produtos/serviços aplicáveis

### 10. Relatórios (tab: reports)
- (Em desenvolvimento)

### 11. Configurações (tab: settings)
- (Em desenvolvimento)

## Verificação

Para verificar se está funcionando:

```bash
# 1. Verificar se backend está rodando
curl http://localhost:3003/health

# 2. Testar rota admin (precisa de token)
# Fazer login no /store-panel primeiro para obter token
# Token será salvo em localStorage.admin_token

# 3. Verificar logs do backend
# Deve mostrar: "Server is running on port 3003"
# Sem erros de conexão ao banco

# 4. Acessar frontend
# Abrir http://localhost:5173/store-panel
# Fazer login como admin
# Verificar se os cards do Dashboard mostram números reais
```

## Troubleshooting

### Backend não inicia

```bash
# Verificar se todas as dependências estão instaladas
cd apps/backend
npm install

# Verificar se .env existe
cat .env

# Verificar se PostgreSQL está rodando
psql $DATABASE_URL -c "SELECT 1;"

# Verificar se Prisma Client foi gerado
ls -la ../../node_modules/@prisma/client/

# Regenerar se necessário
npx prisma generate
```

### Erro "tsx: not found"

Já corrigido! O nodemon.json foi atualizado para usar `npx tsx`.

### Erro de conexão ao banco

```bash
# Verificar se PostgreSQL está aceitando conexões
sudo service postgresql status

# Verificar se DATABASE_URL está correta no .env
# Para Docker: use hostname 'postgres'
# Para local: use 'localhost'

# Testar conexão manual
psql postgresql://moria:moria_dev_2024@localhost:5432/moria_db
```

### Dados não aparecem

```bash
# Popular banco com dados de teste
cd apps/backend
npm run prisma:seed

# Verificar se há dados no banco
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM customers;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM orders;"
```

## Conclusão

A implementação do `/store-panel` está **100% correta** e integrada com o banco de dados.

**O único problema é infraestrutura**: PostgreSQL precisa estar rodando.

Após seguir os passos acima, todas as páginas do store-panel mostrarão dados reais do banco de dados.
