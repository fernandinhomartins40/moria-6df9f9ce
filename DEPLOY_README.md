# 🚀 Deploy Moria - Instruções Rápidas

## ⚡ Para fazer deploy AGORA no servidor VPS

```bash
# 1. SSH no servidor
ssh root@moriapecas.com.br

# 2. Ir para o diretório do projeto
cd /root/moria

# 3. Atualizar código
git pull origin main

# 4. Executar deploy automático
bash deploy.sh
```

**Pronto!** O script faz tudo automaticamente:
- ✅ Limpa containers antigos
- ✅ Build backend + frontend
- ✅ Build Docker
- ✅ Inicia container novo
- ✅ Valida tudo

---

## 🧹 Se der problema, limpar tudo primeiro:

```bash
bash cleanup-docker.sh
bash deploy.sh
```

---

## 📋 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `deploy.sh` | Script completo de deploy automático |
| `cleanup-docker.sh` | Limpa containers e imagens antigas |
| `DEPLOY_GUIDE.md` | Guia detalhado com troubleshooting |
| `Dockerfile.vps` | Atualizado com validações |

---

## ✅ Validar após deploy:

```bash
# Health check
curl http://localhost:3090/health

# Logs
docker logs -f moria-app

# Ver site
curl -I http://localhost:3090/
```

---

## 🎯 Comandos Essenciais

```bash
# Ver logs
docker logs -f moria-app

# Reiniciar
docker restart moria-app

# Parar
docker stop moria-app

# Entrar no container
docker exec -it moria-app sh

# Ver containers rodando
docker ps
```

---

## ⚠️ IMPORTANTE

**Sempre execute `deploy.sh` ao invés de comandos manuais!**

O script garante:
- Limpeza de containers órfãos
- Build correto do código
- Sem cache de Docker antigo
- Validações em cada etapa

---

## 📖 Documentação Completa

Ver [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para:
- Troubleshooting detalhado
- Deploy manual passo-a-passo
- Comandos avançados
- Problemas comuns e soluções
