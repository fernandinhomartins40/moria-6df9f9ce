# Backend Moria - Fase 4: Revisões Veiculares

## 📋 Visão Geral

A Fase 4 implementa um sistema completo de revisões veiculares com checklists customizáveis, gestão de veículos dos clientes e histórico de manutenções.

## 🚀 Funcionalidades Implementadas

### 1. Customer Vehicles (Veículos dos Clientes)

Módulo para gerenciar os veículos cadastrados pelos clientes para realizar revisões.

#### Endpoints

- `GET /customer-vehicles` - Listar todos os veículos do cliente autenticado
- `GET /customer-vehicles/:id` - Obter detalhes de um veículo específico
- `GET /customer-vehicles/:id/revisions` - Obter veículo com histórico de revisões
- `POST /customer-vehicles` - Cadastrar novo veículo
- `PUT /customer-vehicles/:id` - Atualizar dados do veículo
- `PATCH /customer-vehicles/:id/mileage` - Atualizar quilometragem
- `DELETE /customer-vehicles/:id` - Remover veículo

#### Exemplo de Cadastro de Veículo

```json
POST /customer-vehicles
{
  "brand": "Volkswagen",
  "model": "Gol",
  "year": 2020,
  "plate": "ABC1234",
  "chassisNumber": "9BWZZZ377VT004251",
  "color": "Branco",
  "mileage": 45000
}
```

### 2. Checklist (Sistema de Checklist)

Sistema customizável de categorias e itens de checklist para revisões veiculares.

#### Endpoints - Categorias

- `GET /checklist/categories` - Listar todas as categorias
- `GET /checklist/categories/enabled` - Listar categorias ativas
- `GET /checklist/categories/:id` - Obter categoria por ID
- `POST /checklist/categories` - Criar nova categoria
- `PUT /checklist/categories/:id` - Atualizar categoria
- `DELETE /checklist/categories/:id` - Remover categoria
- `PUT /checklist/categories/reorder` - Reordenar categorias

#### Endpoints - Itens

- `GET /checklist/items` - Listar todos os itens
- `GET /checklist/categories/:categoryId/items` - Listar itens de uma categoria
- `GET /checklist/items/:id` - Obter item por ID
- `POST /checklist/items` - Criar novo item
- `PUT /checklist/items/:id` - Atualizar item
- `DELETE /checklist/items/:id` - Remover item
- `PUT /checklist/items/reorder` - Reordenar itens

#### Endpoint Especial

- `GET /checklist/structure` - Obter estrutura completa do checklist (categorias + itens)

#### Categorias Padrão

O sistema vem com 10 categorias pré-configuradas:

1. 🛑 **Freios** (9 itens)
2. 🔧 **Suspensão** (8 itens)
3. ⚙️ **Motor** (11 itens)
4. 🌡️ **Sistema de Arrefecimento** (7 itens)
5. ⚡ **Sistema Elétrico** (10 itens)
6. 🔄 **Transmissão** (6 itens)
7. 🎯 **Direção** (8 itens)
8. 🛞 **Pneus e Rodas** (7 itens)
9. 🚗 **Carroceria e Interior** (10 itens)
10. 💨 **Sistema de Escapamento** (7 itens)

**Total: 83 itens de verificação**

### 3. Revisions (Revisões)

Sistema completo para gerenciar revisões veiculares com checklist, fotos e recomendações.

#### Endpoints

- `GET /revisions` - Listar revisões com filtros e paginação
- `GET /revisions/:id` - Obter detalhes de uma revisão
- `POST /revisions` - Criar nova revisão
- `PUT /revisions/:id` - Atualizar revisão
- `DELETE /revisions/:id` - Remover revisão (apenas drafts e in_progress)

#### Endpoints de Status

- `PATCH /revisions/:id/start` - Iniciar revisão (DRAFT → IN_PROGRESS)
- `PATCH /revisions/:id/complete` - Completar revisão (→ COMPLETED)
- `PATCH /revisions/:id/cancel` - Cancelar revisão (→ CANCELLED)

#### Endpoints de Estatísticas

- `GET /revisions/statistics` - Estatísticas de revisões do cliente
- `GET /revisions/vehicle/:vehicleId/history` - Histórico de revisões de um veículo

