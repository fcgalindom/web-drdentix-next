import api from '@/plugins/api';

export const patientService = {
  list: (params: Record<string, string | number>) =>
    api.get('/admin/patients', { params }),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/patients', data, { signal }),

  findByDocument: (document: string) =>
    api.post('/admin/patients/find-by-document', { document }),

  deactivate: (id: number, state: string) =>
    api.post('/admin/patients/deactivate', { id, state }),

  getCities: () => api.get('/admin/patients/cities'),

  getNames: () => api.get('/admin/patients/names'),
};
