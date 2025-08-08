# 📋 CONVENÇÃO DE NOMENCLATURA - MORIA PEÇAS & SERVIÇOS

## 🎯 Visão Geral

Esta convenção estabelece regras unificadas de nomenclatura para garantir consistência entre:
- **Schema do Banco (Prisma)** 
- **APIs do Backend**
- **Services do Frontend**
- **Componentes e Hooks React**

## 🏗️ REGRAS GERAIS

### Entidades (Substantivos)
- **Conceito:** Usar singular em inglês
- **Schema DB:** `PascalCase` → `Product`, `Service`, `Order`
- **Backend/Frontend:** `camelCase` → `product`, `service`, `order`

### APIs (Rotas REST)
- **Padrão:** `/api/[entidade-plural-minuscula]`
- **Exemplos:** `/api/products`, `/api/services`, `/api/orders`

### Campos/Propriedades
- **Todas as camadas:** `camelCase` → `userId`, `createdAt`, `isActive`
- **Consistência total** entre schema, API e frontend

### Métodos de Service
- **Padrão:** `[ação][Entity]` → `getProducts()`, `createProduct()`
- **CRUD:** `get`, `create`, `update`, `delete`

### Hooks React
- **Admin:** `useAdmin[Entity]` → `useAdminProducts`
- **Customer:** `use[Entity]` → `useProducts`

## 📊 ENTIDADES PADRONIZADAS

| Entidade | Schema DB | API Route | Service Method | Hook Admin |
|----------|-----------|-----------|---------------|------------|
| **Produto** | `Product` | `/api/products` | `getProducts()` | `useAdminProducts` |
| **Serviço** | `Service` | `/api/services` | `getServices()` | `useAdminServices` |
| **Pedido** | `Order` | `/api/orders` | `getOrders()` | `useAdminOrders` |
| **Cupom** | `Coupon` | `/api/coupons` | `getCoupons()` | `useAdminCoupons` |
| **Promoção** | `Promotion` | `/api/promotions` | `getPromotions()` | `useAdminPromotions` |

## 🔧 ESTRUTURA PADRONIZADA

### Schema Prisma
```prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String   @map("name")
  category    String   @map("category") 
  price       Float    @map("price")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("products")
}
```

### API Routes (Backend)
```javascript
// GET /api/products - Listar produtos
router.get('/products', async (req, res) => {
  // Implementation
});

// GET /api/products/:id - Buscar produto específico  
router.get('/products/:id', async (req, res) => {
  // Implementation
});

// POST /api/products - Criar produto
router.post('/products', async (req, res) => {
  // Implementation
});
```

### Service (Frontend)
```javascript
class ApiService {
  async getProducts(filters = {}) {
    return this.request('/products', { method: 'GET' });
  }
  
  async getProduct(id) {
    return this.request(`/products/${id}`);
  }
  
  async createProduct(productData) {
    return this.request('/products', { 
      method: 'POST', 
      body: productData 
    });
  }
}
```

### Hook React
```javascript
export const useAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchProducts = useCallback(async () => {
    const response = await api.getProducts();
    setProducts(response.data);
  }, []);
  
  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};
```

## 🔄 TRANSFORMAÇÃO DE DADOS

### Utilitários Padronizados
Usar `src/utils/dataTransform.js`:

```javascript
import { 
  transformProductFromDb, 
  transformProductToDb,
  formatters 
} from '@/utils/dataTransform';

// Backend → Frontend
const frontendProduct = transformProductFromDb(dbProduct);

// Frontend → Backend  
const dbProduct = transformProductToDb(frontendProduct);

// Formatação
const price = formatters.price(100.50); // "R$ 100,50"
```

## 📝 CAMPOS PADRONIZADOS

### Campos Comuns (Todas Entidades)
- `id` - Identificador único
- `name` ou `title` - Nome/título
- `description` - Descrição
- `isActive` - Status ativo/inativo
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Produtos
- `category` - Categoria
- `price` - Preço base
- `salePrice` - Preço promocional
- `stock` - Estoque atual
- `minStock` - Estoque mínimo
- `sku` - Código do produto
- `brand` - Marca
- `supplier` - Fornecedor

### Promoções/Cupons
- `discountType` - Tipo de desconto ('percentage' | 'fixed_amount')
- `discountValue` - Valor do desconto
- `minAmount` - Valor mínimo do pedido

## ✅ VALIDAÇÃO DE CONSISTÊNCIA

### Checklist de Implementação
- [ ] Schema do banco com campos padronizados
- [ ] APIs seguindo convenção REST
- [ ] Services usando métodos consistentes
- [ ] Hooks com nomenclatura padrão
- [ ] Transformações de dados uniformes
- [ ] Formatação consistente de dados
- [ ] Validação de entrada padronizada

### Como Adicionar Nova Entidade

1. **Definir Schema Prisma**
   ```prisma
   model NewEntity {
     id        Int      @id @default(autoincrement())
     name      String   @map("name")
     isActive  Boolean  @default(true) @map("is_active")
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")
     
     @@map("new_entities")
   }
   ```

2. **Criar API Routes**
   ```javascript
   // /api/new-entities
   router.get('/new-entities', handler);
   router.post('/new-entities', handler);
   // etc...
   ```

3. **Adicionar Service Methods**
   ```javascript
   async getNewEntities() { /* */ }
   async createNewEntity() { /* */ }
   ```

4. **Criar Hook**
   ```javascript
   export const useAdminNewEntities = () => { /* */ }
   ```

## 🚨 ANTI-PADRÕES (NÃO FAZER)

### ❌ Nomenclatura Inconsistente
```javascript
// Backend usa 'title', Frontend usa 'name'
// Schema tem 'startDate', Hook usa 'startsAt'  
// APIs com /api/documento, /api/users (misturado)
```

### ❌ Transformação Manual
```javascript
// Repetir transformação em vários lugares
const product = {
  name: dbProduct.name,
  price: dbProduct.price,
  // ... repetido em todo lugar
};
```

### ❌ Campos Inconsistentes
```javascript
// Schema: isActive, Frontend: active
// Schema: createdAt, API: created_at
// Hook: notify, Hook2: stableNotify
```

## 🎯 BENEFÍCIOS DA CONVENÇÃO

1. **✅ Consistência Total** - Mesmos nomes em todas as camadas
2. **🚀 Desenvolvimento Rápido** - Padrões conhecidos
3. **🐛 Menos Bugs** - Sem confusão entre propriedades
4. **📖 Código Legível** - Nomenclatura intuitiva
5. **🔧 Fácil Manutenção** - Regras claras para mudanças

---

**Importante:** Esta convenção deve ser seguida rigorosamente em todas as novas implementações e correções. Qualquer desvio deve ser documentado e discutido com a equipe.