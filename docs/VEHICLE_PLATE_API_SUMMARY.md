# 🚗 Resumo Executivo: API de Consulta de Placas

**Data**: 24/11/2025
**Status**: Proposta aguardando aprovação

---

## 📝 O que foi pesquisado?

APIs brasileiras para consulta automática de dados de veículos através da placa, permitindo auto-preenchimento no cadastro de veículos do sistema Moria.

---

## 🎯 Principais APIs Encontradas

### 1. **API Brasil** ⭐ (RECOMENDADA)
- **Custo**: GRATUITO (100 consultas/dia) + planos pagos
- **Dados**: Marca, modelo, ano, cor, chassi, município, status de roubo
- **Vantagens**: Suporte BR, documentação clara, plano gratuito generoso

### 2. **FIPE API**
- **Custo**: Token mediante cadastro
- **Dados**: Tudo do API Brasil + valor FIPE e código FIPE
- **Vantagens**: Inclui precificação oficial

### 3. **SINESP (Open Source)**
- **Custo**: GRATUITO (sem limites)
- **Dados**: Básicos do veículo
- **Vantagens**: Totalmente gratuito
- **Desvantagens**: Pode ser instável

### 4. **API Placas**
- **Custo**: Token mediante cadastro
- **Dados**: +300 milhões de registros
- **Vantagens**: Base ampla

### 5. **PlacaAPI**
- **Custo**: R$ 0,80/consulta (10 créditos grátis para teste)
- **Dados**: +20 campos técnicos
- **Vantagens**: Muitos detalhes técnicos

---

## 💡 Proposta de Implementação

### O que vai mudar para o usuário?

**ANTES** (Manual):
```
1. Usuário digita placa: ABC-1234
2. Usuário digita marca: Fiat
3. Usuário digita modelo: Uno
4. Usuário digita ano: 2020
5. Usuário digita cor: Branco
6. Salvar
```

**DEPOIS** (Automatizado):
```
1. Usuário digita placa: ABC-1234
2. Usuário clica no botão 🔍 "Buscar Dados"
3. ✨ Sistema preenche automaticamente:
   - Marca: FIAT
   - Modelo: UNO ATTRACTIVE 1.0
   - Ano: 2020
   - Cor: BRANCO
4. Usuário completa quilometragem (opcional)
5. Salvar
```

### Benefícios

✅ **Economia de tempo**: ~3-5 minutos por cadastro
✅ **Redução de erros**: ~80% menos erros de digitação
✅ **Melhor experiência**: Interface moderna e intuitiva
✅ **Dados precisos**: Informações oficiais dos órgãos de trânsito

---

## 🏗️ Arquitetura Técnica

### Backend
```
Nova Rota: GET /api/vehicles/lookup/:plate

Sistema de Fallback:
1. Tenta API Brasil (principal)
2. Se falhar → Tenta FIPE API
3. Se falhar → Tenta SINESP (gratuito)

Cache: 30 dias (Redis/Memory)
```

### Frontend
```
Modificação: CreateVehicleModalCustomer.tsx

Adiciona:
- Botão 🔍 "Buscar Dados" ao lado do campo placa
- Auto-preenchimento de campos
- Indicador visual de campos preenchidos
- Opção de editar dados buscados
```

---

## 💰 Custos Estimados

### Cenário 1: MVP/Teste (0-100 consultas/dia)
- **API Brasil**: Gratuito
- **Custo**: R$ 0/mês

### Cenário 2: Operação Normal (500 consultas/dia)
- **API Brasil**: ~R$ 150/mês
- **Com cache agressivo**: ~R$ 80/mês

### Cenário 3: Alto Volume (2000+ consultas/dia)
- **API Brasil (plano enterprise)**: R$ 300-500/mês
- **ROI**: Economia de 100+ horas de trabalho/mês

---

## ⏱️ Cronograma

### Sprint 1 (Semana 1)
- Criar conta nas APIs
- Implementar módulo backend
- Sistema de fallback

### Sprint 2 (Semana 2)
- Implementar cache
- Testes de integração
- Documentação

### Sprint 3 (Semana 3)
- Modificar interface frontend
- Botão de busca
- Auto-preenchimento

### Sprint 4 (Semana 4)
- Testes E2E
- Ajustes de UX
- Monitoramento

### Sprint 5 (Deploy)
- Testes em produção
- Rollout gradual

**Tempo Total**: 4-5 semanas

---

## 🎨 Como Ficará a Interface

```
┌─────────────────────────────────────────┐
│  Cadastrar Novo Veículo            [X]  │
├─────────────────────────────────────────┤
│                                          │
│  Placa *                                 │
│  ┌──────────┐  ┌────────────────────┐  │
│  │ ABC-1D23 │  │ 🔍 Buscar Dados   │  │
│  └──────────┘  └────────────────────┘  │
│  💡 Digite e clique para buscar          │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ ✅ Dados encontrados! (API Brasil)│  │
│  └───────────────────────────────────┘  │
│                                          │
│  Marca *          Modelo *               │
│  FIAT ✓          UNO ATTRACTIVE 1.0 ✓   │
│                                          │
│  Ano *            Cor *                  │
│  2020 ✓          BRANCO ✓               │
│                                          │
│  Quilometragem (opcional)                │
│  [50000        ]  ← Usuário preenche    │
│                                          │
│        [Cancelar]  [Criar Veículo]      │
└─────────────────────────────────────────┘

✓ = Auto-preenchido (editável)
```

---

## ✅ Recomendação

### API Escolhida: **API Brasil**

**Por quê?**
1. ✅ Plano gratuito de 100 consultas/dia (suficiente para MVP)
2. ✅ Suporte e documentação em português
3. ✅ Dados confiáveis e atualizados
4. ✅ Fácil escalabilidade
5. ✅ Sistema de fallback com SINESP (gratuito)

### Estratégia
- **Fase 1**: Usar plano gratuito + SINESP como fallback
- **Fase 2**: Monitorar uso por 30 dias
- **Fase 3**: Avaliar necessidade de plano pago
- **Fase 4**: Implementar cache agressivo para reduzir custos

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| API fora do ar | Média | Sistema de fallback automático |
| Custos elevados | Baixa | Cache de 30 dias + monitoramento |
| Dados incorretos | Baixa | Sempre permitir edição manual |
| UX ruim | Baixa | Testes com usuários reais |

---

## 📚 Documentação Completa

1. **VEHICLE_PLATE_API_PROPOSAL.md** - Proposta completa e detalhada
2. **VEHICLE_PLATE_API_IMPLEMENTATION.md** - Guia técnico com código
3. **VEHICLE_PLATE_API_SUMMARY.md** - Este resumo executivo

---

## 🎬 Próximos Passos

### Para aprovar a proposta:
1. ✅ Revisar este resumo
2. ✅ Avaliar custos estimados
3. ✅ Aprovar cronograma
4. ✅ Autorizar criação de contas nas APIs

### Após aprovação:
1. Criar conta na API Brasil (gateway.apibrasil.io)
2. Obter tokens de autenticação
3. Iniciar Sprint 1 (implementação backend)

---

## 📞 Dúvidas?

**Documentação completa**: Ver `docs/VEHICLE_PLATE_API_PROPOSAL.md`
**Exemplos de código**: Ver `docs/VEHICLE_PLATE_API_IMPLEMENTATION.md`

---

**Status**: ⏳ Aguardando aprovação para iniciar implementação
