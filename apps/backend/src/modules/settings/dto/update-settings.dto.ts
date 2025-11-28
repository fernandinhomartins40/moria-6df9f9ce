import { z } from 'zod';

export const updateSettingsSchema = z.object({
  // Informações da Loja
  storeName: z.string().min(1, 'Nome da loja é obrigatório').optional(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional(),
  phone: z.string().min(10, 'Telefone inválido').optional(),
  email: z.string().email('E-mail inválido').optional(),
  address: z.string().min(1, 'Endereço é obrigatório').optional(),
  city: z.string().min(1, 'Cidade é obrigatória').optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  zipCode: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos').optional(),

  // Configurações de Vendas
  defaultMargin: z.number().min(0).max(100, 'Margem deve ser entre 0 e 100').optional(),
  freeShippingMin: z.number().min(0, 'Valor mínimo deve ser positivo').optional(),
  deliveryFee: z.number().min(0, 'Taxa de entrega deve ser positiva').optional(),
  deliveryDays: z.number().int().min(0, 'Dias de entrega deve ser positivo').optional(),

  // Horários de Funcionamento
  businessHours: z.record(z.string()).optional(),

  // Notificações
  notifyNewOrders: z.boolean().optional(),
  notifyLowStock: z.boolean().optional(),
  notifyWeeklyReports: z.boolean().optional(),

  // Integrações
  whatsappApiKey: z.string().nullable().optional(),
  whatsappConnected: z.boolean().optional(),
  correiosApiKey: z.string().nullable().optional(),
  correiosConnected: z.boolean().optional(),
  paymentGatewayKey: z.string().nullable().optional(),
  paymentConnected: z.boolean().optional(),
  googleAnalyticsId: z.string().nullable().optional(),
  analyticsConnected: z.boolean().optional(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
