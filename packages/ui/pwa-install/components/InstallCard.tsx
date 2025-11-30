import React, { useState } from 'react';
import { Download, Smartphone, X, Share2 } from 'lucide-react';
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
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Mostrar para todos os dispositivos que podem instalar (Android, iOS e Desktop)
  if (!shouldShowPrompt) {
    return null;
  }

  const isIOS = deviceInfo.platform === 'ios';
  const isAndroid = deviceInfo.platform === 'android';
  const isDesktop = deviceInfo.platform === 'desktop';

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
            {isIOS ? '📱 ' : '⚡ '}Instale o App {appName}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isIOS
              ? 'Adicione à tela de início para acesso rápido e experiência nativa'
              : 'Acesso rápido, funciona offline e notificações em tempo real'
            }
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
            onClick={isIOS ? () => setShowIOSInstructions(true) : handleInstall}
            disabled={isAndroid && !isInstallable}
            className={`w-full flex items-center justify-center gap-2 ${buttonBg} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            type="button"
          >
            {isIOS ? (
              <>
                <Share2 className="w-5 h-5" />
                Ver como instalar
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {isInstallable ? 'Instalar Agora' : 'Instalando...'}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            Grátis • Sem anúncios • Seguro
          </p>
        </div>
      </div>

      {/* Modal de instruções iOS */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowIOSInstructions(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Como instalar no iOS
            </h3>
            <ol className="space-y-3 text-sm text-gray-700 mb-6">
              <li className="flex gap-3">
                <span className={`flex-shrink-0 w-6 h-6 ${variant === 'customer' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center font-bold text-xs`}>
                  1
                </span>
                <span>
                  Toque no botão <strong>Compartilhar</strong> <Share2 className="inline w-4 h-4" /> na parte inferior do Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className={`flex-shrink-0 w-6 h-6 ${variant === 'customer' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center font-bold text-xs`}>
                  2
                </span>
                <span>
                  Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className={`flex-shrink-0 w-6 h-6 ${variant === 'customer' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center font-bold text-xs`}>
                  3
                </span>
                <span>
                  Toque em <strong>"Adicionar"</strong> no canto superior direito
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className={`w-full ${buttonBg} text-white py-3 rounded-lg font-semibold transition-colors`}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
