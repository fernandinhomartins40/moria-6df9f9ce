import { PrismaClient } from '@prisma/client';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

const prisma = new PrismaClient();

export class SettingsService {
  /**
   * Busca as configurações da loja
   * Se não existir, cria com valores padrão
   */
  async getSettings() {
    let settings = await prisma.storeSettings.findFirst();

    // Se não existe, criar com valores padrão
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {},
      });
    }

    return settings;
  }

  /**
   * Atualiza as configurações da loja
   */
  async updateSettings(data: UpdateSettingsDto) {
    const settings = await this.getSettings();

    const updated = await prisma.storeSettings.update({
      where: { id: settings.id },
      data,
    });

    return updated;
  }

  /**
   * Reseta as configurações para os valores padrão
   */
  async resetSettings() {
    const settings = await this.getSettings();

    const reset = await prisma.storeSettings.update({
      where: { id: settings.id },
      data: {
        storeName: 'Moria Peças & Serviços',
        cnpj: '12.345.678/0001-90',
        phone: '(11) 99999-9999',
        email: 'contato@moriapecas.com.br',
        address: 'Rua das Oficinas, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        defaultMargin: 35,
        freeShippingMin: 150,
        deliveryFee: 15.90,
        deliveryDays: 3,
        businessHours: {
          weekdays: 'Segunda a Sexta: 8h às 18h',
          saturday: 'Sábado: 8h às 12h',
          sunday: 'Domingo: Fechado',
        },
        notifyNewOrders: true,
        notifyLowStock: true,
        notifyWeeklyReports: false,
        whatsappConnected: false,
        correiosConnected: false,
        paymentConnected: false,
        analyticsConnected: false,
      },
    });

    return reset;
  }
}
