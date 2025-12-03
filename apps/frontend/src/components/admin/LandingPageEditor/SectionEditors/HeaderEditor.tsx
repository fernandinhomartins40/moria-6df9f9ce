/**
 * HeaderEditor - Editor da seção Header (Cabeçalho)
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { HeaderConfig, HeaderMenuItem } from '@/types/landingPage';
import { ImageUploaderWithCrop, ArrayEditor, ColorPicker } from '../StyleControls';
import { Eye } from 'lucide-react';

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

      {/* Preview */}
      <Card className="bg-gradient-to-r from-moria-orange/5 to-gold-accent/5 border-moria-orange/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-moria-orange" />
              <CardTitle>Preview do Header</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
              Atualização em tempo real
            </Badge>
          </div>
          <CardDescription>
            Veja como o header aparecerá na landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg p-4 flex items-center justify-between"
            style={{
              backgroundColor: config.backgroundColor,
              color: config.textColor
            }}
          >
            {/* Logo */}
            <div className="flex items-center">
              {config.logo.url ? (
                <img
                  src={config.logo.url}
                  alt="Logo"
                  className="h-12 object-contain"
                />
              ) : (
                <div className="px-4 py-2 bg-gray-200 rounded text-gray-500 text-sm">
                  Logo
                </div>
              )}
            </div>

            {/* Menu Items */}
            <nav className="flex items-center gap-6">
              {config.menuItems.slice(0, 5).map((item) => (
                <span
                  key={item.id}
                  className="text-sm font-medium cursor-pointer transition-colors"
                  style={{ color: config.textColor }}
                  onMouseEnter={(e) => e.currentTarget.style.color = config.hoverColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = config.textColor}
                >
                  {item.label}
                </span>
              ))}
              {config.menuItems.length > 5 && (
                <span className="text-sm text-gray-400">...</span>
              )}
            </nav>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
