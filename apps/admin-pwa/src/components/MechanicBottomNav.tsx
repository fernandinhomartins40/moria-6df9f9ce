import { ClipboardCheck, Calendar, PlusCircle, Bell, User } from 'lucide-react';
import { cn } from '../utils/cn';

export type MechanicTab = 'revisions' | 'schedule' | 'new-os' | 'notifications' | 'profile';

interface MechanicBottomNavProps {
  currentTab: MechanicTab;
  onTabChange: (tab: MechanicTab) => void;
  notificationCount?: number;
}

const navItems = [
  { id: 'revisions' as MechanicTab, icon: ClipboardCheck, label: 'Revisões' },
  { id: 'schedule' as MechanicTab, icon: Calendar, label: 'Agenda' },
  { id: 'new-os' as MechanicTab, icon: PlusCircle, label: 'Nova OS', highlight: true },
  { id: 'notifications' as MechanicTab, icon: Bell, label: 'Avisos' },
  { id: 'profile' as MechanicTab, icon: User, label: 'Perfil' }
];

export function MechanicBottomNav({ currentTab, onTabChange, notificationCount = 0 }: MechanicBottomNavProps) {
  const handleClick = (tabId: MechanicTab) => {
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
          const showBadge = item.id === 'notifications' && notificationCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-all duration-200",
                "hover:bg-gray-50 active:scale-95 rounded-lg",
                isActive
                  ? "text-blue-600"
                  : item.highlight
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-transform duration-200",
                    (isActive || item.highlight) && "scale-110"
                  )}
                  strokeWidth={isActive || item.highlight ? 2.5 : 2}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
