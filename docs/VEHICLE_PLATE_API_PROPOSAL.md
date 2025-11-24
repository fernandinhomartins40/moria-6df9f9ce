# Proposta: Sistema de Consulta Automática de Veículos por Placa

## 📋 Resumo Executivo

Este documento apresenta uma análise de APIs disponíveis para consulta de dados de veículos por placa no Brasil e propõe a implementação de busca automatizada no cadastro de veículos do sistema Moria.

---

## 🔍 APIs Disponíveis no Mercado

### 1. **API Brasil (Recomendada)**
- **URL**: `https://gateway.apibrasil.io`
- **Plano Gratuito**: 100 requisições/dia (renovação automática)
- **Custo Pago**: A partir de planos customizados
- **Dados Retornados**:
  - Marca e modelo
  - Ano de fabricação e modelo
  - Cor
  - Município e UF
  - Últimos 4 dígitos do chassi
  - Status de roubo/furto
- **Vantagens**:
  - ✅ Plano gratuito generoso para testes e MVP
  - ✅ Documentação em português
  - ✅ Suporte brasileiro
  - ✅ Dados atualizados

### 2. **FIPE API (fipeapi.com.br)**
- **URL**: `https://fipeapi.com.br`
- **Plano Gratuito**: Limitado (requer cadastro)
- **Custo**: Token mediante cadastro
- **Dados Retornados**:
  - Marca e modelo
  - Ano
  - Tipo de combustível
  - Valor FIPE
  - Código FIPE
  - Chassi
- **Vantagens**:
  - ✅ Inclui valor FIPE (tabela de preços)
  - ✅ Útil para avaliação de veículos
  - ✅ Dados oficiais da FIPE

### 3. **API Placas (apiplacas.com.br)**
- **URL**: `https://apiplacas.com.br`
- **Base de Dados**: +300 milhões de registros
- **Dados Retornados**:
  - Marca, modelo e ano
  - Estado e município
  - Cor e situação cadastral
- **Vantagens**:
  - ✅ Base de dados muito ampla
  - ✅ Informações cadastrais

### 4. **PlacaAPI.com**
- **URL**: `https://www.placaapi.com`
- **Plano Gratuito**: 10 créditos para teste
- **Custo**: R$ 0,80 por consulta (pacotes com desconto)
- **Dados Retornados**: +20 campos de dados
- **Vantagens**:
  - ✅ Muitos dados técnicos
  - ✅ Múltiplas linguagens suportadas

### 5. **SINESP-API (Open Source)**
- **URL**: `https://www.npmjs.com/package/sinesp-api`
- **Custo**: Gratuito (open source)
- **Dados Retornados**:
  - Modelo e marca
  - Cor
  - Ano
  - Município/UF
  - Status de roubo/furto
- **Vantagens**:
  - ✅ Totalmente gratuito
  - ✅ Sem necessidade de token
- **Desvantagens**:
  - ⚠️ Pode ser instável
  - ⚠️ Sem garantia de disponibilidade

---

## 🎯 Proposta de Implementação

### Fase 1: Infraestrutura Backend

#### 1.1 Criar Módulo de Integração com API

**Localização**: `apps/backend/src/modules/vehicle-lookup/`

**Estrutura**:
```
vehicle-lookup/
├── vehicle-lookup.service.ts
├── vehicle-lookup.controller.ts
├── vehicle-lookup.routes.ts
├── dto/
│   ├── lookup-vehicle.dto.ts
│   └── vehicle-lookup-response.dto.ts
├── interfaces/
│   └── vehicle-api-provider.interface.ts
└── providers/
    ├── apibrasil.provider.ts
    ├── fipe.provider.ts
    └── sinesp.provider.ts (fallback)
```

#### 1.2 Implementar Strategy Pattern para APIs

Permitir troca entre diferentes provedores sem afetar o código:

```typescript
interface VehicleAPIProvider {
  lookupByPlate(plate: string): Promise<VehicleLookupResponse>;
  isAvailable(): Promise<boolean>;
}
```

#### 1.3 Sistema de Fallback

Implementar lógica de tentativa em múltiplas APIs:
1. Tentar API Brasil (principal)
2. Se falhar, tentar FIPE API
3. Se falhar, tentar SINESP (gratuito)

#### 1.4 Cache de Consultas

Implementar cache Redis/Memory para:
- Reduzir custos de API
- Melhorar performance
- Evitar consultas duplicadas
- TTL: 30 dias (dados veiculares não mudam frequentemente)

### Fase 2: Endpoints da API

#### 2.1 Nova Rota de Consulta

```typescript
// GET /api/vehicles/lookup/:plate
// Resposta esperada:
{
  "success": true,
  "data": {
    "plate": "ABC1D23",
    "brand": "FIAT",
    "model": "UNO ATTRACTIVE 1.0",
    "year": 2020,
    "modelYear": 2020,
    "color": "BRANCO",
    "chassisLastDigits": "1234",
    "municipality": "SAO PAULO",
    "state": "SP",
    "fipeValue": "R$ 45.000,00",
    "fipeCode": "001234-5",
    "stolen": false,
    "source": "apibrasil" // indica qual API foi usada
  },
  "cached": false
}
```

