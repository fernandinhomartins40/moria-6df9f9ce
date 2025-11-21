import { useState, useEffect } from 'react';

export type Platform = 'android' | 'ios' | 'desktop' | 'unknown';
export type Browser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'other';

export interface DeviceInfo {
  platform: Platform;
  browser: Browser;
  isStandalone: boolean;
  canInstall: boolean;
  installMethod: 'native' | 'manual' | 'unsupported';
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'unknown',
    browser: 'other',
    isStandalone: false,
    canInstall: false,
    installMethod: 'unsupported',
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Detectar plataforma
    let platform: Platform = 'unknown';
    if (/android/.test(userAgent)) {
      platform = 'android';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      platform = 'ios';
    } else if (/windows|mac|linux/.test(userAgent)) {
      platform = 'desktop';
    }

    // Detectar browser
    let browser: Browser = 'other';
    if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      browser = 'safari';
    } else if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) {
      browser = 'chrome';
    } else if (/firefox/.test(userAgent)) {
      browser = 'firefox';
    } else if (/edg/.test(userAgent)) {
      browser = 'edge';
    } else if (/samsungbrowser/.test(userAgent)) {
      browser = 'samsung';
    }

    // Determinar método de instalação
    let installMethod: 'native' | 'manual' | 'unsupported' = 'unsupported';
    let canInstall = false;

    if (platform === 'android' && !isStandalone) {
      installMethod = 'native'; // beforeinstallprompt
      canInstall = true;
    } else if (platform === 'ios' && browser === 'safari' && !isStandalone) {
      installMethod = 'manual'; // Share menu
      canInstall = true;
    }

    setDeviceInfo({
      platform,
      browser,
      isStandalone,
      canInstall,
      installMethod,
    });
  }, []);

  return deviceInfo;
}
