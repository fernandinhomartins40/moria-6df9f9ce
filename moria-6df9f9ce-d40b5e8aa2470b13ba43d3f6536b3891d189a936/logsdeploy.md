46s
Run echo "🔧 Iniciando deploy COMPLETO do Moria Peças e Serviços..."
🔧 Iniciando deploy COMPLETO do Moria Peças e Serviços...
Commit: b9cc45f8b0e2f4231360b492479ffd961e20c24c
Branch: main
⚠️  REBUILD COMPLETO - TODOS OS ARQUIVOS SERÃO SUBSTITUÍDOS
🔍 Verificando arquivos essenciais...
📋 Arquivos de configuração TypeScript:
-rw-r--r-- 1 runner docker 652 Aug  7 22:48 tsconfig.app.json
-rw-r--r-- 1 runner docker 381 Aug  7 22:48 tsconfig.json
-rw-r--r-- 1 runner docker 481 Aug  7 22:48 tsconfig.node.json
📋 Arquivos principais do projeto:
-rw-r--r-- 1 runner docker 1490 Aug  7 22:48 Dockerfile
-rw-r--r-- 1 runner docker 1412 Aug  7 22:48 nginx.conf
-rw-r--r-- 1 runner docker 3327 Aug  7 22:48 package.json
-rw-r--r-- 1 runner docker 1170 Aug  7 22:48 vite.config.ts
📋 AdminQuotes e AdminSidebar:
ls: cannot access 'src/pages/admin/AdminQuotes.tsx': No such file or directory
ls: cannot access 'src/components/admin/AdminSidebar.tsx': No such file or directory
-rw-r--r-- 1 runner docker 2127 Aug  7 22:48 src/App.tsx
⚠️ Componentes principais faltando
📦 Preparando código...
📤 Enviando para VPS...
Warning: Permanently added '31.97.85.98' (ED25519) to the list of known hosts.
🏗️ Executando deploy COMPLETO na VPS...
📋 Informações do deploy:
  📦 Commit: b9cc45f8b0e2f4231360b492479ffd961e20c24c
  🌿 Branch: main
  👤 Actor: fernandinhomartins40
  🕐 Timestamp: Thu Aug  7 22:48:29 UTC 2025
Warning: Permanently added '31.97.85.98' (ED25519) to the list of known hosts.
🗑️  REMOVENDO TUDO - REBUILD COMPLETO
⏹️  Parando container anterior...
moria-app
moria-app
Untagged: moria-pecas-servicos:latest
Deleted: sha256:770da95103667f300192a020bf934f68176e84ac29833f2a5d307555a1cb2716
🗑️  Removendo diretório anterior COMPLETAMENTE...
📁 Criando diretório limpo...
📦 Extraindo código COMPLETO...
🔍 Verificando arquivos críticos após extração...
📋 Configurações TypeScript:
-rw-r--r-- 1 1001 docker 652 Aug  7 22:48 tsconfig.app.json
-rw-r--r-- 1 1001 docker 381 Aug  7 22:48 tsconfig.json
-rw-r--r-- 1 1001 docker 481 Aug  7 22:48 tsconfig.node.json
📋 Componentes principais:
ls: cannot access 'src/pages/admin/AdminQuotes.tsx': No such file or directory
ls: cannot access 'src/components/admin/AdminSidebar.tsx': No such file or directory
-rw-r--r-- 1 1001 docker 2127 Aug  7 22:48 src/App.tsx
❌ ERRO: Componentes principais faltando!
📋 Arquivos de build:
-rw-r--r-- 1 1001 docker 1490 Aug  7 22:48 Dockerfile
-rw-r--r-- 1 1001 docker 1412 Aug  7 22:48 nginx.conf
-rw-r--r-- 1 1001 docker 3327 Aug  7 22:48 package.json
-rw-r--r-- 1 1001 docker 1170 Aug  7 22:48 vite.config.ts
🧹 Limpando qualquer cache...
🧹 Limpando cache do Docker...
Deleted build cache objects:
zm306u83jwjwpz3f0iugzchx0
mk4t8kz6pt48q0a93t2looalc
6f10wm9epxseh1v8r2qgqicvc
sw7jpgq8hm5o6il2aaq5lrluu
njv8zouoeyahrwo84syrw35pa
ou09c4r21w9ic7nwtc2921zr9
qfu0i3j2iiik81dynilr8m3jp
v2qrjcejemz7bhov9t37iapt0
2bp77cxadfu9vw0c47i1bgkby
qtc2546frdrsb6xloitd0av7j

Total reclaimed space: 377.1MB
Total:	0B
🏗️  BUILD COMPLETO da imagem Docker...
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.53kB done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 0.4s

#3 [internal] load .dockerignore
#3 transferring context: 265B done
#3 DONE 0.0s

#4 [backend-builder 1/6] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#4 CACHED

#5 [internal] load build context
#5 transferring context: 4.35MB 0.1s done
#5 DONE 0.2s

#6 [frontend-builder 2/6] WORKDIR /app/frontend
#6 DONE 0.1s

#7 [backend-builder 2/6] WORKDIR /app/backend
#7 DONE 0.1s

#8 [backend-builder 3/6] COPY backend/package*.json ./
#8 DONE 0.1s

#9 [frontend-builder 3/6] COPY package*.json ./
#9 DONE 0.1s

