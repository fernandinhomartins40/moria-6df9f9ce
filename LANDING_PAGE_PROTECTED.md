# Landing Page Editor - Proteção e Layout Admin

## 📋 Resumo

A página `/admin/landing-page` agora está protegida por autenticação admin e utiliza o mesmo layout do painel administrativo, garantindo consistência visual e segurança.

## ✅ Implementações Realizadas

### 1. **Proteção de Rota**

**Componente:** `ProtectedAdminRoute`

```tsx
<ProtectedAdminRoute>
  <div className="lojista-layout">
    <Sidebar activeTab="landing-page" onTabChange={() => {}} />
    <main className="lojista-content lojista-fade-in">
      {/* Conteúdo */}
    </main>
  </div>
</ProtectedAdminRoute>
```

**Funcionalidades:**
- ✅ Validação automática de sessão admin (cookie httpOnly)
- ✅ Modal de login para usuários não autenticados
- ✅ Loading state durante verificação
- ✅ Suporte a níveis de permissão (SUPER_ADMIN, ADMIN, MANAGER, STAFF)

### 2. **Layout Administrativo**

Arquivo: `apps/frontend/src/pages/admin/LandingPageEditor.tsx`

**Estrutura:**
```
┌─────────────────────────────────────────┐
│ Sidebar (Navegação)                     │
├─────────────────────────────────────────┤
│ Header com breadcrumb                   │
│ ┌─ Voltar ao Painel                     │
│ └─ Botões de ação (Salvar, Exportar...) │
├─────────────────────────────────────────┤
│ Conteúdo (Tabs Hero, Header, Footer...)│
│                                         │
└─────────────────────────────────────────┘
```

**Classes CSS aplicadas:**
- `lojista-layout` - Container principal
- `lojista-content` - Área de conteúdo
- `lojista-fade-in` - Animação de entrada
- `lojista-header` - Cabeçalho da página
- `lojista-title` - Título principal
- `lojista-subtitle` - Subtítulo

### 3. **Navegação no Sidebar**

Arquivo: `apps/frontend/src/components/admin/Sidebar.tsx`

**Novo Item de Menu:**
```tsx
{
  id: "landing-page",
  label: "Landing Page",
  icon: Palette,
  isExternal: true,
  href: "/admin/landing-page"
}
```

**Características:**
- 🎨 Ícone `Palette` (paleta de cores)
- 🔗 Link externo (usa `<Link>` ao invés de `<button>`)
- ✨ Destaque visual quando ativo
- 📱 Responsivo com sidebar colapsável

### 4. **Melhorias de UX**

#### Header Aprimorado
```tsx
<div className="lojista-header">
  {/* Breadcrumb */}
  <Link to="/store-panel">
    <ArrowLeft /> Voltar ao Painel
  </Link>

  {/* Título */}
  <h1 className="lojista-title">Editor da Landing Page</h1>

  {/* Ações */}
  <Button>Salvar</Button>
  {/* ... outros botões */}
</div>
```

#### Status Indicator
```tsx
{isDirty && (
  <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
    <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></div>
    Alterações não salvas
  </span>
)}
```

#### Botões Otimizados
- Todos os botões agora usam `size="sm"` para melhor densidade
- Ícones + texto descritivo
- Estados disabled apropriados
- Loading states visuais

## 🔒 Fluxo de Autenticação

```
1. Usuário acessa /admin/landing-page
   ↓
2. ProtectedAdminRoute verifica sessão
   ↓
3a. SE autenticado → Renderiza página
3b. SE NÃO autenticado → Exibe modal de login
   ↓
4. Login bem-sucedido → Redireciona para página
```

## 🎨 Integração Visual

### Antes vs Depois

**Antes:**
- ❌ Layout standalone sem sidebar
- ❌ Sem proteção de autenticação
- ❌ Estilos inconsistentes
- ❌ Header fixo independente

**Depois:**
- ✅ Layout integrado com sidebar
- ✅ Autenticação obrigatória
- ✅ Estilos padronizados do admin
- ✅ Header dentro do layout admin

## 📁 Arquivos Modificados

```
apps/frontend/src/
├── components/admin/
│   └── Sidebar.tsx                    # ✅ Novo item "Landing Page"
└── pages/admin/
    └── LandingPageEditor.tsx          # ✅ Layout e proteção aplicados
```

