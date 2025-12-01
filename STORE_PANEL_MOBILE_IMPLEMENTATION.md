# 📱 Implementação Mobile-First do Store Panel

## ✅ Status: **100% COMPLETO**

Este documento descreve a implementação completa da responsividade mobile-first nos painéis administrativos (Store e Mechanic) da Moria Peças, seguindo os mesmos padrões do painel do cliente.

---

## 🎯 Objetivos Alcançados

- ✅ Layout responsivo com menu inferior fixo para mobile
- ✅ Dual-mode: Mobile (bottom nav + drawer) e Desktop (sidebar)
- ✅ PWA-ready com safe areas e touch targets
- ✅ Detecção automática de dispositivo (useStandaloneMode + useIsMobile)
- ✅ Componentes mobile-friendly (cards, modals adaptáveis)
- ✅ Zero funcionalidades removidas (todas as 13 abas do admin acessíveis)
- ✅ Animações suaves e otimizadas
- ✅ Manifest PWA configurado

---

## 📦 Novos Componentes Criados

### 1. Layout Base
**Localização:** `apps/frontend/src/components/store/`

#### `StoreLayout.tsx`
Layout responsivo base que detecta automaticamente o dispositivo e renderiza:
- **Mobile:** Bottom Navigation + Drawer + Header compacto
- **Desktop:** Sidebar original (mantém compatibilidade)

**Features:**
- Detecção dupla: `useStandaloneMode()` + `useIsMobile()`
- Props customizáveis para diferentes painéis
- Safe areas para iOS
- Suporte a variants (admin/mechanic)

#### `StoreBottomNavigation.tsx`
Menu inferior fixo com 5 abas principais.

**Features:**
- Grid de 5 colunas
- Touch targets 44x44px (WCAG)
- Animações de transição
- Botão "Mais" para abrir drawer
- Safe area padding (iOS)

#### `StoreMobileDrawer.tsx`
Drawer deslizante com menu completo.

**Features:**
- Slide-in animation (300ms)
- Backdrop semi-transparente
- Seção de perfil com avatar
- Menu com 8+ itens secundários
- Botão logout destacado
- Safe areas

#### `StoreHeader.tsx`
Header mobile compacto.

**Features:**
- Sticky top
- Botões de notificação/configurações (opcional)
- Touch targets adequados
- Safe area top

### 2. Componentes Mobile-Friendly

#### `ProductCard.tsx`
Card de produto para visualização mobile.

**Features:**
- Imagem com placeholder
- Status e estoque badges
- Preço e estoque destacados
- Ações inline (ver, editar, deletar)
- Hover effects

#### `OrderCard.tsx`
Card de pedido para visualização mobile.

**Features:**
- Status colorido com ícone
- Informações do cliente
- Total e quantidade de itens
- Data formatada
- Botão de ações

#### `MobileModal.tsx`
Modal que se adapta automaticamente.

**Features:**
- **Mobile:** Full screen com scroll otimizado
- **Desktop:** Centralizado com tamanhos customizáveis (sm, md, lg, xl, full)
- Header com título e botão fechar
- Safe areas automáticos
- Smooth scroll iOS

#### `withMobileCards.tsx`
HOC para renderizar cards em mobile e tabela em desktop.

**Uso:**
```tsx
const isMobile = useMobileCards();

return isMobile ? (
  <div className="grid gap-4">
    {products.map(p => <ProductCard key={p.id} {...p} />)}
  </div>
) : (
  <Table>...</Table>
);
```

---

## 🎨 Estilos CSS Criados

### 1. `store.css` (Base Styles)
Estilos base compartilhados entre desktop e mobile.

**Inclui:**
- CSS variables (--store-orange, --store-bg, etc)
- Safe area variables (iOS notch/home indicator)
- Utility classes (safe-area-top, safe-area-bottom)
- Touch optimizations
- Touch target minimum size (44x44px)
- Cards, buttons, tables, forms
- Status badges
- Loading states (skeleton)
- Empty states
- Accessibility (reduced motion, focus visible)

### 2. `store-mobile.css` (Mobile Overrides)
Otimizações específicas para mobile.

**Breakpoint:** 768px

**Inclui:**
- Layout adjustments (padding reduzido)
- Tables → Cards transformation
- Forms em coluna única
- Buttons full width
- Modal full screen
- Sidebar hidden
- Desktop-only/mobile-only classes
- Touch feedback
- Scroll optimizations
- iOS specific fixes
- Standalone mode (PWA)
- Dark mode preparation
- Print styles

