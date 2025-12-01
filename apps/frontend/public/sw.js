// Service Worker Moria PWA - Customer & Store
// OBRIGATÓRIO: fetch handler para disparar beforeinstallprompt no Chrome

// ⚠️ WORKBOX INJECT POINT - NÃO REMOVER!
// Vite PWA injetará o precache manifest aqui durante o build
const precacheManifest = self.__WB_MANIFEST || [];

const CACHE_NAME = 'moria-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/customer',
  '/store-panel',
  '/manifest-customer.webmanifest',
  '/manifest-store.webmanifest',
  ...precacheManifest.map(entry => typeof entry === 'string' ? entry : entry.url)
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event - caching assets');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache opened, adding assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.error('[SW] Failed to cache assets:', err);
      });
    })
  );
  self.skipWaiting(); // Ativar imediatamente
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event - cleaning up old caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Controlar páginas imediatamente
});

// ⚠️ CRITICAL: Fetch handler - OBRIGATÓRIO para beforeinstallprompt no Chrome
self.addEventListener('fetch', (event) => {
  // Estratégia: Network First com fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response pois só pode ser lido uma vez
        const responseToCache = response.clone();

        // Cachear response se for successful
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Network falhou, tentar cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', event.request.url);
            return cachedResponse;
          }

          // Se não tem cache, retornar página offline básica para navegação
          if (event.request.mode === 'navigate') {
            return new Response(
              `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - Moria Peças</title>
                  <style>
                    body {
                      font-family: system-ui, -apple-system, sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      margin: 0;
                      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                      color: white;
                      text-align: center;
                      padding: 20px;
                    }
                    .offline-container {
                      max-width: 400px;
                    }
                    h1 {
                      font-size: 2.5rem;
                      margin-bottom: 1rem;
                    }
                    p {
                      font-size: 1.1rem;
                      opacity: 0.9;
                      margin-bottom: 2rem;
                    }
                    button {
                      background: white;
                      color: #10b981;
                      border: none;
                      padding: 12px 32px;
                      font-size: 1rem;
                      font-weight: 600;
                      border-radius: 8px;
                      cursor: pointer;
                      transition: transform 0.2s;
                    }
                    button:hover {
                      transform: scale(1.05);
                    }
                  </style>
                </head>
                <body>
                  <div class="offline-container">
                    <h1>📱 Você está offline</h1>
                    <p>Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.</p>
                    <button onclick="window.location.reload()">Tentar novamente</button>
                  </div>
                </body>
              </html>
              `,
              {
                headers: { 'Content-Type': 'text/html' },
              }
            );
          }

          // Para outros requests, retornar erro
          return new Response('Offline - recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Message handler - para comunicação com o app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING received');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    console.log('[SW] CACHE_URLS received:', event.data.urls);
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[SW] Service Worker loaded successfully with fetch handler! 🚀');
