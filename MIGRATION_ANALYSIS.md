# 📊 Análise Completa: Schema Prisma vs Migrations vs Banco de Dados

**Data:** 2025-11-25
**Status:** 🔴 INCONSISTÊNCIAS CRÍTICAS DETECTADAS

---

## 🎯 Resumo Executivo

O deploy está falhando devido a **desalinhamento entre schema Prisma, migrations e banco de dados de produção**.

### Problemas Identificados

1. ✅ **Migration `20250119000000_add_audit_log` falha** - Tabela `audit_logs` JÁ existe no banco
2. ✅ **Migration fantasma `20251117130259_init`** - Existe no banco mas NÃO nos arquivos locais
3. ✅ **Migration `20251124190128_add_deleted_at`** - Adiciona coluna que foi REMOVIDA do schema
4. ⚠️ **CASCADE delete não aplicado** - Código espera mas banco não tem
5. ⚠️ **Script cleanup-failed-migrations.js** - Bug no INSERT (checksum NULL)

---

## 📁 Estado Atual

### Migrations Locais (3 arquivos)

```
apps/backend/prisma/migrations/
├── 20250119000000_add_audit_log/        ❌ FALHA (tabela já existe)
├── 20250119000001_enable_rls/           ⏸️  PENDENTE
└── 20251124190128_add_deleted_at/       ❌ CONFLITO (schema não tem deletedAt)
```

### Migrations no Banco de Produção

```sql
SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at;

-- Resultado esperado (baseado nos logs):
20251117130259_init                        ✅ Aplicada (FANTASMA - não existe localmente!)
20250119000000_add_audit_log               ❌ FAILED (tabela já existe)
20250119000001_enable_rls                  ⏸️  NÃO aplicada
20251124190128_add_deleted_at_to_vehicles  ⏸️  NÃO aplicada
```

---

## 🔍 Análise Detalhada

### 1. Model `Admin` + `AuditLog`

**Schema Prisma:**
```prisma
model Admin {
  id          String      @id @default(uuid())
  // ... outros campos
  auditLogs   AuditLog[]  // ✅ Relação definida
  @@map("admins")
}

model AuditLog {
  id         String   @id @default(uuid())
  adminId    String
  admin      Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)
  // ...
  @@map("audit_logs")
}
```

**Migration `20250119000000_add_audit_log`:**
```sql
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    -- ...
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
```

**Problema:**
- ❌ Migration tenta CRIAR tabela
- ✅ Tabela JÁ EXISTE no banco (provavelmente criada em migration fantasma)
- 🔥 Deploy FALHA neste ponto

**Causa Raiz:**
Migration `20251117130259_init` (fantasma) já criou esta tabela.

---

### 2. Model `Revision` (RLS Policies)

**Schema Prisma:**
```prisma
model Revision {
  id              String         @id @default(uuid())
  customerId      String
  vehicleId       String
  // ...
  customer         Customer        @relation(...)
  vehicle          CustomerVehicle @relation(..., onDelete: Cascade) // ✅ CASCADE no schema
  assignedMechanic Admin?          @relation(...)
  @@map("revisions")
}
```

**Migration `20250119000001_enable_rls`:**
```sql
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY mechanic_select_own_revisions ON revisions ...
-- etc
```

**Status:**
- ⏸️ **PENDENTE** - Não foi aplicada porque migration anterior falhou
- ✅ SQL válido e seguro
- ✅ Não conflita com schema

---

### 3. Model `CustomerVehicle`

**Schema Prisma ATUAL:**
```prisma
model CustomerVehicle {
  id            String  @id @default(uuid())
  customerId    String
  brand         String
  model         String
  year          Int
  plate         String  @unique
  chassisNumber String?
  color         String?
  mileage       Int?

  // ❌ deletedAt NÃO EXISTE no schema atual

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  customer  Customer   @relation(...)
  revisions Revision[] // Relação SEM onDelete CASCADE ainda
}
```

**Migration `20251124190128_add_deleted_at`:**
```sql
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "customer_vehicles_deletedAt_idx" ON "customer_vehicles"("deletedAt");
```

**Problema:**
- ⏸️ Migration **PENDENTE** (não aplicada)
- ❌ Adiciona coluna `deletedAt`
- ❌ Mas schema atual **NÃO TEM** `deletedAt`
- 🔥 Se aplicar: **desalinhamento** entre schema e banco

**Histórico:**
1. Migration criada para adicionar `deletedAt`
2. Depois removemos `deletedAt` do schema manualmente
3. Migration nunca foi revertida
4. Resultado: **CONFLITO**

---

### 4. Constraint CASCADE (Manual Migration Pendente)

**Schema Prisma:**
```prisma
vehicle CustomerVehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
```

**Banco de Dados:**
```sql
-- Constraint ATUAL no banco (sem CASCADE)
CONSTRAINT "revisions_vehicleId_fkey"
FOREIGN KEY ("vehicleId")
REFERENCES "customer_vehicles"("id")
-- SEM: ON DELETE CASCADE
```

