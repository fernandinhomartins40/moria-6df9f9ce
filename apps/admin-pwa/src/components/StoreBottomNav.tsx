import { LayoutDashboard, ShoppingCart, Package, BarChart3, Menu } from 'lucide-react';
import { cn } from '../utils/cn';

export type StoreTab = 'dashboard' | 'orders' | 'products' | 'reports' | 'more';

interface StoreBottomNavProps {
  currentTab: StoreTab;
  onTabChange: (tab: StoreTab) => void;
  onMoreClick?: () => void;
}

const navItems = [
  { id: 'dashboard' as StoreTab, icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'orders' as StoreTab, icon: ShoppingCart, label: 'Pedidos' },
  { id: 'products' as StoreTab, icon: Package, label: 'Produtos' },
  { id: 'reports' as StoreTab, icon: BarChart3, label: 'Relatórios' },
  { id: 'more' as StoreTab, icon: Menu, label: 'Mais' }
];

export function StoreBottomNav({ currentTab, onTabChange, onMoreClick }: StoreBottomNavProps) {
  const handleClick = (tabId: StoreTab) => {
    // Haptic feedback (se disponível)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (tabId === 'more' && onMoreClick) {
      onMoreClick();
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden"
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-all duration-200",
                "hover:bg-gray-50 active:scale-95 rounded-lg",
                isActive ? "text-orange-600" : "text-gray-600 hover:text-orange-500"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-transform duration-200",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
