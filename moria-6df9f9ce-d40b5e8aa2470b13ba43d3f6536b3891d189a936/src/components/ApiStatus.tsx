import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import api from '../services/api.js';

interface ApiStatusProps {
  className?: string;
}

type Status = 'checking' | 'online' | 'offline';

export function ApiStatus({ className = '' }: ApiStatusProps) {
  const [status, setStatus] = useState<Status>('checking');
  const [message, setMessage] = useState('Verificando conexão...');

  const checkApiStatus = async () => {
    try {
      setStatus('checking');
      setMessage('Verificando conexão com a API...');
      
      const response = await api.healthCheck();
      
      if (response && response.success) {
        setStatus('online');
        setMessage('API conectada e funcionando');
      } else {
        setStatus('offline');
        setMessage('API respondeu mas com erro');
      }
    } catch (error) {
      setStatus('offline');
      setMessage(`Erro de conexão: ${error.message || 'API não disponível'}`);
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (status) {
      case 'checking':
        return <AlertTriangle className="h-4 w-4 animate-pulse" />;
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'checking':
        return 'default';
      case 'online':
        return 'default';
      case 'offline':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Só mostrar se houver problema ou estiver checando
  if (status === 'online') {
    return null;
  }

  return (
    <Alert variant={getVariant()} className={`${className} mb-4`}>
      {getIcon()}
      <AlertDescription className="ml-2">
        <strong>Status da API:</strong> {message}
        {status === 'offline' && (
          <button
            onClick={checkApiStatus}
            className="ml-2 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default ApiStatus;