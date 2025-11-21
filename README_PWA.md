# 📱 PWAs do Moria - Guia Rápido

## 🎯 O que foi implementado?

Dois Progressive Web Apps (PWAs) completos e independentes:

### 🔧 Mechanic PWA
**Portal do Mecânico** - Gestão de ordens de serviço
- 📍 URL: `/mecanico`
- 🎨 Tema: Azul (#2563eb)
- 📱 Porta dev: 3001

### 👤 Customer PWA
**Área do Cliente** - Acompanhamento de pedidos e serviços
- 📍 URL: `/cliente`
- 🎨 Tema: Verde (#10b981)
- 📱 Porta dev: 3002

## ⚡ Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Instalar workspaces
cd packages/ui && npm install
cd ../../apps/mechanic-pwa && npm install
cd ../customer-pwa && npm install

# 3. Rodar em desenvolvimento
cd apps/mechanic-pwa && npm run dev    # localhost:3001
cd apps/customer-pwa && npm run dev     # localhost:3002
```

## 🎨 Componentes Principais

### Sistema de Instalação PWA

```tsx
import { InstallCard, IOSInstructions, InstallBanner } from '@moria/ui/pwa-install';

// Card na página de login (Android)
<InstallCard appName="Mecânico" variant="mechanic" />

// Instruções para iOS
<IOSInstructions appName="Moria Mecânico" variant="mechanic" />

// Banner no dashboard
<InstallBanner appName="Mecânico" variant="mechanic" compact />
```

### Hooks Disponíveis

```tsx
import { usePWAInstall, useDeviceDetection, usePWAAnalytics } from '@moria/ui';

// Detectar plataforma
const { platform, isStandalone, canInstall } = useDeviceDetection();

// Gerenciar instalação
const { shouldShowPrompt, handleInstall } = usePWAInstall();

// Analytics
const { trackInstalled } = usePWAAnalytics({ variant: 'mechanic' });
```

## 📂 Estrutura

```
apps/
├── mechanic-pwa/    # PWA do Mecânico
├── customer-pwa/    # PWA do Cliente
└── backend/         # API compartilhada

packages/
└── ui/              # Componentes compartilhados
    └── pwa-install/ # Sistema de instalação PWA
```

## 🚀 Features Implementadas

### ✅ Instalação Inteligente
- Detecção automática de plataforma (Android/iOS/Desktop)
- Card de instalação visual (Android)
- Modal com instruções passo-a-passo (iOS)
- Banner discreto no dashboard
- Sistema de dismissão (não incomoda por 7 dias)

### ✅ Offline First
- Service Workers configurados
- Estratégias de cache otimizadas
- Funciona offline após primeira visita

### ✅ Analytics Completo
- Tracking de instalação
- Métricas de performance
- Eventos offline salvos
- Suporte para Google Analytics, Facebook Pixel

### ✅ UI/UX Otimizada
- Animações suaves
- Safe areas para iOS notch
- Responsive design
- Temas personalizados por app

## 🎯 Próximos Passos

### 1. Gerar Ícones
Criar ícones nos formatos necessários:
- `mechanic-192.png` e `mechanic-512.png`
- `customer-192.png` e `customer-512.png`

Ver guias em:
- `apps/mechanic-pwa/public/icons/README.md`
- `apps/customer-pwa/public/icons/README.md`

### 2. Implementar Autenticação
Integrar com o backend existente:
```tsx
// Em App.tsx
const { isAuthenticated, user } = useAuth();
```

### 3. Desenvolver Features
- Dashboard do mecânico (OS, agenda)
- Área do cliente (pedidos, rastreamento)
- Notificações push
- Sincronização offline

### 4. Deploy

**Opção A: Subdomínios (Recomendado)**
```
mecanico.moria.app → Mechanic PWA
cliente.moria.app  → Customer PWA
```

**Opção B: Paths**
```
moria.app/mecanico → Mechanic PWA
moria.app/cliente  → Customer PWA
```

## 📊 Checklist de Produção

- [ ] Ícones gerados em todos os tamanhos
- [ ] Manifests personalizados
- [ ] Service Workers testados
- [ ] HTTPS configurado
- [ ] Analytics configurado
- [ ] Testes em Android (Chrome, Samsung)
- [ ] Testes em iOS (Safari)
- [ ] Lighthouse Score > 90
- [ ] Performance otimizada
- [ ] Documentação atualizada

## 📚 Documentação Completa

Ver [docs/PWA_IMPLEMENTATION.md](./docs/PWA_IMPLEMENTATION.md) para:
- Arquitetura detalhada
- Configurações avançadas
- Troubleshooting
- Best practices

## 🤝 Suporte

**Issues?** Abra uma issue no repositório
**Dúvidas?** Consulte a [documentação técnica](./docs/PWA_IMPLEMENTATION.md)

---

✨ **PWAs prontos para desenvolvimento!**

Criado com ❤️ pela equipe Moria
