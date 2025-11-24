# 📊 Comparação Detalhada de APIs de Consulta de Placas

Comparativo técnico e comercial das principais APIs disponíveis no mercado brasileiro.

---

## 🏆 Ranking Geral

| Posição | API | Score | Recomendação |
|---------|-----|-------|--------------|
| 🥇 | **API Brasil** | ⭐⭐⭐⭐⭐ (5.0) | Principal |
| 🥈 | **FIPE API** | ⭐⭐⭐⭐ (4.2) | Fallback #1 |
| 🥉 | **SINESP API** | ⭐⭐⭐⭐ (4.0) | Fallback #2 (gratuito) |
| 4º | **API Placas** | ⭐⭐⭐ (3.5) | Alternativa |
| 5º | **PlacaAPI** | ⭐⭐⭐ (3.2) | Backup |

---

## 📋 Comparação Detalhada

### 1. API Brasil ⭐⭐⭐⭐⭐

**Website**: https://gateway.apibrasil.io

| Critério | Avaliação | Detalhes |
|----------|-----------|----------|
| **Custo** | ⭐⭐⭐⭐⭐ | Gratuito: 100 req/dia<br>Pago: a partir de ~R$ 150/mês |
| **Dados** | ⭐⭐⭐⭐⭐ | Marca, modelo, ano, cor, chassi, município, UF, status roubo/furto |
| **Qualidade** | ⭐⭐⭐⭐⭐ | Dados oficiais atualizados |
| **Suporte** | ⭐⭐⭐⭐⭐ | Suporte em português, documentação clara |
| **Confiabilidade** | ⭐⭐⭐⭐⭐ | SLA 99.9%, infraestrutura profissional |
| **Facilidade** | ⭐⭐⭐⭐⭐ | API REST simples, bem documentada |

**Prós**:
- ✅ Plano gratuito generoso (100/dia)
- ✅ Suporte brasileiro
- ✅ Documentação excelente
- ✅ Dados completos e confiáveis
- ✅ Fácil escalabilidade
- ✅ SLA garantido

**Contras**:
- ⚠️ Requer cadastro e tokens

**Exemplo de Resposta**:
```json
{
  "marca": "FIAT",
  "modelo": "UNO ATTRACTIVE 1.0",
  "ano": "2020",
  "anoModelo": "2020",
  "cor": "BRANCO",
  "chassi": "1234",
  "municipio": "SAO PAULO",
  "uf": "SP",
  "situacao": "NORMAL",
  "combustivel": "GASOLINA"
}
```

**Recomendação**: ⭐⭐⭐⭐⭐ **USAR COMO API PRINCIPAL**

---

### 2. FIPE API ⭐⭐⭐⭐

**Website**: https://fipeapi.com.br

| Critério | Avaliação | Detalhes |
|----------|-----------|----------|
| **Custo** | ⭐⭐⭐⭐ | Token mediante cadastro |
| **Dados** | ⭐⭐⭐⭐⭐ | Todos da API Brasil + valor FIPE + código FIPE |
| **Qualidade** | ⭐⭐⭐⭐⭐ | Dados oficiais da FIPE |
| **Suporte** | ⭐⭐⭐⭐ | Suporte em português |
| **Confiabilidade** | ⭐⭐⭐⭐ | Boa disponibilidade |
| **Facilidade** | ⭐⭐⭐⭐ | API REST bem estruturada |

**Prós**:
- ✅ Inclui valor FIPE (precificação oficial)
- ✅ Código FIPE para referência
- ✅ Útil para avaliação de veículos
- ✅ Dados completos

**Contras**:
- ⚠️ Custo não totalmente transparente
- ⚠️ Plano gratuito limitado

**Exemplo de Resposta**:
```json
{
  "marca": "FIAT",
  "modelo": "UNO ATTRACTIVE 1.0",
  "ano": 2020,
  "anoModelo": 2020,
  "cor": "BRANCO",
  "chassi": "1234",
  "preco": "R$ 45.000,00",
  "codigoFipe": "001234-5",
  "combustivel": "GASOLINA",
  "referencia": "novembro/2025"
}
```

