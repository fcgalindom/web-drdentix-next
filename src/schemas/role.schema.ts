import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

export const permissionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});
