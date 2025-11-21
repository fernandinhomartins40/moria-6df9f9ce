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
        id: 'customer-app',
        name: 'Moria - Área do Cliente',
        short_name: 'Moria Cliente',
        description: 'Acompanhe seus pedidos e serviços náuticos',
        start_url: '/cliente',
        scope: '/cliente/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#10b981',
        background_color: '#ffffff',
        categories: ['lifestyle', 'shopping'],
        icons: [
          {
            src: '/icons/customer-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/customer-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Meus Pedidos',
            short_name: 'Pedidos',
            description: 'Ver meus pedidos',
            url: '/cliente/pedidos',
            icons: [{ src: '/icons/orders.png', sizes: '96x96' }]
          },
          {
            name: 'Minhas Embarcações',
            short_name: 'Embarcações',
            description: 'Gerenciar embarcações',
            url: '/cliente/embarcacoes',
            icons: [{ src: '/icons/boat.png', sizes: '96x96' }]
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
              cacheName: 'customer-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/.*\.moria\.app\/api\/products.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'customer-products-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 6 // 6 horas
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'customer-images-cache',
              expiration: {
                maxEntries: 150,
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
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