#10 [frontend-builder 4/6] RUN npm ci
#10 ...

#11 [runtime  2/10] RUN apk add --no-cache nginx
#11 0.423 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/main/x86_64/APKINDEX.tar.gz
#11 0.545 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/community/x86_64/APKINDEX.tar.gz
#11 1.276 (1/2) Installing pcre (8.45-r3)
#11 1.287 (2/2) Installing nginx (1.26.3-r0)
#11 1.296 Executing nginx-1.26.3-r0.pre-install
#11 1.366 Executing nginx-1.26.3-r0.post-install
#11 1.380 Executing busybox-1.37.0-r12.trigger
#11 1.403 OK: 11 MiB in 19 packages
#11 DONE 1.7s

#12 [runtime  3/10] RUN mkdir -p /app/frontend /app/backend /run/nginx
#12 DONE 0.4s

#13 [backend-builder 4/6] RUN npm ci
#13 16.66 
#13 16.66 added 177 packages, and audited 178 packages in 16s
#13 16.66 
#13 16.66 30 packages are looking for funding
#13 16.66   run `npm fund` for details
#13 16.67 
#13 16.67 found 0 vulnerabilities
#13 16.67 npm notice
#13 16.67 npm notice New major version of npm available! 10.8.2 -> 11.5.2
#13 16.67 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.5.2
#13 16.67 npm notice To update run: npm install -g npm@11.5.2
#13 16.67 npm notice
#13 DONE 17.3s

#10 [frontend-builder 4/6] RUN npm ci
#10 ...

#14 [backend-builder 5/6] COPY backend/ .
#14 DONE 0.1s

#15 [backend-builder 6/6] RUN npx prisma generate
#15 3.678 Environment variables loaded from .env
#15 3.680 Prisma schema loaded from prisma/schema.prisma
#15 4.668 
#15 4.668 ✔ Generated Prisma Client (v6.13.0) to ./node_modules/@prisma/client in 111ms
#15 4.668 
#15 4.668 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#15 4.668 
#15 4.668 Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
#15 4.668 
#15 DONE 5.1s

#10 [frontend-builder 4/6] RUN npm ci
#10 29.42 
#10 29.42 added 403 packages, and audited 404 packages in 29s
#10 29.42 
#10 29.42 82 packages are looking for funding
#10 29.42   run `npm fund` for details
#10 29.43 
#10 29.43 3 moderate severity vulnerabilities
#10 29.43 
#10 29.43 Some issues need review, and may require choosing
#10 29.43 a different dependency.
#10 29.43 
#10 29.43 Run `npm audit` for details.
#10 29.43 npm notice
#10 29.43 npm notice New major version of npm available! 10.8.2 -> 11.5.2
#10 29.43 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.5.2
#10 29.43 npm notice To update run: npm install -g npm@11.5.2
#10 29.43 npm notice
#10 DONE 29.7s

#16 [frontend-builder 5/6] COPY . .
#16 DONE 0.1s

#17 [frontend-builder 6/6] RUN npm run build
#17 0.359 
#17 0.359 > vite_react_shadcn_ts@0.0.0 build
#17 0.359 > vite build
#17 0.359 
#17 0.655 vite v5.4.19 building for production...
#17 0.712 transforming...
#17 1.963 
#17 1.963 /api/placeholder/1920/600 referenced in /api/placeholder/1920/600 didn't resolve at build time, it will remain unchanged to be resolved at runtime
#17 1.963 
#17 1.963 /api/placeholder/1920/800 referenced in /api/placeholder/1920/800 didn't resolve at build time, it will remain unchanged to be resolved at runtime
#17 6.409 ✓ 1773 modules transformed.
#17 6.795 rendering chunks...
#17 6.808 computing gzip size...
#17 6.828 dist/index.html                         1.37 kB │ gzip:   0.53 kB
#17 6.828 dist/assets/hero-garage.DXML6wn1.jpg  232.84 kB
#17 6.829 
#17 6.829 (!) Some chunks are larger than 500 kB after minification. Consider:
#17 6.829 - Using dynamic import() to code-split the application
#17 6.829 - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
#17 6.829 - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
#17 6.829 dist/assets/index.uaPsjQW-.css         82.35 kB │ gzip:  14.40 kB
#17 6.829 dist/assets/index.C8m0BAbX.js         626.74 kB │ gzip: 177.62 kB
#17 6.829 ✓ built in 6.15s
#17 DONE 6.9s

#18 [runtime  4/10] COPY --from=frontend-builder /app/dist /app/frontend
#18 ERROR: failed to calculate checksum of ref 559ceb95-fa37-4620-b7b7-47ba1fdf474f::x4jy2dzbuelvkoaoucr2hq2ge: "/app/dist": not found
------
 > [runtime  4/10] COPY --from=frontend-builder /app/dist /app/frontend:
------
Dockerfile:48
--------------------
  46 |     
  47 |     # Copiar frontend buildado
  48 | >>> COPY --from=frontend-builder /app/dist /app/frontend
  49 |     
  50 |     # Copiar backend
--------------------
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref 559ceb95-fa37-4620-b7b7-47ba1fdf474f::x4jy2dzbuelvkoaoucr2hq2ge: "/app/dist": not found
Error: Process completed with exit code 1.