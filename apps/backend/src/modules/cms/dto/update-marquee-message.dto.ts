import { z } from 'zod';

export const updateMarqueeMessageSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória').max(200, 'Mensagem muito longa').optional(),
  order: z.number().int().min(0, 'Ordem deve ser positiva').optional(),
  active: z.boolean().optional(),
});

export type UpdateMarqueeMessageDto = z.infer<typeof updateMarqueeMessageSchema>;
