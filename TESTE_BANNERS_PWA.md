# 🧪 Guia de Teste - Banners PWA

## ⚠️ Problema Atual
**"Os banners ainda não aparecem mesmo limpando cache depois do deploy concluir"**

## 🔍 Diagnóstico Provável

O problema mais comum é que **limpar o cache do navegador NÃO remove o localStorage**, onde está armazenado o estado `pwa-install-dismissed`.

Quando você clica em "Agora não" no banner, ele salva:
```javascript
localStorage.setItem('pwa-install-dismissed', Date.now());
```

E o banner só reaparece após **7 dias** OU se você **limpar o localStorage**.

---

## ✅ Solução Rápida - Use a Ferramenta de Debug

### 1️⃣ Customer PWA

```
http://localhost:3002/clear-pwa-cache.html
```

**Passos:**
1. Abra o link acima
2. Clique em **"✅ Verificar Status"**
   - Veja se "Banner dispensado" = "Sim"
   - Se sim, é isso que está bloqueando o banner!
3. Clique em **"🗑️ Limpar Tudo"**
   - Remove localStorage completamente
   - Desregistra service workers
   - Limpa cache
4. Clique em **"🚀 Ir para o App"**
5. **O banner DEVE aparecer agora!**

### 2️⃣ Admin PWA

```
http://localhost:3003/clear-pwa-cache.html
```

**Mesmos passos acima.**

---

## 🔧 Solução Manual - Chrome DevTools

Se preferir fazer manualmente:

### Método 1: Application Tab
1. Abra DevTools (F12)
2. Vá para **Application** → **Storage**
3. Clique em **Clear site data**
4. Marque TODAS as opções:
   - ✅ Local storage
   - ✅ Session storage
   - ✅ IndexedDB
   - ✅ Web SQL
   - ✅ Cookies
   - ✅ Cache storage
   - ✅ Service workers
5. Clique **Clear site data**
6. Recarregue a página (F5)

### Método 2: Console
1. Abra Console (F12)
2. Digite:
```javascript
localStorage.clear();
sessionStorage.clear();
navigator.serviceWorker.getRegistrations().then(regs =>
  regs.forEach(reg => reg.unregister())
);
caches.keys().then(names =>
  Promise.all(names.map(name => caches.delete(name)))
);
location.reload();
```

---

## 📊 Como Verificar se Funcionou

### Customer PWA (http://localhost:3002/)

**✅ Banner DEVE aparecer:**
- Fundo verde (#10b981)
- Título: "Instalar Moria Cliente"
- Botão "Instalar Agora" (se Android/Chrome com beforeinstallprompt)
- Botão "Ver como instalar" (se iOS ou sem beforeinstallprompt)
- Botão "Agora não"

**Localização:**
- Fixo no topo da página
- Aparece na página inicial `/`

### Admin PWA (http://localhost:3003/login)

**✅ Banner DEVE aparecer:**
- Fundo gradiente laranja-azul (#f97316 → #2563eb)
- Título: "Instalar Moria Admin"
- Mesmos botões do Customer

**Localização:**
- Fixo no topo da página
- Aparece na página `/login`

---

## 🐛 Ainda Não Aparece? Debug Avançado

### 1. Verificar localStorage no Console
```javascript
console.log('Banner dispensado?', localStorage.getItem('pwa-install-dismissed'));
console.log('Standalone?', window.matchMedia('(display-mode: standalone)').matches);
```

**Resultado esperado:**
- `Banner dispensado? null` ✅ (ou ❌ se tiver valor)
- `Standalone? false` ✅ (ou ❌ true se app já instalado)

### 2. Verificar se Componente Está Montando
```javascript
// No console, procure por:
document.querySelector('[class*="pwa-install"]')
```

**Resultado esperado:**
- Deve retornar o elemento do banner ✅
- Se retornar `null` ❌, o componente não está sendo renderizado

### 3. Verificar Service Worker
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
});
```

**Resultado esperado:**
- `Service Workers: 1` ✅

### 4. Verificar Manifest
1. DevTools → Application → Manifest
2. Verificar:
   - ✅ Screenshots: 2 listados (narrow + wide)
   - ✅ Icons: 2 listados (192x192 + 512x512)
   - ✅ start_url: `/cliente` ou `/store-panel`
   - ✅ display: `standalone`

---

## 📱 Testar em Dispositivo Real

### Android Chrome

**Pré-requisito:** HTTPS ou ngrok tunnel

```bash
# Instalar ngrok
# Criar tunnel
ngrok http 3002
```

**Depois:**
1. Abra URL do ngrok no celular
2. Banner verde deve aparecer
3. Clicar "Instalar Agora" → Prompt nativo
4. Aceitar → App na tela inicial

### iOS Safari (16.4+)

**Pré-requisito:** HTTPS ou dispositivo na mesma rede

1. Configurar IP local:
```bash
# Ver IP local
ipconfig
# Exemplo: 192.168.1.100
```

2. No iPhone, acessar:
```
http://192.168.1.100:3002
```

3. Banner verde deve aparecer
4. Clicar "Ver como instalar" → Modal com instruções
5. Seguir: Share → Add to Home Screen

---

## ✅ Checklist de Validação

### Antes de Testar
- [ ] Servidores dev rodando (npm run dev)
- [ ] Sem erros no console do navegador
- [ ] Manifest.json acessível (F12 → Application → Manifest)

### Durante o Teste
- [ ] Acessei /clear-pwa-cache.html
- [ ] Cliquei "Verificar Status" e vi o diagnóstico
- [ ] Cliquei "Limpar Tudo"
- [ ] Aguardei mensagem de sucesso
- [ ] Cliquei "Ir para o App"

### Resultado Esperado
- [ ] Banner aparece no topo da página
- [ ] Banner tem cor correta (verde ou laranja-azul)
- [ ] Botões funcionam
- [ ] Clicar "Agora não" remove o banner
- [ ] Recarregar página NÃO mostra banner (foi dispensado)
- [ ] Acessar /clear-pwa-cache.html novamente mostra "Banner dispensado: Sim"

---

## 🆘 Se Nada Funcionar

Se após todos os passos acima o banner ainda não aparecer, pode ser:

1. **Roteamento:** O componente não está sendo renderizado na rota correta
   - Verificar se `PWAInstallBanner` está no layout
   - Verificar se a rota está correta (`/` ou `/login`)

2. **Build:** Código antigo em cache do Next.js
   - Parar dev server
   - Deletar `.next` folder
   - `npm run dev` novamente

3. **Navegador:** Modo privado/incógnito pode bloquear
   - Testar em janela normal
   - Testar em outro navegador

4. **Código:** Erro silencioso no componente
   - Abrir console do navegador
   - Procurar por erros em vermelho

---

## 📞 Informações para Debug

Se reportar problema, incluir:

```
Navegador: Chrome 120 / Safari 17 / etc
Sistema: Windows 11 / macOS / Android / iOS
URL testada: http://localhost:3002/
localStorage.getItem('pwa-install-dismissed'): [valor aqui]
window.matchMedia('(display-mode: standalone)').matches: [valor aqui]
Service Workers registrados: [número aqui]
Erros no console: [copiar aqui]
```

---

**Última atualização:** 30 de Novembro de 2025
**Commit:** `801d128`
