// ========================================
// COMPONENTE DE CONFIGURAÇÕES - MORIA ADMIN
// Componente otimizado para configurações do sistema
// ========================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  MessageCircle,
  Truck,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
  FileText,
  AlertCircle
} from "lucide-react";

interface SettingsProps {
  settings: any;
  isLoadingSettings: boolean;
  isSaving: boolean;
  updateSetting: (key: string, value: string) => void;
  handleSaveSettings: () => Promise<void>;
}

export function Settings({
  settings,
  isLoadingSettings,
  isSaving,
  updateSetting,
  handleSaveSettings
}: SettingsProps) {
  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moria-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                <label className="text-sm font-medium">Nome da Loja</label>
                <Input 
                  value={settings.store_name || ''} 
                  onChange={(e) => updateSetting('store_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CNPJ</label>
                <Input 
                  value={settings.store_cnpj || ''} 
                  onChange={(e) => updateSetting('store_cnpj', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input 
                  value={settings.store_phone || ''} 
                  onChange={(e) => updateSetting('store_phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail</label>
                <Input 
                  value={settings.store_email || ''} 
                  onChange={(e) => updateSetting('store_email', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input 
                  value={settings.store_address || ''} 
                  onChange={(e) => updateSetting('store_address', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Configurações de Vendas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Configurações de Vendas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Margem de Lucro Padrão (%)</label>
                <Input 
                  type="number" 
                  value={settings.default_profit_margin || ''} 
                  onChange={(e) => updateSetting('default_profit_margin', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Mínimo para Frete Grátis</label>
                <Input 
                  type="number" 
                  value={settings.free_shipping_minimum || ''} 
                  onChange={(e) => updateSetting('free_shipping_minimum', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Taxa de Entrega (R$)</label>
                <Input 
                  type="number" 
                  value={settings.delivery_fee || ''} 
                  onChange={(e) => updateSetting('delivery_fee', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tempo de Entrega (dias)</label>
                <Input 
                  type="number" 
                  value={settings.delivery_time || ''} 
                  onChange={(e) => updateSetting('delivery_time', e.target.value)}
                />
              </div>
            </div>
          </div>

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
                  className={settings.notifications_new_orders === 'true' ? "bg-green-100 text-green-800" : ""}
                  onClick={() => updateSetting('notifications_new_orders', settings.notifications_new_orders === 'true' ? 'false' : 'true')}
                >
                  {settings.notifications_new_orders === 'true' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      Inativo
                    </>
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
                  className={settings.notifications_low_stock === 'true' ? "bg-green-100 text-green-800" : ""}
                  onClick={() => updateSetting('notifications_low_stock', settings.notifications_low_stock === 'true' ? 'false' : 'true')}
                >
                  {settings.notifications_low_stock === 'true' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      Inativo
                    </>
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
                  className={settings.notifications_weekly_reports === 'true' ? "bg-green-100 text-green-800" : ""}
                  onClick={() => updateSetting('notifications_weekly_reports', settings.notifications_weekly_reports === 'true' ? 'false' : 'true')}
                >
                  {settings.notifications_weekly_reports === 'true' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      Inativo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving}
              className="bg-moria-orange hover:bg-moria-orange/80"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>

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
                        <p className="text-sm text-gray-600">Integração ativa</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Configurar</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Truck className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">Correios API</p>
                        <p className="text-sm text-gray-600">Cálculo de frete</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Disponível</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Conectar</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-medium">Gateway Pagamento</p>
                        <p className="text-sm text-gray-600">PIX, Cartão, Boleto</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Disponível</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Conectar</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="font-medium">Google Analytics</p>
                        <p className="text-sm text-gray-600">Análise de tráfego</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Disponível</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Conectar</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Backup e Dados */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Backup e Dados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Backup Automático</h4>
                    <p className="text-sm text-gray-600">Último backup: Hoje às 03:00</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Fazer Backup
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Exportar Dados</h4>
                    <p className="text-sm text-gray-600">Exporte dados para análise externa</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex justify-between">
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              Limpar Dados de Teste
            </Button>
            <Button className="bg-moria-orange hover:bg-moria-orange/90">
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}