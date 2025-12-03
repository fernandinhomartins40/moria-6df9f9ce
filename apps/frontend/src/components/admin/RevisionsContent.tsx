import { useState } from 'react';
import { Save, FileText, AlertCircle, Loader2 } from 'lucide-react';
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
import revisionService from '../../api/revisionService';
import { useToast } from '../../hooks/use-toast';

export function RevisionsContent() {
  const { categories } = useRevisions(); // Only use categories from context
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentRevisionId, setCurrentRevisionId] = useState<string | null>(null);
  const [mileage, setMileage] = useState<number>(0);
  const [generalNotes, setGeneralNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [revisionItems, setRevisionItems] = useState<RevisionChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize checklist items when vehicle is selected
  const handleSelectVehicle = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setMileage(vehicle.mileage || 0);

    console.log('🔍 Debug - Categories:', {
      total: categories.length,
      enabled: categories.filter(c => c.isEnabled).length
    });

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

    console.log('🔍 Debug - Checklist Items:', { total: items.length });

    setRevisionItems(items);

    // Create draft revision via API
    if (selectedCustomer) {
      setIsLoading(true);
      let payload: any = null;
      try {
        // Transform checklist items to backend format
        const checklistItems = items.map(item => {
          const categoryData = categories.find(cat =>
            cat.items.some(catItem => catItem.id === item.itemId)
          );
          const itemData = categoryData?.items.find(catItem => catItem.id === item.itemId);

          const checkItem: any = {
            categoryId: categoryData?.id || '',
            categoryName: categoryData?.name || '',
            itemId: item.itemId,
            itemName: itemData?.name || '',
            status: item.status,
          };

          if (item.notes) checkItem.notes = item.notes;
          if (item.photos && item.photos.length > 0) checkItem.photos = item.photos;

          return checkItem;
        });

        payload = {
          customerId: selectedCustomer.id,
          vehicleId: vehicle.id,
          date: new Date().toISOString(),
          checklistItems,
        };

        if (vehicle.mileage) payload.mileage = vehicle.mileage;

        console.log('📤 Enviando criação de revisão:', {
          customerId: payload.customerId,
          vehicleId: payload.vehicleId,
          checklistItemsCount: payload.checklistItems.length,
          firstItems: payload.checklistItems.slice(0, 3)
        });

        const revision = await revisionService.createRevision(payload);

        console.log('✅ Revisão criada:', {
          id: revision.id,
          status: revision.status,
          checklistItemsReceived: revision.checklistItems?.length || 0
        });

        setCurrentRevisionId(revision.id);

        toast({
          title: 'Revisão criada',
          description: 'Revisão criada com sucesso. Preencha o checklist.',
        });
      } catch (error: any) {
        console.error('❌ Erro ao criar revisão:', error);
        if (payload) {
          console.error('Payload enviado:', payload);
        }
        toast({
          title: 'Erro ao criar revisão',
          description: error.response?.data?.message || 'Erro ao criar revisão. Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Reset vehicle when customer changes
    setSelectedVehicle(null);
    setRevisionItems([]);
    setCurrentRevisionId(null);
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<RevisionChecklistItem>) => {
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

    // Auto-save to revision via API
    if (currentRevisionId) {
      try {
        const existingIndex = revisionItems.findIndex(item => item.itemId === itemId);
        const updatedItems = existingIndex >= 0
          ? revisionItems.map((item, idx) => idx === existingIndex ? { ...item, ...updates } : item)
          : [...revisionItems, { itemId, status: ItemStatus.NOT_CHECKED, ...updates }];

        // Transform to backend format
        const checklistItems = updatedItems.map(item => {
          const categoryData = categories.find(cat =>
            cat.items.some(catItem => catItem.id === item.itemId)
          );
          const itemData = categoryData?.items.find(catItem => catItem.id === item.itemId);

          const checkItem: any = {
            categoryId: categoryData?.id || '',
            categoryName: categoryData?.name || '',
            itemId: item.itemId,
            itemName: itemData?.name || '',
            status: item.status,
          };

          if (item.notes) checkItem.notes = item.notes;
          if (item.photos && item.photos.length > 0) checkItem.photos = item.photos;

          return checkItem;
        });

        await revisionService.updateRevision(currentRevisionId, {
          checklistItems
        });
      } catch (error) {
        console.error('Erro ao auto-salvar item:', error);
        // Silent fail for auto-save
      }
    }
  };

  const handleSave = async (status: 'draft' | 'in_progress' | 'completed') => {
    console.log('💾 handleSave chamado:', {
      status,
      currentRevisionId,
      hasRevisionId: !!currentRevisionId
    });

    if (!currentRevisionId) {
      console.error('❌ Nenhuma revisão em andamento!');
      toast({
        title: 'Erro',
        description: 'Nenhuma revisão em andamento',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Transform checklist items to backend format
      const checklistItems = revisionItems.map(item => {
        const categoryData = categories.find(cat =>
          cat.items.some(catItem => catItem.id === item.itemId)
        );
        const itemData = categoryData?.items.find(catItem => catItem.id === item.itemId);

        const checkItem: any = {
          categoryId: categoryData?.id || '',
          categoryName: categoryData?.name || '',
          itemId: item.itemId,
          itemName: itemData?.name || '',
          status: item.status,
        };

        if (item.notes) checkItem.notes = item.notes;
        if (item.photos && item.photos.length > 0) checkItem.photos = item.photos;

        return checkItem;
      });

      // Map status to backend format
      const backendStatus = status === 'draft' ? 'DRAFT' : status === 'in_progress' ? 'IN_PROGRESS' : 'COMPLETED';

      const updatePayload: any = {
        status: backendStatus,
        checklistItems
      };

      if (mileage) updatePayload.mileage = mileage;
      if (generalNotes) updatePayload.generalNotes = generalNotes;
      if (recommendations) updatePayload.recommendations = recommendations;

      await revisionService.updateRevision(currentRevisionId, updatePayload);

      toast({
        title: status === 'completed' ? 'Revisão finalizada!' : 'Revisão salva!',
        description: status === 'completed'
          ? 'Revisão finalizada com sucesso!'
          : 'Revisão salva com sucesso!',
      });

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
    } catch (error: any) {
      console.error('Erro ao salvar revisão:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.response?.data?.message || 'Erro ao salvar revisão. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
    <div className="space-y-3 sm:space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Nova Revisão</h2>
          <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Preencha o checklist de revisão veicular</p>
        </div>
        <ChecklistManager />
      </div>

      {/* Compact Progress Bar */}
      {canStartRevision && progress.total > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">
                {progress.checked}/{progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="flex-1 sm:flex-none h-8 text-xs px-2 sm:px-3"
              >
                {isSaving ? <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" /> : null}
                <span className="hidden sm:inline">Rascunho</span>
                <span className="sm:hidden">Rasc.</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSave('in_progress')}
                disabled={isSaving}
                className="flex-1 sm:flex-none h-8 text-xs px-2 sm:px-3"
              >
                {isSaving ? <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" /> : null}
                <span className="hidden sm:inline">Em Andamento</span>
                <span className="sm:hidden">Andam.</span>
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave('completed')}
                className="flex-1 sm:flex-none h-8 text-xs px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white"
                disabled={progress.percentage < 100 || isSaving}
              >
                {isSaving ? <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" /> : <Save className="h-3 w-3 sm:mr-1" />}
                <span className="hidden sm:inline">Finalizar</span>
                <span className="sm:hidden">Fim</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Customer and Vehicle Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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

      {/* Compact Info Section */}
      {canStartRevision && (
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">Informações da Revisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mileage" className="text-xs sm:text-sm">Quilometragem</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min={0}
                  className="h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="generalNotes" className="text-xs sm:text-sm">Observações Gerais</Label>
                <Textarea
                  id="generalNotes"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Observações..."
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recommendations" className="text-xs sm:text-sm">Recomendações</Label>
              <Textarea
                id="recommendations"
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Recomendações para o cliente..."
                rows={2}
                className="text-sm resize-none"
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

      {/* Compact Bottom Actions */}
      {canStartRevision && progress.total > 0 && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 sticky bottom-2 sm:bottom-4 bg-white px-3 py-2 sm:p-3 rounded-lg shadow-lg border">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="h-9 text-sm"
          >
            {isSaving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" /> : null}
            <span className="hidden sm:inline">Salvar Rascunho</span>
            <span className="sm:hidden">Rascunho</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('in_progress')}
            disabled={isSaving}
            className="h-9 text-sm"
          >
            {isSaving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" /> : null}
            <span className="hidden sm:inline">Salvar em Andamento</span>
            <span className="sm:hidden">Em Andamento</span>
          </Button>
          <Button
            onClick={() => handleSave('completed')}
            className="h-9 text-sm bg-green-600 hover:bg-green-700 text-white"
            disabled={progress.percentage < 100 || isSaving}
          >
            {isSaving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" /> : <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />}
            Finalizar Revisão
          </Button>
        </div>
      )}
    </div>
  );
}