**Migration Manual Pendente:**
```sql
-- 002-cascade-delete-revisions.sql
ALTER TABLE "revisions" DROP CONSTRAINT "revisions_vehicleId_fkey";
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "customer_vehicles"("id")
ON DELETE CASCADE;
```

**Status:**
- ⏸️ **PENDENTE** - Migration manual criada mas não executada
- 🔥 Causa erro 400 ao deletar veículos

---

## 🚨 Migration Fantasma

**Migration:** `20251117130259_init`

**Problema:**
- ✅ Existe na tabela `_prisma_migrations` do banco
- ❌ **NÃO existe** em `apps/backend/prisma/migrations/`
- 🤔 Provavelmente criou tabelas iniciais do banco
- 🔥 Causa conflito com `20250119000000_add_audit_log`

**Como aconteceu:**
1. Deploy inicial criou migration `init`
2. Arquivo foi deletado ou perdido no histórico git
3. Migrations posteriores tentam recriar tabelas que já existem

---

## 🛠️ Plano de Correção

### ✅ Solução 1: Resolver Migrations do Prisma (CRÍTICO)

**Objetivo:** Alinhar `_prisma_migrations` com arquivos locais

**Passos:**

1. **Marcar migrations problemáticas como aplicadas manualmente:**

```sql
-- Conectar ao banco de produção
psql -U moria -d moria

-- Ver estado atual
SELECT migration_name, finished_at, logs
FROM _prisma_migrations
ORDER BY started_at;

-- Deletar migration fantasma (não existe localmente)
DELETE FROM _prisma_migrations
WHERE migration_name = '20251117130259_init';

-- Deletar migration failed
DELETE FROM _prisma_migrations
WHERE migration_name = '20250119000000_add_audit_log'
AND finished_at IS NULL;

-- Marcar audit_log como aplicada (tabela já existe)
INSERT INTO _prisma_migrations (
  migration_name,
  checksum,
  finished_at,
  started_at,
  applied_steps_count,
  logs
) VALUES (
  '20250119000000_add_audit_log',
  '00000000000000000000000000000000000000',
  NOW(),
  NOW(),
  1,
  'Manually marked as applied - table already exists'
) ON CONFLICT (migration_name) DO NOTHING;
```

2. **Deletar migration conflitante localmente:**

```bash
# Remover migration que adiciona deletedAt
rm -rf apps/backend/prisma/migrations/20251124190128_add_deleted_at_to_customer_vehicles/
```

---

### ✅ Solução 2: Corrigir cleanup-failed-migrations.js

**Bug Atual:**
```javascript
// linha 68 - checksum vazio causa erro NOT NULL
checksum: '',  // ❌ NULL não permitido
```

**Correção:**
```javascript
checksum: '00000000000000000000000000000000000000',  // ✅ Hash válido
```

---

### ✅ Solução 3: Aplicar Migrations Manuais

**Após corrigir Prisma migrations:**

```bash
# No deploy, script run-manual-migrations.js executará:
001-remove-soft-delete.sql       # Remove deletedAt se existir
002-cascade-delete-revisions.sql # Adiciona CASCADE
```

---

## 📋 Checklist de Correção

### Fase 1: Correção Urgente (Fazer AGORA)

- [ ] Corrigir `cleanup-failed-migrations.js` (checksum)
- [ ] Deletar migration `20251124190128_add_deleted_at`
- [ ] Commit e push correções

### Fase 2: Correção Manual no Banco (SSH)

- [ ] Conectar em produção via SSH
- [ ] Executar SQL de limpeza de `_prisma_migrations`
- [ ] Marcar `audit_log` como aplicada
- [ ] Marcar `enable_rls` como aplicada (se RLS já estiver ativo)

### Fase 3: Novo Deploy

- [ ] Fazer novo push
- [ ] Migrations manuais serão executadas
- [ ] Verificar sucesso

---

## 🎯 Estado Final Esperado

### Migrations Locais (2 arquivos)
```
prisma/migrations/
├── 20250119000000_add_audit_log/     ✅ Marcada como aplicada
└── 20250119000001_enable_rls/        ✅ Será aplicada
```

### Migrations Manuais (2 arquivos)
```
prisma/manual-migrations/
├── 001-remove-soft-delete.sql        ✅ Será executada
└── 002-cascade-delete-revisions.sql  ✅ Será executada
```

### Banco de Dados
```
Tables:
- audit_logs             ✅ Existe
- revisions              ✅ Com RLS + CASCADE
- customer_vehicles      ✅ SEM deletedAt

Constraints:
- revisions_vehicleId_fkey  ✅ Com CASCADE
```

---

## ⚠️ Pontos de Atenção

1. **NUNCA** deletar `_prisma_migrations` inteira
2. **NUNCA** usar `prisma migrate reset` em produção
3. **SEMPRE** fazer backup antes de mexer em migrations
4. **VOLUMES** são preservados (postgres_data, uploads_data)

---

**Próximo passo:** Implementar correções da Fase 1
