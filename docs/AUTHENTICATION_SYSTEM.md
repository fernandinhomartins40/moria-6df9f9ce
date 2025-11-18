# Sistema de Autenticação - Moria Backend

## Visão Geral

O backend da Moria possui dois sistemas de autenticação independentes:
1. **Autenticação de Clientes**: Para o painel de clientes (e-commerce)
2. **Autenticação de Administradores**: Para o painel administrativo (gestão)

Ambos utilizam **JWT (JSON Web Tokens)** com diferentes `audience` para garantir isolamento total entre os sistemas.

---

## 1. Autenticação de Clientes

### Endpoints Disponíveis

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao.silva@email.com",
  "password": "Test123!"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "customer": {
      "id": "uuid",
      "email": "joao.silva@email.com",
      "name": "João Silva",
      "level": "GOLD",
      "status": "ACTIVE",
      ...
    }
  }
}
```

#### Registro
```http
POST /auth/register
Content-Type: application/json

{
  "email": "novo@email.com",
  "password": "SenhaForte123!",
  "name": "Nome Completo",
  "phone": "11987654321",
  "cpf": "12345678901"
}
```

#### Perfil (Protegido)
```http
GET /auth/profile
Authorization: Bearer {token}
```

```http
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo Nome",
  "phone": "11999999999"
}
```

#### Logout
```http
POST /auth/logout
```

### Estrutura do Token JWT de Cliente

```json
{
  "customerId": "uuid",
  "email": "joao.silva@email.com",
  "level": "GOLD",
  "status": "ACTIVE",
  "iat": 1762210830,
  "exp": 1762815630,
  "aud": "moria-frontend",
  "iss": "moria-backend"
}
```

**Importante:** O campo `audience` é `"moria-frontend"`.

---

## 2. Autenticação de Administradores

### Endpoints Disponíveis

#### Login de Admin
```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@moria.com",
  "password": "Test123!"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "admin": {
      "id": "uuid",
      "email": "admin@moria.com",
      "name": "Administrador Moria",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "permissions": ["ALL"],
      ...
    }
  }
}
```

#### Perfil de Admin (Protegido)
```http
GET /auth/admin/profile
Authorization: Bearer {admin_token}
```

```http
PUT /auth/admin/profile
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Novo Nome"
}
```

#### Logout de Admin
```http
POST /auth/admin/logout
```

### Estrutura do Token JWT de Admin

```json
{
  "adminId": "uuid",
  "email": "admin@moria.com",
  "role": "SUPER_ADMIN",
  "status": "ACTIVE",
  "iat": 1762210834,
  "exp": 1762815634,
  "aud": "moria-admin",
  "iss": "moria-backend"
}
```

**Importante:** O campo `audience` é `"moria-admin"`.

---

## 3. Hierarquia de Permissões (Admin)

O sistema possui 4 níveis de acesso administrativo:

| Nível | Descrição | Permissões |
|-------|-----------|------------|
| `STAFF` | Mecânico/Atendente | Pode criar e gerenciar revisões, visualizar dados |
| `MANAGER` | Gerente | Pode criar produtos, serviços, cupons e promoções |
| `ADMIN` | Administrador | Pode deletar recursos críticos |
| `SUPER_ADMIN` | Super Administrador | Acesso total ao sistema |

### Middleware de Autorização

```typescript
// Requer autenticação básica
AdminAuthMiddleware.authenticate

// Requer papel específico
AdminAuthMiddleware.requireRole(AdminRole.MANAGER, AdminRole.ADMIN)

