import { z } from 'zod';

export function extractErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.issues.forEach((e) => {
    const field = e.path[0] as string;
    if (!fieldErrors[field]) fieldErrors[field] = e.message;
  });
  return fieldErrors;
}

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

export const patientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  document: z.string().min(1, 'El documento es requerido'),
  telephone: z.string().min(1, 'El teléfono es requerido'),
  birth: z.string().optional(),
  city: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export const dentistSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  document: z.string().min(1, 'La cédula es requerida'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birth: z.string().optional(),
  password: z.string().optional(),
});

export const branchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  contact: z.string().min(1, 'El contacto es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
});

export const procedureSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  duration: z.string().min(1, 'La duración es requerida'),
});

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

export const promotionSchema = z.object({
  date_start: z.string().min(1, 'La fecha de inicio es requerida'),
  date_end: z.string().min(1, 'La fecha de fin es requerida'),
  details: z.string().min(1, 'Los detalles son requeridos'),
  discount: z.string().min(1, 'El descuento es requerido'),
  limit_patients: z.string().min(1, 'El límite es requerido'),
});

export const roleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

export const permissionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

export const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  dentist_procedure_id: z.string().min(1, 'Selecciona un odontólogo'),
  branch_id: z.string().min(1, 'Selecciona una sede'),
  day: z.string().min(1, 'Selecciona una fecha'),
  hour: z.string().min(1, 'Selecciona un horario'),
});

export const patientAppointmentSchema = z.object({
  dentist_procedure_id: z.string().min(1, 'Selecciona un odontólogo'),
  branch_id: z.string().min(1, 'Selecciona una sede'),
  day: z.string().min(1, 'Selecciona una fecha'),
  hour: z.string().min(1, 'Selecciona un horario'),
  agreed: z.literal(true, { message: 'Debes aceptar la ley 1581 de 2012' }),
});

export const paymentSchema = z.object({
  price: z.string().min(1, 'El precio es requerido'),
});
