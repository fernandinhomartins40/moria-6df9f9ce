import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import adminService, { AdminRevision } from '@/api/adminService';
import revisionService from '@/api/revisionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevisionCard } from '@/components/revisions/RevisionCard';
import { RevisionEditModal } from '@/components/admin/RevisionEditModal';
import { RevisionDetailsModal } from '@/components/admin/RevisionDetailsModal';

export default function MechanicRevisionsView() {
  const [revisions, setRevisions] = useState<AdminRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completedToday: 0,
    total: 0,
  });

  // Modals
  const [selectedRevision, setSelectedRevision] = useState<AdminRevision | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchMyRevisions = async () => {
    try {
      setLoading(true);

      // O backend já filtra automaticamente por mechanicId para STAFF
      const response = await adminService.getRevisions({
        page: 1,
        limit: 100,
      });

      const myRevisions = response.data || [];
      setRevisions(myRevisions);

      // Calcular estatísticas
      const pending = myRevisions.filter((r: AdminRevision) => r.status === 'DRAFT').length;
      const inProgress = myRevisions.filter((r: AdminRevision) => r.status === 'IN_PROGRESS').length;
      const today = new Date().toDateString();
      const completedToday = myRevisions.filter(
        (r: AdminRevision) =>
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
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRevisions();
  }, []);

  const handleViewDetails = (revision: AdminRevision) => {
    setSelectedRevision(revision);
    setDetailsModalOpen(true);
  };

  const handleEditRevision = (revision: AdminRevision) => {
    setSelectedRevision(revision);
    setEditModalOpen(true);
  };

  const handleChangeStatus = async (revisionId: string, newStatus: string) => {
    try {
      if (newStatus === 'IN_PROGRESS') {
        await revisionService.startRevision(revisionId);
        toast.success('Revisão iniciada');
      } else if (newStatus === 'COMPLETED') {
        await revisionService.completeRevision(revisionId);
        toast.success('Revisão concluída');
      } else if (newStatus === 'CANCELLED') {
        await revisionService.cancelRevision(revisionId);
        toast.success('Revisão cancelada');
      }
      fetchMyRevisions();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Erro ao alterar status', {
        description: err.response?.data?.message || 'Erro desconhecido',
      });
    }
  };

  const pendingRevisions = revisions.filter((r) => r.status === 'DRAFT');
  const inProgressRevisions = revisions.filter((r) => r.status === 'IN_PROGRESS');
  const completedRevisions = revisions.filter((r) => r.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma revisão pendente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRevisions.map((revision) => (
                    <RevisionCard
                      key={revision.id}
                      revision={revision}
                      onViewDetails={handleViewDetails}
                      onEditRevision={handleEditRevision}
                      onChangeStatus={handleChangeStatus}
                      showAssignMechanic={false}
                      showDelete={false}
                      showMechanicInfo={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Em Andamento */}
            <TabsContent value="in-progress" className="mt-6">
              {inProgressRevisions.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma revisão em andamento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inProgressRevisions.map((revision) => (
                    <RevisionCard
                      key={revision.id}
                      revision={revision}
                      onViewDetails={handleViewDetails}
                      onEditRevision={handleEditRevision}
                      onChangeStatus={handleChangeStatus}
                      showAssignMechanic={false}
                      showDelete={false}
                      showMechanicInfo={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Concluídas */}
            <TabsContent value="completed" className="mt-6">
              {completedRevisions.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma revisão concluída ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedRevisions.map((revision) => (
                    <RevisionCard
                      key={revision.id}
                      revision={revision}
                      onViewDetails={handleViewDetails}
                      showAssignMechanic={false}
                      showDelete={false}
                      showMechanicInfo={false}
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

      {/* Modals */}
      <RevisionDetailsModal
        revision={selectedRevision}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedRevision(null);
        }}
        onChangeStatus={handleChangeStatus}
      />

      <RevisionEditModal
        revision={selectedRevision}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRevision(null);
        }}
        onSuccess={() => {
          fetchMyRevisions();
          setEditModalOpen(false);
          setSelectedRevision(null);
        }}
      />
    </div>
  );
}
