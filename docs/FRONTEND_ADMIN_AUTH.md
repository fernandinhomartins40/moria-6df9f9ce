# Autenticação Administrativa - Frontend

## Visão Geral

O frontend da Moria agora possui **autenticação completa** para o painel administrativo, garantindo que apenas usuários autorizados possam acessar o painel do lojista.

---

## Implementação

### 1. AdminAuthContext

Context React que gerencia a autenticação de administradores:

**Localização:** `apps/frontend/src/contexts/AdminAuthContext.tsx`

**Funcionalidades:**
- Gerenciamento de sessão com `localStorage`
- Autenticação via API (`/auth/admin/login`)
- Verificação automática de sessão ao carregar a aplicação
- Logout com limpeza de token
- Verificação de permissões baseadas em roles

**Hooks disponíveis:**
```typescript
const {
  admin,           // Dados do admin logado
  isAuthenticated, // Boolean indicando se está autenticado
  isLoading,       // Boolean indicando carregamento
  login,           // Função de login
  logout,          // Função de logout
  hasRole,         // Verifica se tem um papel específico
  hasMinRole       // Verifica se tem nível mínimo
} = useAdminAuth();
```

**Exemplo de uso:**
```typescript
import { useAdminAuth } from "@/contexts/AdminAuthContext";

function MyComponent() {
  const { admin, logout, hasMinRole } = useAdminAuth();

  return (
    <div>
      <h1>Bem-vindo, {admin?.name}</h1>
      <p>Papel: {admin?.role}</p>

      {hasMinRole('MANAGER') && (
        <button>Ação de Gerente+</button>
      )}

      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

---

### 2. AdminLoginDialog

Tela de login para administradores com design moderno e profissional.

**Localização:** `apps/frontend/src/components/admin/AdminLoginDialog.tsx`

**Características:**
- Design gradient com cores do tema
- Validação de campos
- Feedback de erros
- Estados de loading
- Credenciais de teste visíveis (apenas em desenvolvimento)

**Credenciais de Teste:**
```
Super Admin:    admin@moria.com     / Test123!
Gerente:        gerente@moria.com   / Test123!
Mecânico:       mecanico@moria.com  / Test123!
```

---

### 3. ProtectedAdminRoute

Componente de Higher-Order Component (HOC) que protege rotas administrativas.

**Localização:** `apps/frontend/src/components/admin/ProtectedAdminRoute.tsx`

**Funcionalidades:**
- Verifica autenticação antes de renderizar children
- Mostra loading enquanto verifica sessão
- Redireciona para login se não autenticado
- Valida permissões baseadas em roles
- Mostra mensagem de "Acesso Negado" se não tem permissão

**Uso básico:**
```typescript
<ProtectedAdminRoute>
  <AdminPanel />
</ProtectedAdminRoute>
```

**Com verificação de papel:**
```typescript
<ProtectedAdminRoute requiredRole="SUPER_ADMIN">
  <SuperAdminSettings />
</ProtectedAdminRoute>
```

**Com verificação de nível mínimo:**
```typescript
<ProtectedAdminRoute minRole="MANAGER">
  <ProductManagement />
