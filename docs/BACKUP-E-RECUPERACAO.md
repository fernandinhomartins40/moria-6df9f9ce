# 📦 Sistema de Backup e Recuperação de Imagens - Moria

## 🎯 Visão Geral

Este documento descreve o **sistema completo de backup automático e recuperação** de imagens implementado para garantir a segurança e integridade dos arquivos de produtos.

**Versão**: 2.0
**Data**: 2025-01-19
**Status**: ✅ Implementado e Ativo

---

## 🏗️ Arquitetura do Sistema

### **Componentes**

```
┌─────────────────────────────────────────────────────────┐
│                    Sistema de Backup                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Backup Automático (Diário - 3h)                   │
│     └─ auto-backup-uploads.sh                         │
│                                                         │
│  2. Monitoramento (A cada 6h)                         │
│     └─ monitor-uploads.sh                             │
│                                                         │
│  3. Verificação Pré-Deploy                            │
│     └─ pre-deploy-check.sh                            │
│                                                         │
│  4. Restauração Avançada                              │
│     └─ restore-uploads-advanced.sh                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Fluxo de Proteção**

```
Upload de Imagem → Volume Docker → Backup Diário → Armazenamento Seguro
                         ↓              ↓                    ↓
                   Monitoramento    Validação         Retenção 7 dias
                    (6 em 6h)      Integridade
```

---

## 📜 Scripts Disponíveis

### **1. auto-backup-uploads.sh** - Backup Automático

**Localização**: `scripts/auto-backup-uploads.sh`

**Função**: Cria backup diário das imagens de produtos

**Características**:
- ✅ Executa automaticamente via cron às 3h da manhã
- ✅ Mantém os últimos 7 backups (1 semana)
- ✅ Valida integridade do backup criado
- ✅ Registra tudo em log detalhado
- ✅ Alerta se disco estiver acima de 80%
- ✅ Remove backups antigos automaticamente

**Localização dos Backups**:
```
/root/moria-backups/uploads/
├── uploads_20250119_030001.tar.gz  (mais recente)
├── uploads_20250118_030001.tar.gz
├── uploads_20250117_030001.tar.gz
└── ... (até 7 backups)
```

**Log**: `/var/log/moria-backup.log`

**Uso Manual**:
```bash
# Executar backup manualmente
/root/moria/scripts/auto-backup-uploads.sh

# Ver log
tail -50 /var/log/moria-backup.log
```

---

### **2. monitor-uploads.sh** - Monitoramento Contínuo

**Localização**: `scripts/monitor-uploads.sh`

**Função**: Monitora a integridade do volume de uploads

**Características**:
- ✅ Executa a cada 6 horas via cron
- ✅ Detecta perda de arquivos
- ✅ Alerta sobre redução de tamanho do volume
- ✅ Verifica últimas modificações
- ✅ Monitora espaço em disco
- ✅ Valida acessibilidade do volume

**O que é monitorado**:
1. Existência do volume Docker
2. Contagem de arquivos (detecta perdas)
3. Tamanho do volume (detecta corrupção)
4. Arquivos modificados nas últimas 24h
5. Status dos containers
6. Espaço em disco disponível
7. Idade do último backup

**Log**: `/var/log/moria-monitor.log`

**Uso Manual**:
```bash
# Executar monitoramento manualmente
/root/moria/scripts/monitor-uploads.sh

# Ver log
tail -50 /var/log/moria-monitor.log

# Ver apenas alertas
grep "ALERTA" /var/log/moria-monitor.log
```

---

### **3. pre-deploy-check.sh** - Verificação Pré-Deploy

**Localização**: `scripts/pre-deploy-check.sh`

**Função**: Valida estado do sistema antes de cada deploy

**Características**:
- ✅ Executa automaticamente antes de cada deploy
- ✅ Verifica existência do volume
- ✅ Conta arquivos no volume
- ✅ Valida último backup
- ✅ Checa espaço em disco
- ✅ Verifica configuração do docker-compose
- ✅ Bloqueia deploy se houver erros críticos

**Verificações Realizadas**:

| # | Verificação | Tipo | Ação se Falhar |
|---|-------------|------|----------------|
| 1 | Volume existe | ❌ Crítico | Bloqueia deploy |
| 2 | Contagem de arquivos | ⚠️ Aviso | Continua |
| 3 | Backup recente existe | ⚠️ Aviso | Continua |
| 4 | Espaço em disco > 5GB | ❌ Crítico | Bloqueia deploy |
| 5 | Containers configurados | ⚠️ Aviso | Continua |
| 6 | docker-compose.yml válido | ❌ Crítico | Bloqueia deploy |

**Uso Manual**:
```bash
# Executar verificação
/root/moria/scripts/pre-deploy-check.sh

