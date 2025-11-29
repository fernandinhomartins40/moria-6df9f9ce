import { Home, Package, Car, Heart, User } from 'lucide-react';
import { cn } from '../utils/cn';

export type CustomerTab = 'dashboard' | 'orders' | 'vehicles' | 'favorites' | 'profile';

interface BottomNavProps {
  currentTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
}

const navItems = [
  { id: 'dashboard' as CustomerTab, icon: Home, label: 'Início' },
  { id: 'orders' as CustomerTab, icon: Package, label: 'Pedidos' },
  { id: 'vehicles' as CustomerTab, icon: Car, label: 'Veículos' },
  { id: 'favorites' as CustomerTab, icon: Heart, label: 'Favoritos' },
  { id: 'profile' as CustomerTab, icon: User, label: 'Perfil' }
];

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const handleClick = (tabId: CustomerTab) => {
    // Haptic feedback (se disponível)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onTabChange(tabId);
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
                isActive ? "text-green-600" : "text-gray-600 hover:text-green-500"
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
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
