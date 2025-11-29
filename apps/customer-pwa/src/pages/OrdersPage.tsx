import { Package, Search, Filter } from 'lucide-react';

export function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
        <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar por número do pedido..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtros</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <OrderCard
          orderId="#12345"
          date="15 Nov 2025"
          status="delivered"
          items={3}
          total="R$ 450,00"
          trackingCode="BR123456789"
        />
        <OrderCard
          orderId="#12344"
          date="10 Nov 2025"
          status="in_transit"
          items={2}
          total="R$ 280,00"
          trackingCode="BR987654321"
        />
        <OrderCard
          orderId="#12343"
          date="05 Nov 2025"
          status="processing"
          items={1}
          total="R$ 125,00"
        />
      </div>
    </div>
  );
}

interface OrderCardProps {
  orderId: string;
  date: string;
  status: 'delivered' | 'in_transit' | 'processing' | 'cancelled';
  items: number;
  total: string;
  trackingCode?: string;
}

function OrderCard({ orderId, date, status, items, total, trackingCode }: OrderCardProps) {
  const statusConfig = {
    delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700 border-green-200' },
    in_transit: { label: 'Em trânsito', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    processing: { label: 'Processando', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{orderId}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <Package className="w-6 h-6 text-gray-400" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Itens</p>
          <p className="font-medium text-gray-900">{items} {items === 1 ? 'produto' : 'produtos'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="font-semibold text-lg text-gray-900">{total}</p>
        </div>
      </div>

      {/* Tracking */}
      {trackingCode && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600 mb-1">Código de rastreamento</p>
          <p className="font-mono text-sm font-medium text-gray-900">{trackingCode}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
          Ver detalhes
        </button>
        {trackingCode && (
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Rastrear
          </button>
        )}
      </div>
    </div>
  );
}
