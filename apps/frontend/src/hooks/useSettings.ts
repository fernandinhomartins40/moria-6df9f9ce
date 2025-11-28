import { useState, useEffect } from 'react';
import settingsService, { StoreSettings, UpdateSettingsData } from '@/api/settingsService';
import { handleApiError } from '@/api';
import { useToast } from '@/hooks/use-toast';

interface UseSettingsResult {
  settings: StoreSettings | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: UpdateSettingsData) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettings = (): UseSettingsResult => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      toast({
        title: 'Erro ao carregar configurações',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (data: UpdateSettingsData) => {
    setUpdateLoading(true);

    try {
      const updated = await settingsService.updateSettings(data);
      setSettings(updated);
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações da loja foram atualizadas com sucesso.',
      });
    } catch (err) {
      const apiError = handleApiError(err);
      toast({
        title: 'Erro ao atualizar configurações',
        description: apiError.message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };

  const resetSettings = async () => {
    setUpdateLoading(true);

    try {
      const reset = await settingsService.resetSettings();
      setSettings(reset);
      toast({
        title: 'Configurações resetadas',
        description: 'As configurações foram restauradas para os valores padrão.',
      });
    } catch (err) {
      const apiError = handleApiError(err);
      toast({
        title: 'Erro ao resetar configurações',
        description: apiError.message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateLoading,
    fetchSettings,
    updateSettings,
    resetSettings,
  };
};
