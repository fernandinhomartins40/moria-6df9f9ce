import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import apiClient from "../api/apiClient";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissions?: string[];
}

interface AdminAuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AdminAuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: string | string[]) => boolean;
  hasMinRole: (minRole: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Role hierarchy for permission checking
const roleHierarchy = {
  'STAFF': 1,
  'MANAGER': 2,
  'ADMIN': 3,
  'SUPER_ADMIN': 4,
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({
    admin: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Skip admin auth initialization on customer routes
    const isCustomerRoute = !window.location.pathname.startsWith('/store-panel') &&
                           !window.location.pathname.startsWith('/admin');

    if (isCustomerRoute) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Check for existing admin session (cookie-based)
    const initializeAuth = async () => {
      try {
        // Try to get admin profile using the httpOnly cookie
        const response = await apiClient.get('/auth/admin/profile');

        setState({
          admin: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // If cookie is invalid/missing, admin is not authenticated
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await apiClient.post('/auth/admin/login', { email, password });
      const data = response.data;

      // Save the token to localStorage for API calls
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
      }

      setState({
        admin: data.admin,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error.response?.data?.error || 'Erro ao conectar com o servidor';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Clear token from localStorage
      localStorage.removeItem('admin_token');

      // Call backend to clear httpOnly cookie
      await apiClient.post('/auth/admin/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setState({
        admin: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const hasRole = (roles: string | string[]) => {
    if (!state.admin) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.admin.role);
  };

  const hasMinRole = (minRole: string) => {
    if (!state.admin) return false;
    const userLevel = roleHierarchy[state.admin.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[minRole as keyof typeof roleHierarchy] || 999;
    return userLevel >= requiredLevel;
  };

  const contextValue: AdminAuthContextType = {
    admin: state.admin,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    hasRole,
    hasMinRole,
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
