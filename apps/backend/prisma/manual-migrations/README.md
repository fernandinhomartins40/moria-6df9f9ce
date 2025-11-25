# Manual Migrations

Sistema de migrations manuais para alterações SQL que não podem ser expressas no Prisma schema.

## 📋 Como Funciona

1. **Arquivos SQL** são colocados neste diretório
2. **Nomenclatura ordenada**: `001-descricao.sql`, `002-descricao.sql`, etc.
3. **Execução automática** durante o deploy
4. **Idempotência**: Migrations já executadas são puladas automaticamente

## 🔐 Segurança

- ✅ **Preserva volumes**: Nunca toca em dados de usuário ou uploads
- ✅ **Rastreamento**: Tabela `_manual_migrations` guarda histórico
- ✅ **Validação de erros**: Deploy falha se migration falhar
- ✅ **Execução única**: Cada migration executa apenas uma vez

## 📝 Como Adicionar Nova Migration

### 1. Criar Arquivo SQL

```bash
# Próximo número sequencial
touch apps/backend/prisma/manual-migrations/003-minha-migration.sql
```

### 2. Escrever SQL Seguro

```sql
-- Manual Migration 003: Descrição da mudança
-- Date: YYYY-MM-DD
-- Description: O que esta migration faz
-- SAFE: Explicar por que é seguro

-- Usar IF EXISTS/IF NOT EXISTS
ALTER TABLE "tabela"
ADD COLUMN IF NOT EXISTS "nova_coluna" VARCHAR(255);

-- Ou DROP IF EXISTS
DROP INDEX IF EXISTS "index_antigo";
```

### 3. Testar Localmente

```bash
cd apps/backend
node scripts/run-manual-migrations.js
```

### 4. Commit e Deploy

```bash
git add apps/backend/prisma/manual-migrations/
git commit -m "feat: Add migration 003"
git push
```

## ⚠️ Boas Práticas

### ✅ Fazer

- Use `IF EXISTS` / `IF NOT EXISTS`
- Documente TUDO (data, descrição, segurança)
- Teste localmente ANTES do deploy
- Migrations devem ser DDL (ALTER TABLE, CREATE INDEX, etc.)
- Uma migration = uma responsabilidade

### ❌ Não Fazer

- **NUNCA** DELETE ou UPDATE em massa de dados
- **NUNCA** DROP TABLE sem backup
- **NUNCA** alterar dados em volumes (`uploads/`)
- **NUNCA** modificar migration já executada (crie nova)

## 📊 Verificar Status

```bash
# Conectar ao banco
psql -U moria -d moria

# Ver migrations executadas
SELECT * FROM _manual_migrations ORDER BY executed_at DESC;

# Ver Prisma migrations
SELECT * FROM _prisma_migrations ORDER BY started_at DESC;
```

## 🔧 Exemplo Completo

```sql
-- Manual Migration 003: Add index to improve performance
-- Date: 2025-11-25
-- Description: Add composite index on orders table for faster queries
-- SAFE: Only creates index, does not touch data

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS "orders_customer_status_idx"
ON "orders"("customerId", "status")
WHERE "status" != 'CANCELLED';

-- Analyze table to update statistics
ANALYZE "orders";
```

## 🚨 Em Caso de Erro

Se uma migration falhar em produção:

1. **Deploy é interrompido** automaticamente
2. **Banco fica no estado anterior** (transação rollback)
3. **Logs mostram** qual migration falhou
4. **Corrigir** o SQL e fazer novo deploy

## 📁 Estrutura

```
prisma/
├── manual-migrations/
│   ├── README.md (este arquivo)
│   ├── 001-remove-soft-delete.sql
│   ├── 002-cascade-delete-revisions.sql
│   └── 003-sua-nova-migration.sql
└── migrations/ (Prisma auto-generated)
```

## 🔄 Fluxo de Deploy

```
1. rsync código → VPS
2. npm install
3. npx prisma generate
4. npm run build
5. docker build
6. docker up
7. ┌─ Aguardar PostgreSQL
   ├─ Limpar migrations failed
   ├─ npx prisma migrate deploy  ← Migrations do Prisma
   ├─ node run-manual-migrations.js  ← Migrations manuais
   └─ Se tudo OK: Iniciar app
      Se erro: PARAR DEPLOY
```

## 📞 Suporte

Se tiver dúvidas, consulte:
- Documentação Prisma: https://www.prisma.io/docs/concepts/components/prisma-migrate
- PostgreSQL DDL: https://www.postgresql.org/docs/current/ddl.html
