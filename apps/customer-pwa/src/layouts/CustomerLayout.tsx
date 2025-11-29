import React, { useState } from 'react';
import { InstallBanner } from '@moria/ui/pwa-install';
import '@moria/ui/pwa-install/styles/animations.css';
import { Bell, Search, ShoppingCart } from 'lucide-react';
import { BottomNav, CustomerTab } from '../components/BottomNav';
import { Sidebar } from '../components/Sidebar';
import { useIsMobile } from '../hooks/useMediaQuery';
import { cn } from '../utils/cn';

interface CustomerLayoutProps {
  children: React.ReactNode;
  currentTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
  customerName?: string;
  onLogout: () => void;
}

export function CustomerLayout({
  children,
  currentTab,
  onTabChange,
  customerName = 'Cliente',
  onLogout
}: CustomerLayoutProps) {
  const isMobile = useIsMobile();
  const [notificationCount] = useState(2);
  const [cartCount] = useState(3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Install Banner */}
      <InstallBanner
        appName="Cliente"
        variant="customer"
        compact={true}
      />

      {/* Header - Mobile */}
      {isMobile && (
        <header
          className="sticky top-0 z-40 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="px-4 py-4">
            {/* User Info & Notifications */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <span className="text-lg font-bold">
                    {customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-white/80">Olá,</p>
                  <p className="font-semibold text-lg">{customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                  type="button"
                  aria-label="Notificações"
                >
                  <Bell className="w-6 h-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>

                <button
                  className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                  type="button"
                  aria-label="Carrinho"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
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
      )}

      {/* Header - Desktop */}
      {!isMobile && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel do Cliente</h1>
                <p className="text-sm text-gray-500">Bem-vindo de volta, {customerName}</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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

                {/* Cart */}
                <button
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  type="button"
                  aria-label="Carrinho"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-green-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
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
          <Sidebar
            currentTab={currentTab}
            onTabChange={onTabChange}
            customerName={customerName}
            onLogout={onLogout}
          />
        )}

        {/* Content */}
        <main className={cn(
          "flex-1 p-4",
          isMobile ? "pb-20" : "pb-6" // Space for bottom nav on mobile
        )}>
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={onTabChange}
        />
      )}
    </div>
  );
}