</ProtectedAdminRoute>
```

---

### 4. Sidebar Atualizado

O Sidebar do admin agora mostra informações do usuário logado e botão de logout.

**Localização:** `apps/frontend/src/components/admin/Sidebar.tsx`

**Novas features:**
- Exibe foto de perfil (avatar)
- Mostra nome do admin
- Exibe papel/role do admin
- Botão de logout funcional
- Integração com AdminAuthContext

---

### 5. StorePanel Protegido

O painel administrativo agora requer login.

**Localização:** `apps/frontend/src/pages/StorePanel.tsx`

**Antes:**
```typescript
export default function StorePanel() {
  return <div>...</div>;
}
```

**Depois:**
```typescript
export default function StorePanel() {
  return (
    <ProtectedAdminRoute>
      <div>...</div>
    </ProtectedAdminRoute>
  );
}
```

---

## Fluxo de Autenticação

### Primeiro Acesso (Não Autenticado)

1. Usuário acessa `/store-panel`
2. `ProtectedAdminRoute` verifica autenticação
3. Não encontra token válido em `localStorage`
4. Renderiza `AdminLoginDialog`
5. Usuário faz login
6. Token é salvo em `localStorage` como `admin_token`
7. AdminAuthContext atualiza estado
8. `ProtectedAdminRoute` permite acesso
9. StorePanel é renderizado

### Acesso Subsequente (Com Sessão)

1. Usuário acessa `/store-panel`
2. `AdminAuthProvider` detecta `admin_token` no `localStorage`
3. Faz chamada para `/auth/admin/profile` para validar token
4. Se válido, atualiza estado com dados do admin
5. `ProtectedAdminRoute` permite acesso imediatamente
6. StorePanel é renderizado

### Logout

1. Usuário clica em "Sair" no Sidebar
2. `logout()` é chamado do AdminAuthContext
3. Token é removido do `localStorage`
4. Estado é resetado
5. `ProtectedAdminRoute` detecta não autenticado
6. Redireciona para tela de login

---

## Isolamento de Sessões

O sistema garante **isolamento total** entre sessões de cliente e admin:

| Aspecto | Cliente | Admin |
|---------|---------|-------|
| Token Key | `auth_token` | `admin_token` |
| Context | `AuthContext` | `AdminAuthContext` |
| API Endpoint | `/auth/login` | `/auth/admin/login` |
| JWT Audience | `moria-frontend` | `moria-admin` |
| Rotas Protegidas | `/customer` | `/store-panel` |

Isso significa que:
- ✅ Cliente pode estar logado e admin não
- ✅ Admin pode estar logado e cliente não
- ✅ Ambos podem estar logados simultaneamente
- ✅ Tokens não conflitam entre si
- ✅ Logout de um não afeta o outro

---

## Hierarquia de Permissões

### Níveis de Acesso

```
SUPER_ADMIN (4)  ← Acesso total
    ↑
  ADMIN (3)      ← Pode deletar recursos
    ↑
 MANAGER (2)     ← Pode criar/editar produtos/serviços
    ↑
  STAFF (1)      ← Pode gerenciar revisões
```

### Métodos de Verificação

**hasRole(role)** - Verifica papel específico
```typescript
// Permite apenas SUPER_ADMIN
if (hasRole('SUPER_ADMIN')) {
  // Código específico para super admin
}

// Permite ADMIN ou MANAGER
if (hasRole(['ADMIN', 'MANAGER'])) {
  // Código para admin ou manager
}
```

**hasMinRole(minRole)** - Verifica nível mínimo (hierárquico)
```typescript
// Permite MANAGER, ADMIN e SUPER_ADMIN
if (hasMinRole('MANAGER')) {
  // Código para gerentes e acima
}

// Permite STAFF, MANAGER, ADMIN e SUPER_ADMIN (todos)
if (hasMinRole('STAFF')) {
  // Código para todos os admins
}
```

---

## Estados da Aplicação

### Loading

Enquanto verifica autenticação:
```typescript
if (isLoading) {
  return <LoadingSpinner />;
}
```

### Não Autenticado

Quando não tem token ou token inválido:
```typescript
if (!isAuthenticated) {
  return <AdminLoginDialog />;
}
```

### Autenticado

Quando tem sessão válida:
```typescript
if (isAuthenticated && admin) {
  return <AdminPanel admin={admin} />;
}
```

---

## Configuração de Ambiente

### Variáveis de Ambiente

O contexto usa a variável de ambiente para definir a URL da API:

```env
VITE_API_URL=http://localhost:3002
```

Se não definida, usa `http://localhost:3002` como padrão.

---

## Segurança

### Boas Práticas Implementadas

