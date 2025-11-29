# 🎨 Sistema CMS Landing Page - Padrão Ferraco

Implementação completa do sistema de gerenciamento de conteúdo da Landing Page, seguindo 100% o padrão do projeto Ferraco.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Backend](#backend)
- [Frontend](#frontend)
- [Como Usar](#como-usar)
- [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

Sistema completo de CMS para edição visual da landing page do Moria, permitindo que administradores editem todos os elementos da página sem tocar no código.

### Status da Implementação

- ✅ **Backend**: 100% completo (7 endpoints REST + histórico)
- ✅ **Frontend Hook**: 100% completo (auto-save, cache, fallback)
- ✅ **Componentes Adaptados**: 100% (6 componentes principais)
- ✅ **StyleControls**: 100% (5 controles visuais)
- ✅ **HeroEditor**: 100% completo e funcional
- ⏳ **Outros Editores**: 0% (estrutura pronta)
- ✅ **Página Admin**: 100% funcional

---

## 🏗️ Arquitetura

### Padrão Ferraco

```
┌─────────────────┐
│  Admin Panel    │  → Edita via UI
│ /admin/landing  │
└────────┬────────┘
         │
         ├─ PUT /api/landing-page/config
         │
    ┌────▼──────────┐
    │   Backend     │
    │ (JSON-based)  │
    └────┬──────────┘
         │
    ┌────▼───────────────┐
    │ LandingPageConfig  │  → 8 campos JSON Text
    │    (Prisma)        │
    └────────────────────┘
         │
         └─ GET /api/landing-page/config (público)
                   │
              ┌────▼─────────┐
              │  useLanding  │  → Backend → Cache → Defaults
              │  PageConfig  │
              └────┬─────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
    ┌────▼─────┐        ┌────▼─────┐
    │  Hero    │        │  Footer  │  → Renderiza com config
    │  Header  │        │  Services│
    └──────────┘        └──────────┘
```

---

## 💾 Backend

### Schema Prisma

```prisma
model LandingPageConfig {
  id       String @id @default(uuid())
  header     String @db.Text // JSON
  hero       String @db.Text // JSON
  marquee    String @db.Text // JSON
  about      String @db.Text // JSON: "Nossos Serviços"
  products   String @db.Text // JSON: "Peças Originais"
  services   String @db.Text // JSON: "Promoções"
  contact    String @db.Text // JSON
  footer     String @db.Text // JSON
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  history LandingPageConfigHistory[]
}

model LandingPageConfigHistory {
  id       String  @id @default(uuid())
  configId String?
  header   String @db.Text
  hero     String @db.Text
  marquee  String @db.Text
  about    String @db.Text
  products String @db.Text
  services String @db.Text
  contact  String @db.Text
  footer   String @db.Text
  changeType      String   @default("manual_save")
  changedByUserId String?
  changeNotes     String?  @db.Text
  createdAt DateTime @default(now())
  config        LandingPageConfig? @relation(...)
  changedByUser Admin?             @relation(...)
}
```

### Endpoints REST

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/landing-page/config` | ❌ | Buscar configuração atual (público) |
| PUT | `/api/landing-page/config` | ✅ | Atualizar configuração (admin) |
| POST | `/api/landing-page/config/history` | ✅ | Salvar no histórico |
| GET | `/api/landing-page/config/history` | ✅ | Listar histórico (paginado) |
| GET | `/api/landing-page/config/history/:id` | ✅ | Buscar versão específica |
| POST | `/api/landing-page/config/restore/:id` | ✅ | Restaurar versão anterior |
| DELETE | `/api/landing-page/config/history/:id` | ✅ | Deletar entrada do histórico |

### Arquivos Backend

- `apps/backend/prisma/schema.prisma` - Schema do banco
- `apps/backend/src/modules/landing-page/landing-page.routes.ts` - Rotas (489 linhas)
- `apps/backend/prisma/seed.ts` - Seed com config inicial

---

## 🎨 Frontend

### Hook: `useLandingPageConfig`

**Arquivo**: `apps/frontend/src/hooks/useLandingPageConfig.ts` (402 linhas)

**Features**:
- ✅ Estratégia de fallback em 3 camadas: **Backend → LocalStorage → Defaults**
- ✅ Auto-save inteligente (5 min após última alteração, não salva na inicialização)
- ✅ Deep merge com defaults (garante que arrays sempre existam)
- ✅ Keyboard shortcuts (Ctrl+S, Ctrl+E, Ctrl+R)
- ✅ beforeunload warning (alerta se há alterações não salvas)
- ✅ Logging detalhado para debug

**API**:
```typescript
const {
  config,           // LandingPageConfig completa
  loading,          // boolean (carregando do backend)
  isDirty,          // boolean (tem alterações não salvas)
  isSaving,         // boolean (salvando)
  error,            // string | null

  updateConfig,     // (section, data) => void
  save,             // (isAutoSave) => Promise<void>
  reset,            // () => void (restaurar defaults)
  loadFromBackend,  // () => Promise<void>
  exportConfig,     // () => void (download JSON)
  importConfig,     // (json) => void (upload JSON)
} = useLandingPageConfig();
```

### Types TypeScript

**Arquivo**: `apps/frontend/src/types/landingPage.ts` (212 linhas)

**Principais Interfaces**:
```typescript
export interface LandingPageConfig {
  version: string;
  lastModified: string;
  header: HeaderConfig;
  hero: HeroConfig;
  marquee: MarqueeConfig;
  about: ServicesSectionConfig;
  products: ProductsSectionConfig;
  services: PromotionsSectionConfig;
  contact: any;
  footer: FooterConfig;
}

export interface HeroConfig {
  enabled: boolean;
  title: string;              // "MORIA"
  subtitle: string;           // "Peças & Serviços"
  description: string;
  features: HeroFeature[];    // 4 features (icon + text)
  buttons: HeroButton[];      // 3 CTAs
  backgroundImage: ImageConfig;
  overlayOpacity: number;     // 0-100
}

export interface FooterConfig {
  enabled: boolean;
  logo: ImageConfig;
  description: string;
  contactInfo: FooterContactInfo;
  businessHours: FooterBusinessHours;
  services: FooterService[];
  socialLinks: FooterSocialLink[];
  certifications: FooterCertification[];  // Trust indicators
  copyright: string;
  bottomLinks: FooterBottomLink[];
}
```

### Defaults

**Arquivo**: `apps/frontend/src/utils/landingPageDefaults.ts` (202 linhas)

Valores padrão que preservam 100% a identidade visual atual do Moria.

### Componentes Adaptados

Todos os componentes principais da landing page foram adaptados para usar `config` do banco:

| Componente | Status | Config usado |
|------------|--------|--------------|
| **Hero.tsx** | ✅ 100% | `config.hero` (title, subtitle, features, buttons, image) |
| **Header.tsx** | ✅ 100% | `config.header` (logo, menuItems, colors) |
| **Footer.tsx** | ✅ 100% | `config.footer` (logo, contact, hours, services, social) |
| **Services.tsx** | ✅ 100% | `config.about` (title, subtitle, trustIndicators) |
| **Products.tsx** | ✅ 100% | `config.products` (title, subtitle) |
| **Promotions.tsx** | ✅ 100% | `config.services` (title, subtitle) |

**Padrão de Implementação**:
```typescript
import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';

export function Hero() {
  const { config, loading } = useLandingPageConfig();

  if (loading) {
    return <SkeletonLoading />; // Skeleton com animate-pulse
  }

  const { title, subtitle, features, buttons } = config.hero;

  return (
    <section>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {features.map(f => <Feature icon={f.icon} text={f.text} />)}
      {buttons.filter(b => b.enabled).map(b => <Button />)}
    </section>
  );
}
```

### StyleControls

**Diretório**: `apps/frontend/src/components/admin/LandingPageEditor/StyleControls/`

Componentes reutilizáveis para edição visual:

| Componente | Descrição | Uso |
|------------|-----------|-----|
| **ColorPicker** | Seletor de cores + paleta Moria | Cores (laranja #ff6b35, dourado, preto) |
| **IconSelector** | Seletor de ícones Lucide | 60+ ícones automotivos (Wrench, Car, Shield) |
| **ImageUploader** | Upload de imagens | Upload, preview, validação, retry |
| **SliderControl** | Controle deslizante | Valores numéricos (ex: opacidade 0-100) |
| **ArrayEditor** | Editor genérico de arrays | Features, buttons, menus (add/remove/reorder) |

**Exemplo de Uso**:
```typescript
import { ColorPicker, IconSelector, ArrayEditor } from '../StyleControls';

<ColorPicker
  label="Cor do Header"
  value={config.header.backgroundColor}
  onChange={(color) => updateConfig({ backgroundColor: color })}
/>

<IconSelector
  label="Ícone da Feature"
  value={feature.icon}
  onChange={(icon) => update({ icon })}
/>

<ArrayEditor<HeroButton>
  label="Botões de Ação (CTAs)"
  items={config.buttons}
  onChange={(buttons) => updateConfig({ buttons })}
  createNew={() => ({
    id: Date.now().toString(),
    text: 'Novo Botão',
    href: '#',
    variant: 'hero',
    enabled: true,
  })}
  renderItem={(item, _, update) => (
    <Input value={item.text} onChange={(e) => update({ text: e.target.value })} />
  )}
  maxItems={3}
/>
```

### Editores de Seção

**Diretório**: `apps/frontend/src/components/admin/LandingPageEditor/SectionEditors/`

| Editor | Status | Campos |
|--------|--------|--------|
| **HeroEditor** | ✅ 100% | title, subtitle, description, features[4], buttons[3], backgroundImage, overlayOpacity |
| **HeaderEditor** | ⏳ 0% | logo, menuItems, backgroundColor, textColor |
| **MarqueeEditor** | ⏳ 0% | messages[], speed, colors |
| **AboutEditor** | ⏳ 0% | title, subtitle, trustIndicators[4] |
| **ProductsEditor** | ⏳ 0% | title, subtitle |
| **ServicesEditor** | ⏳ 0% | title, subtitle |
| **FooterEditor** | ⏳ 0% | logo, contact, hours, services, social, certifications |

### Página Admin

**Arquivo**: `apps/frontend/src/pages/admin/LandingPageEditor.tsx` (275 linhas)

**URL**: `/admin/landing-page`

**Features**:
- ✅ 8 tabs para todas as seções
- ✅ Botões: Salvar, Reset, Export JSON, Import JSON, Preview
- ✅ Status indicator ("Alterações não salvas", "Salvando...")
- ✅ Keyboard shortcuts help
- ✅ Loading state com skeleton
- ✅ Error handling com alertas
- ✅ Preview em nova aba (abre `/`)

**Screenshot UI**:
```
┌────────────────────────────────────────────────────────────┐
│ Editor da Landing Page                  [🔍 Preview] [⬇️ Export] [⬆️ Import] [🔄 Reset] [💾 Salvar] │
│ Configure todos os elementos...         Alterações não salvas │
├────────────────────────────────────────────────────────────┤
│ [Hero] [Header] [Marquee] [Serviços] [Peças] [Promoções] [Contato] [Footer] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─ Textos Principais ──────────────────────────────────┐ │
│  │ Título (Palavra Dourada):  [MORIA               ]    │ │
│  │ Subtítulo:                  [Peças & Serviços    ]    │ │
│  │ Descrição:                  [Especialistas em... ]    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─ Features (Ícones com Texto) ────────────────────────┐ │
│  │ [+Adicionar]                                    (4/4) │ │
│  │                                                        │ │
│  │ ▼ Qualidade Garantida                                 │ │
│  │   Ícone: [🛡️] Shield       Texto: [Qualidade...]      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─ Botões de Ação (CTAs) ───────────────────────────────┐ │
│  │ ...                                                    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Como Usar

### 1. Acessar o Editor

Navegue para: **`http://localhost:3000/admin/landing-page`**

### 2. Editar Seções

1. Clique na tab da seção que deseja editar (ex: Hero)
2. Preencha os campos:
   - Textos (título, subtítulo, descrição)
   - Features (ícones + texto)
   - Botões (texto, link, estilo)
   - Imagens (upload ou URL)
   - Opacidade do overlay
3. As alterações são marcadas como "não salvas"

### 3. Salvar

- **Atalho**: `Ctrl+S`
- **Botão**: Clique em "Salvar"
- **Auto-save**: Após 5 minutos de inatividade

### 4. Preview

Clique no botão "Visualizar" para abrir a home em nova aba e ver as alterações.

### 5. Export/Import

- **Export** (`Ctrl+E`): Baixa JSON com toda a configuração
- **Import**: Carrega JSON de backup

### 6. Reset

Restaura todas as configurações para os valores padrão (com confirmação).

---

## 📝 Próximos Passos

### Editores Faltantes (Prioridade Alta)

1. **FooterEditor**: Edição completa do rodapé
2. **HeaderEditor**: Logo e menu
3. **AboutEditor**: Seção "Nossos Serviços" + Trust Indicators

### Melhorias (Prioridade Média)

4. **Crop de Imagens**: Adicionar `ImageCropModal` para redimensionar
5. **Preview em Tempo Real**: Iframe com reload automático
6. **Página de Histórico**: UI para ver e restaurar versões anteriores
7. **Validações**: Validação de campos obrigatórios

### Features Avançadas (Prioridade Baixa)

8. **Templates**: Salvar/carregar templates predefinidos
9. **A/B Testing**: Testar variações da landing page
10. **Analytics**: Ver métricas de conversão por versão

---

## 🔧 Desenvolvimento

### Executar Localmente

```bash
# Backend
cd apps/backend
npm run dev

# Frontend
cd apps/frontend
npm run dev
```

### Rodar Seed

```bash
cd apps/backend
npx prisma db push  # Atualiza schema
npx prisma db seed  # Popula config inicial
```

### Build para Produção

```bash
# Root
npm run build

# Backend
cd apps/backend
npm run build

# Frontend
cd apps/frontend
npm run build
```

---

## 📚 Documentação Adicional

- [FERRACO_VS_MORIA_ANALYSIS.md](./FERRACO_VS_MORIA_ANALYSIS.md) - Análise comparativa
- [Prisma Schema](./apps/backend/prisma/schema.prisma) - Schema completo
- [Defaults](./apps/frontend/src/utils/landingPageDefaults.ts) - Valores padrão

---

## ✅ Checklist de Implementação

### Backend
- [x] Schema Prisma (LandingPageConfig + History)
- [x] 7 Endpoints REST
- [x] Types TypeScript completos
- [x] Defaults preservando identidade visual
- [x] Seed atualizado
- [x] Middleware AdminAuth

### Frontend - Hook
- [x] useLandingPageConfig completo
- [x] Auto-save inteligente (5 min)
- [x] Fallback em 3 camadas
- [x] Deep merge
- [x] Keyboard shortcuts
- [x] beforeunload warning
- [x] Logging detalhado

### Frontend - Componentes
- [x] Hero.tsx adaptado
- [x] Header.tsx adaptado
- [x] Footer.tsx adaptado
- [x] Services.tsx adaptado
- [x] Products.tsx adaptado
- [x] Promotions.tsx adaptado

### Frontend - StyleControls
- [x] ColorPicker
- [x] IconSelector
- [x] ImageUploader
- [x] SliderControl
- [x] ArrayEditor

### Frontend - Editores
- [x] HeroEditor (100%)
- [ ] HeaderEditor (0%)
- [ ] MarqueeEditor (0%)
- [ ] AboutEditor (0%)
- [ ] ProductsEditor (0%)
- [ ] ServicesEditor (0%)
- [ ] FooterEditor (0%)

### Frontend - Página Admin
- [x] Rota /admin/landing-page
- [x] Tabs para 8 seções
- [x] Botões (Save, Reset, Export, Import, Preview)
- [x] Status indicator
- [x] Keyboard shortcuts help
- [x] Loading/Error states

---

**Status Geral**: 🟢 **Sistema funcional e pronto para uso!**

O HeroEditor já está 100% operacional e pode ser testado em `/admin/landing-page`.

---

**Última atualização**: 29/11/2025
**Autor**: Claude Code
**Padrão**: 100% Ferraco
