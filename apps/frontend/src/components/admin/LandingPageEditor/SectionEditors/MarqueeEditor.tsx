/**
 * MarqueeEditor - Editor da seção Marquee (Banner de mensagens)
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MarqueeConfig, MarqueeItem } from '@/types/landingPage';
import { ArrayEditor, ColorPicker, SliderControl } from '../StyleControls';

interface MarqueeEditorProps {
  config: MarqueeConfig;
  onChange: (config: MarqueeConfig) => void;
}

export const MarqueeEditor = ({ config, onChange }: MarqueeEditorProps) => {
  const updateConfig = (updates: Partial<MarqueeConfig>) => {
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
              Exibir ou ocultar o marquee na landing page
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
        </div>
      </Card>

      {/* Mensagens do Marquee */}
      <Card className="p-6">
        <ArrayEditor<MarqueeItem>
          label="Mensagens do Marquee"
          items={config.items}
          onChange={(items) => updateConfig({ items })}
          createNew={() => ({
            id: Date.now().toString(),
            icon: '🔧',
            text: 'NOVA MENSAGEM',
          })}
          getItemLabel={(item) => `${item.icon} ${item.text}`}
          renderItem={(item, _, update) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ícone/Emoji</Label>
                <Input
                  value={item.icon}
                  onChange={(e) => update({ icon: e.target.value })}
                  placeholder="🔧"
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground">
                  Use emojis como: 🔧 ⚡ 🚗 🛠️ 💰 ✨ 🎉
                </p>
              </div>

              <div className="space-y-2">
                <Label>Texto da Mensagem</Label>
                <Input
                  value={item.text}
                  onChange={(e) => update({ text: e.target.value.toUpperCase() })}
                  placeholder="PEÇAS ORIGINAIS COM ATÉ 30% DE DESCONTO"
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  O texto será convertido automaticamente para MAIÚSCULAS
                </p>
              </div>
            </div>
          )}
          description="Mensagens que rolam continuamente no banner superior"
          maxItems={10}
        />
      </Card>

      {/* Velocidade de Animação */}
      <Card className="p-6">
        <SliderControl
          label="Velocidade da Animação"
          value={config.speed}
          onChange={(speed) => updateConfig({ speed })}
          min={10}
          max={60}
          step={5}
          unit="s"
          description="Tempo em segundos para completar um ciclo completo da animação"
        />
      </Card>

      {/* Cores */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Cores</h3>

        <div className="space-y-2">
          <Label>Cor de Fundo</Label>
          <Input
            value={config.backgroundColor}
            onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
            placeholder="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
          />
          <p className="text-xs text-muted-foreground">
            Use cores sólidas (#ff6b35) ou gradientes CSS (linear-gradient(...))
          </p>
        </div>

        <ColorPicker
          label="Cor do Texto"
          value={config.textColor}
          onChange={(textColor) => updateConfig({ textColor })}
        />
      </Card>

      {/* Preview */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div
          className="overflow-hidden rounded-lg border border-gray-300"
          style={{
            background: config.backgroundColor,
            color: config.textColor,
          }}
        >
          <div className="py-3 px-4">
            <div className="whitespace-nowrap text-sm font-bold animate-pulse">
              {config.items.map(item => `${item.icon} ${item.text}`).join(' • ')}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          A animação real será mais suave na página ao vivo
        </p>
      </Card>

      {/* Informação */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">Configuração do Marquee</h4>
            <p className="text-sm text-amber-800">
              O marquee é o banner de mensagens que rola continuamente no topo da página.
              Use-o para destacar promoções, novidades e informações importantes.
            </p>
            <p className="text-sm text-amber-800 mt-2">
              <strong>Dica:</strong> Mantenha as mensagens curtas e impactantes para melhor legibilidade.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
