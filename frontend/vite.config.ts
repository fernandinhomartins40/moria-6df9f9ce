import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Garantir cache-busting com hash nos filenames
      rollupOptions: {
        // Adicionar externalização explícita para evitar erros
        external: [],
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
          },
          // Adicionar tratamento para warnings de externalização
          hoistTransitiveImports: false,
        },
        onwarn(warning, warn) {
          // Suprimir warnings específicos de externalização que não afetam o funcionamento
          if (warning.code === 'MISSING_NODE_BUILTINS') {
            return;
          }
          // Usar o handler padrão para outros warnings
          warn(warning);
        }
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