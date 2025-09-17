@echo off
REM ========================================
REM DEBUG DEPLOY SCRIPT - MORIA (WINDOWS)
REM Investigação direta no VPS via SSH
REM ========================================

set VPS_HOST=72.60.10.108
set VPS_USER=root
set APP_DIR=/root/moria-pecas-servicos

echo 🔍 === INICIANDO DEBUG NO VPS ===
echo 📡 Conectando ao VPS: %VPS_HOST%

REM Solicitar senha
set /p VPS_PASSWORD=Digite a senha do VPS:

echo 🔧 Executando debug direto no VPS...

sshpass -p "%VPS_PASSWORD%" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null %VPS_USER%@%VPS_HOST% "cd /root/moria-pecas-servicos && echo '=== LOGS DO BACKEND ===' && docker compose -p moria logs backend --tail 50 && echo '' && echo '=== STATUS CONTAINERS ===' && docker compose -p moria ps && echo '' && echo '=== TESTANDO HEALTH CHECK ===' && docker exec moria-backend curl -f http://localhost:3001/api/health 2>&1 || echo 'Health check falhou' && echo '' && echo '=== VERIFICANDO PROCESSO NODE ===' && docker exec moria-backend ps aux | grep node || echo 'Processo node não encontrado'"

pause