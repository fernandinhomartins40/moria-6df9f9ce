import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { CustomerLayout } from './layouts/CustomerLayout';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomerTab } from './components/BottomNav';
import '@moria/ui/pwa-install/styles/animations.css';
import './styles/index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  // TODO: Implementar lógica de autenticação real
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Temporário para desenvolvimento
  const [currentTab, setCurrentTab] = useState<CustomerTab>('dashboard');
  const [customerName] = useState('João Silva');

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'orders':
        return <OrdersPage />;
      case 'vehicles':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Meus Veículos</h2>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        );
      case 'favorites':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Favoritos</h2>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        );
      case 'profile':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Meu Perfil</h2>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/cliente/login" element={<LoginPage />} />

          <Route
            path="/cliente"
            element={
              isAuthenticated ? (
                <CustomerLayout
                  currentTab={currentTab}
                  onTabChange={setCurrentTab}
                  customerName={customerName}
                  onLogout={handleLogout}
                >
                  {renderContent()}
                </CustomerLayout>
              ) : (
                <Navigate to="/cliente/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/cliente" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
