import React from 'react';
import { Bell, Search } from 'lucide-react';
import { StoreBottomNav, StoreTab } from '../components/StoreBottomNav';
import { StoreSidebar } from '../components/StoreSidebar';
import { useIsMobile } from '../hooks/useMediaQuery';
import { cn } from '../utils/cn';

interface StoreLayoutProps {
  children: React.ReactNode;
  currentTab: StoreTab | string;
  onTabChange: (tab: string) => void;
  adminName?: string;
  onLogout: () => void;
  onMoreClick?: () => void;
}

export function StoreLayout({
  children,
  currentTab,
  onTabChange,
  adminName = 'Admin',
  onLogout,
  onMoreClick
}: StoreLayoutProps) {
  const isMobile = useIsMobile();
  const [notificationCount] = React.useState(5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile */}
      {isMobile && (
        <header
          className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="px-4 py-4">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Painel Lojista</h1>
                  <p className="text-xs text-gray-500">{adminName}</p>
                </div>
              </div>

              <button
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
                aria-label="Notificações"
              >
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </header>
      )}

      {/* Header - Desktop */}
      {!isMobile && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-500">Bem-vindo, {adminName}</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Buscar pedidos, produtos, clientes..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Notifications */}
                <button
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  type="button"
                  aria-label="Notificações"
                >
                  <Bell className="w-6 h-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar - Desktop Only */}
        {!isMobile && (
          <StoreSidebar
            currentTab={currentTab}
            onTabChange={onTabChange}
            adminName={adminName}
            onLogout={onLogout}
          />
        )}

        {/* Content */}
        <main className={cn(
          "flex-1 p-4",
          isMobile ? "pb-20" : "pb-6" // Space for bottom nav on mobile
        )}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <StoreBottomNav
          currentTab={currentTab as StoreTab}
          onTabChange={(tab) => onTabChange(tab)}
          onMoreClick={onMoreClick}
        />
      )}
    </div>
  );
}
