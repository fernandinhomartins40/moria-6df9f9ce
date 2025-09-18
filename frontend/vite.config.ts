import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Importação condicional do lovable-tagger para evitar problemas em Docker/Produção
let componentTagger: any = null;
try {
  if (process.env.NODE_ENV !== 'production') {
    ({ componentTagger } = require("lovable-tagger"));
  }
} catch (error) {
  // lovable-tagger não disponível (ambiente Docker/CI/Produção)
  console.warn('lovable-tagger não disponível:', error.message);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production' || process.env.NODE_ENV === 'production';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      !isProduction && componentTagger && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
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
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
            utils: ['clsx', 'class-variance-authority', 'tailwind-merge']
          }
        },
      },
      // Limpar dist antes de cada build
      emptyOutDir: true,
      // Aumentar limite para evitar warnings
      chunkSizeWarningLimit: 1000,
      // Configurações específicas para produção
      ...(isProduction && {
        minify: 'esbuild',
        sourcemap: false,
        cssCodeSplit: true,
      }),
    },
    // Configurações de base para produção
    base: '/',
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});