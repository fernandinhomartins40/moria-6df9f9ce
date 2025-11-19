import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Clock, Phone, Info } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@api/adminService';
import MechanicChecklistForm from './MechanicChecklistForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
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
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartRevision = async () => {
    try {
      setLoading(true);
      await adminService.startRevision(revision.id);

      toast.success('Revisão iniciada');

      onUpdate();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Erro ao iniciar revisão', {
        description: err.response?.data?.message || 'Erro desconhecido',
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

      toast.success('Revisão concluída');

      onUpdate();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Erro ao concluir revisão', {
        description: err.response?.data?.message || 'Erro desconhecido',
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
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`border rounded-lg p-4 transition-all ${
        isCompleted ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{revision.vehicleModel}</h3>
              <Badge className={PRIORITY_COLORS[revision.priority]}>
                {PRIORITY_LABELS[revision.priority]}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Placa: {revision.vehiclePlate} • Ano: {revision.vehicleYear}
            </p>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Customer Info */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <p className="text-sm">
              <strong>Cliente:</strong> {revision.customer.name}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={openWhatsApp}>
            <Phone className="h-4 w-4 mr-2" />
            Contato
          </Button>
        </div>

        {/* Dates */}
        <div className="flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <p>
              <strong>Agendado:</strong> {formatDate(revision.scheduledDate)}
            </p>
          </div>
          {revision.startedAt && (
            <p>
              <strong>Iniciado:</strong> {formatDate(revision.startedAt)}
            </p>
          )}
          {revision.completedAt && (
            <p>
              <strong>Concluído:</strong> {formatDate(revision.completedAt)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex gap-2">
            {revision.status === 'PENDING' && (
              <Button onClick={handleStartRevision} disabled={loading}>
                Iniciar Revisão
              </Button>
            )}
            {revision.status === 'IN_PROGRESS' && (
              <Button onClick={handleCompleteRevision} disabled={loading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Concluída
              </Button>
            )}
          </div>
        )}

        {/* Collapsible Details */}
        <CollapsibleContent className="space-y-3 pt-3">
          <Separator />

          {/* Notes */}
          {revision.notes && (
            <div>
              <p className="text-sm font-semibold mb-1">Observações do Cliente:</p>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                {revision.notes}
              </div>
            </div>
          )}

          {revision.mechanicNotes && (
            <div>
              <p className="text-sm font-semibold mb-1">Suas Anotações:</p>
              <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">
                {revision.mechanicNotes}
              </div>
            </div>
          )}

          {/* Checklist Form (only for in-progress revisions) */}
          {revision.status === 'IN_PROGRESS' && !isCompleted && (
            <>
              <Separator />
              <MechanicChecklistForm revisionId={revision.id} onUpdate={onUpdate} />
            </>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
