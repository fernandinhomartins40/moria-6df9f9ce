# 🔧 Fix Deploy - Cadastro de Veículos

## Problema Identificado
O erro ao cadastrar veículos no painel store-panel (produção) ocorre porque o Prisma Client não está sincronizado com o schema.

## Solução - Comandos para Executar na VPS

Execute os seguintes comandos na VPS em sequência:

```bash
# 1. Conectar na VPS
ssh root@164.90.252.191

# 2. Navegar para o diretório do projeto
cd /root/moria

# 3. Fazer pull das últimas alterações
git pull origin main

# 4. Instalar dependências (caso necessário)
cd apps/backend
npm install

# 5. Regerar o Prisma Client
npx prisma generate

# 6. Buildar o backend
npm run build

# 7. Reiniciar o backend com PM2
cd ../..
pm2 restart moria-backend

# 8. Verificar logs
pm2 logs moria-backend --lines 50
```

## Verificação

Após executar os comandos acima:

1. Acesse o painel store-panel em produção
2. Vá para "Revisões"
3. Clique em "Selecionar Cliente"
4. Clique em "Selecionar Veículo"
5. Clique em "Novo Veículo"
6. Preencha o formulário e tente cadastrar

O cadastro deve funcionar corretamente agora.

## Causa Raiz

O campo `preferences` já existe no schema do Prisma (linha 123):
```prisma
model Admin {
  // ...
  preferences Json?       // Preferências do usuário (notificações, tema, etc.)
  // ...
}
```

Mas o Prisma Client em produção não foi regerado após atualizações do schema, causando erros de TypeScript ao tentar acessar este campo.

## Arquivos Relacionados

- `apps/backend/prisma/schema.prisma` - Schema do Prisma (já correto)
- `apps/backend/src/modules/auth/admin-auth.service.ts` - Usa o campo preferences
- `apps/backend/src/modules/admin/admin.controller.ts` - Controller de veículos
- `apps/backend/src/modules/admin/admin.service.ts` - Service de veículos

## Status
✅ Código local: OK (build passa sem erros)
⚠️ Produção: Precisa regenerar Prisma Client

## Data
2025-11-20