### 3. `store-animations.css` (Animações PWA)
Animações suaves e performáticas.

**Inclui:**
- Slide animations (up, down, left, right)
- Fade animations (in, out)
- Scale animations (in, out)
- Bounce, pulse, spin, shake
- Shimmer (loading)
- Ripple effect
- Component-specific (drawer, modal, toast)
- Card hover effects
- Button ripple
- Loading spinners (sm, md, lg)
- Progress bars
- Skeleton loading
- Badge pulse
- Notification dot
- Stagger animation for lists
- Accessibility (reduced motion)

---

## 🔧 Arquivos Modificados

### 1. `StorePanel.tsx`
**Localização:** `apps/frontend/src/pages/StorePanel.tsx`

**Mudanças:**
- Importa `StoreLayout` e ícones do Lucide
- Define `bottomNavItems` (5 abas principais)
- Define `drawerItems` (8 abas secundárias)
- Usa `useAdminAuth()` para obter info do admin
- Envolve conteúdo em `<StoreLayout>`
- Header desktop-only (mobile tem `StoreHeader`)

**Bottom Nav Items:**
1. Dashboard (Início)
2. Orders (Pedidos)
3. Quotes (Orçamentos)
4. Products (Produtos)
5. Menu (Mais)

**Drawer Items:**
1. Services (Serviços)
2. Revisions (Revisões)
3. Customers (Clientes)
4. Coupons (Cupons)
5. Promotions (Promoções)
6. Users (Usuários) - requer permissão
7. Reports (Relatórios)
8. Settings (Configurações)

### 2. `MechanicPanel.tsx`
**Localização:** `apps/frontend/src/components/mechanic/MechanicPanel.tsx`

**Mudanças:**
- Importa `StoreLayout` e ícones
- Define `bottomNavItems` (2 abas)
- Define `drawerItems` (vazio)
- Usa variant="mechanic"
- Envolve conteúdo em `<StoreLayout>`

**Bottom Nav Items:**
1. Revisions (Revisões)
2. Settings (Configurações)

### 3. `manifest-store.webmanifest`
**Localização:** `apps/frontend/public/manifest-store.webmanifest`

**Mudanças:**
- Theme color: `#ff6b35` (moria-orange)
- Background color: `#1a1a1a` (sidebar black)
- Orientation: `portrait-primary`
- Adiciona screenshots (narrow + wide)
- Adiciona shortcuts (Dashboard, Pedidos, Produtos)

---

## 📋 Estrutura de Navegação

### Store Panel (Admin/Lojista)

#### Mobile Layout
```
┌─────────────────────────────────┐
│ Moria Admin         [🔔] [⚙️]  │ ← Header compacto (StoreHeader)
├─────────────────────────────────┤
│                                 │
│     CONTEÚDO DA ABA ATIVA      │
│     (Dashboard, Pedidos, etc)   │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [🏠] [📦] [📋] [📦] [☰]      │ ← Bottom Nav (fixo)
└─────────────────────────────────┘
```

**Clique em [☰] abre Drawer:**
```
┌─────────────────────────────────┐
│ [←] Menu Completo               │
├─────────────────────────────────┤
│ 👤 Admin User                   │
│ admin@moria.com                 │
│ [Administrador]                 │
├─────────────────────────────────┤
│ 🔧 Serviços                     │
│ 📋 Revisões                     │
│ 👥 Clientes                     │
│ 🏷️ Cupons                       │
│ 💰 Promoções                    │
│ 👔 Usuários                     │
│ 📊 Relatórios                   │
│ ⚙️ Configurações                │
├─────────────────────────────────┤
│ [🚪] Sair                       │
└─────────────────────────────────┘
```

#### Desktop Layout
```
┌───────────────────────────────────────────────────┐
│ Moria Admin                          [🔔] [⚙️]   │
├──────────┬────────────────────────────────────────┤
│          │                                        │
│ SIDEBAR  │        CONTEÚDO DA ABA                │
│          │                                        │
│ 🏠 Início │   Dashboard com métricas              │
│ 📦 Pedid. │   Gráficos e tabelas                  │
│ 📋 Orçam. │                                        │
│ 📦 Produt.│                                        │
│ 🔧 Serviç.│                                        │
│ ...       │                                        │
│           │                                        │
│ [🚪] Sair │                                        │
└──────────┴────────────────────────────────────────┘
```

### Mechanic Panel

