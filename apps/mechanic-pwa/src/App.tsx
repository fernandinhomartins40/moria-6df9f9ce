import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
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
  // TODO: Implementar lógica de autenticação
  const isAuthenticated = false;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/mecanico/login" element={<LoginPage />} />

          <Route
            path="/mecanico/*"
            element={
              isAuthenticated ? (
                <DashboardLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Dashboard do Mecânico
                    </h2>
                    <p className="text-gray-600">
                      Conteúdo do painel será implementado aqui
                    </p>
                  </div>
                </DashboardLayout>
              ) : (
                <Navigate to="/mecanico/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/mecanico/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
