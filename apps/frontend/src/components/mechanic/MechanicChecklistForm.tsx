import React, { useState } from 'react';
import { toast } from 'sonner';
import { adminService } from '@/api/adminService';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface MechanicChecklistFormProps {
  revisionId: string;
  onUpdate: () => void;
}

const CHECKLIST_ITEMS = [
  { id: 'oil', label: 'Troca de óleo e filtro' },
  { id: 'brakes', label: 'Verificação dos freios' },
  { id: 'tires', label: 'Inspeção e calibragem dos pneus' },
  { id: 'fluids', label: 'Verificação de fluidos (freio, arrefecimento, direção)' },
  { id: 'battery', label: 'Teste da bateria' },
  { id: 'lights', label: 'Verificação de luzes e faróis' },
  { id: 'filters', label: 'Substituição de filtros (ar, cabine, combustível)' },
  { id: 'belts', label: 'Inspeção de correias e mangueiras' },
  { id: 'suspension', label: 'Verificação da suspensão' },
  { id: 'alignment', label: 'Alinhamento e balanceamento' },
];

export default function MechanicChecklistForm({
  revisionId,
  onUpdate,
}: MechanicChecklistFormProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (itemId: string, isChecked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: isChecked,
    }));
  };

  const handleSaveProgress = async () => {
    try {
      setLoading(true);

      const completedItems = Object.entries(checkedItems)
        .filter(([, isChecked]) => isChecked)
        .map(([id]) => CHECKLIST_ITEMS.find((item) => item.id === id)?.label || id);

      const mechanicNotes = `
CHECKLIST DE REVISÃO:
${completedItems.map((item) => `✓ ${item}`).join('\n')}

OBSERVAÇÕES DO MECÂNICO:
${notes || 'Nenhuma observação adicional.'}
      `.trim();

      // Atualizar a revisão com as anotações
      await adminService.updateRevision(revisionId, {
        mechanicNotes,
      });

      toast.success('Progresso salvo com sucesso');

      onUpdate();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Erro ao salvar progresso', {
        description: err.response?.data?.message || 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div>
      <div className="space-y-4">
        <div>
          <p className="font-semibold mb-2">Checklist de Revisão</p>
          <p className="text-sm text-gray-600 mb-3">
            Progresso: {completedCount} de {totalCount} itens ({Math.round(progressPercent)}%)
          </p>

          <div className="space-y-2">
            {CHECKLIST_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={checkedItems[item.id] || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(item.id, checked === true)
                  }
                />
                <label
                  htmlFor={item.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <p className="font-semibold mb-2">Observações Adicionais</p>
          <Textarea
            placeholder="Adicione observações sobre a revisão, peças trocadas, problemas encontrados, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="resize-y"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveProgress}
            disabled={loading || (completedCount === 0 && !notes)}
          >
            {loading ? 'Salvando...' : 'Salvar Progresso'}
          </Button>
        </div>
      </div>
    </div>
  );
}
