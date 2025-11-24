import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { CustomerVehicle } from '../../api/vehicleService';
import vehicleService from '../../api/vehicleService';
import { useToast } from '../../hooks/use-toast';

interface DeleteVehicleDialogProps {
  vehicle: CustomerVehicle;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isPermanent?: boolean; // Se true, deleta permanentemente; se false, arquiva
}

export function DeleteVehicleDialog({ vehicle, isOpen, onClose, onSuccess, isPermanent = false }: DeleteVehicleDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (isPermanent) {
        await vehicleService.permanentlyDeleteVehicle(vehicle.id);
      } else {
        await vehicleService.deleteVehicle(vehicle.id);
      }
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao deletar veículo:', error);
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || `Erro ao ${isPermanent ? 'deletar permanentemente' : 'arquivar'} veículo. Tente novamente.`;

      toast({
        title: `Erro ao ${isPermanent ? 'deletar' : 'arquivar'} veículo`,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {isPermanent ? 'Deletar Veículo Permanentemente' : 'Arquivar Veículo'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Tem certeza que deseja {isPermanent ? 'deletar permanentemente' : 'arquivar'} o veículo{' '}
              <span className="font-semibold text-gray-900">
                {vehicle.brand} {vehicle.model} - {vehicle.plate}
              </span>
              ?
            </p>
            <div className={`${isPermanent ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-3`}>
              <p className={`text-sm ${isPermanent ? 'text-red-800' : 'text-orange-800'}`}>
                <strong>Atenção:</strong>{' '}
                {isPermanent
                  ? 'Esta ação NÃO PODE ser desfeita! O veículo será deletado permanentemente do sistema. Se houver revisões vinculadas, a deleção não será permitida.'
                  : 'O veículo será arquivado e não aparecerá mais na lista de veículos ativos. Você poderá restaurá-lo a qualquer momento na seção de "Veículos Arquivados".'
                }
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isPermanent ? 'Deletando...' : 'Arquivando...'}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {isPermanent ? 'Sim, Deletar Permanentemente' : 'Sim, Arquivar Veículo'}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
