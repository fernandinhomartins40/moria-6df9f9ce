import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '@/config/supabase';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface SupabaseStatusProps {
  className?: string;
}

export function SupabaseStatus({ className = "" }: SupabaseStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          setStatus('connected');
          setErrorMessage('');
        } else {
          setStatus('error');
          setErrorMessage('Falha na conexão');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      }
    };

    checkConnection();
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          variant: 'secondary' as const,
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Verificando...',
          className: 'bg-gray-100 text-gray-600'
        };
      case 'connected':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Supabase Conectado',
          className: 'bg-green-100 text-green-800'
        };
      case 'error':
        return {
          variant: 'destructive' as const,
          icon: <AlertCircle className="h-3 w-3" />,
          text: `Erro: ${errorMessage}`,
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: null,
          text: 'Status desconhecido',
          className: 'bg-gray-100 text-gray-600'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1 text-xs`}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
}