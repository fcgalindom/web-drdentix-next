import { z } from 'zod';

export const productSchema = z.object({
  active_principle: z.string().min(1, 'Requerido'),
  concentration: z.string().min(1, 'Requerido'),
  amount: z.string().min(1, 'Requerido'),
  pharmaceutical_form: z.string().min(1, 'Requerido'),
  commercial_presentation: z.string().min(1, 'Requerido'),
  medication_unit: z.string().min(1, 'Requerido'),
  batch: z.string().min(1, 'Requerido'),
  health_register_invima: z.string().min(1, 'Requerido'),
  expiration_date: z.string().min(1, 'Requerido'),
  date_of_admission: z.string().min(1, 'Requerido'),
});
