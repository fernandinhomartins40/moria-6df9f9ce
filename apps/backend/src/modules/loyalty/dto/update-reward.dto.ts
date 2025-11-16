import { z } from 'zod';
import { CreateRewardDtoSchema } from './create-reward.dto.js';

export const UpdateRewardDtoSchema = CreateRewardDtoSchema.partial();

export type UpdateRewardDto = z.infer<typeof UpdateRewardDtoSchema>;
