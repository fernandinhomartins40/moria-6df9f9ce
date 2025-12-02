import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, Shield } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { InstallBanner } from "@moria/ui/pwa-install";

export function AdminLoginDialog() {
  const { login, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || "Erro ao fazer login");
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: result.error || "Erro ao fazer login. Verifique suas credenciais.",
      });
    } else {
      // Login bem-sucedido, navegar para o painel apropriado baseado no role
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao painel administrativo.",
      });
      // Redireciona para a rota apropriada baseada no role do usuário
      navigate(result.redirectTo || "/store-panel");
    }
  };

  const handleAutoFill = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <InstallBanner appName="Moria Admin" variant="store" />

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Painel Administrativo
            </h1>
            <p className="text-gray-600">
              Faça login para acessar o painel do lojista
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@moria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar no Painel
                </>
              )}
            </Button>
          </form>

          {/* Credentials hint for testing */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Acesso rápido para testes:
            </p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-9"
                onClick={() => handleAutoFill("admin@moria.com", "Test123!")}
                disabled={isSubmitting}
              >
                <Shield className="mr-2 h-3 w-3" />
                Super Admin - Senha: Test123!
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-9"
                onClick={() => handleAutoFill("gerente@moria.com", "Test123!")}
                disabled={isSubmitting}
              >
                <Shield className="mr-2 h-3 w-3" />
                Gerente - Senha: Test123!
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-9"
                onClick={() => handleAutoFill("mecanico@moria.com", "Test123!")}
                disabled={isSubmitting}
              >
                <Shield className="mr-2 h-3 w-3" />
                Mecânico - Senha: Test123!
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Clique em um botão para preencher automaticamente
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2025 Moria Peças e Serviços
          </p>
        </div>
      </div>
    </div>
  );
}
