import api from '@/plugins/api';

export const procedureService = {
  list: (page: number) =>
    api.get(`/admin/procedures?page=${page}`),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/procedures', data, { signal }),

  toggleState: (id: number, state: string) =>
    api.post('/admin/procedures/state', { id, state }),

  getSelect: () => api.get('/staff/procedures/select'),
};
