import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que gerencia qual manifest PWA carregar baseado na rota atual
 */
export function PWAManifest() {
  const location = useLocation();

  useEffect(() => {
    // Determinar qual manifest usar baseado na rota
    const isStorePath = location.pathname.startsWith('/store-panel') ||
                        location.pathname.startsWith('/mechanic-panel');
    const isCustomerPath = location.pathname.startsWith('/customer') ||
                           location.pathname.startsWith('/my-account');

    let manifestPath = '/manifest.webmanifest'; // default

    if (isStorePath) {
      manifestPath = '/manifest-store.webmanifest';
    } else if (isCustomerPath) {
      manifestPath = '/manifest-customer.webmanifest';
    }

    // Procurar por link de manifest existente
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;

    if (!manifestLink) {
      // Criar link se não existir
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }

    // Atualizar o href do manifest
    if (manifestLink.href !== window.location.origin + manifestPath) {
      manifestLink.href = manifestPath;
    }

    // Atualizar theme-color baseado no tipo de PWA
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;

    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }

    themeColorMeta.content = isStorePath ? '#3b82f6' : '#10b981';

  }, [location.pathname]);

  return null; // Este componente não renderiza nada
}
