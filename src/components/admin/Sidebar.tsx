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
  Wrench
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pedidos", icon: ShoppingCart },
  { id: "quotes", label: "Orçamentos", icon: FileText },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "products", label: "Produtos", icon: Package },
  { id: "services", label: "Serviços", icon: Wrench },
  { id: "promotions", label: "Promoções", icon: TrendingUp },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
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
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-red-400",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => {
            // Implementar logout se necessário
            window.location.href = '/';
          }}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </div>
  );
}