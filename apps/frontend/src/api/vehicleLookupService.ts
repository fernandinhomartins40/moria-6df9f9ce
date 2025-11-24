import apiClient from './apiClient';

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
  source: string;
}

export interface VehicleLookupResponse {
  data: VehicleLookupData;
  cached: boolean;
}

export interface APIProviderStatus {
  name: string;
  status: 'available' | 'unavailable' | 'error';
  remainingQuota: number | 'unlimited' | null;
  priority: number;
}

export interface ProvidersStatusResponse {
  providers: APIProviderStatus[];
}

class VehicleLookupService {
  /**
   * Busca dados do veículo por placa
   */
  async lookupByPlate(plate: string): Promise<VehicleLookupResponse> {
    const response = await apiClient.get(`/vehicles/lookup/${plate}`);
    return {
      data: response.data.data,
      cached: response.data.cached,
    };
  }

  /**
   * Verifica status dos providers de API
   */
  async getProvidersStatus(): Promise<ProvidersStatusResponse> {
    const response = await apiClient.get('/vehicles/lookup-status');
    return response.data.data;
  }

  /**
   * Retorna estatísticas do cache (admin apenas)
   */
  async getCacheStats(): Promise<{ size: number; entries: string[] }> {
    const response = await apiClient.get('/vehicles/lookup-cache/stats');
    return response.data.data;
  }

  /**
   * Limpa o cache (admin apenas)
   */
  async clearCache(): Promise<void> {
    await apiClient.post('/vehicles/lookup-cache/clear');
  }

  /**
   * Valida formato de placa (antigo e Mercosul)
   */
  validatePlate(plate: string): { valid: boolean; message?: string } {
    const cleanPlate = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (cleanPlate.length < 7) {
      return { valid: false, message: 'Placa muito curta' };
    }

    // Padrão antigo: AAA9999
    const oldPattern = /^[A-Z]{3}[0-9]{4}$/;
    // Padrão Mercosul: AAA9A99
    const mercosulPattern = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

    const isValid = oldPattern.test(cleanPlate) || mercosulPattern.test(cleanPlate);

    if (!isValid) {
      return {
        valid: false,
        message: 'Formato inválido. Use ABC1234 ou ABC1D23',
      };
    }

    return { valid: true };
  }

  /**
   * Formata placa para exibição (ABC-1234 ou ABC-1D23)
   */
  formatPlate(plate: string): string {
    const cleanPlate = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    if (cleanPlate.length === 7) {
      // ABC1234 -> ABC-1234 ou ABC1D23 -> ABC-1D23
      return `${cleanPlate.slice(0, 3)}-${cleanPlate.slice(3)}`;
    }

    return cleanPlate;
  }
}

export default new VehicleLookupService();