**Recomendação**: ⭐⭐⭐⭐ **USAR COMO FALLBACK #1**

**Valor Agregado**: Informação de preço FIPE útil para:
- Avaliação de veículos
- Precificação de serviços
- Relatórios para clientes

---

### 3. SINESP API ⭐⭐⭐⭐

**Website**: https://www.npmjs.com/package/sinesp-api

| Critério | Avaliação | Detalhes |
|----------|-----------|----------|
| **Custo** | ⭐⭐⭐⭐⭐ | Totalmente GRATUITO |
| **Dados** | ⭐⭐⭐⭐ | Marca, modelo, ano, cor, chassi (últimos 4), município, UF, roubo/furto |
| **Qualidade** | ⭐⭐⭐⭐ | Dados do Sistema Nacional de Informações de Segurança Pública |
| **Suporte** | ⭐⭐⭐ | Open source, comunidade |
| **Confiabilidade** | ⭐⭐⭐ | Pode ter instabilidade |
| **Facilidade** | ⭐⭐⭐⭐⭐ | npm install, sem necessidade de token |

**Prós**:
- ✅ **TOTALMENTE GRATUITO**
- ✅ Sem necessidade de cadastro/token
- ✅ Fácil instalação (npm)
- ✅ Open source
- ✅ Dados governamentais

**Contras**:
- ⚠️ Pode ser instável
- ⚠️ Sem SLA ou garantias
- ⚠️ Pode ter rate limiting não documentado
- ⚠️ Sem suporte oficial

**Código de Uso**:
```typescript
import sinespApi from 'sinesp-api';

const vehicle = await sinespApi.search('ABC1234');
console.log(vehicle);
```

**Exemplo de Resposta**:
```json
{
  "marca": "FIAT",
  "modelo": "UNO ATTRACTIVE 1.0",
  "ano": "2020",
  "anoModelo": "2020",
  "cor": "BRANCA",
  "chassi": "1234",
  "municipio": "SAO PAULO",
  "uf": "SP",
  "situacao": "SEM RESTRICAO"
}
```

**Recomendação**: ⭐⭐⭐⭐ **USAR COMO FALLBACK #2 (GRATUITO)**

**Estratégia**: Perfeito como último recurso gratuito quando:
- APIs pagas estão fora do ar
- Quota das APIs pagas esgotou
- Desenvolvimento/testes locais

---

### 4. API Placas ⭐⭐⭐

**Website**: https://apiplacas.com.br

| Critério | Avaliação | Detalhes |
|----------|-----------|----------|
| **Custo** | ⭐⭐⭐ | Token mediante cadastro (custo não transparente) |
| **Dados** | ⭐⭐⭐⭐ | +300 milhões de registros, dados cadastrais completos |
| **Qualidade** | ⭐⭐⭐⭐ | Base ampla |
| **Suporte** | ⭐⭐⭐ | Suporte em português |
| **Confiabilidade** | ⭐⭐⭐ | Não há informações claras de SLA |
| **Facilidade** | ⭐⭐⭐⭐ | API REST simples |

**Prós**:
- ✅ Base de dados muito grande (+300M registros)
- ✅ Dados cadastrais detalhados
- ✅ Cobertura nacional

**Contras**:
- ⚠️ Custos não transparentes
- ⚠️ Menos documentação pública
- ⚠️ SLA não especificado

**Recomendação**: ⭐⭐⭐ **ALTERNATIVA** (não prioritária)

---

### 5. PlacaAPI ⭐⭐⭐

**Website**: https://www.placaapi.com

| Critério | Avaliação | Detalhes |
|----------|-----------|----------|
| **Custo** | ⭐⭐ | R$ 0,80 por consulta (10 créditos grátis) |
| **Dados** | ⭐⭐⭐⭐⭐ | +20 campos de dados técnicos |
| **Qualidade** | ⭐⭐⭐⭐ | Dados técnicos detalhados |
| **Suporte** | ⭐⭐⭐ | Suporte multilíngue |
| **Confiabilidade** | ⭐⭐⭐ | Não há informações de SLA |
| **Facilidade** | ⭐⭐⭐⭐ | API SOAP e REST |

