import api from '@/plugins/api';

export const appointmentService = {
  listAdmin: (params: Record<string, string | number>) =>
    api.get('/admin/appointments', { params }),

  createAdmin: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/appointments', data, { signal }),

  changeStateAdmin: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/appointments/state', data, { signal }),

  deleteAdmin: (id: number) =>
    api.post('/admin/appointments/delete', { id }),

  whatsappAdmin: (id: number) =>
    api.post('/admin/appointments/whatsapp', { id }),

  phoneAdmin: (id: number) =>
    api.post('/admin/appointments/phone', { id }),

  getFormDataAdmin: () =>
    api.post('/staff/appointments/form-data'),

  getByProcedure: (procedureId: string) =>
    api.post('/staff/appointments/by-procedure', { procedure_id: procedureId }),

  getSlots: (dentistProcedureId: string, date: string) =>
    api.post('/staff/appointments/slots', { dentist_procedure_id: dentistProcedureId, date }),

  listDentist: (params: Record<string, string>) =>
    api.get('/dentist/appointments', { params }),

  changeStateDentist: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/dentist/appointments/state', data, { signal }),

  getFormDataPatient: () =>
    api.post('/patient/appointments/form-data'),

  getByProcedurePatient: (procedureId: string) =>
    api.post('/patient/appointments/by-procedure', { procedure_id: procedureId }),

  getSlotsPatient: (dentistProcedureId: string, date: string) =>
    api.post('/patient/appointments/slots', { dentist_procedure_id: dentistProcedureId, date }),

  createPatient: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/patient/appointments', data, { signal }),
};
