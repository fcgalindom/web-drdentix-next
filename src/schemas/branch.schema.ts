import { z } from 'zod';

export const branchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  contact: z.string().min(1, 'El contacto es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
});
