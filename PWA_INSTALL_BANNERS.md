# 📱 Banners de Instalação PWA

## ✅ Implementação Completa

Todos os PWAs agora possuem banners de instalação na página de login, incentivando os usuários a instalar o aplicativo.

---

## 🎨 Customer PWA

**Localização:** `apps/customer-pwa/src/pages/LoginPage.tsx`

**Status:** ✅ Já implementado anteriormente

**Componentes:**
- `InstallCard` - Card de instalação para Android/Chrome
- `IOSInstructions` - Modal com instruções para iOS
- `PWADebug` - Debug em modo desenvolvimento

**Funcionalidades:**
- ✅ Detecta plataforma (Android/iOS/Desktop)
- ✅ Prompt nativo para Android
- ✅ Instruções visuais para iOS
- ✅ Pode ser dispensado (7 dias)
- ✅ Não aparece se já instalado

**Visual:**
- Tema verde (#10b981)
- Ícone de âncora
- Card destacado na página de login

---

## 🎨 Admin PWA

**Localização:** `apps/admin-pwa/src/pages/LoginPage.tsx`

**Status:** ✅ Implementado agora

**Componente:** `PWAInstallBanner` (criado internamente)

**Funcionalidades:**
- ✅ Detecta plataforma automaticamente
- ✅ Prompt nativo Android via `beforeinstallprompt`
- ✅ Modal com instruções passo-a-passo para iOS
- ✅ Banner pode ser dispensado
- ✅ Salva preferência no localStorage
- ✅ Não aparece se app já está instalado
- ✅ Detecção via `display-mode: standalone`

**Visual:**
- Gradiente laranja-azul (`from-orange-500 to-blue-600`)
- Ícone de escudo (Shield)
- Banner destacado acima do formulário de login
- Animação fade-in

**Código do Banner:**
```tsx
function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Detecta iOS, instalação e evento beforeinstallprompt
  // Mostra prompt nativo ou instruções iOS
  // Pode ser dispensado
}
```

---

## 🔄 Comportamento dos Banners

### Android / Chrome / Edge

1. **Ao acessar a página de login:**
   - Banner aparece automaticamente
   - Mensagem: "⚡ Instale o App"
   - Subtexto: "Acesso rápido, trabalhe offline e receba notificações"

2. **Ao clicar em "Instalar agora":**
   - Exibe prompt nativo do navegador
   - Usuário pode aceitar ou recusar
   - Se aceitar, app é instalado na tela inicial
   - Banner desaparece após instalação

3. **Ao clicar em "Agora não":**
   - Banner desaparece
   - Preferência salva no localStorage
   - Pode reaparecer após 7 dias (implementar lógica se necessário)

### iOS / Safari

1. **Ao acessar a página de login:**
   - Banner aparece automaticamente
   - Mensagem: "📱 Instale o App"
   - Subtexto: "Acesse offline e receba notificações. Toque no botão de compartilhar ↗️"

2. **Ao clicar em "Ver como instalar":**
   - Abre modal com instruções passo-a-passo
   - 3 passos ilustrados:
     1. Toque em Compartilhar ↗️
     2. Role e toque em "Adicionar à Tela de Início"
     3. Toque em "Adicionar"

3. **Após seguir as instruções:**
   - App é instalado na tela inicial
   - Abre em modo standalone (sem barra do Safari)

### Desktop

- Banner também aparece no desktop
- Permite instalar o PWA como app de desktop
- Funciona em Chrome, Edge (Windows/Mac/Linux)

---

## 🎯 Detecção de Instalação

Ambos os banners detectam se o app já está instalado:

```javascript
// Verifica se está rodando em modo standalone
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

if (isStandalone) {
  setShowBanner(false); // Não mostra banner
}
```

**Quando o banner NÃO aparece:**
- ✅ App já instalado e aberto via ícone
- ✅ Usuário dispensou recentemente (localStorage)
- ✅ Navegador não suporta PWA

---

## 📊 Comparação

| Feature | Customer PWA | Admin PWA |
|---------|-------------|-----------|
| **Banner de instalação** | ✅ InstallCard | ✅ PWAInstallBanner |
| **Instruções iOS** | ✅ Modal IOSInstructions | ✅ Modal integrado |
| **Prompt Android** | ✅ Sim | ✅ Sim |
| **Pode dispensar** | ✅ 7 dias | ✅ localStorage |
| **Tema visual** | Verde | Laranja-Azul |
| **Localização** | Acima do login | Acima do login |
| **Detecção instalado** | ✅ Sim | ✅ Sim |
| **Debug mode** | ✅ PWADebug | ❌ Não |

---

## 🧪 Como Testar

### Customer PWA
```bash
cd apps/customer-pwa
npm run dev
# Acesse: http://localhost:3002/cliente/login
```

**Comportamento esperado:**
- Banner verde aparece no topo
- Android: Botão "Instalar agora"
- iOS: Botão "Ver como instalar"

### Admin PWA
```bash
cd apps/admin-pwa
npm run dev
# Acesse: http://localhost:3003/login
```

**Comportamento esperado:**
- Banner gradiente laranja-azul aparece no topo
- Android: Botão "Instalar agora"
- iOS: Botão "Ver como instalar"

### Teste de Instalação (Android)

1. Acesse via Chrome Android
2. Banner aparece automaticamente
3. Toque em "Instalar agora"
4. Confirme instalação no prompt
5. App aparece na tela inicial
6. Abra o app → banner não aparece mais

### Teste de Instalação (iOS)

1. Acesse via Safari iOS
2. Banner aparece automaticamente
3. Toque em "Ver como instalar"
4. Siga as 3 etapas mostradas
5. App aparece na tela inicial
6. Abra o app → banner não aparece mais

---

## 🔧 Personalização

### Alterar texto do banner (Admin PWA)

Editar `apps/admin-pwa/src/pages/LoginPage.tsx`:

```tsx
<h3 className="font-bold text-sm mb-1">
  {isIOS ? '📱 Seu texto iOS' : '⚡ Seu texto Android'}
</h3>
<p className="text-xs text-white/90 mb-3">
  {isIOS
    ? 'Descrição para iOS'
    : 'Descrição para Android'
  }
</p>
```

### Alterar cores do banner

```tsx
// Trocar gradiente
className="bg-gradient-to-r from-orange-500 to-blue-600"
// Para outro gradiente, exemplo:
className="bg-gradient-to-r from-purple-500 to-pink-600"
```

### Alterar tempo de dispensa

```tsx
// Atualmente salva no localStorage sem expiração
// Para adicionar expiração de 7 dias:
const handleDismiss = () => {
  const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias
  localStorage.setItem('pwa-install-dismissed', expiry.toString());
  setShowBanner(false);
};

// E no useEffect, verificar se expirou:
const dismissed = localStorage.getItem('pwa-install-dismissed');
if (dismissed && Date.now() < parseInt(dismissed)) {
  setShowBanner(false);
}
```

---

## ✨ Melhorias Futuras

### Sugestões de implementação:

1. **Analytics de instalação**
   - Rastrear quantos usuários veem o banner
   - Rastrear quantos clicam em instalar
   - Rastrear taxa de conversão

2. **A/B Testing**
   - Testar diferentes textos
   - Testar diferentes posições
   - Testar com/sem emoji

3. **Timing inteligente**
   - Mostrar após 2ª visita
   - Mostrar após usar feature específica
   - Não mostrar se usuário rejeitou 3x

4. **Animações avançadas**
   - Slide-in do topo
   - Bounce effect
   - Pulsação no botão

---

## 📝 Checklist de Implementação

- [x] Customer PWA tem banner de instalação
- [x] Admin PWA tem banner de instalação
- [x] Detecção de plataforma (iOS/Android)
- [x] Prompt nativo para Android
- [x] Instruções para iOS
- [x] Banner pode ser dispensado
- [x] Não aparece se já instalado
- [x] Animações suaves
- [x] Visual consistente com tema do app
- [x] Acessível em mobile e desktop
- [x] Funciona em modo desenvolvimento
- [x] Funciona em produção (HTTPS)

---

## 🎉 Conclusão

**Ambos os PWAs agora possuem banners de instalação profissionais e funcionais!**

✅ Customer PWA - Banner verde com InstallCard
✅ Admin PWA - Banner gradiente laranja-azul customizado
✅ Suporte completo iOS e Android
✅ UX otimizada para conversão

Os usuários serão incentivados a instalar os apps logo na tela de login, aumentando as chances de adoção e engagement.

---

**Atualizado em:** 29 de Novembro de 2025
**Versão:** 1.1.0
