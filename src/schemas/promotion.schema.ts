import { z } from 'zod';

export const promotionSchema = z.object({
  date_start: z.string().min(1, 'La fecha de inicio es requerida'),
  date_end: z.string().min(1, 'La fecha de fin es requerida'),
  details: z.string().min(1, 'Los detalles son requeridos'),
  discount: z.string().min(1, 'El descuento es requerido'),
  limit_patients: z.string().min(1, 'El límite es requerido'),
});
