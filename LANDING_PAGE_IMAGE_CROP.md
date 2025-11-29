# Sistema de Crop de Imagens - Landing Page Editor

## 📋 Resumo

Implementação completa do sistema de crop de imagens para o editor da Landing Page da Moria. Todas as imagens agora passam por um processo de crop antes do upload, garantindo dimensões adequadas e qualidade otimizada.

## ✅ Implementações Realizadas

### 1. **Atualização de Tipos**

Arquivo: `apps/frontend/src/types/landingPage.ts`

```typescript
export interface ImageConfig {
  url: string;
  alt: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  width?: number;      // Largura recomendada em pixels
  height?: number;     // Altura recomendada em pixels
  aspectRatio?: number | null; // Proporção (ex: 16/9, 1, null=livre)
}
```

### 2. **Novo Componente: ImageUploaderWithCrop**

Arquivo: `apps/frontend/src/components/admin/LandingPageEditor/StyleControls/ImageUploaderWithCrop.tsx`

**Características:**
- ✂️ Integração com `ProductImageCropper` (usando `react-image-crop`)
- 📐 Suporte a aspect ratio fixo ou livre
- 🗜️ Compressão automática com `browser-image-compression`
- 📊 Exibição de dimensões recomendadas
- 🎯 Validação de tamanho de arquivo
- 🔄 Preview em tempo real
- ⚠️ Tratamento de erros com retry

**Parâmetros:**
```typescript
interface ImageUploaderWithCropProps {
  label: string;
  value: ImageConfig;
  onChange: (image: ImageConfig) => void;
  description?: string;
  acceptedFormats?: string[];
  recommendedWidth?: number;      // Padrão: 1920
  recommendedHeight?: number;     // Padrão: 1080
  aspectRatio?: number | null;    // null=livre, número=fixo
  maxFileSizeMB?: number;         // Padrão: 5
}
```

### 3. **Editores de Seção Criados/Atualizados**

#### HeroEditor (atualizado)
Arquivo: `apps/frontend/src/components/admin/LandingPageEditor/SectionEditors/HeroEditor.tsx`

**Especificações de Imagem:**
- Dimensões: 1920x1080px
- Aspect Ratio: 16:9 (fixo)
- Tamanho máximo: 10MB
- Uso: Imagem de fundo do banner principal

#### HeaderEditor (novo)
Arquivo: `apps/frontend/src/components/admin/LandingPageEditor/SectionEditors/HeaderEditor.tsx`

**Especificações de Imagem:**
- Dimensões: 200x60px
- Aspect Ratio: Livre
- Tamanho máximo: 2MB
- Uso: Logo do cabeçalho

**Funcionalidades:**
- ✅ Toggle de habilitação
- 🎨 Edição de cores (fundo, texto, hover)
- 📝 Gerenciamento de itens do menu
- 🖼️ Upload de logo com crop

#### FooterEditor (novo)
Arquivo: `apps/frontend/src/components/admin/LandingPageEditor/SectionEditors/FooterEditor.tsx`

**Especificações de Imagem:**
- Dimensões: 200x60px
- Aspect Ratio: Livre
- Tamanho máximo: 2MB
- Uso: Logo do rodapé

**Funcionalidades:**
- ✅ Toggle de habilitação
- 🖼️ Upload de logo com crop
- 📝 Edição de descrição
- 📞 Informações de contato completas
- 🕐 Horário de funcionamento
- 🔧 Lista de serviços
- 📱 Redes sociais
- 🏆 Certificações e selos
- ⚖️ Copyright e links inferiores

### 4. **Integração no Editor Principal**

Arquivo: `apps/frontend/src/pages/admin/LandingPageEditor.tsx`

**Mudanças:**
- Importação dos novos editores
- Substituição dos placeholders por editores funcionais
- Tabs Header e Footer agora totalmente funcionais

## 📐 Especificações de Dimensões por Tipo de Imagem

| Tipo de Imagem | Largura | Altura | Aspect Ratio | Tamanho Máx | Uso |
|----------------|---------|--------|--------------|-------------|-----|
| **Hero Background** | 1920px | 1080px | 16:9 (fixo) | 10MB | Banner principal full-width |
| **Header Logo** | 200px | 60px | Livre | 2MB | Logo do cabeçalho |
| **Footer Logo** | 200px | 60px | Livre | 2MB | Logo do rodapé |

## 🔄 Fluxo de Upload com Crop

```
1. Usuário seleciona arquivo
   ↓
2. Validação (formato, tamanho)
   ↓
3. Exibição do cropper modal
   ↓
4. Usuário ajusta crop
   ↓
5. Compressão automática (max 1MB, qualidade 85%)
   ↓
6. Upload para servidor
   ↓
7. Atualização do preview com URL final
```