#### 2.2 Endpoint de Status das APIs

```typescript
// GET /api/vehicles/lookup/status
// Verifica disponibilidade das APIs
{
  "success": true,
  "data": {
    "providers": [
      {
        "name": "apibrasil",
        "status": "available",
        "remainingQuota": 87,
        "priority": 1
      },
      {
        "name": "fipe",
        "status": "available",
        "remainingQuota": null,
        "priority": 2
      },
      {
        "name": "sinesp",
        "status": "available",
        "remainingQuota": "unlimited",
        "priority": 3
      }
    ]
  }
}
```

### Fase 3: Interface Frontend

#### 3.1 Componente de Busca por Placa

Modificar `CreateVehicleModalCustomer.tsx`:

**Adicionar**:
- Botão "Buscar por Placa" ao lado do campo de placa
- Loading indicator durante busca
- Auto-preenchimento dos campos quando encontrado
- Mensagem de erro se não encontrado
- Opção de editar dados preenchidos automaticamente

**UX Flow**:
```
1. Usuário digita placa (ABC-1D23)
2. Clica em "Buscar Dados"
3. Sistema exibe loading
4. Se encontrado:
   ✅ Preenche: marca, modelo, ano, cor
   ✅ Exibe mensagem de sucesso
   ✅ Permite edição dos campos
   ✅ Usuário completa quilometragem e chassi (opcional)
5. Se não encontrado:
   ⚠️ Exibe mensagem informativa
   ✅ Permite preenchimento manual
```

#### 3.2 Indicadores Visuais

- Badge "Auto-preenchido" nos campos populados pela API
- Ícone de verificação verde para dados confirmados
- Tooltip explicando origem dos dados
- Botão "Limpar" para resetar busca

#### 3.3 Service Frontend

**Criar**: `apps/frontend/src/api/vehicleLookupService.ts`

```typescript
export interface VehicleLookupData {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  fipeValue?: string;
  chassisLastDigits?: string;
}

class VehicleLookupService {
  async lookupByPlate(plate: string): Promise<VehicleLookupData> {
    // Implementação
  }

  async checkAPIStatus(): Promise<APIStatus[]> {
    // Implementação
  }
}
```

### Fase 4: Validações e Segurança

#### 4.1 Validação de Placa

Implementar validação para ambos os padrões:
- **Antigo**: ABC-1234 (3 letras + 4 números)
- **Mercosul**: ABC-1D23 (3 letras + 1 número + 1 letra + 2 números)

```typescript
function validatePlate(plate: string): boolean {
  const cleanPlate = plate.replace(/[^A-Z0-9]/g, '');

  // Padrão antigo: AAA9999
  const oldPattern = /^[A-Z]{3}[0-9]{4}$/;

  // Padrão Mercosul: AAA9A99
  const mercosulPattern = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

  return oldPattern.test(cleanPlate) || mercosulPattern.test(cleanPlate);
}
```

#### 4.2 Rate Limiting

Implementar limitação de consultas:
- Backend: 10 consultas/minuto por IP
- Frontend: Debounce de 500ms no botão de busca
- Exibir contador de consultas disponíveis (plano gratuito)

#### 4.3 Tratamento de Erros

```typescript
// Possíveis erros:
enum VehicleLookupError {
  PLATE_NOT_FOUND = 'Placa não encontrada nos registros',
  INVALID_PLATE = 'Formato de placa inválido',
  API_UNAVAILABLE = 'Serviço temporariamente indisponível',
  QUOTA_EXCEEDED = 'Limite de consultas atingido',
  NETWORK_ERROR = 'Erro de conexão'
}
```

### Fase 5: Monitoramento e Métricas

#### 5.1 Logs e Analytics

Registrar:
- Total de consultas realizadas
- Taxa de sucesso por provedor
- Tempo médio de resposta
- Consultas em cache vs. novas
- Erros e tipos de falha

#### 5.2 Dashboard Admin

Adicionar página administrativa mostrando:
- Estatísticas de uso da API
- Custos mensais estimados
- Performance dos provedores
- Consultas mais frequentes

---

## 💰 Análise de Custos

### Cenário 1: Pequeno Volume (até 100 consultas/dia)
- **API Brasil**: Gratuito
- **Custo Mensal**: R$ 0,00

### Cenário 2: Médio Volume (500 consultas/dia)
- **API Brasil**: ~R$ 150/mês (estimativa)
- **PlacaAPI**: 500 × R$ 0,80 = R$ 400/mês
- **Recomendação**: Negociar plano corporativo

### Cenário 3: Grande Volume (2000+ consultas/dia)
- **Recomendação**: Plano Enterprise com API Brasil
- **Custo Estimado**: R$ 300-500/mês
- **ROI**:
  - ⏱️ Economia de tempo: ~5min por cadastro
  - 📊 Redução de erros: ~80%
  - 😊 Melhor UX para clientes

