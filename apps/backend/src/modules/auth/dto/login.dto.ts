import { z } from 'zod';

export const loginSchema = z.object({
  emailOrPhone: z
    .string({ required_error: 'Email or phone is required' })
    .min(1, 'Email or phone is required')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginSchema>;
