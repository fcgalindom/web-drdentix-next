import { z } from 'zod';

export const procedureSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  duration: z.string().min(1, 'La duración es requerida'),
});
