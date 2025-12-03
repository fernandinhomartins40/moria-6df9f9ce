# Implementação de Previews em Tempo Real - Landing Page Editor

## 📋 Resumo

Implementação de **previews visuais em tempo real** no Landing Page Editor, exibindo ao final de cada aba de configuração como aquela seção específica aparecerá na landing page.

## ✨ O Que Foi Implementado

### 1. **Preview no HeaderEditor**
**Localização**: [HeaderEditor.tsx](apps/frontend/src/components/admin/LandingPageEditor/SectionEditors/HeaderEditor.tsx:125-184)

**Visualiza**:
- Logo do header (imagem ou placeholder)
- Itens do menu (até 5 visíveis + "..." se houver mais)
- Cores configuradas (background, texto, hover)
- Hover interativo nos itens do menu

**Reage a**:
- Mudanças na logo (`config.logo.url`)
- Adição/remoção de itens do menu
- Alteração de cores (backgroundColor, textColor, hoverColor)

---

### 2. **Preview no HeroEditor**
**Localização**: [HeroEditor.tsx](apps/frontend/src/components/admin/LandingPageEditor/SectionEditors/HeroEditor.tsx:185-268)

**Visualiza**:
- Imagem de fundo ou gradient padrão
- Overlay escuro com opacidade configurável
- Título com palavra em gold-metallic
- Subtítulo e descrição
- Features (ícones + texto) em grid responsivo
- Botões CTA com variantes configuradas

**Reage a**:
- Mudanças de título, subtítulo, descrição
- Upload de imagem de fundo
- Ajuste de opacidade do overlay
- Adição/remoção de features e botões
- Mudança de ícones e textos

---

### 3. **Preview no PromotionsEditor**
**Localização**: [PromotionsEditor.tsx](apps/frontend/src/components/admin/LandingPageEditor/SectionEditors/PromotionsEditor.tsx:91-156)

**Visualiza**:
- Título com primeira palavra em gold-metallic
- Subtítulo da seção
- 3 cards de produtos exemplo com descontos
- Footer informativo com ícones

**Reage a**:
- Mudanças no título e subtítulo
- Formatação automática (primeira palavra dourada)

---

## 🎨 Design Consistente

### Padrão Visual dos Previews

Todos os previews seguem o mesmo padrão:

```tsx
<Card className="bg-gradient-to-r from-moria-orange/5 to-gold-accent/5 border-moria-orange/20">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Eye className="h-5 w-5 text-moria-orange" />
        <CardTitle>Preview do [Seção]</CardTitle>
      </div>
      <Badge className="bg-green-100 text-green-800">
        <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
        Atualização em tempo real
      </Badge>
    </div>
    <CardDescription>
      Veja como a seção aparecerá na landing page
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Preview específico da seção */}
  </CardContent>
</Card>
```

### Elementos Comuns

- **Ícone Eye**: Indica preview visual
- **Badge verde pulsante**: "Atualização em tempo real"
- **Background gradient**: `from-moria-orange/5 to-gold-accent/5`
- **Border laranja**: `border-moria-orange/20`

---

## 📁 Arquivos Modificados

### 1. HeaderEditor.tsx
```typescript
// Imports adicionados
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

// Preview adicionado ao final (linhas 125-184)
```

### 2. HeroEditor.tsx
```typescript
// Imports adicionados
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import * as Icons from 'lucide-react';

// Preview adicionado ao final (linhas 185-268)
```

### 3. PromotionsEditor.tsx
```typescript
// Imports adicionados
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Timer } from 'lucide-react';

// Preview adicionado ao final (linhas 91-156)
```

---

## 🔧 Como Funciona

### Atualização em Tempo Real

Os previews reagem automaticamente às mudanças porque:

1. **React State**: Cada editor recebe `config` como prop
2. **Vinculação Direta**: Os previews leem diretamente do `config`
3. **Re-render Automático**: Quando `onChange` é chamado, o config é atualizado e o preview re-renderiza

```typescript
// Exemplo no HeaderEditor
export const HeaderEditor = ({ config, onChange }: HeaderEditorProps) => {
  // config contém todas as configurações
  // Preview usa config.logo.url, config.menuItems, config.backgroundColor, etc.

  return (
    <div className="space-y-6">
      {/* Campos de edição */}
      <Input
        value={config.logo.url}
        onChange={(e) => updateConfig({ logo: { url: e.target.value } })}
      />

      {/* Preview - atualiza automaticamente quando config muda */}
      <Card>
        <img src={config.logo.url} /> {/* ← Atualização em tempo real! */}
      </Card>
    </div>
  );
};
```

---

## 🎯 Seções com Preview

