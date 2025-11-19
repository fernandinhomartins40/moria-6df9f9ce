# 📦 Gestão de Volumes e Imagens - Moria

## 🎯 Visão Geral

Este documento explica como o sistema de armazenamento de imagens funciona e como garantir que as imagens de produtos sejam preservadas entre deploys.

## 🏗️ Arquitetura de Armazenamento

### Volumes Docker

O projeto utiliza **Docker Named Volumes** para persistir dados entre deploys:

```yaml
volumes:
  postgres_data:      # Banco de dados PostgreSQL
    driver: local
  uploads_data:       # Imagens de produtos
    driver: local
```

### Estrutura de Diretórios

```
/app/apps/backend/uploads/
├── products/        # Imagens processadas dos produtos (3 tamanhos)
│   ├── [id]-[uuid]-thumb.jpg   # 200x200px
│   ├── [id]-[uuid]-medium.jpg  # 600x600px
│   └── [id]-[uuid]-full.jpg    # 1200x1200px
└── temp/            # Uploads temporários (limpos automaticamente)
```

## 🔒 Proteção de Dados

### ✅ O Que ESTÁ Configurado

1. **Named Volume**: `uploads_data` montado em `/app/apps/backend/uploads`
2. **Persistência**: Volume NÃO é removido durante deploys
3. **Verificação Automática**: Deploy checa se volume existe antes de subir
4. **Exclusão do Rsync**: Diretório `apps/backend/uploads` é excluído do sync (correto!)

### ⚠️ IMPORTANTE - Comandos Proibidos

**NUNCA execute estes comandos em produção:**

```bash
# ❌ ERRADO - Remove volumes e PERDE todas as imagens!
docker-compose -f docker-compose.vps.yml down -v

# ❌ ERRADO - Remove volume específico
docker volume rm moria-6df9f9ce_uploads_data

# ❌ ERRADO - Remove todos os volumes
docker volume prune
```

### ✅ Comandos Seguros

```bash
# ✅ CORRETO - Para containers MAS preserva volumes
docker-compose -f docker-compose.vps.yml down

# ✅ CORRETO - Reinicia sem afetar volumes
docker-compose -f docker-compose.vps.yml restart

# ✅ CORRETO - Atualiza containers preservando volumes
docker-compose -f docker-compose.vps.yml up -d
```

## 🛠️ Scripts de Gerenciamento

### 1. Verificar Volumes

Verifica status dos volumes e conta arquivos:

```bash
chmod +x scripts/verify-volumes.sh
./scripts/verify-volumes.sh
```

**Output esperado:**
```
✓ Volume encontrado: moria-6df9f9ce_uploads_data
  Produtos: 45 arquivo(s)
  Espaço usado: 12MB
```

### 2. Backup de Uploads

Cria backup compactado das imagens:

```bash
chmod +x scripts/backup-uploads.sh
./scripts/backup-uploads.sh
```

**Output:**
```
✅ Backup criado com sucesso!
   Arquivo: ./backups/uploads_backup_20250119_143022.tar.gz
   Tamanho: 12MB
   Arquivos: 45
```

### 3. Restaurar Backup

Restaura imagens de um backup anterior:

```bash
chmod +x scripts/restore-uploads.sh
./scripts/restore-uploads.sh ./backups/uploads_backup_20250119_143022.tar.gz
```

## 🔄 Fluxo de Deploy

### O Que Acontece Durante Deploy

1. **Rsync do Código**
   - Sincroniza código EXCLUINDO `apps/backend/uploads`
   - ✅ Correto! Volume não deve ser sincronizado

2. **Verificação de Volumes**
   - Checa se `uploads_data` existe
   - Mostra localização e status

3. **Stop de Containers**
   - `docker-compose down` SEM `-v`
   - ✅ Volumes preservados!

4. **Build e Start**
   - Nova imagem Docker é criada
   - Container sobe montando volume existente
   - ✅ Imagens antigas permanecem!

5. **Verificação Pós-Deploy**
   - Conta arquivos em `/uploads/products`
   - Confirma que imagens estão acessíveis

## 🔍 Diagnóstico de Problemas

### Problema: Imagens Sumiram Após Deploy

