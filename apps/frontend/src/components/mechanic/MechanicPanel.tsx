import { useState } from "react";
import { MechanicSidebar } from "./MechanicSidebar";
import { MechanicContent } from "./MechanicContent";
import "../../styles/lojista.css";

export default function MechanicPanel() {
  const [activeTab, setActiveTab] = useState("revisions");

  return (
    <div className="lojista-layout">
      <MechanicSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="lojista-content lojista-fade-in">
        <div className="lojista-header">
          <div>
            <h1 className="lojista-title">
              {getPageTitle(activeTab)}
            </h1>
            <p className="lojista-subtitle">
              {getPageDescription(activeTab)}
            </p>
          </div>
        </div>

        <MechanicContent activeTab={activeTab} />
      </main>
    </div>
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
