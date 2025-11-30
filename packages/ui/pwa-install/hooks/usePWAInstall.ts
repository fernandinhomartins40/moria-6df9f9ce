import { useState, useEffect } from 'react';
import { useDeviceDetection } from './useDeviceDetection';
import { useInstallPrompt } from './useInstallPrompt';
import { useDevMode } from './useDevMode';

const STORAGE_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export function usePWAInstall() {
  const deviceInfo = useDeviceDetection();
  const { isInstallable, promptInstall } = useInstallPrompt();
  const { isDevMode } = useDevMode();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();

      if (now - dismissedTime < DISMISS_DURATION) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Sempre mostra o banner customizado (exceto se já instalado ou dispensado)
  // NÃO depende de canInstall ou beforeinstallprompt - seguindo melhores práticas web.dev 2025
  const shouldShowPrompt =
    !deviceInfo.isStandalone &&  // Não está instalado
    !isDismissed;                 // Não foi dispensado

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  const handleInstall = async (): Promise<boolean> => {
    if (deviceInfo.platform === 'android' && isInstallable) {
      const success = await promptInstall();
      if (success) {
        handleDismiss();

        // Track installation success
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'pwa_installed', {
            platform: deviceInfo.platform,
            timestamp: new Date().toISOString(),
          });
        }
      }
      return success;
    }
    return false;
  };

  return {
    deviceInfo,
    shouldShowPrompt,
    isInstallable: deviceInfo.platform === 'android' ? isInstallable : true,
    handleInstall,
    handleDismiss,
  };
}
