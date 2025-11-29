import { Package, Car, Heart, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta!</h2>
        <p className="text-green-50">Aqui está um resumo da sua conta</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Pedidos"
          value="12"
          trend="+2 este mês"
          color="blue"
        />
        <StatCard
          icon={Car}
          label="Veículos"
          value="3"
          trend="Cadastrados"
          color="purple"
        />
        <StatCard
          icon={Heart}
          label="Favoritos"
          value="24"
          trend="Produtos salvos"
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          label="Pontos"
          value="850"
          trend="Nível Gold"
          color="yellow"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recentes</h3>
        <div className="space-y-3">
          <OrderItem
            orderId="#12345"
            date="15 Nov 2025"
            status="delivered"
            amount="R$ 450,00"
          />
          <OrderItem
            orderId="#12344"
            date="10 Nov 2025"
            status="in_transit"
            amount="R$ 280,00"
          />
          <OrderItem
            orderId="#12343"
            date="05 Nov 2025"
            status="processing"
            amount="R$ 125,00"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          title="Nova Revisão"
          description="Agende uma revisão"
          icon={Car}
          color="green"
        />
        <QuickActionCard
          title="Meus Cupons"
          description="2 cupons disponíveis"
          icon={TrendingUp}
          color="orange"
        />
        <QuickActionCard
          title="Suporte"
          description="Fale conosco"
          icon={Clock}
          color="blue"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  color: 'blue' | 'purple' | 'red' | 'yellow';
}

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
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

interface OrderItemProps {
  orderId: string;
  date: string;
  status: 'delivered' | 'in_transit' | 'processing';
  amount: string;
}

function OrderItem({ orderId, date, status, amount }: OrderItemProps) {
  const statusConfig = {
    delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    in_transit: { label: 'Em trânsito', color: 'bg-blue-100 text-blue-700', icon: Package },
    processing: { label: 'Processando', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${config.color}`}>
          <StatusIcon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{orderId}</p>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{amount}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'green' | 'orange' | 'blue';
}

function QuickActionCard({ title, description, icon: Icon, color }: QuickActionCardProps) {
  const colors = {
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
  };

  return (
    <button className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl p-4 text-left hover:shadow-lg transition-all active:scale-95`}>
      <Icon className="w-8 h-8 mb-2 opacity-90" />
      <p className="font-semibold mb-1">{title}</p>
      <p className="text-sm text-white/80">{description}</p>
    </button>
  );
}
