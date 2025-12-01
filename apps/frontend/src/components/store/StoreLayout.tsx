import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { useStandaloneMode } from '../../hooks/useStandaloneMode';
import StoreBottomNavigation from './StoreBottomNavigation';
import StoreMobileDrawer from './StoreMobileDrawer';
import StoreHeader from './StoreHeader';
import Sidebar from '../admin/Sidebar';
import { cn } from '../../lib/utils';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPermission?: string;
}

interface StoreLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  bottomNavItems: NavItem[];
  drawerItems: NavItem[];
  adminName?: string;
  adminEmail?: string;
  variant?: 'admin' | 'mechanic';
  onLogout?: () => void;
}

export default function StoreLayout({
  children,
  currentTab,
  onTabChange,
  bottomNavItems,
  drawerItems,
  adminName,
  adminEmail,
  variant = 'admin',
  onLogout,
}: StoreLayoutProps) {
  const isMobile = useIsMobile();
  const { isStandalone } = useStandaloneMode();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Usa layout mobile se for PWA instalado OU tela pequena
  const useMobileLayout = isStandalone || isMobile;

  const handleMenuClick = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleDrawerItemClick = (tabId: string) => {
    onTabChange(tabId);
    setIsDrawerOpen(false);
  };

  // Layout Mobile
  if (useMobileLayout) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header Mobile */}
        <StoreHeader
          title={variant === 'admin' ? 'Moria Admin' : 'Moria Mecânico'}
          variant={variant}
        />

        {/* Conteúdo */}
        <div className="px-4 py-4 safe-area-top">
          {children}
        </div>

        {/* Bottom Navigation */}
        <StoreBottomNavigation
          items={bottomNavItems}
          currentTab={currentTab}
          onTabChange={onTabChange}
          onMenuClick={handleMenuClick}
        />

        {/* Mobile Drawer */}
        <StoreMobileDrawer
          open={isDrawerOpen}
          onClose={handleDrawerClose}
          items={drawerItems}
          currentTab={currentTab}
          onTabChange={handleDrawerItemClick}
          adminName={adminName}
          adminEmail={adminEmail}
          variant={variant}
          onLogout={onLogout}
        />
      </div>
    );
  }

  // Layout Desktop (mantém o layout original)
  return (
    <div className="lojista-layout">
      <Sidebar
        activeTab={currentTab}
        onTabChange={onTabChange}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
