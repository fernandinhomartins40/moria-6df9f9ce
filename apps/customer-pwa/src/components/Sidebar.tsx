import { Home, Package, Car, Heart, User, ClipboardCheck, Gift, MessageCircle, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';
import { CustomerTab } from './BottomNav';

interface SidebarProps {
  currentTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
  customerName?: string;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard' as CustomerTab, label: 'Dashboard', icon: Home, description: 'Visão geral da conta' },
  { id: 'profile' as CustomerTab, label: 'Meu Perfil', icon: User, description: 'Dados pessoais e endereços' },
  { id: 'orders' as CustomerTab, label: 'Meus Pedidos', icon: Package, description: 'Histórico e acompanhamento' },
  { id: 'vehicles' as CustomerTab, label: 'Meus Veículos', icon: Car, description: 'Gerencie seus veículos' },
  { id: 'revisions' as CustomerTab, label: 'Minhas Revisões', icon: ClipboardCheck, description: 'Histórico de revisões' },
  { id: 'favorites' as CustomerTab, label: 'Favoritos', icon: Heart, description: 'Produtos salvos' },
  { id: 'coupons' as CustomerTab, label: 'Cupons', icon: Gift, description: 'Descontos disponíveis' },
  { id: 'support' as CustomerTab, label: 'Suporte', icon: MessageCircle, description: 'Atendimento ao cliente' },
];

export function Sidebar({ currentTab, onTabChange, customerName = 'Cliente', onLogout }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{customerName}</p>
            <p className="text-xs text-gray-500">Painel do Cliente</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-gray-50 active:scale-[0.98]",
                  isActive
                    ? "bg-green-50 text-green-700 shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 mt-0.5",
                    isActive ? "text-green-600" : "text-gray-400"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <div className="flex-1 text-left">
                  <p className={cn(
                    "text-sm font-medium",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
