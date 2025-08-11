# 🚀 Configuração Supabase - Ordem de Execução

## ⚠️ IMPORTANTE
Execute os SQLs **EXATAMENTE** nesta ordem no Supabase SQL Editor.

---

## 📋 PASSO A PASSO

### 1️⃣ **Criar Projeto Supabase**
1. Acesse https://supabase.com/
2. Clique em "New Project"
3. Configure:
   - Nome: `moria-pecas-servicos`
   - Região: `South America (São Paulo)`
   - Senha: anote para uso futuro
4. Aguarde criação (~2 minutos)

### 2️⃣ **Executar SQLs Sequencialmente**

#### **SQL 0: Limpeza (SE NECESSÁRIO)**
📄 `00_limpar_se_necessario.sql` - **APENAS se tiver erros "already exists"**
- 🔧 Remove triggers/políticas existentes
- ✅ Deve mostrar: "Limpeza concluída!"

#### **SQL 1: Extensões e Funções**
📄 `01_criar_extensoes_e_funcoes.sql`
- ✅ Deve mostrar: "Extensões e funções criadas com sucesso!"

#### **SQL 2: Tabela Products**
📄 `02_criar_tabela_products.sql`
- ✅ Deve mostrar: "Tabela products criada com sucesso!"
- ✅ Total products: 0

#### **SQL 3: Tabela Services**
📄 `03_criar_tabela_services.sql`
- ✅ Deve mostrar: "Tabela services criada com sucesso!"
- ✅ Total services: 0

#### **SQL 4: Tabelas Orders**
📄 `04_criar_tabelas_orders.sql`
- ✅ Deve mostrar: "Tabelas de pedidos criadas com sucesso!"
- ✅ Total orders: 0, Total order_items: 0

#### **SQL 5: Promoções e Cupons**
📄 `05_criar_tabelas_promocoes.sql`
- ✅ Deve mostrar: "Tabelas de promoções e cupons criadas com sucesso!"
- ✅ Total promotions: 0, Total coupons: 0

#### **SQL 6: Autenticação**
📄 `06_criar_tabelas_auth.sql`
- ✅ Deve mostrar: "Tabelas de autenticação criadas com sucesso!"
- ✅ Total profiles/addresses/favorites: 0

#### **SQL 7: Configuração**
📄 `07_criar_tabelas_configuracao.sql`
- ✅ Deve mostrar: "Tabelas de configuração criadas com sucesso!"
- ✅ Total settings/company_info: 0

#### **SQL 8: Views Úteis**
📄 `08_criar_views_uteis.sql`
- ✅ Deve mostrar: "Views criadas com sucesso!"
- ✅ Dashboard stats e contadores

#### **SQL 9: Dados Iniciais**
📄 `09_inserir_dados_iniciais.sql`
- ✅ Deve mostrar múltiplas confirmações
- ✅ Produtos: 5, Serviços: 5, etc.

### 3️⃣ **Criar Usuário Admin (ESPECIAL)**

#### **NO DASHBOARD SUPABASE:**
1. Vá para **Authentication > Users**
2. Clique em **"Add user"**
3. Preencha:
   ```
   Email: admin@moria.com
   Password: [senha segura - ANOTE!]
   Email Confirm: ✅ (marcar)
   ```
4. Clique em **"Create user"**
5. **COPIE O USER ID** (ex: `a1b2c3d4-e5f6-7890-1234-567890abcdef`)

#### **SQL 10: Perfil Admin**
📄 `10_criar_usuario_admin.sql`
- ⚠️ **SUBSTITUIR** `'SEU_USER_ID_AQUI'` pelo ID real
- ✅ Deve mostrar: "Usuário admin criado com sucesso!" com dados

### 4️⃣ **Configurar .env**
Crie arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave-anonima]
VITE_ENVIRONMENT=development
VITE_WHATSAPP_NUMBER=5511999999999
VITE_COMPANY_NAME="Moria Peças & Serviços"
```

**Para obter URL e Key:**
- Dashboard > Settings > API
- Copiar "Project URL" e "anon public"

### 5️⃣ **Testar Configuração**
```bash
npm run setup:prod  # Verificar setup
npm run dev         # Testar aplicação
```

**Acesse:**
- http://localhost:8080 - Site principal
- http://localhost:8080/store-panel - Admin (login com admin@moria.com)

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] ✅ Projeto Supabase criado
- [ ] ✅ 10 SQLs executados em ordem
- [ ] ✅ Usuário admin criado no Dashboard
- [ ] ✅ Perfil admin criado no SQL 10
- [ ] ✅ Arquivo .env configurado
- [ ] ✅ `npm run dev` sem erros
- [ ] ✅ Login admin funciona

---

## 🚨 TROUBLESHOOTING

### ❌ "relation does not exist"
**Solução:** Execute os SQLs na ordem exata

### ❌ "permission denied for table"
**Solução:** RLS está ativo - normal, continue

### ❌ "duplicate key value"
**Solução:** SQL já foi executado - continue

### ❌ Admin não consegue logar
**Solução:** 
1. Verifique se usuário foi criado no Dashboard
2. Verifique se SQL 10 foi executado com ID correto
3. Verifique se email/senha estão corretos

---

## ⏱️ TEMPO TOTAL ESTIMADO
**~30-40 minutos** para configuração completa.

---

**🎯 Após completar estes passos, sua aplicação estará 100% funcional!**