1. **Token no localStorage**
   - Persistência entre recarregamentos
   - Isolamento por domínio
   - Não exposto em cookies

2. **Validação no Backend**
   - Cada requisição valida o token
   - Tokens expirados são rejeitados
   - Audience verificado (`moria-admin`)

3. **Loading States**
   - Evita flash de conteúdo não autorizado
   - UX suave durante verificação
   - Feedback visual claro

4. **Logout Completo**
   - Remove token do localStorage
   - Limpa estado da aplicação
   - Redireciona para login

5. **Proteção de Rotas**
   - HOC reutilizável
   - Verificação em múltiplos níveis
   - Mensagens claras de erro

---

## Testes Manuais

### Testar Login

1. Acesse `http://localhost:5174/store-panel`
2. Deve aparecer tela de login
3. Use `admin@moria.com` / `Test123!`
4. Deve logar e mostrar o painel
5. Sidebar deve mostrar seu nome e papel

### Testar Sessão Persistente

1. Faça login no painel
2. Recarregue a página (F5)
3. Deve continuar logado sem pedir login novamente
4. Admin info deve aparecer no sidebar

### Testar Logout

1. Com login ativo, clique em "Sair" no sidebar
2. Deve voltar para tela de login
3. Não deve ter acesso ao painel sem logar novamente

### Testar Token Inválido

1. Faça login normalmente
2. Abra DevTools > Application > Local Storage
3. Modifique o valor de `admin_token`
4. Recarregue a página
5. Deve detectar token inválido e mostrar login

### Testar Isolamento

1. Abra duas abas
2. Na aba 1: Logue como cliente em `/customer`
3. Na aba 2: Logue como admin em `/store-panel`
4. Ambos devem funcionar independentemente
5. Logout em uma aba não deve afetar a outra

---

## Troubleshooting

### "No token provided" mesmo após login

**Problema:** Token não está sendo salvo no localStorage

**Solução:**
1. Verifique se o login retornou `success: true`
2. Confirme que `data.data.token` existe na resposta
3. Verifique permissões do localStorage no navegador

### Loading infinito

**Problema:** Requisição para `/auth/admin/profile` está falhando

**Solução:**
1. Verifique se o backend está rodando
2. Confirme a URL da API (`VITE_API_URL`)
3. Verifique CORS no backend
4. Veja console do navegador para erros

### Redirect loop (login → painel → login)

**Problema:** Token está sendo rejeitado repetidamente

**Solução:**
1. Limpe localStorage: `localStorage.clear()`
2. Faça login novamente
3. Verifique se o backend está validando corretamente
4. Confirme que JWT audience está correto

### "Acesso Negado" mesmo com login

**Problema:** Verificação de permissões falhando

**Solução:**
1. Confirme que `admin.role` está correto
2. Verifique hierarquia de roles
3. Use `hasRole` ou `hasMinRole` corretamente
4. Debug com `console.log(admin)` no componente

---

## Próximos Passos

### Features Futuras

1. **Recuperação de Senha**
   - Endpoint de reset de senha
   - Email de recuperação
   - Tela de nova senha

2. **2FA (Two-Factor Authentication)**
   - TOTP com QR Code
   - Backup codes
   - SMS/Email como fallback

3. **Auditoria**
   - Log de logins
   - Histórico de ações
   - IP tracking

4. **Permissões Granulares**
   - Permissões por recurso
   - Permissões customizadas
   - Grupos de permissões

5. **Gestão de Admins**
   - CRUD de administradores
   - Ativação/desativação
   - Alteração de papéis

---

## Conclusão

✅ **Painel administrativo 100% protegido**
✅ **Autenticação funcional com JWT**
✅ **Sessão persistente entre recarregamentos**
✅ **Logout funcional**
✅ **Isolamento total entre cliente e admin**
✅ **Interface moderna e profissional**
✅ **Verificação de permissões por papel**

O sistema de autenticação administrativa está completo e pronto para produção!