---

## 📅 Cronograma de Implementação

### Sprint 1 (1 semana)
- [x] Pesquisa de APIs
- [ ] Escolha do provedor principal
- [ ] Configuração de contas e tokens
- [ ] Implementação do módulo backend básico

### Sprint 2 (1 semana)
- [ ] Sistema de fallback entre APIs
- [ ] Implementação de cache
- [ ] Testes de integração backend
- [ ] Documentação da API

### Sprint 3 (1 semana)
- [ ] Modificação do formulário frontend
- [ ] Implementação do botão de busca
- [ ] Auto-preenchimento de campos
- [ ] Tratamento de erros UX

### Sprint 4 (1 semana)
- [ ] Testes E2E
- [ ] Ajustes de UX
- [ ] Monitoramento e métricas
- [ ] Documentação de usuário

### Sprint 5 (Deploy)
- [ ] Testes em produção
- [ ] Rollout gradual
- [ ] Treinamento da equipe
- [ ] Coleta de feedback

**Tempo Total Estimado**: 4-5 semanas

---

## ⚠️ Riscos e Mitigações

### Risco 1: API Fora do Ar
**Mitigação**: Sistema de fallback com múltiplos provedores

### Risco 2: Custo Maior que Esperado
**Mitigação**:
- Implementar cache agressivo
- Monitorar uso diariamente
- Definir limites de consulta
- Considerar SINESP como fallback gratuito

### Risco 3: Dados Incorretos
**Mitigação**:
- Sempre permitir edição manual
- Mostrar fonte dos dados
- Validar dados críticos
- Feedback de usuário para correções

### Risco 4: Experiência Ruim de UX
**Mitigação**:
- Loading states claros
- Mensagens de erro amigáveis
- Opção de pular busca automática
- Preenchimento manual sempre disponível

---

## 🎨 Mockup da Interface

```
┌─────────────────────────────────────────────────┐
│  Cadastrar Novo Veículo                    [X]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  Placa *                                         │
│  ┌────────────────┐  ┌──────────────────────┐  │
│  │ ABC-1D23       │  │ 🔍 Buscar Dados     │  │
│  └────────────────┘  └──────────────────────┘  │
│  💡 Digite a placa e clique para buscar          │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ ✅ Dados encontrados! (FIPE)            │   │
│  │ Você pode editar qualquer informação     │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Marca *              Modelo *                   │
│  ┌────────────────┐  ┌────────────────────────┐│
│  │ FIAT      🔒   │  │ UNO ATTRACTIVE 1.0 🔒 ││
│  └────────────────┘  └────────────────────────┘│
│                                                  │
│  Ano *                Cor *                      │
│  ┌────────────────┐  ┌────────────────────────┐│
│  │ 2020      🔒   │  │ BRANCO             🔒 ││
│  └────────────────┘  └────────────────────────┘│
│                                                  │
│  Quilometragem (opcional)                        │
│  ┌────────────────────────────────────────────┐│
│  │ 50000                                       ││
│  └────────────────────────────────────────────┘│
│                                                  │
│  Número do Chassi (opcional)                     │
│  ┌────────────────────────────────────────────┐│
│  │ 9BWZZZ377VT004251                          ││
│  └────────────────────────────────────────────┘│
│                                                  │
│              [Cancelar]  [Criar Veículo]        │
└─────────────────────────────────────────────────┘

Legenda:
🔒 = Campo auto-preenchido (editável)
🔍 = Ícone de busca
✅ = Sucesso
💡 = Dica
```

---

## 🚀 Recomendação Final

### API Recomendada: **API Brasil**

**Justificativa**:
1. ✅ **Plano gratuito generoso** (100 req/dia) - ideal para MVP e testes
2. ✅ **Suporte em português** - facilita troubleshooting
3. ✅ **Documentação clara** - acelera desenvolvimento
4. ✅ **Dados atualizados** - melhor qualidade de informação
5. ✅ **Escalabilidade** - fácil upgrade para planos pagos

**Estratégia de Implementação**:
- **Curto Prazo**: Usar plano gratuito + fallback SINESP
- **Médio Prazo**: Avaliar necessidade de plano pago baseado em métricas
- **Longo Prazo**: Considerar cache agressivo para reduzir custos

**Próximos Passos**:
1. Criar conta na API Brasil (gateway.apibrasil.io)
2. Obter DeviceToken e BearerToken
3. Implementar módulo backend (Sprint 1)
4. Desenvolver interface frontend (Sprint 3)
5. Deploy gradual com monitoramento

---

## 📚 Referências

- [API Brasil - Documentação](https://apibrasil.com.br)
- [FIPE API - Documentação](https://fipeapi.com.br)
- [SINESP API - npm](https://www.npmjs.com/package/sinesp-api)
- [API Placas](https://apiplacas.com.br)
- [PlacaAPI](https://www.placaapi.com)

---

**Documento criado em**: 24/11/2025
**Versão**: 1.0
**Status**: Aguardando aprovação
