import { ClipboardCheck, Calendar, Settings, LogOut, User } from 'lucide-react';
import { cn } from '../utils/cn';
import { MechanicTab } from './MechanicBottomNav';

interface MechanicSidebarProps {
  currentTab: MechanicTab | string;
  onTabChange: (tab: string) => void;
  mechanicName?: string;
  onLogout: () => void;
}

const menuItems = [
  { id: 'revisions', label: 'Minhas Revisões', icon: ClipboardCheck, description: 'Revisões atribuídas' },
  { id: 'schedule', label: 'Minha Agenda', icon: Calendar, description: 'Horários e compromissos' },
  { id: 'profile', label: 'Meu Perfil', icon: User, description: 'Dados pessoais' },
  { id: 'settings', label: 'Configurações', icon: Settings, description: 'Preferências' },
];

export function MechanicSidebar({ currentTab, onTabChange, mechanicName = 'Mecânico', onLogout }: MechanicSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-900 text-white h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">
              {mechanicName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{mechanicName}</p>
            <p className="text-xs text-gray-400">Painel do Mecânico</p>
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
                  "hover:bg-gray-800 active:scale-[0.98]",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <div className="flex-1 text-left">
                  <p className={cn(
                    "text-sm font-medium",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
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
