import {
  VehicleAPIProvider,
  VehicleLookupResponse,
  APIStatus,
} from './interfaces/vehicle-api-provider.interface.js';
import { APIBrasilProvider } from './providers/apibrasil.provider.js';
import { FipeProvider } from './providers/fipe.provider.js';
import { SinespProvider } from './providers/sinesp.provider.js';

/**
 * Cache simples em memória
 * Em produção, usar Redis ou similar
 */
interface CacheEntry {
  data: VehicleLookupResponse;
  timestamp: number;
}

export class VehicleLookupService {
  private providers: VehicleAPIProvider[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 dias

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Adicionar providers em ordem de prioridade
    this.providers.push(new APIBrasilProvider());
    this.providers.push(new FipeProvider());
    this.providers.push(new SinespProvider());

    // Ordenar por prioridade
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Busca dados do veículo por placa com sistema de fallback
   */
  async lookupByPlate(plate: string): Promise<{ data: VehicleLookupResponse; cached: boolean }> {
    const cleanPlate = this.cleanPlate(plate);

    // Verificar cache
    const cached = this.getFromCache(cleanPlate);
    if (cached) {
      return { data: cached, cached: true };
    }

    // Tentar cada provider em ordem de prioridade
    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        console.log(`Tentando provider: ${provider.name}`);
        const result = await provider.lookupByPlate(cleanPlate);

        // Sucesso! Salvar no cache e retornar
        this.saveToCache(cleanPlate, result);
        return { data: result, cached: false };
      } catch (error: any) {
        errors.push(`${provider.name}: ${error.message}`);
        console.error(`Provider ${provider.name} falhou:`, error.message);
        // Continuar para o próximo provider
      }
    }

    // Todos os providers falharam
    throw new Error(
      `Não foi possível consultar a placa ${cleanPlate}. Erros: ${errors.join('; ')}`
    );
  }

  /**
   * Verifica o status de todos os providers
   */
  async getProvidersStatus(): Promise<APIStatus[]> {
    const statusPromises = this.providers.map(async (provider) => {
      try {
        const isAvailable = await provider.isAvailable();
        const remainingQuota = provider.getRemainingQuota
          ? await provider.getRemainingQuota()
          : null;

        return {
          name: provider.name,
          status: isAvailable ? 'available' : 'unavailable',
          remainingQuota,
          priority: provider.priority,
        } as APIStatus;
      } catch {
        return {
          name: provider.name,
          status: 'error',
          remainingQuota: null,
          priority: provider.priority,
        } as APIStatus;
      }
    });

    return Promise.all(statusPromises);
  }

  /**
   * Limpa o cache (útil para testes)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Retorna estatísticas do cache
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  // Métodos privados de cache

  private getFromCache(plate: string): VehicleLookupResponse | null {
    const entry = this.cache.get(plate);

    if (!entry) {
      return null;
    }

    // Verificar se o cache expirou
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(plate);
      return null;
    }

    return entry.data;
  }

  private saveToCache(plate: string, data: VehicleLookupResponse): void {
    this.cache.set(plate, {
      data,
      timestamp: Date.now(),
    });
  }

  private cleanPlate(plate: string): string {
    return plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }
}
