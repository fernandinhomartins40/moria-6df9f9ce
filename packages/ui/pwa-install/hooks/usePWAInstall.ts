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
    console.log('[PWA Install] Checking dismissed status:', dismissed);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();

      if (now - dismissedTime < DISMISS_DURATION) {
        console.log('[PWA Install] Banner was dismissed recently, hiding');
        setIsDismissed(true);
      } else {
        console.log('[PWA Install] Dismissal expired, removing');
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // SEMPRE mostra o banner (exceto se já instalado ou dispensado)
  // Funciona em: Android, iOS, Desktop (Chrome, Edge, Safari)
  // NÃO depende de beforeinstallprompt - melhores práticas web.dev 2025
  const shouldShowPrompt =
    !deviceInfo.isStandalone &&  // Não está instalado
    !isDismissed;                 // Não foi dispensado

  // Banner aparece SEMPRE que possível - PWA pode ser instalado em qualquer plataforma!

  console.log('[PWA Install] 🎯 Banner Control:', {
    shouldShowPrompt,
    isStandalone: deviceInfo.isStandalone,
    isDismissed,
    platform: deviceInfo.platform,
    browser: deviceInfo.browser,
  });

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
