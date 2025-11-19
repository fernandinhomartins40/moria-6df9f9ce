import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Collapse,
  Divider,
  useToast,
  IconButton,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  TimeIcon,
  PhoneIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { adminService } from '@api/adminService';
import MechanicChecklistForm from './MechanicChecklistForm';

interface Revision {
  id: string;
  orderId: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleYear: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedCompletionDate: string;
  scheduledDate: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  mechanicNotes?: string;
  customer: {
    name: string;
    whatsapp: string;
  };
}

interface MechanicRevisionCardProps {
  revision: Revision;
  onUpdate: () => void;
  isCompleted?: boolean;
}

const PRIORITY_COLORS = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
};

const PRIORITY_LABELS = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export default function MechanicRevisionCard({
  revision,
  onUpdate,
  isCompleted = false,
}: MechanicRevisionCardProps) {
  const { isOpen, onToggle } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleStartRevision = async () => {
    try {
      setLoading(true);
      await adminService.startRevision(revision.id);

      toast({
        title: 'Revisão iniciada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Erro ao iniciar revisão',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRevision = async () => {
    if (!window.confirm('Tem certeza que deseja marcar esta revisão como concluída?')) {
      return;
    }

    try {
      setLoading(true);
      await adminService.completeRevision(revision.id);

      toast({
        title: 'Revisão concluída',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Erro ao concluir revisão',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openWhatsApp = () => {
    const phone = revision.customer.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}`, '_blank');
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg={isCompleted ? 'gray.50' : 'white'}
      borderColor={isCompleted ? 'gray.300' : 'gray.200'}
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <HStack>
              <Text fontWeight="bold" fontSize="lg">
                {revision.vehicleModel}
              </Text>
              <Badge colorScheme={PRIORITY_COLORS[revision.priority]}>
                {PRIORITY_LABELS[revision.priority]}
              </Badge>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              Placa: {revision.vehiclePlate} • Ano: {revision.vehicleYear}
            </Text>
          </VStack>

          <IconButton
            aria-label="Expandir detalhes"
            icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="sm"
            variant="ghost"
            onClick={onToggle}
          />
        </HStack>

        {/* Customer Info */}
        <HStack spacing={4}>
          <HStack>
            <InfoIcon color="blue.500" />
            <Text fontSize="sm">
              <strong>Cliente:</strong> {revision.customer.name}
            </Text>
          </HStack>
          <Tooltip label="Abrir WhatsApp">
            <Button
              size="sm"
              leftIcon={<PhoneIcon />}
              colorScheme="green"
              variant="outline"
              onClick={openWhatsApp}
            >
              Contato
            </Button>
          </Tooltip>
        </HStack>

        {/* Dates */}
        <HStack spacing={4} fontSize="sm" color="gray.600">
          <HStack>
            <TimeIcon />
            <Text>
              <strong>Agendado:</strong> {formatDate(revision.scheduledDate)}
            </Text>
          </HStack>
          {revision.startedAt && (
            <Text>
              <strong>Iniciado:</strong> {formatDate(revision.startedAt)}
            </Text>
          )}
          {revision.completedAt && (
            <Text>
              <strong>Concluído:</strong> {formatDate(revision.completedAt)}
            </Text>
          )}
        </HStack>

        {/* Action Buttons */}
        {!isCompleted && (
          <HStack spacing={2}>
            {revision.status === 'PENDING' && (
              <Button
                colorScheme="blue"
                size="sm"
                onClick={handleStartRevision}
                isLoading={loading}
              >
                Iniciar Revisão
              </Button>
            )}
            {revision.status === 'IN_PROGRESS' && (
              <Button
                colorScheme="green"
                size="sm"
                leftIcon={<CheckCircleIcon />}
                onClick={handleCompleteRevision}
                isLoading={loading}
              >
                Marcar como Concluída
              </Button>
            )}
          </HStack>
        )}

        {/* Collapsible Details */}
        <Collapse in={isOpen} animateOpacity>
          <VStack align="stretch" spacing={3} pt={3}>
            <Divider />

            {/* Notes */}
            {revision.notes && (
              <Box>
                <Text fontWeight="semibold" fontSize="sm" mb={1}>
                  Observações do Cliente:
                </Text>
                <Text fontSize="sm" color="gray.700" bg="gray.50" p={3} borderRadius="md">
                  {revision.notes}
                </Text>
              </Box>
            )}

            {revision.mechanicNotes && (
              <Box>
                <Text fontWeight="semibold" fontSize="sm" mb={1}>
                  Suas Anotações:
                </Text>
                <Text fontSize="sm" color="gray.700" bg="blue.50" p={3} borderRadius="md">
                  {revision.mechanicNotes}
                </Text>
              </Box>
            )}

            {/* Checklist Form (only for in-progress revisions) */}
            {revision.status === 'IN_PROGRESS' && !isCompleted && (
              <>
                <Divider />
                <MechanicChecklistForm revisionId={revision.id} onUpdate={onUpdate} />
              </>
            )}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
}
