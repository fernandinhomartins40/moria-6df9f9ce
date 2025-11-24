# Guia de Implementação Técnica - API de Consulta de Placas

Este documento complementa a proposta principal com exemplos de código e detalhes técnicos de implementação.

---

## 📦 Dependências Necessárias

```bash
# Backend
npm install axios
npm install @nestjs/cache-manager cache-manager
npm install ioredis

# Opcional (para SINESP fallback)
npm install sinesp-api
```

---

## 🏗️ Estrutura Backend Detalhada

### 1. Interface do Provider

```typescript
// apps/backend/src/modules/vehicle-lookup/interfaces/vehicle-api-provider.interface.ts

export interface VehicleLookupData {
  plate: string;
  brand: string;
  model: string;
  year: number;
  modelYear?: number;
  color?: string;
  chassisLastDigits?: string;
  municipality?: string;
  state?: string;
  fipeValue?: string;
  fipeCode?: string;
  stolen?: boolean;
  fuel?: string;
}

export interface VehicleAPIProvider {
  name: string;
  priority: number;
  lookupByPlate(plate: string): Promise<VehicleLookupData>;
  isAvailable(): Promise<boolean>;
  getRemainingQuota?(): Promise<number | null>;
}

export interface VehicleLookupResponse {
  success: boolean;
  data?: VehicleLookupData;
  source: string;
  cached: boolean;
  error?: string;
}
```

### 2. Provider API Brasil

```typescript
// apps/backend/src/modules/vehicle-lookup/providers/apibrasil.provider.ts

import axios from 'axios';
import { VehicleAPIProvider, VehicleLookupData } from '../interfaces/vehicle-api-provider.interface';

export class APIBrasilProvider implements VehicleAPIProvider {
  name = 'apibrasil';
  priority = 1;

  private readonly baseURL = 'https://gateway.apibrasil.io';
  private readonly deviceToken: string;
  private readonly bearerToken: string;

  constructor() {
    this.deviceToken = process.env.APIBRASIL_DEVICE_TOKEN || '';
    this.bearerToken = process.env.APIBRASIL_BEARER_TOKEN || '';

    if (!this.deviceToken || !this.bearerToken) {
      throw new Error('API Brasil tokens not configured');
    }
  }

  async lookupByPlate(plate: string): Promise<VehicleLookupData> {
    try {
      const cleanPlate = plate.replace(/[^A-Z0-9]/g, '');

      const response = await axios.get(`${this.baseURL}/vehicles/placa`, {
        params: {
          placa: cleanPlate,
          token: this.deviceToken,
        },
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10s timeout
      });

      // Mapear resposta da API Brasil para nosso formato
      return this.mapResponse(response.data, cleanPlate);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('PLATE_NOT_FOUND');
        }
        if (error.response?.status === 429) {
          throw new Error('QUOTA_EXCEEDED');
        }
      }
      throw new Error('API_UNAVAILABLE');
    }
  }

  private mapResponse(data: any, plate: string): VehicleLookupData {
    return {
      plate: plate,
      brand: data.marca?.toUpperCase() || '',
      model: data.modelo?.toUpperCase() || '',
      year: parseInt(data.ano) || 0,
      modelYear: parseInt(data.anoModelo) || parseInt(data.ano) || 0,
      color: data.cor?.toUpperCase() || undefined,
      chassisLastDigits: data.chassi ? data.chassi.slice(-4) : undefined,
      municipality: data.municipio?.toUpperCase() || undefined,
      state: data.uf?.toUpperCase() || undefined,
      stolen: data.situacao === 'ROUBO/FURTO',
      fuel: data.combustivel || undefined,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Verificar se a API está respondendo
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getRemainingQuota(): Promise<number | null> {
    try {
      const response = await axios.get(`${this.baseURL}/account/quota`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
        },
        params: {
          token: this.deviceToken,
        },
      });
      return response.data.remaining || null;
    } catch {
      return null;
    }
  }
}
```

### 3. Provider FIPE API

