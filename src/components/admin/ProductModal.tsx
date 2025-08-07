import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, Loader2, Package, DollarSign, Warehouse, Settings } from 'lucide-react';

interface Product {
  id?: number;
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number;
  promoPrice?: number;
  stock: number;
  minStock: number;
  sku: string;
  brand: string;
  supplier: string;
  images: string[];
  isActive: boolean;
  specifications: Record<string, any>;
  vehicleCompatibility: string[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
  product?: Product | null;
  loading?: boolean;
}

const CATEGORIES = [
  'Filtros',
  'Freios',
  'Motor',
  'Suspensão',
  'Elétrica',
  'Óleos',
  'Pneus',
  'Carroceria',
  'Transmissão',
  'Combustível',
  'Ar Condicionado',
  'Sistema de Ignição'
];

export function ProductModal({ isOpen, onClose, onSave, product, loading = false }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: '',
    price: 0,
    salePrice: 0,
    promoPrice: 0,
    stock: 0,
    minStock: 5,
    sku: '',
    brand: '',
    supplier: '',
    images: [],
    isActive: true,
    specifications: {},
    vehicleCompatibility: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  // Preencher form quando produto é editado
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || 0,
        salePrice: product.salePrice || 0,
        promoPrice: product.promoPrice || 0,
        stock: product.stock || 0,
        minStock: product.minStock || 5,
        sku: product.sku || '',
        brand: product.brand || '',
        supplier: product.supplier || '',
        images: product.images || [],
        isActive: product.isActive !== undefined ? product.isActive : true,
        specifications: product.specifications || {},
        vehicleCompatibility: product.vehicleCompatibility || []
      });
    } else {
      // Resetar form para novo produto
      setFormData({
        name: '',
        description: '',
        category: '',
        price: 0,
        salePrice: 0,
        promoPrice: 0,
        stock: 0,
        minStock: 5,
        sku: '',
        brand: '',
        supplier: '',
        images: [],
        isActive: true,
        specifications: {},
        vehicleCompatibility: []
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [product, isOpen]);

  const handleInputChange = (field: keyof Product, value: any) => {
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

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (formData.salePrice && formData.salePrice <= 0) {
      newErrors.salePrice = 'Preço de venda deve ser maior que zero';
    }

    if (formData.promoPrice && formData.promoPrice <= 0) {
      newErrors.promoPrice = 'Preço promocional deve ser maior que zero';
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = 'Estoque não pode ser negativo';
    }

    if (formData.minStock !== undefined && formData.minStock < 0) {
      newErrors.minStock = 'Estoque mínimo não pode ser negativo';
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
      console.error('Erro ao salvar produto:', error);
    }
  };

  const isEditing = !!product?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite as informações do produto abaixo'
              : 'Preencha as informações do novo produto'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Preços
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Estoque
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
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Filtro de Óleo Mann W75/3"
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
                    {CATEGORIES.map(category => (
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
                placeholder="Descrição detalhada do produto..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="active">Produto ativo</Label>
              {formData.isActive ? (
                <Badge variant="outline" className="text-green-600">Ativo</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Inativo</Badge>
              )}
            </div>
          </TabsContent>

          {/* Aba Preços */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço Base *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Preço de Venda</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.salePrice ? 'border-red-500' : ''}
                />
                {errors.salePrice && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.salePrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoPrice">Preço Promocional</Label>
                <Input
                  id="promoPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.promoPrice}
                  onChange={(e) => handleInputChange('promoPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.promoPrice ? 'border-red-500' : ''}
                />
                {errors.promoPrice && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.promoPrice}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Aba Estoque */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Quantidade em Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.stock}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Estoque Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                  placeholder="5"
                  className={errors.minStock ? 'border-red-500' : ''}
                />
                {errors.minStock && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.minStock}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Aba Detalhes */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Código</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="SKU123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Ex: Bosch, Mann, NGK"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Nome do fornecedor"
                />
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
            {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}