// Requer nível mínimo (hierárquico)
AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER)
// ↑ Permite MANAGER, ADMIN e SUPER_ADMIN
```

---

## 4. Proteção de Rotas

### Rotas Públicas (Sem Autenticação)

- `GET /products/*` - Listagem de produtos
- `GET /services/*` - Listagem de serviços
- `GET /promotions/active` - Promoções ativas
- `GET /coupons/active` - Cupons ativos
- `POST /auth/login` - Login de cliente
- `POST /auth/register` - Registro de cliente
- `POST /auth/admin/login` - Login de admin

### Rotas de Cliente (Requer Token de Cliente)

- `/auth/profile` - Perfil do cliente
- `/addresses/*` - Endereços do cliente
- `/orders/*` - Pedidos do cliente
- `/favorites/*` - Favoritos do cliente
- `/customer-vehicles/*` - Veículos do cliente
- `/coupons/validate` - Validar cupom

### Rotas de Admin (Requer Token de Admin)

#### Gestão de Produtos (MANAGER+)
- `POST /products` - Criar produto
- `PUT /products/:id` - Atualizar produto
- `PATCH /products/:id/stock` - Atualizar estoque (STAFF+)
- `DELETE /products/:id` - Deletar produto (ADMIN+)

#### Gestão de Serviços (MANAGER+)
- `POST /services` - Criar serviço
- `PUT /services/:id` - Atualizar serviço
- `DELETE /services/:id` - Deletar serviço (ADMIN+)

#### Gestão de Cupons (MANAGER+)
- `POST /coupons` - Criar cupom
- `PATCH /coupons/:id` - Atualizar cupom
- `GET /coupons/*` - Visualizar cupons (STAFF+)
- `DELETE /coupons/:id` - Deletar cupom (ADMIN+)

#### Gestão de Promoções (MANAGER+)
- `POST /promotions` - Criar promoção
- `PATCH /promotions/:id` - Atualizar promoção
- `GET /promotions/*` - Visualizar promoções (STAFF+)
- `DELETE /promotions/:id` - Deletar promoção (ADMIN+)

#### Gestão de Checklist (STAFF+ view, MANAGER+ edit)
- `GET /checklist/*` - Visualizar (STAFF+)
- `POST /checklist/categories` - Criar categoria (MANAGER+)
- `PUT /checklist/categories/:id` - Atualizar categoria (MANAGER+)
- `DELETE /checklist/categories/:id` - Deletar categoria (ADMIN+)

#### Gestão de Revisões (STAFF+)
- `GET /revisions/*` - Visualizar revisões (STAFF+)
- `POST /revisions` - Criar revisão (STAFF+)
- `PUT /revisions/:id` - Atualizar revisão (STAFF+)
- `PATCH /revisions/:id/start` - Iniciar revisão (STAFF+)
- `PATCH /revisions/:id/complete` - Completar revisão (STAFF+)
- `PATCH /revisions/:id/cancel` - Cancelar revisão (MANAGER+)
- `DELETE /revisions/:id` - Deletar revisão (ADMIN+)

---

## 5. Segurança

### Isolamento de Tokens

Os tokens de cliente e admin são **completamente isolados**:

- ✅ Token de cliente em rota de cliente: **Funciona**
- ✅ Token de admin em rota de admin: **Funciona**
- ❌ Token de cliente em rota de admin: **Erro 401**
- ❌ Token de admin em rota de cliente: **Erro 401**

Isso é garantido pela diferença no campo `audience` do JWT.

### Validação de Status

Ambos os middlewares verificam:
- ✅ Token válido e não expirado
- ✅ Usuário existe no banco de dados
- ✅ Status é ACTIVE
- ✅ Permissões adequadas (apenas admin)

### Senhas

- Todas as senhas são hasheadas com **bcrypt**
- Salt rounds: 10
- Senhas devem ter no mínimo 6 caracteres

---

## 6. Credenciais de Teste

### Clientes

| Email | Senha | Nível |
|-------|-------|-------|
| joao.silva@email.com | Test123! | GOLD |
| maria.santos@email.com | Test123! | SILVER |

### Administradores

| Email | Senha | Papel |
|-------|-------|-------|
| admin@moria.com | Test123! | SUPER_ADMIN |
| gerente@moria.com | Test123! | MANAGER |
| mecanico@moria.com | Test123! | STAFF |

---

## 7. Exemplos de Uso

### Cliente acessando seus pedidos

```bash
# 1. Fazer login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao.silva@email.com","password":"Test123!"}'

# 2. Usar o token retornado
curl -X GET http://localhost:3001/orders \
  -H "Authorization: Bearer {token_do_cliente}"
```

### Admin criando um produto

```bash
# 1. Fazer login como admin
curl -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moria.com","password":"Test123!"}'

# 2. Criar produto com o token de admin
curl -X POST http://localhost:3001/products \
  -H "Authorization: Bearer {token_do_admin}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Óleo de Motor 5W30",
    "price": 45.90,
    "stock": 100,
    ...
  }'
```

### Mecânico gerenciando revisão

```bash
# 1. Login como mecânico (STAFF)
curl -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mecanico@moria.com","password":"Test123!"}'

# 2. Criar revisão
curl -X POST http://localhost:3001/revisions \
  -H "Authorization: Bearer {token_do_mecanico}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "uuid-do-veiculo",
    "date": "2025-11-04T10:00:00Z",
    "checklistItems": [...]
  }'

# 3. Iniciar revisão
curl -X PATCH http://localhost:3001/revisions/{id}/start \
  -H "Authorization: Bearer {token_do_mecanico}"
```

---

## 8. Tratamento de Erros

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided"
}
```

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient privileges"
}
```

```json
{
  "success": false,
  "error": "Account is not active"
}
```

---

## 9. Arquitetura

```
src/
├── modules/
│   └── auth/
│       ├── auth.controller.ts          # Controller de cliente
│       ├── auth.service.ts             # Service de cliente
│       ├── admin-auth.controller.ts    # Controller de admin
│       ├── admin-auth.service.ts       # Service de admin
│       ├── auth.routes.ts              # Rotas de ambos
│       └── dto/
│           ├── login.dto.ts            # DTO de login de cliente
│           ├── register.dto.ts         # DTO de registro de cliente
│           └── admin-login.dto.ts      # DTO de login de admin
├── middlewares/
│   ├── auth.middleware.ts              # Middleware de autenticação de cliente
│   └── admin-auth.middleware.ts        # Middleware de autenticação de admin
└── shared/
    └── utils/
        └── jwt.util.ts                 # Utilitário JWT (ambos os tipos)
```

---

## 10. Variáveis de Ambiente

```env
JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=7d
```

---

## Conclusão

O sistema de autenticação está **100% funcional** com:

✅ Dois sistemas de autenticação independentes
✅ Isolamento total entre tokens de cliente e admin
✅ Hierarquia de permissões para admins
✅ Proteção adequada em todas as rotas
✅ Validação de status e permissões
✅ Tratamento de erros robusto
✅ Credenciais de teste criadas

**Ambos os painéis (cliente e lojista) exigem login e estão devidamente protegidos.**
