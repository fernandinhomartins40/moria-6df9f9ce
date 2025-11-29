/**
 * ProductsEditor - Editor da seção Peças Originais
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ProductsSectionConfig } from '@/types/landingPage';

interface ProductsEditorProps {
  config: ProductsSectionConfig;
  onChange: (config: ProductsSectionConfig) => void;
}

export const ProductsEditor = ({ config, onChange }: ProductsEditorProps) => {
  const updateConfig = (updates: Partial<ProductsSectionConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Habilitado */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Seção Ativa</Label>
            <p className="text-sm text-muted-foreground">
              Exibir ou ocultar a seção de Peças na landing page
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
        </div>
      </Card>

      {/* Textos da Seção */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Textos da Seção</h3>

        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={config.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="Peças Originais"
          />
          <p className="text-xs text-muted-foreground">
            A última palavra será destacada em dourado
          </p>
        </div>

        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Textarea
            value={config.subtitle}
            onChange={(e) => updateConfig({ subtitle: e.target.value })}
            placeholder="Temos as melhores peças para o seu veículo..."
            rows={3}
          />
        </div>
      </Card>

      {/* Informação */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Produtos Dinâmicos</h4>
            <p className="text-sm text-blue-800">
              Os produtos exibidos nesta seção são carregados automaticamente do catálogo de produtos.
              Aqui você configura apenas o título e subtítulo da seção.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              Para gerenciar os produtos (adicionar, editar, remover), utilize a seção
              <strong> Produtos </strong> no painel administrativo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
