# 🚗 Sistema de Consulta de Veículos por Placa - Documentação de Implementação

## 📋 Resumo

Sistema completo de busca automática de dados de veículos por placa, implementado com sistema de fallback entre múltiplas APIs, cache inteligente e interface amigável.

**Status**: ✅ 100% Implementado

**Data de Implementação**: 24/11/2025

---

## 🏗️ Arquitetura

### Backend

```
apps/backend/src/modules/vehicle-lookup/
├── interfaces/
│   └── vehicle-api-provider.interface.ts    # Interface base para providers
├── providers/
│   ├── apibrasil.provider.ts                # API Brasil (prioridade 1)
│   ├── fipe.provider.ts                     # FIPE API (prioridade 2)
│   └── sinesp.provider.ts                   # SINESP gratuito (prioridade 3)
├── dto/
│   └── lookup-vehicle.dto.ts                # Validação de placas (Zod)
├── vehicle-lookup.service.ts                # Service principal com fallback e cache
├── vehicle-lookup.controller.ts             # Controller com 4 endpoints
└── vehicle-lookup.routes.ts                 # Rotas Express
```

### Frontend

```
apps/frontend/src/
├── api/
│   └── vehicleLookupService.ts              # Service de comunicação com backend
├── hooks/
│   └── useVehicleLookup.ts                  # Hook React com lógica de busca
└── components/customer/
    └── CreateVehicleModalCustomer.tsx       # Modal com botão de busca
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Backend

1. **Sistema de Providers Multi-API**
   - ✅ Interface padrão `VehicleAPIProvider`
   - ✅ API Brasil Provider (100 req/dia gratuito)
   - ✅ FIPE API Provider (com valor da tabela)
   - ✅ SINESP Provider (gratuito, fallback)
   - ✅ Sistema de prioridades (1, 2, 3)

2. **Sistema de Fallback Automático**
   - ✅ Tentativa sequencial por prioridade
   - ✅ Fallback para próxima API em caso de erro
   - ✅ Logs detalhados de cada tentativa
   - ✅ Agregação de erros para debug

3. **Cache Inteligente**
   - ✅ Cache em memória (Map)
   - ✅ TTL de 30 dias
   - ✅ Limpeza automática de cache expirado
   - ✅ Endpoints admin para gerenciar cache

4. **Validação de Placas**
   - ✅ Padrão antigo: ABC-1234 (3 letras + 4 números)
   - ✅ Padrão Mercosul: ABC-1D23 (3 letras + 1 número + 1 letra + 2 números)
   - ✅ Limpeza automática de caracteres especiais
   - ✅ Normalização para uppercase

5. **Endpoints REST**
   - ✅ `GET /vehicles/lookup/:plate` - Busca por placa
   - ✅ `GET /vehicles/lookup-status` - Status dos providers
   - ✅ `GET /vehicles/lookup-cache/stats` - Estatísticas do cache (admin)
   - ✅ `POST /vehicles/lookup-cache/clear` - Limpar cache (admin)

### ✅ Frontend

1. **Service Layer**
   - ✅ `vehicleLookupService.ts` com todos os métodos
   - ✅ Validação de placa no frontend
   - ✅ Formatação automática de placa
   - ✅ Tratamento de erros HTTP

2. **Hook React**
   - ✅ `useVehicleLookup` com estado de loading
   - ✅ Validação antes de buscar
   - ✅ Toast de sucesso/erro
   - ✅ Alerta para veículos roubados

3. **Interface do Usuário**
   - ✅ Botão "Buscar" ao lado do campo de placa
   - ✅ Loading indicator (spinner)
   - ✅ Auto-preenchimento de campos
   - ✅ Badge verde "Dados auto-preenchidos"
   - ✅ Checkmarks nos campos preenchidos
   - ✅ Background verde suave nos campos
   - ✅ Campos editáveis após busca
   - ✅ Mensagens de ajuda

---

## 📡 Endpoints da API

### 1. Buscar Veículo por Placa

```http
GET /vehicles/lookup/:plate
Authorization: Bearer {token}
```

**Exemplo de Resposta:**
```json
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
    "source": "apibrasil"
  },
  "cached": false
}
```

### 2. Status dos Providers

```http
GET /vehicles/lookup-status
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "name": "apibrasil",
        "status": "available",
        "remainingQuota": null,
        "priority": 1
      },
      {
        "name": "fipe",
        "status": "unavailable",
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

### 3. Estatísticas do Cache (Admin)

```http
GET /vehicles/lookup-cache/stats
Authorization: Bearer {admin_token}
```

### 4. Limpar Cache (Admin)

```http
POST /vehicles/lookup-cache/clear
Authorization: Bearer {admin_token}
```

---

## 🔧 Configuração

### Variáveis de Ambiente

Adicionar ao `apps/backend/.env`:

```env
# Vehicle Lookup APIs
# API Brasil (100 req/dia gratuito) - https://apibrasil.com.br
APIBRASIL_DEVICE_TOKEN=seu_device_token
APIBRASIL_BEARER_TOKEN=seu_bearer_token

# FIPE API (opcional) - https://fipeapi.com.br
FIPE_API_KEY=sua_api_key
```

**Nota**: As credenciais são opcionais. O sistema funciona com o SINESP (gratuito) como fallback.

### Como Obter as Credenciais

1. **API Brasil**:
   - Acesse https://apibrasil.com.br
   - Crie uma conta
   - Obtenha o DeviceToken e BearerToken no dashboard
   - Plano gratuito: 100 requisições/dia

2. **FIPE API** (Opcional):
   - Acesse https://fipeapi.com.br
   - Cadastre-se e obtenha o API Key
   - Inclui valor da tabela FIPE

3. **SINESP** (Já configurado):
   - Gratuito e sem necessidade de cadastro
   - Usado como fallback automático

---

## 💻 Como Usar

### No Frontend

```typescript
import { useVehicleLookup } from '@/hooks/useVehicleLookup';

function MeuComponente() {
  const { isLooking, lookupByPlate } = useVehicleLookup();

  const handleSearch = async () => {
    const data = await lookupByPlate('ABC1234');

    if (data) {
      console.log('Marca:', data.brand);
      console.log('Modelo:', data.model);
      console.log('Ano:', data.year);
    }
  };

  return (
    <button onClick={handleSearch} disabled={isLooking}>
      {isLooking ? 'Buscando...' : 'Buscar Placa'}
    </button>
  );
}
```

### Chamada Direta à API

```typescript
import vehicleLookupService from '@/api/vehicleLookupService';

// Buscar placa
const result = await vehicleLookupService.lookupByPlate('ABC1234');

// Verificar status das APIs
const status = await vehicleLookupService.getProvidersStatus();

// Validar placa
const validation = vehicleLookupService.validatePlate('ABC1234');
if (validation.valid) {
  // Placa válida
}
```

---

## 🎨 UX/UI Implementada

### Fluxo do Usuário

1. **Digite a placa**
   - Campo com formatação automática (ABC-1234)
   - Suporte para placas antigas e Mercosul

2. **Clique no botão de busca (🔍)**
   - Botão fica desabilitado durante busca
   - Spinner aparece indicando carregamento

3. **Dados preenchidos automaticamente**
   - Badge verde: "Dados preenchidos automaticamente"
   - Checkmarks (✓) nos campos preenchidos
   - Background verde suave nos campos
   - Toast de sucesso com informações

4. **Edite se necessário**
   - Todos os campos permanecem editáveis
   - Usuário pode corrigir qualquer informação

5. **Complete e salve**
   - Adicione quilometragem e chassi (opcional)
   - Clique em "Criar Veículo"

### Indicadores Visuais

- **Loading**: Spinner animado no botão
- **Sucesso**: Toast verde com dados encontrados
- **Cache Hit**: Toast indica "(cache)" quando dados são do cache
- **Erro**: Toast vermelho com mensagem clara
- **Veículo Roubado**: Alerta especial em vermelho
- **Campos Preenchidos**: Background verde + checkmark
- **Auto-fill Badge**: Badge verde com ícone Sparkles

---

## 🔒 Segurança

1. **Autenticação**
   - Endpoints protegidos com JWT
   - Apenas usuários autenticados podem buscar placas

2. **Rate Limiting**
   - Recomendado adicionar rate limiting no Nginx/Gateway
   - Sugestão: 10 requisições/minuto por IP

3. **Validação**
   - Validação de placa em ambos frontend e backend
   - Sanitização de entrada (remove caracteres especiais)

4. **Dados Sensíveis**
   - API Keys armazenadas em variáveis de ambiente
   - Nunca expostas no frontend

---

## 📊 Monitoramento

### Logs

O sistema registra:
- Tentativas de busca por provider
- Sucesso/falha de cada API
- Tempo de resposta
- Cache hits/misses

### Métricas Disponíveis

```typescript
// Estatísticas do cache
const stats = await vehicleLookupService.getCacheStats();
// {
//   size: 42,
//   entries: ['ABC1234', 'XYZ5678', ...]
// }

// Status dos providers
const status = await vehicleLookupService.getProvidersStatus();
```

---

## 🚀 Deploy

### Checklist

- [x] Código do backend implementado
- [x] Código do frontend implementado
- [x] Rotas registradas no app.ts
- [x] Variáveis de ambiente documentadas
- [x] Hook React criado
- [x] Service frontend criado
- [x] Validação de placas (antigo + Mercosul)
- [x] Sistema de fallback
- [x] Cache implementado
- [x] UI/UX completa
- [x] Documentação criada

### Próximos Passos

1. **Testar em desenvolvimento**
   ```bash
   npm run dev
   ```

2. **Obter credenciais** (opcional)
   - Cadastrar na API Brasil
   - Adicionar tokens ao .env

3. **Build para produção**
   ```bash
   npm run build
   ```

4. **Deploy**
   - Commit e push para repositório
   - GitHub Actions executará deploy automático

---

## 📈 Melhorias Futuras

### Curto Prazo
- [ ] Implementar Redis para cache distribuído
- [ ] Adicionar rate limiting no backend
- [ ] Criar dashboard admin para visualizar métricas

### Médio Prazo
- [ ] Implementar fila para requisições (Bull/BullMQ)
- [ ] Adicionar retry automático com exponential backoff
- [ ] Cache de providers indisponíveis (circuit breaker)

### Longo Prazo
- [ ] Machine learning para detectar padrões de fraude
- [ ] Integração com mais APIs (API Placas, PlacaAPI)
- [ ] Sistema de notificações para limite de quota

---

## 🐛 Troubleshooting

### Problema: "Placa não encontrada"

**Possíveis causas:**
1. Placa não existe ou foi digitada errado
2. Todas as APIs estão indisponíveis
3. Veículo muito antigo (não cadastrado)

**Solução:**
- Verificar formato da placa
- Tentar novamente após alguns minutos
- Preencher manualmente

### Problema: "API Brasil: Credenciais inválidas"

**Causa:** Tokens inválidos ou expirados

**Solução:**
1. Verificar APIBRASIL_DEVICE_TOKEN no .env
2. Verificar APIBRASIL_BEARER_TOKEN no .env
3. Gerar novos tokens no dashboard da API Brasil

### Problema: Cache não está funcionando

**Solução:**
```bash
# Limpar cache via API (admin)
POST /vehicles/lookup-cache/clear

# Ou reiniciar o servidor
npm run dev
```

---

## 📚 Referências

- [API Brasil - Documentação](https://apibrasil.com.br)
- [FIPE API - Documentação](https://fipeapi.com.br)
- [SINESP API - GitHub](https://github.com/Buscador-Placas/sinesp-api)
- [Padrão Mercosul de Placas](https://www.gov.br/infraestrutura/pt-br/assuntos/transito/conteudo-denatran/placa-padrao-mercosul)

---

**Desenvolvido com ❤️ por Claude Code**

**Versão**: 1.0.0
**Última atualização**: 24/11/2025
