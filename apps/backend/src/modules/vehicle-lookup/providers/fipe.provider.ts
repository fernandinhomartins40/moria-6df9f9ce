import axios from 'axios';
import {
  VehicleAPIProvider,
  VehicleLookupResponse,
} from '../interfaces/vehicle-api-provider.interface.js';

/**
 * FIPE API Provider - Inclui valor da tabela FIPE
 * Documentação: https://fipeapi.com.br
 */
export class FipeProvider implements VehicleAPIProvider {
  name = 'fipe';
  priority = 2; // Prioridade média

  private readonly baseURL = 'https://fipeapi.com.br/api/v2';
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FIPE_API_KEY || '';
  }

  async lookupByPlate(plate: string): Promise<VehicleLookupResponse> {
    if (!this.apiKey) {
      throw new Error('FIPE: API Key não configurada');
    }

    try {
      const cleanPlate = this.cleanPlate(plate);

      const response = await axios.get(`${this.baseURL}/placa/${cleanPlate}`, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      if (!response.data || response.data.error) {
        throw new Error(response.data?.message || 'Placa não encontrada');
      }

      const data = response.data;

      return {
        plate: cleanPlate,
        brand: data.marca || '',
        model: data.modelo || '',
        year: parseInt(data.ano) || new Date().getFullYear(),
        modelYear: parseInt(data.anoModelo) || parseInt(data.ano),
        color: data.cor || '',
        fipeValue: data.valor || undefined,
        fipeCode: data.codigoFipe || undefined,
        chassisLastDigits: data.chassi?.slice(-4) || undefined,
        source: 'fipe',
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('FIPE: API Key inválida');
      }
      if (error.response?.status === 429) {
        throw new Error('FIPE: Limite de requisições excedido');
      }
      throw new Error(`FIPE: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        headers: {
          'X-API-KEY': this.apiKey,
        },
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getRemainingQuota(): Promise<number | null> {
    // FIPE API não fornece endpoint de quota facilmente acessível
    return null;
  }

  private cleanPlate(plate: string): string {
    return plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }
}
