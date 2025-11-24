# 🚗 API Oficial DENATRAN/SENATRAN (SERPRO)

## 📋 Resumo

API **oficial e legal** do governo brasileiro para consulta de dados de veículos, condutores e infrações de trânsito.

**Fonte**: https://www.gov.br/conecta/catalogo/apis/wsdenatran
**Operador**: SERPRO (Serviço Federal de Processamento de Dados)

---

## 🎯 Características

### ✅ Vantagens

1. **API Oficial do Governo**
   - Dados diretos do SENATRAN (Sistema Nacional de Trânsito)
   - 100% legal e confiável
   - Dados sempre atualizados e precisos

2. **Abrangência Completa**
   - 52 tipos de consultas diferentes
   - Veículos: placa, chassi, Renavam, proprietário
   - Condutores: CPF, CNH
   - Infrações: por placa, CPF, CNH

3. **Alta Disponibilidade**
   - 24/7 (24 horas, 7 dias por semana)
   - Infraestrutura SERPRO
   - SLA garantido

4. **Dados Oficiais Incluem**
   - ✅ Indicador de roubo/furto
   - ✅ Restrição judicial
   - ✅ Sinistro
   - ✅ Débitos e multas
   - ✅ Histórico completo do veículo

### ❌ Desvantagens

1. **Requer Autorização Formal**
   - Termo de autorização do DENATRAN
   - Processo burocrático

2. **Custo Elevado**
   - Serviço pago (contratação com SERPRO)
   - Preços por volume de consultas
   - Modelo de precificação progressiva

3. **Requer CNPJ**
   - Certificado digital em nome da empresa
   - Não disponível para pessoa física

---

## 🔐 Como Obter Acesso

### Passo 1: Autorização do DENATRAN

1. Solicitar termo de autorização junto ao DENATRAN
2. Justificar necessidade de acesso aos dados
3. Aguardar aprovação (pode levar semanas/meses)

**Regulamentação**: Portaria Denatran nº 15/2016

### Passo 2: Contratação com SERPRO

1. Acessar: https://loja.serpro.gov.br/consultasenatran
2. Escolher o plano conforme volume de consultas
3. Assinar contrato
4. Receber credenciais (certificado digital)

### Passo 3: Integração Técnica

1. Baixar documentação técnica oficial
2. Implementar integração REST/JSON com SSL
3. Configurar certificado digital
4. Testar em ambiente de homologação

---

## 💰 Modelo de Precificação

### Informações Gerais

- **Última atualização**: Portaria SENATRAN nº 461/2025
- **Modelo**: Preço progressivo por volume
- **Faixas**: Quanto mais consultas, menor o preço unitário

### Consultas Disponíveis

#### 1. Dados de Veículos
- Por placa
- Por chassi
- Por Renavam
- Por proprietário

#### 2. Dados de Condutores
- Por CPF
- Por CNH
- Por dados identificatórios

#### 3. Infrações de Trânsito
- Por CPF
- Por placa
- Por proprietário
- Por CNH

### Como Consultar Preços

Os valores específicos estão em portarias oficiais:
- Acesse: https://loja.serpro.gov.br/consultasenatran
- Consulte a última portaria publicada
- Solicite orçamento personalizado

**Nota**: Preços não são públicos online, requerem contato com SERPRO

---

## 🛠️ Especificações Técnicas

### Protocolo
- **Tipo**: REST API
- **Formato**: JSON
- **Segurança**: SSL/TLS obrigatório
- **Autenticação**: Certificado digital (mTLS)

### Endpoints
- **Base URL**: Fornecida após contratação
- **Ambiente Produção**: SERPRO Cloud
- **Ambiente Homologação**: Disponível para testes

### Exemplo de Resposta (Consulta de Veículo)

```json
{
  "placa": "ABC1234",
  "renavam": "12345678901",
  "chassi": "9BWZZZ377VT004251",
  "marca": "FIAT",
  "modelo": "UNO ATTRACTIVE 1.0 FIRE FLEX 5P",
  "ano": 2020,
  "anoModelo": 2020,
  "cor": "BRANCO",
  "municipio": "SÃO PAULO",
  "uf": "SP",
  "proprietario": {
    "tipo": "PESSOA_FISICA",
    "documento": "***123***"
  },
  "situacao": {
    "rouboFurto": false,
    "restricaoJudicial": false,
    "sinistro": false,
    "debitos": true
  }
}
```

---

## 📊 Comparação com Outras APIs

