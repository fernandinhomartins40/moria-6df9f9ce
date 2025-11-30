import { Home, Package, Car, Heart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomNavItem {
  id: string;
  label: string;
  icon: typeof Home;
}

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onMenuClick: () => void;
}

export function BottomNavigation({
  currentTab,
  onTabChange,
  onMenuClick,
}: BottomNavigationProps) {
  const navItems: BottomNavItem[] = [
    { id: "dashboard", label: "Início", icon: Home },
    { id: "orders", label: "Pedidos", icon: Package },
    { id: "vehicles", label: "Veículos", icon: Car },
    { id: "favorites", label: "Favoritos", icon: Heart },
    { id: "menu", label: "Mais", icon: Menu },
  ];

  const handleClick = (itemId: string) => {
    if (itemId === "menu") {
      onMenuClick();
    } else {
      onTabChange(itemId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors touch-manipulation",
                isActive
                  ? "text-moria-orange"
                  : "text-gray-500 hover:text-gray-700 active:bg-gray-50"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
