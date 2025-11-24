import { z } from 'zod';

/**
 * Validação de placa brasileira (antigo e Mercosul)
 */
export const plateSchema = z.string()
  .transform(val => val.replace(/[^A-Z0-9]/gi, '').toUpperCase())
  .refine(val => {
    // Padrão antigo: AAA9999
    const oldPattern = /^[A-Z]{3}[0-9]{4}$/;
    // Padrão Mercosul: AAA9A99
    const mercosulPattern = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

    return oldPattern.test(val) || mercosulPattern.test(val);
  }, {
    message: 'Formato de placa inválido. Use ABC1234 ou ABC1D23'
  });

export const lookupVehicleSchema = z.object({
  plate: plateSchema,
});

export type LookupVehicleDto = z.infer<typeof lookupVehicleSchema>;
