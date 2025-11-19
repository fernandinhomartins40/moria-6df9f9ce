import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
} from '@chakra-ui/react';
import { useAuth } from '@hooks/useAuth';
import { adminService } from '@api/adminService';
import MechanicRevisionCard from './MechanicRevisionCard';
import { CheckCircleIcon, ClockIcon, WarningIcon } from '@chakra-ui/icons';

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
  assignedMechanic?: {
    id: string;
    name: string;
  };
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

const STATUS_COLORS = {
  PENDING: 'yellow',
  IN_PROGRESS: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const STATUS_LABELS = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export default function MechanicPanel() {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completedToday: 0,
    total: 0,
  });

  const { admin } = useAuth();
  const toast = useToast();

  const fetchMyRevisions = async () => {
    try {
      setLoading(true);

      // O backend já filtra automaticamente por mechanicId para STAFF
      const response = await adminService.getRevisions({
        page: 1,
        limit: 100,
      });

      const myRevisions = response.data.revisions;
      setRevisions(myRevisions);

      // Calcular estatísticas
      const pending = myRevisions.filter((r: Revision) => r.status === 'PENDING').length;
      const inProgress = myRevisions.filter((r: Revision) => r.status === 'IN_PROGRESS').length;
      const today = new Date().toDateString();
      const completedToday = myRevisions.filter(
        (r: Revision) =>
          r.status === 'COMPLETED' &&
          r.completedAt &&
          new Date(r.completedAt).toDateString() === today
      ).length;

      setStats({
        pending,
        inProgress,
        completedToday,
        total: myRevisions.length,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar revisões',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRevisions();
  }, []);

  const handleRevisionUpdate = () => {
    fetchMyRevisions();
  };

  const pendingRevisions = revisions.filter((r) => r.status === 'PENDING');
  const inProgressRevisions = revisions.filter((r) => r.status === 'IN_PROGRESS');
  const completedRevisions = revisions.filter((r) => r.status === 'COMPLETED');

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>
              Painel do Mecânico
            </Heading>
            <Text color="gray.600">
              Olá, {admin?.name || 'Mecânico'}! Aqui estão suas revisões atribuídas.
            </Text>
          </Box>

          {/* Statistics Cards */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <StatLabel display="flex" alignItems="center">
                <WarningIcon mr={2} color="yellow.500" />
                Pendentes
              </StatLabel>
              <StatNumber fontSize="3xl">{stats.pending}</StatNumber>
              <StatHelpText>Aguardando início</StatHelpText>
            </Stat>

            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <StatLabel display="flex" alignItems="center">
                <ClockIcon mr={2} color="blue.500" />
                Em Andamento
              </StatLabel>
              <StatNumber fontSize="3xl">{stats.inProgress}</StatNumber>
              <StatHelpText>Trabalhos ativos</StatHelpText>
            </Stat>

            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <StatLabel display="flex" alignItems="center">
                <CheckCircleIcon mr={2} color="green.500" />
                Concluídas Hoje
              </StatLabel>
              <StatNumber fontSize="3xl">{stats.completedToday}</StatNumber>
              <StatHelpText>Trabalhos finalizados</StatHelpText>
            </Stat>

            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <StatLabel>Total de Revisões</StatLabel>
              <StatNumber fontSize="3xl">{stats.total}</StatNumber>
              <StatHelpText>Todas as atribuídas</StatHelpText>
            </Stat>
          </SimpleGrid>

          {/* Tabs with Revisions */}
          <Box bg="white" borderRadius="lg" borderWidth="1px" p={6}>
            <Tabs colorScheme="blue">
              <TabList>
                <Tab>
                  Pendentes
                  <Badge ml={2} colorScheme="yellow">
                    {stats.pending}
                  </Badge>
                </Tab>
                <Tab>
                  Em Andamento
                  <Badge ml={2} colorScheme="blue">
                    {stats.inProgress}
                  </Badge>
                </Tab>
                <Tab>
                  Concluídas
                  <Badge ml={2} colorScheme="green">
                    {completedRevisions.length}
                  </Badge>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Pendentes */}
                <TabPanel>
                  {pendingRevisions.length === 0 ? (
                    <Box textAlign="center" py={10}>
                      <Text color="gray.500">Nenhuma revisão pendente.</Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {pendingRevisions.map((revision) => (
                        <MechanicRevisionCard
                          key={revision.id}
                          revision={revision}
                          onUpdate={handleRevisionUpdate}
                        />
                      ))}
                    </VStack>
                  )}
                </TabPanel>

                {/* Em Andamento */}
                <TabPanel>
                  {inProgressRevisions.length === 0 ? (
                    <Box textAlign="center" py={10}>
                      <Text color="gray.500">Nenhuma revisão em andamento.</Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {inProgressRevisions.map((revision) => (
                        <MechanicRevisionCard
                          key={revision.id}
                          revision={revision}
                          onUpdate={handleRevisionUpdate}
                        />
                      ))}
                    </VStack>
                  )}
                </TabPanel>

                {/* Concluídas */}
                <TabPanel>
                  {completedRevisions.length === 0 ? (
                    <Box textAlign="center" py={10}>
                      <Text color="gray.500">Nenhuma revisão concluída ainda.</Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {completedRevisions.map((revision) => (
                        <MechanicRevisionCard
                          key={revision.id}
                          revision={revision}
                          onUpdate={handleRevisionUpdate}
                          isCompleted
                        />
                      ))}
                    </VStack>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          {/* Refresh Button */}
          <HStack justify="center">
            <Button onClick={fetchMyRevisions} isLoading={loading}>
              Atualizar Lista
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
