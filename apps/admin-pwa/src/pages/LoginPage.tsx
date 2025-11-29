import React, { useState } from 'react';
import { Shield, LogIn, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; role?: 'ADMIN' | 'STAFF' }>;
}

// Componente de Banner de Instalação PWA
function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  React.useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShowBanner(false);
      return;
    }

    // Listener para evento de instalação (Android/Chrome)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Guardar preferência por 7 dias
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl p-4 shadow-lg mb-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">
              {isIOS ? '📱 Instale o App' : '⚡ Instale o App'}
            </h3>
            <p className="text-xs text-white/90 mb-3">
              {isIOS
                ? 'Acesse offline e receba notificações. Toque no botão de compartilhar ↗️'
                : 'Acesso rápido, trabalhe offline e receba notificações'
              }
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
              >
                {isIOS ? 'Ver como instalar' : 'Instalar agora'}
              </button>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white px-3 py-2 text-sm"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de instruções iOS */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowIOSInstructions(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Como instalar no iOS</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <span>Toque no botão <strong>Compartilhar</strong> ↗️ (parte inferior do Safari)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await onLogin(email, password);

      if (!result.success) {
        setError('Email ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Banner de Instalação PWA */}
        <PWAInstallBanner />

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-blue-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Painel Administrativo
            </h1>
            <p className="text-gray-600">
              Faça login para acessar o sistema
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Esqueceu sua senha?{' '}
              <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                Recuperar acesso
              </a>
            </p>
          </div>

          {/* Dev Hints */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">💡 Dica de Desenvolvimento:</p>
            <p className="text-xs text-gray-600">
              Lojista: admin@moria.com / Mecânico: mecanico@moria.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
