# 🚀 Deploy Completo - PWAs + Backend + Frontend

## 📋 Pré-requisitos

- Node.js 18+
- npm 9+
- Docker (para deploy VPS)
- Git

---

## 🏗️ Processo de Build Completo

### Opção 1: Script Automático (Recomendado)

```bash
# Linux/Mac/Git Bash
npm run build:docker

# Windows PowerShell
npm run build:docker:windows
```

Este script faz automaticamente:
1. ✅ Build do Backend
2. ✅ Build do Frontend (legado)
3. ✅ Build do Customer PWA
4. ✅ Build do Mechanic/Admin PWA
5. ✅ Copia os PWAs para `apps/frontend/dist/`
6. ✅ Copia ícones e screenshots
7. ✅ Copia manifestos

### Opção 2: Manual

```bash
# 1. Backend
npm run build:backend

# 2. Frontend
npm run build:frontend

# 3. PWAs
npm run build:customer
npm run build:mechanic

# 4. Copiar manualmente (veja scripts/build-all-for-docker.sh)
```

---

## 📁 Estrutura Final de Build

Após `npm run build:docker`, você terá:

```
apps/frontend/dist/
├── index.html                    # Frontend legado
├── assets/                       # JS/CSS do frontend
├── cliente/                      # 🆕 Customer PWA completo
│   ├── index.html
│   ├── assets/
│   ├── icons/
│   ├── screenshots/
│   ├── manifest.webmanifest
│   └── sw.js
├── mecanico/                     # 🆕 Mechanic PWA completo
│   ├── index.html
│   ├── assets/
│   └── manifest.webmanifest
├── icons/                        # 🆕 Ícones PWA compartilhados
│   ├── customer-192.png
│   ├── customer-512.png
│   ├── mechanic-192.png
│   └── mechanic-512.png
├── screenshots/                  # 🆕 Screenshots PWA
│   ├── narrow-1.png
│   └── wide-1.png
├── manifest.webmanifest          # 🆕 Manifest do Customer
├── manifest-mecanico.webmanifest # 🆕 Manifest do Mechanic
├── sw.js                         # 🆕 Service Worker
└── workbox-*.js                  # 🆕 Workbox runtime

apps/backend/dist/
└── server.js                     # Backend compilado
```

---

## 🐳 Deploy Docker VPS

### 1. Build Local

```bash
# Fazer build completo
npm run build:docker

# Verificar se tudo foi buildado
ls apps/frontend/dist/cliente/     # Customer PWA
ls apps/frontend/dist/mecanico/    # Mechanic PWA
ls apps/frontend/dist/icons/       # Ícones
```

### 2. Build da Imagem Docker

```bash
# Build da imagem
docker build -f Dockerfile.vps -t moria-vps:latest .

# Verificar validações (Dockerfile verifica automaticamente):
# ✅ Frontend buildado
# ✅ Backend buildado
# ✅ PWAs buildados
# ✅ Ícones copiados
```

### 3. Deploy no Servidor

```bash
# Salvar imagem
docker save moria-vps:latest | gzip > moria-vps.tar.gz

# Upload para servidor
scp moria-vps.tar.gz root@moriapecas.com.br:/root/

# No servidor
ssh root@moriapecas.com.br
docker load < moria-vps.tar.gz
docker stop moria-vps && docker rm moria-vps
docker run -d --name moria-vps \
  --network moria-network \
  -p 3090:3090 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  -e NODE_ENV=production \
  -v /root/uploads:/app/apps/backend/uploads \
  moria-vps:latest

# Verificar logs
docker logs -f moria-vps
```

---

## 🧪 Testar PWA em Produção

### URLs dos Apps PWA

1. **Customer PWA:**
   https://moriapecas.com.br/cliente

2. **Mechanic PWA:**
   https://moriapecas.com.br/mecanico

### Verificar Manifests

```bash
# Customer
curl -I https://moriapecas.com.br/manifest.webmanifest
# Deve retornar: Content-Type: application/manifest+json

# Mechanic
curl -I https://moriapecas.com.br/manifest-mecanico.webmanifest
# Deve retornar: Content-Type: application/manifest+json
```

### Verificar Ícones

```bash
curl -I https://moriapecas.com.br/icons/customer-192.png
# Deve retornar: 200 OK

curl -I https://moriapecas.com.br/icons/mechanic-512.png
# Deve retornar: 200 OK
```

### Testar Banner de Instalação

1. Abrir no celular: https://moriapecas.com.br/cliente/login
2. **Deve aparecer o banner:**
   ```
   ┌─────────────────────────────────────┐
   │ 📱 Instale o app Moria Cliente      │
   │    Acesso rápido e funciona offline │
   │    [⬇ Instalar]  [X Dispensar]     │
   └─────────────────────────────────────┘
   ```

3. **Android Chrome:** Clicar "Instalar" → Prompt nativo
4. **iOS Safari:** Clicar "Ver como" → Modal com instruções

---

## 🔍 Troubleshooting

### Banner não aparece

1. **Verificar no DevTools (F12):**
   ```javascript
   // Console deve mostrar:
   [PWA Install] shouldShowPrompt: true
   ```

2. **Limpar cache:**
   - Acessar: https://moriapecas.com.br/cliente/clear-pwa-cache.html
   - Clicar "Limpar Tudo"
   - Recarregar página

3. **Verificar manifest:**
   ```bash
   curl https://moriapecas.com.br/manifest.webmanifest | python -m json.tool
   ```

### Manifest retorna HTML

❌ **Problema:** `Content-Type: text/html`

✅ **Solução:**
- Verificar se o Dockerfile.vps foi atualizado
- Rebuild da imagem Docker
- Restart do container

### Ícones não carregam (404)

❌ **Problema:** `/icons/customer-192.png` retorna 404

✅ **Solução:**
```bash
# Verificar se os ícones foram copiados no build
ls apps/frontend/dist/icons/

# Se vazio, rodar novamente:
npm run build:docker
```

### Service Worker não registra

❌ **Problema:** Console mostra erro de SW

✅ **Solução:**
- PWA **REQUER HTTPS** em produção
- Verificar se https://moriapecas.com.br está funcionando
- Service Worker não funciona em HTTP (exceto localhost)

---

## 📊 Checklist de Deploy

Antes de fazer deploy, verificar:

- [ ] ✅ `npm run build:docker` rodou sem erros
- [ ] ✅ `apps/frontend/dist/cliente/` existe
- [ ] ✅ `apps/frontend/dist/mecanico/` existe
- [ ] ✅ `apps/frontend/dist/icons/` tem pelo menos 4 PNGs
- [ ] ✅ `apps/frontend/dist/manifest.webmanifest` existe
- [ ] ✅ `apps/frontend/dist/sw.js` existe
- [ ] ✅ `apps/backend/dist/server.js` existe
- [ ] ✅ Docker build passa nas validações
- [ ] ✅ Container inicia sem erros
- [ ] ✅ Backend responde: `curl https://moriapecas.com.br/api/health`
- [ ] ✅ Frontend carrega: `curl https://moriapecas.com.br`
- [ ] ✅ Customer PWA: `curl https://moriapecas.com.br/cliente`
- [ ] ✅ Manifest correto: `curl -I https://moriapecas.com.br/manifest.webmanifest`

---

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. **Testar em dispositivo real** (Android/iOS)
2. **Verificar analytics** de instalações
3. **A/B testing** de mensagens do banner
4. **Otimizar** screenshots para conversão
5. **Adicionar** push notifications (futuro)

---

**Última atualização:** 30 de Novembro de 2025
**Versão:** 2.0.0 (com PWAs integrados)
