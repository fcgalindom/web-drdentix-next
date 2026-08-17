import { z } from 'zod';

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
