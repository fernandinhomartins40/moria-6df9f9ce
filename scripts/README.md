# 🛠️ Scripts de Gerenciamento - Moria

## Scripts Disponíveis

### 📋 verify-volumes.sh
Verifica o status dos volumes Docker e conta arquivos de upload.

```bash
chmod +x scripts/verify-volumes.sh
./scripts/verify-volumes.sh
```

**Use quando:**
- Quiser verificar se as imagens estão sendo preservadas
- Após um deploy para confirmar que nada foi perdido
- Para diagnóstico de problemas

---

### 💾 backup-uploads.sh
Cria backup compactado de todas as imagens de produtos.

```bash
chmod +x scripts/backup-uploads.sh
./scripts/backup-uploads.sh
```

**Use quando:**
- Antes de deploys importantes
- Semanalmente (recomendado via cron)
- Antes de qualquer manutenção no servidor

**Output:** `./backups/uploads_backup_YYYYMMDD_HHMMSS.tar.gz`

---

### ♻️ restore-uploads.sh
Restaura imagens de um backup anterior.

```bash
chmod +x scripts/restore-uploads.sh
./scripts/restore-uploads.sh ./backups/uploads_backup_20250119_143022.tar.gz
```

**Use quando:**
- Imagens foram perdidas acidentalmente
- Precisa reverter para estado anterior
- Após erro em deploy

⚠️ **Atenção:** Cria backup de segurança antes de restaurar!

---

## 🚀 Uso Rápido

```bash
# Verificar se está tudo ok
./scripts/verify-volumes.sh

# Fazer backup antes de deploy
./scripts/backup-uploads.sh

# Restaurar se algo deu errado
./scripts/restore-uploads.sh ./backups/uploads_backup_XXXXX.tar.gz
```

## 📚 Documentação Completa

Veja [docs/VOLUMES-E-IMAGENS.md](../docs/VOLUMES-E-IMAGENS.md) para:
- Arquitetura completa do sistema
- Diagnóstico de problemas
- Estratégias de backup
- Configuração de backup automático
- Migração para cloud storage

---

**Nota:** Todos os scripts requerem que o Docker esteja rodando e o container `moria-vps` esteja ativo.
