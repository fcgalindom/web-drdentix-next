import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  document: z.string().min(1, 'El documento es requerido'),
  telephone: z.string().min(1, 'El teléfono es requerido'),
  birth: z.string().optional(),
  city: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});