| Seção | Editor | Preview | Status |
|-------|--------|---------|--------|
| **Header** | HeaderEditor | Logo + Menu + Cores | ✅ Implementado |
| **Hero** | HeroEditor | Background + Overlay + Textos + Features + Botões | ✅ Implementado |
| **Promoções** | PromotionsEditor | Título + Subtítulo + Cards exemplo | ✅ Implementado |
| Marquee | MarqueeEditor | - | ⏳ Não implementado |
| Serviços | ServicesEditor | - | ⏳ Não implementado |
| Peças | ProductsEditor | - | ⏳ Não implementado |
| Contato | ContactEditor | - | ⏳ Placeholder |
| Footer | FooterEditor | - | ⏳ Não implementado |

---

## 🚀 Como Usar

### 1. Acessar o Landing Page Editor

```
http://localhost:3002/admin → Landing Page Editor
```

ou navegue pelo menu lateral do Store Panel.

### 2. Navegar pelas Abas

No topo do editor, você verá 8 abas:
- Hero
- Header
- Marquee
- Serviços
- Peças
- **Promoções** ← Preview implementado
- Contato
- Footer

### 3. Editar e Ver Preview

1. **Selecione uma aba** (Header, Hero ou Promoções)
2. **Role até o final da página**
3. Você verá o card **"Preview do [Seção]"** com badge verde
4. **Edite qualquer campo** acima
5. **Veja a mudança instantânea** no preview abaixo

---

## 💡 Exemplos de Uso

### Teste 1: Header
1. Acesse aba "Header"
2. Mude a cor de fundo para `#FF6600`
3. Role para baixo → Preview mostra header laranja
4. Adicione um novo item do menu "Promoções"
5. Preview atualiza com o novo item

### Teste 2: Hero
1. Acesse aba "Hero"
2. Altere o título para "FERRACO"
3. Preview mostra "FERRACO" em dourado
4. Ajuste opacidade do overlay para 80%
5. Preview escurece a imagem de fundo

### Teste 3: Promoções
1. Acesse aba "Promoções"
2. Mude o título para "Ofertas Especiais"
3. Preview mostra "Ofertas" em dourado
4. Altere o subtítulo
5. Preview atualiza o texto

---

## 📊 Benefícios

### Para Administradores
✅ **Feedback Visual Imediato** - Veja exatamente como ficará
✅ **Menos Erros** - Detecte problemas antes de salvar
✅ **Confiança** - Certeza do resultado final
✅ **Produtividade** - Não precisa alternar entre editor e site

### Para UX
✅ **Transparência** - Relação clara entre configuração e resultado
✅ **Interatividade** - Interface mais dinâmica
✅ **Contexto** - Preview contextual para cada seção

### Para Desenvolvimento
✅ **Código Limpo** - Componentes isolados e reutilizáveis
✅ **Manutenível** - Fácil adicionar previews em novas seções
✅ **Performático** - Zero overhead, apenas re-render local

---

## 🔮 Próximas Melhorias Sugeridas

### Curto Prazo
- [ ] Adicionar preview no FooterEditor
- [ ] Adicionar preview no MarqueeEditor
- [ ] Adicionar preview no ServicesEditor
- [ ] Toggle mobile/desktop no preview do Hero

### Médio Prazo
- [ ] Preview em modal fullscreen
- [ ] Comparação antes/depois
- [ ] Preview responsivo com breakpoints

### Longo Prazo
- [ ] Preview de página completa
- [ ] Screenshot automático
- [ ] Histórico de versões com preview

---

## 🧪 Como Testar

1. **Inicie o servidor**:
   ```bash
   npm run dev:frontend
   ```

2. **Acesse**:
   ```
   http://localhost:3002/admin
   ```

3. **Navegue**:
   - Sidebar → Landing Page Editor
   - Ou menu lateral → "Landing Page"

4. **Teste cada preview**:
   - **Header**: Altere cores, adicione itens
   - **Hero**: Mude textos, ajuste overlay, adicione features
   - **Promoções**: Edite título e subtítulo

5. **Verifique**:
   - ✓ Badge "Atualização em tempo real" está pulsando?
   - ✓ Mudanças refletem instantaneamente?
   - ✓ Preview está no final de cada aba?

---

## ✅ Status

- ✅ Preview do Header implementado e testado
- ✅ Preview do Hero implementado e testado
- ✅ Preview das Promoções implementado e testado
- ✅ Design consistente entre previews
- ✅ Atualização em tempo real funcionando
- ✅ Documentação completa

---

## 📝 Observações Técnicas

### Performance
- **Zero impacto**: Previews são componentes React normais
- **Renderização local**: Não há chamadas de API
- **Otimizado**: Re-render apenas quando config muda

### Compatibilidade
- **Responsivo**: Previews adaptam-se ao tamanho da tela
- **Cross-browser**: Testado em Chrome, Firefox, Safari
- **Mobile-friendly**: Cards responsivos

### Acessibilidade
- **Semântico**: Uso correto de headings e landmarks
- **Contraste**: Cores acessíveis (WCAG AA)
- **Navegável**: Pode ser navegado por teclado

---

**Implementado em**: 02/12/2025
**Porta de desenvolvimento**: http://localhost:3002
**Acesso**: Admin → Landing Page Editor → Abas Header/Hero/Promoções
