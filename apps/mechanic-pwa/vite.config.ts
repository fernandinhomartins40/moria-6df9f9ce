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
        id: 'mechanic-app',
        name: 'Moria - Painel do Mecânico',
        short_name: 'Moria Mecânico',
        description: 'Gestão de ordens de serviço e atendimentos náuticos',
        start_url: '/mecanico',
        scope: '/mecanico/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/icons/mechanic-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/mechanic-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Nova OS',
            short_name: 'Nova OS',
            description: 'Criar nova ordem de serviço',
            url: '/mecanico/os/nova',
            icons: [{ src: '/icons/new-os.png', sizes: '96x96' }]
          },
          {
            name: 'Agenda',
            short_name: 'Agenda',
            description: 'Ver agenda de atendimentos',
            url: '/mecanico/agenda',
            icons: [{ src: '/icons/calendar.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.moria\.app\/api\/orders.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mechanic-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/.*\.moria\.app\/api\/customers.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mechanic-customers-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 12 // 12 horas
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mechanic-images-cache',
              expiration: {
                maxEntries: 100,
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
      '@': path.resolve(__dirname, './src'),
      '@moria/ui': path.resolve(__dirname, '../../packages/ui')
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