| Característica | DENATRAN/SERPRO | API Brasil | FIPE API | SINESP (Não Oficial) |
|----------------|-----------------|------------|----------|----------------------|
| **Oficial** | ✅ Governo | ⚠️ Agregador | ⚠️ Agregador | ❌ Não Oficial |
| **Legalidade** | ✅ 100% Legal | ✅ Legal | ✅ Legal | ⚠️ Uso por conta e risco |
| **Custo** | 💰💰💰 Alto | 💰 Baixo | 💰 Baixo | 🆓 Gratuito |
| **Requer Autorização** | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| **Dados Completos** | ✅ Sim | ⚠️ Básicos | ⚠️ Básicos | ⚠️ Básicos |
| **Roubo/Furto** | ✅ Oficial | ⚠️ Secundário | ❌ Não | ⚠️ Secundário |
| **Disponibilidade** | ✅ 99.9% SLA | ⚠️ Variável | ⚠️ Variável | ❌ Instável |
| **Volume** | ✅ Ilimitado | ⚠️ 100/dia grátis | ⚠️ Limitado | ⚠️ Sem garantia |

---

## 🎯 Quando Usar

### ✅ Use DENATRAN/SERPRO se:

1. **Sua empresa tem CNPJ** e pode arcar com custos
2. **Precisa de dados oficiais** para fins legais
3. **Volume alto** de consultas (economia de escala)
4. **Dados críticos** (financiamento, seguro, leilão)
5. **Compliance rigoroso** (bancos, seguradoras)

### ❌ Não use DENATRAN/SERPRO se:

1. **Pequeno volume** de consultas (< 1000/mês)
2. **Projeto pessoal** ou MVP
3. **Orçamento limitado**
4. **Não tem CNPJ** ou autorização formal
5. **Precisa apenas de dados básicos** (marca, modelo, ano)

---

## 🔄 Alternativas Recomendadas

### Para Pequenos Volumes

1. **API Brasil** (100 consultas/dia grátis)
   - Dados básicos suficientes para maioria dos casos
   - Sem burocracia
   - Custo baixo

2. **FIPE API** (opcional)
   - Adiciona valor FIPE
   - Complementar à API Brasil

3. **SINESP não oficial** (fallback)
   - Gratuito mas instável
   - Usar apenas como backup
   - Sem garantias

### Para Grandes Volumes

1. **DENATRAN/SERPRO** (recomendado)
   - Dados oficiais e completos
   - Economia de escala
   - SLA garantido

---

## 📚 Links Úteis

### Oficiais
- **Gov.br Conecta**: https://www.gov.br/conecta/catalogo/apis/wsdenatran
- **Loja SERPRO**: https://loja.serpro.gov.br/consultasenatran
- **Central de Ajuda**: https://centraldeajuda.serpro.gov.br/consultasenatran/

### Documentação
- **Portal de Serviços**: https://portalservicos.senatran.serpro.gov.br/
- **Documentação Técnica**: Disponível após contratação

### Regulamentação
- **Portaria Denatran nº 15/2016**: Regulamenta acesso privado
- **Portaria SENATRAN nº 461/2025**: Preços atualizados

---

## 💡 Recomendação para Moria Peças

### Curto Prazo (Atual)
✅ **Continuar com API Brasil + FIPE** como implementado
- Custo baixo
- Sem burocracia
- Dados suficientes para cadastro básico

### Médio Prazo (Se crescer)
⚠️ **Avaliar DENATRAN/SERPRO** quando:
- Volume > 10.000 consultas/mês
- Necessidade de dados oficiais de restrições
- Financiamento ou seguros próprios
- ROI justificar investimento

### Implementação Futura
Se optar por DENATRAN/SERPRO no futuro:
1. Criar novo provider `denatran.provider.ts`
2. Configurar certificado digital
3. Adicionar à lista de providers (prioridade 1)
4. Manter API Brasil como fallback

---

## 🔐 Segurança e Compliance

### LGPD
✅ DENATRAN/SERPRO é **100% conforme LGPD**
- Dados tratados legalmente
- Base legal: Lei nº 9.503/1997 (CTB)
- Auditoria governamental

### Certificação
- ISO 27001 (SERPRO)
- Infraestrutura governamental segura
- Certificado digital obrigatório

---

**Atualizado**: 24/11/2025
**Fonte**: Gov.br Conecta, SERPRO Loja, Portarias SENATRAN
**Status**: Informações verificadas e atualizadas
