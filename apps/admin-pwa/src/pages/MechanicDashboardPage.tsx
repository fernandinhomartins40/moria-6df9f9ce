import { ClipboardCheck, Calendar, Clock, CheckCircle } from 'lucide-react';

export function MechanicDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Minhas Revisões</h2>
        <p className="text-blue-50">Acompanhe suas tarefas e atendimentos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Pendentes"
          value="8"
          trend="Para hoje"
          color="yellow"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Em Andamento"
          value="3"
          trend="Ativos"
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Concluídas"
          value="24"
          trend="Este mês"
          color="green"
        />
        <StatCard
          icon={Calendar}
          label="Agendadas"
          value="12"
          trend="Próximos dias"
          color="purple"
        />
      </div>

      {/* Revisions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revisões Recentes</h3>
        <div className="space-y-3">
          <RevisionItem
            vehicle="Honda CG 160"
            plate="ABC-1234"
            status="pending"
            customer="João Silva"
          />
          <RevisionItem
            vehicle="Yamaha XJ6"
            plate="XYZ-5678"
            status="in_progress"
            customer="Maria Santos"
          />
          <RevisionItem
            vehicle="Kawasaki Ninja"
            plate="DEF-9012"
            status="completed"
            customer="Pedro Costa"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  color: 'blue' | 'purple' | 'green' | 'yellow';
}

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-xs text-gray-500 mt-1">{trend}</p>
    </div>
  );
}

interface RevisionItemProps {
  vehicle: string;
  plate: string;
  status: 'pending' | 'in_progress' | 'completed';
  customer: string;
}

function RevisionItem({ vehicle, plate, status, customer }: RevisionItemProps) {
  const statusConfig = {
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Concluída', color: 'bg-green-100 text-green-700' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div>
        <p className="font-medium text-gray-900">{vehicle}</p>
        <p className="text-sm text-gray-500">{plate} • {customer}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
