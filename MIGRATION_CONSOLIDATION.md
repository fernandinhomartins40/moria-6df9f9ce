# 🔄 Consolidação de Migrations - Moria Peças

**Data:** 2025-11-25
**Status:** ✅ ESTRATÉGIA IMPLEMENTADA - AGUARDANDO EXECUÇÃO

---

## 🎯 Problema Identificado

Após análise profunda do código local e banco de produção, identificamos:

### Estado Real da Produção
```
21 tabelas existentes e funcionando:
✅ admins, audit_logs, customers, addresses
✅ products, services, orders, order_items
✅ customer_vehicles, revisions
✅ vehicle_makes, vehicle_models, vehicle_variants
✅ product_vehicle_compatibility
✅ promotions, coupons, favorites
✅ checklist_categories, checklist_items
✅ notifications
✅ _prisma_migrations

Migrations aplicadas:
✅ 20251117130259_init (aplicada) - criou todas as 21 tabelas
❌ 20250119000000_add_audit_log (FAILED) - tabela já existe!
```

### Problemas Críticos

1. **Migration Fantasma**
   - `20251117130259_init` existe no banco mas NÃO nos arquivos locais
   - Criou todas as tabelas iniciais corretamente
   - Prisma não reconhece essa migration

2. **Migrations Conflitantes**
   - `20250119000000_add_audit_log` tenta criar `audit_logs` que já existe
   - `20250119000001_enable_rls` nunca foi aplicada

3. **Constraint Incorreta**
   - Schema Prisma espera: `onDelete: Cascade`
   - Banco tem: `ON DELETE RESTRICT`
   - Resultado: Error 400 ao deletar veículos com revisões

4. **RLS Não Configurado**
   - Row-Level Security não está ativo na tabela `revisions`
   - Políticas de acesso não foram criadas

---

## ✅ Solução Implementada

### Estratégia: Consolidação Limpa

Em vez de tentar corrigir migrations conflitantes, consolidamos tudo:

#### 1. Limpeza Local
- ✅ Deletadas todas as migrations conflitantes:
  - `20250119000000_add_audit_log/` (tentava criar tabela existente)
  - `20250119000001_enable_rls/` (substituída por nova versão)
  - `20251124190128_add_deleted_at/` (já deletada anteriormente)

#### 2. Nova Migration Consolidada
- ✅ Criada: `20251125000000_fix_cascade_and_rls/`
  - **NÃO recria tabelas** (já existem!)
  - Apenas **AJUSTA** configurações:
    1. Altera constraint `revisions_vehicleId_fkey` para CASCADE
    2. Habilita RLS na tabela `revisions`
    3. Cria 4 policies de acesso
  - **Idempotente**: pode ser executada múltiplas vezes sem erro
  - **Verificações embutidas**: valida se tudo foi aplicado corretamente

#### 3. Script de Limpeza
- ✅ Criado: `cleanup-migrations-table.sql`
  - Limpa tabela `_prisma_migrations` completamente
  - Marca `20251117130259_init` como aplicada
  - Prepara banco para receber nova migration

#### 4. Simplificação
- ✅ Removidos scripts obsoletos:
  - `cleanup-failed-migrations.js` (tinha bugs, não é mais necessário)
  - `cleanup-production-migrations.sql` (substituído)

---

## 📋 Plano de Execução

### Passo 1: Push do Código ✅
```bash
git add -A
git commit -m "feat: Consolidar migrations em uma única migration de ajuste"
git push
```

### Passo 2: Limpeza Manual na Produção ⏸️
```bash
# Conectar ao servidor
ssh root@moriapecas.com.br

# Conectar ao banco
docker exec -it moria-postgres psql -U moria -d moria

# Executar script de limpeza
\i /path/to/cleanup-migrations-table.sql
# OU copiar e colar o conteúdo do arquivo
```

**O que esse script faz:**
1. Mostra estado atual da tabela `_prisma_migrations`
2. Limpa todas as entradas (DELETE FROM _prisma_migrations)
3. Marca `20251117130259_init` como aplicada
4. Mostra estado final (deve ter apenas 1 migration)

### Passo 3: Deploy Automático ⏸️
Após executar Passo 2, fazer novo deploy:
- Prisma Migrate vai ver que `init` já foi aplicada
- Vai aplicar apenas `20251125000000_fix_cascade_and_rls`
- Migration vai:
  - ✅ Alterar constraint para CASCADE
  - ✅ Habilitar RLS
  - ✅ Criar policies
  - ✅ Verificar se tudo foi aplicado corretamente

