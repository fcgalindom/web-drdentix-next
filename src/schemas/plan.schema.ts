import { z } from 'zod';

export const planSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  price: z.string().min(1, 'El precio es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
});