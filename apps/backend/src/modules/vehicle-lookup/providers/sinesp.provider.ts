import {
  VehicleAPIProvider,
  VehicleLookupResponse,
} from '../interfaces/vehicle-api-provider.interface.js';

/**
 * SINESP Provider - Gratuito (fallback)
 * Usa biblioteca sinesp-api do npm
 *
 * AVISO: Este provider usa APIs não oficiais do SINESP que podem
 * parar de funcionar a qualquer momento. Configure API Brasil ou
 * FIPE para maior confiabilidade.
 *
 * Instalação necessária: npm install sinesp-api
 */
export class SinespProvider implements VehicleAPIProvider {
  name = 'sinesp';
  priority = 3; // Menor prioridade (fallback)

  private sinespApi: any = null;

  constructor() {
    // Tenta importar sinesp-api, mas não falha se não estiver instalado
    try {
      // Dynamic import para evitar erro se módulo não estiver instalado
      this.sinespApi = require('sinesp-api');
    } catch (error) {
      console.warn('sinesp-api não instalado. Provider SINESP desabilitado.');
      console.warn('Execute: npm install sinesp-api --save');
    }
  }

  async lookupByPlate(plate: string): Promise<VehicleLookupResponse> {
    if (!this.sinespApi) {
      throw new Error(
        'SINESP: Módulo sinesp-api não instalado. Execute: npm install sinesp-api'
      );
    }

    try {
      const cleanPlate = this.cleanPlate(plate);

      // Usar a biblioteca sinesp-api
      const result = await this.sinespApi.search(cleanPlate);

      // Verificar se encontrou o veículo
      if (!result || result.codigoRetorno !== '0') {
        throw new Error(
          result?.mensagemRetorno || 'Veículo não encontrado na base do SINESP'
        );
      }

      // Mapear resposta da API para nosso formato
      return {
        plate: cleanPlate,
        brand: this.normalizeBrand(result.marca || ''),
        model: this.normalizeModel(result.modelo || ''),
        year: parseInt(result.ano) || new Date().getFullYear(),
        modelYear: parseInt(result.anoModelo) || parseInt(result.ano),
        color: this.normalizeColor(result.cor || ''),
        municipality: result.municipio || '',
        state: result.uf || '',
        chassisLastDigits: result.chassi?.slice(-4) || undefined,
        stolen: result.situacao?.toLowerCase().includes('roubo') ||
                result.situacao?.toLowerCase().includes('furto') || false,
        source: 'sinesp',
      };
    } catch (error: any) {
      // Se for erro da biblioteca, envolver em mensagem mais clara
      if (error.message?.includes('timeout')) {
        throw new Error('SINESP: Timeout ao consultar placa. API pode estar indisponível.');
      }
      throw new Error(`SINESP: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    // Se o módulo não está instalado, não está disponível
    if (!this.sinespApi) {
      return false;
    }

    // Teste simples: se o módulo está carregado, assume disponível
    // Não fazemos teste real pois gastaria quota da API
    return true;
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
      'VERDE': 'VERDE',
      'AMARELA': 'AMARELO',
      'BEGE': 'BEGE',
      'MARROM': 'MARROM',
    };

    const normalized = color.toUpperCase().trim();
    return colorMap[normalized] || normalized;
  }
}
