import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RevisionChecklist } from '../revisions/RevisionChecklist';
import { useRevisions } from '../../contexts/RevisionsContext';
import { RevisionChecklistItem, ItemStatus } from '../../types/revisions';
import { AdminRevision } from '../../api/adminService';
import revisionService from '../../api/revisionService';
import { useToast } from '../../hooks/use-toast';

interface RevisionEditModalProps {
  revision: AdminRevision | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RevisionEditModal({
  revision,
  isOpen,
  onClose,
  onSuccess,
}: RevisionEditModalProps) {
  const { categories } = useRevisions();
  const { toast } = useToast();
  const [mileage, setMileage] = useState<number>(0);
  const [generalNotes, setGeneralNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [revisionItems, setRevisionItems] = useState<RevisionChecklistItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && revision) {
      loadRevisionData();
    }
  }, [isOpen, revision]);

  const loadRevisionData = async () => {
    if (!revision) return;

    setIsLoading(true);
    try {
      // Load full revision details
      const fullRevision = await revisionService.getRevisionById(revision.id);
      console.log('Full revision from API:', fullRevision);
      console.log('Type of checklistItems:', typeof fullRevision.checklistItems);
      console.log('Backend checklistItems:', fullRevision.checklistItems);

      setMileage(fullRevision.mileage || 0);
      setGeneralNotes(fullRevision.generalNotes || '');
      setRecommendations(fullRevision.recommendations || '');

      // Convert backend checklist to frontend format
      // Handle both array and object formats
      let checklistArray = fullRevision.checklistItems;

      // If checklistItems is an object, try to extract the array
      if (checklistArray && typeof checklistArray === 'object' && !Array.isArray(checklistArray)) {
        console.log('checklistItems is object, attempting to extract array');
        // Try common patterns for nested data
        if ('data' in checklistArray) {
          checklistArray = checklistArray.data;
        } else if ('items' in checklistArray) {
          checklistArray = checklistArray.items;
        }
      }

      const items: RevisionChecklistItem[] = Array.isArray(checklistArray)
        ? checklistArray.map((item: any) => {
            console.log('Processing item:', item.itemId, item.status);
            return {
              itemId: item.itemId,
              status: item.status as ItemStatus,
              notes: item.notes,
              photos: item.photos || [],
              checkedAt: item.checkedAt,
              checkedBy: item.checkedBy,
            };
          })
        : [];

      console.log('Converted items count:', items.length);
      console.log('Converted items:', items);
      setRevisionItems(items);
    } catch (error) {
      console.error('Error loading revision:', error);
      toast({
        title: 'Erro ao carregar revisão',
        description: 'Não foi possível carregar os dados da revisão',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = (itemId: string, updates: Partial<RevisionChecklistItem>) => {
    setRevisionItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.itemId === itemId);
      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex] = { ...newItems[existingIndex], ...updates };
        return newItems;
      } else {
        return [...prev, { itemId, status: ItemStatus.NOT_CHECKED, ...updates }];
      }
    });
  };

  const handleSave = async (status?: 'draft' | 'in_progress' | 'completed') => {
    if (!revision) return;

    setIsSaving(true);
    try {
      // Transform checklist items to backend format
      const checklistItems = revisionItems.map((item) => {
        const categoryData = categories.find((cat) =>
          cat.items.some((catItem) => catItem.id === item.itemId)
        );
        const itemData = categoryData?.items.find((catItem) => catItem.id === item.itemId);

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
      let backendStatus = revision.status;
      if (status) {
        backendStatus = status === 'draft' ? 'DRAFT' : status === 'in_progress' ? 'IN_PROGRESS' : 'COMPLETED';
      }

      const updatePayload: any = {
        status: backendStatus,
        checklistItems,
      };

      if (mileage) updatePayload.mileage = mileage;
      if (generalNotes) updatePayload.generalNotes = generalNotes;
      if (recommendations) updatePayload.recommendations = recommendations;

      await revisionService.updateRevision(revision.id, updatePayload);

      toast({
        title: 'Revisão atualizada!',
        description: 'As alterações foram salvas com sucesso.',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error saving revision:', error);
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
    const checked = revisionItems.filter((item) => item.status !== ItemStatus.NOT_CHECKED).length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { checked, total, percentage };
  };

  const progress = getProgress();

  if (!isOpen || !revision) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {revision.status === 'DRAFT' ? 'Editar Rascunho' : 'Continuar Revisão'}
            </h2>
            <p className="text-gray-600 mt-1">
              {revision.customer?.name} - {revision.vehicle?.brand} {revision.vehicle?.model} ({revision.vehicle?.plate})
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        {progress.total > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Progresso: {progress.checked} de {progress.total} itens verificados ({progress.percentage}%)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave('draft')}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Salvar Rascunho
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave('in_progress')}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Salvar em Andamento
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave('completed')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={progress.percentage < 100 || isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Finalizar Revisão
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moria-orange mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando revisão...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mileage and Notes */}
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

              {/* Checklist */}
              <RevisionChecklist revisionItems={revisionItems} onUpdateItem={handleUpdateItem} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving || isLoading}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Salvar Rascunho
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('in_progress')}
            disabled={isSaving || isLoading}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Salvar em Andamento
          </Button>
          <Button
            onClick={() => handleSave('completed')}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={progress.percentage < 100 || isSaving || isLoading}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Finalizar Revisão
          </Button>
        </div>
      </div>
    </div>
  );
}
