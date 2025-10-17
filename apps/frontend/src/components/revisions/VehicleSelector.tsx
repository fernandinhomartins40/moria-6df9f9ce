import { useState } from 'react';
import { Car, Plus, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useRevisions } from '../../contexts/RevisionsContext';
import { Vehicle } from '../../types/revisions';

interface VehicleSelectorProps {
  customerId: string | null;
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function VehicleSelector({
  customerId,
  selectedVehicle,
  onSelectVehicle
}: VehicleSelectorProps) {
  const { vehicles, addVehicle, getVehiclesByCustomer } = useRevisions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    chassisNumber: '',
    color: '',
    mileage: 0
  });

  const customerVehicles = customerId ? getVehiclesByCustomer(customerId) : [];

  const filteredVehicles = customerVehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.year.toString().includes(searchTerm)
  );

  const handleCreateVehicle = () => {
    if (!customerId) {
      alert('Selecione um cliente primeiro');
      return;
    }

    if (!newVehicle.brand || !newVehicle.model || !newVehicle.plate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const vehicle = addVehicle({
      ...newVehicle,
      customerId
    });

    onSelectVehicle(vehicle);
    setIsDialogOpen(false);
    setIsCreating(false);
    setNewVehicle({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      chassisNumber: '',
      color: '',
      mileage: 0
    });
  };

  if (!customerId) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Veículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Selecione um cliente primeiro
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Veículo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedVehicle ? (
          <div className="bg-moria-orange/10 border border-moria-orange/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-lg">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </p>
                <p className="text-sm text-gray-600">Ano: {selectedVehicle.year}</p>
                <p className="text-sm text-gray-600">Placa: {selectedVehicle.plate}</p>
                {selectedVehicle.color && (
                  <p className="text-sm text-gray-600">Cor: {selectedVehicle.color}</p>
                )}
                {selectedVehicle.mileage !== undefined && selectedVehicle.mileage > 0 && (
                  <p className="text-sm text-gray-600">
                    Km: {selectedVehicle.mileage.toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                Trocar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full bg-moria-orange hover:bg-moria-orange/90"
          >
            <Car className="h-4 w-4 mr-2" />
            Selecionar Veículo
          </Button>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? 'Cadastrar Novo Veículo' : 'Selecionar Veículo'}
              </DialogTitle>
            </DialogHeader>

            {isCreating ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      value={newVehicle.brand}
                      onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                      placeholder="Ex: Toyota, Ford, Volkswagen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                      placeholder="Ex: Corolla, Fiesta, Gol"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                      min={1900}
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate">Placa *</Label>
                    <Input
                      id="plate"
                      value={newVehicle.plate}
                      onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                      placeholder="ABC-1234"
                      maxLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chassisNumber">Número do Chassi</Label>
                  <Input
                    id="chassisNumber"
                    value={newVehicle.chassisNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, chassisNumber: e.target.value })}
                    placeholder="00000000000000000"
                    maxLength={17}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      value={newVehicle.color}
                      onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                      placeholder="Ex: Preto, Branco, Prata"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Quilometragem Atual</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={newVehicle.mileage}
                      onChange={(e) => setNewVehicle({ ...newVehicle, mileage: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewVehicle({
                        brand: '',
                        model: '',
                        year: new Date().getFullYear(),
                        plate: '',
                        chassisNumber: '',
                        color: '',
                        mileage: 0
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateVehicle}
                    className="bg-moria-orange hover:bg-moria-orange/90"
                  >
                    Cadastrar
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por marca, modelo, placa ou ano..."
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-moria-orange hover:bg-moria-orange/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredVehicles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum veículo encontrado</p>
                      <Button
                        onClick={() => setIsCreating(true)}
                        variant="link"
                        className="text-moria-orange"
                      >
                        Cadastrar novo veículo
                      </Button>
                    </div>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <Card
                        key={vehicle.id}
                        className="cursor-pointer hover:border-moria-orange transition-colors"
                        onClick={() => {
                          onSelectVehicle(vehicle);
                          setIsDialogOpen(false);
                          setSearchTerm('');
                        }}
                      >
                        <CardContent className="p-4">
                          <p className="font-semibold">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-sm text-gray-600">Ano: {vehicle.year}</p>
                          <p className="text-sm text-gray-600">Placa: {vehicle.plate}</p>
                          {vehicle.color && (
                            <p className="text-sm text-gray-600">Cor: {vehicle.color}</p>
                          )}
                          {vehicle.mileage !== undefined && vehicle.mileage > 0 && (
                            <p className="text-sm text-gray-600">
                              Km: {vehicle.mileage.toLocaleString()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
