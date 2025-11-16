import { z } from 'zod';
import { RewardType, RewardStatus, CustomerLevel } from '@prisma/client';

export const CreateRewardDtoSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  type: z.nativeEnum(RewardType),
  pointsCost: z.number().int().positive('Custo em pontos deve ser positivo'),
  status: z.nativeEnum(RewardStatus).default(RewardStatus.ACTIVE),

  // Configurações por tipo
  discountValue: z.number().optional(),
  productId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  minPurchase: z.number().optional(),
  maxDiscount: z.number().optional(),

  // Limitações
  usageLimit: z.number().int().positive().optional(),
  limitPerCustomer: z.number().int().positive().optional(),

  // Validade
  expiresAt: z.string().datetime().optional(),

  // Restrições de nível
  minLevel: z.nativeEnum(CustomerLevel).optional(),

  // Visual
  image: z.string().url().optional(),
  icon: z.string().optional(),
  badgeColor: z.string().optional(),

  // Ordenação e destaque
  featured: z.boolean().default(false),
  order: z.number().int().default(0),

  // Metadados
  termsAndConditions: z.string().optional(),
});

export type CreateRewardDto = z.infer<typeof CreateRewardDtoSchema>;
