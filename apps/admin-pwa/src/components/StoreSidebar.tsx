import {
  LayoutDashboard, ShoppingCart, Package, Users, Wrench, Gift,
  TrendingUp, BarChart3, Settings, LogOut, FileText, ClipboardCheck, UserCog
} from 'lucide-react';
import { cn } from '../utils/cn';
import { StoreTab } from './StoreBottomNav';

interface StoreSidebarProps {
  currentTab: StoreTab | string;
  onTabChange: (tab: string) => void;
  adminName?: string;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'quotes', label: 'Orçamentos', icon: FileText },
  { id: 'revisions', label: 'Revisões', icon: ClipboardCheck },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'services', label: 'Serviços', icon: Wrench },
  { id: 'coupons', label: 'Cupons', icon: Gift },
  { id: 'promotions', label: 'Promoções', icon: TrendingUp },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'users', label: 'Usuários', icon: UserCog },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function StoreSidebar({ currentTab, onTabChange, adminName = 'Admin', onLogout }: StoreSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-moria-black text-white h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">
              {adminName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{adminName}</p>
            <p className="text-xs text-gray-400">Painel Lojista</p>
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
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-gray-800 active:scale-[0.98]",
                  isActive
                    ? "bg-orange-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className="w-5 h-5 flex-shrink-0"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  "text-sm font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
