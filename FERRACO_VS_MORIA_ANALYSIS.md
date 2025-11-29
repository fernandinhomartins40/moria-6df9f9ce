# Análise Comparativa: Ferraco vs Moria - Sistema de CMS Landing Page

**Data:** 2025-01-29
**Status:** ✅ Análise Completa

---

## 📊 RESUMO EXECUTIVO

### Arquitetura Ferraco (JSON-Based)
- **Backend:** 1 modelo único (`LandingPageConfig`) com 8 campos JSON Text
- **Vantagens:** Máxima flexibilidade, histórico completo, fácil import/export
- **Desvantagens:** Menos type-safe, queries complexas, maior payload

### Arquitetura Moria (Typed Models)
- **Backend:** 4 modelos separados (StoreSettings, HeroSection, MarqueeMessage, FooterContent)
- **Vantagens:** Type-safe, queries eficientes, validação robusta
- **Desvantagens:** Menos flexível para mudanças estruturais

---

## 🏗️ COMPARAÇÃO DETALHADA

### 1. ESTRUTURA DE BANCO DE DADOS

#### **Ferraco:**
```prisma
model LandingPageConfig {
  id         String   @id @default(cuid())
  header     String   @db.Text // JSON
  hero       String   @db.Text // JSON
  marquee    String   @db.Text // JSON
  about      String   @db.Text // JSON
  products   String   @db.Text // JSON
  experience String   @db.Text // JSON
  contact    String   @db.Text // JSON
  footer     String   @db.Text // JSON
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  history    LandingPageConfigHistory[]
}

model LandingPageConfigHistory {
  id              String   @id @default(cuid())
  configId        String?
  header          String   @db.Text // JSON
  hero            String   @db.Text // JSON
  marquee         String   @db.Text // JSON
  about           String   @db.Text // JSON
  products        String   @db.Text // JSON
  experience      String   @db.Text // JSON
  contact         String   @db.Text // JSON
  footer          String   @db.Text // JSON
  changeType      String   @default("manual_save")
  changedByUserId String?
  createdAt       DateTime @default(now())
  config          LandingPageConfig? @relation(fields: [configId], references: [id], onDelete: SetNull)
  changedByUser   User?              @relation(fields: [changedByUserId], references: [id], onDelete: SetNull)
}
```

**Características:**
- ✅ Apenas 2 tabelas
- ✅ Histórico completo de todas as alterações
- ✅ Rastreamento de quem fez a alteração
- ✅ Diferenciação entre auto-save e manual save
- ✅ Fácil restauração de versões anteriores
- ❌ Campos JSON não podem ter índices
- ❌ Não há validação de schema no banco

#### **Moria:**
```prisma
model StoreSettings {
  id                  String   @id @default(uuid())
  storeName           String
  cnpj                String
  phone               String
  email               String
  // ... 20+ campos tipados
  businessHours       Json
  notifyNewOrders     Boolean
  // ...
}

model HeroSection {
  id          String   @id @default(uuid())
  title       String
  subtitle    String   @db.Text
  imageUrl    String
  features    Json
  cta1Text    String
  cta1Link    String
  cta1Enabled Boolean
  // ... campos separados para cada CTA
  active      Boolean
  updatedAt   DateTime @updatedAt
}

model MarqueeMessage {
  id        String   @id @default(uuid())
  message   String
  order     Int
  active    Boolean
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([order])
  @@index([active])
}

model FooterContent {
  id              String   @id @default(uuid())
  description     String   @db.Text
  services        Json
  socialLinks     Json
  certifications  Json
  footerLinks     Json
  updatedAt       DateTime @updatedAt
}
```

**Características:**
- ✅ 4 tabelas com campos tipados
- ✅ Validação de tipos no banco
- ✅ Índices em campos importantes (order, active)
- ✅ Queries mais eficientes (WHERE active = true)
- ✅ Type-safety total no TypeScript
- ❌ Sem histórico de alterações
- ❌ Sem rastreamento de usuário
- ❌ Menos flexível para mudanças estruturais

