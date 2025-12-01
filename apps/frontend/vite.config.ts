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
      // USAR SERVICE WORKER CUSTOMIZADO (com fetch handler obrigatório para beforeinstallprompt)
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'logo_moria.png',
        'robots.txt',
        'icons/**/*.png',
        'screenshots/*.png',
        'manifest-customer.webmanifest',
        'manifest-store.webmanifest'
      ],
      manifest: false, // Não gerar manifest automático, usamos os manuais
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/node_modules/**', '**/dev-dist/**'],
      },
      devOptions: {
        enabled: true,
        type: 'classic', // classic para service worker customizado
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
