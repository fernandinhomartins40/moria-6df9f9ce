# 📱 Implementação PWA - Moria Pesca e Serviços

## 🎯 Visão Geral

Este documento detalha a implementação completa de dois Progressive Web Apps (PWAs) separados:
- **Mechanic PWA**: Portal do Mecânico
- **Customer PWA**: Área do Cliente

## 📂 Estrutura do Projeto

```
moria-6df9f9ce/
├── apps/
│   ├── backend/              # Backend NestJS existente
│   ├── frontend/             # App público (loja e-commerce)
│   ├── mechanic-pwa/         # 🆕 PWA do Mecânico
│   │   ├── public/
│   │   │   ├── icons/        # Ícones PWA
│   │   │   └── manifest.json
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── layouts/
│   │   │   │   └── DashboardLayout.tsx
│   │   │   ├── styles/
│   │   │   │   └── index.css
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── package.json
│   └── customer-pwa/         # 🆕 PWA do Cliente
│       ├── public/
│       │   ├── icons/        # Ícones PWA
│       │   └── manifest.json
│       ├── src/
│       │   ├── pages/
│       │   │   └── LoginPage.tsx
│       │   ├── layouts/
│       │   │   └── AppLayout.tsx
│       │   ├── styles/
│       │   │   └── index.css
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── package.json
├── packages/
│   └── ui/                   # 🆕 Componentes compartilhados
│       ├── pwa-install/
│       │   ├── hooks/
│       │   │   ├── useDeviceDetection.ts
│       │   │   ├── useInstallPrompt.ts
│       │   │   ├── usePWAInstall.ts
│       │   │   └── usePWAAnalytics.ts
│       │   ├── components/
│       │   │   ├── InstallCard.tsx
│       │   │   ├── IOSInstructions.tsx
│       │   │   └── InstallBanner.tsx
│       │   ├── utils/
│       │   │   └── analytics.ts
│       │   ├── styles/
│       │   │   └── animations.css
│       │   └── index.ts
│       └── package.json
└── package.json
```

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
# Na raiz do projeto
npm install

# Instalar workspaces
cd packages/ui && npm install
cd ../../apps/mechanic-pwa && npm install
cd ../customer-pwa && npm install
```

### 2. Desenvolvimento

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Mechanic PWA
cd apps/mechanic-pwa
npm run dev
# Acesse: http://localhost:3001/mecanico/login

# Terminal 3: Customer PWA
cd apps/customer-pwa
npm run dev
# Acesse: http://localhost:3002/cliente/login
```

### 3. Build para Produção

```bash
# Mechanic PWA
cd apps/mechanic-pwa
npm run build

# Customer PWA
cd apps/customer-pwa
npm run build
```

## 🔧 Configuração PWA

### Manifest (mechanic-pwa)

```json
{
  "id": "mechanic-app",
  "name": "Moria - Painel do Mecânico",
  "short_name": "Moria Mecânico",
  "start_url": "/mecanico",
  "scope": "/mecanico/",
  "display": "standalone",
  "theme_color": "#2563eb",
  "icons": [...]
}
```

### Manifest (customer-pwa)

```json
{
  "id": "customer-app",
  "name": "Moria - Área do Cliente",
  "short_name": "Moria Cliente",
  "start_url": "/cliente",
  "scope": "/cliente/",
  "display": "standalone",
  "theme_color": "#10b981",
  "icons": [...]
}
```

### Service Worker

Configurado via `vite-plugin-pwa` com estratégias de cache:

- **NetworkFirst**: APIs (orders, customers)
- **CacheFirst**: Imagens e assets estáticos
- **StaleWhileRevalidate**: Produtos (customer-pwa)

## 📱 Sistema de Instalação PWA

### Componentes Principais

#### 1. InstallCard (Android)
Card visual na página de login para instalação rápida em Android.

```tsx
<InstallCard
  appName="Mecânico"
  appIcon="/icons/mechanic-192.png"
  variant="mechanic"
/>
```

#### 2. IOSInstructions (iOS)
Modal com instruções passo-a-passo para instalação no iOS.

```tsx
<IOSInstructions
  appName="Moria Mecânico"
  variant="mechanic"
/>
```

#### 3. InstallBanner (In-App)
Banner discreto no topo do dashboard.

```tsx
<InstallBanner
  appName="Mecânico"
  variant="mechanic"
  compact={true}
/>
```

### Hooks Disponíveis

#### useDeviceDetection
Detecta plataforma, browser e capacidades PWA.

```tsx
const { platform, browser, isStandalone, canInstall } = useDeviceDetection();
```

#### usePWAInstall
Gerencia o fluxo completo de instalação.

```tsx
const {
  shouldShowPrompt,
  handleInstall,
  handleDismiss
} = usePWAInstall();
```

#### usePWAAnalytics
Tracking automático de eventos PWA.

```tsx
const {
  trackPromptShown,
  trackInstallClicked,
  trackInstalled
} = usePWAAnalytics({ variant: 'mechanic', location: 'login' });
```

## 📊 Analytics

### Eventos Rastreados

- `pwa_prompt_shown`: Prompt exibido
- `pwa_install_button_clicked`: Botão de instalação clicado
- `pwa_installed`: App instalado com sucesso
- `pwa_prompt_dismissed`: Prompt dispensado
- `pwa_app_opened`: App aberto (modo standalone)
- `pwa_offline_feature_used`: Feature offline utilizada
- `pwa_performance_metrics`: Métricas de performance

