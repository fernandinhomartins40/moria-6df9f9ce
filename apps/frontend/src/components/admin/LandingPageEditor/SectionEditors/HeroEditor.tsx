/**
 * HeroEditor - Editor da seção Hero (Banner principal)
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { HeroConfig, HeroFeature, HeroButton } from '@/types/landingPage';
import { ImageUploaderWithCrop, SliderControl, ArrayEditor, IconSelector } from '../StyleControls';

interface HeroEditorProps {
  config: HeroConfig;
  onChange: (config: HeroConfig) => void;
}

export const HeroEditor = ({ config, onChange }: HeroEditorProps) => {
  const updateConfig = (updates: Partial<HeroConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Título e Subtítulo */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Textos Principais</h3>

        <div className="space-y-2">
          <Label>Título (Palavra Dourada)</Label>
          <Input
            value={config.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="MORIA"
          />
        </div>

        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Input
            value={config.subtitle}
            onChange={(e) => updateConfig({ subtitle: e.target.value })}
            placeholder="Peças & Serviços"
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            value={config.description}
            onChange={(e) => updateConfig({ description: e.target.value })}
            placeholder="Especialistas em peças automotivas..."
            rows={3}
          />
        </div>
      </Card>

      {/* Features (4 ícones com texto) */}
      <Card className="p-6">
        <ArrayEditor<HeroFeature>
          label="Features (Ícones com Texto)"
          items={config.features}
          onChange={(features) => updateConfig({ features })}
          createNew={() => ({
            id: Date.now().toString(),
            icon: 'Shield',
            text: 'Nova Feature',
          })}
          getItemLabel={(item) => item.text}
          renderItem={(item, _, update) => (
            <div className="space-y-4">
              <IconSelector
                label="Ícone"
                value={item.icon}
                onChange={(icon) => update({ icon })}
              />

              <div className="space-y-2">
                <Label>Texto</Label>
                <Input
                  value={item.text}
                  onChange={(e) => update({ text: e.target.value })}
                  placeholder="Qualidade Garantida"
                />
              </div>
            </div>
          )}
          maxItems={4}
        />
      </Card>

      {/* Botões CTA */}
      <Card className="p-6">
        <ArrayEditor<HeroButton>
          label="Botões de Ação (CTAs)"
          items={config.buttons}
          onChange={(buttons) => updateConfig({ buttons })}
          createNew={() => ({
            id: Date.now().toString(),
            text: 'Novo Botão',
            href: '#',
            variant: 'hero',
            enabled: true,
          })}
          getItemLabel={(item) => item.text}
          renderItem={(item, _, update) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Texto do Botão</Label>
                <Input
                  value={item.text}
                  onChange={(e) => update({ text: e.target.value })}
                  placeholder="Ver Promoções"
                />
              </div>

              <div className="space-y-2">
                <Label>Link (href)</Label>
                <Input
                  value={item.href}
                  onChange={(e) => update({ href: e.target.value })}
                  placeholder="#promocoes ou https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Estilo do Botão</Label>
                <select
                  value={item.variant}
                  onChange={(e) => update({ variant: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="hero">Hero (Laranja)</option>
                  <option value="premium">Premium (Dourado)</option>
                  <option value="outline">Outline (Contorno)</option>
                  <option value="default">Padrão</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => update({ enabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label>Botão ativo</Label>
              </div>
            </div>
          )}
          maxItems={3}
        />
      </Card>

      {/* Imagem de Fundo */}
      <Card className="p-6">
        <ImageUploaderWithCrop
          label="Imagem de Fundo do Hero"
          value={config.backgroundImage}
          onChange={(backgroundImage) => updateConfig({ backgroundImage })}
          description="Imagem principal do banner hero - largura total da tela"
          recommendedWidth={1920}
          recommendedHeight={1080}
          aspectRatio={16/9}
          maxFileSizeMB={10}
        />
      </Card>

      {/* Opacidade do Overlay */}
      <Card className="p-6">
        <SliderControl
          label="Opacidade do Overlay Escuro"
          value={config.overlayOpacity}
          onChange={(overlayOpacity) => updateConfig({ overlayOpacity })}
          min={0}
          max={100}
          unit="%"
          description="Escurecimento sobre a imagem de fundo (0 = transparente, 100 = preto total)"
        />
      </Card>
    </div>
  );
};
