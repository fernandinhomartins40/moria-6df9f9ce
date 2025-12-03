import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useSettings } from '@/hooks/useSettings';
import { clearSettingsCache } from '@/hooks/useStoreSettings';
import settingsService from '@/api/settingsService';
import {
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
  FileText,
  Truck,
  DollarSign,
  BarChart3,
  Clock,
  Save,
  RotateCcw,
  Eye,
  MapPin,
  Phone,
  Mail,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

export function SettingsContent() {
  const { settings, loading, updateSettings, resetSettings, updateLoading } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [testingApi, setTestingApi] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Informações da Empresa
    storeName: '',
    cnpj: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',

    // Configurações de Vendas
    defaultMargin: 35,
    freeShippingMin: 150,
    deliveryFee: 15.90,
    deliveryDays: 3,

    // Notificações
    notifyNewOrders: true,
    notifyLowStock: true,
    notifyWeeklyReports: false,

    // Integrações
    whatsappApiKey: '',
    correiosApiKey: '',
    paymentGatewayKey: '',
    googleAnalyticsId: '',

    // Flags
    whatsappConnected: false,
    correiosConnected: false,
    paymentConnected: false,
    analyticsConnected: false,
  });

  // Carregar dados quando settings mudar
  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || '',
        cnpj: settings.cnpj || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        city: settings.city || '',
        state: settings.state || '',
        zipCode: settings.zipCode || '',
        defaultMargin: Number(settings.defaultMargin) || 35,
        freeShippingMin: Number(settings.freeShippingMin) || 150,
        deliveryFee: Number(settings.deliveryFee) || 15.90,
        deliveryDays: settings.deliveryDays || 3,
        notifyNewOrders: settings.notifyNewOrders,
        notifyLowStock: settings.notifyLowStock,
        notifyWeeklyReports: settings.notifyWeeklyReports,
        whatsappApiKey: settings.whatsappApiKey || '',
        correiosApiKey: settings.correiosApiKey || '',
        paymentGatewayKey: settings.paymentGatewayKey || '',
        googleAnalyticsId: settings.googleAnalyticsId || '',
        whatsappConnected: settings.whatsappConnected,
        correiosConnected: settings.correiosConnected,
        paymentConnected: settings.paymentConnected,
        analyticsConnected: settings.analyticsConnected,
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      // Limpar cache público para atualizar frontend
      clearSettingsCache();
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Tem certeza que deseja resetar todas as configurações para os valores padrão?')) {
      return;
    }

    setIsResetting(true);
    try {
      await resetSettings();
      clearSettingsCache();
      toast.success('Configurações resetadas com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resetar configurações');
    } finally {
      setIsResetting(false);
    }
  };

  const handleTestApi = async (apiType: 'whatsapp' | 'correios' | 'payment') => {
    const apiKeyMap = {
      whatsapp: formData.whatsappApiKey,
      correios: formData.correiosApiKey,
      payment: formData.paymentGatewayKey,
    };

    const apiKey = apiKeyMap[apiType];
    if (!apiKey) {
      toast.error('Informe a API Key primeiro');
      return;
    }

    setTestingApi(apiType);
    try {
      let result;
      if (apiType === 'whatsapp') {
        result = await settingsService.testWhatsAppConnection(apiKey);
      } else if (apiType === 'correios') {
        result = await settingsService.testCorreiosConnection(apiKey);
      } else {
        result = await settingsService.testPaymentConnection(apiKey);
      }

      const flagMap = {
        whatsapp: 'whatsappConnected',
        correios: 'correiosConnected',
        payment: 'paymentConnected',
      };

      if (result.connected) {
        toast.success(result.message || 'Conexão bem-sucedida!');
        // Atualizar flag de conexão
        handleInputChange(flagMap[apiType], true);
      } else {
        toast.error(result.message || 'Falha na conexão');
        handleInputChange(flagMap[apiType], false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao testar conexão');
    } finally {
      setTestingApi(null);
    }
  };

  // Componentes de Preview
  const HeroPreview = () => (
    <div className="relative min-h-[300px] flex items-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-moria-black opacity-70"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            <span className="gold-metallic">{formData.storeName || 'Moria Peças'}</span>
          </h1>
          <p className="text-lg text-gray-300 mb-4">
            {formData.address && formData.city ? `${formData.address}, ${formData.city}/${formData.state}` : 'Endereço não configurado'}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-moria-orange text-white">
              <Phone className="h-3 w-3 mr-1" />
              {formData.phone || 'Telefone'}
            </Badge>
            <Badge className="bg-green-600 text-white">
              <MessageCircle className="h-3 w-3 mr-1" />
              WhatsApp
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  const PromotionsPreview = () => (
    <div className="bg-gradient-to-br from-gray-900 to-moria-black text-white p-6 rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          <span className="gold-metallic">Promoções</span> Imperdíveis
        </h2>
        <p className="text-gray-300">Ofertas especiais com descontos de até 50%</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="bg-gray-700 h-24 flex items-center justify-center">
            <Timer className="h-8 w-8 text-moria-orange" />
          </div>
          <CardContent className="p-3">
            <Badge className="bg-red-500 text-white mb-2">-40%</Badge>
            <p className="text-sm font-semibold text-gray-900">Produto em Promoção</p>
            <div className="mt-1">
              <span className="text-xs text-gray-500 line-through">R$ 100,00</span>
              <span className="text-lg font-bold text-red-600 ml-2">R$ 60,00</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gray-700 h-24 flex items-center justify-center">
            <Timer className="h-8 w-8 text-moria-orange" />
          </div>
          <CardContent className="p-3">
            <Badge className="bg-red-500 text-white mb-2">-30%</Badge>
            <p className="text-sm font-semibold text-gray-900">Outro Produto</p>
            <div className="mt-1">
              <span className="text-xs text-gray-500 line-through">R$ 80,00</span>
              <span className="text-lg font-bold text-red-600 ml-2">R$ 56,00</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 p-3 bg-moria-orange/20 border border-moria-orange/30 rounded text-center">
        <p className="text-sm">
          Frete Grátis acima de <span className="font-bold">R$ {formData.freeShippingMin.toFixed(2)}</span>
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Taxa de entrega: R$ {formData.deliveryFee.toFixed(2)} • Prazo: {formData.deliveryDays} dias
        </p>
      </div>
    </div>
  );

  const ContactPreview = () => (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Entre em <span className="gold-metallic">Contato</span>
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">Endereço</p>
            <p className="text-xs text-gray-600 mt-1">
              {formData.city && formData.state ? `${formData.city}/${formData.state}` : 'Não configurado'}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-3">
            <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">Telefone</p>
            <p className="text-xs text-gray-600 mt-1">
              {formData.phone || 'Não configurado'}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center col-span-2">
          <CardContent className="p-3">
            <div className="bg-red-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
              <Mail className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">E-mail</p>
            <p className="text-xs text-gray-600 mt-1">
              {formData.email || 'Não configurado'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
        <MessageCircle className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-moria-orange" />
      </div>
    );
  }

  console.log('[SettingsContent] Renderizando com formData:', {
    storeName: formData.storeName,
    phone: formData.phone,
    email: formData.email
  });

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      <Card className="bg-gradient-to-r from-moria-orange/5 to-gold-accent/5 border-moria-orange/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-moria-orange" />
              <CardTitle>Preview da Landing Page</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800 animate-pulse">
              <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
              Atualização em tempo real
            </Badge>
          </div>
          <CardDescription>
            Veja como as configurações aparecem nas seções da página principal. As alterações são atualizadas automaticamente enquanto você edita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hero">Hero Section</TabsTrigger>
              <TabsTrigger value="promotions">Promoções</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
            </TabsList>
            <TabsContent value="hero" className="mt-4">
              <HeroPreview />
            </TabsContent>
            <TabsContent value="promotions" className="mt-4">
              <PromotionsPreview />
            </TabsContent>
            <TabsContent value="contact" className="mt-4">
              <ContactPreview />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>Configure e gerencie as definições da loja</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Informações da Loja */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Informações da Loja</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da Loja *</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  placeholder="Moria Peças & Serviços"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone/WhatsApp (Formato: 5511999999999) *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="5511999999999"
                />
                <p className="text-xs text-gray-500">
                  Número usado no checkout e botões de contato
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@moriapecas.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="00000000"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Av. das Oficinas, 123 - Centro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Configurações de Vendas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Configurações de Vendas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultMargin">Margem de Lucro Padrão (%)</Label>
                <Input
                  id="defaultMargin"
                  type="number"
                  value={formData.defaultMargin}
                  onChange={(e) => handleInputChange('defaultMargin', Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freeShippingMin">Valor Mínimo para Frete Grátis (R$)</Label>
                <Input
                  id="freeShippingMin"
                  type="number"
                  value={formData.freeShippingMin}
                  onChange={(e) => handleInputChange('freeShippingMin', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => handleInputChange('deliveryFee', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDays">Tempo de Entrega (dias)</Label>
                <Input
                  id="deliveryDays"
                  type="number"
                  value={formData.deliveryDays}
                  onChange={(e) => handleInputChange('deliveryDays', Number(e.target.value))}
                  min="1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notificações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Notificações</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Novos Pedidos</p>
                  <p className="text-sm text-gray-600">Receber notificação quando houver novos pedidos</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={formData.notifyNewOrders ? "bg-green-100 text-green-800" : ""}
                  onClick={() => handleInputChange('notifyNewOrders', !formData.notifyNewOrders)}
                >
                  {formData.notifyNewOrders ? (
                    <><CheckCircle className="h-4 w-4 mr-1" /> Ativo</>
                  ) : (
                    <><Clock className="h-4 w-4 mr-1" /> Inativo</>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Estoque Baixo</p>
                  <p className="text-sm text-gray-600">Alerta quando produtos estão com estoque baixo</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={formData.notifyLowStock ? "bg-green-100 text-green-800" : ""}
                  onClick={() => handleInputChange('notifyLowStock', !formData.notifyLowStock)}
                >
                  {formData.notifyLowStock ? (
                    <><CheckCircle className="h-4 w-4 mr-1" /> Ativo</>
                  ) : (
                    <><Clock className="h-4 w-4 mr-1" /> Inativo</>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Relatórios Semanais</p>
                  <p className="text-sm text-gray-600">Receber relatório semanal de vendas por e-mail</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={formData.notifyWeeklyReports ? "bg-green-100 text-green-800" : ""}
                  onClick={() => handleInputChange('notifyWeeklyReports', !formData.notifyWeeklyReports)}
                >
                  {formData.notifyWeeklyReports ? (
                    <><CheckCircle className="h-4 w-4 mr-1" /> Ativo</>
                  ) : (
                    <><Clock className="h-4 w-4 mr-1" /> Inativo</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Integrações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Integrações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium">WhatsApp Business</p>
                        <p className="text-sm text-gray-600">
                          {formData.whatsappConnected ? 'Integração ativa' : 'Não configurado'}
                        </p>
                      </div>
                    </div>
                    <Badge className={formData.whatsappConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {formData.whatsappConnected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="API Key do WhatsApp"
                      type="password"
                      value={formData.whatsappApiKey}
                      onChange={(e) => handleInputChange('whatsappApiKey', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleTestApi('whatsapp')}
                      disabled={testingApi === 'whatsapp' || !formData.whatsappApiKey}
                    >
                      {testingApi === 'whatsapp' ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testando...</>
                      ) : (
                        'Testar Conexão'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Truck className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">Correios API</p>
                        <p className="text-sm text-gray-600">
                          {formData.correiosConnected ? 'Integração ativa' : 'Não configurado'}
                        </p>
                      </div>
                    </div>
                    <Badge className={formData.correiosConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {formData.correiosConnected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="API Key dos Correios"
                      type="password"
                      value={formData.correiosApiKey}
                      onChange={(e) => handleInputChange('correiosApiKey', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleTestApi('correios')}
                      disabled={testingApi === 'correios' || !formData.correiosApiKey}
                    >
                      {testingApi === 'correios' ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testando...</>
                      ) : (
                        'Testar Conexão'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-medium">Gateway Pagamento</p>
                        <p className="text-sm text-gray-600">
                          {formData.paymentConnected ? 'Integração ativa' : 'Não configurado'}
                        </p>
                      </div>
                    </div>
                    <Badge className={formData.paymentConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {formData.paymentConnected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="API Key do Gateway"
                      type="password"
                      value={formData.paymentGatewayKey}
                      onChange={(e) => handleInputChange('paymentGatewayKey', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleTestApi('payment')}
                      disabled={testingApi === 'payment' || !formData.paymentGatewayKey}
                    >
                      {testingApi === 'payment' ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testando...</>
                      ) : (
                        'Testar Conexão'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="font-medium">Google Analytics</p>
                        <p className="text-sm text-gray-600">
                          {formData.analyticsConnected ? 'Integração ativa' : 'Não configurado'}
                        </p>
                      </div>
                    </div>
                    <Badge className={formData.analyticsConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {formData.analyticsConnected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  <Input
                    placeholder="Google Analytics ID"
                    value={formData.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={handleReset}
              disabled={isResetting || isSaving}
            >
              {isResetting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetando...</>
              ) : (
                <><RotateCcw className="h-4 w-4 mr-2" /> Resetar para Padrão</>
              )}
            </Button>
            <Button
              className="bg-moria-orange hover:bg-moria-orange/90"
              onClick={handleSave}
              disabled={isSaving || isResetting}
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Salvar Configurações</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
