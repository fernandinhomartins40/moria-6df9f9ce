/**
 * Hook para gerenciar configuração da Landing Page
 * Padrão Ferraco adaptado para Moria
 *
 * Features:
 * - Estratégia Backend → LocalStorage → Defaults
 * - Auto-save inteligente (5 min, não na inicialização)
 * - Deep merge com defaults
 * - Logging detalhado
 * - Atalhos de teclado
 * - Alerta de alterações não salvas
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { LandingPageConfig } from '@/types/landingPage';
import { getDefaultConfig } from '@/utils/landingPageDefaults';
import { toast } from 'sonner';

// Configurações
const STORAGE_KEY = 'moria_landing_page_config';
const AUTO_SAVE_DELAY = 5 * 60 * 1000; // 5 minutos
const ENABLE_AUTO_SAVE = true;
const ENABLE_LOGGING = true;

// Helper: Log
const log = (message: string, data?: any) => {
  if (!ENABLE_LOGGING) return;
  const timestamp = new Date().toISOString();
  console.log(`[LandingPageConfig] ${timestamp} - ${message}`, data || '');
};

// Helper: Deep merge
const deepMerge = (target: any, source: any): any => {
  if (!source) return target;
  if (!target) return source;

  const output = { ...target };

  for (const key in source) {
    if (Array.isArray(source[key])) {
      output[key] = source[key] || [];
    } else if (typeof source[key] === 'object' && source[key] !== null) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      output[key] = source[key];
    }
  }

  return output;
};

export interface UseLandingPageConfigResult {
  config: LandingPageConfig;
  loading: boolean;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  updateConfig: (section: keyof LandingPageConfig, data: any) => void;
  save: (isAutoSave?: boolean) => Promise<void>;
  reset: () => void;
  loadFromBackend: () => Promise<void>;
  exportConfig: () => void;
  importConfig: (configJson: string) => void;
}

export const useLandingPageConfig = (): UseLandingPageConfigResult => {
  const [config, setConfig] = useState<LandingPageConfig>(getDefaultConfig());
  const [loading, setLoading] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Refs para controle
  const hasLoadedInitially = useRef<boolean>(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // LOAD CONFIG (Backend → LocalStorage → Defaults)
  // ============================================================================

  const loadFromBackend = useCallback(async () => {
    try {
      log('🔄 Carregando configuração do backend...');
      setLoading(true);
      setError(null);

      const response = await fetch('/api/landing-page/config');

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const { success, data } = await response.json();

      if (!success || !data) {
        throw new Error('Resposta inválida do backend');
      }

      // Deep merge com defaults para garantir que arrays sempre existam
      const defaults = getDefaultConfig();
      const mergedConfig: LandingPageConfig = {
        version: data.version || defaults.version,
        lastModified: data.updatedAt || new Date().toISOString(),
        header: deepMerge(defaults.header, data.header),
        hero: deepMerge(defaults.hero, data.hero),
        marquee: deepMerge(defaults.marquee, data.marquee),
        about: deepMerge(defaults.about, data.about),
        products: deepMerge(defaults.products, data.products),
        services: deepMerge(defaults.services, data.services),
        contactPage: deepMerge(defaults.contactPage, data.contactPage),
        aboutPage: deepMerge(defaults.aboutPage, data.aboutPage),
        contact: deepMerge(defaults.contact, data.contact),
        footer: deepMerge(defaults.footer, data.footer),
      };

      setConfig(mergedConfig);

      // Salvar no localStorage como cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedConfig));

      log('✅ Configuração carregada do BACKEND', {
        hasHeader: !!mergedConfig.header,
        hasHero: !!mergedConfig.hero,
        hasFooter: !!mergedConfig.footer,
      });

      setLoading(false);
      hasLoadedInitially.current = true;

    } catch (err: any) {
      log('❌ Erro ao carregar do backend', { error: err.message });
      setError(err.message);

      // Fallback: tentar localStorage
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const cachedConfig = JSON.parse(cached);
          log('📦 Usando configuração do localStorage (cache)');
          setConfig(cachedConfig);

          // Tentar sincronizar com backend em background
          setTimeout(() => {
            log('🔄 Tentando sincronizar localStorage com backend...');
            fetch('/api/landing-page/config', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cachedConfig),
            }).catch(() => log('⚠️ Falha ao sincronizar'));
          }, 2000);
        } else {
          // Usar defaults
          log('🎨 Usando configuração padrão (defaults)');
          setConfig(getDefaultConfig());
        }
      } catch (storageErr) {
        log('❌ Erro ao acessar localStorage, usando defaults');
        setConfig(getDefaultConfig());
      }

      setLoading(false);
      hasLoadedInitially.current = true;
    }
  }, []);

  // ============================================================================
  // SAVE CONFIG (Backend + Histórico + LocalStorage)
  // ============================================================================

  const save = useCallback(async (isAutoSave: boolean = false) => {
    try {
      log(isAutoSave ? '💾 Auto-salvando...' : '💾 Salvando manualmente...');
      setIsSaving(true);
      setError(null);

      // 1. Salvar no backend
      const saveResponse = await fetch('/api/landing-page/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header: config.header,
          hero: config.hero,
          marquee: config.marquee,
          about: config.about,
          products: config.products,
          services: config.services,
          contactPage: config.contactPage,
          aboutPage: config.aboutPage,
          contact: config.contact,
          footer: config.footer,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error(`Erro ao salvar: ${saveResponse.statusText}`);
      }

      const { success, data } = await saveResponse.json();

      if (!success) {
        throw new Error('Falha ao salvar configuração');
      }

      // 2. Salvar no localStorage (cache)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      // 3. Salvar no histórico
      try {
        await fetch('/api/landing-page/config/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              header: config.header,
              hero: config.hero,
              marquee: config.marquee,
              about: config.about,
              products: config.products,
              services: config.services,
              contactPage: config.contactPage,
              aboutPage: config.aboutPage,
              contact: config.contact,
              footer: config.footer,
            },
            changeType: isAutoSave ? 'auto_save' : 'manual_save',
          }),
        });
        log('📜 Salvo no histórico');
      } catch (histErr) {
        log('⚠️ Erro ao salvar histórico (não crítico)', histErr);
      }

      setIsDirty(false);
      setIsSaving(false);

      if (!isAutoSave) {
        toast.success('Configuração salva com sucesso!');
      }

      log('✅ Configuração salva', { isAutoSave });

    } catch (err: any) {
      log('❌ Erro ao salvar', { error: err.message });
      setError(err.message);
      setIsSaving(false);

      if (!isAutoSave) {
        toast.error(`Erro ao salvar: ${err.message}`);
      }
    }
  }, [config]);

  // ============================================================================
  // UPDATE CONFIG
  // ============================================================================

  const updateConfig = useCallback((section: keyof LandingPageConfig, data: any) => {
    log(`📝 Atualizando seção: ${section}`);

    setConfig(prev => ({
      ...prev,
      [section]: data,
      lastModified: new Date().toISOString(),
    }));

    setIsDirty(true);
  }, []);

  // ============================================================================
  // RESET CONFIG
  // ============================================================================

  const reset = useCallback(() => {
    if (!confirm('Tem certeza que deseja restaurar as configurações padrão? Todas as alterações não salvas serão perdidas.')) {
      return;
    }

    log('🔄 Restaurando configurações padrão');
    setConfig(getDefaultConfig());
    setIsDirty(true);
    toast.info('Configurações restauradas para padrão');
  }, []);

  // ============================================================================
  // EXPORT/IMPORT
  // ============================================================================

  const exportConfig = useCallback(() => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moria-landing-page-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    log('📥 Configuração exportada');
    toast.success('Configuração exportada com sucesso!');
  }, [config]);

  const importConfig = useCallback((configJson: string) => {
    try {
      const imported = JSON.parse(configJson);
      setConfig(imported);
      setIsDirty(true);
      log('📤 Configuração importada');
      toast.success('Configuração importada com sucesso!');
    } catch (err) {
      toast.error('Erro ao importar: JSON inválido');
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Carregar na inicialização
  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);

  // Auto-save (não na inicialização!)
  useEffect(() => {
    if (!hasLoadedInitially.current || !isDirty || !ENABLE_AUTO_SAVE) {
      return;
    }

    // Limpar timer anterior
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Agendar auto-save
    autoSaveTimer.current = setTimeout(() => {
      log('⏰ Disparando auto-save (5 min de inatividade)');
      save(true);
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [isDirty, save]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S - Salvar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save(false);
      }

      // Ctrl+E / Cmd+E - Exportar
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportConfig();
      }

      // Ctrl+R / Cmd+R - Reset (bloquear reload padrão se dirty)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && isDirty) {
        e.preventDefault();
        if (confirm('Você tem alterações não salvas. Deseja recarregar mesmo assim?')) {
          window.location.reload();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [save, exportConfig, isDirty]);

  // Alerta de alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    config,
    loading,
    isDirty,
    isSaving,
    error,

    updateConfig,
    save,
    reset,
    loadFromBackend,
    exportConfig,
    importConfig,
  };
};