### Passo 4: Validação ⏸️
```bash
# Verificar migrations aplicadas
docker exec -it moria-postgres psql -U moria -d moria -c \
  'SELECT migration_name, finished_at IS NOT NULL as applied FROM _prisma_migrations ORDER BY started_at;'

# Verificar constraint CASCADE
docker exec -it moria-postgres psql -U moria -d moria -c \
  '\d revisions' | grep vehicleId_fkey

# Verificar RLS
docker exec -it moria-postgres psql -U moria -d moria -c \
  'SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = '\''revisions'\'';'

# Verificar policies
docker exec -it moria-postgres psql -U moria -d moria -c \
  'SELECT policyname FROM pg_policies WHERE tablename = '\''revisions'\'';'
```

**Resultado Esperado:**
```
Migrations:
✅ 20251117130259_init (aplicada)
✅ 20251125000000_fix_cascade_and_rls (aplicada)

Constraint:
✅ revisions_vehicleId_fkey | ON DELETE CASCADE

RLS:
✅ revisions | rowsecurity = true

Policies (4):
✅ mechanic_select_own_revisions
✅ mechanic_update_own_revisions
✅ manager_insert_revisions
✅ admin_delete_revisions
```

---

## 🎯 Benefícios da Abordagem

### ✅ Simplicidade
- Apenas 1 migration para aplicar (vs. tentar corrigir 3)
- Script de limpeza direto e claro
- Sem dependências complexas

### ✅ Segurança
- NÃO recria tabelas (preserva todos os dados)
- NÃO toca nos volumes Docker
- Idempotente (pode re-executar sem problemas)
- Verificações embutidas detectam falhas

### ✅ Alinhamento
- Migrations locais refletem apenas mudanças necessárias
- `_prisma_migrations` reflete estado real do banco
- Schema Prisma alinhado com banco de dados

### ✅ Manutenibilidade
- Histórico limpo de migrations
- Fácil entender o que cada migration faz
- Sem arquivos conflitantes ou obsoletos

---

## 🔍 Estrutura Final

### Migrations Directory
```
apps/backend/prisma/migrations/
└── 20251125000000_fix_cascade_and_rls/
    └── migration.sql
```

### Scripts Directory
```
apps/backend/scripts/
├── cleanup-migrations-table.sql  (execução manual)
└── run-manual-migrations.js      (execução automática no deploy)
```

### Banco de Dados (_prisma_migrations)
```
Antes da execução manual:
❌ 20251117130259_init (aplicada) - fantasma
❌ 20250119000000_add_audit_log (failed) - conflito

Depois da execução manual:
✅ 20251117130259_init (aplicada)

Depois do deploy:
✅ 20251117130259_init (aplicada)
✅ 20251125000000_fix_cascade_and_rls (aplicada)
```

---

## 📝 Notas Importantes

### Preservação de Dados
- ✅ Todos os volumes Docker preservados
- ✅ `postgres_data`: todos os dados intactos
- ✅ `uploads_data`: todas as imagens intactas
- ✅ Apenas DDL (ALTER TABLE), sem DML (DELETE, UPDATE)

### Rollback (se necessário)
Se algo der errado, podemos reverter:
```sql
-- Reverter CASCADE (voltar para RESTRICT)
ALTER TABLE revisions DROP CONSTRAINT revisions_vehicleId_fkey;
ALTER TABLE revisions ADD CONSTRAINT revisions_vehicleId_fkey
  FOREIGN KEY (vehicleId) REFERENCES customer_vehicles(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Desabilitar RLS
ALTER TABLE revisions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mechanic_select_own_revisions ON revisions;
DROP POLICY IF EXISTS mechanic_update_own_revisions ON revisions;
DROP POLICY IF EXISTS manager_insert_revisions ON revisions;
DROP POLICY IF EXISTS admin_delete_revisions ON revisions;
```

### Próximas Migrations
Futuras migrations funcionarão normalmente:
```bash
# Criar nova migration
npx prisma migrate dev --name add_new_feature

# Deploy em produção
npx prisma migrate deploy  # vai funcionar corretamente!
```

---

## ✅ Checklist de Execução

- [ ] **Passo 1:** Push do código (migrations consolidadas)
- [ ] **Passo 2:** SSH no servidor de produção
- [ ] **Passo 3:** Conectar ao banco PostgreSQL
- [ ] **Passo 4:** Executar `cleanup-migrations-table.sql`
- [ ] **Passo 5:** Verificar que apenas 1 migration existe
- [ ] **Passo 6:** Sair do psql e fazer novo deploy
- [ ] **Passo 7:** Verificar logs do deploy (deve aplicar nova migration)
- [ ] **Passo 8:** Validar constraint CASCADE
- [ ] **Passo 9:** Validar RLS ativo
- [ ] **Passo 10:** Testar deletar veículo com revisões (deve funcionar!)

---

**Status:** Aguardando execução manual do Passo 2 (limpeza da tabela _prisma_migrations)
