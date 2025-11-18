# 🔐 CORREÇÃO: Erro 401 Unauthorized ao Salvar Produto

## ❌ PROBLEMA

```
PUT http://localhost:3001/products/{id} 401 (Unauthorized)
```

**Causa raiz:** O ProductModal estava buscando o token errado no localStorage.

---

## 🔍 DIAGNÓSTICO

### Token sendo salvo:
```typescript
// AdminAuthContext.tsx linha 102
localStorage.setItem('admin_token', data.data.token);
```

### Token sendo buscado (ERRADO):
```typescript
// ProductModal.tsx linha 307 (ANTES)
const token = localStorage.getItem('token');  // ❌ ERRADO!
```

**Resultado:** Token não encontrado → Header sem Authorization → Backend retorna 401

---

## ✅ SOLUÇÃO IMPLEMENTADA

### Buscar o token correto com fallback:
```typescript
// ProductModal.tsx linha 307 (DEPOIS)
const token = localStorage.getItem('admin_token') || localStorage.getItem('token');

if (!token) {
  throw new Error('Token de autenticação não encontrado. Faça login novamente.');
}
```

### Por que usar fallback?
1. **admin_token**: Token do admin (painel store-panel)
2. **token**: Token do cliente (fallback para compatibilidade)
3. **Validação**: Se nenhum existe, erro claro ao usuário

---

## 🧪 TESTE

### Antes da correção:
1. Login no admin → Token salvo como `admin_token`
2. Tentar salvar produto → Busca `token` (não existe)
3. Request sem Authorization header
4. **Resultado**: 401 Unauthorized ❌

### Depois da correção:
1. Login no admin → Token salvo como `admin_token`
2. Tentar salvar produto → Busca `admin_token` ✅
3. Request com `Authorization: Bearer {token}`
4. **Resultado**: 200/201 Success ✅

---

## 🎯 LOCAIS QUE USAM TOKENS

### Correto (admin_token):
- ✅ AdminAuthContext.tsx
- ✅ **ProductModal.tsx** (CORRIGIDO)

### Para verificar/corrigir:
- [ ] Outros modais de admin que usam fetch direto
- [ ] ServiceModal.tsx
- [ ] CouponModal.tsx
- [ ] Outros componentes que fazem upload

---

## 🔧 PADRÃO RECOMENDADO

Para evitar esse problema no futuro, criar um helper:

```typescript
// utils/auth.ts
export const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token') || localStorage.getItem('token');
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
```

**Uso:**
```typescript
import { getAuthToken, getAuthHeaders } from '@/utils/auth';

// Opção 1: Só o token
const token = getAuthToken();
if (!token) throw new Error('Não autenticado');

// Opção 2: Headers completos
fetch(url, {
  headers: {
    ...getAuthHeaders(),
    'Content-Type': 'application/json'
  }
});
```

---

## ✅ CHECKLIST

- [x] Corrigido ProductModal.tsx
- [x] Adicionada validação de token
- [x] Mensagem de erro clara
- [x] Fallback para compatibilidade
- [x] Documentação criada
- [ ] Verificar outros modais
- [ ] Criar helper de autenticação
- [ ] Padronizar uso de tokens

---

## 🎉 RESULTADO

**Agora o salvamento de produtos funciona perfeitamente!**

✅ Token correto é encontrado
✅ Authorization header é enviado
✅ Backend autentica com sucesso
✅ Produto é salvo/atualizado
✅ Toast de sucesso aparece
✅ Modal fecha
✅ Lista recarrega

**401 Unauthorized resolvido! 🚀**
