import React from 'react';
import { X, Share, Plus, Home } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface IOSInstructionsProps {
  appName: string;
  variant: 'mechanic' | 'customer';
  onClose?: () => void;
}

export function IOSInstructions({ appName, variant, onClose }: IOSInstructionsProps) {
  const { deviceInfo, shouldShowPrompt, handleDismiss } = usePWAInstall();

  if (!shouldShowPrompt || deviceInfo.platform !== 'ios') {
    return null;
  }

  const themeColor = variant === 'mechanic' ? 'blue' : 'green';
  const headerBg = variant === 'mechanic' ? 'bg-blue-600' : 'bg-green-600';
  const stepBg = variant === 'mechanic' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600';
  const buttonBg = variant === 'mechanic' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
  const iconColor = variant === 'mechanic' ? 'text-blue-600' : 'text-green-600';

  const handleClose = () => {
    handleDismiss();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className={`${headerBg} text-white p-6 relative`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Fechar"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
              <Home className={`w-8 h-8 ${iconColor}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Instalar {appName}</h2>
              <p className="text-sm text-white/90">Para iPhone e iPad</p>
            </div>
          </div>
        </div>

        {/* Instruções Passo a Passo */}
        <div className="p-6 space-y-6">
          <p className="text-gray-700">
            Siga os passos abaixo para adicionar o app na sua tela inicial:
          </p>

          {/* Passo 1 */}
          <div className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${stepBg} flex items-center justify-center font-bold`}>
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Toque no botão de Compartilhar
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Share className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-ping" />
                      <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mt-3">
                  Localizado na <strong>barra inferior</strong> do Safari
                </p>
              </div>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${stepBg} flex items-center justify-center font-bold`}>
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Role e selecione "Adicionar à Tela de Início"
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Adicionar à Tela de Início
                    </p>
                    <p className="text-xs text-gray-500">
                      Add to Home Screen
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${stepBg} flex items-center justify-center font-bold`}>
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Confirme tocando em "Adicionar"
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${headerBg} rounded-2xl`} />
                    <div className="flex-1">
                      <p className="font-medium">{appName}</p>
                      <p className="text-sm text-gray-500">moria.app</p>
                    </div>
                  </div>
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium" type="button">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 4 - Pronto! */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Pronto! 🎉
              </h3>
              <p className="text-gray-600">
                O ícone do {appName} agora está na sua tela inicial.
                Toque nele para abrir como um app.
              </p>
            </div>
          </div>

          {/* Botão de Fechar */}
          <button
            onClick={handleClose}
            className={`w-full ${buttonBg} text-white font-semibold py-4 rounded-lg transition-all duration-200`}
            type="button"
          >
            Entendi
          </button>

          <p className="text-xs text-gray-500 text-center">
            Você pode ver estas instruções novamente a qualquer momento
          </p>
        </div>
      </div>
    </div>
  );
}
