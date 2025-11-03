import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must not exceed 200 characters')
    .trim(),
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .trim(),
  category: z
    .string({ required_error: 'Category is required' })
    .min(2, 'Category must be at least 2 characters')
    .trim(),
  estimatedTime: z
    .string({ required_error: 'Estimated time is required' })
    .min(2, 'Estimated time must be at least 2 characters')
    .trim(),
  basePrice: z
    .number()
    .positive('Base price must be positive')
    .multipleOf(0.01, 'Base price must have at most 2 decimal places')
    .optional(),
  specifications: z.record(z.any()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens')
    .optional(),
  metaDescription: z.string().max(160, 'Meta description must not exceed 160 characters').optional(),
});

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
