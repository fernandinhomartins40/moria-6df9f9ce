import axios from 'axios';
import {
  VehicleAPIProvider,
  VehicleLookupResponse,
} from '../interfaces/vehicle-api-provider.interface.js';

/**
 * API Brasil Provider - Principal (100 req/dia gratuito)
 * Documentação: https://apibrasil.com.br
 */
export class APIBrasilProvider implements VehicleAPIProvider {
  name = 'apibrasil';
  priority = 1; // Maior prioridade

  private readonly baseURL = 'https://gateway.apibrasil.io/api/v2';
  private readonly deviceToken: string;
  private readonly bearerToken: string;

  constructor(deviceToken?: string, bearerToken?: string) {
    this.deviceToken = deviceToken || process.env.APIBRASIL_DEVICE_TOKEN || '';
    this.bearerToken = bearerToken || process.env.APIBRASIL_BEARER_TOKEN || '';
  }

  async lookupByPlate(plate: string): Promise<VehicleLookupResponse> {
    if (!this.deviceToken || !this.bearerToken) {
      throw new Error('API Brasil: Credenciais não configuradas');
    }

    try {
      const cleanPlate = this.cleanPlate(plate);

      const response = await axios.get(`${this.baseURL}/vehicles/dados`, {
        params: {
          placa: cleanPlate,
          token: this.deviceToken,
        },
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
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
        chassisLastDigits: data.chassi?.slice(-4) || undefined,
        municipality: data.municipio || '',
        state: data.uf || '',
        stolen: data.situacao?.toLowerCase().includes('roubo') || false,
        source: 'apibrasil',
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('API Brasil: Credenciais inválidas');
      }
      if (error.response?.status === 429) {
        throw new Error('API Brasil: Limite de requisições excedido');
      }
      throw new Error(`API Brasil: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.deviceToken || !this.bearerToken) {
      return false;
    }

    try {
      const response = await axios.get(`${this.baseURL}/status`, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getRemainingQuota(): Promise<number | null> {
    // API Brasil não fornece endpoint de quota, retorna null
    return null;
  }

  private cleanPlate(plate: string): string {
    return plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }
}
