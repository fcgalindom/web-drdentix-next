import { z } from 'zod';

export const loginStaffSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const loginPatientSchema = z.object({
  document: z.string().min(1, 'La cédula es requerida'),
});

export const verifyDocSchema = z.object({
  document: z.string().min(1, 'La cédula es requerida'),
});

export const registerPatientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  document: z.string().min(1, 'El documento es requerido'),
  telephone: z.string().min(1, 'El teléfono es requerido'),
  birth: z.string().optional(),
  city: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});
