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
      await deferredPrompt.prompt();

      console.log('[useInstallPrompt] Aguardando resposta do usuário...');
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[useInstallPrompt] Resposta do usuário:', outcome);

      if (outcome === 'accepted') {
        console.log('[useInstallPrompt] ✅ Usuário aceitou a instalação!');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }

      console.log('[useInstallPrompt] ❌ Usuário recusou a instalação');
      return false;
    } catch (error) {
      console.error('[useInstallPrompt] Erro ao mostrar prompt de instalação:', error);
      return false;
    }
  };

  return {
    isInstallable,
    promptInstall,
  };
}
