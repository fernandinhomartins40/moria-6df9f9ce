import { z } from 'zod';

export const updateFooterSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa').optional(),
  services: z.array(z.string()).max(10, 'Máximo de 10 serviços').optional(),
  socialLinks: z.record(z.string()).optional(),
  certifications: z.array(z.string()).max(10, 'Máximo de 10 certificações').optional(),
  footerLinks: z.record(z.string()).optional(),
});

export type UpdateFooterDto = z.infer<typeof updateFooterSchema>;
