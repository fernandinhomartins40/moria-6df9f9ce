import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Checkbox,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { adminService } from '@api/adminService';

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

  const toast = useToast();

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
        .filter(([_, isChecked]) => isChecked)
        .map(([id, _]) => CHECKLIST_ITEMS.find((item) => item.id === id)?.label || id);

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

      toast({
        title: 'Progresso salvo com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar progresso',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Box>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="semibold" mb={2}>
            Checklist de Revisão
          </Text>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Progresso: {completedCount} de {totalCount} itens ({Math.round(progressPercent)}%)
          </Text>

          <VStack align="stretch" spacing={2}>
            {CHECKLIST_ITEMS.map((item) => (
              <Checkbox
                key={item.id}
                isChecked={checkedItems[item.id] || false}
                onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                colorScheme="green"
              >
                <Text fontSize="sm">{item.label}</Text>
              </Checkbox>
            ))}
          </VStack>
        </Box>

        <Divider />

        <Box>
          <Text fontWeight="semibold" mb={2}>
            Observações Adicionais
          </Text>
          <Textarea
            placeholder="Adicione observações sobre a revisão, peças trocadas, problemas encontrados, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            resize="vertical"
          />
        </Box>

        <HStack justify="flex-end">
          <Button
            colorScheme="blue"
            onClick={handleSaveProgress}
            isLoading={loading}
            isDisabled={completedCount === 0 && !notes}
          >
            Salvar Progresso
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
