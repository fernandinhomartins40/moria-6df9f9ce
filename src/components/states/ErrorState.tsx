// Componente de Error robusto com ações de recuperação
import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorStateProps {
  error?: Error | string | null;
  title?: string;
  message?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  onReset?: () => void;
  onGoHome?: () => void;
  retryLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = 'Oops! Algo deu errado',
  message,
  showDetails = false,
  onRetry,
  onReset,
  onGoHome,
  retryLabel = 'Tentar novamente',
  className = '',
  size = 'md'
}) => {
  const errorMessage = error instanceof Error ? error.message : String(error || '');
  const finalMessage = message || errorMessage || 'Ocorreu um erro inesperado.';

  const isCircuitBreakerError = error instanceof Error && 
    (error as any).isCircuitBreakerError;

  const isDevelopment = import.meta.env.NODE_ENV === 'development';

  const sizeClasses = {
    sm: { icon: 'w-8 h-8', title: 'text-lg', text: 'text-sm', spacing: 'p-4' },
    md: { icon: 'w-12 h-12', title: 'text-xl', text: 'text-base', spacing: 'p-6' },
    lg: { icon: 'w-16 h-16', title: 'text-2xl', text: 'text-lg', spacing: 'p-8' }
  };

  const classes = sizeClasses[size];

  // Determinar cor baseada no tipo de erro
  const getErrorColor = () => {
    if (isCircuitBreakerError) return 'text-orange-500';
    if (errorMessage.includes('404')) return 'text-blue-500';
    if (errorMessage.includes('403')) return 'text-purple-500';
    return 'text-red-500';
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${classes.spacing} ${className}`}>
      <AlertTriangle className={`${classes.icon} ${getErrorColor()} mb-4`} />
      
      <h3 className={`font-semibold mb-2 ${classes.title} text-gray-800`}>
        {title}
      </h3>
      
      <p className={`${classes.text} text-gray-600 mb-6 max-w-md`}>
        {finalMessage}
      </p>

      {/* Mensagens específicas para tipos de erro */}
      {isCircuitBreakerError && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 max-w-md">
          <p className="text-orange-800 text-sm">
            🔌 Serviço temporariamente indisponível. O sistema está se recuperando automaticamente.
          </p>
        </div>
      )}

      {/* Detalhes técnicos (desenvolvimento) */}
      {showDetails && isDevelopment && error && (
        <details className="mb-6 text-left max-w-md w-full">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Bug className="w-4 h-4" />
            Detalhes técnicos
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded border text-xs font-mono">
            {error instanceof Error ? (
              <>
                <div><strong>Erro:</strong> {error.message}</div>
                {error.stack && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div>{String(error)}</div>
            )}
          </div>
        </details>
      )}

      {/* Ações */}
      <div className="flex flex-wrap gap-2 justify-center">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="default"
            size={size}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </Button>
        )}
        
        {onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            size={size}
            className="flex items-center gap-2"
          >
            Limpar dados
          </Button>
        )}
        
        {onGoHome && (
          <Button
            onClick={onGoHome}
            variant="outline"
            size={size}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Início
          </Button>
        )}
      </div>
    </div>
  );
};

// Componente específico para erros de rede
export const NetworkErrorState: React.FC<Omit<ErrorStateProps, 'title' | 'message'> & {
  offline?: boolean;
}> = ({ offline = false, ...props }) => {
  return (
    <ErrorState
      {...props}
      title={offline ? "Você está offline" : "Problema de conexão"}
      message={offline ? 
        "Verifique sua conexão com a internet e tente novamente." :
        "Não foi possível conectar com o servidor. Verifique sua conexão."
      }
    />
  );
};

// Componente específico para dados não encontrados
export const NotFoundErrorState: React.FC<Omit<ErrorStateProps, 'title' | 'message'>> = (props) => {
  return (
    <ErrorState
      {...props}
      title="Não encontrado"
      message="O conteúdo que você está procurando não foi encontrado."
    />
  );
};

// Componente específico para acesso negado
export const AccessDeniedErrorState: React.FC<Omit<ErrorStateProps, 'title' | 'message'>> = (props) => {
  return (
    <ErrorState
      {...props}
      title="Acesso negado"
      message="Você não tem permissão para acessar este conteúdo."
    />
  );
};

export default ErrorState;