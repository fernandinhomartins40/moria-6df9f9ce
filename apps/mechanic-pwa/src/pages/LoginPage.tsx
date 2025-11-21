import React, { useState } from 'react';
import { InstallCard, IOSInstructions, PWADebug } from '@moria/ui/pwa-install';
import '@moria/ui/pwa-install/styles/animations.css';
import { Wrench, Lock, User } from 'lucide-react';

export function LoginPage() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implementar lógica de login
      console.log('Login attempt:', { cpf, password });
      // await login({ cpf, password });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo e Título */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-lg mb-4">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Portal do Mecânico
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie ordens de serviço e atendimentos
          </p>
        </div>

        {/* Card de Instalação PWA - Android */}
        <InstallCard
          appName="Mecânico"
          appIcon="/icons/mechanic-192.png"
          variant="mechanic"
        />

        {/* Modal de Instruções - iOS */}
        <IOSInstructions
          appName="Moria Mecânico"
          variant="mechanic"
        />

        {/* Formulário de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                CPF ou E-mail
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline w-4 h-4 mr-1" />
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <a href="#" className="text-sm text-blue-600 hover:underline block">
              Esqueci minha senha
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 block">
              Primeiro acesso? Cadastre-se
            </a>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Ao entrar, você concorda com nossos Termos de Uso
          </p>
          <p className="text-xs text-gray-400">
            Versão 1.0.0 • Moria Pesca e Serviços
          </p>
        </div>
      </div>

      {/* Debug em desenvolvimento */}
      <PWADebug />
    </div>
  );
}
