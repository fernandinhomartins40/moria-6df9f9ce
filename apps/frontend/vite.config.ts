import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
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
