Current runner version: '2.327.1'
Runner Image Provisioner
Operating System
Runner Image
GITHUB_TOKEN Permissions
Secret source: Actions
Prepare workflow directory
Prepare all required actions
Getting action download info
Download immutable action package 'actions/checkout@v4'
Complete job name: 🚀 Deploy COMPLETO para VPS
0s
Run actions/checkout@v4
Syncing repository: fernandinhomartins40/moria-6df9f9ce
Getting Git version info
Temporarily overriding HOME='/home/runner/work/_temp/6d299a46-aa23-43c1-a306-96fedb8e78be' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/moria-6df9f9ce/moria-6df9f9ce
Deleting the contents of '/home/runner/work/moria-6df9f9ce/moria-6df9f9ce'
Initializing the repository
Disabling automatic garbage collection
Setting up auth
Fetching the repository
Determining the checkout info
/usr/bin/git sparse-checkout disable
/usr/bin/git config --local --unset-all extensions.worktreeConfig
Checking out the ref
/usr/bin/git log -1 --format=%H
64fdbdc9ef325ae35b49317ca07ac275d646f47c
8s
Run echo "🔑 Instalando ferramentas SSH..."
🔑 Instalando ferramentas SSH...
Get:1 file:/etc/apt/apt-mirrors.txt Mirrorlist [144 B]
Hit:2 http://azure.archive.ubuntu.com/ubuntu noble InRelease
Get:6 https://packages.microsoft.com/repos/azure-cli noble InRelease [3564 B]
Get:7 https://packages.microsoft.com/ubuntu/24.04/prod noble InRelease [3600 B]
Get:3 http://azure.archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]
Get:4 http://azure.archive.ubuntu.com/ubuntu noble-backports InRelease [126 kB]
Get:5 http://azure.archive.ubuntu.com/ubuntu noble-security InRelease [126 kB]
Get:8 https://packages.microsoft.com/repos/azure-cli noble/main amd64 Packages [1497 B]
Get:9 https://packages.microsoft.com/ubuntu/24.04/prod noble/main amd64 Packages [46.5 kB]
Get:10 https://packages.microsoft.com/ubuntu/24.04/prod noble/main armhf Packages [9807 B]
Get:11 https://packages.microsoft.com/ubuntu/24.04/prod noble/main arm64 Packages [32.0 kB]
Get:12 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 Packages [1313 kB]
Get:13 http://azure.archive.ubuntu.com/ubuntu noble-updates/main Translation-en [264 kB]
Get:14 http://azure.archive.ubuntu.com/ubuntu noble-updates/main amd64 Components [164 kB]
Get:15 http://azure.archive.ubuntu.com/ubuntu noble-updates/universe amd64 Packages [1120 kB]
Get:16 http://azure.archive.ubuntu.com/ubuntu noble-updates/universe Translation-en [287 kB]
Get:17 http://azure.archive.ubuntu.com/ubuntu noble-updates/universe amd64 Components [377 kB]
Get:18 http://azure.archive.ubuntu.com/ubuntu noble-updates/restricted amd64 Packages [1645 kB]
Get:19 http://azure.archive.ubuntu.com/ubuntu noble-updates/restricted Translation-en [359 kB]
Get:20 http://azure.archive.ubuntu.com/ubuntu noble-updates/restricted amd64 Components [212 B]
Get:21 http://azure.archive.ubuntu.com/ubuntu noble-updates/multiverse amd64 Components [940 B]
Get:22 http://azure.archive.ubuntu.com/ubuntu noble-backports/main amd64 Components [7068 B]
Get:23 http://azure.archive.ubuntu.com/ubuntu noble-backports/universe amd64 Packages [28.9 kB]
Get:24 http://azure.archive.ubuntu.com/ubuntu noble-backports/universe Translation-en [17.4 kB]
Get:25 http://azure.archive.ubuntu.com/ubuntu noble-backports/universe amd64 Components [28.4 kB]
Get:26 http://azure.archive.ubuntu.com/ubuntu noble-backports/restricted amd64 Components [216 B]
Get:27 http://azure.archive.ubuntu.com/ubuntu noble-backports/multiverse amd64 Components [212 B]
Get:28 http://azure.archive.ubuntu.com/ubuntu noble-security/main amd64 Packages [1054 kB]
Get:29 http://azure.archive.ubuntu.com/ubuntu noble-security/main Translation-en [183 kB]
Get:30 http://azure.archive.ubuntu.com/ubuntu noble-security/main amd64 Components [21.6 kB]
Get:31 http://azure.archive.ubuntu.com/ubuntu noble-security/universe amd64 Packages [878 kB]
Get:32 http://azure.archive.ubuntu.com/ubuntu noble-security/universe Translation-en [194 kB]
Get:33 http://azure.archive.ubuntu.com/ubuntu noble-security/universe amd64 Components [52.3 kB]
Get:34 http://azure.archive.ubuntu.com/ubuntu noble-security/restricted amd64 Packages [1560 kB]
Get:35 http://azure.archive.ubuntu.com/ubuntu noble-security/restricted Translation-en [342 kB]
Get:36 http://azure.archive.ubuntu.com/ubuntu noble-security/restricted amd64 Components [212 B]
Get:37 http://azure.archive.ubuntu.com/ubuntu noble-security/multiverse amd64 Components [212 B]
Fetched 10.4 MB in 2s (6287 kB/s)
Reading package lists...
Reading package lists...
Building dependency tree...
Reading state information...
sshpass is already the newest version (1.09-1).
0 upgraded, 0 newly installed, 0 to remove and 35 not upgraded.
✅ Ferramentas SSH instaladas
1m 9s
Run echo "🔧 Iniciando deploy COMPLETO do Moria Peças e Serviços..."
🔧 Iniciando deploy COMPLETO do Moria Peças e Serviços...
Commit: 64fdbdc9ef325ae35b49317ca07ac275d646f47c
Branch: main
⚠️  REBUILD COMPLETO - TODOS OS ARQUIVOS SERÃO SUBSTITUÍDOS
📦 Preparando código...
📤 Enviando para VPS...
Warning: Permanently added '31.97.85.98' (ED25519) to the list of known hosts.
🏗️ Executando deploy COMPLETO na VPS...
📋 Informações do deploy:
  📦 Commit: 64fdbdc9ef325ae35b49317ca07ac275d646f47c
  🌿 Branch: main
  👤 Actor: fernandinhomartins40
  🕐 Timestamp: Thu Aug  7 18:22:11 UTC 2025