## 🔑 Permissões

### Acesso Permitido
- ✅ SUPER_ADMIN - Acesso total
- ✅ ADMIN - Acesso total
- ✅ MANAGER - Acesso total
- ✅ STAFF - Acesso total

*Nota: Todos os níveis admin têm acesso ao Landing Page Editor. Para restringir por nível, use:*

```tsx
<ProtectedAdminRoute minRole="ADMIN">
  {/* Conteúdo */}
</ProtectedAdminRoute>
```

## 🧪 Como Testar

### 1. Acesso Não Autenticado
```
1. Abrir navegador em modo anônimo
2. Acessar http://localhost:5173/admin/landing-page
3. Verificar que modal de login aparece
4. Tentar fechar modal → não deve permitir
```

### 2. Login e Acesso
```
1. Inserir credenciais admin válidas no modal
2. Verificar que página carrega
3. Verificar que sidebar aparece à esquerda
4. Verificar que item "Landing Page" está destacado
```

### 3. Navegação
```
1. Clicar em "Voltar ao Painel"
2. Verificar redirect para /store-panel
3. No sidebar, clicar em "Landing Page"
4. Verificar que volta para editor
```

### 4. Funcionalidades do Editor
```
1. Fazer alterações nas tabs (Hero, Header, Footer)
2. Verificar indicador "Alterações não salvas"
3. Clicar em Salvar (Ctrl+S)
4. Verificar que salva e indicador desaparece
```

## 🔧 Configuração de Contexto

### AdminAuthContext
- Provider: `<AdminAuthProvider>`
- Hook: `useAdminAuth()`
- Cookie: `admin_token` (httpOnly, secure)
- API Base: `/auth/admin/*`

### Métodos Disponíveis
```typescript
const {
  admin,              // Dados do admin logado
  isAuthenticated,    // Boolean de autenticação
  isLoading,          // Loading state
  login,              // Função de login
  logout,             // Função de logout
  hasRole,            // Verificar role específica
  hasMinRole          // Verificar nível mínimo
} = useAdminAuth();
```

## 🎯 Rotas

### Estrutura
```
/admin → Redirect para /store-panel
/admin/landing-page → Landing Page Editor (protegido)
/store-panel → Painel Admin Principal (protegido)
```

### App.tsx
```tsx
<Route path="/admin" element={<Navigate to="/store-panel" replace />} />
<Route path="/admin/landing-page" element={<LandingPageEditor />} />
<Route path="/store-panel" element={<StorePanel />} />
```

## 📱 Responsividade

### Sidebar Colapsável
- Desktop: Sidebar expandida (264px)
- Collapse: Sidebar compacta (80px)
- Mobile: Overlay/drawer (futuro)

### Breakpoints
- Tabs: 8 colunas em desktop, scroll horizontal em mobile
- Header: Botões em flex-wrap
- Card: Full width com padding responsivo

## 🎨 Temas e Cores

### Cores Principais
- `bg-moria-black` - Sidebar background
- `bg-moria-orange` - Botão primário e item ativo
- `bg-gray-50` - Background do conteúdo
- `text-orange-600` - Indicador de alterações

### Componentes UI
- Button (shadcn/ui)
- Card (shadcn/ui)
- Alert (shadcn/ui)
- Tabs (shadcn/ui)

## 🚀 Próximos Passos

- [ ] Adicionar permissões granulares por seção
- [ ] Implementar histórico de alterações
- [ ] Preview em tempo real em modal
- [ ] Suporte a múltiplos idiomas
- [ ] Agendamento de publicações

## 🐛 Troubleshooting

### Modal de login não aparece
- Verificar se `AdminAuthProvider` envolve a aplicação
- Verificar cookies no DevTools
- Verificar endpoint `/auth/admin/profile`

### Sidebar não destaca item ativo
- Verificar prop `activeTab="landing-page"`
- Verificar match do `id` no menuItems

### Estilos quebrados
- Verificar se `@/styles/lojista.css` está importado
- Verificar classes CSS do Tailwind

---

**Implementado em:** 2025-11-29
**Status:** ✅ Completo e funcional
**Desenvolvedor:** Claude Code
