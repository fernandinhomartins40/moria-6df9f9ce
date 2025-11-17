import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, Loader2, Wrench, DollarSign, Clock, Settings } from 'lucide-react';

interface Service {
  id?: number;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedTime: number;
  specifications: Record<string, any>;
  isActive: boolean;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Partial<Service>) => Promise<void>;
  service?: Service | null;
  loading?: boolean;
}

const SERVICE_CATEGORIES = [
  'Manutenção Preventiva',
  'Motor',
  'Freios',
  'Suspensão',
  'Transmissão',
  'Sistema Elétrico',
  'Ar Condicionado',
  'Pneus e Rodas',
  'Carroceria',
  'Diagnóstico',
  'Outros'
];

export function ServiceModal({ isOpen, onClose, onSave, service, loading = false }: ServiceModalProps) {
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    category: '',
    basePrice: undefined,
    estimatedTime: 60,
    specifications: {},
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  // Funções auxiliares para conversão segura de números
  const safeParseFloat = (value: string): number | undefined => {
    if (!value || value.trim() === '') return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  };

  const safeParseInt = (value: string): number | undefined => {
    if (!value || value.trim() === '') return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  };

  // Preencher form quando serviço é editado
  useEffect(() => {
    if (service) {
      setFormData({
        id: service.id,
        name: service.name || '',
        description: service.description || '',
        category: service.category || '',
        basePrice: service.basePrice || 0,
        estimatedTime: service.estimatedTime || 60,
        specifications: service.specifications || {},
        isActive: service.isActive !== undefined ? service.isActive : true
      });
    } else {
      // Resetar form para novo serviço
      setFormData({
        name: '',
        description: '',
        category: '',
        basePrice: undefined,
        estimatedTime: 60,
        specifications: {},
        isActive: true
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [service, isOpen]);

  const handleInputChange = (field: keyof Service, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.basePrice || formData.basePrice < 0) {
      newErrors.basePrice = 'Preço base deve ser maior ou igual a zero';
    }

    if (!formData.estimatedTime || formData.estimatedTime <= 0) {
      newErrors.estimatedTime = 'Tempo estimado deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao salvar serviço:', error);
    }
  };

  const isEditing = !!service?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite as informações do serviço abaixo'
              : 'Preencha as informações do novo serviço'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Preço & Tempo
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Detalhes
            </TabsTrigger>
          </TabsList>

          {/* Aba Básico */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Troca de óleo do motor"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição detalhada do serviço..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="active">Serviço ativo</Label>
              {formData.isActive ? (
                <Badge variant="outline" className="text-green-600">Ativo</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Inativo</Badge>
              )}
            </div>
          </TabsContent>

          {/* Aba Preço & Tempo */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Preço Base *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice ?? ''}
                    onChange={(e) => handleInputChange('basePrice', safeParseFloat(e.target.value))}
                    placeholder="0.00"
                    className={`pl-10 ${errors.basePrice ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.basePrice && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.basePrice}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Use 0 para serviços com preço sob orçamento
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Tempo Estimado (minutos) *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="1"
                    value={formData.estimatedTime}
                    onChange={(e) => handleInputChange('estimatedTime', safeParseInt(e.target.value))}
                    placeholder="60"
                    className={`pl-10 ${errors.estimatedTime ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.estimatedTime && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.estimatedTime}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.estimatedTime && formData.estimatedTime >= 60 
                    ? `${Math.floor(formData.estimatedTime / 60)}h ${formData.estimatedTime % 60}min`
                    : `${formData.estimatedTime || 0} minutos`
                  }
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Informações de Preço</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Preço base:</span>
                  <span className="font-medium">
                    {formData.basePrice > 0 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.basePrice)
                      : 'Sob orçamento'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo estimado:</span>
                  <span className="font-medium">
                    {formData.estimatedTime >= 60 
                      ? `${Math.floor(formData.estimatedTime / 60)}h ${formData.estimatedTime % 60}min`
                      : `${formData.estimatedTime} min`
                    }
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba Detalhes */}
          <TabsContent value="details" className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Especificações Técnicas</h4>
              <p className="text-sm text-gray-600 mb-4">
                As especificações técnicas podem ser adicionadas futuramente para detalhar 
                requisitos específicos, ferramentas necessárias, peças incluídas, etc.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Ferramentas necessárias</Label>
                  <p className="text-xs text-gray-500">Em desenvolvimento</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Peças incluídas</Label>
                  <p className="text-xs text-gray-500">Em desenvolvimento</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Pré-requisitos</Label>
                  <p className="text-xs text-gray-500">Em desenvolvimento</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Garantia</Label>
                  <p className="text-xs text-gray-500">Em desenvolvimento</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Salvar Alterações' : 'Criar Serviço'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}