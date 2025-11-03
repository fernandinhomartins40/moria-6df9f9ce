# Comandos para Executar a Fase 2

## 🚀 Início Rápido

Siga estes comandos em ordem para ter a Fase 2 rodando:

### 1. Preparar o Backend

```bash
# Navegar até o diretório do backend
cd apps/backend

# Instalar dependências (se ainda não instalou)
npm install

# Gerar Prisma Client com os novos models
npx prisma generate
```

### 2. Criar Migration no Banco de Dados

```bash
# Criar migration para adicionar as novas tabelas da Fase 2
npx prisma migrate dev --name add_phase_2_models

# Ou se preferir reset completo do banco (APAGA TODOS OS DADOS!)
npx prisma migrate reset
```

### 3. Popular o Banco com Dados de Exemplo

```bash
# Executar o seed script
npx prisma db seed

# OU executar diretamente
npx tsx prisma/seed.ts
```

### 4. Iniciar o Servidor

```bash
# Voltar para o diretório raiz
cd ../..

# Opção 1: Rodar backend localmente (sem Docker)
cd apps/backend
npm run dev

# Opção 2: Rodar tudo com Docker
cd docker
docker-compose up -d
```

---

## 🧪 Testando os Endpoints

### Criar um Cliente de Teste

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "Teste123!",
    "name": "Cliente Teste",
    "phone": "11999999999"
  }'
```

### Fazer Login e Obter Token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@email.com",
    "password": "Test123!"
  }'
```

Copie o `token` da resposta para usar nos próximos comandos.

---

## 📦 Testando Products API

### Listar Todos os Produtos

```bash
curl http://localhost:3001/products
```

### Listar Produtos com Filtros

```bash
# Filtrar por categoria
curl "http://localhost:3001/products?category=Filtros"

# Filtrar por status
curl "http://localhost:3001/products?status=ACTIVE"

# Busca por nome ou descrição
curl "http://localhost:3001/products?search=óleo"

# Com paginação
curl "http://localhost:3001/products?page=1&limit=10"

# Filtro de preço
curl "http://localhost:3001/products?minPrice=20&maxPrice=100"

# Produtos em estoque
curl "http://localhost:3001/products?inStock=true"

# Ordenação
curl "http://localhost:3001/products?sortBy=salePrice&sortOrder=asc"
```

### Buscar Produto por ID

```bash
curl http://localhost:3001/products/<id-do-produto>
```

### Buscar Produto por Slug

```bash
curl http://localhost:3001/products/slug/filtro-oleo-mann-w610-3
```

### Buscar Produto por SKU

```bash
curl http://localhost:3001/products/sku/FLT-OIL-001
```

### Listar Categorias de Produtos

```bash
curl http://localhost:3001/products/categories/list
```

### Criar Produto (Requer Autenticação)

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU-TOKEN-AQUI>" \
  -d '{
    "name": "Filtro de Combustível Bosch",
    "description": "Filtro de combustível de alta eficiência",
    "category": "Filtros",
    "subcategory": "Filtro de Combustível",
    "sku": "FLT-FUEL-006",
    "supplier": "Bosch",
    "costPrice": 25.00,
    "salePrice": 49.90,
    "stock": 30,
    "minStock": 10,
    "images": ["https://example.com/fuel-filter.jpg"],
    "specifications": {
      "type": "Inline",
      "microns": "10",
      "flowRate": "150 L/h"
    }
  }'
```

### Atualizar Estoque

```bash
curl -X PATCH http://localhost:3001/products/<id-do-produto>/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU-TOKEN-AQUI>" \
  -d '{
    "quantity": -5
  }'
```

---

## 🔧 Testando Services API

### Listar Todos os Serviços

```bash
curl http://localhost:3001/services
```

### Listar Serviços por Categoria

```bash
curl "http://localhost:3001/services?category=Manutenção Preventiva"
```

### Buscar Serviço por Slug

```bash
curl http://localhost:3001/services/slug/troca-oleo-filtro
```

### Listar Categorias de Serviços

```bash
curl http://localhost:3001/services/categories/list
```

### Criar Serviço (Requer Autenticação)

```bash
curl -X POST http://localhost:3001/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU-TOKEN-AQUI>" \
  -d '{
    "name": "Diagnóstico Eletrônico",
    "description": "Diagnóstico completo dos sistemas eletrônicos do veículo",
    "category": "Eletrônica",
    "estimatedTime": "45 minutos",
    "basePrice": 89.90,
    "specifications": {
      "equipment": "Scanner automotivo profissional",
      "includes": ["Leitura de códigos", "Análise de sensores", "Relatório detalhado"]
    }
  }'
```

---

## 🚗 Testando Vehicles API

### Listar Hierarquia Completa de Veículos

```bash
curl http://localhost:3001/vehicles/hierarchy
```

### Buscar Veículos

```bash
curl "http://localhost:3001/vehicles/search?q=gol"
```

### Listar Marcas

```bash
curl http://localhost:3001/vehicles/makes
```

### Listar Modelos de uma Marca

```bash
curl "http://localhost:3001/vehicles/models?makeId=<id-da-marca>"
```

### Listar Variantes de um Modelo

```bash
curl "http://localhost:3001/vehicles/variants?modelId=<id-do-modelo>"
```

### Criar Marca (Requer Autenticação)

```bash
curl -X POST http://localhost:3001/vehicles/makes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU-TOKEN-AQUI>" \
  -d '{
    "name": "Honda",
    "country": "Japan",
    "logo": "https://example.com/honda-logo.png"
  }'
