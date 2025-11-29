import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'robots.txt'],
      manifest: {
        id: 'admin-app',
        name: 'Moria - Admin & Mecânico',
        short_name: 'Moria Admin',
        description: 'Gestão administrativa e mecânica - Moria Peças e Serviços',
        start_url: '/store-panel',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#f97316',
        background_color: '#ffffff',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/icons/admin-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/admin-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Painel Lojista',
            short_name: 'Lojista',
            description: 'Acessar painel administrativo',
            url: '/store-panel',
            icons: [{ src: '/icons/store-96.png', sizes: '96x96' }]
          },
          {
            name: 'Painel Mecânico',
            short_name: 'Mecânico',
            description: 'Acessar painel do mecânico',
            url: '/mechanic-panel',
            icons: [{ src: '/icons/mechanic-96.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.moriapecas\.com\.br\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'admin-api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'admin-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3003,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