## 🎨 Ferramentas de Crop Utilizadas

### ProductImageCropper
- Biblioteca: `react-image-crop`
- Interface visual consistente
- Suporte a aspect ratio
- Grid de auxílio
- Controles intuitivos

### Compressão
- Biblioteca: `browser-image-compression`
- Redução automática de tamanho
- Qualidade ajustável
- Web Workers para performance

## 📁 Estrutura de Arquivos

```
apps/frontend/src/
├── types/
│   └── landingPage.ts                    # ✅ Tipos atualizados
├── components/
│   ├── ui/
│   │   ├── ImageCropper.tsx             # Cropper customizado (existente)
│   │   └── switch.tsx                    # Switch UI (existente)
│   └── admin/
│       ├── ProductImageCropper.tsx       # 🔧 Usado no crop
│       └── LandingPageEditor/
│           ├── StyleControls/
│           │   ├── ImageUploader.tsx          # Versão antiga (sem crop)
│           │   ├── ImageUploaderWithCrop.tsx  # ✅ NOVO com crop
│           │   └── index.ts                   # ✅ Atualizado
│           └── SectionEditors/
│               ├── HeroEditor.tsx        # ✅ Atualizado
│               ├── HeaderEditor.tsx      # ✅ NOVO
│               ├── FooterEditor.tsx      # ✅ NOVO
│               └── index.ts              # ✅ NOVO
└── pages/
    └── admin/
        └── LandingPageEditor.tsx         # ✅ Atualizado
```

## 🧪 Como Testar

### 1. Acessar o Editor
```
URL: /admin/landing-page-editor
```

### 2. Testar Hero (Tab Hero)
1. Rolar até "Imagem de Fundo do Hero"
2. Clicar na área de upload ou arrastar imagem
3. Ajustar crop (16:9 fixo)
4. Verificar preview
5. Salvar configuração

### 3. Testar Header (Tab Header)
1. Ir para tab "Header"
2. Fazer upload da logo
3. Ajustar crop (livre)
4. Configurar cores e menu
5. Salvar

### 4. Testar Footer (Tab Footer)
1. Ir para tab "Footer"
2. Fazer upload da logo
3. Preencher informações de contato
4. Configurar serviços e redes sociais
5. Salvar

## ⚙️ Configurações de Compressão

```typescript
const compressionOptions = {
  maxSizeMB: 1,                           // Máximo 1MB após compressão
  maxWidthOrHeight: Math.max(width, height), // Mantém dimensões recomendadas
  useWebWorker: true,                     // Performance
  fileType: 'image/jpeg',                 // Formato final
  initialQuality: 0.85,                   // 85% de qualidade
};
```

## 📝 Validações Implementadas

### Formato de Arquivo
```typescript
acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
```

### Tamanho de Arquivo
- Hero: 10MB máximo
- Logos: 2MB máximo

### Aspect Ratio
- Hero: 16:9 (forçado)
- Logos: Livre (usuário escolhe)

## 🎯 Benefícios

1. **Qualidade Consistente**: Todas as imagens seguem padrões definidos
2. **Performance**: Compressão automática reduz tamanho dos arquivos
3. **UX Melhorada**: Interface visual para ajuste preciso
4. **Validação**: Previne uploads de arquivos inadequados
5. **Feedback**: Mensagens claras de erro e progresso
6. **Acessibilidade**: Campo Alt text obrigatório

## 🔮 Próximos Passos

- [ ] Implementar editores para as outras seções (Marquee, Services, Products, Promotions, Contact)
- [ ] Adicionar preview em tempo real das mudanças
- [ ] Implementar histórico de versões
- [ ] Adicionar mais opções de aspect ratio pré-definidas
- [ ] Criar biblioteca de imagens reutilizáveis

## 🐛 Troubleshooting

### Crop não aparece
- Verificar se `react-image-crop` está instalado
- Verificar se CSS está importado

### Erro no upload
- Verificar endpoint `/api/upload/image`
- Verificar permissões de arquivo
- Verificar logs do servidor

### Imagem não comprime
- Verificar se `browser-image-compression` está instalado
- Verificar tamanho original do arquivo
- Ajustar `initialQuality` se necessário

## 📚 Dependências

```json
{
  "react-image-crop": "^10.x.x",
  "browser-image-compression": "^2.x.x"
}
```

---

**Implementado em:** 2025-11-29
**Status:** ✅ Completo e funcional
**Desenvolvedor:** Claude Code
