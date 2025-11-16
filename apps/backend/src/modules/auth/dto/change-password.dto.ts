import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(6, 'New password must be at least 6 characters'),
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
