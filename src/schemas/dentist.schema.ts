import { z } from 'zod';

export const dentistSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  document: z.string().min(1, 'La cédula es requerida'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birth: z.string().optional(),
  password: z.string().optional(),
});
