# 🎨 Migração Landing Page: Padrão Ferraco Adaptado para Moria

**Data:** 2025-11-29
**Status:** Backend Completo ✅ | Frontend Pendente ⏳

---

## 📋 RESUMO EXECUTIVO

Sistema de edição de landing page **100% no padrão Ferraco**, mas **adaptado** para as seções específicas da Moria Peças & Serviços, mantendo **100% da identidade visual** atual.

### ✅ O que foi implementado:
1. ✅ Schema Prisma (JSON-based)
2. ✅ Backend API (7 endpoints)
3. ✅ Types TypeScript
4. ✅ Defaults (baseados no design atual)
5. ✅ Seed (banco populado)

### ⏳ O que falta:
1. ⏳ Hook `useLandingPageConfig` (auto-save, cache, fallback)
2. ⏳ Adaptar componentes públicos (Hero, Header, Footer)
3. ⏳ Criar editores de seção
4. ⏳ Criar página AdminLandingPageEditor

---

## 🏗️ ARQUITETURA IMPLEMENTADA

### **1. Schema Prisma** (Padrão Ferraco)

```prisma
model LandingPageConfig {
  id       String @id @default(uuid())

  // 8 seções como JSON Text
  header     String @db.Text
  hero       String @db.Text
  marquee    String @db.Text
  about      String @db.Text  // Seção "Nossos Serviços"
  products   String @db.Text  // Seção "Peças Originais"
  services   String @db.Text  // Seção "Promoções"
  contact    String @db.Text  // Placeholder
  footer     String @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  history   LandingPageConfigHistory[]
}

model LandingPageConfigHistory {
  id              String   @id @default(uuid())
  configId        String?

  // Snapshot completo
  header          String   @db.Text
  hero            String   @db.Text
  marquee         String   @db.Text
  about           String   @db.Text
  products        String   @db.Text
  services        String   @db.Text
  contact         String   @db.Text
  footer          String   @db.Text

  // Metadata
  changeType      String   @default("manual_save")
  changedByUserId String?
  changeNotes     String?  @db.Text
  createdAt       DateTime @default(now())

  config        LandingPageConfig? @relation(...)
  changedByUser Admin?             @relation(...)
}
```

**Mudanças do schema antigo:**
- ❌ Removido: `StoreSettings`, `HeroSection`, `MarqueeMessage`, `FooterContent`
- ✅ Adicionado: `LandingPageConfig`, `LandingPageConfigHistory`

---

### **2. Backend API** (7 Endpoints)

**Arquivo:** `apps/backend/src/modules/landing-page/landing-page.routes.ts`

#### Endpoints Públicos:
```typescript
GET /landing-page/config
// Retorna configuração completa (sem autenticação)
// Response: { success: true, data: { header: {}, hero: {}, ... } }
```

#### Endpoints Admin (autenticados):
```typescript
PUT /landing-page/config
// Atualiza configuração (parcial ou completa)
// Body: { header?: {}, hero?: {}, marquee?: {}, ... }

POST /landing-page/config/history
// Salva versão no histórico
// Body: { config: {}, changeType: 'auto_save' | 'manual_save' }

GET /landing-page/config/history?page=1&limit=20&changeType=auto_save
// Lista histórico (paginado)

GET /landing-page/config/history/:id
// Buscar versão específica do histórico

POST /landing-page/config/restore/:id
// Restaurar versão específica

DELETE /landing-page/config/history/:id
// Deletar entrada do histórico
```

**Autenticação:** Usa `AdminAuthMiddleware.authenticate`

---

### **3. Types TypeScript** (Adaptados para Moria)

**Arquivo:** `apps/frontend/src/types/landingPage.ts`

#### Seções Editáveis:

**Header:**
- Logo (imagem)
- Menu items (label, href, isLink)
- Cores (background, text, hover)

**Hero:**
- Título, subtítulo, descrição
- 4 Features (ícone + texto)
- 3 Botões (texto, href, variant)
- Imagem de fundo
- Overlay opacity

**Marquee:**
- Items (ícone + texto)
- Velocidade, cores

**About (Seção "Nossos Serviços"):**
- Título, subtítulo
- 4 Trust Indicators (ícone, título, descrição, cor de fundo)

**Products (Seção "Peças Originais"):**
- Título, subtítulo

**Services (Seção "Promoções"):**
- Título, subtítulo