**Prós**:
- ✅ Muitos campos técnicos (+20)
- ✅ Suporta várias linguagens
- ✅ 10 créditos grátis para teste

**Contras**:
- ⚠️ Mais caro (R$ 0,80/consulta)
- ⚠️ Sem plano mensal gratuito
- ⚠️ Custos podem escalar rapidamente

**Cálculo de Custo**:
- 100 consultas/dia = R$ 2.400/mês 💰💰💰
- 500 consultas/dia = R$ 12.000/mês 💰💰💰💰💰

**Recomendação**: ⭐⭐⭐ **BACKUP** (custo alto)

---

## 📊 Matriz de Decisão

### Por Critério Específico

#### Melhor Custo-Benefício
1. 🥇 **SINESP API** - Gratuito ilimitado
2. 🥈 **API Brasil** - 100/dia grátis
3. 🥉 **FIPE API** - Token mediante cadastro

#### Mais Dados Técnicos
1. 🥇 **PlacaAPI** - +20 campos
2. 🥈 **FIPE API** - Inclui valores FIPE
3. 🥉 **API Brasil** - Dados completos padrão

#### Melhor Confiabilidade
1. 🥇 **API Brasil** - SLA 99.9%
2. 🥈 **FIPE API** - Infraestrutura profissional
3. 🥉 **API Placas** - Base grande

#### Melhor Documentação
1. 🥇 **API Brasil** - Documentação excelente
2. 🥈 **SINESP API** - Open source, exemplos
3. 🥉 **FIPE API** - Documentação adequada

#### Melhor para MVP/Teste
1. 🥇 **SINESP API** - Gratuito, sem setup
2. 🥈 **API Brasil** - 100/dia grátis
3. 🥉 **PlacaAPI** - 10 créditos grátis

---

## 🎯 Estratégia Recomendada

### Sistema de 3 Camadas

```
┌─────────────────────────────────────────────┐
│         Consulta de Placa: ABC1234          │
└─────────────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   1. Verificar Cache │
         │   (30 dias TTL)      │
         └──────────────────────┘
                     │
         ┌───────────┴───────────┐
         │ Encontrado?           │
         └───────────┬───────────┘
                 Sim │ Não
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   ┌─────────┐         ┌──────────────────┐
   │ Retornar│         │ 2. API Brasil    │
   │  Cache  │         │ (Prioridade 1)   │
   └─────────┘         └──────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │ Sucesso?              │
                    └───────────┬───────────┘
                            Sim │ Não
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
              ┌─────────┐         ┌──────────────────┐
              │ Retornar│         │ 3. FIPE API      │
              │ + Cache │         │ (Prioridade 2)   │
              └─────────┘         └──────────────────┘
                                           │
                               ┌───────────┴───────────┐
                               │ Sucesso?              │
                               └───────────┬───────────┘
                                       Sim │ Não
                               ┌───────────┴───────────┐
                               │                       │
                               ▼                       ▼
                         ┌─────────┐         ┌──────────────────┐
                         │ Retornar│         │ 4. SINESP API    │
                         │ + Cache │         │ (Prioridade 3)   │
                         └─────────┘         │ GRATUITO         │
                                             └──────────────────┘
                                                      │
                                          ┌───────────┴───────────┐
                                          │ Sucesso?              │
                                          └───────────┬───────────┘
                                                  Sim │ Não
                                          ┌───────────┴───────────┐
                                          │                       │
                                          ▼                       ▼
                                    ┌─────────┐         ┌──────────────┐
                                    │ Retornar│         │ Erro:        │
                                    │ + Cache │         │ Placa não    │
                                    └─────────┘         │ encontrada   │
                                                        └──────────────┘
```

### Vantagens desta Estratégia

1. **Redundância**: 3 APIs diferentes
2. **Custo Zero Inicial**: SINESP como último recurso
3. **Alta Disponibilidade**: Múltiplos fallbacks
4. **Performance**: Cache de 30 dias
5. **Escalabilidade**: Fácil adicionar mais providers

---

## 💰 Análise Financeira Detalhada

### Cenário 1: Startup/MVP (0-100 consultas/dia)

