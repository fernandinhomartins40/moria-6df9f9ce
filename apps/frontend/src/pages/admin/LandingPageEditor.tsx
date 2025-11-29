/**
 * AdminLandingPageEditor - Página de edição da Landing Page
 * Padrão Ferraco adaptado para Moria
 */

import { useState } from 'react';
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
  CheckCircle,
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';
import { HeroEditor } from '@/components/admin/LandingPageEditor/SectionEditors/HeroEditor';
import { toast } from 'sonner';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-moria-orange" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Editor da Landing Page
              </h1>
              <p className="text-sm text-gray-600">
                Configure todos os elementos visuais da página inicial
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Status */}
              {isDirty && (
                <span className="text-sm text-orange-600 font-medium">
                  Alterações não salvas
                </span>
              )}

              {/* Preview */}
              <Button
                variant="outline"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>

              {/* Export/Import */}
              <Button
                variant="outline"
                onClick={handleExport}
                title="Exportar (Ctrl+E)"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={handleImport}
              >
                <Upload className="h-4 w-4" />
              </Button>

              {/* Reset */}
              <Button
                variant="outline"
                onClick={handleReset}
                className="text-red-600 hover:text-red-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </Button>

              {/* Save */}
              <Button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="bg-moria-orange hover:bg-moria-orange/90"
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
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="container mx-auto px-4 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-8 w-full mb-8">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="header">Header</TabsTrigger>
              <TabsTrigger value="marquee">Marquee</TabsTrigger>
              <TabsTrigger value="about">Serviços</TabsTrigger>
              <TabsTrigger value="products">Peças</TabsTrigger>
              <TabsTrigger value="services">Promoções</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4">
              <HeroEditor
                config={config.hero}
                onChange={(hero) => updateConfig('hero', hero)}
              />
            </TabsContent>

            <TabsContent value="header">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Editor do Header em desenvolvimento...
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="marquee">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Editor do Marquee em desenvolvimento...
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="about">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Editor da seção Serviços em desenvolvimento...
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="products">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Editor da seção Peças em desenvolvimento...
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="services">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Editor da seção Promoções em desenvolvimento...
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="contact">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Editor de Contato em desenvolvimento...
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="footer">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Editor do Footer em desenvolvimento...
                </AlertDescription>
              </Alert>
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
    </div>
  );
}