---

### 2. BACKEND API

#### **Ferraco:**
```typescript
// 7 endpoints bem definidos
GET    /api/landing-page/config           // Pegar config atual (público)
PUT    /api/landing-page/config           // Atualizar config (auth)
POST   /api/landing-page/config/history   // Salvar no histórico (auth)
GET    /api/landing-page/config/history   // Listar histórico (auth, paginado)
GET    /api/landing-page/config/history/:id  // Ver versão específica (auth)
POST   /api/landing-page/config/restore/:id  // Restaurar versão (auth)
DELETE /api/landing-page/config/history/:id  // Deletar histórico (auth)
```

**Vantagens:**
- ✅ Sistema de histórico/versionamento completo
- ✅ Restauração de versões antigas
- ✅ Paginação no histórico
- ✅ Rastreamento de alterações (auto vs manual)
- ✅ Endpoint público sem autenticação para landing page

#### **Moria:**
```typescript
// Settings (3 endpoints)
GET    /settings
PUT    /settings
POST   /settings/reset

// CMS (10 endpoints)
GET    /cms/hero
PUT    /cms/hero
POST   /cms/hero/reset

GET    /cms/marquee?activeOnly=true
POST   /cms/marquee
PUT    /cms/marquee/:id
DELETE /cms/marquee/:id
POST   /cms/marquee/reorder

GET    /cms/footer
PUT    /cms/footer
POST   /cms/footer/reset
```

**Vantagens:**
- ✅ Endpoints específicos por recurso
- ✅ CRUD completo para MarqueeMessage
- ✅ Endpoint de reorder para mensagens
- ✅ Filtros query (activeOnly)
- ❌ Sem histórico de alterações
- ❌ Sem versionamento/restore
- ❌ Sem rastreamento de usuário

---

### 3. FRONTEND HOOK

#### **Ferraco: `useLandingPageConfig`**

**Características Principais:**

1. **Estratégia de Carregamento (Backend > LocalStorage > Defaults):**
```typescript
// PASSO 1: Tentar buscar do backend (fonte da verdade)
try {
  const backendData = await apiClient.get('/landing-page/config');
  // Merge profundo com defaults para garantir arrays
  const mergedConfig = deepMerge(backendData, defaults);
  localStorage.setItem('config', JSON.stringify(mergedConfig));
  return mergedConfig;
} catch (error) {
  // PASSO 2: Tentar localStorage
  const localConfig = localStorage.getItem('config');
  if (localConfig && isValid(localConfig)) {
    // Sincronizar de volta com backend
    await apiClient.put('/landing-page/config', localConfig);
    return localConfig;
  }
  // PASSO 3: Usar defaults e salvar no backend
  await apiClient.put('/landing-page/config', defaults);
  return defaults;
}
```

2. **Auto-save Inteligente (5 minutos, não na inicialização):**
```typescript
const hasLoadedInitially = useRef(false);

useEffect(() => {
  if (!hasLoadedInitially.current || !isDirty || !ENABLE_AUTO_SAVE) {
    return; // NÃO salvar na inicialização!
  }

  const timer = setTimeout(() => {
    handleSave(true); // auto-save
  }, 5 * 60 * 1000); // 5 minutos

  return () => clearTimeout(timer);
}, [isDirty]); // Apenas isDirty como dependência
```

3. **Deep Merge com Defaults:**
```typescript
// Garante que arrays sempre existam
const backendConfig = {
  hero: {
    ...defaults.hero,
    ...data.hero,
    slides: data.hero?.slides || defaults.hero.slides || [],
  },
  marquee: {
    ...defaults.marquee,
    ...data.marquee,
    items: data.marquee?.items || defaults.marquee.items || [],
  },
  // ... mesmo padrão para todas as seções
};
```