#### Filtros Disponíveis

```
GET /revisions?vehicleId=uuid&status=COMPLETED&dateFrom=2024-01-01&dateTo=2024-12-31&page=1&limit=20
```

#### Exemplo de Criação de Revisão

```json
POST /revisions
{
  "vehicleId": "uuid-do-veiculo",
  "date": "2024-01-15T10:00:00Z",
  "mileage": 50000,
  "checklistItems": [
    {
      "categoryId": "uuid-categoria-freios",
      "categoryName": "Freios",
      "itemId": "uuid-item-pastilhas",
      "itemName": "Pastilhas de freio dianteiras",
      "status": "OK",
      "notes": "Pastilhas em bom estado, 60% de vida útil",
      "photos": ["https://example.com/photo1.jpg"]
    },
    {
      "categoryId": "uuid-categoria-freios",
      "categoryName": "Freios",
      "itemId": "uuid-item-discos",
      "itemName": "Discos de freio dianteiros",
      "status": "ATTENTION",
      "notes": "Discos apresentam pequenas marcas, recomenda-se substituição em 10.000 km",
      "photos": []
    }
  ],
  "generalNotes": "Veículo em bom estado geral. Recomenda-se atenção aos discos de freio.",
  "recommendations": "- Substituir discos de freio em até 10.000 km\n- Próxima revisão: 60.000 km"
}
```

#### Status da Revisão

- `DRAFT` - Rascunho (pode ser editada)
- `IN_PROGRESS` - Em andamento (pode ser editada)
- `COMPLETED` - Concluída (não pode ser editada)
- `CANCELLED` - Cancelada (não pode ser editada)

#### Status dos Itens do Checklist

- `NOT_CHECKED` - Não verificado
- `OK` - Em bom estado
- `ATTENTION` - Requer atenção
- `CRITICAL` - Crítico - requer reparo imediato
- `NOT_APPLICABLE` - Não aplicável

## 📊 Modelo de Dados

### CustomerVehicle

```typescript
{
  id: string
  customerId: string
  brand: string
  model: string
  year: number
  plate: string (unique)
  chassisNumber?: string
  color?: string
  mileage?: number
  createdAt: Date
  updatedAt: Date
}
```

### ChecklistCategory

