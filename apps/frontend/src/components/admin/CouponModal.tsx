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
import { ScrollArea } from '../ui/scroll-area';
import { AlertCircle, Loader2, Gift, Percent, Calendar, Settings } from 'lucide-react';

interface Coupon {
  id?: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minimumAmount?: number;
  usageLimit: number;
  usageCount: number;
  expiresAt?: string;
  isActive: boolean;
}

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (coupon: Partial<Coupon>) => Promise<void>;
  coupon?: Coupon | null;
  loading?: boolean;
}

export function CouponModal({ isOpen, onClose, onSave, coupon, loading = false }: CouponModalProps) {
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: undefined,
    maxDiscount: undefined,
    minimumAmount: undefined,
    usageLimit: 1,
    usageCount: 0,
    expiresAt: '',
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

  // Preencher form quando cupom é editado
  useEffect(() => {
    if (coupon) {
      setFormData({
        id: coupon.id,
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || 0,
        maxDiscount: coupon.maxDiscount || undefined,
        minimumAmount: coupon.minimumAmount || undefined,
        usageLimit: coupon.usageLimit || 1,
        usageCount: coupon.usageCount || 0,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true
      });
    } else {
      // Resetar form para novo cupom
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: undefined,
        maxDiscount: undefined,
        minimumAmount: undefined,
        usageLimit: 1,
        usageCount: 0,
        expiresAt: '',
        isActive: true
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [coupon, isOpen]);

  const handleInputChange = (field: keyof Coupon, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange('code', result);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.code?.trim()) {
      newErrors.code = 'Código é obrigatório';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Código deve ter pelo menos 3 caracteres';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'Valor do desconto deve ser maior que zero';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentual não pode ser maior que 100%';
    }

    if (!formData.usageLimit || formData.usageLimit < 1) {
      newErrors.usageLimit = 'Limite de uso deve ser pelo menos 1';
    }

    if (formData.minimumAmount && formData.minimumAmount < 0) {
      newErrors.minimumAmount = 'Valor mínimo não pode ser negativo';
    }

    if (formData.maxDiscount && formData.maxDiscount < 0) {
      newErrors.maxDiscount = 'Desconto máximo não pode ser negativo';
    }

    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        newErrors.expiresAt = 'Data de expiração deve ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const dataToSave = { ...formData };
      
      // Converter data para ISO string se fornecida
      if (dataToSave.expiresAt) {
        dataToSave.expiresAt = new Date(dataToSave.expiresAt).toISOString();
      }
      
      // Remover campos undefined
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined || dataToSave[key] === '') {
          delete dataToSave[key];
        }
      });

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao salvar cupom:', error);
    }
  };

  const formatPreview = () => {
    if (!formData.discountValue) return '';
    
    if (formData.discountType === 'percentage') {
      let text = `${formData.discountValue}% de desconto`;
      if (formData.maxDiscount) {
        text += ` (máx ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.maxDiscount)})`;
      }
      return text;
    } else {
      return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.discountValue)} de desconto`;
    }
  };

  const isEditing = !!coupon?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-moria-orange" />
            {isEditing ? 'Editar Cupom' : 'Novo Cupom'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEditing
              ? 'Edite as informações do cupom abaixo'
              : 'Preencha as informações do novo cupom'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="discount" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Desconto
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Regras
            </TabsTrigger>
          </TabsList>

          {/* Aba Básico */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Cupom *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="Ex: DESCONTO10"
                    className={`font-mono ${errors.code ? 'border-red-500' : ''}`}
                    maxLength={20}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateRandomCode}
                    className="whitespace-nowrap"
                  >
                    Gerar
                  </Button>
                </div>
                {errors.code && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.code}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Código único que os clientes irão usar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Data de Expiração</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  className={errors.expiresAt ? 'border-red-500' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.expiresAt && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.expiresAt}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Deixe vazio para cupom sem expiração
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição do cupom para os clientes..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="active">Cupom ativo</Label>
              {formData.isActive ? (
                <Badge variant="outline" className="text-green-600">Ativo</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Inativo</Badge>
              )}
            </div>
          </TabsContent>

          {/* Aba Desconto */}
          <TabsContent value="discount" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Desconto *</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(value) => handleInputChange('discountType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Valor do Desconto * {formData.discountType === 'percentage' ? '(%)' : '(R$)'}
                  </Label>
                  <div className="relative">
                    {formData.discountType === 'percentage' ? (
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    ) : (
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    )}
                    <Input
                      id="discountValue"
                      type="number"
                      step={formData.discountType === 'percentage' ? "1" : "0.01"}
                      min="0"
                      max={formData.discountType === 'percentage' ? "100" : undefined}
                      value={formData.discountValue ?? ''}
                      onChange={(e) => handleInputChange('discountValue', safeParseFloat(e.target.value))}
                      placeholder="0"
                      className={`pl-10 ${errors.discountValue ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.discountValue && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.discountValue}
                    </p>
                  )}
                </div>

                {formData.discountType === 'percentage' && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Desconto Máximo (R$)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <Input
                        id="maxDiscount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.maxDiscount ?? ''}
                        onChange={(e) => handleInputChange('maxDiscount', safeParseFloat(e.target.value))}
                        placeholder="Sem limite"
                        className={`pl-10 ${errors.maxDiscount ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.maxDiscount && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.maxDiscount}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Limite máximo para descontos percentuais
                    </p>
                  </div>
                )}
              </div>

              {formData.discountValue > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Preview do Desconto</h4>
                  <p className="text-green-800 font-medium">
                    {formatPreview()}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba Regras */}
          <TabsContent value="rules" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumAmount">Valor Mínimo do Pedido (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    id="minimumAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumAmount ?? ''}
                    onChange={(e) => handleInputChange('minimumAmount', safeParseFloat(e.target.value))}
                    placeholder="Sem mínimo"
                    className={`pl-10 ${errors.minimumAmount ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.minimumAmount && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.minimumAmount}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Valor mínimo do pedido para usar o cupom
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Limite de Uso *</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  value={formData.usageLimit ?? ''}
                  onChange={(e) => handleInputChange('usageLimit', safeParseInt(e.target.value))}
                  placeholder="1"
                  className={errors.usageLimit ? 'border-red-500' : ''}
                />
                {errors.usageLimit && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.usageLimit}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Quantas vezes o cupom pode ser usado
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Estatísticas de Uso</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <span className="text-blue-600">Usado:</span>
                    <span className="font-medium ml-2">{formData.usageCount || 0} vezes</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Restante:</span>
                    <span className="font-medium ml-2">
                      {(formData.usageLimit || 0) - (formData.usageCount || 0)} vezes
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="px-6 py-3 border-t bg-gray-50/50">
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} size="sm">
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading} size="sm" className="bg-moria-orange hover:bg-orange-600">
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Cupom'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}