import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Gauge,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ClipboardCheck
} from 'lucide-react';
import { CreateVehicleModalCustomer } from './CreateVehicleModalCustomer';
import { EditVehicleModalCustomer } from './EditVehicleModalCustomer';
import { DeleteVehicleDialog } from './DeleteVehicleDialog';
import vehicleService, { CustomerVehicle } from '../../api/vehicleService';
import { useToast } from '../../hooks/use-toast';

export function CustomerVehicles() {
  const { customer } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<CustomerVehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<CustomerVehicle | null>(null);

  useEffect(() => {
    if (customer) {
      loadVehicles();
    }
  }, [customer]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast({
        title: 'Erro ao carregar veículos',
        description: 'Não foi possível carregar seus veículos. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (vehicle: CustomerVehicle) => {
    setVehicles(prev => [...prev, vehicle]);
    setIsCreateModalOpen(false);
    toast({
      title: 'Veículo cadastrado com sucesso!',
      description: `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`,
    });
  };

  const handleEditSuccess = (updatedVehicle: CustomerVehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    setEditingVehicle(null);
    toast({
      title: 'Veículo atualizado com sucesso!',
      description: `${updatedVehicle.brand} ${updatedVehicle.model}`,
    });
  };

  const handleDeleteSuccess = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    setDeletingVehicle(null);
    toast({
      title: 'Veículo removido com sucesso!',
      description: 'O veículo foi removido da sua lista.',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!customer) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie seus veículos cadastrados
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-moria-orange hover:bg-moria-orange/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Veículo
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cadastre seus veículos para facilitar o agendamento de revisões e acompanhar o histórico de manutenções.
        </AlertDescription>
      </Alert>

      {/* Vehicles List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-moria-orange" />
          <p className="text-muted-foreground">Carregando seus veículos...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-2">Nenhum veículo cadastrado</p>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre seu primeiro veículo para começar
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-moria-orange hover:bg-moria-orange/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Veículo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map(vehicle => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-moria-orange/10 p-3 rounded-lg">
                      <Car className="h-6 w-6 text-moria-orange" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {vehicle.brand} {vehicle.model}
                      </CardTitle>
                      <CardDescription className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="font-mono">
                            {vehicle.plate}
                          </Badge>
                          <span>•</span>
                          <span>Ano: {vehicle.year}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Cor: {vehicle.color}</span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  {vehicle.mileage && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Quilometragem</p>
                        <p className="text-sm font-semibold">{vehicle.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cadastrado em</p>
                      <p className="text-sm font-semibold">{formatDate(vehicle.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Chassis Number (if available) */}
                {vehicle.chassisNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Número do Chassi</p>
                    <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border">
                      {vehicle.chassisNumber}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-moria-orange hover:bg-moria-orange/90"
                    size="sm"
                    onClick={() => toast({
                      title: 'Funcionalidade em desenvolvimento',
                      description: 'Em breve você poderá agendar revisões diretamente pelo painel!',
                    })}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Agendar Revisão
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingVehicle(vehicle)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeletingVehicle(vehicle)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateVehicleModalCustomer
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      {editingVehicle && (
        <EditVehicleModalCustomer
          vehicle={editingVehicle}
          isOpen={!!editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Dialog */}
      {deletingVehicle && (
        <DeleteVehicleDialog
          vehicle={deletingVehicle}
          isOpen={!!deletingVehicle}
          onClose={() => setDeletingVehicle(null)}
          onSuccess={() => handleDeleteSuccess(deletingVehicle.id)}
        />
      )}
    </div>
  );
}
