import React from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { IconSVG } from './IconSVG';

interface InstallCardProps {
  appName: string;
  appIcon?: string;
  variant: 'mechanic' | 'customer';
}

export function InstallCard({ appName, appIcon, variant }: InstallCardProps) {
  const { deviceInfo, shouldShowPrompt, isInstallable, handleInstall, handleDismiss } =
    usePWAInstall();

  if (!shouldShowPrompt || deviceInfo.platform !== 'android') {
    return null;
  }

  const themeColor = variant === 'mechanic' ? 'blue' : 'green';
  const bgGradient = variant === 'mechanic'
    ? 'from-blue-50 to-white border-blue-200'
    : 'from-green-50 to-white border-green-200';
  const iconBg = variant === 'mechanic' ? 'bg-blue-600' : 'bg-green-600';
  const buttonBg = variant === 'mechanic'
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-green-600 hover:bg-green-700';

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-br ${bgGradient} p-6 shadow-lg animate-slide-up`}>
      {/* Botão de fechar */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dispensar"
        type="button"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        {/* Ícone do App */}
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl shadow-md overflow-hidden">
          {appIcon ? (
            <img src={appIcon} alt={appName} className="w-16 h-16 object-cover" />
          ) : (
            <IconSVG variant={variant} size={64} />
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Instale o App {appName}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Acesso rápido, funciona offline e notificações em tempo real
          </p>

          {/* Benefícios */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-xs bg-white rounded-full px-3 py-1 text-gray-700 border border-gray-200">
              ⚡ Super rápido
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-white rounded-full px-3 py-1 text-gray-700 border border-gray-200">
              📱 Funciona offline
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-white rounded-full px-3 py-1 text-gray-700 border border-gray-200">
              🔔 Notificações
            </span>
          </div>

          {/* Botão de Instalação */}
          <button
            onClick={handleInstall}
            disabled={!isInstallable}
            className={`w-full flex items-center justify-center gap-2 ${buttonBg} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            type="button"
          >
            <Download className="w-5 h-5" />
            {isInstallable ? 'Instalar Agora' : 'Instalando...'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            Grátis • Sem anúncios • Seguro
          </p>
        </div>
      </div>
    </div>
  );
}
