import axios from 'axios';
import {
  VehicleAPIProvider,
  VehicleLookupResponse,
} from '../interfaces/vehicle-api-provider.interface.js';

/**
 * SINESP Provider - Gratuito (fallback)
 * Usa biblioteca sinesp-api ou API alternativa
 * Nota: Este provider está desabilitado por padrão pois as APIs públicas
 * são instáveis. Configure API Brasil ou FIPE para funcionalidade completa.
 */
export class SinespProvider implements VehicleAPIProvider {
  name = 'sinesp';
  priority = 3; // Menor prioridade (fallback)

  async lookupByPlate(plate: string): Promise<VehicleLookupResponse> {
    // SINESP APIs públicas são instáveis e frequentemente indisponíveis
    // Por enquanto, retornamos erro informativo
    throw new Error(
      'SINESP: Provider desabilitado. Configure API Brasil ou FIPE para busca automática de placas. ' +
      'Alternativamente, você pode preencher os dados manualmente.'
    );
  }

  async isAvailable(): Promise<boolean> {
    // SINESP está desabilitado por padrão devido à instabilidade
    return false;
  }

  async getRemainingQuota(): Promise<'unlimited'> {
    return 'unlimited';
  }

  private cleanPlate(plate: string): string {
    return plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }
}