4. **Salvar no Backend E Histórico:**
```typescript
const handleSave = async (isAutoSave = false) => {
  // PASSO 1: Salvar no backend
  await apiClient.put('/landing-page/config', config);

  // PASSO 2: Salvar no localStorage (cache)
  localStorage.setItem('config', JSON.stringify(config));

  // PASSO 3: Salvar no histórico
  await apiClient.post('/landing-page/config/history', {
    config,
    changeType: isAutoSave ? 'auto_save' : 'manual_save',
  });
};
```

5. **Atalhos de Teclado:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave(); // Ctrl+S
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      handleExport(); // Ctrl+E
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      togglePreview(); // Ctrl+P
    }
  };
  window.addEventListener('keydown', handleKeyDown);
}, []);
```

6. **Alerta de Alterações Não Salvas:**
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = ''; // Mostra confirmação do browser
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

7. **Logging Detalhado:**
```typescript
const logConfigChange = (action: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[LandingPageConfig] ${timestamp} - ${action}`, details || '');
};

// Uso:
logConfigChange('✅ Configuração carregada do BACKEND', {
  hasImages: {
    headerLogo: !!config.header.logo?.image?.url,
    heroSlides: config.hero.slides?.length || 0,
  },
});
```

#### **Moria: Hooks Separados**

```typescript
// useSettings - Para configurações da loja
// useHeroContent - Para Hero Section
// useMarqueeMessages - Para Marquee (com CRUD)
// useFooterContent - Para Footer

// Exemplo: useMarqueeMessages
const { messages, loading, actionLoading, fetchMessages, createMessage, updateMessage, deleteMessage, reorderMessages } = useMarqueeMessages();
```

**Características:**
- ✅ Hooks especializados por recurso
- ✅ CRUD completo em useMarqueeMessages
- ✅ Loading states separados (loading, actionLoading)
- ✅ Toast notifications automáticas
- ❌ Sem auto-save
- ❌ Sem cache localStorage
- ❌ Sem histórico/versionamento
- ❌ Sem logging detalhado
- ❌ Sem atalhos de teclado
- ❌ Sem alerta de alterações não salvas

---

### 4. COMPONENTES DE EDIÇÃO

#### **Ferraco:**

**Estrutura de Pastas:**
```
LandingPageEditor/
├── SectionEditors/
│   ├── HeroEditor.tsx       (gerencia slides com drag-drop)
│   ├── MarqueeEditor.tsx    (lista de itens com preview)
│   ├── FooterEditor.tsx     (abas: Logo, Textos, Contatos, Sociais)
│   ├── AboutEditor.tsx
│   ├── ProductsEditor.tsx
│   ├── ExperienceEditor.tsx
│   ├── ContactEditor.tsx
│   └── HeaderEditor.tsx
├── StyleControls/
│   ├── ColorPicker.tsx      (seletor de cor com preview)
│   ├── FontSelector.tsx     (tamanhos e pesos)
│   ├── ImageUploader.tsx    (upload com retry/backup)
│   └── IconSelector.tsx     (seletor de ícones Lucide)
└── LandingPagePreview.tsx   (preview responsivo)
```

**Características dos Editores:**

1. **HeroEditor.tsx:**
   - ✅ Gerenciamento de múltiplos slides
   - ✅ Botões de reordenação (ChevronUp, ChevronDown)
   - ✅ Abas: Conteúdo, Botões, Fundo
   - ✅ Suporte a título com highlight
   - ✅ Configuração completa de CTAs (texto, link, ícone, cores, hover)
   - ✅ Background: gradient, image ou solid
   - ✅ Overlay configurável
   - ✅ Auto-play, intervalo, navegação, indicadores
   - ✅ Layout: centered, split, fullscreen
   - ✅ Altura: auto, screen, 600px, 800px

2. **MarqueeEditor.tsx:**
   - ✅ Lista de itens com drag handle
   - ✅ Seletor de ícone (Star, Award, Truck, etc.)
   - ✅ Preview inline de cada item
   - ✅ Preview geral do marquee com animação
   - ✅ Configuração de velocidade (10-60s)
   - ✅ Cores: background, texto, ícones

3. **FooterEditor.tsx:**
   - ✅ Abas: Logo, Textos, Info Contato, Links, Redes Sociais, Configurações
   - ✅ **Tipos de Link Inteligentes:**
     - E-mail (gera `mailto:`)
     - Telefone (gera `tel:+55...`)
     - WhatsApp (gera `https://wa.me/55...`)
     - Endereço (gera Google Maps link)
     - Website (adiciona https:// automaticamente)
     - Personalizado (href manual)
   - ✅ Geração automática de href baseada no tipo
   - ✅ Preview do href gerado
   - ✅ Configuração de redes sociais com toggle on/off
   - ✅ Newsletter: título, descrição, placeholder, botão
   - ✅ Layout: simple, columns, mega

4. **StyleControls:**
   - ✅ **ColorPicker:** Input de cor + preview visual
   - ✅ **FontSelector:** Tamanhos pré-definidos + custom
   - ✅ **ImageUploader:** Upload com retry, fallback, preview
   - ✅ **IconSelector:** Grid visual de ícones Lucide

**Página Principal (AdminLandingPageEditor.tsx):**
```typescript
// Features:
- Tabs para selecionar seção
- Preview responsivo (Desktop, Tablet, Mobile)
- Toggle de preview (Eye/EyeOff)
- Indicador de alterações não salvas
- Atalhos de teclado visíveis
- Responsivo mobile (grid 2x2 para botões)
- Scroll horizontal para seções em mobile
```

#### **Moria:**

**Status Atual:**
- ❌ Nenhum componente de edição criado
- ✅ Apenas código de exemplo na documentação (CMS_IMPLEMENTATION_COMPLETE.md)
- ✅ Backend e hooks prontos
- ❌ Falta integração com painel admin

---

### 5. COMPONENTES PÚBLICOS

#### **Ferraco:**
- Landing page consome `useLandingPageConfig` com `autoFetch=true`
- Cada seção renderiza baseada no config carregado
- Fallback para defaults se backend falhar

#### **Moria:**
- ✅ **Marquee.tsx** já integrado com CMS:
  ```typescript
  const { messages, loading } = useMarqueeMessages();
  const activeMessages = messages
    .filter(msg => msg.active)
    .sort((a, b) => a.order - b.order);
  const displayMessages = activeMessages.length > 0
    ? activeMessages
    : defaultMessages; // Fallback
  ```
- ❌ Hero.tsx ainda hardcoded
- ❌ Footer.tsx ainda hardcoded

---

## 🎯 RECOMENDAÇÃO PARA MORIA

### Estratégia Híbrida: **"Best of Both Worlds"**

#### **O QUE MANTER da arquitetura Moria:**
1. ✅ Modelos tipados (StoreSettings, HeroSection, MarqueeMessage, FooterContent)
2. ✅ Type-safety no TypeScript
3. ✅ Índices no banco para queries eficientes
4. ✅ Endpoints REST especializados por recurso

#### **O QUE ADICIONAR do Ferraco:**
1. ✅ Sistema de histórico/versionamento
2. ✅ Auto-save inteligente (5 min, não na inicialização)
3. ✅ Cache localStorage com fallback
4. ✅ Logging detalhado
5. ✅ Atalhos de teclado
6. ✅ Alerta de alterações não salvas
7. ✅ Componentes de edição completos
8. ✅ StyleControls reutilizáveis
9. ✅ Preview responsivo

---

## 📋 PLANO DE IMPLEMENTAÇÃO PARA MORIA

### **FASE 1: Sistema de Histórico (Backend)**

**1.1. Criar modelo de histórico no Prisma:**
```prisma
model CMSHistory {
  id        String   @id @default(uuid())
  entityType String  // 'hero', 'marquee', 'footer', 'settings'
  entityId   String  // ID da entidade modificada
  snapshot   Json    // Snapshot completo do estado
  changeType String  @default("manual_save") // 'auto_save', 'manual_save', 'import'
  userId     String?
  user       User?   @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("cms_history")
}
```

**1.2. Adicionar endpoints de histórico:**
```typescript
// Para cada recurso (hero, footer, marquee, settings)
GET    /cms/:resource/history           // Listar histórico (paginado)
GET    /cms/:resource/history/:id       // Ver versão específica
POST   /cms/:resource/restore/:id       // Restaurar versão
DELETE /cms/:resource/history/:id       // Deletar entrada
```

**1.3. Modificar endpoints PUT para salvar histórico:**
```typescript
// Antes de atualizar, salvar snapshot no histórico
const snapshot = await prisma.heroSection.findUnique({ where: { id } });
await prisma.cmsHistory.create({
  data: {
    entityType: 'hero',
    entityId: id,
    snapshot,
    changeType: req.body.isAutoSave ? 'auto_save' : 'manual_save',
    userId: req.user?.id,
  },
});
```

---

### **FASE 2: Auto-save e Cache (Frontend)**

**2.1. Criar hook universal `useCMSState` para gerenciar estado com auto-save:**
```typescript
interface UseCMSStateOptions<T> {
  resourceKey: string;           // 'hero', 'footer', 'marquee', 'settings'
  fetchFn: () => Promise<T>;     // Função para buscar do backend
  saveFn: (data: T, isAutoSave: boolean) => Promise<T>; // Função para salvar
  defaultValue: T;               // Valor padrão
  autoSaveDelay?: number;        // Delay para auto-save (padrão: 5 min)
  enableAutoSave?: boolean;      // Habilitar auto-save (padrão: true)
  enableLocalStorage?: boolean;  // Habilitar cache localStorage (padrão: true)
}

const useCMSState = <T>(options: UseCMSStateOptions<T>) => {
  // Implementa estratégia Backend > LocalStorage > Defaults
  // Auto-save inteligente
  // Logging detalhado
  // Atalhos de teclado
  // Alerta de beforeunload

  return {
    data: T,
    isDirty: boolean,
    isSaving: boolean,
    isLoading: boolean,
    save: () => Promise<void>,
    reset: () => void,
    updateData: (updates: Partial<T>) => void,
  };
};
```

**2.2. Refatorar hooks existentes para usar `useCMSState`:**
```typescript
// Antes:
export const useHeroContent = () => {
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(false);
  // ... fetch, update, reset
};

// Depois:
export const useHeroContent = () => {
  return useCMSState({
    resourceKey: 'hero',
    fetchFn: cmsService.getHero,
    saveFn: cmsService.updateHero,
    defaultValue: getDefaultHeroConfig(),
    autoSaveDelay: 5 * 60 * 1000,
  });
};
```

---

### **FASE 3: Componentes de Edição**

**3.1. Criar pasta de StyleControls:**
```
apps/frontend/src/components/admin/StyleControls/
├── ColorPicker.tsx       (copiar do Ferraco)
├── FontSelector.tsx      (copiar do Ferraco)
├── ImageUploader.tsx     (copiar do Ferraco)
├── IconSelector.tsx      (copiar do Ferraco)
└── index.ts
```

**3.2. Criar editores de seção:**
```
apps/frontend/src/components/admin/CMSEditor/
├── HeroEditor.tsx        (adaptar do Ferraco para schema Moria)
├── MarqueeEditor.tsx     (adaptar do Ferraco)
├── FooterEditor.tsx      (adaptar do Ferraco)
├── SettingsEditor.tsx    (criar novo, baseado em StoreSettings)
└── CMSPreview.tsx        (preview responsivo)
```

**3.3. Criar página principal do CMS Editor:**
```typescript
// apps/frontend/src/pages/admin/AdminCMSEditor.tsx
// Similar ao AdminLandingPageEditor do Ferraco
// Com abas para: Hero, Marquee, Footer, Settings
```

**3.4. Integrar no menu do painel admin:**
```typescript
// Adicionar link "Editar Site" no menu lateral
<NavLink to="/admin/cms">
  <Layout className="h-4 w-4 mr-2" />
  Editar Site
</NavLink>
```

---

### **FASE 4: Atualizar Componentes Públicos**

**4.1. Hero.tsx:**
```typescript
import { useHeroContent } from '@/hooks/useHeroContent';

export function Hero() {
  const { hero, loading } = useHeroContent();

  if (loading) return <HeroSkeleton />;

  return (
    <section style={{ backgroundImage: `url(${hero.imageUrl})` }}>
      <h1>{hero.title}</h1>
      <p>{hero.subtitle}</p>
      {/* ... renderizar features, CTAs */}
    </section>
  );
}
```

**4.2. Footer.tsx:**
```typescript
import { useFooterContent } from '@/hooks/useFooterContent';

export function Footer() {
  const { footer, loading } = useFooterContent();

  if (loading) return <FooterSkeleton />;

  return (
    <footer>
      <p>{footer.description}</p>
      {/* ... renderizar services, social links */}
    </footer>
  );
}
```

---

## 📊 COMPARAÇÃO FINAL

| Aspecto | Ferraco | Moria Atual | Moria Proposta |
|---------|---------|-------------|----------------|
| **Estrutura DB** | 1 tabela JSON | 4 tabelas tipadas | 4 tabelas + histórico |
| **Type Safety** | ⚠️ Parcial | ✅ Total | ✅ Total |
| **Histórico** | ✅ Completo | ❌ Nenhum | ✅ Completo |
| **Auto-save** | ✅ 5 min | ❌ Nenhum | ✅ 5 min |
| **Cache Local** | ✅ localStorage | ❌ Nenhum | ✅ localStorage |
| **Logging** | ✅ Detalhado | ⚠️ Básico | ✅ Detalhado |
| **Atalhos** | ✅ Ctrl+S, E, P, R | ❌ Nenhum | ✅ Ctrl+S, E, P, R |
| **Alertas** | ✅ beforeunload | ❌ Nenhum | ✅ beforeunload |
| **Editores** | ✅ Completos | ❌ Nenhum | ✅ Completos |
| **Preview** | ✅ Responsivo | ❌ Nenhum | ✅ Responsivo |
| **Import/Export** | ✅ JSON | ❌ Nenhum | ✅ JSON |
| **Restore** | ✅ Versões antigas | ❌ Nenhum | ✅ Versões antigas |
| **Performance** | ⚠️ Payload grande | ✅ Queries rápidas | ✅ Queries rápidas |
| **Flexibilidade** | ✅ Alta | ⚠️ Média | ✅ Alta |

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

1. **Decidir:** Implementar sistema de histórico? (Recomendação: **SIM**)
2. **Decidir:** Implementar auto-save? (Recomendação: **SIM**)
3. **Decidir:** Copiar componentes do Ferraco ou criar do zero? (Recomendação: **ADAPTAR do Ferraco**)
4. **Executar:** Implementar Fase 1 (Histórico backend)
5. **Executar:** Implementar Fase 2 (Auto-save e cache)
6. **Executar:** Implementar Fase 3 (Componentes de edição)
7. **Executar:** Implementar Fase 4 (Atualizar componentes públicos)

---

## 🎓 CONCLUSÃO

A arquitetura do **Ferraco** é mais madura em termos de **UX** (auto-save, histórico, atalhos), enquanto a arquitetura da **Moria** é mais robusta em termos de **DX** (type-safety, validação).

A **proposta híbrida** combina o melhor dos dois mundos:
- Mantém a estrutura tipada da Moria (melhor DX)
- Adiciona os recursos de UX do Ferraco (melhor experiência do admin)

**Esforço estimado:**
- Fase 1 (Histórico): ~4-6 horas
- Fase 2 (Auto-save): ~3-4 horas
- Fase 3 (Editores): ~8-12 horas (adaptação do Ferraco)
- Fase 4 (Public): ~2-3 horas

**Total:** ~17-25 horas de desenvolvimento

---

**Gerado em:** 2025-01-29
**Autor:** Claude Code
**Versão:** 1.0.0
