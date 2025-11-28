import { z } from 'zod';

const featureSchema = z.object({
  icon: z.string(),
  text: z.string(),
});

export const updateHeroSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo').optional(),
  subtitle: z.string().min(1, 'Subtítulo é obrigatório').max(500, 'Subtítulo muito longo').optional(),
  imageUrl: z.string().url('URL da imagem inválida').or(z.string().startsWith('/', 'URL deve começar com /')).optional(),
  features: z.array(featureSchema).max(6, 'Máximo de 6 features').optional(),

  cta1Text: z.string().max(50, 'Texto do CTA muito longo').optional(),
  cta1Link: z.string().optional(),
  cta1Enabled: z.boolean().optional(),

  cta2Text: z.string().max(50, 'Texto do CTA muito longo').optional(),
  cta2Link: z.string().optional(),
  cta2Enabled: z.boolean().optional(),

  cta3Text: z.string().max(50, 'Texto do CTA muito longo').optional(),
  cta3Link: z.string().optional(),
  cta3Enabled: z.boolean().optional(),

  active: z.boolean().optional(),
});

export type UpdateHeroDto = z.infer<typeof updateHeroSchema>;
