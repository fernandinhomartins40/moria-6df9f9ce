# 📋 Plano de Implementação - Painel do Lojista (Store Panel)

## 🎯 Objetivo
Completar e profissionalizar todas as funcionalidades do painel administrativo do lojista, mantendo o design atual e implementando as páginas que estão em desenvolvimento.

---

## 📊 Status Atual das Páginas

### ✅ **IMPLEMENTADAS E FUNCIONAIS**
- **Dashboard** - Métricas e visão geral
- **Pedidos** - Gerenciamento de pedidos com produtos
- **Orçamentos** - Gerenciamento de solicitações de orçamento para serviços
- **Clientes** - Visualização de clientes cadastrados automaticamente
- **Serviços** - Cadastro e gerenciamento de serviços oferecidos
- **Cupons** - Criação e gerenciamento de cupons de desconto

### 🚧 **EM DESENVOLVIMENTO** (Placeholders ativos)
- **Produtos** - Gerenciamento do catálogo e estoque
- **Promoções** - Configuração de ofertas especiais
- **Relatórios** - Análises e relatórios de vendas
- **Configurações** - Configurações do sistema

---

## 🔧 Melhorias nas Páginas Implementadas

### 1. **Dashboard** 
#### Funcionalidades a Adicionar:
- [ ] Gráficos de vendas mensais
- [ ] Top 5 produtos mais vendidos
- [ ] Top 5 serviços mais solicitados
- [ ] Indicadores de performance (KPIs)
- [ ] Alertas de estoque baixo
- [ ] Últimas atividades do sistema

#### Estrutura de Dados:
```typescript
interface DashboardMetrics {
  salesChart: { month: string; sales: number; orders: number }[]
  topProducts: { id: string; name: string; sales: number }[]
  topServices: { id: string; name: string; requests: number }[]
  lowStock: { id: string; name: string; stock: number; minStock: number }[]
  recentActivities: { id: string; type: string; description: string; timestamp: string }[]
}
```

### 2. **Pedidos**
#### Funcionalidades a Adicionar:
- [ ] Filtro por período (hoje, semana, mês)
- [ ] Exportação de pedidos (CSV/PDF)
- [ ] Atualização de status em massa
- [ ] Impressão de etiquetas de envio
- [ ] Histórico de alterações do pedido
- [ ] Notificações automáticas por WhatsApp

### 3. **Orçamentos**
#### Funcionalidades a Adicionar:
- [ ] Criação de orçamento diretamente no painel
- [ ] Templates de orçamento
- [ ] Conversão de orçamento para pedido
- [ ] Acompanhamento de taxa de conversão
- [ ] Anexos de arquivos (fotos, documentos)
- [ ] Histórico de negociação

### 4. **Clientes**
#### Funcionalidades a Adicionar:
- [ ] Edição de dados do cliente
- [ ] Histórico completo de pedidos
- [ ] Análise de comportamento de compra
- [ ] Segmentação de clientes
- [ ] Comunicação direta via WhatsApp
- [ ] Notas internas sobre o cliente

### 5. **Serviços**
#### Funcionalidades a Adicionar:
- [ ] Categorias de serviços
- [ ] Galeria de imagens para cada serviço
- [ ] Precificação dinâmica
- [ ] Agenda de disponibilidade
- [ ] Histórico de prestação de serviços
- [ ] Avaliações e feedback dos clientes

### 6. **Cupons**
#### Funcionalidades a Adicionar:
- [ ] Edição completa de cupons
- [ ] Cupons por categoria de produto/serviço
- [ ] Cupons para clientes específicos
- [ ] Campanhas automáticas
- [ ] Análise de efetividade dos cupons
- [ ] Geração de códigos automática

---

## 🚀 Implementação das Páginas em Desenvolvimento

### 1. **PRODUTOS** 
#### Prioridade: **ALTA** 🔴

**Funcionalidades Principais:**
- [ ] **Cadastro de Produtos**
  - Nome, descrição, categoria
  - Preço de custo e venda
  - Código/SKU único
  - Fornecedor
  - Especificações técnicas

- [ ] **Controle de Estoque**
  - Quantidade atual
  - Estoque mínimo
  - Alertas de estoque baixo
  - Histórico de movimentações
  - Entrada e saída de produtos

- [ ] **Categorização**
  - Categorias e subcategorias
  - Filtros por marca/modelo de veículo
  - Tags para facilitar busca

- [ ] **Galeria de Imagens**
  - Upload múltiplo de imagens
  - Definição de imagem principal
  - Visualização em grid

- [ ] **Preços e Promoções**
  - Preço normal e promocional
  - Preços por quantidade
  - Desconto por perfil de cliente

