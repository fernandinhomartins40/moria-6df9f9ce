import axios from 'axios';
import {
  VehicleAPIProvider,
  VehicleLookupResponse,
} from '../interfaces/vehicle-api-provider.interface.js';

/**
 * SINESP Provider - Gratuito (fallback)
 * Usa API não oficial do SINESP Cidadão
 */
export class SinespProvider implements VehicleAPIProvider {
  name = 'sinesp';
  priority = 3; // Menor prioridade (fallback)

  private readonly baseURL = 'https://api-receitaws-sinesp.vercel.app/api/v1';

  async lookupByPlate(plate: string): Promise<VehicleLookupResponse> {
    try {
      const cleanPlate = this.cleanPlate(plate);

      const response = await axios.get(`${this.baseURL}/sinesp`, {
        params: { placa: cleanPlate },
        timeout: 10000,
      });

      if (!response.data || response.data.error) {
        throw new Error(response.data?.message || 'Placa não encontrada');
      }

      const data = response.data;

      return {
        plate: cleanPlate,
        brand: this.normalizeBrand(data.marca || ''),
        model: this.normalizeModel(data.modelo || ''),
        year: parseInt(data.ano) || new Date().getFullYear(),
        modelYear: parseInt(data.anoModelo) || parseInt(data.ano),
        color: this.normalizeColor(data.cor || ''),
        municipality: data.municipio || '',
        state: data.uf || '',
        stolen: data.situacao?.toLowerCase().includes('roubo') || false,
        source: 'sinesp',
      };
    } catch (error: any) {
      throw new Error(`SINESP: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getRemainingQuota(): Promise<'unlimited'> {
    return 'unlimited';
  }

  private cleanPlate(plate: string): string {
    return plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }

  private normalizeBrand(brand: string): string {
    return brand.toUpperCase().trim();
  }

  private normalizeModel(model: string): string {
    return model.toUpperCase().trim();
  }

  private normalizeColor(color: string): string {
    const colorMap: Record<string, string> = {
      'BRANCA': 'BRANCO',
      'PRETA': 'PRETO',
      'VERMELHA': 'VERMELHO',
      'AZUL': 'AZUL',
      'PRATA': 'PRATA',
      'CINZA': 'CINZA',
    };

    return colorMap[color.toUpperCase()] || color.toUpperCase();
  }
}
