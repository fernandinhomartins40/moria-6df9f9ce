# 🔍 Guia de Debug - PWA Banners Não Aparecem

## Passo 1: Verificar localStorage

Abra o DevTools (F12) e execute no Console:

```javascript
// Verificar se banner foi dispensado
console.log('Banner dispensado?', localStorage.getItem('pwa-install-dismissed'));

// Limpar localStorage
localStorage.removeItem('pwa-install-dismissed');

// Recarregar página
location.reload();
```

## Passo 2: Verificar detecção de dispositivo

```javascript
// No console do navegador
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
console.log('Rodando standalone?', isStandalone); // Deve ser false

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
console.log('É iOS?', isIOS);

const isAndroid = /android/.test(navigator.userAgent.toLowerCase());
console.log('É Android?', isAndroid);
```

## Passo 3: Verificar se componente está montado

Para **Customer PWA**, verifique se `InstallCard` está sendo renderizado:

```javascript
// Inspecionar elementos
// Procurar por elemento com texto "Instale o App"
document.querySelector('[class*="InstallCard"]');
```

Para **Admin PWA**, verifique `PWAInstallBanner`:

```javascript
// Procurar por banner com gradiente
document.querySelector('[class*="gradient"]');
```

## Passo 4: Service Worker

```javascript
// Verificar se service worker está registrado
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => console.log('SW:', reg));
});
```

## Solução Rápida

Execute no console:

```javascript
// RESET COMPLETO
localStorage.clear();
sessionStorage.clear();
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
location.reload();
```
