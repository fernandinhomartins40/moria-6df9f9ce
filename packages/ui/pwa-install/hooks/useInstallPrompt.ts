import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      console.log('[useInstallPrompt] beforeinstallprompt evento recebido!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    console.log('[useInstallPrompt] Listener beforeinstallprompt registrado');

    // Detectar se já está instalado
    const installedHandler = () => {
      console.log('[useInstallPrompt] App instalado! (appinstalled event)');
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    console.log('[useInstallPrompt] promptInstall chamado', {
      hasDeferredPrompt: !!deferredPrompt,
    });

    if (!deferredPrompt) {
      console.warn('[useInstallPrompt] Nenhum deferredPrompt disponível! beforeinstallprompt não foi disparado.');
      return false;
    }

    try {
      console.log('[useInstallPrompt] Mostrando prompt de instalação...');

      // CRÍTICO: prompt() só pode ser chamado UMA VEZ por evento!
      // Guardar referência local antes de chamar prompt()
      const promptEvent = deferredPrompt;

      await promptEvent.prompt();

      console.log('[useInstallPrompt] Aguardando resposta do usuário...');
      const { outcome } = await promptEvent.userChoice;
      console.log('[useInstallPrompt] Resposta do usuário:', outcome);

      // ⚠️ SEMPRE limpar deferredPrompt após usar (sucesso ou falha)
      // O evento só pode ser usado UMA VEZ
      setDeferredPrompt(null);

      if (outcome === 'accepted') {
        console.log('[useInstallPrompt] ✅ Usuário aceitou a instalação!');
        setIsInstallable(false);
        return true;
      }

      console.log('[useInstallPrompt] ❌ Usuário recusou a instalação');
      // Manter isInstallable true - novo beforeinstallprompt virá depois
      return false;
    } catch (error) {
      console.error('[useInstallPrompt] Erro ao mostrar prompt de instalação:', error);
      // Limpar deferredPrompt em caso de erro também
      setDeferredPrompt(null);
      return false;
    }
  };

  return {
    isInstallable,
    promptInstall,
  };
}
