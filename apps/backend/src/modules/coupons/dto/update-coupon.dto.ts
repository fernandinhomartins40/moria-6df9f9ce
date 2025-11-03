import { z } from 'zod';
import { createCouponSchema } from './create-coupon.dto.js';

export const updateCouponSchema = createCouponSchema.partial().omit({ code: true });

export type UpdateCouponDto = z.infer<typeof updateCouponSchema>;