Warning: Permanently added '31.97.85.98' (ED25519) to the list of known hosts.
🗑️  REMOVENDO TUDO - REBUILD COMPLETO
⏹️  Parando container anterior...
moria-app
moria-app
Untagged: moria-pecas-servicos:latest
Deleted: sha256:3f5d0748c35f6cc133b76f3643d4a72c2e322d74e96d99a603baa6ad14e62465
🗑️  Removendo diretório anterior COMPLETAMENTE...
📁 Criando diretório limpo...
📦 Extraindo código COMPLETO...
🧹 Limpando qualquer cache...
🧹 Limpando cache do Docker...
Deleted build cache objects:
a0ulxw888va9w2679rul8qxkj
tc30ccwu21p274y045e0ryfuq
d395dt9rybjnl0sqqe1gjxavj
31iiuoo3rwxxry902c18a66a1
r46fsg0rumbja2siagt6ajjxl
qd9h6ycwtca3jzetbdxnb35q7
uvohm719ctrn38zaabdiq1pja
nbdrofiqxhntn3whw5683o1ic
8npa10zucvopul5o7q189lj4x
a0nkwwo1f4n9zgjixoiv6dm8i
Total reclaimed space: 358.4MB
Total:	0B
🏗️  BUILD COMPLETO da imagem Docker...
#0 building with "default" instance using docker driver
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.52kB done
#1 DONE 0.0s
#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 ...
#3 [internal] load metadata for docker.io/library/nginx:alpine
#3 DONE 6.4s
#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 6.7s
#4 [internal] load .dockerignore
#4 transferring context: 265B done
#4 DONE 0.0s
#5 [stage-1 1/3] FROM docker.io/library/nginx:alpine@sha256:d67ea0d64d518b1bb04acde3b00f722ac3e9764b3209a9b0a98924ba35e4b779
#5 CACHED
#6 [builder 1/6] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#6 CACHED
#7 [builder 2/6] WORKDIR /app
#7 DONE 0.1s
#8 [internal] load build context
#8 transferring context: 1.62MB 0.1s done
#8 DONE 0.2s
#9 [builder 3/6] COPY package*.json ./
#9 DONE 0.1s
#10 [builder 4/6] RUN npm ci
#10 9.578 
#10 9.578 added 381 packages, and audited 382 packages in 9s
#10 9.578 
#10 9.578 78 packages are looking for funding
#10 9.578   run `npm fund` for details
#10 9.590 
#10 9.590 3 moderate severity vulnerabilities
#10 9.590 
#10 9.590 Some issues need review, and may require choosing
#10 9.590 a different dependency.
#10 9.590 
#10 9.590 Run `npm audit` for details.
#10 9.592 npm notice
#10 9.592 npm notice New major version of npm available! 10.8.2 -> 11.5.2
#10 9.592 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.5.2
#10 9.592 npm notice To update run: npm install -g npm@11.5.2
#10 9.592 npm notice
#10 DONE 10.1s
#11 [builder 5/6] COPY . .
#11 DONE 0.1s
#12 [builder 6/6] RUN rm -rf dist node_modules/.vite .cache &&     echo "🗂️ Arquivos TypeScript/TSX encontrados:" &&     find src -name "*.tsx" -o -name "*.ts" | grep -E "(AdminQuotes|AdminSidebar|App)" &&     npm run build &&     echo "✅ Build concluído. Verificando arquivos gerados:" &&     ls -la dist/ &&     echo "📋 Verificando componentes no JavaScript compilado:" &&     find dist/assets -name "*.js" -exec grep -l "AdminQuotes" {} ; | head -1 | xargs -I {} sh -c 'echo "✅ Arquivo JS com AdminQuotes: {}"; grep -o "AdminQuotes[^,}]*" {} | head -3' || echo "⚠️ AdminQuotes NÃO encontrado no JS" &&     echo "🔍 Verificando rota quotes:" &&     find dist/assets -name "*.js" -exec grep -l "path.*quotes" {} ; | head -1 && echo "✅ Rota quotes encontrada no bundle" || echo "⚠️ Rota quotes NÃO encontrada"
#12 0.187 🗂️ Arquivos TypeScript/TSX encontrados:
#12 0.189 src/components/admin/AdminSidebar.tsx
#12 0.190 src/pages/admin/AdminQuotes.tsx
#12 0.190 src/App.tsx
#12 0.343 
#12 0.343 > vite_react_shadcn_ts@0.0.0 build
#12 0.343 > vite build
#12 0.343 
#12 0.632 vite v5.4.19 building for production...
#12 0.686 transforming...
#12 1.931 
#12 1.931 /api/placeholder/1920/600 referenced in /api/placeholder/1920/600 didn't resolve at build time, it will remain unchanged to be resolved at runtime
#12 1.931 
#12 1.931 /api/placeholder/1920/800 referenced in /api/placeholder/1920/800 didn't resolve at build time, it will remain unchanged to be resolved at runtime
#12 11.39 ✓ 3402 modules transformed.
#12 12.24 rendering chunks...
#12 12.27 computing gzip size...
#12 12.30 dist/index.html                           1.37 kB │ gzip:   0.53 kB
#12 12.30 dist/assets/hero-garage.DXML6wn1.jpg    232.84 kB
#12 12.30 dist/assets/index.CmQQZJkV.css           82.36 kB │ gzip:  14.38 kB
#12 12.30 dist/assets/index.RLjjAbkW.js         1,070.69 kB │ gzip: 299.43 kB
#12 12.30 
#12 12.30 (!) Some chunks are larger than 500 kB after minification. Consider:
#12 12.30 - Using dynamic import() to code-split the application
#12 12.30 - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
#12 12.30 - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
#12 12.30 ✓ built in 11.64s
#12 12.42 ✅ Build concluído. Verificando arquivos gerados:
#12 12.42 total 104
#12 12.42 drwxr-xr-x    3 root     root          4096 Aug  7 18:22 .
#12 12.42 drwxr-xr-x    1 root     root          4096 Aug  7 18:22 ..
#12 12.42 drwxr-xr-x    2 root     root          4096 Aug  7 18:22 assets
#12 12.42 -rw-r--r--    1 root     root          7645 Aug  7 18:22 favicon.ico
#12 12.42 -rw-r--r--    1 root     root          1393 Aug  7 18:22 index.html
#12 12.42 -rw-r--r--    1 root     root         71918 Aug  7 18:22 logo_moria.png
#12 12.42 -rw-r--r--    1 root     root          3253 Aug  7 18:22 placeholder.svg
#12 12.42 -rw-r--r--    1 root     root           160 Aug  7 18:22 robots.txt
#12 12.42 📋 Verificando componentes no JavaScript compilado:
#12 12.45 🔍 Verificando rota quotes:
#12 12.47 dist/assets/index.RLjjAbkW.js
#12 12.47 ✅ Rota quotes encontrada no bundle
#12 DONE 12.5s
#13 [stage-1 2/3] COPY --from=builder /app/dist /usr/share/nginx/html
#13 DONE 0.0s
#14 [stage-1 3/3] COPY nginx.conf /etc/nginx/conf.d/default.conf
#14 DONE 0.0s
#15 exporting to image
#15 exporting layers 0.0s done
#15 writing image sha256:9e6b724a1975c03549ab5f2dc982474b074efab6e05aa577db1268d7c9fd6ad8 done
#15 naming to docker.io/library/moria-pecas-servicos:latest done
#15 DONE 0.1s
🚀 Iniciando aplicação...
a0a0fb0ec0d02ce1758663543683671b8dc47588f428c2e4c6fb24d50b90a676
⏳ Aguardando inicialização (30s)...
🔍 Verificando container...
✅ Container rodando!
a0a0fb0ec0d0   moria-pecas-servicos:latest     "/docker-entrypoint.…"   30 seconds ago   Up 30 seconds             0.0.0.0:3018->80/tcp, [::]:3018->80/tcp       moria-app
🔍 Testando aplicação...
✅ Aplicação funcionando!
✅ Deploy COMPLETO concluído com sucesso!
📋 Verificando arquivos atualizados...
📁 Arquivos principais:
-rw-r--r-- 1 1001 docker 13849 Aug  7 18:21 AdminOrders.tsx
-rw-r--r-- 1 1001 docker 12752 Aug  7 18:21 AdminQuotes.tsx
📅 Última modificação do build:
total 1368
drwxr-xr-x    2 root     root          4096 Aug  7 18:22 .
drwxr-xr-x    1 root     root          4096 Aug  7 18:22 ..
-rw-r--r--    1 root     root        232844 Aug  7 18:22 hero-garage.DXML6wn1.jpg
-rw-r--r--    1 root     root         82358 Aug  7 18:22 index.CmQQZJkV.css
✅ DEPLOY COMPLETO CONCLUÍDO!
🌐 Aplicação: http://31.97.85.98:3018
📊 Admin (com Orçamentos): http://31.97.85.98:3018/admin/quotes
0s
Run echo "🔧 MORIA PEÇAS E SERVIÇOS DEPLOYADO COM SUCESSO!"
🔧 MORIA PEÇAS E SERVIÇOS DEPLOYADO COM SUCESSO!
🔥 REBUILD COMPLETO EXECUTADO - TODOS OS ARQUIVOS ATUALIZADOS
🔗 LINKS:
🌐 App: http://31.97.85.98:3018
🔧 Peças: http://31.97.85.98:3018/pecas
🛠️ Serviços: http://31.97.85.98:3018/servicos
📊 Admin: http://31.97.85.98:3018/admin
0s
Post job cleanup.
/usr/bin/git version
git version 2.50.1
Temporarily overriding HOME='/home/runner/work/_temp/12eeedcb-8aa1-45f7-842d-46f166030ce5' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/moria-6df9f9ce/moria-6df9f9ce
/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
http.https://github.com/.extraheader
/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
0s
Cleaning up orphan processes