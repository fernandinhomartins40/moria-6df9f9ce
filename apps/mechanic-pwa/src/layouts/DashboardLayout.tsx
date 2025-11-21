import React from 'react';
import { InstallBanner } from '@moria/ui/pwa-install';
import '@moria/ui/pwa-install/styles/animations.css';
import { Home, ClipboardList, Calendar, Package, Search, PlusCircle, Bell, User, Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner de Instalação PWA */}
      <InstallBanner
        appName="Mecânico"
        variant="mechanic"
        compact={true}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Portal do Mecânico
              </h1>
              <p className="text-xs text-gray-500">João Silva</p>
            </div>
          </div>

          <button
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 px-4">
          <NavTab icon={Home} label="Início" active />
          <NavTab icon={ClipboardList} label="Ordens" />
          <NavTab icon={Calendar} label="Agenda" />
          <NavTab icon={Package} label="Estoque" />
        </div>
      </nav>

      {/* Content */}
      <main className="p-4 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex justify-around py-2">
          <BottomNavItem icon={Home} label="Início" active />
          <BottomNavItem icon={Search} label="Buscar" />
          <BottomNavItem icon={PlusCircle} label="Nova OS" highlight />
          <BottomNavItem icon={Bell} label="Avisos" badge={3} />
          <BottomNavItem icon={User} label="Perfil" />
        </div>
      </nav>
    </div>
  );
}

interface NavTabProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

function NavTab({ icon: Icon, label, active }: NavTabProps) {
  return (
    <button
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
        ${active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900'
        }
      `}
      type="button"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

interface BottomNavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: number;
  highlight?: boolean;
}

function BottomNavItem({ icon: Icon, label, active, badge, highlight }: BottomNavItemProps) {
  return (
    <button
      className={`
        relative flex flex-col items-center justify-center px-3 py-2 min-w-[64px]
        ${active ? 'text-blue-600' : 'text-gray-600'}
        ${highlight ? 'text-blue-600' : ''}
        hover:text-blue-600 transition-colors
      `}
      type="button"
    >
      <div className="relative">
        <Icon className={`w-6 h-6 ${highlight ? 'scale-110' : ''}`} />
        {badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
