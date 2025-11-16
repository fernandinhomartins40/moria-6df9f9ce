import { z } from 'zod';

export const UpdateLoyaltySettingsDtoSchema = z.object({
  // Configuração de Pontos
  pointsPerReal: z.number().positive().optional(),
  minPurchaseForPoints: z.number().min(0).optional(),
  pointsExpirationDays: z.number().int().positive().nullable().optional(),

  // Bônus por Revisão
  revisionBonusPoints: z.number().int().min(0).optional(),

  // Bônus por Aniversário
  birthdayBonusPoints: z.number().int().min(0).optional(),
  birthdayBonusEnabled: z.boolean().optional(),

  // Bônus por Indicação
  referralBonusPoints: z.number().int().min(0).optional(),
  referralBonusEnabled: z.boolean().optional(),

  // Multiplicadores por Nível
  bronzeMultiplier: z.number().min(0).optional(),
  silverMultiplier: z.number().min(0).optional(),
  goldMultiplier: z.number().min(0).optional(),
  platinumMultiplier: z.number().min(0).optional(),

  // Status do Programa
  isActive: z.boolean().optional(),
});

export type UpdateLoyaltySettingsDto = z.infer<typeof UpdateLoyaltySettingsDtoSchema>;
