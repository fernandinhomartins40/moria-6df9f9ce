import { useState } from 'react';
import { Save, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CustomerSelector } from '../revisions/CustomerSelector';
import { VehicleSelector } from '../revisions/VehicleSelector';
import { RevisionChecklist } from '../revisions/RevisionChecklist';
import { ChecklistManager } from '../revisions/ChecklistManager';
import { useRevisions } from '../../contexts/RevisionsContext';
import { Customer, Vehicle, RevisionChecklistItem, ItemStatus } from '../../types/revisions';

export function RevisionsContent() {
  const { categories, addRevision, updateRevision } = useRevisions();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentRevisionId, setCurrentRevisionId] = useState<string | null>(null);
  const [mileage, setMileage] = useState<number>(0);
  const [generalNotes, setGeneralNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [revisionItems, setRevisionItems] = useState<RevisionChecklistItem[]>([]);

  // Initialize checklist items when vehicle is selected
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setMileage(vehicle.mileage || 0);

    // Initialize all enabled items with NOT_CHECKED status
    const items: RevisionChecklistItem[] = [];
    categories.forEach(category => {
      if (category.isEnabled) {
        category.items.forEach(item => {
          if (item.isEnabled) {
            items.push({
              itemId: item.id,
              status: ItemStatus.NOT_CHECKED
            });
          }
        });
      }
    });

    setRevisionItems(items);

    // Create draft revision
    if (selectedCustomer) {
      const revision = addRevision({
        customerId: selectedCustomer.id,
        vehicleId: vehicle.id,
        date: new Date(),
        mileage: vehicle.mileage || 0,
        status: 'draft',
        checklistItems: items
      });
      setCurrentRevisionId(revision.id);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Reset vehicle when customer changes
    setSelectedVehicle(null);
    setRevisionItems([]);
    setCurrentRevisionId(null);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<RevisionChecklistItem>) => {
    setRevisionItems(prev => {
      const existingIndex = prev.findIndex(item => item.itemId === itemId);
      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex] = { ...newItems[existingIndex], ...updates };
        return newItems;
      } else {
        return [...prev, { itemId, status: ItemStatus.NOT_CHECKED, ...updates }];
      }
    });

    // Auto-save to revision
    if (currentRevisionId) {
      const existingIndex = revisionItems.findIndex(item => item.itemId === itemId);
      const updatedItems = existingIndex >= 0
        ? revisionItems.map((item, idx) => idx === existingIndex ? { ...item, ...updates } : item)
        : [...revisionItems, { itemId, status: ItemStatus.NOT_CHECKED, ...updates }];

      updateRevision(currentRevisionId, {
        checklistItems: updatedItems,
        updatedAt: new Date()
      });
    }
  };

  const handleSave = (status: 'draft' | 'in_progress' | 'completed') => {
    if (!currentRevisionId) {
      alert('Nenhuma revisão em andamento');
      return;
    }

    updateRevision(currentRevisionId, {
      mileage,
      generalNotes,
      recommendations,
      status,
      checklistItems: revisionItems,
      updatedAt: new Date(),
      ...(status === 'completed' && { completedAt: new Date() })
    });

    alert(
      status === 'completed'
        ? 'Revisão finalizada com sucesso!'
        : 'Revisão salva com sucesso!'
    );

    if (status === 'completed') {
      // Reset form
      setSelectedCustomer(null);
      setSelectedVehicle(null);
      setMileage(0);
      setGeneralNotes('');
      setRecommendations('');
      setRevisionItems([]);
      setCurrentRevisionId(null);
    }
  };

  const getProgress = () => {
    const total = revisionItems.length;
    const checked = revisionItems.filter(item => item.status !== ItemStatus.NOT_CHECKED).length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { checked, total, percentage };
  };

  const progress = getProgress();
  const canStartRevision = selectedCustomer && selectedVehicle;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nova Revisão</h2>
          <p className="text-gray-600">Preencha o checklist de revisão veicular</p>
        </div>
        <ChecklistManager />
      </div>

      {/* Progress Alert */}
      {canStartRevision && progress.total > 0 && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Progresso da revisão: {progress.checked} de {progress.total} itens verificados
                ({progress.percentage}%)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave('draft')}
                >
                  Salvar Rascunho
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave('in_progress')}
                >
                  Salvar em Andamento
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave('completed')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={progress.percentage < 100}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Finalizar Revisão
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Customer and Vehicle Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomerSelector
          selectedCustomer={selectedCustomer}
          onSelectCustomer={handleSelectCustomer}
        />
        <VehicleSelector
          customerId={selectedCustomer?.id || null}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={handleSelectVehicle}
        />
      </div>

      {/* Mileage and Notes */}
      {canStartRevision && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Revisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mileage">Quilometragem Atual</Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(parseInt(e.target.value) || 0)}
                placeholder="0"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generalNotes">Observações Gerais</Label>
              <Textarea
                id="generalNotes"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Adicione observações gerais sobre a revisão..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendations">Recomendações</Label>
              <Textarea
                id="recommendations"
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Adicione recomendações para o cliente..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      {canStartRevision ? (
        <RevisionChecklist
          revisionItems={revisionItems}
          onUpdateItem={handleUpdateItem}
        />
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione um cliente e um veículo para iniciar o checklist de revisão.
          </AlertDescription>
        </Alert>
      )}

      {/* Bottom Actions */}
      {canStartRevision && progress.total > 0 && (
        <div className="flex justify-end gap-3 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
          >
            Salvar Rascunho
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('in_progress')}
          >
            Salvar em Andamento
          </Button>
          <Button
            onClick={() => handleSave('completed')}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={progress.percentage < 100}
          >
            <Save className="h-4 w-4 mr-2" />
            Finalizar Revisão
          </Button>
        </div>
      )}
    </div>
  );
}
