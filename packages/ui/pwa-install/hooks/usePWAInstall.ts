import { useState, useEffect } from 'react';
import { useDeviceDetection } from './useDeviceDetection';
import { useInstallPrompt } from './useInstallPrompt';
import { useDevMode } from './useDevMode';

const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

// Função helper para obter chave de storage baseada na URL
function getStorageKey(): string {
  if (typeof window === 'undefined') return 'pwa-install-dismissed';

  const path = window.location.pathname;

  if (path.includes('/customer') || path.includes('/my-account')) {
    return 'pwa-install-dismissed-customer';
  } else if (path.includes('/store-panel') || path.includes('/mechanic-panel')) {
    return 'pwa-install-dismissed-store';
  }

  return 'pwa-install-dismissed';
}

export function usePWAInstall() {
  const deviceInfo = useDeviceDetection();
  const { isInstallable, promptInstall } = useInstallPrompt();
  const { isDevMode } = useDevMode();
  const [isDismissed, setIsDismissed] = useState(false);
  const storageKey = getStorageKey();

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();

      if (now - dismissedTime < DISMISS_DURATION) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  const shouldShowPrompt = !deviceInfo.isStandalone && !isDismissed;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, Date.now().toString());
    setIsDismissed(true);
  };

  const handleInstall = async (): Promise<boolean> => {
    // Funciona em Android E Desktop (Chrome/Edge)
    if ((deviceInfo.platform === 'android' || deviceInfo.platform === 'desktop') && isInstallable) {
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
