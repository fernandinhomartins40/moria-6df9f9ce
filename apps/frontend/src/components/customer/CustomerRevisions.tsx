import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRevisions } from '../../contexts/RevisionsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ClipboardCheck,
  Car,
  Calendar,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Eye,
  Gauge,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Revision, ItemStatus } from '../../types/revisions';
import { RevisionDetailsDialog } from './RevisionDetailsDialog';

export function CustomerRevisions() {
  const { customer } = useAuth();
  const { revisions, getRevisionsByCustomer, vehicles, getVehicle, categories } = useRevisions();
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Get customer's revisions
  const customerRevisions = useMemo(() => {
    if (!customer) return [];
    return getRevisionsByCustomer(customer.id).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [customer, revisions]);

  // Calculate alerts from all revisions
  const alerts = useMemo(() => {
    const allAlerts: Array<{
      type: 'critical' | 'attention';
      vehicleId: string;
      vehicleName: string;
      revisionDate: Date;
      items: Array<{ categoryName: string; itemName: string; notes?: string }>;
    }> = [];

    customerRevisions.forEach(revision => {
      // Use vehicle data from revision (from API) or fallback to context
      const vehicle = revision.vehicle || getVehicle(revision.vehicleId);
      if (!vehicle || revision.status !== 'completed') return;

      const criticalItems: Array<{ categoryName: string; itemName: string; notes?: string }> = [];
      const attentionItems: Array<{ categoryName: string; itemName: string; notes?: string }> = [];

      revision.checklistItems.forEach(checkItem => {
        if (checkItem.status === ItemStatus.CRITICAL || checkItem.status === ItemStatus.ATTENTION) {
          // Find the item and category
          for (const category of categories) {
            const item = category.items.find(i => i.id === checkItem.itemId);
            if (item) {
              const alertItem = {
                categoryName: category.name,
                itemName: item.name,
                notes: checkItem.notes
              };

              if (checkItem.status === ItemStatus.CRITICAL) {
                criticalItems.push(alertItem);
              } else {
                attentionItems.push(alertItem);
              }
              break;
            }
          }
        }
      });

      if (criticalItems.length > 0) {
        allAlerts.push({
          type: 'critical',
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`,
          revisionDate: revision.date,
          items: criticalItems
        });
      }

      if (attentionItems.length > 0) {
        allAlerts.push({
          type: 'attention',
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`,
          revisionDate: revision.date,
          items: attentionItems
        });
      }
    });

    return allAlerts;
  }, [customerRevisions, categories, getVehicle]);

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const attentionAlerts = alerts.filter(a => a.type === 'attention');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: 'Rascunho', variant: 'secondary' as const, color: 'bg-gray-500' },
      in_progress: { label: 'Em Andamento', variant: 'default' as const, color: 'bg-blue-500' },
      completed: { label: 'Concluída', variant: 'default' as const, color: 'bg-green-500' },
      cancelled: { label: 'Cancelada', variant: 'secondary' as const, color: 'bg-red-500' }
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;
    return (
      <Badge variant={badge.variant} className={`${badge.color} text-white`}>
        {badge.label}
      </Badge>
    );
  };

  const getRevisionStats = (revision: Revision) => {
    const total = revision.checklistItems.length;
    const checked = revision.checklistItems.filter(
      item => item.status !== ItemStatus.NOT_CHECKED
    ).length;
    const critical = revision.checklistItems.filter(
      item => item.status === ItemStatus.CRITICAL
    ).length;
    const attention = revision.checklistItems.filter(
      item => item.status === ItemStatus.ATTENTION
    ).length;
    const ok = revision.checklistItems.filter(
      item => item.status === ItemStatus.OK
    ).length;

    return { total, checked, critical, attention, ok };
  };

  const handleViewDetails = (revision: Revision) => {
    setSelectedRevision(revision);
    setIsDetailsOpen(true);
  };

  if (!customer) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Minhas Revisões</h1>
        <p className="text-muted-foreground">
          Acompanhe o histórico de revisões dos seus veículos e alertas importantes
        </p>
      </div>

      {/* Alerts Section */}
      {(criticalAlerts.length > 0 || attentionAlerts.length > 0) && (
        <div className="space-y-4">
          {criticalAlerts.length > 0 && (
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-red-900">
                      {criticalAlerts.length} Alerta{criticalAlerts.length > 1 ? 's' : ''} Crítico
                      {criticalAlerts.length > 1 ? 's' : ''} - Ação Imediata Necessária!
                    </p>
                  </div>
                  {criticalAlerts.map((alert, idx) => (
                    <Card key={idx} className="border-red-300 bg-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-red-600" />
                          <CardTitle className="text-sm font-semibold text-red-900">
                            {alert.vehicleName}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Revisão em {formatDate(alert.revisionDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {alert.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-medium">{item.itemName}</span>
                                <span className="text-muted-foreground"> ({item.categoryName})</span>
                                {item.notes && (
                                  <p className="text-xs text-gray-600 mt-1">{item.notes}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                  <p className="text-sm text-red-800 mt-2">
                    ⚠️ Entre em contato com a oficina para agendar os reparos necessários.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {attentionAlerts.length > 0 && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-yellow-900">
                      {attentionAlerts.length} Item{attentionAlerts.length > 1 ? 'ns' : ''} Requer
                      {attentionAlerts.length > 1 ? 'm' : ''} Atenção
                    </p>
                  </div>
                  {attentionAlerts.map((alert, idx) => (
                    <Card key={idx} className="border-yellow-300 bg-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-yellow-600" />
                          <CardTitle className="text-sm font-semibold text-yellow-900">
                            {alert.vehicleName}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Revisão em {formatDate(alert.revisionDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {alert.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-medium">{item.itemName}</span>
                                <span className="text-muted-foreground"> ({item.categoryName})</span>
                                {item.notes && (
                                  <p className="text-xs text-gray-600 mt-1">{item.notes}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                  <p className="text-sm text-yellow-800 mt-2">
                    💡 Recomendamos agendar uma manutenção preventiva em breve.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Revisions List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({customerRevisions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({customerRevisions.filter(r => r.status === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            Em Andamento ({customerRevisions.filter(r => r.status === 'in_progress').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {customerRevisions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold mb-2">Nenhuma revisão encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Suas revisões veiculares aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            customerRevisions.map(revision => {
              // Use vehicle data from revision (from API) or fallback to context
              const vehicle = revision.vehicle || getVehicle(revision.vehicleId);
              const stats = getRevisionStats(revision);

              if (!vehicle) return null;

              return (
                <Card key={revision.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-moria-orange/10 p-3 rounded-lg">
                          <Car className="h-6 w-6 text-moria-orange" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {vehicle.brand} {vehicle.model}
                          </CardTitle>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span>Placa: {vehicle.plate}</span>
                              <span>•</span>
                              <span>Ano: {vehicle.year}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(revision.date)}</span>
                              {revision.mileage && (
                                <>
                                  <span>•</span>
                                  <Gauge className="h-3 w-3" />
                                  <span>{revision.mileage.toLocaleString()} km</span>
                                </>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(revision.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span className="text-2xl font-bold">{stats.checked}</span>
                          <span className="text-sm">/{stats.total}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Verificados</p>
                      </div>

                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-2xl font-bold">{stats.ok}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">OK</p>
                      </div>

                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-2xl font-bold">{stats.attention}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Atenção</p>
                      </div>

                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-2xl font-bold">{stats.critical}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Crítico</p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {revision.recommendations && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-semibold text-sm mb-1">Recomendações:</p>
                          <p className="text-sm">{revision.recommendations}</p>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* View Details Button */}
                    <Button
                      onClick={() => handleViewDetails(revision)}
                      className="w-full"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes Completos
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {customerRevisions.filter(r => r.status === 'completed').map(revision => {
            // Use vehicle data from revision (from API) or fallback to context
            const vehicle = revision.vehicle || getVehicle(revision.vehicleId);
            const stats = getRevisionStats(revision);
            if (!vehicle) return null;

            return (
              <Card key={revision.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {vehicle.brand} {vehicle.model}
                        </CardTitle>
                        <CardDescription>
                          Revisão concluída em {formatDate(revision.completedAt || revision.date)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleViewDetails(revision)}
                    className="w-full"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {customerRevisions.filter(r => r.status === 'in_progress').map(revision => {
            // Use vehicle data from revision (from API) or fallback to context
            const vehicle = revision.vehicle || getVehicle(revision.vehicleId);
            if (!vehicle) return null;

            return (
              <Card key={revision.id}>
                <CardHeader>
                  <CardTitle>{vehicle.brand} {vehicle.model}</CardTitle>
                  <CardDescription>Revisão iniciada em {formatDate(revision.date)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Esta revisão ainda está em andamento. Aguarde a conclusão pela oficina.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      {selectedRevision && (
        <RevisionDetailsDialog
          revision={selectedRevision}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedRevision(null);
          }}
        />
      )}
    </div>
  );
}
