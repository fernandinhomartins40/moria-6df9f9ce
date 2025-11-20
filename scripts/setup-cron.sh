#!/bin/bash

# Script de Configuração de Cron Jobs
# Moria Peças e Serviços
# Instala os cron jobs no servidor

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "======================================"
echo "⚙️  Configuração de Cron Jobs - Moria"
echo "======================================"
echo ""

# Verificar se está executando como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Este script precisa ser executado como root${NC}"
  echo "   Execute: sudo $0"
  exit 1
fi

# Verificar se os scripts existem
echo -e "${BLUE}[1/4]${NC} Verificando scripts..."
SCRIPTS=(
  "/root/moria/scripts/auto-backup-uploads.sh"
  "/root/moria/scripts/monitor-uploads.sh"
)

for script in "${SCRIPTS[@]}"; do
  if [ -f "$script" ]; then
    echo -e "${GREEN}✅${NC} $(basename $script)"
  else
    echo -e "${RED}❌ Script não encontrado: $script${NC}"
    exit 1
  fi
done
echo ""

# Tornar scripts executáveis
echo -e "${BLUE}[2/4]${NC} Tornando scripts executáveis..."
chmod +x /root/moria/scripts/auto-backup-uploads.sh
chmod +x /root/moria/scripts/monitor-uploads.sh
chmod +x /root/moria/scripts/pre-deploy-check.sh
chmod +x /root/moria/scripts/restore-uploads-advanced.sh
echo -e "${GREEN}✅ Permissões configuradas${NC}"
echo ""

# Instalar cron jobs
echo -e "${BLUE}[3/4]${NC} Instalando cron jobs..."

# Backup diário
if [ -f "/root/moria/scripts/cron/moria-backup.cron" ]; then
  cp /root/moria/scripts/cron/moria-backup.cron /etc/cron.d/moria-backup
  chmod 644 /etc/cron.d/moria-backup
  echo -e "${GREEN}✅${NC} Backup diário instalado (3h da manhã)"
else
  echo -e "${RED}❌ Arquivo moria-backup.cron não encontrado${NC}"
  exit 1
fi

# Monitoramento a cada 6 horas
if [ -f "/root/moria/scripts/cron/moria-monitor.cron" ]; then
  cp /root/moria/scripts/cron/moria-monitor.cron /etc/cron.d/moria-monitor
  chmod 644 /etc/cron.d/moria-monitor
  echo -e "${GREEN}✅${NC} Monitoramento instalado (a cada 6 horas)"
else
  echo -e "${RED}❌ Arquivo moria-monitor.cron não encontrado${NC}"
  exit 1
fi
echo ""

# Reiniciar cron
echo -e "${BLUE}[4/4]${NC} Reiniciando serviço cron..."
systemctl restart cron || systemctl restart crond || service cron restart
echo -e "${GREEN}✅ Serviço cron reiniciado${NC}"
echo ""

# Listar cron jobs instalados
echo "======================================"
echo "📋 Cron Jobs Instalados"
echo "======================================"
echo ""
echo "Backup automático:"
cat /etc/cron.d/moria-backup
echo ""
echo "Monitoramento:"
cat /etc/cron.d/moria-monitor
echo ""

# Testar backup manual
echo "======================================"
echo "🧪 Teste Manual (Opcional)"
echo "======================================"
echo ""
read -p "Deseja executar backup manual agora para testar? (s/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo ""
  echo "Executando backup de teste..."
  /root/moria/scripts/auto-backup-uploads.sh
  echo ""
  echo -e "${GREEN}✅ Teste concluído!${NC}"
  echo ""
  echo "Verifique o log:"
  echo "  tail -20 /var/log/moria-backup.log"
fi

echo ""
echo "======================================"
echo "✅ Configuração Concluída"
echo "======================================"
echo ""
echo "📅 Agendamentos ativos:"
echo "  • Backup: Todo dia às 3h da manhã"
echo "  • Monitoramento: A cada 6 horas"
echo ""
echo "📄 Logs:"
echo "  • Backup: /var/log/moria-backup.log"
echo "  • Monitoramento: /var/log/moria-monitor.log"
echo ""
echo "💡 Comandos úteis:"
echo "  • Ver backups: ls -lh /root/moria-backups/uploads/"
echo "  • Ver logs backup: tail -f /var/log/moria-backup.log"
echo "  • Ver logs monitor: tail -f /var/log/moria-monitor.log"
echo "  • Listar cron jobs: crontab -l"
echo ""

exit 0
