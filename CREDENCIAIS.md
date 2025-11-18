# 🔑 Credenciais de Acesso - Sistema Moria

## 📋 Informações Gerais

**Senha Padrão para Todos os Usuários**: `Test123!`

---

## 👨‍💼 Painel do Lojista (Admin)

### Super Administrador
```
Email: admin@moria.com
Senha: Test123!
Nome: Administrador Moria
Cargo: SUPER_ADMIN
Permissões: Acesso Total (ALL)
```

### Gerente da Loja
```
Email: gerente@moria.com
Senha: Test123!
Nome: Gerente da Loja
Cargo: MANAGER
Permissões:
  - Produtos
  - Serviços
  - Pedidos
  - Clientes
  - Revisões
```

### Mecânico/Staff
```
Email: mecanico@moria.com
Senha: Test123!
Nome: João Mecânico
Cargo: STAFF
Permissões:
  - Revisões
  - Veículos
  - Checklist
```

---

## 👥 Clientes (Painel do Cliente)

### Cliente 1 - Nível Gold
```
Email: joao.silva@email.com
Senha: Test123!
Nome: João Silva
CPF: 12345678901
Telefone: (11) 98765-4321
Nível: GOLD
Total de Pedidos: 15
Total Gasto: R$ 4.500,00
Endereço: Rua das Flores, 123 - Apto 45
          Centro, São Paulo - SP
          CEP: 01234-567
```

### Cliente 2 - Nível Silver
```
Email: maria.santos@email.com
Senha: Test123!
Nome: Maria Santos
Telefone: (21) 98765-4321
Nível: SILVER
Total de Pedidos: 8
Total Gasto: R$ 2.300,00
```

---

## 🧪 Testes de Login

### Login Admin (Lojista)

**Endpoint**: `POST http://localhost:3001/auth/admin/login`

```bash
# Super Admin
curl -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@moria.com",
    "password": "Test123!"
  }'

# Gerente
curl -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gerente@moria.com",
    "password": "Test123!"
  }'

# Mecânico
curl -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mecanico@moria.com",
    "password": "Test123!"
  }'
```

### Login Cliente

**Endpoint**: `POST http://localhost:3001/auth/login`

```bash
# Cliente Gold
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@email.com",
    "password": "Test123!"
  }'

# Cliente Silver
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.santos@email.com",
    "password": "Test123!"
  }'
```

---

## 🎯 Hierarquia de Permissões

### SUPER_ADMIN
- ✅ Acesso total ao sistema
- ✅ Gerenciar outros admins
- ✅ Todas as operações de produtos, serviços, pedidos
- ✅ Relatórios e analytics
- ✅ Configurações do sistema

### MANAGER (Gerente)
- ✅ Gerenciar produtos e serviços
- ✅ Visualizar e processar pedidos
- ✅ Gerenciar clientes
- ✅ Criar e gerenciar revisões
- ❌ Não pode gerenciar outros admins
- ❌ Não pode alterar configurações críticas

### STAFF (Mecânico/Atendente)
- ✅ Criar e gerenciar revisões veiculares
- ✅ Gerenciar veículos dos clientes
- ✅ Utilizar checklists de revisão
- ❌ Não pode alterar produtos/preços
- ❌ Não pode processar pedidos
- ❌ Acesso limitado a dados de clientes

---

## 📊 Dados Disponíveis no Sistema

### Produtos: 5
- Filtro de Óleo Mann W610/3
- Vela de Ignição NGK BKR6E-11
- Pastilha de Freio Bosch Dianteira
- Óleo Motor Sintético 5W30
- Kit Correia Dentada Gates

### Serviços: 4
- Troca de Óleo e Filtro
- Alinhamento e Balanceamento
- Revisão Completa
- Troca de Pastilhas de Freio

### Veículos Cadastrados:
- 4 Marcas (VW, Chevrolet, Fiat, Toyota)
- 4 Modelos
- 3 Variantes

### Checklist de Revisão:
- 10 Categorias
- 83 Itens de Verificação

---

## 🔐 Segurança

- Todas as senhas são criptografadas com **bcrypt** (10 rounds)
- Tokens JWT com expiração de **7 dias**
- CORS configurado para origens permitidas
- Rate limiting implementado
- Logs estruturados de todas as operações

---

## 📝 Notas Importantes

1. **Ambiente de Desenvolvimento**: Estas credenciais são apenas para desenvolvimento/teste
2. **Produção**: Em produção, SEMPRE altere todas as senhas padrão
3. **JWT Secret**: O JWT_SECRET deve ser alterado em produção
4. **Backup**: Faça backup regular do banco de dados
5. **Logs**: Monitore os logs para atividades suspeitas

---

**Última Atualização**: 03/11/2024
**Versão do Sistema**: 1.0.0
**Ambiente**: Desenvolvimento
