import React from 'react';
import { cn } from '../../lib/utils';
import type { NavItem } from './StoreLayout';

interface StoreBottomNavigationProps {
  items: NavItem[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  onMenuClick: () => void;
}

export default function StoreBottomNavigation({
  items,
  currentTab,
  onTabChange,
  onMenuClick,
}: StoreBottomNavigationProps) {
  const handleClick = (itemId: string) => {
    if (itemId === 'menu') {
      onMenuClick();
    } else {
      onTabChange(itemId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors touch-manipulation',
                'min-h-[44px] min-w-[44px]',
                isActive
                  ? 'text-moria-orange'
                  : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-all',
                  isActive && 'stroke-[2.5]'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium transition-all',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area padding for iOS home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
