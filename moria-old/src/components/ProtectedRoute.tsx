import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { customer, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Se não está carregando e não está autenticado, mostrar tela de login após 1 segundo
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => setShowLogin(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  // Ainda carregando
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moria-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    if (showLogin) {
      return <Navigate to={`/?login=true&redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moria-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verificar se requer admin
  if (requireAdmin && customer?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Você não tem permissões de administrador para acessar esta área.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Usuário atual: <strong>{customer?.name}</strong> ({customer?.role})
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-moria-orange text-white px-6 py-2 rounded-lg hover:bg-moria-orange/90 transition-colors"
            >
              Voltar ao Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Autenticado e autorizado
  return <>{children}</>;
}