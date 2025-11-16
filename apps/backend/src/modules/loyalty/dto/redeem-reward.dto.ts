import { z } from 'zod';

export const RedeemRewardDtoSchema = z.object({
  rewardId: z.string().uuid('ID da recompensa inválido'),
});

export type RedeemRewardDto = z.infer<typeof RedeemRewardDtoSchema>;
