import { useState, useEffect } from 'react';
import {
  Calendar,
  Car,
  User,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  UserCog,
  Edit,
  Trash2,
  Play,
  Circle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import adminService, { AdminRevision } from '../../api/adminService';
import revisionService from '../../api/revisionService';
import { RevisionDetailsModal } from './RevisionDetailsModal';
import { MechanicAssignmentModal } from './MechanicAssignmentModal';
import { RevisionEditModal } from './RevisionEditModal';

export function RevisionsListContent() {
  const [revisions, setRevisions] = useState<AdminRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [mechanicFilter, setMechanicFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [selectedRevision, setSelectedRevision] = useState<AdminRevision | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mechanicModalOpen, setMechanicModalOpen] = useState(false);
  const [mechanicModalRevisionId, setMechanicModalRevisionId] = useState<string | null>(null);
  const [mechanicModalCurrentMechanicId, setMechanicModalCurrentMechanicId] = useState<
    string | null
  >(null);
  const [mechanicModalCurrentMechanicName, setMechanicModalCurrentMechanicName] = useState<
    string | null
  >(null);

  useEffect(() => {
    loadRevisions();
  }, [page, statusFilter, mechanicFilter]);

  const loadRevisions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await adminService.getRevisions(params);
      setRevisions(response.data);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Error loading revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (revision: AdminRevision) => {
    setSelectedRevision(revision);
    setDetailsModalOpen(true);
  };

  const handleAssignMechanic = (revision: AdminRevision) => {
    setMechanicModalRevisionId(revision.id);
    setMechanicModalCurrentMechanicId(revision.assignedMechanicId);
    setMechanicModalCurrentMechanicName(revision.mechanicName);
    setMechanicModalOpen(true);
  };

  const handleEditRevision = (revision: AdminRevision) => {
    setSelectedRevision(revision);
    setEditModalOpen(true);
  };

  const handleChangeStatus = async (revisionId: string, newStatus: string) => {
    try {
      if (newStatus === 'IN_PROGRESS') {
        await revisionService.startRevision(revisionId);
      } else if (newStatus === 'COMPLETED') {
        await revisionService.completeRevision(revisionId);
      } else if (newStatus === 'CANCELLED') {
        await revisionService.cancelRevision(revisionId);
      }
      loadRevisions();
    } catch (error) {
      console.error('Error changing status:', error);
      alert('Erro ao mudar status. Tente novamente.');
    }
  };

  const handleDeleteRevision = async (revisionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta revisão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await revisionService.deleteRevision(revisionId);
      loadRevisions();
    } catch (error) {
      console.error('Error deleting revision:', error);
      alert('Erro ao excluir revisão. Tente novamente.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Rascunho', icon: Circle },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'Em Andamento', icon: Clock },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Concluída', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelada', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredRevisions = revisions.filter((revision) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      revision.customer?.name.toLowerCase().includes(search) ||
      revision.vehicle?.plate.toLowerCase().includes(search) ||
      revision.vehicle?.model.toLowerCase().includes(search) ||
      revision.vehicle?.brand.toLowerCase().includes(search) ||
      revision.mechanicName?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moria-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando revisões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar por cliente, veículo, placa ou mecânico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-moria-orange"
              >
                <option value="">Todos os status</option>
                <option value="DRAFT">Rascunho</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="COMPLETED">Concluída</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revisions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Revisões ({filteredRevisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRevisions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhuma revisão encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRevisions.map((revision) => (
                <Card key={revision.id} className="hover:border-moria-orange transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Main Info */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Customer */}
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {revision.customer?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {revision.customer?.phone || ''}
                            </p>
                          </div>
                        </div>

                        {/* Vehicle */}
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {revision.vehicle?.brand} {revision.vehicle?.model}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {revision.vehicle?.plate || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Mechanic */}
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            {revision.mechanicName ? (
                              <>
                                <p className="text-sm font-medium truncate">
                                  {revision.mechanicName}
                                </p>
                                <p className="text-xs text-gray-500">Mecânico</p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500">Não atribuído</p>
                            )}
                          </div>
                        </div>

                        {/* Date & Status */}
                        <div className="flex items-center gap-3 justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {formatDate(revision.date)}
                            </span>
                          </div>
                          {getStatusBadge(revision.status)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* View Details */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(revision)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Assign Mechanic */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAssignMechanic(revision)}
                          title={revision.assignedMechanicId ? 'Trocar mecânico' : 'Atribuir mecânico'}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>

                        {/* Edit/Continue (DRAFT or IN_PROGRESS) */}
                        {(revision.status === 'DRAFT' || revision.status === 'IN_PROGRESS') && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditRevision(revision)}
                            title={revision.status === 'DRAFT' ? 'Editar rascunho' : 'Continuar revisão'}
                            className="text-blue-600 hover:text-blue-700 hover:border-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Start (only DRAFT) */}
                        {revision.status === 'DRAFT' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleChangeStatus(revision.id, 'IN_PROGRESS')}
                            title="Iniciar revisão"
                            className="text-blue-600 hover:text-blue-700 hover:border-blue-600"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Complete (only IN_PROGRESS) */}
                        {revision.status === 'IN_PROGRESS' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleChangeStatus(revision.id, 'COMPLETED')}
                            title="Concluir revisão"
                            className="text-green-600 hover:text-green-700 hover:border-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Cancel (DRAFT or IN_PROGRESS) */}
                        {(revision.status === 'DRAFT' || revision.status === 'IN_PROGRESS') && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleChangeStatus(revision.id, 'CANCELLED')}
                            title="Cancelar revisão"
                            className="text-orange-600 hover:text-orange-700 hover:border-orange-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteRevision(revision.id)}
                          title="Excluir revisão"
                          className="text-red-600 hover:text-red-700 hover:border-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <RevisionDetailsModal
        revision={selectedRevision}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedRevision(null);
        }}
        onAssignMechanic={(revisionId) => {
          const revision = revisions.find((r) => r.id === revisionId);
          if (revision) {
            handleAssignMechanic(revision);
          }
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
          loadRevisions();
          setEditModalOpen(false);
          setSelectedRevision(null);
        }}
      />

      <MechanicAssignmentModal
        isOpen={mechanicModalOpen}
        onClose={() => {
          setMechanicModalOpen(false);
          setMechanicModalRevisionId(null);
          setMechanicModalCurrentMechanicId(null);
          setMechanicModalCurrentMechanicName(null);
        }}
        revisionId={mechanicModalRevisionId}
        currentMechanicId={mechanicModalCurrentMechanicId}
        currentMechanicName={mechanicModalCurrentMechanicName}
        onSuccess={() => {
          loadRevisions();
        }}
      />
    </div>
  );
}
