# Como Limpar o Service Worker e Testar

## Problema Identificado
Erro 401 (Unauthorized) - Service Worker está servindo cache antigo sem autenticação válida.

## Solução Rápida

### Opção 1: Hard Refresh (Recomendado)
1. **Abra o DevTools** (F12)
2. **Vá para a aba "Application"** ou "Aplicação"
3. **No menu lateral esquerdo**, clique em "Service Workers"
4. **Clique em "Unregister"** ao lado do service worker ativo
5. **Feche e abra novamente** o navegador
6. **Faça login** em: http://localhost:3000/admin/login

### Opção 2: Clear Storage Completo
1. **Abra DevTools** (F12)
2. **Vá para "Application" > "Storage"**
3. **Clique em "Clear site data"**
4. **Recarregue a página** (Ctrl+Shift+R ou Cmd+Shift+R)
5. **Faça login novamente**

### Opção 3: Incógnito/Private
1. **Abra uma janela anônima** (Ctrl+Shift+N)
2. **Acesse** http://localhost:3000/admin/login
3. **Faça login**
4. **Teste o botão editar**

## Teste do Botão Editar

Depois de autenticado, teste:

1. **Vá para "Gerenciar Serviços"**
2. **Abra o Console** (F12 → Console)
3. **Clique no botão "Editar"** de qualquer serviço

### Logs Esperados:
```
[AdminServicesSection] Card clicado - target: <button>
[AdminServicesSection] Botão Editar clicado! abc-123-456
[AdminServicesSection] Abrindo modal para editar serviço: { id: "...", name: "..." }
[AdminServicesSection] Modal configurado com sucesso
[ServiceModal] useEffect disparado: { isOpen: true, hasService: true, ... }
[ServiceModal] Preenchendo formulário com dados do serviço: {...}
[ServiceModal] Formulário preenchido com sucesso
```

### Se Ainda Não Funcionar:
Me envie uma captura de tela do console completo após clicar em "Editar".

---

**Data:** 2025-12-02
**Problema:** 401 Unauthorized + Service Worker Cache
**Solução:** Limpar SW + Re-autenticar
