import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { MechanicBottomNav, MechanicTab } from '../components/MechanicBottomNav';
import { MechanicSidebar } from '../components/MechanicSidebar';
import { useIsMobile } from '../hooks/useMediaQuery';
import { cn } from '../utils/cn';

interface MechanicLayoutProps {
  children: React.ReactNode;
  currentTab: MechanicTab | string;
  onTabChange: (tab: string) => void;
  mechanicName?: string;
  onLogout: () => void;
}

export function MechanicLayout({
  children,
  currentTab,
  onTabChange,
  mechanicName = 'Mecânico',
  onLogout
}: MechanicLayoutProps) {
  const isMobile = useIsMobile();
  const [notificationCount] = React.useState(3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile */}
      {isMobile && (
        <header
          className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border-2 border-white/30">
                  <span className="font-bold text-lg">{mechanicName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold">Painel do Mecânico</h1>
                  <p className="text-sm text-blue-100">{mechanicName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  type="button"
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Painel do Mecânico</h1>
                <p className="text-sm text-gray-500">Bem-vindo, {mechanicName}</p>
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
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar - Desktop Only */}
        {!isMobile && (
          <MechanicSidebar
            currentTab={currentTab}
            onTabChange={onTabChange}
            mechanicName={mechanicName}
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
        <MechanicBottomNav
          currentTab={currentTab as MechanicTab}
          onTabChange={(tab) => onTabChange(tab)}
          notificationCount={notificationCount}
        />
      )}
    </div>
  );
}
