# 🚀 INSTRUÇÕES DE DEPLOY - Moria Peças & Serviços

## ⚠️ IMPORTANTE: Deploy com Correções de Validação

Este projeto passou por correções críticas de validação (commits 61b80a4 e 2c9d304) que resolvem o erro **400 "Dados de entrada inválidos"** na edição de produtos.

Para garantir que as correções sejam aplicadas no deploy, **é obrigatório fazer rebuild completo sem cache**.

---

## 🔧 DEPLOY COMPLETO (RECOMENDADO)

### Opção 1: Script Automático (Mais Fácil)

```bash
# Deploy completo com rebuild forçado
./scripts/deploy-force-rebuild.sh
```

Este script:
- ✅ Para todos os containers
- ✅ Remove cache Docker completo
- ✅ Remove imagens antigas do projeto
- ✅ Força rebuild com timestamp único
- ✅ Testa conectividade dos serviços

### Opção 2: Comandos Manuais (Controle Total)

```bash
# 1. Parar tudo
docker compose down --remove-orphans --volumes

# 2. Limpar cache completo
docker system prune -a -f
docker builder prune -a -f

# 3. Remover imagens do projeto (se existirem)
docker rmi $(docker images --format "table {{.Repository}}:{{.Tag}}" | grep moria) 2>/dev/null || true

# 4. Build forçado com timestamp
export BUILD_TIMESTAMP=$(date +%s)
docker compose build --no-cache --pull --build-arg BUILD_TIMESTAMP=$BUILD_TIMESTAMP

# 5. Subir stack
docker compose up -d

# 6. Verificar
docker compose ps
docker compose logs -f
```

---

## ⚡ DEPLOY RÁPIDO (Desenvolvimento)

```bash
# Deploy normal (se não houver mudanças críticas)
./scripts/deploy.sh

# Deploy com limpeza leve
./scripts/deploy.sh --clean
```

---

## 🔍 VERIFICAÇÃO PÓS-DEPLOY

### 1. Verificar Serviços
```bash
docker compose ps
```

### 2. Testar Endpoints
```bash
# Backend
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:8080
```

### 3. Monitorar Logs
```bash
# Logs em tempo real
docker compose logs -f

# Logs específicos
docker compose logs backend
docker compose logs frontend
```

### 4. Testar Funcionalidade Corrigida
1. Acesse o painel administrativo
2. Vá para seção Produtos
3. Tente editar um produto
4. **Resultado esperado**: ✅ Edição salva sem erro 400

---

## 🚨 TROUBLESHOOTING

### Problema: Ainda recebo erro 400 após deploy

**Causa**: Cache do Docker ou navegador ainda usando versão antiga

**Solução**:
```bash
# 1. Força rebuild completo
./scripts/deploy-force-rebuild.sh

# 2. Limpar cache do navegador (Ctrl+Shift+R)

# 3. Verificar se timestamp foi aplicado
docker images | grep moria
```

### Problema: Container não sobe

**Solução**:
```bash
# Ver logs detalhados
docker compose logs [service-name]

# Verificar portas ocupadas
netstat -tulpn | grep :3001
netstat -tulpn | grep :8080
```

### Problema: Banco de dados com problemas

**Solução**:
```bash
# Reset completo do volume do banco
docker compose down --volumes
rm -rf volumes/ 2>/dev/null || true
docker volume prune -f
./scripts/deploy-force-rebuild.sh
```

---

## 📊 COMANDOS ÚTEIS

```bash
# Status dos containers
docker compose ps

# Logs em tempo real
docker compose logs -f

# Entrar no container (debug)
docker compose exec backend bash
docker compose exec frontend sh

# Ver imagens criadas
docker images | grep moria

# Espaço usado pelo Docker
docker system df

# Parar tudo
docker compose down
```

---

## 🎯 VERIFICAÇÕES DE QUALIDADE

Antes de considerar o deploy bem-sucedido:

- [ ] ✅ Backend responde em `/api/health`
- [ ] ✅ Frontend carrega sem erros
- [ ] ✅ Login administrativo funciona
- [ ] ✅ **Edição de produtos salva sem erro 400**
- [ ] ✅ Criação de produtos funciona
- [ ] ✅ Logs sem erros críticos

---

## 📝 HISTÓRICO DE CORREÇÕES

| Commit | Descrição | Impacto |
|--------|-----------|---------|
| f8d5cbe | Resolver conflitos de estado em TODAS seções administrativas | 🏗️ Arquitetura |
| 61b80a4 | Resolver erro 400 "Dados de entrada inválidos" na edição | 🔧 Validação |
| 2c9d304 | Resolver discrepância de parsing ProductModal/useAdminProducts | 🐛 Parsing |

**Para aplicar essas correções no deploy, use sempre o rebuild completo!**