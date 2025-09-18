import React, { useState, useEffect, useRef } from 'react';
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
import { AlertCircle, Loader2, Package, DollarSign, Warehouse, Settings, Images } from 'lucide-react';
import { ImageUpload, ImageUploadRef } from '../ui/ImageUpload';

interface Product {
  id?: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  original_price?: number;
  sale_price?: number;
  discount_price?: number;
  promo_price?: number;
  cost_price?: number;
  stock: number;
  min_stock: number;
  sku: string;
  supplier: string;
  image_url?: string;
  images: string[];
  is_active: boolean;
  is_favorite?: boolean;
  specifications: Record<string, string>;
  vehicle_compatibility: string[];
  created_at?: string;
  updated_at?: string;
}

interface UploadedImage {
  id: string;
  status: 'uploading' | 'uploaded' | 'awaiting-crop' | 'processing' | 'ready' | 'error';
  progress: number;
  processedUrls?: {
    thumbnail: string;
    medium: string;
    full: string;
  };
  error?: string;
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
    subcategory: '',
    price: undefined,
    sale_price: undefined,
    promo_price: undefined,
    cost_price: undefined,
    stock: 0,
    min_stock: 5,
    sku: '',
    supplier: '',
    image_url: '',
    images: [],
    is_active: true,
    is_favorite: false,
    specifications: {},
    vehicle_compatibility: []
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const imageUploadRef = useRef<ImageUploadRef>(null);
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

  // Preencher form quando produto é editado
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        price: product.price || product.original_price || 0,
        original_price: product.original_price || product.price || 0,
        sale_price: product.sale_price || 0,
        discount_price: product.discount_price || 0,
        promo_price: product.promo_price || 0,
        cost_price: product.cost_price || 0,
        stock: product.stock || 0,
        min_stock: product.min_stock || 5,
        sku: product.sku || '',
        supplier: product.supplier || '',
        image_url: product.image_url || '',
        images: product.images || [],
        is_active: product.is_active !== undefined ? product.is_active : true,
        is_favorite: product.is_favorite || false,
        specifications: product.specifications || {},
        vehicle_compatibility: product.vehicle_compatibility || []
      });

      // Converter imagens existentes para o formato do ImageUpload
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const existingImages = product.images
          .filter(url => url && typeof url === 'string' && !url.includes('placeholder'))
          .map((url, index) => ({
            id: `existing-${Date.now()}-${index}`,
            status: 'ready' as const,
            progress: 100,
            processedUrls: {
              thumbnail: url.replace('/full/', '/thumbnails/'),
              medium: url.replace('/full/', '/medium/'),
              full: url
            }
          }));

        console.log('🔍 DEBUG - Carregando imagens existentes:', existingImages);
        setUploadedImages(existingImages);
      } else {
        setUploadedImages([]);
      }
    } else {
      // Resetar form para novo produto
      setFormData({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        price: undefined,
        sale_price: undefined,
        promo_price: undefined,
        cost_price: undefined,
        stock: 0,
        min_stock: 5,
        sku: '',
        supplier: '',
        image_url: '',
        images: [],
        is_active: true,
        is_favorite: false,
        specifications: {},
        vehicle_compatibility: []
      });

      // Limpar imagens apenas para novo produto
      setUploadedImages([]);
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

    // Verificar se pelo menos um preço foi informado
    if ((!formData.price || formData.price <= 0) && (!formData.original_price || formData.original_price <= 0)) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (formData.sale_price !== undefined && formData.sale_price < 0) {
      newErrors.sale_price = 'Preço de venda não pode ser negativo';
    }

    if (formData.promo_price !== undefined && formData.promo_price < 0) {
      newErrors.promo_price = 'Preço promocional não pode ser negativo';
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = 'Estoque não pode ser negativo';
    }

    if (formData.min_stock !== undefined && formData.min_stock < 0) {
      newErrors.min_stock = 'Estoque mínimo não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Processar imagens realmente no backend (crop + upload)
      let processedImages: any[] = [];

      if (imageUploadRef.current) {
        processedImages = await imageUploadRef.current.processImagesForSaving();
      }

      // Preservar estrutura completa das URLs (thumbnail, medium, full)
      const imageStructures = processedImages.map(img => img.processedUrls).filter(Boolean);

      // Para compatibilidade, extrair thumbnails para image_url
      const thumbnailUrls = imageStructures.map(urls => urls?.thumbnail).filter(Boolean);

      // Usar a primeira imagem como image_url principal
      const productData = {
        ...formData,
        images: imageStructures, // Salvar estrutura completa
        image_url: thumbnailUrls[0] || formData.image_url || '' // Thumbnail principal para compatibilidade
      };

      await onSave(productData);
      onClose();
    } catch (error) {
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Images className="h-4 w-4" />
              Imagens
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
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="active">Produto ativo</Label>
              {formData.is_active ? (
                <Badge variant="outline" className="text-green-600">Ativo</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Inativo</Badge>
              )}
            </div>
          </TabsContent>

          {/* Aba Imagens */}
          <TabsContent value="images" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Galeria de Imagens</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Adicione até 10 imagens do produto. A primeira imagem será usada como principal.
                </p>
              </div>

              <ImageUpload
                ref={imageUploadRef}
                onImagesChange={(images) => {
                  setUploadedImages(images);
                }}
                maxImages={10}
                aspectRatio={1} // Forçar proporção 1:1 para produtos
                className="w-full"
                disabled={loading}
                initialImages={uploadedImages}
              />
            </div>
          </TabsContent>

          {/* Aba Preços */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Preço de Custo</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price ?? ''}
                  onChange={(e) => handleInputChange('cost_price', safeParseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço Base *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price ?? ''}
                  onChange={(e) => handleInputChange('price', safeParseFloat(e.target.value))}
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
                <Label htmlFor="sale_price">Preço de Venda</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sale_price ?? ''}
                  onChange={(e) => handleInputChange('sale_price', safeParseFloat(e.target.value))}
                  placeholder="0.00"
                  className={errors.sale_price ? 'border-red-500' : ''}
                />
                {errors.sale_price && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.sale_price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="promo_price">Preço Promocional</Label>
                <Input
                  id="promo_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.promo_price ?? ''}
                  onChange={(e) => handleInputChange('promo_price', safeParseFloat(e.target.value))}
                  placeholder="0.00"
                  className={errors.promo_price ? 'border-red-500' : ''}
                />
                {errors.promo_price && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.promo_price}
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
                  onChange={(e) => handleInputChange('stock', safeParseInt(e.target.value))}
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
                <Label htmlFor="min_stock">Estoque Mínimo</Label>
                <Input
                  id="min_stock"
                  type="number"
                  min="0"
                  value={formData.min_stock}
                  onChange={(e) => handleInputChange('min_stock', safeParseInt(e.target.value))}
                  placeholder="5"
                  className={errors.min_stock ? 'border-red-500' : ''}
                />
                {errors.min_stock && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.min_stock}
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
                <Label htmlFor="subcategory">Subcategoria</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  placeholder="Ex: Filtro de Óleo, Pastilha Dianteira"
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