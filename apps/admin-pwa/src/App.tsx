import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { StoreLayout } from './layouts/StoreLayout';
import { MechanicLayout } from './layouts/MechanicLayout';
import { StoreDashboardPage } from './pages/StoreDashboardPage';
import { MechanicDashboardPage } from './pages/MechanicDashboardPage';
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

type UserRole = 'ADMIN' | 'STAFF' | null;

function App() {
  // TODO: Implementar lógica de autenticação real
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState('');
  const [currentStoreTab, setCurrentStoreTab] = useState('dashboard');
  const [currentMechanicTab, setCurrentMechanicTab] = useState('revisions');

  const handleLogin = async (email: string, password: string) => {
    // Simulação de login - SUBSTITUIR com API real
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email.includes('admin')) {
      setUserRole('ADMIN');
      setUserName('Admin Moria');
      setIsAuthenticated(true);
      return { success: true, role: 'ADMIN' as const };
    } else if (email.includes('mecanico')) {
      setUserRole('STAFF');
      setUserName('João Mecânico');
      setIsAuthenticated(true);
      return { success: true, role: 'STAFF' as const };
    }

    return { success: false };
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
    setCurrentStoreTab('dashboard');
    setCurrentMechanicTab('revisions');
  };

  const renderStoreContent = () => {
    switch (currentStoreTab) {
      case 'dashboard':
        return <StoreDashboardPage />;
      case 'orders':
      case 'products':
      case 'reports':
      case 'more':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStoreTab.charAt(0).toUpperCase() + currentStoreTab.slice(1)}
            </h2>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        );
      default:
        return <StoreDashboardPage />;
    }
  };

  const renderMechanicContent = () => {
    switch (currentMechanicTab) {
      case 'revisions':
        return <MechanicDashboardPage />;
      case 'schedule':
      case 'new-os':
      case 'notifications':
      case 'profile':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentMechanicTab === 'new-os' ? 'Nova Ordem de Serviço' :
               currentMechanicTab.charAt(0).toUpperCase() + currentMechanicTab.slice(1)}
            </h2>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        );
      default:
        return <MechanicDashboardPage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={userRole === 'ADMIN' ? '/store-panel' : '/mechanic-panel'} replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />

          {/* Store Panel Route (Admin) */}
          <Route
            path="/store-panel"
            element={
              isAuthenticated && userRole === 'ADMIN' ? (
                <StoreLayout
                  currentTab={currentStoreTab}
                  onTabChange={setCurrentStoreTab}
                  adminName={userName}
                  onLogout={handleLogout}
                >
                  {renderStoreContent()}
                </StoreLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Mechanic Panel Route (Staff) */}
          <Route
            path="/mechanic-panel"
            element={
              isAuthenticated && userRole === 'STAFF' ? (
                <MechanicLayout
                  currentTab={currentMechanicTab}
                  onTabChange={setCurrentMechanicTab}
                  mechanicName={userName}
                  onLogout={handleLogout}
                >
                  {renderMechanicContent()}
                </MechanicLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Default Route */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? userRole === 'ADMIN'
                      ? '/store-panel'
                      : '/mechanic-panel'
                    : '/login'
                }
                replace
              />
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
