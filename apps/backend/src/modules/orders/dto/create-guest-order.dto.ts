import { z } from 'zod';

// DTO para criar pedido como visitante (sem autenticação)
export const createGuestOrderSchema = z.object({
  // Dados do cliente provisório
  customerName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  customerWhatsApp: z.string().min(10, 'WhatsApp inválido'),

  // Itens do pedido
  items: z.array(
    z.object({
      productId: z.string().uuid().optional(),
      serviceId: z.string().uuid().optional(),
      type: z.enum(['PRODUCT', 'SERVICE']),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Pedido deve conter pelo menos um item'),

  // Cupom opcional
  couponCode: z.string().optional(),
});

export type CreateGuestOrderDto = z.infer<typeof createGuestOrderSchema>;