# Ver apenas erros
/root/moria/scripts/pre-deploy-check.sh 2>&1 | grep -E "❌|⚠️"
```

---

### **4. restore-uploads-advanced.sh** - Restauração Avançada

**Localização**: `scripts/restore-uploads-advanced.sh`

**Função**: Restaura imagens de um backup com segurança máxima

**Características**:
- ✅ Valida integridade do backup antes de restaurar
- ✅ Cria backup de segurança dos arquivos atuais
- ✅ Para containers antes da restauração
- ✅ Limpa volume completamente
- ✅ Restaura arquivos do backup
- ✅ Valida restauração
- ✅ Ajusta permissões
- ✅ Reinicia containers automaticamente

**Uso**:
```bash
# Listar backups disponíveis
/root/moria/scripts/restore-uploads-advanced.sh

# Restaurar backup específico
/root/moria/scripts/restore-uploads-advanced.sh /root/moria-backups/uploads/uploads_20250119_030001.tar.gz

# Restaurar último backup
LAST_BACKUP=$(ls -t /root/moria-backups/uploads/uploads_*.tar.gz | head -1)
/root/moria/scripts/restore-uploads-advanced.sh $LAST_BACKUP
```

**⚠️ IMPORTANTE**: Este script:
- Pede confirmação antes de executar
- Cria backup de segurança automático
- Para e reinicia containers
- Pode levar alguns minutos para concluir

---

## ⚙️ Configuração de Cron Jobs

### **Instalação Inicial**

**No servidor VPS, execute uma única vez**:

```bash
cd /root/moria
chmod +x scripts/setup-cron.sh
./scripts/setup-cron.sh
```

Este script irá:
1. ✅ Verificar se todos os scripts existem
2. ✅ Tornar scripts executáveis
3. ✅ Instalar cron jobs
4. ✅ Reiniciar serviço cron
5. ✅ Opcionalmente testar backup

### **Cron Jobs Instalados**

#### **Backup Diário**
```cron
# Arquivo: /etc/cron.d/moria-backup
0 3 * * * root /root/moria/scripts/auto-backup-uploads.sh
```
- Executa todo dia às 3h da manhã
- Horário escolhido por ser de baixo tráfego

#### **Monitoramento a cada 6 horas**
```cron
# Arquivo: /etc/cron.d/moria-monitor
0 */6 * * * root /root/moria/scripts/monitor-uploads.sh
```
- Executa às 0h, 6h, 12h e 18h
- Detecta problemas rapidamente

### **Verificar Cron Jobs Ativos**

```bash
# Listar todos os cron jobs
crontab -l

# Ver logs do cron
tail -f /var/log/syslog | grep CRON

