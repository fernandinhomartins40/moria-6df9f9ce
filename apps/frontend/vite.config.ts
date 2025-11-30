import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo_moria.png', 'robots.txt', 'icons/*.png', 'screenshots/*.png'],
      manifest: {
        name: 'Moria Peças - Loja e Serviços Náuticos',
        short_name: 'Moria',
        description: 'Loja de peças, serviços náuticos e área do cliente',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        categories: ['shopping', 'lifestyle', 'business'],
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
        screenshots: [
          {
            src: '/screenshots/narrow-1.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/screenshots/wide-1.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@moria/types": path.resolve(__dirname, "../../packages/types/src"),
      "@moria/utils": path.resolve(__dirname, "../../packages/utils/src"),
    },
  },
  build: {
    // Garantir cache-busting com hash nos filenames
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return `assets/[name].[hash].css`;
          }
          return `assets/[name].[hash][extname]`;
        },
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-navigation-menu', '@radix-ui/react-dialog', '@radix-ui/react-toast'],
          'router': ['react-router-dom'],
          'utils': ['clsx', 'tailwind-merge'],
        },
      },
    },
    // Limpar dist antes de cada build
    emptyOutDir: true,
    // Aumentar limite de chunk size warning para 600kB
    chunkSizeWarningLimit: 600,
  },
}));
