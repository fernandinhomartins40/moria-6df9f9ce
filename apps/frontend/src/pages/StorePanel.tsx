import { useState } from "react";
import { Sidebar } from "../components/admin/Sidebar";
import { AdminContent } from "../components/admin/AdminContent";
import { ProtectedAdminRoute } from "../components/admin/ProtectedAdminRoute";
import "../styles/lojista.css";

export default function StorePanel() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <ProtectedAdminRoute>
      <div className="lojista-layout">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

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

          <AdminContent activeTab={activeTab} />
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}

function getPageTitle(tab: string): string {
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    orders: "Pedidos",
    quotes: "Orçamentos",
    revisions: "Revisões Veiculares",
    customers: "Clientes",
    products: "Produtos",
    services: "Serviços",
    coupons: "Cupons",
    promotions: "Promoções",
    reports: "Relatórios",
    users: "Gestão de Usuários",
    settings: "Configurações"
  };
  return titles[tab] || "Dashboard";
}

function getPageDescription(tab: string): string {
  const descriptions: Record<string, string> = {
    dashboard: "Visão geral dos pedidos e métricas da loja",
    orders: "Gerencie todos os pedidos com produtos",
    quotes: "Gerencie todas as solicitações de orçamento para serviços",
    revisions: "Gerencie revisões veiculares com checklist completo",
    customers: "Visualize os clientes cadastrados automaticamente",
    products: "Gerencie o catálogo e estoque de produtos",
    services: "Cadastre e gerencie os serviços oferecidos",
    coupons: "Crie e gerencie cupons de desconto para os clientes",
    promotions: "Configure ofertas especiais e campanhas",
    reports: "Relatórios de vendas e análises detalhadas",
    users: "Gerencie usuários administrativos, mecânicos e permissões do sistema",
    settings: "Configurações do sistema e preferências"
  };
  return descriptions[tab] || "Painel administrativo da Moria Peças e Serviços";
}
