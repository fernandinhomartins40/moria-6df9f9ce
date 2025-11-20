# 📜 Scripts de Manutenção - Moria

Este diretório contém todos os scripts de backup, monitoramento e manutenção do sistema de uploads.

## 📁 Estrutura

```
scripts/
├── auto-backup-uploads.sh          # ⭐ Backup automático diário
├── backup-uploads.sh               # Backup manual (legado)
├── monitor-uploads.sh              # ⭐ Monitoramento a cada 6h
├── pre-deploy-check.sh             # ⭐ Verificações pré-deploy
├── restore-uploads.sh              # Restore básico (legado)
├── restore-uploads-advanced.sh     # ⭐ Restore avançado com validações
├── setup-cron.sh                   # ⭐ Instalador de cron jobs
├── setup-dev.sh                    # Setup de desenvolvimento
├── verify-volumes.sh               # Verificação de volumes
└── cron/
    ├── moria-backup.cron           # Configuração do cron de backup
    └── moria-monitor.cron          # Configuração do cron de monitoramento
```

⭐ = Novos scripts do sistema de backup automático v2.0

---

## 🚀 Início Rápido

### **1. Configuração Inicial (Execute uma vez no servidor)**

```bash
cd /root/moria/scripts
chmod +x setup-cron.sh
./setup-cron.sh
```

Isso irá:
- ✅ Tornar todos os scripts executáveis
- ✅ Instalar cron jobs de backup e monitoramento
- ✅ Configurar logs
- ✅ Opcionalmente testar backup

---

## 📝 Scripts Principais

### **⭐ Backup Automático** - `auto-backup-uploads.sh`

```bash
# Executar manualmente
./auto-backup-uploads.sh

# Ver último backup criado
ls -lht /root/moria-backups/uploads/ | head -1

# Ver log
tail -50 /var/log/moria-backup.log
```

**Características**:
- Executa automaticamente todo dia às 3h
- Mantém últimos 7 backups
- Valida integridade
- Alerta se disco > 80%

---

### **⭐ Monitoramento** - `monitor-uploads.sh`

```bash
# Executar manualmente
./monitor-uploads.sh

# Ver log
tail -50 /var/log/moria-monitor.log

# Ver apenas alertas
grep "ALERTA" /var/log/moria-monitor.log
```

**Características**:
- Executa a cada 6 horas
- Detecta perda de arquivos
- Monitora integridade do volume
- Alerta problemas de espaço

---

### **⭐ Verificação Pré-Deploy** - `pre-deploy-check.sh`

```bash
# Executar verificação
./pre-deploy-check.sh

# Integrado automaticamente no workflow de deploy
```

**Características**:
- Executa antes de cada deploy
- Valida volume e backups
- Bloqueia deploy se erros críticos
- Alerta se backup > 2 dias

---

### **⭐ Restauração Avançada** - `restore-uploads-advanced.sh`

```bash
# Listar backups disponíveis
./restore-uploads-advanced.sh

# Restaurar backup específico
./restore-uploads-advanced.sh /root/moria-backups/uploads/uploads_20250119_030001.tar.gz

# Restaurar último backup
LAST_BACKUP=$(ls -t /root/moria-backups/uploads/uploads_*.tar.gz | head -1)
./restore-uploads-advanced.sh $LAST_BACKUP
```

**Características**:
- Valida integridade do backup
- Cria backup de segurança automático
- Para/reinicia containers
- Ajusta permissões

---

### **Scripts Legados** (ainda funcionais)

#### **📋 verify-volumes.sh**
Verifica status dos volumes Docker.

```bash
./verify-volumes.sh
```

#### **💾 backup-uploads.sh**
Backup manual simples.

```bash
./backup-uploads.sh
```

#### **♻️ restore-uploads.sh**
Restore básico.

```bash
./restore-uploads.sh ./backups/uploads_backup_XXXXX.tar.gz
```

---

## 📊 Localização dos Arquivos

### **Backups**
- Diretório: `/root/moria-backups/uploads/`
- Retenção: 7 backups (últimos 7 dias)
- Formato: `uploads_YYYYMMDD_HHMMSS.tar.gz`

### **Logs**
- Backup: `/var/log/moria-backup.log`
- Monitoramento: `/var/log/moria-monitor.log`

### **Cron Jobs**
- Backup: `/etc/cron.d/moria-backup`
- Monitoramento: `/etc/cron.d/moria-monitor`

---

## 🔧 Comandos Úteis

```bash
# Ver todos os backups
ls -lh /root/moria-backups/uploads/

# Contar arquivos no volume
docker run --rm -v moria-6df9f9ce_uploads_data:/data:ro alpine:latest \
  find /data/products -type f | wc -l

# Ver tamanho do volume
docker run --rm -v moria-6df9f9ce_uploads_data:/data:ro alpine:latest \
  du -sh /data

# Validar integridade de um backup
tar -tzf /root/moria-backups/uploads/uploads_YYYYMMDD_HHMMSS.tar.gz >/dev/null

# Ver estatísticas de backups
grep "Backup criado com sucesso" /var/log/moria-backup.log

# Ver histórico de contagem de arquivos
grep "Arquivos para backup:" /var/log/moria-backup.log | tail -30
```

---

## 📖 Documentação Completa

Para documentação detalhada, consulte:

- **[BACKUP-E-RECUPERACAO.md](../docs/BACKUP-E-RECUPERACAO.md)** - ⭐ Guia completo do sistema v2.0
- **[VOLUMES-E-IMAGENS.md](../docs/VOLUMES-E-IMAGENS.md)** - Arquitetura de armazenamento

---

## 🆘 Troubleshooting

### **Problema: Cron jobs não estão executando**

```bash
# Verificar status do cron
systemctl status cron

# Ver logs do cron
tail -f /var/log/syslog | grep CRON

# Reinstalar cron jobs
./setup-cron.sh
```

### **Problema: Backup falhou**

```bash
# Ver erro no log
tail -100 /var/log/moria-backup.log

# Verificar espaço em disco
df -h

# Executar manualmente com output
./auto-backup-uploads.sh
```

### **Problema: Volume não encontrado**

```bash
# Verificar volumes
docker volume ls | grep moria

# Recriar volume
docker volume create moria-6df9f9ce_uploads_data

# Restaurar do backup
./restore-uploads-advanced.sh <backup>
```

---

## 🔒 Permissões

Todos os scripts devem ser executáveis:

```bash
chmod +x scripts/*.sh
```

Cron jobs devem ter permissão 644:

```bash
chmod 644 /etc/cron.d/moria-*
```

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Consulte a [documentação completa](../docs/BACKUP-E-RECUPERACAO.md)
2. Verifique os logs em `/var/log/moria-*.log`
3. Execute o diagnóstico:
   ```bash
   ./pre-deploy-check.sh
   ```

---

**Última Atualização**: 2025-01-19
**Versão**: 2.0
