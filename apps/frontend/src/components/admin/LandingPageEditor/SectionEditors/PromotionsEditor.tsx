/**
 * PromotionsEditor - Editor da seção Promoções
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PromotionsSectionConfig } from '@/types/landingPage';

interface PromotionsEditorProps {
  config: PromotionsSectionConfig;
  onChange: (config: PromotionsSectionConfig) => void;
}

export const PromotionsEditor = ({ config, onChange }: PromotionsEditorProps) => {
  const updateConfig = (updates: Partial<PromotionsSectionConfig>) => {
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
              Exibir ou ocultar a seção de Promoções na landing page
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
            placeholder="Promoções Imperdíveis"
          />
          <p className="text-xs text-muted-foreground">
            A primeira palavra será destacada em dourado
          </p>
        </div>

        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Textarea
            value={config.subtitle}
            onChange={(e) => updateConfig({ subtitle: e.target.value })}
            placeholder="Aproveite nossas ofertas especiais por tempo limitado..."
            rows={3}
          />
        </div>
      </Card>

      {/* Informação */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <div className="bg-purple-500 text-white p-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 mb-1">Ofertas Dinâmicas</h4>
            <p className="text-sm text-purple-800">
              As promoções exibidas nesta seção são carregadas automaticamente do sistema de ofertas.
              Aqui você configura apenas o título e subtítulo da seção.
            </p>
            <p className="text-sm text-purple-800 mt-2">
              Para criar e gerenciar ofertas (Dia, Semana, Mês), utilize a seção
              <strong> Ofertas </strong> no painel administrativo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