**Estrutura de Dados:**
```typescript
interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  sku: string
  supplier: string
  costPrice: number
  salePrice: number
  promoPrice?: number
  stock: number
  minStock: number
  images: string[]
  specifications: Record<string, string>
  vehicleCompatibility: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

### 2. **PROMOÇÕES**
#### Prioridade: **MÉDIA** 🟡

**Funcionalidades Principais:**
- [ ] **Campanhas Promocionais**
  - Nome e descrição da campanha
  - Período de vigência
  - Produtos/serviços incluídos
  - Tipo de desconto

- [ ] **Tipos de Promoção**
  - Desconto percentual
  - Desconto fixo
  - Combo de produtos
  - Frete grátis
  - Leve 3 pague 2

- [ ] **Segmentação**
  - Clientes específicos
  - Primeira compra
  - Compras acima de X valor
  - Clientes inativos

- [ ] **Banners e Materiais**
  - Upload de banners promocionais
  - Textos de marketing
  - Cores e temas da promoção

**Estrutura de Dados:**
```typescript
interface Promotion {
  id: string
  name: string
  description: string
  type: 'percentage' | 'fixed' | 'combo' | 'free_shipping'
  discountValue: number
  startDate: string
  endDate: string
  targetAudience: string[]
  products: string[]
  services: string[]
  minPurchaseValue?: number
  maxDiscount?: number
  bannerImage?: string
  isActive: boolean
  createdAt: string
}
```

### 3. **RELATÓRIOS**
#### Prioridade: **ALTA** 🔴

**Funcionalidades Principais:**
- [ ] **Relatórios de Vendas**
  - Vendas por período
  - Vendas por produto/serviço
  - Vendas por cliente
  - Comparativo mensal/anual

- [ ] **Relatórios Financeiros**
  - Receita bruta e líquida
  - Margem de lucro por produto
  - Custos operacionais
  - Fluxo de caixa

- [ ] **Relatórios de Estoque**
  - Produtos em falta
  - Produtos com giro baixo
  - Valor total do estoque
  - Movimentações de entrada/saída

- [ ] **Relatórios de Clientes**
  - Novos clientes por período
  - Clientes mais ativos
  - Ticket médio por cliente
  - Taxa de retenção

- [ ] **Exportação**
  - PDF com gráficos
  - Excel para análise
  - Agendamento de relatórios

**Estrutura de Dados:**
```typescript
interface ReportData {
  type: 'sales' | 'financial' | 'inventory' | 'customers'
  period: { start: string; end: string }
  data: any[]
  charts: ChartData[]
  summary: Record<string, number>
  generatedAt: string
}
```

### 4. **CONFIGURAÇÕES**
#### Prioridade: **BAIXA** 🟢

**Funcionalidades Principais:**
- [ ] **Dados da Empresa**
  - Razão social, CNPJ
  - Endereço completo
  - Telefones e e-mail
  - Redes sociais

- [ ] **Configurações de E-commerce**
  - Formas de pagamento aceitas
  - Taxas de entrega
  - Prazo de entrega
  - Política de troca/devolução

- [ ] **Notificações**
  - E-mail de novos pedidos
  - WhatsApp automático
  - Lembretes de estoque baixo
  - Backup automático de dados

- [ ] **Integrações**
  - API de consulta de CEP
  - Gateway de pagamento
  - Transportadoras
  - Contador/sistemas externos

- [ ] **Usuários e Permissões**
  - Cadastro de funcionários
  - Níveis de acesso
  - Log de atividades
  - Sessões ativas

---

## 📅 Cronograma de Implementação

### **FASE 1 - PRODUTOS** (2-3 semanas)
- Semana 1: CRUD básico de produtos
- Semana 2: Controle de estoque e imagens
- Semana 3: Categorização e filtros avançados

### **FASE 2 - RELATÓRIOS** (2 semanas)
- Semana 1: Relatórios básicos (vendas, estoque)
- Semana 2: Gráficos e exportação

### **FASE 3 - PROMOÇÕES** (1-2 semanas)
- Semana 1: CRUD de promoções e tipos básicos
- Semana 2: Segmentação e materiais promocionais

### **FASE 4 - CONFIGURAÇÕES** (1 semana)
- Implementação das configurações essenciais

### **FASE 5 - MELHORIAS GERAIS** (1 semana)
- Polimento das páginas existentes
- Testes finais e correções

---

## 🔧 Tecnologias e Padrões

### **Mantidos:**
- React + TypeScript
- Tailwind CSS + shadcn/ui
- LocalStorage para persistência
- Lucide React para ícones
- Design system atual

### **Novos Componentes Necessários:**
- DatePicker para seleção de datas
- FileUpload para imagens
- Charts para gráficos (Recharts)
- DataTable com paginação
- Modal para edição
- Toast para notificações

### **Estrutura de Dados:**
- Todas as entidades salvas em `localStorage`
- Prefixo `store_` para identificação
- JSON estruturado e tipado
- Versionamento de dados para migração

---

## 🎯 Metas de Qualidade

### **Performance:**
- Carregamento < 2s
- Responsividade total
- Lazy loading de imagens

### **Usabilidade:**
- Interface intuitiva
- Feedback visual claro
- Navegação consistente

### **Dados:**
- Backup automático
- Validação de entrada
- Tratamento de erros

### **Compatibilidade:**
- Chrome, Firefox, Safari
- Desktop e mobile
- Resolução mínima 1280px

---

## 📝 Observações Importantes

1. **Design**: Manter exatamente o mesmo padrão visual atual
2. **Dados**: Todos os dados ficam no localStorage
3. **Integração**: Os cupons e serviços criados devem aparecer no painel do cliente
4. **Progressivo**: Implementar uma funcionalidade por vez
5. **Testes**: Testar cada feature antes de prosseguir

---

*Este documento será atualizado conforme o progresso da implementação.*