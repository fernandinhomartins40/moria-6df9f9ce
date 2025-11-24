import { useState } from 'react';
import vehicleLookupService, { VehicleLookupData } from '../api/vehicleLookupService';
import { useToast } from './use-toast';

export function useVehicleLookup() {
  const [isLooking, setIsLooking] = useState(false);
  const { toast } = useToast();

  const lookupByPlate = async (plate: string): Promise<VehicleLookupData | null> => {
    // Validar formato primeiro
    const validation = vehicleLookupService.validatePlate(plate);
    if (!validation.valid) {
      toast({
        title: 'Placa inválida',
        description: validation.message,
        variant: 'destructive',
      });
      return null;
    }

    setIsLooking(true);

    try {
      const response = await vehicleLookupService.lookupByPlate(plate);

      // Mostrar toast de sucesso com informação sobre cache
      toast({
        title: response.cached ? '✓ Dados encontrados (cache)' : '✓ Dados encontrados',
        description: `${response.data.brand} ${response.data.model} - ${response.data.year}${
          response.data.fipeValue ? ` | Valor FIPE: ${response.data.fipeValue}` : ''
        }`,
      });

      // Avisar se veículo tem restrição de roubo/furto
      if (response.data.stolen) {
        toast({
          title: '⚠️ Atenção',
          description: 'Este veículo consta como roubado/furtado nos registros!',
          variant: 'destructive',
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar placa:', error);

      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.message ||
        'Não foi possível consultar a placa. Tente novamente.';

      toast({
        title: 'Erro ao buscar placa',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsLooking(false);
    }
  };

  return {
    isLooking,
    lookupByPlate,
  };
}
