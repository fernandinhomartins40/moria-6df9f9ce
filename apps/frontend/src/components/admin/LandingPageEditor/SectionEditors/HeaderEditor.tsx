/**
 * HeaderEditor - Editor da seção Header (Cabeçalho)
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { HeaderConfig, HeaderMenuItem } from '@/types/landingPage';
import { ImageUploaderWithCrop, ArrayEditor, ColorPicker } from '../StyleControls';

interface HeaderEditorProps {
  config: HeaderConfig;
  onChange: (config: HeaderConfig) => void;
}

export const HeaderEditor = ({ config, onChange }: HeaderEditorProps) => {
  const updateConfig = (updates: Partial<HeaderConfig>) => {
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
              Exibir ou ocultar o header na landing page
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
        </div>
      </Card>

      {/* Logo */}
      <Card className="p-6">
        <ImageUploaderWithCrop
          label="Logo do Header"
          value={config.logo}
          onChange={(logo) => updateConfig({ logo })}
          description="Logo exibida no canto superior esquerdo"
          recommendedWidth={200}
          recommendedHeight={60}
          aspectRatio={null}
          maxFileSizeMB={2}
        />
      </Card>

      {/* Itens do Menu */}
      <Card className="p-6">
        <ArrayEditor<HeaderMenuItem>
          label="Itens do Menu"
          items={config.menuItems}
          onChange={(menuItems) => updateConfig({ menuItems })}
          createNew={() => ({
            id: Date.now().toString(),
            label: 'Novo Item',
            href: '#',
            isLink: true,
          })}
          getItemLabel={(item) => item.label}
          renderItem={(item, _, update) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Item</Label>
                <Input
                  value={item.label}
                  onChange={(e) => update({ label: e.target.value })}
                  placeholder="Serviços"
                />
              </div>

              <div className="space-y-2">
                <Label>Link (href)</Label>
                <Input
                  value={item.href}
                  onChange={(e) => update({ href: e.target.value })}
                  placeholder="#servicos ou /servicos"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={item.isLink}
                  onCheckedChange={(isLink) => update({ isLink })}
                />
                <Label>Usar React Link (desmarque para link externo)</Label>
              </div>
            </div>
          )}
          maxItems={8}
        />
      </Card>

      {/* Cores */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Cores</h3>

        <ColorPicker
          label="Cor de Fundo"
          value={config.backgroundColor}
          onChange={(backgroundColor) => updateConfig({ backgroundColor })}
        />

        <ColorPicker
          label="Cor do Texto"
          value={config.textColor}
          onChange={(textColor) => updateConfig({ textColor })}
        />

        <ColorPicker
          label="Cor do Hover"
          value={config.hoverColor}
          onChange={(hoverColor) => updateConfig({ hoverColor })}
        />
      </Card>
    </div>
  );
};
