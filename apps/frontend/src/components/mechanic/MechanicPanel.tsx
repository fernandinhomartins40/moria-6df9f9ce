import { useState } from "react";
import { ClipboardCheck, Settings } from "lucide-react";
import { MechanicSidebar } from "./MechanicSidebar";
import { MechanicContent } from "./MechanicContent";
import StoreLayout from "../store/StoreLayout";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import "../../styles/lojista.css";
import "../../styles/store.css";
import "../../styles/store-mobile.css";
import "../../styles/store-animations.css";

export default function MechanicPanel() {
  const [activeTab, setActiveTab] = useState("revisions");
  const { admin, logout } = useAdminAuth();

  // Bottom Navigation Items (2 abas - layout simples)
  const bottomNavItems = [
    { id: "revisions", label: "Revisões", icon: ClipboardCheck },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  // Drawer Items (vazio para mecânico, tudo está no bottom nav)
  const drawerItems: any[] = [];

  return (
    <StoreLayout
      currentTab={activeTab}
      onTabChange={setActiveTab}
      bottomNavItems={bottomNavItems}
      drawerItems={drawerItems}
      adminName={admin?.name}
      adminEmail={admin?.email}
      variant="mechanic"
      onLogout={logout}
    >
      {/* Header com título e descrição (apenas desktop, mobile tem StoreHeader) */}
      <div className="lojista-header desktop-only">
        <div>
          <h1 className="lojista-title">
            {getPageTitle(activeTab)}
          </h1>
          <p className="lojista-subtitle">
            {getPageDescription(activeTab)}
          </p>
        </div>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="lojista-fade-in">
        <MechanicContent activeTab={activeTab} />
      </div>
    </StoreLayout>
  );
}

function getPageTitle(tab: string): string {
  const titles: Record<string, string> = {
    revisions: "Minhas Revisões",
    settings: "Configurações"
  };
  return titles[tab] || "Minhas Revisões";
}

function getPageDescription(tab: string): string {
  const descriptions: Record<string, string> = {
    revisions: "Gerencie suas revisões atribuídas e acompanhe o progresso",
    settings: "Configurações do seu perfil e preferências"
  };
  return descriptions[tab] || "Painel do mecânico da Moria Peças e Serviços";
}