```

### Criar Modelo (Requer Autenticação)

```bash
curl -X POST http://localhost:3001/vehicles/models \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU-TOKEN-AQUI>" \
  -d '{
    "makeId": "<id-da-marca>",
    "name": "Civic",
    "segment": "sedan",
    "bodyType": "4-door",
    "fuelTypes": ["Gasoline", "Hybrid"]
  }'
```

### Criar Variante (Requer Autenticação)

```bash
curl -X POST http://localhost:3001/vehicles/variants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU-TOKEN-AQUI>" \
  -d '{
    "modelId": "<id-do-modelo>",
    "name": "Civic 2.0 Sport",
    "engineInfo": {
      "displacement": "2.0L",
      "cylinders": 4,
      "horsepower": 158,
      "torque": "19.4 kgfm"
    },
    "transmission": "CVT",
    "yearStart": 2021,
    "specifications": {
      "fuelTank": "47L",
      "weight": "1350kg",
      "topSpeed": "210 km/h"
    }
  }'
```

---

## 🔗 Testando Compatibility API

### Buscar Produtos Compatíveis com um Veículo

```bash
# Por marca
curl "http://localhost:3001/compatibility/products/search?makeId=<id-da-marca>"

# Por modelo
curl "http://localhost:3001/compatibility/products/search?makeId=<id-da-marca>&modelId=<id-do-modelo>"

# Por variante e ano
curl "http://localhost:3001/compatibility/products/search?makeId=<id-da-marca>&modelId=<id-do-modelo>&variantId=<id-da-variante>&year=2020"
```

### Buscar Veículos Compatíveis com um Produto

```bash
curl http://localhost:3001/compatibility/vehicles/<id-do-produto>
```

### Listar Todas Compatibilidades

```bash
curl http://localhost:3001/compatibility
```

### Criar Compatibilidade (Requer Autenticação)

```bash
curl -X POST http://localhost:3001/compatibility \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU-TOKEN-AQUI>" \
  -d '{
    "productId": "<id-do-produto>",
    "makeId": "<id-da-marca>",
    "modelId": "<id-do-modelo>",
    "yearStart": 2018,
    "yearEnd": 2023,
    "compatibilityData": {
      "fitment": "Direct fit",
      "position": "Front axle",
      "notes": "Compatible with all variants"
    },
    "verified": true,
    "notes": "Verified by manufacturer"
  }'
```

### Verificar Compatibilidade (Requer Autenticação)

```bash
curl -X PATCH http://localhost:3001/compatibility/<id-da-compatibilidade>/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU-TOKEN-AQUI>" \
  -d '{
    "verified": true
  }'
```

---

## 🗄️ Comandos Úteis do Prisma

### Ver Banco de Dados no Prisma Studio

```bash
cd apps/backend
npx prisma studio
```

Abre interface visual em http://localhost:5555

### Resetar Banco de Dados Completamente

```bash
npx prisma migrate reset
# Isso vai apagar tudo e rodar o seed automaticamente
```

### Criar Nova Migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Aplicar Migrations em Produção

```bash
npx prisma migrate deploy
```

### Ver Status das Migrations

```bash
npx prisma migrate status
```

---

## 🐳 Comandos Docker

### Iniciar Todos os Serviços

```bash
cd docker
docker-compose up -d
```

### Ver Logs

```bash
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas banco
docker-compose logs -f postgres
```

### Parar Serviços

```bash
docker-compose down
```

### Parar e Remover Volumes (APAGA DADOS!)

```bash
docker-compose down -v
```

### Rebuild dos Containers

```bash
docker-compose up -d --build
```

### Acessar Shell do Container do Backend

```bash
docker exec -it moria-backend sh
```

### Rodar Comandos Prisma dentro do Container

```bash
docker exec -it moria-backend npx prisma migrate dev
docker exec -it moria-backend npx prisma db seed
```

---

## 🔍 Health Check

### Verificar se o Servidor está Rodando

```bash
curl http://localhost:3001/health
```

Deve retornar:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📊 Testando Fluxo Completo

### 1. Registrar Cliente
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@teste.com","password":"Teste123!","name":"Cliente Teste","phone":"11999999999"}'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@teste.com","password":"Teste123!"}'
```

### 3. Buscar Produtos
```bash
curl http://localhost:3001/products
```

### 4. Buscar Veículos
```bash
curl http://localhost:3001/vehicles/hierarchy
```

### 5. Verificar Compatibilidade
```bash
curl "http://localhost:3001/compatibility/products/search?makeId=<id>&year=2020"
```

---

## ⚠️ Troubleshooting

### Erro: "Prisma Client did not initialize"
```bash
cd apps/backend
npx prisma generate
```

### Erro: "Database connection failed"
Verifique se o PostgreSQL está rodando:
```bash
docker-compose ps
# Ou se local:
# systemctl status postgresql (Linux)
# brew services list (Mac)
```

### Erro: "Port 3001 already in use"
```bash
# Encontrar processo usando a porta
# Windows:
netstat -ano | findstr :3001
# Linux/Mac:
lsof -i :3001

# Matar processo
# Windows:
taskkill /PID <PID> /F
# Linux/Mac:
kill -9 <PID>
```

### Logs não aparecem
```bash
# Verificar logs do backend
cd apps/backend
cat logs/combined.log
cat logs/error.log
```

---

## 🎉 Pronto!

Agora você tem a Fase 2 completa rodando com:
- ✅ 4 módulos implementados (Products, Services, Vehicles, Compatibility)
- ✅ Dados de exemplo no banco
- ✅ Todos endpoints funcionando
- ✅ Autenticação JWT
- ✅ Validações robustas
- ✅ Documentação completa

**Aproveite a API! 🚀**