#### Mobile Layout
```
┌─────────────────────────────────┐
│ Moria Mecânico     [🔔] [⚙️]   │
├─────────────────────────────────┤
│                                 │
│     CONTEÚDO DA ABA ATIVA      │
│     (Revisões ou Configurações) │
│                                 │
│                                 │
├─────────────────────────────────┤
│     [📋 Revisões]  [⚙️ Config]  │ ← Bottom Nav (2 abas)
└─────────────────────────────────┘
```

---

## 🔄 Fluxo de Detecção de Layout

```
Usuário acessa /store-panel ou /mechanic-panel
  ↓
StoreLayout executa:
  ├─ useStandaloneMode()
  │   ├─ Media query: (display-mode: standalone) → Android PWA
  │   └─ window.navigator.standalone === true → iOS PWA
  │
  ├─ useIsMobile()
  │   └─ matchMedia('(max-width: 767px)') → Tamanho tela
  │
  └─ useMobileLayout = isStandalone || isMobile
      ├─ true → MobileLayout
      │   ├─ StoreHeader (compacto)
      │   ├─ Conteúdo (px-4 py-4)
      │   ├─ StoreBottomNavigation (fixo)
      │   └─ StoreMobileDrawer (slide-in)
      │
      └─ false → DesktopLayout
          ├─ Sidebar (original)
          └─ Main content (flex-1)
```

---

## 🎨 Como Usar os Novos Componentes

### 1. Usar Cards em Mobile

```tsx
import { useMobileCards } from '@/components/store/withMobileCards';
import ProductCard from '@/components/store/ProductCard';
import OrderCard from '@/components/store/OrderCard';

function MyComponent() {
  const isMobile = useMobileCards();

  return isMobile ? (
    // Mobile: Grid de cards
    <div className="grid grid-cols-1 gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          {...product}
          onEdit={() => handleEdit(product.id)}
          onDelete={() => handleDelete(product.id)}
          onView={() => handleView(product.id)}
        />
      ))}
    </div>
  ) : (
    // Desktop: Tabela
    <table className="store-table">
      {/* ... */}
    </table>
  );
}
```

### 2. Usar Modal Adaptável

```tsx
import MobileModal, { useModal } from '@/components/store/MobileModal';

function MyComponent() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button onClick={open}>Abrir Modal</button>

      <MobileModal
        open={isOpen}
        onClose={close}
        title="Criar Produto"
        size="lg" // sm, md, lg, xl, full
      >
        <form>{/* Formulário */}</form>
      </MobileModal>
    </>
  );
}
```

### 3. Adicionar Novo Item ao Bottom Nav

```tsx
// Em StorePanel.tsx
const bottomNavItems = [
  { id: "dashboard", label: "Início", icon: LayoutDashboard },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "quotes", label: "Orçamentos", icon: FileText },
  { id: "products", label: "Produtos", icon: Package },
  { id: "menu", label: "Mais", icon: Menu }, // Sempre por último
];
```

### 4. Adicionar Novo Item ao Drawer

```tsx
// Em StorePanel.tsx
const drawerItems = [
  { id: "services", label: "Serviços", icon: Wrench },
  { id: "revisions", label: "Revisões", icon: ClipboardCheck },
  // Adicionar novo:
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];
```

---

## 🔒 Safe Areas (iOS)

### CSS Variables Disponíveis
```css
--safe-area-inset-top
--safe-area-inset-bottom
--safe-area-inset-left
--safe-area-inset-right
```

### Utility Classes
```css
.safe-area-top {
  padding-top: max(1rem, var(--safe-area-inset-top));
}

.safe-area-bottom {
  padding-bottom: max(0.5rem, var(--safe-area-inset-bottom));
}

.h-safe-area-inset-bottom {
  height: var(--safe-area-inset-bottom);
}
```

### Uso em Componentes
```tsx
<div className="safe-area-top">
  {/* Conteúdo com padding top seguro */}
</div>

<nav className="fixed bottom-0 safe-area-bottom">
  {/* Bottom nav com padding bottom seguro */}
</nav>
```

---

## 🎯 Touch Targets (WCAG)

Todos os botões e elementos interativos têm **mínimo 44x44px**:

```css
button,
a.button,
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

Classe utilitária:
```tsx
<button className="touch-manipulation">
  {/* -webkit-tap-highlight-color: transparent */}
  {/* -webkit-touch-callout: none */}
  {/* user-select: none */}
</button>
```

---

## 🚀 PWA Features

### Manifest Configurado
- **Theme Color:** `#ff6b35` (moria-orange)
- **Display:** `standalone` (sem barra de navegador)
- **Start URL:** `/store-panel?source=pwa`
- **Orientation:** `portrait-primary`
- **Shortcuts:** Dashboard, Pedidos, Produtos

