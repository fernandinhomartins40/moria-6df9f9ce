import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import adminService from '@/api/adminService';
import MechanicRevisionCard from './MechanicRevisionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Erro ao carregar revisões', {
        description: err.response?.data?.message || 'Erro desconhecido',
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Painel do Mecânico</h1>
            <p className="text-gray-600">
              Olá, {admin?.name || 'Mecânico'}! Aqui estão suas revisões atribuídas.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pending}</div>
                <p className="text-xs text-gray-600">Aguardando início</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-gray-600">Trabalhos ativos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas Hoje</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.completedToday}</div>
                <p className="text-xs text-gray-600">Trabalhos finalizados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Revisões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-600">Todas as atribuídas</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs with Revisions */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">
                    Pendentes
                    <Badge variant="secondary" className="ml-2">
                      {stats.pending}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="in-progress">
                    Em Andamento
                    <Badge variant="secondary" className="ml-2">
                      {stats.inProgress}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Concluídas
                    <Badge variant="secondary" className="ml-2">
                      {completedRevisions.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Pendentes */}
                <TabsContent value="pending" className="mt-6">
                  {pendingRevisions.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">Nenhuma revisão pendente.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRevisions.map((revision) => (
                        <MechanicRevisionCard
                          key={revision.id}
                          revision={revision}
                          onUpdate={handleRevisionUpdate}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Em Andamento */}
                <TabsContent value="in-progress" className="mt-6">
                  {inProgressRevisions.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">Nenhuma revisão em andamento.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inProgressRevisions.map((revision) => (
                        <MechanicRevisionCard
                          key={revision.id}
                          revision={revision}
                          onUpdate={handleRevisionUpdate}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Concluídas */}
                <TabsContent value="completed" className="mt-6">
                  {completedRevisions.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">Nenhuma revisão concluída ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedRevisions.map((revision) => (
                        <MechanicRevisionCard
                          key={revision.id}
                          revision={revision}
                          onUpdate={handleRevisionUpdate}
                          isCompleted
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button onClick={fetchMyRevisions} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Lista'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
