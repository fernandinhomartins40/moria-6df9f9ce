import { z } from 'zod';

export const createMarqueeMessageSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória').max(200, 'Mensagem muito longa'),
  order: z.number().int().min(0, 'Ordem deve ser positiva').optional(),
  active: z.boolean().default(true),
});

export type CreateMarqueeMessageDto = z.infer<typeof createMarqueeMessageSchema>;
