/**
 * AdminLandingPageEditor - Página de edição da Landing Page
 * Padrão Ferraco adaptado para Moria - Com layout do painel admin
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProtectedAdminRoute } from '@/components/admin/ProtectedAdminRoute';
import { Sidebar } from '@/components/admin/Sidebar';
import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  Eye,
  ArrowLeft
} from 'lucide-react';
import {
  HeroEditor,
  HeaderEditor,
  FooterEditor,
  MarqueeEditor,
  ServicesEditor,
  ProductsEditor,
  PromotionsEditor,
  ContactEditor,
} from '@/components/admin/LandingPageEditor/SectionEditors';
import { AboutEditor } from '@/components/admin/LandingPageEditor/SectionEditors/AboutEditor';
import { toast } from 'sonner';
import '@/styles/lojista.css';

export default function LandingPageEditor() {
  const {
    config,
    loading,
    isDirty,
    isSaving,
    error,
    updateConfig,
    save,
    reset,
    exportConfig,
    importConfig,
  } = useLandingPageConfig();

  const [activeTab, setActiveTab] = useState('hero');

  // Atalhos de teclado já estão no hook (Ctrl+S, Ctrl+E, etc.)

  const handleSave = async () => {
    await save(false); // Manual save
  };

  const handleExport = () => {
    exportConfig();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          importConfig(json);
        } catch (err) {
          toast.error('Erro ao importar: arquivo inválido');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.')) {
      reset();
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  // Loading state dentro do layout
  const loadingContent = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-moria-orange" />
        <p className="text-gray-600">Carregando configurações...</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ProtectedAdminRoute>
        <div className="lojista-layout">
          <Sidebar activeTab="landing-page" onTabChange={() => {}} />
          <main className="lojista-content">
            {loadingContent}
          </main>
        </div>
      </ProtectedAdminRoute>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="lojista-layout">
        <Sidebar activeTab="landing-page" onTabChange={() => {}} />

        <main className="lojista-content lojista-fade-in">
          {/* Header */}
          <div className="lojista-header">
            <div className="flex items-center gap-4 flex-1">
              <Link
                to="/store-panel"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Voltar ao Painel</span>
              </Link>
              <div className="border-l h-6 border-gray-300"></div>
              <div>
                <h1 className="lojista-title">
                  Editor da Landing Page
                </h1>
                <p className="lojista-subtitle">
                  Configure todos os elementos visuais da página inicial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status */}
              {isDirty && (
                <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></div>
                  Alterações não salvas
                </span>
              )}

              {/* Preview */}
              <Button
                variant="outline"
                onClick={handlePreview}
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>

              {/* Export/Import */}
              <Button
                variant="outline"
                onClick={handleExport}
                title="Exportar (Ctrl+E)"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              <Button
                variant="outline"
                onClick={handleImport}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>

              {/* Reset */}
              <Button
                variant="outline"
                onClick={handleReset}
                className="text-red-600 hover:text-red-700"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </Button>

              {/* Save */}
              <Button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="bg-moria-orange hover:bg-moria-orange/90"
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar (Ctrl+S)
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Alertas */}
          {error && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Conteúdo */}
          <div>
            <Card className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 w-full mb-8 gap-1">
                  <TabsTrigger value="hero" className="text-xs sm:text-sm">Hero</TabsTrigger>
                  <TabsTrigger value="header" className="text-xs sm:text-sm">Header</TabsTrigger>
                  <TabsTrigger value="marquee" className="text-xs sm:text-sm">Marquee</TabsTrigger>
                  <TabsTrigger value="about" className="text-xs sm:text-sm">Serviços</TabsTrigger>
                  <TabsTrigger value="products" className="text-xs sm:text-sm">Peças</TabsTrigger>
                  <TabsTrigger value="services" className="text-xs sm:text-sm">Promoções</TabsTrigger>
                  <TabsTrigger value="contactPage" className="text-xs sm:text-sm">Contato</TabsTrigger>
                  <TabsTrigger value="aboutPage" className="text-xs sm:text-sm">Sobre</TabsTrigger>
                  <TabsTrigger value="footer" className="text-xs sm:text-sm">Footer</TabsTrigger>
                </TabsList>

                <TabsContent value="hero" className="space-y-4">
                  <HeroEditor
                    config={config.hero}
                    onChange={(hero) => updateConfig('hero', hero)}
                  />
                </TabsContent>

                <TabsContent value="header" className="space-y-4">
                  <HeaderEditor
                    config={config.header}
                    onChange={(header) => updateConfig('header', header)}
                  />
                </TabsContent>

                <TabsContent value="marquee" className="space-y-4">
                  <MarqueeEditor
                    config={config.marquee}
                    onChange={(marquee) => updateConfig('marquee', marquee)}
                  />
                </TabsContent>

                <TabsContent value="about" className="space-y-4">
                  <ServicesEditor
                    config={config.about}
                    onChange={(about) => updateConfig('about', about)}
                  />
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <ProductsEditor
                    config={config.products}
                    onChange={(products) => updateConfig('products', products)}
                  />
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                  <PromotionsEditor
                    config={config.services}
                    onChange={(services) => updateConfig('services', services)}
                  />
                </TabsContent>

                <TabsContent value="contactPage" className="space-y-4">
                  <ContactEditor
                    config={config.contactPage}
                    onChange={(contactPage) => updateConfig('contactPage', contactPage)}
                  />
                </TabsContent>

                <TabsContent value="aboutPage" className="space-y-4">
                  <AboutEditor
                    config={config.aboutPage}
                    onChange={(aboutPage) => updateConfig('aboutPage', aboutPage)}
                  />
                </TabsContent>

                <TabsContent value="footer" className="space-y-4">
                  <FooterEditor
                    config={config.footer}
                    onChange={(footer) => updateConfig('footer', footer)}
                  />
                </TabsContent>
              </Tabs>
            </Card>

            {/* Shortcuts Help */}
            <Card className="mt-6 p-4 bg-gray-50">
              <h3 className="text-sm font-semibold mb-2">Atalhos de Teclado</h3>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+S</kbd> Salvar</div>
                <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+E</kbd> Exportar</div>
                <div><kbd className="px-2 py-1 bg-white border rounded">Ctrl+R</kbd> Recarregar (com confirmação)</div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}
