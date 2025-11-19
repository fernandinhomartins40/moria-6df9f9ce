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
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { AlertCircle, Loader2, TrendingUp, Percent, Calendar, Settings, X } from 'lucide-react';
import { apiClient } from '../../services/api.ts';

interface Promotion {
  id?: number;
  name: string;
  description: string;
  type: 'product' | 'category' | 'general';
  conditions: {
    categories?: string[];
    productIds?: number[];
    minAmount?: number;
    maxUsesPerCustomer?: number;
  };
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: Partial<Promotion>) => Promise<void>;
  promotion?: Promotion | null;
  loading?: boolean;
}

const PROMOTION_TYPES = [
  { value: 'general', label: 'Promoção Geral', description: 'Aplicada a todos os produtos' },
  { value: 'category', label: 'Por Categoria', description: 'Aplicada a uma categoria específica' },
  { value: 'product', label: 'Produto Específico', description: 'Aplicada a produtos selecionados' }
];

export function PromotionModal({ isOpen, onClose, onSave, promotion, loading = false }: PromotionModalProps) {
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: '',
    description: '',
    type: 'general',
    conditions: {
      categories: [],
      productIds: [],
      minAmount: undefined,
      maxUsesPerCustomer: undefined
    },
    discountType: 'percentage',
    discountValue: undefined,
    maxDiscount: undefined,
    startsAt: '',
    endsAt: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

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

  // Carregar dados necessários
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // Carregar produtos para obter categorias e lista de produtos
      const productsResponse = await apiClient.getProducts();
      if (productsResponse?.success && productsResponse.data) {
        const products = productsResponse.data;
        setAvailableProducts(products);
        
        // Extrair categorias únicas
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        setAvailableCategories(categories);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Preencher form quando promoção é editada
  useEffect(() => {
    if (promotion) {
      setFormData({
        id: promotion.id,
        name: promotion.name || '',
        description: promotion.description || '',
        type: promotion.type || 'general',
        conditions: {
          categories: promotion.conditions?.categories || [],
          productIds: promotion.conditions?.productIds || [],
          minAmount: promotion.conditions?.minAmount,
          maxUsesPerCustomer: promotion.conditions?.maxUsesPerCustomer
        },
        discountType: promotion.discountType || 'percentage',
        discountValue: promotion.discountValue || 0,
        maxDiscount: promotion.maxDiscount || undefined,
        startsAt: promotion.startsAt ? promotion.startsAt.split('T')[0] + 'T' + promotion.startsAt.split('T')[1]?.substring(0, 5) : '',
        endsAt: promotion.endsAt ? promotion.endsAt.split('T')[0] + 'T' + promotion.endsAt.split('T')[1]?.substring(0, 5) : '',
        isActive: promotion.isActive !== undefined ? promotion.isActive : true
      });
    } else {
      // Resetar form para nova promoção
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        name: '',
        description: '',
        type: 'general',
        conditions: {
          categories: [],
          productIds: [],
          minAmount: undefined,
          maxUsesPerCustomer: undefined
        },
        discountType: 'percentage',
        discountValue: undefined,
        maxDiscount: undefined,
        startsAt: now.toISOString().substring(0, 16),
        endsAt: tomorrow.toISOString().substring(0, 16),
        isActive: true
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [promotion, isOpen]);

  const handleInputChange = (field: keyof Promotion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleConditionChange = (conditionField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [conditionField]: value
      }
    }));
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = formData.conditions?.categories || [];
    const isSelected = currentCategories.includes(category);
    
    const newCategories = isSelected
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    handleConditionChange('categories', newCategories);
  };

  const handleProductToggle = (productId: number) => {
    const currentProducts = formData.conditions?.productIds || [];
    const isSelected = currentProducts.includes(productId);
    
    const newProducts = isSelected
      ? currentProducts.filter(p => p !== productId)
      : [...currentProducts, productId];
    
    handleConditionChange('productIds', newProducts);
  };

  const removeCategory = (category: string) => {
    const currentCategories = formData.conditions?.categories || [];
    const newCategories = currentCategories.filter(c => c !== category);
    handleConditionChange('categories', newCategories);
  };

  const removeProduct = (productId: number) => {
    const currentProducts = formData.conditions?.productIds || [];
    const newProducts = currentProducts.filter(p => p !== productId);
    handleConditionChange('productIds', newProducts);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo de promoção é obrigatório';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'Valor do desconto deve ser maior que zero';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentual não pode ser maior que 100%';
    }

    if (formData.maxDiscount && formData.maxDiscount < 0) {
      newErrors.maxDiscount = 'Desconto máximo não pode ser negativo';
    }

    // Validação de datas
    if (formData.startsAt && formData.endsAt) {
      const startDate = new Date(formData.startsAt);
      const endDate = new Date(formData.endsAt);
      
      if (endDate <= startDate) {
        newErrors.endsAt = 'Data de fim deve ser posterior ao início';
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
      
      // Converter datas para ISO string se fornecidas
      if (dataToSave.startsAt) {
        dataToSave.startsAt = new Date(dataToSave.startsAt).toISOString();
      }
      
      if (dataToSave.endsAt) {
        dataToSave.endsAt = new Date(dataToSave.endsAt).toISOString();
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
      console.error('Erro ao salvar promoção:', error);
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

  const getPromotionStatus = () => {
    if (!formData.isActive) return { label: 'Inativa', color: 'gray' };
    
    const now = new Date();
    const starts = formData.startsAt ? new Date(formData.startsAt) : null;
    const ends = formData.endsAt ? new Date(formData.endsAt) : null;
    
    if (starts && now < starts) {
      return { label: 'Agendada', color: 'blue' };
    }
    
    if (ends && now > ends) {
      return { label: 'Expirada', color: 'red' };
    }
    
    return { label: 'Ativa', color: 'green' };
  };

  const isEditing = !!promotion?.id;
  const status = getPromotionStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-moria-orange" />
            {isEditing ? 'Editar Promoção' : 'Nova Promoção'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEditing
              ? 'Edite as informações da promoção abaixo'
              : 'Preencha as informações da nova promoção'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="discount" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Desconto
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Condições
            </TabsTrigger>
          </TabsList>

          {/* Aba Básico */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Promoção *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Black Friday 2024"
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
                <Label htmlFor="type">Tipo de Promoção *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMOTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.type}
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
                placeholder="Descrição da promoção para os clientes..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="active">Promoção ativa</Label>
              <Badge 
                variant="outline" 
                className={`${
                  status.color === 'green' ? 'text-green-600' :
                  status.color === 'blue' ? 'text-blue-600' :
                  status.color === 'red' ? 'text-red-600' :
                  'text-gray-600'
                }`}
              >
                {status.label}
              </Badge>
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

          {/* Aba Período */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Data/Hora de Início</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => handleInputChange('startsAt', e.target.value)}
                  className={errors.startsAt ? 'border-red-500' : ''}
                />
                {errors.startsAt && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startsAt}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Deixe vazio para começar imediatamente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">Data/Hora de Fim</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => handleInputChange('endsAt', e.target.value)}
                  className={errors.endsAt ? 'border-red-500' : ''}
                />
                {errors.endsAt && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.endsAt}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Deixe vazio para promoção sem fim
                </p>
              </div>
            </div>

            {formData.startsAt && formData.endsAt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Duração da Promoção</h4>
                <p className="text-blue-800">
                  {(() => {
                    const start = new Date(formData.startsAt);
                    const end = new Date(formData.endsAt);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return `${diffDays} dias`;
                  })()}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Aba Condições */}
          <TabsContent value="conditions" className="space-y-4">
            {loadingData ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-moria-orange" />
                <p className="text-sm text-gray-600 mt-2">Carregando dados...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Seleção de Categorias - apenas para type = 'category' */}
                {formData.type === 'category' && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Categorias Elegíveis *</Label>
                    <p className="text-sm text-gray-600">Selecione as categorias onde esta promoção será aplicada</p>
                    
                    {/* Categorias selecionadas */}
                    {formData.conditions?.categories && formData.conditions.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.conditions.categories.map(category => (
                          <Badge key={category} variant="secondary" className="gap-1">
                            {category}
                            <button
                              type="button"
                              onClick={() => removeCategory(category)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Lista de categorias disponíveis */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {availableCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={formData.conditions?.categories?.includes(category) || false}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seleção de Produtos - apenas para type = 'product' */}
                {formData.type === 'product' && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Produtos Específicos *</Label>
                    <p className="text-sm text-gray-600">Selecione os produtos onde esta promoção será aplicada</p>
                    
                    {/* Produtos selecionados */}
                    {formData.conditions?.productIds && formData.conditions.productIds.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <Label className="text-sm font-medium">Produtos Selecionados:</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.conditions.productIds.map(productId => {
                            const product = availableProducts.find(p => p.id === productId);
                            return product ? (
                              <Badge key={productId} variant="secondary" className="gap-1">
                                {product.name}
                                <button
                                  type="button"
                                  onClick={() => removeProduct(productId)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Lista de produtos disponíveis */}
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      <div className="p-3 space-y-2">
                        {availableProducts.map(product => (
                          <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={formData.conditions?.productIds?.includes(product.id) || false}
                              onCheckedChange={() => handleProductToggle(product.id)}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`product-${product.id}`}
                                className="text-sm font-medium cursor-pointer block"
                              >
                                {product.name}
                              </Label>
                              <p className="text-xs text-gray-500">
                                {product.category} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Condições adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Valor Mínimo do Pedido (R$)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.conditions?.minAmount ?? ''}
                      onChange={(e) => handleConditionChange('minAmount', safeParseFloat(e.target.value))}
                      placeholder="Ex: 100.00"
                    />
                    <p className="text-xs text-gray-500">Valor mínimo para aplicar a promoção</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxUsesPerCustomer">Limite de Uso por Cliente</Label>
                    <Input
                      id="maxUsesPerCustomer"
                      type="number"
                      min="1"
                      value={formData.conditions?.maxUsesPerCustomer ?? ''}
                      onChange={(e) => handleConditionChange('maxUsesPerCustomer', safeParseInt(e.target.value))}
                      placeholder="Ex: 1"
                    />
                    <p className="text-xs text-gray-500">Quantas vezes cada cliente pode usar</p>
                  </div>
                </div>

                {/* Resumo da promoção */}
                {(formData.type === 'category' && formData.conditions?.categories && formData.conditions.categories.length > 0) ||
                 (formData.type === 'product' && formData.conditions?.productIds && formData.conditions.productIds.length > 0) ||
                 formData.type === 'general' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Resumo da Aplicação</h4>
                    <div className="text-blue-800 text-sm space-y-1">
                      {formData.type === 'general' && <p>• Aplicada em todos os produtos e serviços</p>}
                      {formData.type === 'category' && formData.conditions?.categories && (
                        <p>• Aplicada nas categorias: {formData.conditions.categories.join(', ')}</p>
                      )}
                      {formData.type === 'product' && formData.conditions?.productIds && (
                        <p>• Aplicada em {formData.conditions.productIds.length} produto(s) específico(s)</p>
                      )}
                      {formData.conditions?.minAmount && (
                        <p>• Valor mínimo do pedido: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.conditions.minAmount)}</p>
                      )}
                      {formData.conditions?.maxUsesPerCustomer && (
                        <p>• Máximo {formData.conditions.maxUsesPerCustomer} uso(s) por cliente</p>
                      )}
                    </div>
                  </div>
                ) : null}
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
              {isEditing ? 'Salvar Alterações' : 'Criar Promoção'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}