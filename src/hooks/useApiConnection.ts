// Hook para inicializar la conexión con el backend

import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { apiService } from '../services/ApiService';

interface UseApiConnectionResult {
  isConnected: boolean;
  isChecking: boolean;
  retry: () => Promise<void>;
}

export const useApiConnection = (): UseApiConnectionResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const checkBackendConnection = useAuthStore(state => state.checkBackendConnection);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await checkBackendConnection();
      setIsConnected(connected);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return {
    isConnected,
    isChecking,
    retry: checkConnection,
  };
};

// Hook para verificar estado del backend
export const useBackendStatus = () => {
  const [status, setStatus] = useState<{
    isOnline: boolean;
    message: string;
    lastCheck: Date | null;
  }>({
    isOnline: false,
    message: 'Verificando...',
    lastCheck: null,
  });

  const checkStatus = async () => {
    try {
      const response = await apiService.healthCheck();
      if (response.data) {
        setStatus({
          isOnline: true,
          message: response.data.message,
          lastCheck: new Date(),
        });
      } else {
        setStatus({
          isOnline: false,
          message: response.error || 'Sin conexión',
          lastCheck: new Date(),
        });
      }
    } catch (error) {
      setStatus({
        isOnline: false,
        message: 'Error de conexión',
        lastCheck: new Date(),
      });
    }
  };

  useEffect(() => {
    checkStatus();
    // Verificar cada 30 segundos
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { ...status, refresh: checkStatus };
};
