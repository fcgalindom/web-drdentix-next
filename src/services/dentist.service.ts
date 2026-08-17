import api from '@/plugins/api';

export const dentistService = {
  list: (params: Record<string, string | number>) =>
    api.get('/admin/dentists', { params }),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/dentists', data, { signal }),

  toggleState: (id: number, state: string) =>
    api.post('/admin/dentists/state', { id, state }),

  getSchedule: (dentistId: number) =>
    api.get(`/admin/dentists/${dentistId}/schedule`),

  saveSchedule: (dentistId: number, schedules: unknown[], signal?: AbortSignal) =>
    api.post('/admin/dentists/schedule', { dentist_id: dentistId, schedules }, { signal }),

  getSelect: () => api.get('/staff/dentists/select'),

  getNames: () => api.get('/admin/dentists/names'),

  getCities: () => api.get('/admin/dentists/cities'),

  getMySchedule: () => api.get('/dentist/schedule'),

  saveMySchedule: (dentistId: number, schedules: unknown[], signal?: AbortSignal) =>
    api.post('/dentist/schedule', { dentist_id: dentistId, schedules }, { signal }),
};
