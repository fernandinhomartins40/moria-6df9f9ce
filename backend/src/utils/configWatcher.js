// ========================================
// CONFIG WATCHER - MORIA BACKEND
// Hot reload de configurações em desenvolvimento
// ========================================

const fs = require('fs');
const path = require('path');
const env = require('../config/environment.js');

class ConfigWatcher {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.envDevPath = path.join(process.cwd(), '.env.development');
    this.isWatching = false;
    this.watchers = new Map();
    this.debounceTimer = null;
    this.debounceDelay = 500; // 500ms debounce
  }

  startWatching() {
    // Apenas em desenvolvimento
    if (!env.isDevelopment()) {
      return;
    }

    console.log('👀 Iniciando monitoramento de configurações...');

    // Lista de arquivos para monitorar
    const filesToWatch = [
      this.envPath,
      this.envDevPath,
      path.join(process.cwd(), 'src', 'config', 'environment.js')
    ];

    filesToWatch.forEach(filePath => {
      this.watchFile(filePath);
    });

    this.isWatching = true;
    console.log(`   📁 Monitorando ${this.watchers.size} arquivos de configuração`);
  }

  watchFile(filePath) {
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return;
    }

    try {
      const watcher = fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
          this.handleConfigChange(filePath, curr, prev);
        }
      });

      this.watchers.set(filePath, watcher);
      console.log(`   👁️ Monitorando: ${path.basename(filePath)}`);
    } catch (error) {
      console.warn(`   ⚠️ Não foi possível monitorar ${filePath}: ${error.message}`);
    }
  }

  handleConfigChange(filePath, curr, prev) {
    const fileName = path.basename(filePath);
    const changeTime = new Date().toLocaleTimeString();

    console.log(`\n🔄 [${changeTime}] Configuração alterada: ${fileName}`);

    // Debounce para evitar múltiplos reloads
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.reloadApplication(filePath);
    }, this.debounceDelay);
  }

  reloadApplication(filePath) {
    const fileName = path.basename(filePath);

    console.log('┌─────────────────────────────────────┐');
    console.log('│      🔄 RELOAD DE CONFIGURAÇÃO      │');
    console.log('├─────────────────────────────────────┤');
    console.log(`│ Arquivo: ${fileName.padEnd(23)} │`);
    console.log(`│ Horário: ${new Date().toLocaleTimeString().padEnd(22)} │`);
    console.log('├─────────────────────────────────────┤');
    console.log('│ Reiniciando servidor...             │');
    console.log('└─────────────────────────────────────┘\n');

    // Análise rápida do que mudou (apenas para arquivos .env)
    if (fileName.includes('.env')) {
      this.analyzeEnvChanges(filePath);
    }

    // Fazer um graceful restart
    this.gracefulRestart();
  }

  analyzeEnvChanges(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line =>
        line.trim() &&
        !line.trim().startsWith('#')
      );

      console.log('📊 Alterações detectadas:');

      // Mostrar apenas as variáveis mais importantes
      const importantVars = [
        'NODE_ENV',
        'PORT',
        'HOST',
        'CORS_ORIGIN',
        'JWT_SECRET',
        'LOG_LEVEL',
        'ENABLE_'
      ];

      const relevantChanges = lines.filter(line => {
        return importantVars.some(varName => line.includes(varName));
      });

      if (relevantChanges.length > 0) {
        relevantChanges.slice(0, 5).forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
            // Mascarar valores sensíveis
            const maskedValue = this.maskSensitiveValue(key.trim(), value.trim());
            console.log(`   • ${key.trim()}: ${maskedValue}`);
          }
        });

        if (relevantChanges.length > 5) {
          console.log(`   • ... e mais ${relevantChanges.length - 5} variáveis`);
        }
      }

    } catch (error) {
      console.log('   ⚠️ Não foi possível analisar as mudanças');
    }
  }

  maskSensitiveValue(key, value) {
    const sensitiveKeys = ['SECRET', 'PASSWORD', 'TOKEN', 'KEY'];
    const isSensitive = sensitiveKeys.some(sensitive =>
      key.toUpperCase().includes(sensitive)
    );

    if (isSensitive && value.length > 4) {
      return value.substring(0, 4) + '*'.repeat(value.length - 4);
    }

    return value;
  }

  gracefulRestart() {
    // Em desenvolvimento, vamos simplesmente sair do processo
    // O nodemon ou pm2 vai reiniciar automaticamente
    console.log('🚀 Reiniciando aplicação...\n');

    // Dar tempo para as mensagens serem exibidas
    setTimeout(() => {
      process.exit(0);
    }, 100);
  }

  stopWatching() {
    if (!this.isWatching) {
      return;
    }

    console.log('🛑 Parando monitoramento de configurações...');

    // Parar todos os watchers
    this.watchers.forEach((watcher, filePath) => {
      try {
        fs.unwatchFile(filePath);
        console.log(`   ✓ Parou monitoramento: ${path.basename(filePath)}`);
      } catch (error) {
        console.warn(`   ⚠️ Erro ao parar ${filePath}: ${error.message}`);
      }
    });

    this.watchers.clear();
    this.isWatching = false;

    // Limpar timer de debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    console.log('✅ Monitoramento parado');
  }

  // Método para recarregar configurações específicas sem restart completo
  async softReload() {
    console.log('🔄 Realizando soft reload das configurações...');

    try {
      // Recarregar variáveis de ambiente
      require('dotenv').config({ override: true });

      // Revalidar configurações
      const validation = env.validate();
      if (!validation.isValid) {
        console.error('❌ Configurações inválidas após reload:', validation.errors);
        return false;
      }

      console.log('✅ Configurações recarregadas com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro no soft reload:', error.message);
      return false;
    }
  }

  // Status do watcher
  getStatus() {
    return {
      isWatching: this.isWatching,
      watchedFiles: Array.from(this.watchers.keys()).map(path => path.basename(path)),
      environment: env.getEnvironment(),
      uptime: process.uptime()
    };
  }

  // Método para adicionar arquivo customizado ao monitoramento
  addWatchFile(filePath) {
    if (!env.isDevelopment()) {
      return false;
    }

    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠️ Arquivo não existe: ${filePath}`);
      return false;
    }

    if (this.watchers.has(filePath)) {
      console.log(`   ℹ️ Arquivo já está sendo monitorado: ${path.basename(filePath)}`);
      return true;
    }

    this.watchFile(filePath);
    return true;
  }

  // Cleanup no processo
  setupProcessHandlers() {
    if (!env.isDevelopment()) {
      return;
    }

    // Parar watchers quando o processo for encerrado
    process.on('SIGTERM', () => this.stopWatching());
    process.on('SIGINT', () => this.stopWatching());
    process.on('exit', () => this.stopWatching());
  }
}

// Export singleton
const configWatcher = new ConfigWatcher();
module.exports = configWatcher;