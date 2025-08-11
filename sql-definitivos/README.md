# 🎯 SQLs Definitivos - Instância Supabase Moria

## 📋 Ordem de Execução Obrigatória

Execute os SQLs **EXATAMENTE** nesta ordem para configurar a instância Moria sem erros:

### 🔧 **Pré-Configuração** (se necessário)
- `00_limpar_estruturas.sql` - Execute SE tiver conflitos "already exists"

### 🏗️ **Configuração Principal**
1. `01_extensoes_e_funcoes.sql` - Extensões UUID e funções básicas
2. `02_tabelas_auth.sql` - Profiles, addresses, favorites  
3. `03_tabelas_produtos.sql` - Products com políticas básicas
4. `04_tabelas_servicos.sql` - Services com políticas básicas
5. `05_tabelas_pedidos.sql` - Orders e order_items
6. `06_tabelas_promocoes.sql` - Promotions e coupons (constraints corrigidas)
7. `07_tabelas_configuracao.sql` - Settings e company_info (colunas completas)
8. `08_views_e_funcoes.sql` - Views e funções complexas
9. `09_politicas_admin.sql` - Políticas administrativas (APÓS profiles)
10. `10_dados_iniciais.sql` - Dados básicos e configurações
11. `11_configurar_admin.sql` - Usuário administrador

### ✅ **Validação**
- `99_validar_estrutura.sql` - Verificar se tudo foi criado corretamente

---

## 🚨 **Problemas Corrigidos**

✅ **Recursão infinita** em políticas RLS eliminada  
✅ **Colunas ausentes** em company_info adicionadas  
✅ **Constraints incompatíveis** em promoções corrigidas  
✅ **Ordem de dependências** respeitada  
✅ **Sintaxe JSON** válida em todos os dados  
✅ **Triggers duplicados** prevenidos  

---

## 🎯 **Instruções de Uso**

1. **Acesse** o SQL Editor do Supabase
2. **Execute** cada SQL na ordem numerada (01-11)
3. **Aguarde** confirmação de sucesso antes do próximo
4. **Valide** com `99_validar_estrutura.sql`

⚠️ **IMPORTANTE:** NÃO pule nenhum SQL ou altere a ordem!