```typescript
{
  id: string
  name: string
  description?: string
  icon?: string
  isDefault: boolean
  isEnabled: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### ChecklistItem

```typescript
{
  id: string
  categoryId: string
  name: string
  description?: string
  isDefault: boolean
  isEnabled: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### Revision

```typescript
{
  id: string
  customerId: string
  vehicleId: string
  date: Date
  mileage?: number
  status: RevisionStatus
  checklistItems: Json // Array de ChecklistItemCheck
  generalNotes?: string
  recommendations?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}
```

### ChecklistItemCheck (JSON Structure)

```typescript
{
  categoryId: string
  categoryName: string
  itemId: string
  itemName: string
  status: ChecklistItemStatus
  notes?: string
  photos?: string[] // Array de URLs
}
```

## 🔐 Autenticação

Todos os endpoints da Fase 4 requerem autenticação JWT:

```
Authorization: Bearer <token>
```

## 🗄️ Seed de Dados

O arquivo `prisma/seed.ts` foi atualizado para incluir:

- 10 categorias de checklist padrão
- 83 itens de checklist distribuídos pelas categorias
- Todos marcados como `isDefault: true` e `isEnabled: true`

Para executar o seed:

```bash
cd apps/backend
npm run prisma:seed
```

## 🧪 Testando a API

### 1. Cadastrar um Veículo

```bash
curl -X POST http://localhost:3001/customer-vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2022,
    "plate": "XYZ5678",
    "color": "Prata",
    "mileage": 25000
  }'
```

### 2. Obter Estrutura do Checklist

```bash
curl http://localhost:3001/checklist/structure \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Criar uma Revisão

```bash
curl -X POST http://localhost:3001/revisions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @revision.json
```

### 4. Listar Revisões

```bash
curl "http://localhost:3001/revisions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Completar uma Revisão

```bash
curl -X PATCH http://localhost:3001/revisions/{id}/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Casos de Uso

### Fluxo Completo de Revisão

1. **Cliente cadastra seu veículo**
   ```
   POST /customer-vehicles
   ```

2. **Oficina obtém estrutura do checklist**
   ```
   GET /checklist/structure
   ```

3. **Oficina cria revisão em draft**
   ```
   POST /revisions (status: DRAFT)
   ```

4. **Oficina inicia revisão**
   ```
   PATCH /revisions/:id/start (DRAFT → IN_PROGRESS)
   ```

5. **Oficina atualiza itens do checklist durante a revisão**
   ```
   PUT /revisions/:id
   ```

6. **Oficina completa revisão**
   ```
   PATCH /revisions/:id/complete (IN_PROGRESS → COMPLETED)
   ```

7. **Cliente visualiza histórico**
   ```
   GET /customer-vehicles/:id/revisions
   GET /revisions/vehicle/:vehicleId/history
   ```

## 📈 Funcionalidades Avançadas

### 1. Atualização Automática de Quilometragem

Quando uma revisão é completada, a quilometragem do veículo é automaticamente atualizada se a revisão possuir o campo `mileage`.

### 2. Validações de Negócio

- Não é possível deletar veículos com revisões existentes
- Não é possível editar revisões completadas ou canceladas
- Não é possível deletar revisões completadas
- Placas de veículos são únicas no sistema
- Nova quilometragem não pode ser menor que a atual

### 3. Proteção de Dados Padrão

- Categorias e itens marcados como `isDefault: true` não podem ser deletados
- Apenas categorias vazias (sem itens) podem ser deletadas
- Itens só podem ser deletados se não forem padrão

### 4. Estatísticas

Endpoint de estatísticas fornece:
- Total de revisões do cliente
- Quantidade por status (DRAFT, IN_PROGRESS, COMPLETED, CANCELLED)
- Quantidade por veículo

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Nenhuma variável adicional é necessária para a Fase 4. Use as mesmas configurações das fases anteriores.

### Migrations

Para aplicar as migrations da Fase 4:

```bash
cd apps/backend
npx prisma migrate dev --name fase-4-revisoes-veiculares
```

### Gerar Prisma Client

```bash
cd apps/backend
npx prisma generate
```

## 📝 Próximos Passos

### Melhorias Futuras

1. **Upload de Fotos**
   - Integração com S3 ou storage service
   - Processamento de imagens (thumbnails, compressão)

2. **Notificações**
   - Email quando revisão é completada
   - Lembretes de manutenção baseados em quilometragem/tempo

3. **Relatórios**
   - Geração de PDF da revisão
   - Exportação de histórico

4. **Agendamento**
   - Sistema de agendamento de revisões
   - Calendário de disponibilidade

5. **Multi-loja**
   - Suporte para múltiplas oficinas
   - Transferência de histórico entre oficinas

## 🐛 Troubleshooting

### Erro ao criar revisão

Certifique-se de que:
- O veículo existe e pertence ao cliente autenticado
- O campo `date` está no formato ISO 8601
- Pelo menos um item do checklist foi fornecido

### Erro ao deletar veículo

Veículos com revisões não podem ser deletados. Delete as revisões primeiro.

### Erro ao deletar categoria/item

Categorias e itens padrão (`isDefault: true`) não podem ser deletados.

## 📚 Documentação Adicional

- [Prisma Schema](./prisma/schema.prisma)
- [Seed Script](./prisma/seed.ts)
- [Plano de Implementação](../../PLANO_IMPLEMENTACAO_BACKEND.md)

## ✅ Checklist de Implementação

- [x] Modelos Prisma (CustomerVehicle, ChecklistCategory, ChecklistItem, Revision)
- [x] Enums (RevisionStatus, ChecklistItemStatus)
- [x] Customer Vehicles Module (DTOs, Service, Controller, Routes)
- [x] Checklist Module (DTOs, Service, Controller, Routes)
- [x] Revisions Module (DTOs, Service, Controller, Routes)
- [x] Seed com dados padrão de checklist (10 categorias, 83 itens)
- [x] Integração com app.ts
- [x] Validações de negócio
- [x] Documentação

---

**Desenvolvido por**: Claude (Anthropic)
**Versão**: 1.0.0
**Data**: 2024
