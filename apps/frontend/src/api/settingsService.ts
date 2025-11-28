import apiClient from './apiClient';

export interface StoreSettings {
  id: string;
  // Informações da Loja
  storeName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Configurações de Vendas
  defaultMargin: number;
  freeShippingMin: number;
  deliveryFee: number;
  deliveryDays: number;

  // Horários de Funcionamento
  businessHours: Record<string, string>;

  // Notificações
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
  notifyWeeklyReports: boolean;

  // Integrações
  whatsappApiKey?: string | null;
  whatsappConnected: boolean;
  correiosApiKey?: string | null;
  correiosConnected: boolean;
  paymentGatewayKey?: string | null;
  paymentConnected: boolean;
  googleAnalyticsId?: string | null;
  analyticsConnected: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  storeName?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  defaultMargin?: number;
  freeShippingMin?: number;
  deliveryFee?: number;
  deliveryDays?: number;
  businessHours?: Record<string, string>;
  notifyNewOrders?: boolean;
  notifyLowStock?: boolean;
  notifyWeeklyReports?: boolean;
  whatsappApiKey?: string | null;
  whatsappConnected?: boolean;
  correiosApiKey?: string | null;
  correiosConnected?: boolean;
  paymentGatewayKey?: string | null;
  paymentConnected?: boolean;
  googleAnalyticsId?: string | null;
  analyticsConnected?: boolean;
}

class SettingsService {
  /**
   * Busca as configurações da loja
   */
  async getSettings(): Promise<StoreSettings> {
    const response = await apiClient.get<{ success: boolean; data: StoreSettings }>('/settings');
    return response.data.data;
  }

  /**
   * Atualiza as configurações da loja
   */
  async updateSettings(data: UpdateSettingsData): Promise<StoreSettings> {
    const response = await apiClient.put<{ success: boolean; data: StoreSettings }>('/settings', data);
    return response.data.data;
  }

  /**
   * Reseta as configurações para os valores padrão
   */
  async resetSettings(): Promise<StoreSettings> {
    const response = await apiClient.post<{ success: boolean; data: StoreSettings }>('/settings/reset');
    return response.data.data;
  }
}

export default new SettingsService();