### Integração

Suporta:
- Google Analytics (gtag)
- Facebook Pixel
- Custom Analytics
- Offline tracking (localStorage)

## 🎨 Ícones e Assets

### Ícones Necessários

**Mechanic PWA:**
- `mechanic-192.png` (192x192px)
- `mechanic-512.png` (512x512px)
- `new-os.png` (96x96px)
- `calendar.png` (96x96px)

**Customer PWA:**
- `customer-192.png` (192x192px)
- `customer-512.png` (512x512px)
- `orders.png` (96x96px)
- `boat.png` (96x96px)

Ver [mechanic-pwa/public/icons/README.md](../apps/mechanic-pwa/public/icons/README.md) e [customer-pwa/public/icons/README.md](../apps/customer-pwa/public/icons/README.md) para especificações detalhadas.

## 🔄 Estratégias de Cache

### Mechanic PWA

```typescript
runtimeCaching: [
  {
    urlPattern: /\/api\/orders.*/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'mechanic-api-cache',
      expiration: { maxAgeSeconds: 60 * 60 * 24 }
    }
  }
]
```

### Customer PWA

```typescript
runtimeCaching: [
  {
    urlPattern: /\/api\/products.*/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'customer-products-cache',
      expiration: { maxAgeSeconds: 60 * 60 * 6 }
    }
  }
]
```

## 🌐 Deploy

### Opção 1: Subdomínios (Recomendado)

```
https://mecanico.moria.app   → Mechanic PWA
https://cliente.moria.app    → Customer PWA
https://api.moria.app        → Backend
```

**Configuração DNS:**
- Criar A/CNAME records para cada subdomínio
- Configurar SSL (Let's Encrypt)

**Vercel:**
```bash
# Deploy mechanic-pwa
cd apps/mechanic-pwa
vercel --prod

# Deploy customer-pwa
cd apps/customer-pwa
vercel --prod
```

### Opção 2: Paths no Mesmo Domínio

```
https://moria.app/mecanico    → Mechanic PWA
https://moria.app/cliente     → Customer PWA
```

**Limitações:**
- Storage compartilhado
- Quota compartilhada
- Não são apps totalmente independentes

## 🧪 Testes

### Lighthouse PWA Audit

```bash
# Instalar lighthouse
npm install -g lighthouse

# Auditar mechanic-pwa
lighthouse http://localhost:3001/mecanico/login --view

# Auditar customer-pwa
lighthouse http://localhost:3002/cliente/login --view
```

**Metas:**
- PWA Score: > 90
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90

### Testes Manuais

**Android:**
- [ ] Chrome: Prompt de instalação aparece
- [ ] Samsung Internet: Instalação funciona
- [ ] Edge: Instalação funciona
- [ ] Notificações push funcionam

**iOS:**
- [ ] Safari: Instruções aparecem
- [ ] Instalação manual funciona
- [ ] App abre em modo standalone
- [ ] Storage persiste entre sessões

## 🔒 Segurança

- ✅ HTTPS obrigatório em produção
- ✅ Content Security Policy configurado
- ✅ Tokens JWT separados por role
- ✅ CORS configurado corretamente
- ✅ Rate limiting por app
- ✅ Dados sensíveis não cacheados

## 📈 Métricas de Sucesso

| Métrica | Meta | Excelente |
|---------|------|-----------|
| Taxa de instalação (Android) | 40% | 60%+ |
| Taxa de instalação (iOS) | 20% | 35%+ |
| Tempo até instalação | < 3 visitas | 1ª visita |
| Retenção 7 dias | 50% | 70%+ |
| Retenção 30 dias | 30% | 50%+ |
| Lighthouse PWA Score | > 90 | 95+ |

## 🐛 Troubleshooting

### Service Worker não registra
- Verificar HTTPS
- Limpar cache do navegador
- Verificar console para erros
- Testar em aba anônima

### Prompt de instalação não aparece (Android)
- Verificar manifest válido
- Service worker ativo
- Visitado pelo menos 2x
- Engagement mínimo (30s)

### Ícones não aparecem (iOS)
- Verificar formato PNG
- Tamanhos corretos (192, 512)
- Cache do Safari limpo
- Apple-touch-icon configurado

### Cache não funciona offline
- Verificar estratégias de cache
- Network tab do DevTools
- Application > Service Workers
- Cache Storage

## 📚 Recursos Adicionais

- [PWA Handbook (web.dev)](https://web.dev/learn/pwa/)
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [iOS PWA Limitations](https://firt.dev/notes/pwa-ios/)

## 🤝 Contribuindo

Para adicionar novos componentes PWA:

1. Criar no `packages/ui/pwa-install`
2. Exportar em `packages/ui/pwa-install/index.ts`
3. Documentar uso neste arquivo
4. Adicionar testes se aplicável

## 📝 Changelog

### v1.0.0 (2025-01-20)
- ✅ Implementação inicial dos dois PWAs
- ✅ Sistema de instalação com detecção de plataforma
- ✅ Analytics de instalação
- ✅ Service Workers configurados
- ✅ Documentação completa

---

**Dúvidas?** Contate a equipe de desenvolvimento.
