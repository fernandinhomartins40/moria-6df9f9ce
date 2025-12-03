/**
 * ColorOrGradientPicker - Componente reutilizável para escolher entre cor sólida ou gradiente
 * Permite configurar cores sólidas com ColorPicker ou gradientes complexos com GradientPicker
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Droplet, Palette } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { GradientPicker, MORIA_GRADIENT_PRESETS } from './GradientPicker';
import { GradientConfig } from '@/types/landingPage';

export interface ColorOrGradientValue {
  type: 'solid' | 'gradient';
  solid?: string; // Cor sólida (ex: "#FF6B35")
  gradient?: GradientConfig; // Configuração do gradiente
}

interface ColorOrGradientPickerProps {
  label: string;
  value: ColorOrGradientValue;
  onChange: (value: ColorOrGradientValue) => void;
  description?: string;
  defaultGradientPreset?: keyof typeof MORIA_GRADIENT_PRESETS;
  showPreview?: boolean;
}

export const ColorOrGradientPicker = ({
  label,
  value,
  onChange,
  description,
  defaultGradientPreset = 'goldMetallic',
  showPreview = true,
}: ColorOrGradientPickerProps) => {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>(value.type || 'solid');

  const handleTabChange = (tab: string) => {
    const newType = tab as 'solid' | 'gradient';
    setActiveTab(newType);

    // Atualizar o tipo e garantir valores padrão
    if (newType === 'solid') {
      onChange({
        type: 'solid',
        solid: value.solid || '#FF6B35',
        gradient: value.gradient,
      });
    } else {
      onChange({
        type: 'gradient',
        solid: value.solid,
        gradient: value.gradient || MORIA_GRADIENT_PRESETS[defaultGradientPreset],
      });
    }
  };

  const handleSolidChange = (color: string) => {
    onChange({
      ...value,
      type: 'solid',
      solid: color,
    });
  };

  const handleGradientChange = (gradient: GradientConfig) => {
    onChange({
      ...value,
      type: 'gradient',
      gradient,
    });
  };

  // Gerar CSS para preview
  const getPreviewStyle = (): React.CSSProperties => {
    if (value.type === 'gradient' && value.gradient) {
      const { type, angle, stops } = value.gradient;
      const stopsStr = stops
        .map(s => `${s.color} ${s.position}%`)
        .join(', ');

      let backgroundImage = '';
      if (type === 'linear') {
        backgroundImage = `linear-gradient(${angle}deg, ${stopsStr})`;
      } else if (type === 'radial') {
        backgroundImage = `radial-gradient(circle, ${stopsStr})`;
      } else if (type === 'conic') {
        backgroundImage = `conic-gradient(from ${angle}deg, ${stopsStr})`;
      }

      return { backgroundImage };
    }

    return { backgroundColor: value.solid || '#FF6B35' };
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solid" className="flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            Cor Sólida
          </TabsTrigger>
          <TabsTrigger value="gradient" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Gradiente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="space-y-4 mt-4">
          <ColorPicker
            label="Cor"
            value={value.solid || '#FF6B35'}
            onChange={handleSolidChange}
          />
        </TabsContent>

        <TabsContent value="gradient" className="space-y-4 mt-4">
          <GradientPicker
            label="Gradiente"
            value={value.gradient || MORIA_GRADIENT_PRESETS[defaultGradientPreset]}
            onChange={handleGradientChange}
            presetName={defaultGradientPreset}
          />
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {showPreview && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Preview</Label>
            <Badge variant="outline" className="text-xs">
              {value.type === 'solid' ? 'Cor Sólida' : 'Gradiente'}
            </Badge>
          </div>
          <div
            className="w-full h-20 rounded-lg border-2 border-gray-200 shadow-sm"
            style={getPreviewStyle()}
          />
        </div>
      )}
    </Card>
  );
};

// Helper function para converter ColorOrGradientValue em CSS
export const colorOrGradientToCSS = (value: ColorOrGradientValue): React.CSSProperties => {
  if (value.type === 'gradient' && value.gradient) {
    const { type, angle, stops } = value.gradient;
    const stopsStr = stops
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');

    let backgroundImage = '';
    if (type === 'linear') {
      backgroundImage = `linear-gradient(${angle}deg, ${stopsStr})`;
    } else if (type === 'radial') {
      backgroundImage = `radial-gradient(circle, ${stopsStr})`;
    } else if (type === 'conic') {
      backgroundImage = `conic-gradient(from ${angle}deg, ${stopsStr})`;
    }

    return { backgroundImage };
  }

  return { backgroundColor: value.solid || '#FF6B35' };
};
