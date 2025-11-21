import React from 'react';
import { InstallBanner } from '@moria/ui/pwa-install';
import '@moria/ui/pwa-install/styles/animations.css';
import { Home, Grid, ShoppingBag, User, Bell, Search, ShoppingCart, Package, Ship, Heart, History } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner de Instalação PWA */}
      <InstallBanner
        appName="Cliente"
        variant="customer"
        compact={true}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white safe-area-inset-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">Olá,</p>
                <p className="font-semibold text-lg">João Silva</p>
              </div>
            </div>

            <button
              className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              type="button"
              aria-label="Notificações"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <QuickAction icon={ShoppingCart} label="Pedidos" />
          <QuickAction icon={Package} label="Rastreio" />
          <QuickAction icon={Ship} label="Embarcações" />
          <QuickAction icon={Heart} label="Favoritos" />
          <QuickAction icon={History} label="Histórico" />
        </div>
      </div>

      {/* Content */}
      <main className="p-4 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom shadow-lg">
        <div className="flex justify-around py-2">
          <BottomNavItem icon={Home} label="Início" active />
          <BottomNavItem icon={Grid} label="Catálogo" />
          <BottomNavItem icon={ShoppingBag} label="Carrinho" badge={2} />
          <BottomNavItem icon={User} label="Conta" />
        </div>
      </nav>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
}

function QuickAction({ icon: Icon, label }: QuickActionProps) {
  return (
    <button
      className="flex flex-col items-center gap-2 min-w-[72px] group"
      type="button"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-all group-active:scale-95 shadow-sm">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <span className="text-xs text-gray-700 font-medium">{label}</span>
    </button>
  );
}

interface BottomNavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: number;
}

function BottomNavItem({ icon: Icon, label, active, badge }: BottomNavItemProps) {
  return (
    <button
      className={`
        relative flex flex-col items-center justify-center px-3 py-2 min-w-[64px]
        ${active ? 'text-green-600' : 'text-gray-600'}
        hover:text-green-600 transition-colors
      `}
      type="button"
    >
      <div className="relative">
        <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''}`} />
        {badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
      {active && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full" />
      )}
    </button>
  );
}
