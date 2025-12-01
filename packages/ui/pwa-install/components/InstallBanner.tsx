import React, { useState } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { IOSInstructions } from './IOSInstructions';

interface InstallBannerProps {
  appName: string;
  variant: 'mechanic' | 'customer';
  compact?: boolean;
}

export function InstallBanner({ appName, variant, compact = false }: InstallBannerProps) {
  const { deviceInfo, shouldShowPrompt, isInstallable, handleInstall, handleDismiss } =
    usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // DEBUG: Log detalhado
  console.log('🎯 [InstallBanner] Renderizando', {
    shouldShowPrompt,
    isInstallable,
    platform: deviceInfo.platform,
    isStandalone: deviceInfo.isStandalone,
  });

  if (!shouldShowPrompt) {
    console.log('❌ [InstallBanner] Ocultado - shouldShowPrompt=false', {
      isStandalone: deviceInfo.isStandalone,
      reason: deviceInfo.isStandalone ? 'Já instalado' : 'Dismissado pelo usuário',
    });
    return null;
  }

  const themeColor = variant === 'mechanic' ? 'blue' : 'green';
  const gradientBg = variant === 'mechanic'
    ? 'from-blue-500 to-blue-600'
    : 'from-green-500 to-green-600';
  const borderColor = variant === 'mechanic' ? 'border-blue-200' : 'border-green-200';
  const bgFrom = variant === 'mechanic' ? 'from-blue-50' : 'from-green-50';
  const iconBg = variant === 'mechanic' ? 'bg-blue-600' : 'bg-green-600';
  const buttonBg = variant === 'mechanic'
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-green-600 hover:bg-green-700';

  const isAndroid = deviceInfo.platform === 'android';
  const isIOS = deviceInfo.platform === 'ios';
  const isDesktop = deviceInfo.platform === 'desktop';

  const handleClick = async () => {
    console.log('[InstallBanner] Click detectado', {
      platform: deviceInfo.platform,
      isInstallable,
      isAndroid,
      isIOS,
      isDesktop,
    });

    // Android - tentar instalação nativa
    if (isAndroid) {
      if (isInstallable) {
        console.log('[InstallBanner] Tentando instalar via prompt nativo (Android)');
        const success = await handleInstall();
        if (!success) {
          console.log('[InstallBanner] Instalação falhou ou cancelada, mostrando instruções');
          setShowIOSInstructions(true);
        }
      } else {
        console.log('[InstallBanner] beforeinstallprompt não disponível, mostrando instruções');
        setShowIOSInstructions(true);
      }
    }
    // iOS sempre mostra instruções
    else if (isIOS) {
      console.log('[InstallBanner] iOS detectado, mostrando instruções');
      setShowIOSInstructions(true);
    }
    // Desktop (Chrome/Edge)
    else if (isDesktop) {
      if (isInstallable) {
        console.log('[InstallBanner] Tentando instalar via prompt nativo (Desktop)');
        const success = await handleInstall();
        if (!success) {
          console.log('[InstallBanner] Instalação falhou ou cancelada, mostrando instruções');
          setShowIOSInstructions(true);
        }
      } else {
        console.log('[InstallBanner] beforeinstallprompt não disponível, mostrando instruções');
        setShowIOSInstructions(true);
      }
    }
    // Qualquer outra plataforma mostra instruções
    else {
      console.log('[InstallBanner] Plataforma desconhecida, mostrando instruções');
      setShowIOSInstructions(true);
    }
  };

  if (compact) {
    // Versão compacta para dentro do painel
    return (
      <>
        <div className={`bg-gradient-to-r ${gradientBg} text-white px-4 py-3 flex items-center justify-between shadow-md animate-slide-down`}>
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">
                Instale o app para acesso rápido
              </p>
              {isIOS && (
                <p className="text-xs text-white/80 flex items-center gap-1">
                  Toque em Compartilhar <Share className="inline w-3 h-3" />
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClick}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              type="button"
            >
              {isAndroid ? 'Instalar' : 'Como fazer'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white p-1 transition-colors"
              aria-label="Fechar"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal iOS */}
        {showIOSInstructions && (
          <IOSInstructions
            appName={appName}
            variant={variant}
            onClose={() => setShowIOSInstructions(false)}
          />
        )}
      </>
    );
  }

  // Versão expandida para página de login
  return (
    <>
      <div className={`bg-gradient-to-br ${bgFrom} to-white border-2 ${borderColor} rounded-xl p-4 flex items-center gap-4 shadow-lg animate-slide-up`}>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Smartphone className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            Instale o app {appName}
          </h4>
          <p className="text-sm text-gray-600">
            {isAndroid && 'Acesso rápido e funciona offline'}
            {isIOS && 'Adicione à tela inicial para acesso rápido'}
            {isDesktop && 'Instale no seu computador para acesso rápido'}
            {!isAndroid && !isIOS && !isDesktop && 'Acesso rápido direto da área de trabalho'}
          </p>
        </div>

        <button
          onClick={handleClick}
          className={`${buttonBg} text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors`}
          type="button"
        >
          <Download className="w-4 h-4" />
          {(isAndroid || isDesktop) && isInstallable ? 'Instalar' : 'Ver como'}
        </button>

        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
          aria-label="Dispensar"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal iOS */}
      {showIOSInstructions && (
        <IOSInstructions
          appName={appName}
          variant={variant}
          onClose={() => setShowIOSInstructions(false)}
        />
      )}
    </>
  );
}
