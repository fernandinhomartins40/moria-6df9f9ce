/**
 * ServicesEditor - Editor da seção "Nossos Serviços"
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ServicesSectionConfig, TrustIndicator } from '@/types/landingPage';
import { ArrayEditor, IconSelector } from '../StyleControls';

interface ServicesEditorProps {
  config: ServicesSectionConfig;
  onChange: (config: ServicesSectionConfig) => void;
}

export const ServicesEditor = ({ config, onChange }: ServicesEditorProps) => {
  const updateConfig = (updates: Partial<ServicesSectionConfig>) => {
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
              Exibir ou ocultar a seção de Serviços na landing page
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
            placeholder="Nossos Serviços"
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
            placeholder="Oferecemos uma gama completa de serviços automotivos..."
            rows={3}
          />
        </div>
      </Card>

      {/* Indicadores de Confiança */}
      <Card className="p-6">
        <ArrayEditor<TrustIndicator>
          label="Indicadores de Confiança"
          items={config.trustIndicators}
          onChange={(trustIndicators) => updateConfig({ trustIndicators })}
          createNew={() => ({
            id: Date.now().toString(),
            icon: 'Shield',
            iconBackground: 'gold',
            title: 'Novo Indicador',
            description: 'Descrição do indicador',
          })}
          getItemLabel={(item) => item.title}
          renderItem={(item, _, update) => (
            <div className="space-y-4">
              <IconSelector
                label="Ícone"
                value={item.icon}
                onChange={(icon) => update({ icon })}
              />

              <div className="space-y-2">
                <Label>Cor de Fundo do Ícone</Label>
                <select
                  value={item.iconBackground}
                  onChange={(e) => update({ iconBackground: e.target.value as 'gold' | 'orange' })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="gold">Dourado (Premium)</option>
                  <option value="orange">Laranja (Destaque)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Dourado: Efeito metálico premium • Laranja: Cor principal da marca
                </p>
              </div>

              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={item.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Garantia"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={item.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="6 meses em todos os serviços"
                />
              </div>

              {/* Preview do Indicador */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <p className="text-xs font-semibold text-gray-600 mb-2">Preview:</p>
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full mb-2 ${item.iconBackground === 'gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-orange-500'}`}>
                    <div className={`w-6 h-6 ${item.iconBackground === 'gold' ? 'text-black' : 'text-white'}`}>
                      {/* Placeholder icon */}
                      ✓
                    </div>
                  </div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              </div>
            </div>
          )}
          description="Cards exibidos abaixo da lista de serviços (recomendado: 4 indicadores)"
          maxItems={6}
        />
      </Card>

      {/* Informação */}
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <div className="bg-green-500 text-white p-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-1">Seção de Serviços</h4>
            <p className="text-sm text-green-800">
              Esta seção exibe os serviços cadastrados no sistema, seguidos pelos indicadores de confiança
              que você configura aqui.
            </p>
            <p className="text-sm text-green-800 mt-2">
              <strong>Indicadores de Confiança:</strong> Use-os para destacar diferenciais como garantia,
              rapidez, experiência e tecnologia.
            </p>
            <p className="text-sm text-green-800 mt-2">
              Para gerenciar os serviços (adicionar, editar, remover), utilize a seção
              <strong> Serviços </strong> no painel administrativo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
