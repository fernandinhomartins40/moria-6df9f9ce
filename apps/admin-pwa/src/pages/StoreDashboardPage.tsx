import { TrendingUp, ShoppingCart, Package, Users } from 'lucide-react';

export function StoreDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Painel Administrativo!</h2>
        <p className="text-orange-50">Visão geral das operações da loja</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          label="Pedidos Hoje"
          value="28"
          trend="+12%"
          color="blue"
        />
        <StatCard
          icon={Package}
          label="Produtos"
          value="1,245"
          trend="Em estoque"
          color="purple"
        />
        <StatCard
          icon={Users}
          label="Clientes"
          value="892"
          trend="+45 novos"
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Faturamento"
          value="R$ 24.5K"
          trend="+18% mês"
          color="orange"
        />
      </div>

      {/* Content Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Completo em Desenvolvimento</h3>
        <p className="text-gray-600">
          Gráficos, relatórios e análises detalhadas serão exibidos aqui.
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
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
