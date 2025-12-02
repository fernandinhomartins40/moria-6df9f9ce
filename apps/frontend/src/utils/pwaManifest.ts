/**
 * PWA Manifest Dynamic Injection
 *
 * Injeta o manifest correto baseado na rota atual:
 * - /customer → manifest-customer.webmanifest
 * - /store-panel → manifest-store.webmanifest
 *
 * CRÍTICO: Necessário para beforeinstallprompt funcionar corretamente
 */

export function injectCorrectManifest() {
  const path = window.location.pathname;

  // Determinar qual manifest usar baseado na rota
  let manifestPath = '/manifest-customer.webmanifest'; // default
  let themeColor = '#10b981'; // verde (customer)

  if (path.includes('/store-panel') || path.includes('/mechanic-panel')) {
    manifestPath = '/manifest-store.webmanifest';
    themeColor = '#3b82f6'; // azul (store)
  } else if (path.includes('/customer') || path.includes('/my-account')) {
    manifestPath = '/manifest-customer.webmanifest';
    themeColor = '#10b981'; // verde (customer)
  }

  // Remover manifest existente (do index.html estático)
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (existingManifest) {
    existingManifest.remove();
  }

  // Remover theme-color existente
  const existingThemeColor = document.querySelector('meta[name="theme-color"]');
  if (existingThemeColor) {
    existingThemeColor.remove();
  }

  // Injetar novo manifest
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = manifestPath;
  document.head.appendChild(manifestLink);

  // Injetar theme-color correto
  const themeColorMeta = document.createElement('meta');
  themeColorMeta.name = 'theme-color';
  themeColorMeta.content = themeColor;
  document.head.appendChild(themeColorMeta);

  // PWA manifest injected successfully
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_PWA) {
    console.log('[PWA Manifest] Injected:', {
      path,
      manifest: manifestPath,
      themeColor,
    });
  }

  return { manifestPath, themeColor };
}

/**
 * Registrar service worker com reload automático
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_PWA) {
            console.log('[SW] Service Worker registered successfully:', registration.scope);
          }

          // Auto-update quando novo SW disponível
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_PWA) {
                    console.log('[SW] New service worker available, reloading...');
                  }
                  // Notificar usuário sobre atualização (opcional)
                  if (confirm('Nova versão disponível! Recarregar agora?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
        });

      // Recarregar quando o controller mudar (novo SW ativado)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed, reloading page');
        window.location.reload();
      });
    });
  } else {
    console.warn('[SW] Service Workers not supported in this browser');
  }
}
