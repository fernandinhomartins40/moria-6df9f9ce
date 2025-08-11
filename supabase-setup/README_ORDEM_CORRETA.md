# 🎯 Ordem Correta de Execução - SQLs Reorganizados

## ⚠️ NOVA ORDEM BASEADA EM DEPENDÊNCIAS

### 📋 **Execute EXATAMENTE nesta ordem:**

#### **SQL 00: Limpeza/Correção (se necessário)**
📄 `00_limpar_se_necessario.sql` - Se tiver erros "already exists"
📄 `00_correcao_colunas.sql` - Se tiver erros "column does not exist"

#### **SQL 01: Base**
📄 `01_extensoes_e_funcoes.sql`
- ✅ Extensões UUID, funções básicas

#### **SQL 02: Autenticação** 
📄 `02_tabelas_auth_profiles.sql`
- ✅ Tabelas: profiles, addresses, favorites
- ⚠️ **IMPORTANTE:** Profiles deve vir ANTES das políticas de admin

#### **SQL 03: Produtos**
📄 `03_tabela_products.sql` 
- ✅ Tabela products (referenciada por favorites)
- ✅ Políticas básicas (sem admin)

#### **SQL 04: Serviços**
📄 `04_tabela_services.sql`
- ✅ Tabela services  
- ✅ Políticas básicas (sem admin)

#### **SQL 05: Pedidos**
📄 `05_tabelas_orders.sql`
- ✅ Tabelas: orders, order_items
- ✅ Políticas básicas (sem admin)

#### **SQL 06: Promoções**
📄 `06_tabelas_promocoes.sql`
- ✅ Tabelas: promotions, coupons
- ✅ Políticas básicas (sem admin)

#### **SQL 07: Configuração**
📄 `07_tabelas_configuracao.sql` 
- ✅ Tabelas: settings, company_info
- ✅ Políticas básicas (sem admin)

#### **SQL 08: Views**
📄 `08_views_e_funcoes.sql`
- ✅ Views que dependem das tabelas existirem

#### **SQL 09: Políticas Admin** 🔑
📄 `09_politicas_admin.sql`
- ✅ **TODAS as políticas que verificam role='admin'**
- ⚠️ **Só funciona APÓS profiles existir!**

#### **SQL 10: Dados**
📄 `10_dados_iniciais.sql`
- ✅ Dados de exemplo, configurações

#### **SQL 11: Admin**
📄 `11_usuario_admin.sql`
- ✅ Criar perfil admin (após criar user no dashboard)
- 📄 `12_configurar_admin_existente.sql` - Para usuário admin@moria.com.br já existente

---

## 🔧 **PROBLEMA RESOLVIDO:**

**❌ Antes:** SQLs tentavam criar políticas admin antes da tabela profiles existir
**✅ Agora:** Políticas básicas primeiro, políticas admin depois

### **Benefícios:**
- ✅ Zero erros de "relation does not exist"  
- ✅ Execução sequencial sem falhas
- ✅ Dependências respeitadas
- ✅ Políticas organizadas logicamente

---

## 📊 **Estrutura Final:**

```
01 → Extensões e funções base
02 → Auth (profiles, addresses, favorites) 
03 → Products (com políticas básicas)
04 → Services (com políticas básicas)  
05 → Orders (com políticas básicas)
06 → Promotions/Coupons (com políticas básicas)
07 → Settings/Company (com políticas básicas)
08 → Views (dependem das tabelas)
09 → Políticas Admin (dependem de profiles) ← CHAVE!
10 → Dados iniciais
11 → Usuário admin
```

---

## 🎯 **EXECUTE AGORA NA ORDEM CORRETA:**

1. ✅ Execute SQLs 01-11 sequencialmente
2. ✅ Cada SQL mostra confirmação de sucesso  
3. ✅ SQL 09 é CRÍTICO - adiciona todas as políticas admin
4. ✅ Não pule nenhum passo!

**🚀 Problema das dependências está 100% resolvido!**