### Ícones Necessários
```
/icons/store/
├── store-32.png
├── store-96.png
├── store-180.png (Apple Touch Icon)
├── store-192.png (maskable)
└── store-512.png
```

### Screenshots (Opcional)
```
/screenshots/
├── store-narrow-1.png (540x720)
├── store-narrow-2.png (540x720)
└── store-wide-1.png (1280x720)
```

---

## 📊 Breakpoints

| Breakpoint | Width | Layout | Bottom Nav | Sidebar |
|-----------|-------|--------|------------|---------|
| Mobile | <768px | 1 col | Visível | Hidden |
| Tablet | 768-1024px | Desktop | Hidden | Visível |
| Desktop | >1024px | Desktop | Hidden | Visível |
| PWA Installed | Any | Mobile | Visível | Hidden |

---

## ♿ Acessibilidade

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Visible
```css
*:focus-visible {
  outline: 2px solid var(--store-orange);
  outline-offset: 2px;
}
```

### ARIA Labels
Todos os componentes incluem:
- `aria-label` em botões de ícone
- `aria-modal="true"` em modals
- `aria-current="page"` em nav ativo
- `role="dialog"` em drawers/modals

---

## 🧪 Como Testar

### 1. Testar Mobile (Navegador)
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Escolher dispositivo (iPhone 12, Pixel 5, etc)
4. Navegar para `/store-panel`
5. Verificar:
   - Bottom nav aparece
   - Sidebar está oculta
   - Cards ao invés de tabelas
   - Touch targets adequados
   - Drawer funciona

### 2. Testar Desktop
1. Navegador em tela grande (>768px)
2. Navegar para `/store-panel`
3. Verificar:
   - Sidebar aparece
   - Bottom nav oculto
   - Tabelas normais
   - Layout original mantido

### 3. Testar PWA Instalado
1. Chrome: Menu → "Instalar aplicativo"
2. Safari iOS: Share → "Add to Home Screen"
3. Abrir PWA instalado
4. Verificar:
   - Modo standalone (sem barra)
   - Safe areas funcionando
   - Bottom nav com padding correto

### 4. Testar Safe Areas (iPhone)
1. Abrir no iPhone com notch
2. Verificar padding top do header
3. Verificar padding bottom do bottom nav
4. Rolar conteúdo e verificar se não fica cortado

### 5. Testar Drawer
1. Mobile: Clicar em "Mais"
2. Verificar animação slide-in
3. Verificar backdrop funciona
4. Clicar item e verificar navegação
5. Clicar "Sair" e verificar logout

---

## 🐛 Troubleshooting

### Bottom Nav não aparece
- Verificar se largura da tela <768px
- Verificar se CSS está importado
- Inspecionar elemento e ver classes aplicadas

### Sidebar e Bottom Nav aparecem juntos
- Verificar media query do CSS
- Verificar lógica de `useMobileLayout`
- Forçar refresh (Ctrl+F5)

### Modal não fica full screen no mobile
- Verificar prop `fullScreen` ou `isMobile`
- Verificar classes CSS aplicadas
- Verificar `useIsMobile()` retorna true

### Safe areas não funcionam no iOS
- Verificar viewport meta tag no HTML
- Verificar CSS variables `env(safe-area-inset-*)`
- Testar em dispositivo real (simulador pode não funcionar)

### Drawer não abre
- Verificar `isDrawerOpen` state
- Verificar `onMenuClick` callback
- Verificar classes `translate-x-*`
- Inspecionar console para erros

---

## 📚 Referências

- [MDN: PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: Safe Area Insets](https://web.dev/articles/viewport-units)
- [WCAG: Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Material Design: Bottom Navigation](https://m3.material.io/components/navigation-bar/overview)
- [Apple: Designing for iOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ios)

---

## 🎉 Conclusão

A implementação mobile-first do Store Panel está **100% completa** e segue todos os padrões modernos de PWA, acessibilidade e UX mobile. O sistema é:

- ✅ Totalmente responsivo
- ✅ PWA-ready
- ✅ Acessível (WCAG)
- ✅ Performático
- ✅ Mantém compatibilidade desktop
- ✅ Zero funcionalidades removidas
- ✅ Fácil de manter e estender

**Próximos passos (opcional):**
- Adicionar dark mode
- Implementar offline mode
- Criar variantes de cor (mechanic blue)
- Adicionar mais shortcuts no manifest
- Implementar notificações push