**Passo 1: Verificar se volume existe**
```bash
docker volume ls | grep uploads_data
```

Se não listar nada:
- ❌ Volume foi removido (alguém usou `down -v`)
- Solução: Restaurar do backup

**Passo 2: Verificar se volume está montado**
```bash
docker inspect moria-vps | grep -A 10 Mounts
```

Deve mostrar:
```json
"Mounts": [
  {
    "Type": "volume",
    "Name": "moria-6df9f9ce_uploads_data",
    "Source": "/var/lib/docker/volumes/moria-6df9f9ce_uploads_data/_data",
    "Destination": "/app/apps/backend/uploads"
  }
]
```

**Passo 3: Verificar arquivos dentro do container**
```bash
docker exec moria-vps ls -la /app/apps/backend/uploads/products
```

**Passo 4: Verificar URLs no banco**
```bash
docker exec moria-vps node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findFirst({
  where: { images: { isEmpty: false } },
  select: { name: true, images: true }
}).then(console.log).finally(() => prisma.\$disconnect());
"
```

### Problema: Volume Existe Mas Está Vazio

Possíveis causas:
1. Volume foi recriado (nome mudou)
2. Imagens foram deletadas manualmente
3. Container está montando diretório errado

**Solução:**
```bash
# Restaurar do último backup
./scripts/restore-uploads.sh ./backups/uploads_backup_XXXXX.tar.gz
```

## 📊 Monitoramento

### Verificar Espaço Usado

```bash
# Espaço do volume
docker exec moria-vps du -sh /app/apps/backend/uploads

# Detalhes por diretório
docker exec moria-vps du -h /app/apps/backend/uploads/*
```

### Listar Últimas Imagens Adicionadas

```bash
docker exec moria-vps ls -lht /app/apps/backend/uploads/products | head -10
```

## 🔐 Backup e Recuperação

### Estratégia de Backup Recomendada

**Frequência:**
- Backup automático: Semanal (via cron)
- Backup manual: Antes de deploys grandes

**Retenção:**
- Manter últimos 7 backups semanais
- Manter backup do último mês

### Configurar Backup Automático (Cron)

```bash
# Adicionar ao crontab do servidor VPS
crontab -e

# Backup toda segunda-feira às 3h da manhã
0 3 * * 1 cd /root/moria && ./scripts/backup-uploads.sh

# Limpar backups antigos (manter últimos 7)
0 4 * * 1 cd /root/moria/backups && ls -t uploads_backup_*.tar.gz | tail -n +8 | xargs -r rm
```

## 🚀 Migração para Cloud Storage (Futuro)

Se o projeto crescer e precisar de mais escalabilidade:

### Opções Recomendadas

1. **AWS S3** - Mais completo, CDN integrado
2. **Cloudinary** - Especializado em imagens, otimização automática
3. **DigitalOcean Spaces** - S3-compatible, mais barato

### Vantagens

- ✅ Escalabilidade infinita
- ✅ CDN global (imagens mais rápidas)
- ✅ Backup automático
- ✅ Não depende do servidor
- ✅ Otimização de imagens on-the-fly

### Mudanças Necessárias

1. Atualizar [`upload.middleware.ts`](../apps/backend/src/middleware/upload.middleware.ts)
2. Usar SDK do serviço escolhido
3. Salvar URLs completas no banco
4. Migrar imagens existentes

## 📝 Checklist de Deploy

Antes de cada deploy, verificar:

- [ ] Confirmar que workflow NÃO usa `down -v`
- [ ] Backup foi feito nas últimas 24h
- [ ] Volume `uploads_data` existe e tem dados
- [ ] Espaço em disco suficiente (>20% livre)

Após deploy:

- [ ] Verificar que imagens antigas ainda estão acessíveis
- [ ] Testar upload de nova imagem
- [ ] Confirmar contagem de arquivos não diminuiu

## 🆘 Contatos e Suporte

- **Logs do Deploy**: GitHub Actions > Aba "Actions"
- **Logs do Container**: `docker logs moria-vps`
- **Status dos Volumes**: `./scripts/verify-volumes.sh`

---

**Última atualização**: 2025-01-19
**Versão**: 1.0
**Responsável**: Sistema de Deploy Automatizado