**Footer:**
- Logo, descrição
- Contato (endereço, telefone, email)
- Horário de funcionamento
- Lista de serviços
- Redes sociais
- 3 Certificações (ícone, título, descrição, cor de fundo)
- Copyright, links do rodapé

---

### **4. Defaults** (Mantém Identidade Visual)

**Arquivo:** `apps/frontend/src/utils/landingPageDefaults.ts`

Função `getDefaultConfig()` retorna configuração padrão **100% baseada no design atual** da Moria:

```typescript
{
  header: {
    logo: { url: '/logo_moria.png', ... },
    menuItems: [
      { label: 'Início', href: '#inicio', ... },
      { label: 'Serviços', href: '#servicos', ... },
      // ... exatamente como está hoje
    ],
    backgroundColor: '#000000', // moria-black
    textColor: '#ffffff',
    hoverColor: '#ff6b35', // moria-orange
  },
  hero: {
    title: 'MORIA',
    subtitle: 'Peças & Serviços',
    description: 'Especialistas em peças automotivas...',
    features: [
      { icon: 'Shield', text: 'Qualidade Garantida' },
      { icon: 'Clock', text: 'Entrega Rápida' },
      { icon: 'Wrench', text: 'Serviços Especializados' },
      { icon: 'Star', text: '15+ Anos no Mercado' },
    ],
    buttons: [
      { text: 'Ver Promoções', href: '#promocoes', variant: 'hero' },
      { text: 'Solicitar Orçamento', href: '#servicos', variant: 'premium' },
      { text: 'Falar no WhatsApp', href: 'https://wa.me/...', variant: 'outline' },
    ],
    backgroundImage: { url: '/assets/hero-garage.jpg', ... },
    overlayOpacity: 70,
  },
  // ... todas as outras seções
}
```

---

### **5. Seed** (Banco Populado)

**Arquivo:** `apps/backend/prisma/seed.ts`

Adiciona no seed (linhas 1555-1802):
```typescript
await prisma.landingPageConfig.create({
  data: {
    header: JSON.stringify(defaultConfig.header),
    hero: JSON.stringify(defaultConfig.hero),
    marquee: JSON.stringify(defaultConfig.marquee),
    about: JSON.stringify(defaultConfig.about),
    products: JSON.stringify(defaultConfig.products),
    services: JSON.stringify(defaultConfig.services),
    contact: JSON.stringify(defaultConfig.contact),
    footer: JSON.stringify(defaultConfig.footer),
  },
});
```

**Executado com sucesso:** ✅
`npm run prisma:seed` - Landing page config criada

---

## 🎯 PRÓXIMOS PASSOS (Frontend)

### **FASE 1: Hook useLandingPageConfig** (padrão Ferraco)

Criar `apps/frontend/src/hooks/useLandingPageConfig.ts` com:

**Features:**
1. ✅ Estratégia de carregamento: Backend → LocalStorage → Defaults
2. ✅ Auto-save inteligente (5 min, não na inicialização)
3. ✅ Deep merge com defaults (garante arrays sempre existem)
4. ✅ Logging detalhado
5. ✅ Atalhos de teclado (Ctrl+S, Ctrl+E, Ctrl+P)
6. ✅ Alerta de alterações não salvas (beforeunload)
7. ✅ Salvamento duplo: config + histórico

**Referência:** `C:\Projetos Cursor\ferraco\apps\frontend\src\hooks\useLandingPageConfig.ts`

---

### **FASE 2: Adaptar Componentes Públicos**

#### **2.1. Header.tsx**
```typescript
import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';

export function Header() {
  const { config, loading } = useLandingPageConfig();

  if (loading) return <HeaderSkeleton />;

  const { logo, menuItems, backgroundColor, textColor, hoverColor } = config.header;

  return (
    <header style={{ backgroundColor }}>
      <img src={logo.url} alt={logo.alt} />
      <nav>
        {menuItems.map(item => (
          item.isLink ?
            <Link to={item.href}>{item.label}</Link> :
            <a href={item.href}>{item.label}</a>
        ))}
      </nav>
    </header>
  );
}
```

