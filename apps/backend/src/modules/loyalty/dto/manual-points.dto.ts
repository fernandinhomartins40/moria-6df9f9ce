import { z } from 'zod';
import { PointTransactionType } from '@prisma/client';

export const ManualPointsDtoSchema = z.object({
  customerId: z.string().uuid('ID do cliente inválido'),
  points: z.number().int('Pontos deve ser um número inteiro'),
  description: z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
  type: z.enum([
    PointTransactionType.EARN_MANUAL,
    PointTransactionType.ADJUST_MANUAL,
  ]).default(PointTransactionType.EARN_MANUAL),
});

export type ManualPointsDto = z.infer<typeof ManualPointsDtoSchema>;
