import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Wrench,
  Gift,
  ClipboardCheck,
  User,
  UserCog,
  Palette
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pedidos", icon: ShoppingCart },
  { id: "quotes", label: "Orçamentos", icon: FileText },
  { id: "revisions", label: "Revisões", icon: ClipboardCheck },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "products", label: "Produtos", icon: Package },
  { id: "services", label: "Serviços", icon: Wrench },
  { id: "coupons", label: "Cupons", icon: Gift },
  { id: "promotions", label: "Promoções", icon: TrendingUp },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "users", label: "Usuários", icon: UserCog, requiresPermission: 'canManageAdmins' },
  { id: "landing-page", label: "Landing Page", icon: Palette, isExternal: true, href: "/admin/landing-page" },
  { id: "settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { admin, logout } = useAdminAuth();
  const permissions = useAdminPermissions();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn(
      "bg-moria-black text-white transition-all duration-300 flex flex-col h-screen",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
            {!isCollapsed ? (
              <>
                <img 
                  src="/logo_moria.png" 
                  alt="Moria" 
                  className="h-8 w-auto"
                />
                <div>
                  <h2 className="font-bold text-lg">Painel Lojista</h2>
                  <p className="text-xs text-gray-400">Moria Peças & Serviços</p>
                </div>
              </>
            ) : (
              <img 
                src="/logo_moria.png" 
                alt="Moria" 
                className="h-8 w-auto"
              />
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Admin Info */}
      {!isCollapsed && admin && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-moria-orange rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin.name}</p>
              <p className="text-xs text-gray-400 truncate">{admin.role.replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          // Filter menu items by permissions
          if (item.requiresPermission && !(permissions as any)[item.requiresPermission]) {
            return null;
          }

          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          // External link (Landing Page Editor)
          if ((item as any).isExternal) {
            return (
              <Link
                key={item.id}
                to={(item as any).href}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 text-left",
                  isActive
                    ? "bg-moria-orange text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}

                {isActive && !isCollapsed && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                )}
              </Link>
            );
          }

          // Internal tab button
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 text-left",
                isActive
                  ? "bg-moria-orange text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                isCollapsed && "justify-center px-2"
              )}
            >
              <IconComponent className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}

              {isActive && !isCollapsed && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link to="/">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Voltar ao Site</span>}
          </Button>
        </Link>

        <Link to="/admin/landing-page">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Palette className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Editor da Landing Page</span>}
          </Button>
        </Link>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-red-400",
            isCollapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </div>
  );
}
