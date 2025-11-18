import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  X,
  User,
  Car,
  Calendar,
  Gauge,
  FileText,
  UserCog,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Circle,
  Edit,
  Printer,
} from 'lucide-react';
import { AdminRevision } from '../../api/adminService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RevisionDetailsModalProps {
  revision: AdminRevision | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignMechanic?: (revisionId: string) => void;
  onEdit?: (revisionId: string) => void;
  onChangeStatus?: (revisionId: string, status: string) => void;
}

// Debug de dados da revisão
const logRevisionData = (revision: AdminRevision | null, isOpen: boolean) => {
  if (revision && isOpen) {
    console.log('📋 Revision Data:', {
      id: revision.id,
      status: revision.status,
      checklistItems: revision.checklistItems,
      checklistLength: Array.isArray(revision.checklistItems) ? revision.checklistItems.length : 0,
      checklistType: typeof revision.checklistItems,
      assignedMechanic: revision.assignedMechanic,
      mechanicName: revision.mechanicName,
      customer: revision.customer,
      vehicle: revision.vehicle,
    });
  }
};

const statusConfig = {
  DRAFT: {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-800',
    icon: Circle,
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  COMPLETED: {
    label: 'Concluída',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

const checklistStatusConfig = {
  NOT_CHECKED: {
    label: 'Não Verificado',
    color: 'bg-gray-100 text-gray-600',
    icon: Circle,
  },
  OK: {
    label: 'OK',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
  },
  ATTENTION: {
    label: 'Atenção',
    color: 'bg-yellow-100 text-yellow-700',
    icon: AlertCircle,
  },
  CRITICAL: {
    label: 'Crítico',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  NOT_APPLICABLE: {
    label: 'Não Aplicável',
    color: 'bg-gray-100 text-gray-500',
    icon: Circle,
  },
};

export function RevisionDetailsModal({
  revision,
  isOpen,
  onClose,
  onAssignMechanic,
  onEdit,
  onChangeStatus,
}: RevisionDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'history'>('details');

  // Log de debug quando o modal abre
  useEffect(() => {
    logRevisionData(revision, isOpen);
  }, [revision, isOpen]);

  if (!revision) return null;

  const StatusIcon = statusConfig[revision.status as keyof typeof statusConfig]?.icon || Circle;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Group checklist items by category with validation
  const groupedChecklist = Array.isArray(revision.checklistItems)
    ? revision.checklistItems
        .filter(item => {
          // Validar que o item tem os campos essenciais
          const isValid = item &&
                         typeof item === 'object' &&
                         item.categoryName &&
                         item.itemName &&
                         item.status;

          if (!isValid && item) {
            console.warn('⚠️ Item inválido no checklist:', item);
          }

          return isValid;
        })
        .reduce((acc: any, item: any) => {
          if (!acc[item.categoryName]) {
            acc[item.categoryName] = [];
          }
          acc[item.categoryName].push(item);
          return acc;
        }, {})
    : {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <FileText className="h-6 w-6 text-moria-orange" />
                Revisão #{revision.id.slice(0, 8)}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`${
                    statusConfig[revision.status as keyof typeof statusConfig]?.color
                  } flex items-center gap-1`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig[revision.status as keyof typeof statusConfig]?.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  Criada em {formatDateShort(revision.createdAt)}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-moria-orange border-b-2 border-moria-orange'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'checklist'
                ? 'text-moria-orange border-b-2 border-moria-orange'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-moria-orange border-b-2 border-moria-orange'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 py-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Cliente e Veículo */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold">{revision.customer?.name}</p>
                    <p className="text-sm text-gray-600">{revision.customer?.email}</p>
                    <p className="text-sm text-gray-600">{revision.customer?.phone}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Veículo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold">
                      {revision.vehicle?.brand} {revision.vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-600">Ano: {revision.vehicle?.year}</p>
                    <p className="text-sm text-gray-600">Placa: {revision.vehicle?.plate}</p>
                    {revision.vehicle?.color && (
                      <p className="text-sm text-gray-600">Cor: {revision.vehicle?.color}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Info Adicional */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações da Revisão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">{formatDate(revision.date)}</span>
                  </div>
                  {revision.mileage && (
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Quilometragem:</span>
                      <span className="font-medium">{revision.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                  {revision.completedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">Concluída em:</span>
                      <span className="font-medium">{formatDate(revision.completedAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mecânico Responsável */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Mecânico Responsável
                  </CardTitle>
                  {onAssignMechanic && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignMechanic(revision.id)}
                      className="text-moria-orange border-moria-orange hover:bg-moria-orange hover:text-white"
                    >
                      {revision.assignedMechanicId ? 'Trocar Mecânico' : 'Atribuir Mecânico'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {revision.assignedMechanic ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-lg">{revision.assignedMechanic.name}</p>
                      <p className="text-sm text-gray-600">{revision.assignedMechanic.email}</p>
                      <Badge variant="outline">{revision.assignedMechanic.role}</Badge>
                      {revision.assignedAt && (
                        <p className="text-sm text-gray-500 mt-2">
                          Atribuído em {formatDateShort(revision.assignedAt)}
                        </p>
                      )}
                      {revision.mechanicNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Observações do Mecânico:
                          </p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {revision.mechanicNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum mecânico atribuído</p>
                  )}
                </CardContent>
              </Card>

              {/* Observações Gerais */}
              {revision.generalNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {revision.generalNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Recomendações */}
              {revision.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {revision.recommendations}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {Object.keys(groupedChecklist).length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 font-medium text-lg mb-2">Nenhum item no checklist</p>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    {revision.checklistItems && Array.isArray(revision.checklistItems) && revision.checklistItems.length > 0
                      ? 'Esta revisão foi criada mas o checklist não foi preenchido corretamente'
                      : 'Esta revisão ainda não possui dados de checklist'}
                  </p>
                  {revision.status === 'DRAFT' && (
                    <p className="text-sm text-moria-orange mt-3">
                      Status: Rascunho - Aguardando preenchimento
                    </p>
                  )}
                </div>
              ) : (
                Object.entries(groupedChecklist).map(([categoryName, items]: [string, any]) => (
                  <Card key={categoryName}>
                    <CardHeader>
                      <CardTitle className="text-lg">{categoryName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {items.map((item: any, index: number) => {
                          const StatusIcon =
                            checklistStatusConfig[item.status as keyof typeof checklistStatusConfig]
                              ?.icon || Circle;
                          const statusColor =
                            checklistStatusConfig[item.status as keyof typeof checklistStatusConfig]
                              ?.color || 'bg-gray-100 text-gray-600';

                          return (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <StatusIcon
                                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                  item.status === 'OK'
                                    ? 'text-green-600'
                                    : item.status === 'CRITICAL'
                                    ? 'text-red-600'
                                    : item.status === 'ATTENTION'
                                    ? 'text-yellow-600'
                                    : 'text-gray-400'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium text-sm">{item.itemName}</p>
                                  <Badge className={`${statusColor} text-xs flex-shrink-0`}>
                                    {
                                      checklistStatusConfig[
                                        item.status as keyof typeof checklistStatusConfig
                                      ]?.label
                                    }
                                  </Badge>
                                </div>
                                {item.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {revision.transferHistory && revision.transferHistory.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5" />
                      Histórico de Transferências
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revision.transferHistory.map((transfer: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <ArrowRightLeft className="h-5 w-5 text-moria-orange mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              De <span className="text-moria-orange">{transfer.fromName}</span> para{' '}
                              <span className="text-moria-orange">{transfer.toName}</span>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDateShort(transfer.transferredAt)}
                            </p>
                            {transfer.reason && (
                              <p className="text-sm text-gray-500 mt-1">
                                Motivo: {transfer.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma transferência registrada
                </p>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Circle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Revisão Criada</p>
                        <p className="text-sm text-gray-500">{formatDateShort(revision.createdAt)}</p>
                      </div>
                    </div>

                    {revision.assignedAt && (
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <UserCog className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Mecânico Atribuído</p>
                          <p className="text-sm text-gray-500">
                            {formatDateShort(revision.assignedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {revision.completedAt && (
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Revisão Concluída</p>
                          <p className="text-sm text-gray-500">
                            {formatDateShort(revision.completedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {onEdit && revision.status !== 'COMPLETED' && revision.status !== 'CANCELLED' && (
            <Button
              onClick={() => onEdit(revision.id)}
              className="bg-moria-orange hover:bg-moria-orange/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