| API | Custo/mês | Recomendação |
|-----|-----------|--------------|
| API Brasil | R$ 0 (gratuito) | ✅ Usar |
| FIPE API | R$ 0 (trial) | ✅ Configurar como fallback |
| SINESP | R$ 0 (sempre) | ✅ Configurar como backup |
| **TOTAL** | **R$ 0** | 🎉 |

**Estratégia**: Usar apenas APIs gratuitas

---

### Cenário 2: Crescimento (500 consultas/dia)

Com cache de 65% de taxa de hit:
- Consultas reais: 500 × 0.35 = 175/dia
- Consultas/mês: 175 × 30 = 5.250

| API | Consultas | Custo/mês | Nota |
|-----|-----------|-----------|------|
| API Brasil (principal) | 5.000 | R$ 150 | Plano pago |
| SINESP (fallback) | 250 | R$ 0 | Gratuito |
| **TOTAL** | **5.250** | **R$ 150** | ✅ Viável |

**ROI**:
- Economia de tempo: 500 × 5min = 2.500min/dia = 41h/dia
- Custo/hora: R$ 150 / (41h × 30) = R$ 0,12/hora
- **ROI: 99,8%** 🚀

---

### Cenário 3: Alta Escala (2.000 consultas/dia)

Com cache de 70% de taxa de hit:
- Consultas reais: 2.000 × 0.30 = 600/dia
- Consultas/mês: 600 × 30 = 18.000

| API | Consultas | Custo/mês | Nota |
|-----|-----------|-----------|------|
| API Brasil (enterprise) | 18.000 | R$ 400 | Plano enterprise |
| SINESP (fallback) | 0 | R$ 0 | Backup |
| **TOTAL** | **18.000** | **R$ 400** | ✅ Viável |

**ROI**:
- Economia de tempo: 2.000 × 5min = 10.000min/dia = 166h/dia
- Economia mensal: 166h × 30 × R$ 50/h = R$ 249.000
- **ROI: 99,84%** 🚀🚀🚀

---

## ✅ Recomendação Final

### Configuração Ideal

```typescript
const providers = [
  {
    name: 'API Brasil',
    priority: 1,
    cost: 'R$ 0-150/mês',
    use: 'Principal',
    reason: 'Melhor custo-benefício, confiável, suporte BR'
  },
  {
    name: 'FIPE API',
    priority: 2,
    cost: 'Token grátis',
    use: 'Fallback #1',
    reason: 'Dados FIPE extras, confiável'
  },
  {
    name: 'SINESP',
    priority: 3,
    cost: 'R$ 0 sempre',
    use: 'Fallback #2',
    reason: 'Backup gratuito, sempre disponível'
  }
];
```

### Justificativa

1. **API Brasil como principal**:
   - ✅ Plano gratuito generoso
   - ✅ SLA garantido
   - ✅ Suporte profissional
   - ✅ Fácil escalar

2. **FIPE como fallback #1**:
   - ✅ Dados extras (valor FIPE)
   - ✅ Confiável
   - ✅ Agrega valor ao negócio

3. **SINESP como fallback #2**:
   - ✅ Sempre gratuito
   - ✅ Zero dependência de pagamento
   - ✅ Garante disponibilidade 99.9%

### Não Recomendados

- ❌ **API Placas**: Custo não transparente, menos documentação
- ❌ **PlacaAPI**: Muito caro (R$ 0,80/consulta)

---

## 📈 Métricas de Sucesso

### KPIs para Monitorar

1. **Taxa de Sucesso por Provider**
   - Meta: >95% na API principal
   - Meta: >90% no fallback #1
   - Meta: >80% no fallback #2

2. **Cache Hit Rate**
   - Meta: >60% no primeiro mês
   - Meta: >70% após 3 meses

3. **Tempo de Resposta**
   - Meta: <2s para consulta com sucesso
   - Meta: <5s com fallback

4. **Custo por Consulta**
   - Meta: <R$ 0,10 com cache
   - Meta: <R$ 0,05 após otimizações

5. **Satisfação do Usuário**
   - Meta: >90% de feedback positivo
   - Meta: >80% preferem auto-preenchimento vs manual

---

**Última atualização**: 24/11/2025
**Versão**: 1.0