#### **2.2. Hero.tsx**
```typescript
import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';

export function Hero() {
  const { config, loading } = useLandingPageConfig();

  if (loading) return <HeroSkeleton />;

  const { title, subtitle, description, features, buttons, backgroundImage, overlayOpacity } = config.hero;

  return (
    <section style={{
      backgroundImage: `url(${backgroundImage.url})`,
    }}>
      <div style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity/100})` }}>
        <h1><span className="gold-metallic">{title}</span> {subtitle}</h1>
        <p>{description}</p>

        <div className="features">
          {features.map(f => (
            <div key={f.id}>
              <Icon name={f.icon} />
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="buttons">
          {buttons.filter(b => b.enabled).map(b => (
            <Button key={b.id} variant={b.variant} href={b.href}>
              {b.text}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

#### **2.3. Footer.tsx**
```typescript
import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';

export function Footer() {
  const { config, loading } = useLandingPageConfig();

  if (loading) return <FooterSkeleton />;

  const { logo, description, contactInfo, businessHours, services, socialLinks, certifications, copyright, bottomLinks } = config.footer;

  return (
    <footer>
      <img src={logo.url} alt={logo.alt} />
      <p>{description}</p>

      {/* Contato */}
      <div>
        <p>{contactInfo.address.street}</p>
        <p>{contactInfo.phone}</p>
        <p>{contactInfo.email}</p>
      </div>

      {/* Horários */}
      <div>
        <p>{businessHours.weekdays}</p>
        <p>{businessHours.saturday}</p>
        <p>{businessHours.sunday}</p>
      </div>

      {/* Serviços */}
      <ul>
        {services.map(s => <li key={s.id}>{s.name}</li>)}
      </ul>

      {/* Redes sociais */}
      {socialLinks.filter(s => s.enabled).map(s => (
        <a key={s.id} href={s.url}><Icon name={s.platform} /></a>
      ))}

      {/* Certificações */}
      {certifications.map(c => (
        <div key={c.id}>
          <div className={c.iconBackground === 'gold' ? 'gold-metallic-bg' : 'bg-moria-orange'}>
            <Icon name={c.icon} />
          </div>
          <h5>{c.title}</h5>
          <p>{c.description}</p>
        </div>
      ))}

      <p>{copyright}</p>
      {bottomLinks.map(l => <a key={l.id} href={l.href}>{l.text}</a>)}
    </footer>
  );
}
```

---

### **FASE 3: Criar Editores de Seção**

Copiar/adaptar do Ferraco:

```
apps/frontend/src/components/admin/LandingPageEditor/
├── StyleControls/
│   ├── ColorPicker.tsx      (copiar do Ferraco)
│   ├── ImageUploader.tsx    (copiar do Ferraco)
│   └── IconSelector.tsx     (copiar do Ferraco)
├── SectionEditors/
│   ├── HeaderEditor.tsx     (adaptar do Ferraco)
│   ├── HeroEditor.tsx       (adaptar do Ferraco)
│   ├── MarqueeEditor.tsx    (adaptar do Ferraco)
│   ├── AboutEditor.tsx      (novo - para "Nossos Serviços")
│   ├── ProductsEditor.tsx   (novo - para "Peças Originais")
│   ├── ServicesEditor.tsx   (novo - para "Promoções")
│   └── FooterEditor.tsx     (adaptar do Ferraco)
└── LandingPagePreview.tsx   (copiar do Ferraco)
```

---

### **FASE 4: Criar Página AdminLandingPageEditor**

```typescript
// apps/frontend/src/pages/admin/AdminLandingPageEditor.tsx

import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';
import { HeaderEditor } from '@/components/admin/LandingPageEditor/SectionEditors/HeaderEditor';
import { HeroEditor } from '@/components/admin/LandingPageEditor/SectionEditors/HeroEditor';
// ... outros editores

export default function AdminLandingPageEditor() {
  const {
    config,
    isDirty,
    isSaving,
    currentSection,
    setCurrentSection,
    save,
    previewMode,
    setPreviewMode,
    showPreview,
    togglePreview,
  } = useLandingPageConfig();

  const sections = [
    { id: 'header', label: 'Cabeçalho', icon: 'Menu' },
    { id: 'hero', label: 'Banner Principal', icon: 'Image' },
    { id: 'marquee', label: 'Faixa de Ofertas', icon: 'MessageSquare' },
    { id: 'about', label: 'Nossos Serviços', icon: 'Wrench' },
    { id: 'products', label: 'Peças Originais', icon: 'Package' },
    { id: 'services', label: 'Promoções', icon: 'Tag' },
    { id: 'footer', label: 'Rodapé', icon: 'Layout' },
  ];

  return (
    <div className="grid grid-cols-12">
      {/* Tabs laterais */}
      <div className="col-span-2">
        {sections.map(s => (
          <button key={s.id} onClick={() => setCurrentSection(s.id)}>
            <Icon name={s.icon} /> {s.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="col-span-6">
        {currentSection === 'header' && <HeaderEditor config={config.header} />}
        {currentSection === 'hero' && <HeroEditor config={config.hero} />}
        {currentSection === 'marquee' && <MarqueeEditor config={config.marquee} />}
        {currentSection === 'about' && <AboutEditor config={config.about} />}
        {currentSection === 'products' && <ProductsEditor config={config.products} />}
        {currentSection === 'services' && <ServicesEditor config={config.services} />}
        {currentSection === 'footer' && <FooterEditor config={config.footer} />}
      </div>

      {/* Preview */}
      <div className="col-span-4">
        {showPreview && <LandingPagePreview config={config} mode={previewMode} />}
      </div>

      {/* Barra de ações */}
      <div className="fixed bottom-0">
        <Button onClick={save} disabled={!isDirty || isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar (Ctrl+S)'}
        </Button>
        <Button onClick={togglePreview}>
          {showPreview ? 'Ocultar' : 'Mostrar'} Preview
        </Button>
        <Select value={previewMode} onChange={setPreviewMode}>
          <option value="desktop">Desktop</option>
          <option value="tablet">Tablet</option>
          <option value="mobile">Mobile</option>
        </Select>
      </div>
    </div>
  );
}
```

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### Criados:
- ✅ `apps/backend/src/modules/landing-page/landing-page.routes.ts`
- ✅ `apps/frontend/src/types/landingPage.ts`
- ✅ `apps/frontend/src/utils/landingPageDefaults.ts`
- ✅ `FERRACO_VS_MORIA_ANALYSIS.md`
- ✅ `LANDING_PAGE_MIGRATION.md` (este arquivo)

### Modificados:
- ✅ `apps/backend/prisma/schema.prisma` - Schema completo refatorado
- ✅ `apps/backend/prisma/seed.ts` - Seed da landing page config
- ✅ `apps/backend/src/app.ts` - Registrado `/landing-page` routes

### Removidos (do schema):
- ❌ `StoreSettings`
- ❌ `HeroSection`
- ❌ `MarqueeMessage`
- ❌ `FooterContent`

---

## 🧪 COMO TESTAR

### 1. Testar Backend (API):

```bash
# Iniciar backend
cd apps/backend
npm run dev

# Testar endpoint público
curl http://localhost:3001/landing-page/config

# Testar atualização (precisa auth)
curl -X PUT http://localhost:3001/landing-page/config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"hero": {"title": "MORIA NOVA"}}'

# Listar histórico
curl http://localhost:3001/landing-page/config/history
```

### 2. Testar Frontend (quando implementado):

```bash
# Acessar página pública
http://localhost:3000/

# Acessar editor admin
http://localhost:3000/admin/landing-page-editor
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend (100% ✅):
- [x] Schema Prisma migrado
- [x] Routes criadas (7 endpoints)
- [x] Middleware auth configurado
- [x] Seed populado
- [x] Types criados
- [x] Defaults criados

### Frontend (0% ⏳):
- [ ] Hook useLandingPageConfig
- [ ] Componente Header adaptado
- [ ] Componente Hero adaptado
- [ ] Componente Footer adaptado
- [ ] StyleControls copiados
- [ ] Editores de seção criados
- [ ] Página AdminLandingPageEditor
- [ ] Testes end-to-end

---

## 📝 NOTAS IMPORTANTES

1. **Identidade Visual:** Todos os defaults foram baseados no design atual. As cores, fontes e layout **NÃO MUDAM**.

2. **Compatibilidade:** Os componentes públicos devem funcionar EXATAMENTE como antes, apenas agora buscam dados do banco.

3. **Fallback:** Se o backend falhar, o hook deve usar localStorage → defaults, garantindo que a página nunca quebra.

4. **Auto-save:** Deve salvar a cada 5 minutos, MAS não na inicialização (para evitar loops).

5. **Histórico:** Toda alteração deve criar entrada no histórico, permitindo restore completo.

---

**Fim da Documentação**
