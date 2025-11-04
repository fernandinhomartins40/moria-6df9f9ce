import { ReactNode } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminLoginDialog } from "./AdminLoginDialog";
import { Loader2 } from "lucide-react";

interface ProtectedAdminRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  minRole?: string;
}

export function ProtectedAdminRoute({
  children,
  requiredRole,
  minRole
}: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasMinRole } = useAdminAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login dialog
  if (!isAuthenticated) {
    return <AdminLoginDialog />;
  }

  // Check role-based permissions
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  if (minRole && !hasMinRole(minRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Permissão Insuficiente
          </h2>
          <p className="text-gray-600">
            Seu nível de acesso não é suficiente para visualizar esta página.
          </p>
        </div>
      </div>
    );
  }

  // If all checks pass, render children
  return <>{children}</>;
}