# Verificar próximas execuções
grep moria /etc/cron.d/*
```

---

## 📊 Logs e Monitoramento

### **Logs Disponíveis**

| Log | Localização | Conteúdo | Rotação |
|-----|-------------|----------|---------|
| Backup | `/var/log/moria-backup.log` | Histórico de backups | Manual |
| Monitoramento | `/var/log/moria-monitor.log` | Verificações de integridade | Manual |

### **Comandos Úteis**

```bash
# Ver últimas 50 linhas do log de backup
tail -50 /var/log/moria-backup.log

# Ver apenas backups bem-sucedidos
grep "✅" /var/log/moria-backup.log

# Ver alertas e erros
grep -E "❌|⚠️" /var/log/moria-backup.log

# Acompanhar log em tempo real
tail -f /var/log/moria-monitor.log

# Ver resumo de todos os backups criados
grep "Backup criado com sucesso" /var/log/moria-backup.log

# Ver histórico de contagem de arquivos
grep "Arquivos para backup:" /var/log/moria-backup.log

# Detectar perdas de arquivos
grep "Perda de" /var/log/moria-monitor.log
```

---

## 🆘 Cenários de Recuperação

### **Cenário 1: Imagens Sumiram Após Deploy**

**Sintoma**: Site não mostra imagens de produtos

**Diagnóstico**:
```bash
# 1. Verificar se volume existe
docker volume ls | grep uploads_data

# 2. Verificar arquivos no volume
docker run --rm -v moria-6df9f9ce_uploads_data:/data:ro alpine:latest \
  find /data/products -type f | wc -l

# 3. Ver último backup
ls -lht /root/moria-backups/uploads/ | head -5
```

**Solução**:
```bash
# Restaurar do último backup
cd /root/moria
./scripts/restore-uploads-advanced.sh \
  /root/moria-backups/uploads/uploads_YYYYMMDD_HHMMSS.tar.gz
```

---

### **Cenário 2: Volume Foi Deletado Acidentalmente**

**Sintoma**: `docker volume ls` não mostra o volume

**Solução**:
```bash
# 1. Recriar volume
docker volume create moria-6df9f9ce_uploads_data

# 2. Restaurar do backup
cd /root/moria
./scripts/restore-uploads-advanced.sh \
  $(ls -t /root/moria-backups/uploads/uploads_*.tar.gz | head -1)

# 3. Reiniciar containers
docker-compose -f docker-compose.vps.yml up -d
```

---

### **Cenário 3: Disco Cheio**

**Sintoma**: Logs mostram "ALERTA CRÍTICO: Disco quase cheio"

**Diagnóstico**:
```bash
# Ver uso de disco
df -h

# Ver tamanho dos backups
du -sh /root/moria-backups/uploads/

# Ver tamanho do volume
docker system df -v | grep uploads_data
```

**Solução**:
```bash
# Limpar backups antigos (mantém últimos 3)
cd /root/moria-backups/uploads
ls -t uploads_*.tar.gz | tail -n +4 | xargs rm -f

# Limpar containers e imagens antigas
docker system prune -af

# Limpar volumes não utilizados (CUIDADO!)
docker volume prune  # Confirme que não vai deletar volumes importantes
```

---

### **Cenário 4: Backup Corrompido**

**Sintoma**: Erro ao tentar restaurar backup

**Diagnóstico**:
```bash
# Testar integridade do backup
tar -tzf /root/moria-backups/uploads/uploads_YYYYMMDD_HHMMSS.tar.gz

# Se retornar erro, backup está corrompido
```

**Solução**:
```bash
# Usar backup anterior
ls -lht /root/moria-backups/uploads/ | head -10

# Restaurar do segundo backup mais recente
./scripts/restore-uploads-advanced.sh \
  $(ls -t /root/moria-backups/uploads/uploads_*.tar.gz | head -2 | tail -1)
```

---

### **Cenário 5: Perda de Arquivos Detectada**

**Sintoma**: Log de monitoramento mostra "Perda de X arquivos"

**Diagnóstico**:
```bash
# Ver log de monitoramento
grep "Perda de" /var/log/moria-monitor.log | tail -5

# Ver contagem atual
docker run --rm -v moria-6df9f9ce_uploads_data:/data:ro alpine:latest \
  find /data/products -type f | wc -l
```

**Solução**:
```bash
# 1. Identificar quando ocorreu a perda
grep "Contagem" /var/log/moria-monitor.log | tail -20

# 2. Restaurar do backup anterior à perda
./scripts/restore-uploads-advanced.sh \
  /root/moria-backups/uploads/uploads_BACKUP_ANTES_DA_PERDA.tar.gz

# 3. Investigar causa (verificar logs do container)
docker logs moria-vps | grep -i "delete\|remove"
```

---

## 🔒 Boas Práticas

### **DO's ✅**

1. **Sempre use os scripts fornecidos**
   - Eles têm validações e proteções embutidas

2. **Verifique logs regularmente**
   ```bash
   # Verificar semanalmente
   tail -100 /var/log/moria-backup.log
   tail -100 /var/log/moria-monitor.log
   ```

3. **Teste restauração periodicamente**
   ```bash
   # Testar em ambiente de desenvolvimento/staging
   ./scripts/restore-uploads-advanced.sh <backup>
   ```

4. **Mantenha espaço em disco adequado**
   - Mínimo 10GB livres
   - Monitore uso com `df -h`

5. **Documente mudanças**
   - Se modificar scripts, atualize este documento

### **DON'Ts ❌**

1. **NUNCA use `docker-compose down -v`**
   - Remove volumes e apaga todas as imagens
   - Use apenas `docker-compose down`

2. **NUNCA delete manualmente o volume**
   ```bash
   # ❌ ERRADO
   docker volume rm moria-6df9f9ce_uploads_data
   ```

3. **NUNCA delete todos os backups**
   - Sempre mantenha pelo menos 3 backups

4. **NUNCA execute `docker volume prune` sem verificar**
   - Pode deletar volumes em uso

5. **NUNCA modifique arquivos diretamente no volume**
   - Use sempre as APIs da aplicação

---

## 📈 Estatísticas e Métricas

### **Como Obter Estatísticas**

```bash
# Total de backups criados
grep -c "Backup criado com sucesso" /var/log/moria-backup.log

# Tamanho médio dos backups
du -sh /root/moria-backups/uploads/*.tar.gz | awk '{print $1}'

# Histórico de contagem de arquivos
grep "Arquivos para backup:" /var/log/moria-backup.log | tail -30

# Crescimento do volume
grep "Tamanho do volume:" /var/log/moria-monitor.log | tail -20

# Alertas gerados
grep -c "ALERTA" /var/log/moria-monitor.log
```

---

## 🔧 Manutenção

### **Manutenção Semanal** (5 minutos)

```bash
# 1. Verificar logs
tail -50 /var/log/moria-backup.log
tail -50 /var/log/moria-monitor.log

# 2. Verificar espaço em disco
df -h

# 3. Contar backups
ls -1 /root/moria-backups/uploads/ | wc -l

# 4. Validar último backup
tar -tzf $(ls -t /root/moria-backups/uploads/*.tar.gz | head -1) >/dev/null
```

### **Manutenção Mensal** (15 minutos)

```bash
# 1. Testar restauração (em staging)
./scripts/restore-uploads-advanced.sh <último-backup>

# 2. Limpar logs antigos (se > 100MB)
LOG_SIZE=$(du -m /var/log/moria-backup.log | cut -f1)
if [ "$LOG_SIZE" -gt 100 ]; then
  tail -10000 /var/log/moria-backup.log > /tmp/backup.log
  mv /tmp/backup.log /var/log/moria-backup.log
fi

# 3. Verificar cron jobs ativos
systemctl status cron
grep moria /etc/cron.d/*
```

---

## 📞 Suporte e Troubleshooting

### **Checklist de Diagnóstico**

Antes de pedir ajuda, execute:

```bash
# 1. Verificar volume
docker volume ls | grep uploads_data

# 2. Verificar arquivos
docker run --rm -v moria-6df9f9ce_uploads_data:/data:ro alpine:latest \
  ls -lh /data/products | head -10

# 3. Verificar backups
ls -lht /root/moria-backups/uploads/ | head -5

# 4. Verificar espaço
df -h

# 5. Verificar containers
docker ps -a | grep moria

# 6. Verificar logs
tail -50 /var/log/moria-backup.log
tail -50 /var/log/moria-monitor.log
```

### **Comandos de Debug**

```bash
# Inspecionar volume
docker volume inspect moria-6df9f9ce_uploads_data

# Entrar no container
docker exec -it moria-vps /bin/sh
ls -la /app/apps/backend/uploads/products/

# Ver permissões
docker exec moria-vps ls -la /app/apps/backend/uploads/

# Testar criação de arquivo
docker exec moria-vps touch /app/apps/backend/uploads/test.txt
```

---

## 📝 Changelog

### **Versão 2.0** (2025-01-19)
- ✅ Implementado sistema completo de backup automático
- ✅ Criado monitoramento a cada 6 horas
- ✅ Adicionado verificação pré-deploy
- ✅ Criado script de restauração avançada
- ✅ Configurado cron jobs automáticos
- ✅ Integrado no workflow de deploy
- ✅ Documentação completa criada

### **Versão 1.0** (2025-01-18)
- Scripts manuais básicos de backup e restore
- Documentação inicial

---

## 🎯 Próximos Passos (Futuro)

### **Melhorias Planejadas**

1. **Backup Remoto Automático**
   - Copiar backups para servidor secundário via rsync
   - Implementar em caso de crescimento

2. **Alertas por Email/Webhook**
   - Notificar em caso de erros críticos
   - Integrar com serviço de monitoramento

3. **Dashboard de Métricas**
   - Interface web para visualizar estatísticas
   - Gráficos de crescimento e uso

4. **Compressão Incremental**
   - Backups incrementais para economizar espaço
   - Apenas arquivos modificados

5. **Migração para S3/Cloud** (se necessário)
   - Avaliar quando volume ultrapassar 50GB
   - Apenas se custo/benefício compensar

---

**Última Atualização**: 2025-01-19
**Mantenedor**: Sistema de Deploy Automatizado
**Versão do Documento**: 2.0