```typescript
// apps/backend/src/modules/vehicle-lookup/providers/fipe.provider.ts

import axios from 'axios';
import { VehicleAPIProvider, VehicleLookupData } from '../interfaces/vehicle-api-provider.interface';

export class FIPEProvider implements VehicleAPIProvider {
  name = 'fipe';
  priority = 2;

  private readonly baseURL = 'https://fipeapi.com.br/api';
  private readonly apiToken: string;

  constructor() {
    this.apiToken = process.env.FIPE_API_TOKEN || '';
    if (!this.apiToken) {
      throw new Error('FIPE API token not configured');
    }
  }

  async lookupByPlate(plate: string): Promise<VehicleLookupData> {
    try {
      const cleanPlate = plate.replace(/[^A-Z0-9]/g, '');

      const response = await axios.get(`${this.baseURL}/placa/${cleanPlate}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        timeout: 10000,
      });

      return this.mapResponse(response.data, cleanPlate);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('PLATE_NOT_FOUND');
        }
      }
      throw new Error('API_UNAVAILABLE');
    }
  }

  private mapResponse(data: any, plate: string): VehicleLookupData {
    return {
      plate: plate,
      brand: data.marca?.toUpperCase() || '',
      model: data.modelo?.toUpperCase() || '',
      year: parseInt(data.ano) || 0,
      modelYear: parseInt(data.anoModelo) || parseInt(data.ano) || 0,
      color: data.cor?.toUpperCase() || undefined,
      chassisLastDigits: data.chassi ? data.chassi.slice(-4) : undefined,
      fipeValue: data.preco || undefined,
      fipeCode: data.codigoFipe || undefined,
      fuel: data.combustivel || undefined,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/status`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
```

### 4. Provider SINESP (Fallback Gratuito)

```typescript
// apps/backend/src/modules/vehicle-lookup/providers/sinesp.provider.ts

import { VehicleAPIProvider, VehicleLookupData } from '../interfaces/vehicle-api-provider.interface';

// Importar dinamicamente para evitar erro se não instalado
let sinespApi: any;
try {
  sinespApi = require('sinesp-api');
} catch {
  console.warn('sinesp-api not installed. Install with: npm install sinesp-api');
}

export class SINESPProvider implements VehicleAPIProvider {
  name = 'sinesp';
  priority = 3;

  async lookupByPlate(plate: string): Promise<VehicleLookupData> {
    if (!sinespApi) {
      throw new Error('SINESP provider not available');
    }

    try {
      const cleanPlate = plate.replace(/[^A-Z0-9]/g, '');
      const result = await sinespApi.search(cleanPlate);

      if (!result || result.mensagemRetorno) {
        throw new Error('PLATE_NOT_FOUND');
      }

      return {
        plate: cleanPlate,
        brand: result.marca?.toUpperCase() || '',
        model: result.modelo?.toUpperCase() || '',
        year: parseInt(result.ano) || 0,
        modelYear: parseInt(result.anoModelo) || parseInt(result.ano) || 0,
        color: result.cor?.toUpperCase() || undefined,
        chassisLastDigits: result.chassi || undefined,
        municipality: result.municipio?.toUpperCase() || undefined,
        state: result.uf?.toUpperCase() || undefined,
        stolen: result.situacao?.includes('ROUBO') || result.situacao?.includes('FURTO'),
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'PLATE_NOT_FOUND') {
        throw error;
      }
      throw new Error('API_UNAVAILABLE');
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!sinespApi;
  }
}
```

### 5. Service Principal com Fallback

```typescript
// apps/backend/src/modules/vehicle-lookup/vehicle-lookup.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { VehicleAPIProvider, VehicleLookupResponse } from './interfaces/vehicle-api-provider.interface';
import { APIBrasilProvider } from './providers/apibrasil.provider';
import { FIPEProvider } from './providers/fipe.provider';
import { SINESPProvider } from './providers/sinesp.provider';

@Injectable()
export class VehicleLookupService {
  private providers: VehicleAPIProvider[] = [];

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Adicionar providers por ordem de prioridade
    try {
      this.providers.push(new APIBrasilProvider());
    } catch (error) {
      console.warn('API Brasil provider not available:', error.message);
    }

    try {
      this.providers.push(new FIPEProvider());
    } catch (error) {
      console.warn('FIPE provider not available:', error.message);
    }

    try {
      this.providers.push(new SINESPProvider());
    } catch (error) {
      console.warn('SINESP provider not available:', error.message);
    }

    if (this.providers.length === 0) {
      throw new Error('No vehicle lookup providers available');
    }

    // Ordenar por prioridade
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  async lookupByPlate(plate: string): Promise<VehicleLookupResponse> {
    // Validar formato da placa
    if (!this.validatePlate(plate)) {
      return {
        success: false,
        source: 'validation',
        cached: false,
        error: 'INVALID_PLATE',
      };
    }

    const cleanPlate = plate.replace(/[^A-Z0-9]/g, '').toUpperCase();

    // Verificar cache
    const cacheKey = `vehicle:plate:${cleanPlate}`;
    const cached = await this.cacheManager.get<VehicleLookupResponse>(cacheKey);

    if (cached) {
      return {
        ...cached,
        cached: true,
      };
    }

    // Tentar cada provider em ordem de prioridade
    for (const provider of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          console.warn(`Provider ${provider.name} is not available`);
          continue;
        }

        const data = await provider.lookupByPlate(cleanPlate);

        const response: VehicleLookupResponse = {
          success: true,
          data,
          source: provider.name,
          cached: false,
        };

        // Salvar no cache por 30 dias
        await this.cacheManager.set(cacheKey, response, 30 * 24 * 60 * 60 * 1000);

        return response;
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error.message);

        if (error.message === 'PLATE_NOT_FOUND') {
          // Se um provider confirma que não existe, não tentar os outros
          return {
            success: false,
            source: provider.name,
            cached: false,
            error: 'PLATE_NOT_FOUND',
          };
        }

        // Continuar para próximo provider
        continue;
      }
    }

    // Todos providers falharam
    return {
      success: false,
      source: 'all_providers',
      cached: false,
      error: 'API_UNAVAILABLE',
    };
  }

  private validatePlate(plate: string): boolean {
    const cleanPlate = plate.replace(/[^A-Z0-9]/g, '');

    // Padrão antigo: AAA9999
    const oldPattern = /^[A-Z]{3}[0-9]{4}$/;

    // Padrão Mercosul: AAA9A99
    const mercosulPattern = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

    return oldPattern.test(cleanPlate) || mercosulPattern.test(cleanPlate);
  }

  async getProvidersStatus() {
    const status = await Promise.all(
      this.providers.map(async (provider) => {
        const isAvailable = await provider.isAvailable();
        const remainingQuota = provider.getRemainingQuota
          ? await provider.getRemainingQuota()
          : null;

        return {
          name: provider.name,
          status: isAvailable ? 'available' : 'unavailable',
          priority: provider.priority,
          remainingQuota,
        };
      }),
    );

    return status;
  }
}
```

### 6. Controller

```typescript
// apps/backend/src/modules/vehicle-lookup/vehicle-lookup.controller.ts

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VehicleLookupService } from './vehicle-lookup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vehicles/lookup')
@UseGuards(JwtAuthGuard)
export class VehicleLookupController {
  constructor(private readonly vehicleLookupService: VehicleLookupService) {}

  @Get(':plate')
  async lookupByPlate(@Param('plate') plate: string) {
    const result = await this.vehicleLookupService.lookupByPlate(plate);

    if (!result.success) {
      const errorMessages = {
        PLATE_NOT_FOUND: 'Placa não encontrada nos registros',
        INVALID_PLATE: 'Formato de placa inválido',
        API_UNAVAILABLE: 'Serviço temporariamente indisponível',
        QUOTA_EXCEEDED: 'Limite de consultas atingido',
      };

      return {
        success: false,
        error: errorMessages[result.error] || 'Erro ao consultar placa',
        code: result.error,
      };
    }

    return {
      success: true,
      data: result.data,
      source: result.source,
      cached: result.cached,
    };
  }

  @Get('status/providers')
  async getProvidersStatus() {
    const status = await this.vehicleLookupService.getProvidersStatus();
    return {
      success: true,
      data: {
        providers: status,
      },
    };
  }
}
```

### 7. Module

```typescript
// apps/backend/src/modules/vehicle-lookup/vehicle-lookup.module.ts

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { VehicleLookupController } from './vehicle-lookup.controller';
import { VehicleLookupService } from './vehicle-lookup.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 30 * 24 * 60 * 60, // 30 dias em segundos
      max: 10000, // máximo de 10k entradas no cache
    }),
  ],
  controllers: [VehicleLookupController],
  providers: [VehicleLookupService],
  exports: [VehicleLookupService],
})
export class VehicleLookupModule {}
```

---

## 🎨 Frontend Implementation

### 1. Service

```typescript
// apps/frontend/src/api/vehicleLookupService.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface VehicleLookupData {
  plate: string;
  brand: string;
  model: string;
  year: number;
  modelYear?: number;
  color?: string;
  chassisLastDigits?: string;
  municipality?: string;
  state?: string;
  fipeValue?: string;
  fipeCode?: string;
  stolen?: boolean;
  fuel?: string;
}

export interface VehicleLookupResponse {
  success: boolean;
  data?: VehicleLookupData;
  source?: string;
  cached?: boolean;
  error?: string;
  code?: string;
}

class VehicleLookupService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async lookupByPlate(plate: string): Promise<VehicleLookupResponse> {
    try {
      const cleanPlate = plate.replace(/[^A-Z0-9]/g, '').toUpperCase();

      const response = await axios.get(
        `${API_BASE_URL}/api/vehicles/lookup/${cleanPlate}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 15000, // 15s timeout
        }
      );

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Erro ao consultar placa',
          code: error.response?.data?.code || 'NETWORK_ERROR',
        };
      }
      return {
        success: false,
        error: 'Erro inesperado ao consultar placa',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  async getProvidersStatus() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/vehicles/lookup/status/providers`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching providers status:', error);
      return { success: false, data: { providers: [] } };
    }
  }
}

export default new VehicleLookupService();
```

### 2. Hook Customizado

```typescript
// apps/frontend/src/hooks/useVehicleLookup.ts

import { useState } from 'react';
import vehicleLookupService, { VehicleLookupData } from '../api/vehicleLookupService';
import { useToast } from './use-toast';

export function useVehicleLookup() {
  const [isLooking, setIsLooking] = useState(false);
  const [lookupData, setLookupData] = useState<VehicleLookupData | null>(null);
  const { toast } = useToast();

  const lookupByPlate = async (plate: string) => {
    setIsLooking(true);
    setLookupData(null);

    try {
      const response = await vehicleLookupService.lookupByPlate(plate);

      if (response.success && response.data) {
        setLookupData(response.data);

        toast({
          title: 'Dados encontrados!',
          description: `Veículo encontrado via ${response.source}${response.cached ? ' (cache)' : ''}`,
          variant: 'default',
        });

        return response.data;
      } else {
        const errorMessages: { [key: string]: string } = {
          PLATE_NOT_FOUND: 'Placa não encontrada. Preencha manualmente.',
          INVALID_PLATE: 'Formato de placa inválido.',
          API_UNAVAILABLE: 'Serviço indisponível no momento. Tente novamente.',
          QUOTA_EXCEEDED: 'Limite de consultas atingido.',
        };

        const message = errorMessages[response.code || ''] || response.error || 'Erro ao consultar placa';

        toast({
          title: 'Não foi possível buscar os dados',
          description: message,
          variant: 'destructive',
        });

        return null;
      }
    } catch (error) {
      toast({
        title: 'Erro na busca',
        description: 'Erro inesperado ao consultar placa.',
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsLooking(false);
    }
  };

  return {
    isLooking,
    lookupData,
    lookupByPlate,
  };
}
```

### 3. Componente Modificado

```typescript
// apps/frontend/src/components/customer/CreateVehicleModalCustomer.tsx
// Adicionar ao componente existente

import { Search, Sparkles } from 'lucide-react';
import { useVehicleLookup } from '../../hooks/useVehicleLookup';

export function CreateVehicleModalCustomer({ isOpen, onClose, onSuccess }: CreateVehicleModalCustomerProps) {
  // ... código existente ...

  const { isLooking, lookupByPlate } = useVehicleLookup();
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const handleLookupPlate = async () => {
    if (!formData.plate || formData.plate.length < 7) {
      toast({
        title: 'Placa inválida',
        description: 'Digite uma placa válida antes de buscar.',
        variant: 'destructive',
      });
      return;
    }

    const data = await lookupByPlate(formData.plate);

    if (data) {
      setFormData({
        ...formData,
        brand: data.brand,
        model: data.model,
        year: data.year.toString(),
        color: data.color || '',
        // Manter mileage e chassisNumber vazios para usuário preencher
      });
      setIsAutoFilled(true);
    }
  };

  // ... resto do código ...

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* ... header ... */}

        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="py-4 space-y-3">
            {/* Campo de Placa com Botão de Busca */}
            <div>
              <Label htmlFor="plate" className="text-xs">
                Placa <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="plate"
                  value={formatPlate(formData.plate)}
                  onChange={handlePlateChange}
                  placeholder="ABC-1234 ou ABC1D23"
                  disabled={isCreating || isLooking}
                  className={`h-9 text-sm flex-1 ${errors.plate ? 'border-red-500' : ''}`}
                  maxLength={8}
                />
                <Button
                  type="button"
                  onClick={handleLookupPlate}
                  disabled={isCreating || isLooking || !formData.plate || formData.plate.length < 7}
                  className="h-9 px-3 bg-moria-orange hover:bg-moria-orange/90"
                >
                  {isLooking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.plate && <p className="text-xs text-red-500 mt-0.5">{errors.plate}</p>}
              <p className="text-xs text-gray-500 mt-1">
                💡 Digite a placa e clique na lupa para buscar automaticamente
              </p>
            </div>

            {/* Badge de Auto-preenchimento */}
            {isAutoFilled && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-700">
                  Dados preenchidos automaticamente. Você pode editá-los se necessário.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="brand" className="text-xs flex items-center gap-1">
                  Marca <span className="text-red-500">*</span>
                  {isAutoFilled && <span className="text-xs text-green-600">✓</span>}
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ex: Fiat, Ford, Chevrolet"
                  disabled={isCreating || isLooking}
                  className={`mt-1 h-9 text-sm ${errors.brand ? 'border-red-500' : ''} ${isAutoFilled ? 'bg-green-50/50' : ''}`}
                />
                {errors.brand && <p className="text-xs text-red-500 mt-0.5">{errors.brand}</p>}
              </div>

              {/* Repetir padrão para model, year, color */}
              {/* ... */}
            </div>

            {/* ... resto do formulário ... */}
          </form>
        </ScrollArea>

        {/* ... footer ... */}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🔐 Variáveis de Ambiente

```bash
# .env (backend)

# API Brasil
APIBRASIL_DEVICE_TOKEN=your_device_token_here
APIBRASIL_BEARER_TOKEN=your_bearer_token_here

# FIPE API (opcional)
FIPE_API_TOKEN=your_fipe_token_here

# Cache (Redis - opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## 🧪 Testes

### Teste do Service

```typescript
// apps/backend/src/modules/vehicle-lookup/__tests__/vehicle-lookup.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VehicleLookupService } from '../vehicle-lookup.service';

describe('VehicleLookupService', () => {
  let service: VehicleLookupService;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleLookupService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<VehicleLookupService>(VehicleLookupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('lookupByPlate', () => {
    it('should return error for invalid plate format', async () => {
      const result = await service.lookupByPlate('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PLATE');
    });

    it('should accept old format plates (ABC1234)', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await service.lookupByPlate('ABC1234');

      // Não deve falhar na validação
      expect(result.error).not.toBe('INVALID_PLATE');
    });

    it('should accept Mercosul format plates (ABC1D23)', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await service.lookupByPlate('ABC1D23');

      // Não deve falhar na validação
      expect(result.error).not.toBe('INVALID_PLATE');
    });

    it('should return cached result when available', async () => {
      const cachedData = {
        success: true,
        data: {
          plate: 'ABC1234',
          brand: 'FIAT',
          model: 'UNO',
          year: 2020,
        },
        source: 'apibrasil',
        cached: false,
      };

      cacheManager.get.mockResolvedValue(cachedData);

      const result = await service.lookupByPlate('ABC1234');

      expect(result.success).toBe(true);
      expect(result.cached).toBe(true);
      expect(result.data.brand).toBe('FIAT');
    });
  });
});
```

---

## 📊 Monitoramento

### Endpoint de Métricas

```typescript
// apps/backend/src/modules/vehicle-lookup/vehicle-lookup.controller.ts

@Get('metrics')
async getMetrics() {
  // Implementar sistema de métricas
  return {
    success: true,
    data: {
      totalLookups: 1250,
      successRate: 0.92,
      cacheHitRate: 0.65,
      providerUsage: {
        apibrasil: 850,
        fipe: 250,
        sinesp: 150,
      },
      averageResponseTime: 1200, // ms
      errors: {
        PLATE_NOT_FOUND: 50,
        API_UNAVAILABLE: 30,
        QUOTA_EXCEEDED: 5,
      },
    },
  };
}
```

---

## 🚀 Deploy Checklist

- [ ] Configurar variáveis de ambiente em produção
- [ ] Criar contas nas APIs escolhidas
- [ ] Configurar Redis para cache (recomendado)
- [ ] Testar todos os providers
- [ ] Configurar monitoramento de erros (Sentry)
- [ ] Configurar alertas de quota
- [ ] Documentar processo para equipe
- [ ] Criar runbook para troubleshooting

---

**Documento técnico criado em**: 24/11/2025
**Versão**: 1.0
