/**
 * HeroEditor - Editor da seção Hero (Banner principal)
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeroConfig, HeroFeature, HeroButton } from '@/types/landingPage';
import { ImageUploaderWithCrop, SliderControl, ArrayEditor, IconSelector, GradientPicker, MORIA_GRADIENT_PRESETS, ColorOrGradientPicker, ColorPicker, colorOrGradientToCSS } from '../StyleControls';
import { Eye } from 'lucide-react';
import * as Icons from 'lucide-react';

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

              {/* Personalização de Cores */}
              <div className="pt-4 border-t space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Personalização de Cores (Opcional)</h4>

                <ColorOrGradientPicker
                  label="Cor de Fundo / Gradiente"
                  value={item.background || { type: 'solid', solid: '#ff6600' }}
                  onChange={(background) => update({ background })}
                  defaultGradientPreset="goldMetallic"
                  description="Defina uma cor sólida ou gradiente para o fundo do botão"
                />

                <ColorPicker
                  label="Cor do Texto"
                  value={item.textColor || '#ffffff'}
                  onChange={(textColor) => update({ textColor })}
                  description="Cor do texto do botão (opcional)"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
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

      {/* Gradientes */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Gradientes da Identidade Visual</h3>
          <p className="text-sm text-muted-foreground">
            Configure os gradientes característicos da marca Moria
          </p>
        </div>

        <GradientPicker
          label="Gradiente do Título (Gold Metallic)"
          value={config.titleGradient || MORIA_GRADIENT_PRESETS.goldMetallic}
          onChange={(titleGradient) => updateConfig({ titleGradient })}
          description="Gradiente dourado aplicado ao título principal (MORIA)"
          presetName="gold-metallic"
        />

        <GradientPicker
          label="Gradiente de Overlay (Orange Overlay)"
          value={config.overlayGradient || MORIA_GRADIENT_PRESETS.orangeOverlay}
          onChange={(overlayGradient) => updateConfig({ overlayGradient })}
          description="Gradiente laranja semi-transparente sobre a imagem de fundo"
          presetName="orange-overlay"
        />
      </Card>

      {/* Preview */}
      <Card className="bg-gradient-to-r from-moria-orange/5 to-gold-accent/5 border-moria-orange/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-moria-orange" />
              <CardTitle>Preview do Hero</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
              Atualização em tempo real
            </Badge>
          </div>
          <CardDescription>
            Veja como a seção hero aparecerá na landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[400px] flex items-center rounded-lg overflow-hidden">
            {/* Background Image */}
            {config.backgroundImage.url && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${config.backgroundImage.url})` }}
              />
            )}
            {!config.backgroundImage.url && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: config.overlayOpacity / 100 }}
            />

            {/* Content */}
            <div className="relative z-10 p-8 w-full">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  <span className="gold-metallic">{config.title || 'MORIA'}</span>
                  <br />
                  <span className="text-white">{config.subtitle || 'Peças & Serviços'}</span>
                </h1>

                <p className="text-lg text-gray-300 mb-6">
                  {config.description || 'Descrição do seu negócio...'}
                </p>

                {/* Features */}
                {config.features.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {config.features.map((feature) => {
                      const IconComponent = (Icons as any)[feature.icon] || Icons.Circle;
                      return (
                        <div key={feature.id} className="flex items-center space-x-2 text-white">
                          <IconComponent className="h-4 w-4 text-moria-orange" />
                          <span className="text-xs">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Buttons */}
                {config.buttons.filter(btn => btn.enabled).length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {config.buttons.filter(btn => btn.enabled).map((button) => {
                      const customStyle = button.background || button.textColor ? {
                        ...(button.background ? { background: colorOrGradientToCSS(button.background) } : {}),
                        ...(button.textColor ? { color: button.textColor } : {}),
                      } : undefined;

                      return (
                        <Button
                          key={button.id}
                          variant={button.variant as any}
                          size="sm"
                          style={customStyle}
                        >
                          {button.text}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
